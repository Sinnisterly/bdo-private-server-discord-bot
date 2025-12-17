const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const spots = [
    { name: 'Gyfin Rhasia (Underground)', ap: 450, dp: 610, info: 'Party (5). Drops Exalted Flame, Eternal Ring.' },
    { name: 'Abandoned Monastery', ap: 340, dp: 500, info: 'Party (2). Drops Daemon Flame, Primordial Belt.' },
    { name: 'Mirumok Ruins', ap: 340, dp: 500, info: 'Party (3). Drops Primordial Flame, Ring of Perseus.' },
    { name: 'Aakman / Basilisk', ap: 340, dp: 500, info: 'Solo/Duo. Drops Primordial Necklace.' },
    { name: 'Shultz Guard', ap: 330, dp: 450, info: 'Party (2). Drops Primordial Tome.' },
    { name: 'Fadus', ap: 330, dp: 450, info: 'Solo. Drops Artemis Harmony.' },
    { name: 'Thornwood Forest', ap: 320, dp: 450, info: 'Solo. Drops Primordial Earring, Athena\'s Judgement.' },
    { name: 'Saunils / Desert Nagas', ap: 320, dp: 450, info: 'Solo. Drops Primordial Ring.' },
    { name: 'Protty Cave', ap: 320, dp: 450, info: 'Solo. Drops Visionary Elkarr.' },
    { name: 'Sycraia (Abyssal)', ap: 320, dp: 450, info: 'Solo. Drops Hermes Evasion.' },
    { name: 'Terraria Spots (Orcs/Monastery)', ap: 280, dp: 350, info: 'Solo. Drops Mana, Hearts.' },
    { name: 'Tshira / Polly / Marie', ap: 160, dp: 250, info: 'Solo. Beginner Spots (Caphras/EXP).' },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('grind')
        .setDescription('Find the best grind spot for your gear')
        .addIntegerOption(option => 
            option.setName('ap')
                .setDescription('Your current Sheet AP (inventory AP)')
                .setRequired(true)),

    async execute(interaction) {
        const userAP = interaction.options.getInteger('ap');

        const eligibleSpots = spots
            .filter(spot => userAP >= spot.ap)
            .sort((a, b) => b.ap - a.ap);

        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(`⚔️ Recommended Grind Spots (AP: ${userAP})`)

        if (eligibleSpots.length === 0) {
            embed.setDescription("You are a bit low for our registered spots! Try following the **Leveling Guide** first (`/wiki`).");
            embed.setColor(0x99AAB5); 
        } else {
            const topSpots = eligibleSpots.slice(0, 5);
            
            let description = "";
            topSpots.forEach(s => {
                description += `**[${s.ap} AP] ${s.name}**\n*Req DP: ${s.dp}* • ${s.info}\n\n`;
            });

            embed.setDescription(description);
            
            if (userAP >= 450) {
                embed.setFooter({ text: "You are ready for Gyfin Rhasia (End Game)!" });
            } else if (eligibleSpots.length > 5) {
                embed.setFooter({ text: `+${eligibleSpots.length - 5} lower tier spots hidden.` });
            }
        }

        await interaction.reply({ embeds: [embed] });
    },
};