import type { RequestHandler } from "@sveltejs/kit";
import { GenerateToken } from "$lib/jwt";
import { prisma } from "../../../prisma";
import { createId } from "@paralleldrive/cuid2";

export async function POST(event) {
    const body = await event.request.json().catch((error) => {
        return new Response("Invalid JSON", {
            status: 400,
        });
    });

    const projectKey = body.projectKey;
    if (!projectKey) {
        return new Response("Project key not provided", {
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

    // Login to existing Player
    if (body.playerId) {
        const player = await prisma.player.findUnique({
            where: {
                playerId: body.playerId,
                projectId: project.id,
            },
        });

        if (!player) {
            return new Response("Player not found", {
                status: 404,
            });
        }

        await prisma.player.update({
            where: {
                playerId: body.playerId,
            },
            data: {
                lastPlayed: new Date(),
            },
        });

        const token = GenerateToken({
            playerId: player.playerId,
            projectKey: project.projectKey,
        });

        return new Response(
            JSON.stringify({ token, playerId: player.playerId }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }

    // Create new Player
    const playerId = createId();

    const token = GenerateToken({ playerId, projectKey: project.projectKey });

    const player = await prisma.player.create({
        data: {
            id: playerId,
            playerId: playerId,
            guest: true,
            playTime: 0,
            lastPlayed: new Date(),
            project: {
                connect: {
                    projectKey,
                },
            },
        },
    });

    return new Response(JSON.stringify({ token, playerId }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}
