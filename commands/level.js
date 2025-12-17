const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const fs = require('fs');
const path = require('path');
const achievementsList = require('../achievements.js');

const levelsPath = path.join(__dirname, '../levels.json');

const backgroundPalettes = [
    ['#0f0c29', '#302b63', '#24243e'], // Classic Exodus
    ['#200122', '#6f0000', '#200122'], // Crimson Abyss
    ['#000428', '#004e92', '#000428'], // Ocean Depths
    ['#141E30', '#243B55', '#141E30'], // Royal Night
    ['#000000', '#434343', '#000000'], // Deep Monochrome
    ['#16222A', '#3A6073', '#16222A'], // Cool Steel
    ['#23074d', '#cc5333', '#23074d'], // Martian Sunset
    ['#3a1c71', '#d76d77', '#ffaf7b'], // Dusk Horizon (Pink/Orange/Purple)
    ['#020024', '#090979', '#00d4ff'], // Electric Blue Nebula
    ['#1A2980', '#26D0CE', '#1A2980'], // Aqua Surge
    ['#134E5E', '#71B280', '#134E5E'], // Toxic Mist (Dark Green/Teal)
    ['#1e130c', '#9a8478', '#1e130c'], // Deep Earth (Coffee/Brown)
    ['#0f2027', '#203a43', '#2c5364'], // Northern Lights (Dark Cyan)
    ['#2C3E50', '#FD746C', '#2C3E50'], // Red Moon (Grey/Salmon)
    ['#000000', '#D4AF37', '#000000'], // Royal Gold (Black/Gold)
    ['#33001b', '#ff0084', '#33001b'], // Neon Cyberpunk (Dark Magenta)
    ['#283048', '#859398', '#283048'], // Metallic Silver
    ['#4b6cb7', '#182848', '#4b6cb7'], // Velvet Blue
    ['#2980B9', '#6DD5FA', '#FFFFFF'], // Glacial White (Bright Ice)
    ['#373B44', '#4286f4', '#373B44'], // Discord Blurple-ish
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Check your current level and rank')
        .addUserOption(option => 
            option.setName('user').setDescription('View another user\'s level')),

    async execute(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;
        
        let data = {};
        if (fs.existsSync(levelsPath)) {
            try { data = JSON.parse(fs.readFileSync(levelsPath)); } catch (e) {}
        }

        const userData = data[target.id] || { xp: 0, level: 1, messages: 0, achievements: [] };
        const xpNeeded = Math.floor(userData.level * 100 * 1.5);

        const canvas = Canvas.createCanvas(700, 250);
        const ctx = canvas.getContext('2d');

        const colors = backgroundPalettes[Math.floor(Math.random() * backgroundPalettes.length)];
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[2]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(20, 20, 660, 210);

        ctx.save();
        ctx.beginPath();
        ctx.arc(125, 125, 80, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip(); 

        const avatarURL = target.displayAvatarURL({ extension: 'png' });
        try {
            const avatar = await Canvas.loadImage(avatarURL);
            ctx.drawImage(avatar, 45, 45, 160, 160);
        } catch (e) {
            ctx.fillStyle = '#CCCCCC';
            ctx.fillRect(45, 45, 160, 160);
        }
        ctx.restore();

        ctx.beginPath();
        ctx.arc(125, 125, 80, 0, Math.PI * 2, true);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.closePath();

        ctx.font = 'bold 40px sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(target.username, 230, 80);

        ctx.font = '30px sans-serif';
        ctx.fillStyle = '#9B59B6';
        ctx.fillText(`Level ${userData.level}`, 230, 130);

        ctx.font = '24px sans-serif';
        ctx.fillStyle = '#CCCCCC';
        ctx.fillText(`Messages: ${userData.messages}`, 450, 130);

        ctx.fillStyle = '#444444';
        ctx.fillRect(230, 160, 400, 30);

        const percent = Math.min(userData.xp / xpNeeded, 1);
        const barWidth = Math.floor(400 * percent);
        ctx.fillStyle = '#9B59B6';
        ctx.fillRect(230, 160, barWidth, 30);

        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(`${userData.xp} / ${xpNeeded} XP`, 430, 183);

        const unlockedIcons = achievementsList
            .filter(ach => userData.achievements && userData.achievements.includes(ach.id))
            .map(ach => ach.icon);

        if (unlockedIcons.length > 0) {
            ctx.font = '30px sans-serif';
            ctx.textAlign = 'left'; 
            
            let iconX = 230;
            unlockedIcons.forEach(icon => {
                ctx.fillText(icon, iconX, 225);
                iconX += 45; 
            });
        } else {
            ctx.font = 'italic 18px sans-serif';
            ctx.fillStyle = '#888888';
            ctx.textAlign = 'left';
            ctx.fillText("No badges yet...", 230, 220);
        }

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'rank.png' });
        await interaction.reply({ files: [attachment] });
    },
};