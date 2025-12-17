const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    MessageFlags 
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../welcomeConfig.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Configure the Welcome System')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Set welcome channels and message')
                .addChannelOption(option => 
                    option.setName('channel')
                        .setDescription('Where should the welcome card be sent?')
                        .setRequired(true))
                .addChannelOption(option => 
                    option.setName('rules_channel')
                        .setDescription('Which channel contains your rules?')
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName('message')
                        .setDescription('Text to display on the card (e.g. "Welcome to Exodus")')
                        .setRequired(true))), 

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ 
                content: '❌ Only Administrators can configure the welcome system.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        const welcomeChannel = interaction.options.getChannel('channel');
        const rulesChannel = interaction.options.getChannel('rules_channel');
        const customMessage = interaction.options.getString('message');

        const config = {
            welcomeChannelId: welcomeChannel.id,
            rulesChannelId: rulesChannel.id,
            cardText: customMessage
        };

        try {
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            await interaction.reply({ 
                content: `✅ **Welcome System Updated!**\n\n📌 **Cards will post in:** ${welcomeChannel}\n📜 **Rules link:** ${rulesChannel}\n💬 **Card Text:** "${customMessage}"`,
                flags: MessageFlags.Ephemeral 
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: '❌ Failed to save configuration.', 
                flags: MessageFlags.Ephemeral 
            });
        }
    },
};