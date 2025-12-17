import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ],
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.content === '!ping') {
        await message.reply('Pong!');
    }
});

const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
    console.warn('DISCORD_TOKEN is not defined in environment variables.');
} else {
    client.login(TOKEN).catch((err) => {
        console.error('Failed to login:', err);
    });
}
