import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "../../../../../prisma.js";
import { runScript } from "../../../../../cloud/CloudScriptingHandler.js";

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

    if (activeSession) {
        return new Response(
            JSON.stringify({
                statusCode: 400,
                error: {
                    message: "Session already active",
                },
            })
        );
    }

    //#region Scripting
    const script = await prisma.projectScript.findUnique({
        where: {
            projectId_eventType: {
                projectId: project.id,
                eventType: "GameplayStart",
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

        if (typeof result === "boolean" && !result) {
            return new Response(
                JSON.stringify({
                    statusCode: 400,
                    error: {
                        message: "Script returned false",
                    },
                })
            );
        }

        if (typeof result !== "boolean") {
            return new Response(
                JSON.stringify({
                    statusCode: 400,
                    error: {
                        message: "Script must return boolean",
                    },
                })
            );
        }
    }
    //#endregion

    await prisma.playerSession.create({
        data: {
            playerId: player.id,
            projectId: project.id,
            startTime: new Date(),
        },
    });

    return new Response(
        JSON.stringify({
            statusCode: 200,
            data: { message: "Session Started" },
        })
    );
}
