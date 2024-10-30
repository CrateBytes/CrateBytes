import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "../../../../../prisma.js";

export async function GET({ locals, params, request }) {
    const playerId = locals.user.playerId;
    const projectKey = locals.user.projectKey;

    if (!projectKey || !playerId) {
        return new Response(
            JSON.stringify({
                status: 400,
                error: "Project key or player id not provided",
                data: {},
            }),
            { status: 400 }
        );
    }

    const project = await prisma.project.findUnique({
        where: {
            projectKey,
        },
        select: {
            id: true,
        },
    });

    if (!project) {
        return new Response(
            JSON.stringify({
                status: 404,
                error: "Project not found",
                data: {},
            }),
            { status: 404 }
        );
    }

    const player = await prisma.playerCustomData.findUnique({
        where: {
            playerId_projectId: {
                playerId,
                projectId: project.id,
            },
        },
        select: {
            data: true,
        },
    });

    if (!player) {
        return new Response(
            JSON.stringify({
                status: 200,
                error: "",
                data: { data: "" }, // Explicitly returning an empty string for data
            }),
            { status: 200 }
        );
    }

    return new Response(
        JSON.stringify({
            status: 200,
            error: null,
            data: player, // Return the player data directly
        }),
        { headers: { "Content-Type": "application/json" } }
    );
}
