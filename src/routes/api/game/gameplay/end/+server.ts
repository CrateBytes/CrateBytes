import { runScript } from "../../../../../cloud/CloudScriptingHandler.js";
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

    //#region Scripting
    const script = await prisma.projectScript.findUnique({
        where: {
            projectId_eventType: {
                projectId: project.id,
                eventType: "GameplayEnd",
            },
        },
        select: {
            script: true,
        },
    });

    if (script) {
        const result = await runScript(script.script, {
            gameplayDuration: sessionDuration,
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

    await prisma.playerSession.update({
        where: { id: activeSession.id },
        data: { endTime: sessionEndTime },
    });

    await prisma.player.update({
        where: { id: player.id },
        data: {
            playTime: player.playTime + Math.floor(sessionDuration),
        },
    });

    return new Response(
        JSON.stringify({
            statusCode: 200,
            data: { message: "Session ended successfully", sessionDuration },
        })
    );
}
