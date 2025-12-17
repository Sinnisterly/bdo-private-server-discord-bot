const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    PermissionFlagsBits,
    MessageFlags
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../raidConfig.json');
const activeRaidsPath = path.join(__dirname, '../activeRaids.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('raid')
        .setDescription('Manage Raid Groups')
        .addSubcommand(subcommand =>
            subcommand.setName('role-setup').setDescription('Set ping role (Admin)').addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('setup').setDescription('Host a raid').addStringOption(o => o.setName('name').setDescription('Raid Name').setRequired(true)).addStringOption(o => o.setName('time').setDescription('Start time (e.g. 1h, 30m)').setRequired(true)).addIntegerOption(o => o.setName('slots').setDescription('Max Players').setMinValue(2).setMaxValue(20)).addStringOption(o => o.setName('description').setDescription('Extra info'))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'role-setup') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: '❌ Admin only.', flags: MessageFlags.Ephemeral });
            const role = interaction.options.getRole('role');
            fs.writeFileSync(configPath, JSON.stringify({ raidRole: role.id }, null, 2));
            return interaction.reply({ content: `✅ Raid role set to **${role.name}**`, flags: MessageFlags.Ephemeral });
        }

        if (subcommand === 'setup') {
            const raidName = interaction.options.getString('name');
            const timeInput = interaction.options.getString('time');
            const maxSlots = interaction.options.getInteger('slots') || 5;
            const desc = interaction.options.getString('description') || 'No special requirements.';
            const host = interaction.user;

            const durationMs = parseDuration(timeInput);
            if (!durationMs) return interaction.reply({ content: '❌ Invalid time format (use 1h, 30m).', flags: MessageFlags.Ephemeral });

            const startTime = Date.now() + durationMs;
            const unixTime = Math.floor(startTime / 1000);
            
            let pingRoleID = "";
            if (fs.existsSync(configPath)) {
                const conf = JSON.parse(fs.readFileSync(configPath));
                if (conf.raidRole) pingRoleID = conf.raidRole;
            }
            const pingStr = pingRoleID ? `<@&${pingRoleID}>` : "";

            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle(`⚔️ New Raid: ${raidName}`)
                .setDescription(`**Host:** ${host}\n**Start Time:** <t:${unixTime}:t> (<t:${unixTime}:R>)\n**Info:** ${desc}`)
                .addFields({ name: `👥 Participants (1/${maxSlots})`, value: `1. ${host} (Host)`, inline: false })
                .setFooter({ text: 'Click buttons to join/leave' })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('join_raid').setLabel('Join').setStyle(ButtonStyle.Success).setEmoji('⚔️'),
                new ButtonBuilder().setCustomId('leave_raid').setLabel('Leave').setStyle(ButtonStyle.Danger)
            );

            const msg = await interaction.reply({ content: `📢 **${raidName}** is forming! ${pingStr}`, embeds: [embed], components: [row], fetchReply: true });

            const raidData = {
                messageId: msg.id,
                channelId: interaction.channelId,
                name: raidName,
                startTime: startTime,
                pingRole: pingRoleID,
                participants: [host.id],
                maxSlots: maxSlots,
                hostId: host.id
            };

            let activeRaids = {};
            if (fs.existsSync(activeRaidsPath)) {
                try { activeRaids = JSON.parse(fs.readFileSync(activeRaidsPath)); } catch(e) {}
            }
            activeRaids[msg.id] = raidData;
            fs.writeFileSync(activeRaidsPath, JSON.stringify(activeRaids, null, 2));

            scheduleRaidNotification(interaction.client, raidData);
        }
    },
};

function parseDuration(input) {
    const match = input.match(/^([\d.]+)\s*([hm])$/i);
    if (!match) return null;
    return match[2].toLowerCase() === 'h' ? parseFloat(match[1]) * 3600000 : parseFloat(match[1]) * 60000;
}

function scheduleRaidNotification(client, raid) {
    const timeUntil5Min = raid.startTime - Date.now() - (5 * 60 * 1000);
    if (timeUntil5Min > 0) {
        setTimeout(async () => {
            try {
                const currentRaids = JSON.parse(fs.readFileSync(path.join(__dirname, '../activeRaids.json')));
                if (!currentRaids[raid.messageId]) return;

                const channel = await client.channels.fetch(raid.channelId);
                const ping = raid.pingRole ? `<@&${raid.pingRole}>` : "";
                await channel.send(`⏰ **Raid Reminder:** ${raid.name} starts in 5 minutes! ${ping} Get ready!`);
            } catch (e) { console.log("Timer error:", e); }
        }, timeUntil5Min);
    }
}

module.exports.scheduleRaidNotification = scheduleRaidNotification;