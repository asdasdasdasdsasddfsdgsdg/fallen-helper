import { prisma } from '@fallen-helper/db';
import { Client, TextChannel, EmbedBuilder } from 'discord.js';

export class PollingService {
    private client: Client;
    private interval: NodeJS.Timeout | null = null;
    private isProcessing = false;

    constructor(client: Client) {
        this.client = client;
    }

    start() {
        console.log('Starting polling service...');
        this.interval = setInterval(() => this.poll(), 5000); // Check every 5s
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
    }

    private async poll() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            // Find pending actions
            const actions = await prisma.pendingAction.findMany({
                where: { status: 'PENDING' },
                take: 5, // Process 5 at a time
                orderBy: { createdAt: 'asc' },
            });

            for (const action of actions) {
                await this.processAction(action);
            }
        } catch (error) {
            console.error('Polling error:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    private async processAction(action: any) {
        console.log(`Processing action: ${action.type} (${action.id})`);

        try {
            // Update to PROCESSING
            await prisma.pendingAction.update({
                where: { id: action.id },
                data: { status: 'PROCESSING' },
            });

            const payload = JSON.parse(action.payload);

            if (action.type === 'CREATE_EVENT') {
                const { channelId, embed } = payload;

                try {
                    const channel = await this.client.channels.fetch(channelId);
                    if (channel && channel.isTextBased()) {
                        const message = await (channel as TextChannel).send({ embeds: [embed] });

                        // Success: Mark DONE and save result
                        await prisma.pendingAction.update({
                            where: { id: action.id },
                            data: {
                                status: 'DONE',
                                result: JSON.stringify({ messageId: message.id })
                            },
                        });
                    } else {
                        throw new Error('Channel not found or invalid');
                    }
                } catch (err: any) {
                    throw err; // Re-throw to catch below
                }
            }

            // Add other action types here...

        } catch (error: any) {
            console.error(`Failed to process action ${action.id}:`, error);
            await prisma.pendingAction.update({
                where: { id: action.id },
                data: {
                    status: 'FAILED',
                    result: JSON.stringify({ error: error.message })
                },
            });
        }
    }
}
