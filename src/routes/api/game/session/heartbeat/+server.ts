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
        where: {
            projectKey,
        },
    });

    if (!project) {
        return new Response("Project not found", {
            status: 404,
        });
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

    if (activeSession.lastHeartbeat) {
        const lastHeartbeatTime = new Date(
            activeSession.lastHeartbeat
        ).getTime();
        const timeSinceLastHeartbeat =
            currentTime.getTime() - lastHeartbeatTime;

        if (timeSinceLastHeartbeat > EXPIRATION_TIME_MS) {
            await prisma.playerSession.update({
                where: {
                    id: activeSession.id,
                },
                data: {
                    endTime: currentTime,
                },
            });

            return new Response("Session has expired", { status: 403 });
        }
    }

    const updatedSession = await prisma.playerSession.update({
        where: {
            id: activeSession.id,
        },
        data: {
            lastHeartbeat: currentTime,
        },
    });

    return new Response("Heartbeat updated", { status: 200 });
}
