module.exports = [
    {
        id: 'novice_chatter',
        name: 'Novice Chatter',
        description: 'Send 50 messages',
        icon: '🗨️', 
        condition: (stats) => stats.messages >= 50
    },
    {
        id: 'dedicated',
        name: 'Dedicated Member',
        description: 'Send 500 messages',
        icon: '🔥',
        condition: (stats) => stats.messages >= 500
    },
    {
        id: 'level_5',
        name: 'Rising Star',
        description: 'Reach Level 5',
        icon: '⭐',
        condition: (stats) => stats.level >= 5
    },
    {
        id: 'level_10',
        name: 'Server Veteran',
        description: 'Reach Level 10',
        icon: '👑',
        condition: (stats) => stats.level >= 10
    },
    {
        id: 'level_20',
        name: 'Exodus Legend',
        description: 'Reach Level 20',
        icon: '💠',
        condition: (stats) => stats.level >= 20
    }
];