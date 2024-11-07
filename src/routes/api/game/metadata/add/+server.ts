import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "../../../../../prisma.js";
import { runScript } from "../../../../../cloud/CloudScriptingHandler.js";

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

    let data = body?.data;
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

    //#region Scripting

    const player = await prisma.player.findUnique({
        where: {
            playerId,
            projectId: project.id,
        },
        include: {
            PlayerCustomData: true,
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

    const script = await prisma.projectScript.findUnique({
        where: {
            projectId_eventType: {
                projectId: project.id,
                eventType: "MetadataAdd",
            },
        },
        select: {
            script: true,
        },
    });

    if (script) {
        const result = await runScript(script.script, {
            player: {
                playerId: player.playerId,
                guest: player.guest,
                playTime: player.playTime,
                lastPlayed: player.lastPlayed,
                data: data,
                oldData:
                    player.PlayerCustomData.find(
                        (d) => d.projectId === project.id
                    )?.data || "",
            },
        }).catch((error) => {
            return new Response(
                JSON.stringify({
                    statusCode: 500,
                    error: {
                        message: "Error running script",
                        error,
                    },
                })
            );
        });

        if (result == null || typeof result !== "string") {
            return new Response(
                JSON.stringify({
                    statusCode: 400,
                    error: {
                        message: "Script must return string",
                    },
                })
            );
        }

        data = result;
    }
    //#endregion

    const playerData = await prisma.playerCustomData.upsert({
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
            data: { data: playerData.data },
        })
    );
}
