import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "../../../../../prisma.js";

export async function POST(event) {
    const playerId = event.locals.user.playerId;
    const projectKey = event.locals.user.projectKey;

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
        where: { projectKey },
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

    const player = await prisma.player.findUnique({
        where: {
            playerId,
            projectId: project.id,
        },
    });

    if (!player) {
        return new Response(
            JSON.stringify({
                status: 404,
                error: "Player not found",
                data: {},
            }),
            { status: 404 }
        );
    }

    const activeSession = await prisma.playerSession.findFirst({
        where: {
            playerId: player.id,
            projectId: project.id,
            endTime: null,
        },
    });

    if (activeSession) {
        return new Response(
            JSON.stringify({
                status: 400,
                error: "Session already active",
                data: {},
            }),
            { status: 400 }
        );
    }

    await prisma.playerSession.create({
        data: {
            playerId: player.id,
            projectId: project.id,
            startTime: new Date(),
        },
    });

    return new Response(
        JSON.stringify({
            status: 201,
            error: null,
            data: { message: "Session Started" },
        }),
        { status: 201 }
    );
}
