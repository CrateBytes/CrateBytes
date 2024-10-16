import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "../../../../../../prisma.js";

export async function POST({ locals, params, request }) {
    const { id } = params;
    const body = await request.json().catch((error) => {
        return new Response("Invalid JSON", {
            status: 400,
        });
    });

    const score = body.score;
    const playerId = locals.user.playerId;
    const projectKey = locals.user.projectKey;

    if (!projectKey || !playerId || !score) {
        return new Response("Project key, player id, or score not provided", {
            status: 400,
        });
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
        return new Response("Leaderboard not found", { status: 404 });
    }

    await prisma.leaderboardEntry.upsert({
        where: {
            playerId_leaderboardId: {
                playerId,
                leaderboardId: leaderboard.id,
            },
        },
        update: {
            score,
        },
        create: {
            score,
            playerId,
            leaderboardId: leaderboard.id,
        },
    });

    return new Response("Score submitted", { status: 200 });
}
