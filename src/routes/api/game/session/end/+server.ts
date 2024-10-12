import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "../../../../../prisma.js";

const EXPIRATION_TIME_MS = 10 * 60 * 1000;
export async function POST(event) {
    const playerId = event.locals.user.playerId;
    const projectKey = event.locals.user.projectKey;

    if (!projectKey || !playerId) {
        return new Response("Project key or player id not provided", {
            status: 400,
        });
    }

    const project = await prisma.project.findUnique({
        where: { projectKey },
    });

    if (!project) {
        return new Response("Project not found", { status: 404 });
    }

    const player = await prisma.player.findUnique({
        where: {
            playerId: playerId,
            projectId: project.id,
        },
    });

    if (!player) {
        return new Response("Player not found", { status: 404 });
    }

    const activeSession = await prisma.playerSession.findFirst({
        where: {
            playerId: player.id,
            projectId: project.id,
            endTime: null,
        },
    });

    if (!activeSession) {
        return new Response("No active session found", { status: 404 });
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

    const endedSession = await prisma.playerSession.update({
        where: { id: activeSession.id },
        data: { endTime: sessionEndTime },
    });

    const updatedPlayer = await prisma.player.update({
        where: { id: player.id },
        data: {
            playTime: player.playTime + Math.floor(sessionDuration),
        },
    });

    return new Response("Session ended successfully", { status: 200 });
}
