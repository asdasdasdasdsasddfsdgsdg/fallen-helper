
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@fallen-helper/db";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, date, template, description, channelId } = body;

        if (!channelId) {
            return NextResponse.json({ error: 'Channel ID required' }, { status: 400 });
        }

        // Construct the Discord Embed
        const embed = {
            title: title,
            description: description || `**Date:** ${new Date(date).toLocaleString()}\n**Template:** ${template}`,
            color: 0x9b59b6, // Purple
            footer: { text: `Created by ${session.user?.name}` },
            timestamp: new Date().toISOString()
        };

        // 1. Create Event entry in DB
        const event = await prisma.event.create({
            data: {
                title,
                startTime: new Date(date),
                description,
                channelId,
                creator: {
                    connectOrCreate: {
                        where: { discordId: session.user?.id as string },
                        create: {
                            discordId: session.user?.id as string,
                            name: session.user?.name,
                            image: session.user?.image
                        }
                    }
                }
            }
        });

        // 2. Create PendingAction for Bot
        await prisma.pendingAction.create({
            data: {
                type: 'CREATE_EVENT',
                payload: JSON.stringify({
                    channelId,
                    embed,
                    eventId: event.id
                }),
                status: 'PENDING'
            }
        });

        return NextResponse.json({ success: true, eventId: event.id });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
