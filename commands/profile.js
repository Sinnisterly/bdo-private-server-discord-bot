const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const profilesPath = path.join(__dirname, '../profiles.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Manage your BDO Profile Card')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Set up your profile stats')
                .addStringOption(option => 
                    option.setName('family')
                        .setDescription('Your Family Name')
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName('class')
                        .setDescription('Your Main Class (e.g. Mystic, Warrior)')
                        .setRequired(true))
                .addIntegerOption(option => 
                    option.setName('ap')
                        .setDescription('Main Hand AP')
                        .setRequired(true))
                .addIntegerOption(option => 
                    option.setName('aap')
                        .setDescription('Awakening AP')
                        .setRequired(true))
                .addIntegerOption(option => 
                    option.setName('dp')
                        .setDescription('Defense (DP)')
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName('image')
                        .setDescription('URL to a screenshot of your character (Optional)')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View a player\'s profile card')
                .addUserOption(option => 
                    option.setName('user')
                        .setDescription(' The user to view (leave empty for yourself)'))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        let profiles = {};
        if (fs.existsSync(profilesPath)) {
            try { profiles = JSON.parse(fs.readFileSync(profilesPath)); } catch (e) {}
        }

        if (subcommand === 'setup') {
            const familyName = interaction.options.getString('family');
            const className = interaction.options.getString('class');
            const ap = interaction.options.getInteger('ap');
            const aap = interaction.options.getInteger('aap');
            const dp = interaction.options.getInteger('dp');
            const image = interaction.options.getString('image');


            const gs = Math.floor(((ap + aap) / 2) + dp);

            profiles[interaction.user.id] = {
                family: familyName,
                class: className,
                ap: ap,
                aap: aap,
                dp: dp,
                gs: gs,
                image: image || null
            };

            fs.writeFileSync(profilesPath, JSON.stringify(profiles, null, 2));

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✅ Profile Updated!')
                .setDescription(`**Family:** ${familyName}\n**Class:** ${className}\n**GS:** ${gs}`)
                .setFooter({ text: 'Use /profile view to see your full card.' });

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (subcommand === 'view') {
            const targetUser = interaction.options.getUser('user') || interaction.user;
            const data = profiles[targetUser.id];

            if (!data) {
                return interaction.reply({ 
                    content: `❌ **${targetUser.username}** hasn't set up their profile yet.`, 
                    ephemeral: true 
                });
            }

            const cardEmbed = new EmbedBuilder()
                .setColor(0x9B59B6)
                .setTitle(`🛡️ ${data.family || targetUser.username}'s Profile`)
                .setDescription(`**Class:** ${data.class}`)
                .addFields(
                    { name: '⚔️ AP', value: `${data.ap} / ${data.aap}`, inline: true },
                    { name: '🛡️ DP', value: `${data.dp}`, inline: true },
                    { name: '✨ Gear Score', value: `**${data.gs}**`, inline: true }
                )
                .setThumbnail(targetUser.displayAvatarURL())
                .setFooter({ text: 'Exodus BDO Private Server' });

            if (data.image) {
                if (data.image.startsWith('http')) {
                    cardEmbed.setImage(data.image);
                }
            }

            await interaction.reply({ embeds: [cardEmbed] });
        }
    },
};