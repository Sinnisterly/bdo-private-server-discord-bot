# ⚔️ Exodus Bot (BDO Private Server Assistant)

A feature-rich Discord bot designed for **Black Desert Online** private server communities. This bot acts as a central hub for game knowledge, raid organization, leveling engagement, and member profiling.

## ✨ Features

### 📚 Knowledge Base & Game Info
* **Wiki Search (`/wiki` & `/ask`)**: Query the internal database for item locations, drop tables, and server-specific mechanics. (setup knowledge.json with your information)
* **Boss Timers (`/boss`)**: Check spawn times and locations for world bosses.
* **Grind Spots (`/grind`)**: Get info on best rotation spots and AP/DP requirements.
* **Item Lookup (`/lookup`)**: Quick search for item details. Uses retail sites like bdolytics, etc.

### ⚔️ Raid Management
* **Host Raids (`/raid host`)**: Create interactive raid lobbies with buttons for roles (Tank, DPS, Healer).
* **Automated Management**: Tracks active raids in `activeRaids.json`.
* **Configurable**: Customize raid types and roles in `raidConfig.json`.

### 👤 Player Profiles
* **Custom Cards (`/profile`)**: Users can set their Main Class, AP, DP, and Family Name.
* **Stats Display**: Generates a dynamic profile card to show off gear score and stats.

### 📈 Leveling & Achievements
* **XP System**: Users gain XP by chatting (handled in `events/leveling.js`).
* **Leaderboard (`/level`)**: View the top chatters in the server.
* **Achievements**: Custom milestones tracked in `achievements.js`.

### 🛠️ Server Utilities
* **Welcome System**: Auto-generates welcome cards with avatars when users join (`events/welcome.js`).
* **Configurable Welcomer**: Customize messages and channels via `/welcome` and `welcomeConfig.json`.
* **Help Menu (`/help`)**: Dynamic help command listing all available tools.

---

## 🚀 Installation & Setup

### 1. Prerequisites
* **Node.js**: Version 16.9.0 or newer is required (v20+ recommended).
* **Discord Bot Token**: From the [Discord Developer Portal](https://discord.com/developers/applications).

### 2. Clone & Install
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/exodus-bot.git

# Navigate to directory
cd exodus-bot

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (this file is git-ignored for security).
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
GUILD_ID=your_server_id_here
```

### 4. Deploy Commands
Register the Slash Commands (`/`) with Discord before running the bot.
```bash
node deploy-commands.js
```

### 5. Run the Bot
```bash
node index.js
```
*For production, use PM2:*
```bash
npm install -g pm2
pm2 start index.js --name "exodus-bot"
```

---

## ⚙️ Configuration Files

The bot uses several JSON files in the root folder to store state and config. **Do not delete these.**

| File | Description |
| :--- | :--- |
| `raidConfig.json` | Define valid raid dungeons, max counts, and role names. |
| `welcomeConfig.json` | Stores the channel ID and message template for welcomes. |
| `wikiData.json` | The main database for `/wiki` responses. Update this to add new guides! |
| `activeRaids.json` | **(Auto-generated)** Tracks currently running raids. |
| `profiles.json` | **(Auto-generated)** Stores user BDO profiles. |
| `levels.json` | **(Auto-generated)** Stores chat XP and levels. |

---

## 📂 Project Structure

```text
ExodusBot/
├── assets/                 # Images (icon.png, etc.)
├── commands/               # Slash Command files
│   ├── ask.js              # Wiki Q&A
│   ├── boss.js             # Boss timers
│   ├── grind.js            # Grind spot info
│   ├── level.js            # XP Leaderboard
│   ├── profile.js          # User BDO profiles
│   ├── raid.js             # Raid management
│   ├── welcome.js          # Welcome settings
│   └── ... (others)
├── events/                 # Event Handlers
│   ├── leveling.js         # Chat XP logic
│   └── welcome.js          # Member join logic
├── activeRaids.json        # Database: Active raids
├── achievements.js         # Achievement logic
├── deploy-commands.js      # Command registration script
├── index.js                # Main entry point
├── knowledge.json          # Wiki Data Source 1
├── wikiData.json           # Wiki Data Source 2
└── ... (config files)
```

## 🤝 Contributing
1. Fork the repo.
2. Create your feature branch (`git checkout -b feature/NewFeature`).
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request.

## 📝 License
Distributed under the  GNU GENERAL PUBLIC LICENSE 2.0
