const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ComponentType 
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const wikiDataPath = path.join(__dirname, '../wikiData.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wiki')
        .setDescription('Read the full Exodus Server Guide'),

    async execute(interaction) {
        let pages = [];
        try {
            pages = JSON.parse(fs.readFileSync(wikiDataPath, 'utf8'));
        } catch (e) {
            return interaction.reply({ content: '❌ Error loading Wiki Data.', ephemeral: true });
        }

        let currentPage = 0;

        const embed = generateEmbed(pages, currentPage);
        const rows = generateComponents(pages, currentPage);

        const response = await interaction.reply({ 
            embeds: [embed], 
            components: rows,
            fetchReply: true 
        });

        const collector = response.createMessageComponentCollector({ 
            componentType: ComponentType.Button | ComponentType.StringSelect, 
            time: 15 * 60 * 1000 
        });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: 'This wiki is controlled by the user who opened it.', ephemeral: true });
            }

			if (i.customId === 'chapter_select') {
                currentPage = parseInt(i.values[0]);
            }

            await i.update({ 
                embeds: [generateEmbed(pages, currentPage)], 
                components: generateComponents(pages, currentPage) 
            });
        });

        collector.on('end', () => {
            const disabledRows = generateComponents(pages, currentPage, true);
            interaction.editReply({ components: disabledRows });
        });
    },
};


function generateEmbed(pages, index) {
    const page = pages[index];
    return new EmbedBuilder()
        .setColor(0x9B59B6)
        .setTitle(`📖 ${page.title}`)
        .setDescription(page.description)
        .setFooter({ text: `Page ${index + 1} of ${pages.length} • Use /ask for specific items` });
}

function generateComponents(pages, index, disabled = false) {
    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('◀ Previous')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(disabled || index === 0),
        new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next ▶')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(disabled || index === pages.length - 1)
    );

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('chapter_select')
        .setPlaceholder('Jump to Chapter...')
        .setDisabled(disabled);

    pages.forEach((page, i) => {
        selectMenu.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(page.title)
                .setValue(i.toString())
                .setDescription(page.title.split('. ')[1] || 'Chapter') 
                .setDefault(i === index)
        );
    });

    const menuRow = new ActionRowBuilder().addComponents(selectMenu);

    return [menuRow]; 
}