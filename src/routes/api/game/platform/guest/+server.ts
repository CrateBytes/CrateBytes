import type { RequestHandler } from "@sveltejs/kit";
import { GenerateToken } from "$lib/jwt";
import { prisma } from "../../../../../prisma";
import { createId } from "@paralleldrive/cuid2";

export async function POST(event) {
    const body = await event.request.json().catch(() => {
        return new Response(
            JSON.stringify({
                statusCode: 400,
                error: {
                    message: "Invalid JSON",
                },
            })
        );
    });

    if (!body) return body;

    const projectKey = body.projectKey;
    if (!projectKey) {
        return new Response(
            JSON.stringify({
                statusCode: 400,
                error: {
                    message: "Project key not provided",
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

    // Login to existing Player
    if (body.playerId) {
        const player = await prisma.player.findUnique({
            where: {
                playerId: body.playerId,
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
            JSON.stringify({
                statusCode: 200,
                data: { token, playerId: player.playerId },
            }),
            {
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
            playerId,
            guest: true,
            playTime: 0,
            lastPlayed: new Date(),
            project: {
                connect: { projectKey },
            },
        },
    });

    return new Response(
        JSON.stringify({
            statusCode: 200,
            data: { token, playerId: player.playerId },
        }),
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
}
