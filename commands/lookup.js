const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lookup')
        .setDescription('Search retail databases (Bdolytics, BDOCodex)')
        .addStringOption(option => 
            option.setName('query')
                .setDescription('Item name, recipe, or quest (e.g. "Vinegar")')
                .setRequired(true)),

    async execute(interaction) {
        const query = interaction.options.getString('query');
        const encodedQuery = encodeURIComponent(query);

        const bdolyticsUrl = `https://bdolytics.com/en/NA/db/search?q=${encodedQuery}`;
        
        const codexUrl = `https://bdocodex.com/us/search/${encodedQuery}/`;
        

        const embed = new EmbedBuilder()
            .setColor(0x0099FF) 
            .setTitle(`🔎 Retail Database Search: "${query}"`)
            .setDescription(`Select a database to view details for **${query}**.\n*Note: Retail recipes usually match Exodus, but check /wiki for custom changes.*`)
            .setThumbnail('https://bdolytics.com/logo.png');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Bdolytics (Recipes)')
                .setStyle(ButtonStyle.Link)
                .setURL(bdolyticsUrl)
                .setEmoji('🍳'),
            
            new ButtonBuilder()
                .setLabel('BDO Codex (Info)')
                .setStyle(ButtonStyle.Link)
                .setURL(codexUrl)
                .setEmoji('📘')
				);

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};