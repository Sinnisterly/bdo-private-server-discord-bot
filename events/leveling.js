const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

const levelsPath = path.join(__dirname, '../levels.json');
const achievementsList = require('../achievements.js'); 


const XP_COOLDOWN = 60 * 1000; 
const XP_MIN = 15;
const XP_MAX = 25;

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;


        let data = {};
        try {
            if (fs.existsSync(levelsPath)) {
                const content = fs.readFileSync(levelsPath, 'utf8');
                if (content.trim()) data = JSON.parse(content);
            }
        } catch (e) { console.error("DB Error:", e); }

        const userId = message.author.id;
        

        if (!data[userId]) {
            data[userId] = {
                xp: 0,
                level: 1,
                messages: 0,
                lastXp: 0,
                achievements: [] 
            };
        }

        const userStats = data[userId];


        userStats.messages += 1;


        const now = Date.now();
        if (now - userStats.lastXp >= XP_COOLDOWN) {
            const xpGain = Math.floor(Math.random() * (XP_MAX - XP_MIN + 1)) + XP_MIN;
            userStats.xp += xpGain;
            userStats.lastXp = now;


            const xpNeeded = Math.floor(userStats.level * 100 * 1.5);
            if (userStats.xp >= xpNeeded) {
                userStats.level += 1;
                userStats.xp -= xpNeeded;
                message.channel.send(`🎉 **Level Up!** ${message.author} is now **Level ${userStats.level}**! Check your level with **/level**!`);
            }
        }


        let newBadges = [];
        
        achievementsList.forEach(ach => {

            if (ach.condition(userStats) && !userStats.achievements.includes(ach.id)) {
                userStats.achievements.push(ach.id);
                newBadges.push(ach);
            }
        });


        if (newBadges.length > 0) {
            const badgeIcons = newBadges.map(b => `${b.icon} **${b.name}**`).join(', ');
            message.channel.send(`🏆 **Achievement Unlocked:** ${message.author} earned: ${badgeIcons}!`);
        }


        fs.writeFileSync(levelsPath, JSON.stringify(data, null, 2));
    },
};