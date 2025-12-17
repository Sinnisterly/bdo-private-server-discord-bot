const { Events, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const path = require('path');
const fs = require('fs');

const configPath = path.join(__dirname, '../welcomeConfig.json');


// Define sets of 3 colors for the gradient (Start, Middle, End)
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
    name: Events.GuildMemberAdd,
    async execute(member) {
        if (!fs.existsSync(configPath)) return;
        
        let config;
        try {
            config = JSON.parse(fs.readFileSync(configPath));
        } catch (e) {
            console.error("Error loading welcome config:", e);
            return;
        }

        if (!config.welcomeChannelId || !config.rulesChannelId) return;
        const channel = member.guild.channels.cache.get(config.welcomeChannelId);
        if (!channel) return;

        const canvas = Canvas.createCanvas(700, 250);
        const ctx = canvas.getContext('2d');

        const paletteIndex = Math.floor(Math.random() * backgroundPalettes.length);
        const colors = backgroundPalettes[paletteIndex];

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(0.5, colors[1]);
        gradient.addColorStop(1, colors[2]);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        try {
            const iconPath = path.join(__dirname, '../assets/icon.png');
            const icon = await Canvas.loadImage(iconPath);
            ctx.globalAlpha = 0.5;
            ctx.drawImage(icon, 480, 25, 200, 200); 
            ctx.globalAlpha = 1.0; 
        } catch (error) {

        }


        drawStyledText(ctx, 'Welcome', 225, 100, 'bold 60px sans-serif', '#ffffff');

        const displayName = member.user.globalName || member.user.username;
        let fontSize = 40;
        ctx.font = `${fontSize}px sans-serif`;
        while (ctx.measureText(displayName).width > 400) {
             fontSize -= 2;
             ctx.font = `${fontSize}px sans-serif`;
        }
        drawStyledText(ctx, displayName, 225, 160, `${fontSize}px sans-serif`, '#cfcfcf');

        const bottomText = config.cardText || `Member #${member.guild.memberCount}`;
        drawStyledText(ctx, bottomText, 225, 200, '20px sans-serif', '#ffffff');


        ctx.shadowColor = 'transparent'; 

        ctx.beginPath();
        ctx.arc(110, 125, 85, 0, Math.PI * 2, true);
        ctx.strokeStyle = '#141E30'; 
        ctx.lineWidth = 8;
        ctx.stroke();
        ctx.closePath();
        ctx.clip(); 

        const avatarURL = member.user.displayAvatarURL({ extension: 'png' });
        const avatar = await Canvas.loadImage(avatarURL);
        ctx.drawImage(avatar, 25, 40, 170, 170);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome-image.png' });

        await channel.send({ 
            content: `Welcome to **ShaiLeBuff**, ${member}!`, 
            files: [attachment] 
        });
    },
};

function drawStyledText(ctx, text, x, y, font, fillStyle) {
    ctx.font = font;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000000'; 
    ctx.strokeText(text, x, y);

    ctx.fillStyle = fillStyle;
    ctx.fillText(text, x, y);
}
