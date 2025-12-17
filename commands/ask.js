const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('Search the Exodus BDO Wiki')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('What item, spot, or guide are you looking for?')
                .setRequired(true)),
    async execute(interaction) {
        const query = interaction.options.getString('query').toLowerCase();
        
        const dataPath = path.join(__dirname, '../knowledge.json');
        
        try {
            const rawData = fs.readFileSync(dataPath, 'utf8');
            const knowledgeBase = JSON.parse(rawData);

            const results = knowledgeBase.filter(item => 
                item.keywords.some(k => query.includes(k)) || 
                item.title.toLowerCase().includes(query) ||
                (item.description && item.description.toLowerCase().includes(query))
            );

            if (results.length === 0) {
                return interaction.reply({ 
                    content: `❌ I couldn't find anything matching **"${query}"** in the Exodus records.`, 
                    flags: MessageFlags.Ephemeral 
                });
            }

            const match = results[0];

            const embed = new EmbedBuilder()
                .setColor(0x9B59B6) 
                .setTitle(`📚 Wiki: ${match.title}`)
                .setDescription(match.description)
                .setTimestamp();

            if (match.footer) {
                embed.setFooter({ text: match.footer });
            }

            if (results.length > 1) {
                const otherMatches = results.slice(1, 4).map(r => `• ${r.title}`).join('\n');
                embed.addFields({ 
                    name: '🔎 Also found:', 
                    value: otherMatches 
                });
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error reading knowledge.json:", error);
            await interaction.reply({ 
                content: "There was an error accessing the Wiki database. Please check the bot console.", 
                flags: MessageFlags.Ephemeral 
            });
        }
    },
};
