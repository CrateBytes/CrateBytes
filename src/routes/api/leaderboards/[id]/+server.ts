import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "../../../../prisma.js";

export async function GET({ params, url }) {
    const { id } = params;
    const page = url.searchParams.get("page") || "1";

    const leaderboard = await prisma.leaderboard.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
        },
    });

    if (!leaderboard) {
        return new Response("Leaderboard not found", { status: 404 });
    }

    const pageNumber = parseInt(page, 10);
    const startIndex = pageNumber == 0 ? 0 : (pageNumber - 1) * 10;

    const entries = await prisma.leaderboardEntry.findMany({
        where: {
            leaderboardId: id,
        },
        select: {
            player: {
                select: {
                    guest: true,
                    playerId: true,
                    PlayerCustomData: {
                        select: {
                            data: true,
                        },
                    },
                },
            },
            score: true,
        },
        orderBy: {
            score: "desc",
        },
        skip: startIndex,
        take: 10,
    });

    const totalEntries = await prisma.leaderboardEntry.count({
        where: {
            leaderboardId: id,
        },
    });

    return new Response(
        JSON.stringify({
            leaderboard,
            entries: entries,
            totalEntries: totalEntries,
            pages: Math.ceil(totalEntries / 10),
        }),
        {
            headers: { "Content-Type": "application/json" },
        }
    );
}
