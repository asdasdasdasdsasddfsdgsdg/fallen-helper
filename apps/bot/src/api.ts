import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Client, TextChannel, EmbedBuilder } from 'discord.js';

export async function registerRoutes(fastify: FastifyInstance, client: Client) {

    // Health Check
    fastify.get('/api/health', async () => {
        return { status: 'ok', botStatus: client.isReady() ? 'online' : 'offline' };
    });

    // Create Event Hook
    fastify.post<{ Body: { channelId: string; embed: any } }>('/api/events/create', async (request, reply) => {
        const { channelId, embed } = request.body;

        try {
            const channel = await client.channels.fetch(channelId);
            if (!channel || !channel.isTextBased()) {
                return reply.status(404).send({ error: 'Channel not found or not text-based' });
            }

            const message = await (channel as TextChannel).send({ embeds: [embed] });
            return { success: true, messageId: message.id };
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to send message' });
        }
    });

    // Example: Sync Guilds (Get list of guilds bot is in)
    fastify.get('/api/guilds', async (request, reply) => {
        if (!client.isReady()) {
            return reply.status(503).send({ error: 'Bot not ready' });
        }

        const guilds = client.guilds.cache.map(g => ({
            id: g.id,
            name: g.name,
            icon: g.iconURL()
        }));

        return { guilds };
    });
}
