import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "../../../../../../prisma.js";
import { runScript } from "../../../../../../cloud/CloudScriptingHandler.js";

export async function POST({ locals, params, request }) {
    const { id } = params;
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

    let score = body?.score;
    const playerId = locals.user.playerId;
    const projectKey = locals.user.projectKey;

    if (!projectKey || !playerId || score == null) {
        return new Response(
            JSON.stringify({
                statusCode: 400,
                error: {
                    message: "Project key, player id, or score not provided",
                },
            }),
            { status: 400 }
        );
    }

    const leaderboard = await prisma.leaderboard.findUnique({
        where: {
            id,
            project: {
                projectKey,
            },
        },
    });

    if (!leaderboard) {
        return new Response(
            JSON.stringify({
                statusCode: 404,
                error: {
                    message: "Leaderboard not found",
                },
            })
        );
    }

    //#region Scripting
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

    const script = await prisma.projectScript.findUnique({
        where: {
            projectId_eventType: {
                projectId: project.id,
                eventType: "LeaderboardSubmit",
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
            leaderboard: {
                id: leaderboard.id,
                name: leaderboard.name,
            },
            score: score,
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

        if (typeof result === "number") {
            if (result === -1) {
                return new Response(
                    JSON.stringify({
                        statusCode: 400,
                        error: {
                            message: "Script returned -1",
                        },
                    })
                );
            }

            score = result;
        } else {
            return new Response(
                JSON.stringify({
                    statusCode: 400,
                    error: {
                        message: "Script must return number",
                    },
                })
            );
        }
    }
    //#endregion

    await prisma.leaderboardEntry.upsert({
        where: {
            playerId_leaderboardId: {
                playerId,
                leaderboardId: leaderboard.id,
            },
        },
        update: { score },
        create: {
            score,
            playerId,
            leaderboardId: leaderboard.id,
        },
    });

    return new Response(
        JSON.stringify({
            statusCode: 200,
            data: { message: "Score submitted" },
        })
    );
}
