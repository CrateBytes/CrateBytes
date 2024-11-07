import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "../../../../../prisma.js";
import { runScript } from "../../../../../cloud/CloudScriptingHandler.js";

export async function DELETE({ locals, params, request }) {
    const playerId = locals.user.playerId;
    const projectKey = locals.user.projectKey;

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
                eventType: "MetadataDelete",
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
            data:
                player.PlayerCustomData.find(
                    (customData) => customData.projectId === project.id
                )?.data || "",
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

    await prisma.playerCustomData.delete({
        where: {
            playerId_projectId: {
                playerId,
                projectId: project.id,
            },
        },
    });

    return new Response(
        JSON.stringify({
            statusCode: 200,
            data: { message: "Deleted" },
        })
    );
}
