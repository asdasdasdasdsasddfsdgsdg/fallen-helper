
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@fallen-helper/db";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch all guilds the bot knows about
        // In a real app, we should filter by guilds where the USER is also a member/admin.
        // For this MVP, we return all (assuming private bot or dashboard access)
        const guilds = await prisma.guild.findMany({
            include: {
                channels: {
                    where: { type: '0' }, // 0 is usually GuildText, need to verify robust type check
                    orderBy: { name: 'asc' }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({ guilds });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
