import type { RequestHandler } from "@sveltejs/kit";
import { GenerateToken } from "$lib/jwt";
import { prisma } from "../../../prisma";
import { createId } from "@paralleldrive/cuid2";
import axios from "axios";

export async function POST(event) {
    const body = await event.request.json().catch((error) => {
        return new Response("Invalid JSON", {
            status: 400,
        });
    });

    const steamAuthTicket = body.steamAuthTicket;
    const projectKey = body.projectKey;

    if (!projectKey || !steamAuthTicket) {
        return new Response("Project key or steam auth ticket not provided", {
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

    const playerId = await AuthSteam(steamAuthTicket, projectKey);

    if (playerId instanceof Response) {
        return playerId;
    }

    const token = GenerateToken({ playerId, projectKey: project.projectKey });

    const player = await prisma.player.upsert({
        create: {
            id: playerId,
            playerId: playerId,
            guest: false,
            playTime: 0,
            lastPlayed: new Date(),
            project: {
                connect: {
                    projectKey,
                },
            },
        },
        update: {
            lastPlayed: new Date(),
        },
        where: {
            playerId,
        },
    });

    return new Response(JSON.stringify({ token, playerId }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}

async function AuthSteam(steamAuthTicket: string, projectKey: string) {
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

    if (project.steamPublisherKey === null) {
        return new Response("Project does not have steam publisher key", {
            status: 400,
        });
    }

    if (project.steamAppId === null) {
        return new Response("Project does not have steam app id", {
            status: 400,
        });
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
        return new Response("Steam authentication failed", {
            status: 401,
        });
    }

    return steamAuthResponse.data.response.params.steamid;
}
