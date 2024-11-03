import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "../../../../../prisma.js";

const EXPIRATION_TIME_MS = 10 * 60 * 1000;

export async function POST(event) {
    const playerId = event.locals.user.playerId;
    const projectKey = event.locals.user.projectKey;

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
        where: { projectKey },
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

    const player = await prisma.player.findUnique({
        where: {
            playerId,
            projectId: project.id,
        },
    });

    if (!player) {
        return new Response(
            JSON.stringify({
                statusCode: 404,
                error: {
                    message: "Player not found",
                },
            })
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
                statusCode: 404,
                error: {
                    message: "No active session found",
                },
            })
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
                    statusCode: 403,
                    error: {
                        message: "Session has expired",
                    },
                })
            );
        }
    }

    await prisma.playerSession.update({
        where: { id: activeSession.id },
        data: { lastHeartbeat: currentTime },
    });

    return new Response(
        JSON.stringify({
            statusCode: 200,
            data: { message: "Heartbeat" },
        })
    );
}
