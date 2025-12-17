import { prisma } from '@fallen-helper/db';
import { Client, Guild, ChannelType } from 'discord.js';

export class GuildSyncService {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async syncAll() {
        console.log('Syncing all guilds...');
        for (const guild of this.client.guilds.cache.values()) {
            await this.syncGuild(guild);
        }
        console.log('Guild sync complete.');
    }

    async syncGuild(guild: Guild) {
        try {
            // 1. Upsert Guild
            await prisma.guild.upsert({
                where: { id: guild.id },
                update: {
                    name: guild.name,
                    icon: guild.iconURL()
                },
                create: {
                    id: guild.id,
                    name: guild.name,
                    icon: guild.iconURL()
                }
            });

            // 2. Sync Channels (Text & Voice only)
            const channels = await guild.channels.fetch();
            const validChannels = channels.filter(c => c && (c.type === ChannelType.GuildText || c.type === ChannelType.GuildVoice));

            for (const channel of validChannels.values()) {
                if (!channel) continue;

                await prisma.channel.upsert({
                    where: { id: channel.id },
                    update: {
                        name: channel.name,
                        type: channel.type.toString(),
                        guildId: guild.id
                    },
                    create: {
                        id: channel.id,
                        name: channel.name,
                        type: channel.type.toString(),
                        guildId: guild.id
                    }
                });
            }
        } catch (error) {
            console.error(`Failed to sync guild ${guild.name}:`, error);
        }
    }
}
