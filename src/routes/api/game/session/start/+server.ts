import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "../../../../../prisma.js";

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

    if (activeSession) {
        return new Response("Session already active", { status: 400 });
    }

    const newSession = await prisma.playerSession.create({
        data: {
            playerId: player.id,
            projectId: project.id,
            startTime: new Date(),
        },
    });

    return new Response("Session Started", { status: 201 });
}
