import type { RequestHandler } from "@sveltejs/kit";
import { GenerateToken } from "$lib/jwt";
import { prisma } from "../../../../../prisma";
import { createId } from "@paralleldrive/cuid2";
import axios from "axios";

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

    const steamAuthTicket = body.steamAuthTicket;
    const projectKey = body.projectKey;

    if (!projectKey || !steamAuthTicket) {
        return new Response(
            JSON.stringify({
                statusCode: 400,
                error: {
                    message: "Project key or steam auth ticket not provided",
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

    const playerId = await AuthSteam(steamAuthTicket, projectKey);

    if (playerId instanceof Response) {
        return playerId; // Return early if AuthSteam returns a response object (error).
    }

    const token = GenerateToken({ playerId, projectKey: project.projectKey });

    const player = await prisma.player.upsert({
        create: {
            id: playerId,
            playerId,
            guest: false,
            playTime: 0,
            lastPlayed: new Date(),
            project: {
                connect: { projectKey },
            },
        },
        update: { lastPlayed: new Date() },
        where: { playerId },
    });

    return new Response(
        JSON.stringify({
            statusCode: 200,
            data: { token, playerId },
        }),
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
}

async function AuthSteam(steamAuthTicket: string, projectKey: string) {
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

    if (project.steamPublisherKey === null) {
        return new Response(
            JSON.stringify({
                statusCode: 400,
                error: {
                    message: "Project does not have steam publisher key",
                },
            })
        );
    }

    if (project.steamAppId === null) {
        return new Response(
            JSON.stringify({
                statusCode: 400,
                error: {
                    message: "Project does not have steam app id",
                },
            })
        );
    }

    const steamAuthResponse = await axios.get<{
        response: {
            params: {
                result: string;
                steamid: string;
                ownersteamid: string;
                vacbanned: boolean;
                publisherbanned: boolean;
            };
        };
    }>(
        `https://api.steampowered.com/ISteamUserAuth/AuthenticateUserTicket/v1/`,
        {
            params: {
                key: project.steamPublisherKey,
                appid: project.steamAppId,
                ticket: steamAuthTicket,
                identity: "login",
            },
        }
    );

    if (steamAuthResponse.data.response.params.result !== "OK") {
        return new Response(
            JSON.stringify({
                statusCode: 401,
                error: {
                    message: "Steam authentication failed",
                },
            })
        );
    }

    return steamAuthResponse.data.response.params.steamid;
}
