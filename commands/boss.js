const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');


const SERVER_OFFSET = 11; 


const schedule = [
    { name: 'Kzarka', times: ['04:00', '11:00', '21:15'], days: [0,1,2,3,4,5,6] },
    { name: 'Karanda', times: ['06:15', '23:15'], days: [0,1,2,3,4,5,6] },
    { name: 'Garmoth', times: ['04:15'], days: [2, 4] }, // Tue, Thu
    { name: 'Garmoth', times: ['01:00'], days: [0] },    // Sun
    { name: 'Vell', times: ['01:00'], days: [3] },       // Wed
    { name: 'Vell', times: ['18:00'], days: [0] },       // Sun
    { name: 'Isabella', times: ['09:00', '15:15'], days: [0,1,2,3,4,5,6] },
    { name: 'Mammore', times: ['04:15', '15:00', '18:00', '21:15', '22:00'], days: [0,1,2,3,4,5,6] }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('boss')
        .setDescription('Check World Boss spawn timers'),

    async execute(interaction) {
        const now = new Date();
        const nextSpawns = [];

        schedule.forEach(boss => {
            boss.times.forEach(timeStr => {
                const [hour, minute] = timeStr.split(':').map(Number);
                
                for (let i = 0; i < 7; i++) {
                    const checkDate = new Date(now);
                    checkDate.setUTCDate(now.getUTCDate() + i);
                    
                    checkDate.setUTCHours(hour - SERVER_OFFSET, minute, 0, 0);

                    if (boss.days.includes(checkDate.getUTCDay())) {
                        if (checkDate > now) {
                            nextSpawns.push({ 
                                name: boss.name, 
                                date: checkDate 
                            });
                            break; 
                        }
                    }
                }
            });
        });

        nextSpawns.sort((a, b) => a.date - b.date);

        const uniqueBosses = {};
        const finalDisplay = [];

        for (const spawn of nextSpawns) {
            if (!uniqueBosses[spawn.name]) {
                uniqueBosses[spawn.name] = true;
                finalDisplay.push(spawn);
            }
        }

        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('🔥 World Boss Timers')
            .setDescription(`**Server Boss Times:** PST\n*Timers adjust to your local clock automatically.*`)
            .setTimestamp();

        finalDisplay.forEach(spawn => {
            const unix = Math.floor(spawn.date.getTime() / 1000);
            embed.addFields({
                name: spawn.name,
                value: `⏳ <t:${unix}:R> (<t:${unix}:t>)`, 
                inline: false
            });
        });

        await interaction.reply({ embeds: [embed] });
    },
};