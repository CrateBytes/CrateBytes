import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "../../../../../prisma.js";

const EXPIRATION_TIME_MS = 10 * 60 * 1000;

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

    if (!activeSession) {
        return new Response(
            JSON.stringify({
                status: 404,
                error: "No active session found",
                data: {},
            }),
            { status: 404 }
        );
    }

    const currentTime = new Date();

    if (activeSession.lastHeartbeat) {
        const lastHeartbeatTime = new Date(
            activeSession.lastHeartbeat
        ).getTime();
        const timeSinceLastHeartbeat =
            currentTime.getTime() - lastHeartbeatTime;

        if (timeSinceLastHeartbeat > EXPIRATION_TIME_MS) {
            await prisma.playerSession.update({
                where: { id: activeSession.id },
                data: { endTime: currentTime },
            });

            return new Response(
                JSON.stringify({
                    status: 403,
                    error: "Session has expired",
                    data: {},
                }),
                { status: 403 }
            );
        }
    }

    await prisma.playerSession.update({
        where: { id: activeSession.id },
        data: { lastHeartbeat: currentTime },
    });

    return new Response(
        JSON.stringify({
            status: 200,
            error: null,
            data: { message: "Heartbeat" },
        }),
        { status: 200 }
    );
}
