import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "../../../../../../prisma.js";

export async function POST({ locals, params, request }) {
    const { id } = params;
    const body = await request.json().catch(() => {
        return new Response(
            JSON.stringify({
                status: 400,
                error: "Invalid JSON",
                data: {},
            }),
            { status: 400 }
        );
    });

    const score = body?.score;
    const playerId = locals.user.playerId;
    const projectKey = locals.user.projectKey;

    if (!projectKey || !playerId || score == null) {
        return new Response(
            JSON.stringify({
                status: 400,
                error: "Project key, player id, or score not provided",
                data: {},
            }),
            { status: 400 }
        );
    }

    const leaderboard = await prisma.leaderboard.findUnique({
        where: {
            id,
            project: {
                projectKey,
            },
        },
    });

    if (!leaderboard) {
        return new Response(
            JSON.stringify({
                status: 404,
                error: "Leaderboard not found",
                data: {},
            }),
            { status: 404 }
        );
    }

    await prisma.leaderboardEntry.upsert({
        where: {
            playerId_leaderboardId: {
                playerId,
                leaderboardId: leaderboard.id,
            },
        },
        update: { score },
        create: {
            score,
            playerId,
            leaderboardId: leaderboard.id,
        },
    });

    return new Response(
        JSON.stringify({
            status: 200,
            error: null,
            data: { message: "Score submitted" },
        }),
        { status: 200 }
    );
}
