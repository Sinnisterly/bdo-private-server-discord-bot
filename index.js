require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder, MessageFlags } = require('discord.js');


const activeRaidsPath = path.join(__dirname, 'activeRaids.json');


const welcomeEvent = require('./events/welcome');
const levelingEvent = require('./events/leveling'); 


const client = new Client({ 
    intents: [ 
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers   
    ] 
});

client.commands = new Collection();


const commandsPath = path.join(__dirname, 'commands');
if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
}


client.once(Events.ClientReady, async c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    client.user.setActivity('ShaiLeBuff Helper');


    if (fs.existsSync(activeRaidsPath)) {
        try {
            const raids = JSON.parse(fs.readFileSync(activeRaidsPath));
            const raidCommand = require('./commands/raid.js');
            let count = 0;
            const now = Date.now();

            for (const [msgId, raid] of Object.entries(raids)) {
                if (now > raid.startTime + (30 * 60 * 1000)) {
                    delete raids[msgId];
                } else {
                    raidCommand.scheduleRaidNotification(client, raid);
                    count++;
                }
            }
            fs.writeFileSync(activeRaidsPath, JSON.stringify(raids, null, 2));
            console.log(`Restored timers for ${count} active raids.`);
        } catch (e) {
            console.log("Error reading activeRaids.json (likely empty), skipping restore.");
        }
    }
});

client.on(Events.GuildMemberAdd, async (member) => {
    await welcomeEvent.execute(member);
});


client.on(Events.MessageCreate, async (message) => {
    await levelingEvent.execute(message);
});


client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;
        try { await command.execute(interaction); } 
        catch (error) { console.error(error); }
    }

    if (interaction.isButton()) {
        const { customId, message, user } = interaction;
        if (customId === 'join_raid' || customId === 'leave_raid') {
            if (!fs.existsSync(activeRaidsPath)) return;
            const raids = JSON.parse(fs.readFileSync(activeRaidsPath));
            const raid = raids[message.id];

            if (!raid) return interaction.reply({ content: '❌ Raid expired.', flags: MessageFlags.Ephemeral });

            let updated = false;
            if (customId === 'join_raid') {
                if (raid.participants.includes(user.id)) return interaction.reply({ content: 'Already joined.', flags: MessageFlags.Ephemeral });
                if (raid.participants.length >= raid.maxSlots) return interaction.reply({ content: 'Full!', flags: MessageFlags.Ephemeral });
                raid.participants.push(user.id);
                updated = true;
            } 
            else if (customId === 'leave_raid') {
                if (!raid.participants.includes(user.id)) return interaction.reply({ content: 'Not in raid.', flags: MessageFlags.Ephemeral });
                if (user.id === raid.hostId) return interaction.reply({ content: 'Host cannot leave.', flags: MessageFlags.Ephemeral });
                raid.participants = raid.participants.filter(id => id !== user.id);
                updated = true;
            }

            if (updated) {
                fs.writeFileSync(activeRaidsPath, JSON.stringify(raids, null, 2));
                const oldEmbed = message.embeds[0];
                const listString = raid.participants.map((id, index) => `${index + 1}. <@${id}>${index === 0 ? ' (Host)' : ''}`).join('\n');
                const newEmbed = EmbedBuilder.from(oldEmbed).setFields({ name: `👥 Participants (${raid.participants.length}/${raid.maxSlots})`, value: listString || 'None', inline: false });
                await interaction.update({ embeds: [newEmbed] });
            }
        }
    }
});

client.login(process.env.TOKEN);