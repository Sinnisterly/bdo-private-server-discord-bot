const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List all available commands'),

    async execute(interaction) {
        const commandsPath = path.join(__dirname); 
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        const embed = new EmbedBuilder()
            .setColor(0x9B59B6) 
            .setTitle('📜 ShaiHelper Bot Commands')
            .setDescription('Here are the tools available to you:')
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp();

        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, file));


            if (command.data && command.data.name) {
                const name = `/${command.data.name}`;
                const description = command.data.description;

                let extraInfo = '';
                if (command.data.options && command.data.options.some(opt => opt.constructor.name === 'SlashCommandSubcommandBuilder')) {
                    const subcommands = command.data.options.map(opt => opt.name).join(', ');
                    extraInfo = `\n*Subcommands: ${subcommands}*`;
                }

                embed.addFields({ 
                    name: name, 
                    value: `${description}${extraInfo}`, 
                    inline: false 
                });
            }
        }

        embed.setFooter({ text: 'Use /"command-name" to see specific options.' });

        await interaction.reply({ embeds: [embed] });
    },
};