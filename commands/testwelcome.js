const { SlashCommandBuilder } = require('discord.js');
const welcomeEvent = require('../events/welcome');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testwelcome')
        .setDescription('Simulate a welcome message'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        // Simulate the event using the interaction member
        await welcomeEvent.execute(interaction.member);
        await interaction.editReply('Simulated join event!');
    },
};