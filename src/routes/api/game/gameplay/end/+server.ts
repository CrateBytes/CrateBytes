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
    let sessionEndTime = currentTime;

    if (activeSession.lastHeartbeat) {
        const lastHeartbeatTime = new Date(
            activeSession.lastHeartbeat
        ).getTime();
        const timeSinceLastHeartbeat =
            currentTime.getTime() - lastHeartbeatTime;

        if (timeSinceLastHeartbeat > EXPIRATION_TIME_MS) {
            sessionEndTime = new Date(lastHeartbeatTime + EXPIRATION_TIME_MS);
        }
    }

    const sessionStartTime = new Date(activeSession.startTime);
    const sessionDuration =
        (sessionEndTime.getTime() - sessionStartTime.getTime()) / 1000;

    await prisma.playerSession.update({
        where: { id: activeSession.id },
        data: { endTime: sessionEndTime },
    });

    await prisma.player.update({
        where: { id: player.id },
        data: {
            playTime: player.playTime + Math.floor(sessionDuration),
        },
    });

    return new Response(
        JSON.stringify({
            status: 200,
            error: null,
            data: { message: "Session ended successfully", sessionDuration },
        }),
        { status: 200 }
    );
}
