import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "../../../../../prisma.js";

export async function PUT({ locals, params, request }) {
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

    const data = body?.data;
    const playerId = locals.user.playerId;
    const projectKey = locals.user.projectKey;

    if (!data || typeof data !== "string") {
        return new Response(
            JSON.stringify({
                status: 400,
                error: "Invalid data",
                data: {},
            }),
            { status: 400 }
        );
    }

    if (data.length > 1000) {
        return new Response(
            JSON.stringify({
                status: 400,
                error: "Data too long",
                data: {},
            }),
            { status: 400 }
        );
    }

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

    const player = await prisma.playerCustomData.upsert({
        where: {
            playerId_projectId: {
                playerId: playerId,
                projectId: project.id,
            },
        },
        update: {
            data,
        },
        create: {
            playerId,
            projectId: project.id,
            data,
        },
    });

    return new Response(
        JSON.stringify({
            status: 200,
            error: null,
            data: { data: player.data },
        }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
    );
}
