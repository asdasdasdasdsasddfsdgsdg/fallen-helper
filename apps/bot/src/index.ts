import 'dotenv/config';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { PollingService } from './services/poller';
import { GuildSyncService } from './services/guildSync';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ],
});

const poller = new PollingService(client);
const syncer = new GuildSyncService(client);

client.once('ready', async () => {
    console.log(`Logged in as ${client.user?.tag}!`);
    poller.start();
    await syncer.syncAll(); // Sync on startup
});

// Sync when joining a new guild
client.on(Events.GuildCreate, async (guild) => {
    await syncer.syncGuild(guild);
});

client.on('messageCreate', async (message) => {
    if (message.content === '!ping') {
        await message.reply('Pong!');
    }
});

const TOKEN = process.env.DISCORD_TOKEN;

async function start() {
    if (!TOKEN) {
        console.error('DISCORD_TOKEN is not defined.');
        return;
    }

    try {
        await client.login(TOKEN);
    } catch (err) {
        console.error('Failed to start:', err);
        process.exit(1);
    }
}

start();
