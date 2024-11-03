import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "../../../../../prisma.js";

export async function PUT({ locals, params, request }) {
    const body = await request.json().catch(() => {
        return new Response(
            JSON.stringify({
                statusCode: 400,
                error: {
                    message: "Invalid JSON",
                },
            })
        );
    });

    const data = body?.data;
    const playerId = locals.user.playerId;
    const projectKey = locals.user.projectKey;

    if (!data || typeof data !== "string") {
        return new Response(
            JSON.stringify({
                statusCode: 400,
                error: {
                    message: "Invalid data",
                },
            })
        );
    }

    if (data.length > 1000) {
        return new Response(
            JSON.stringify({
                statusCode: 400,
                error: {
                    message: "Data too long",
                },
            })
        );
    }

    if (!projectKey || !playerId) {
        return new Response(
            JSON.stringify({
                statusCode: 400,
                error: {
                    message: "Project key or player id not provided",
                },
            })
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
                statusCode: 404,
                error: {
                    message: "Project not found",
                },
            })
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
            statusCode: 200,
            data: { data: player.data },
        })
    );
}
