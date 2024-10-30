import type { RequestHandler } from "@sveltejs/kit";
import { GenerateToken } from "$lib/jwt";
import { prisma } from "../../../../prisma";
import { createId } from "@paralleldrive/cuid2";
import axios from "axios";

export async function POST(event) {
    const body = await event.request.json().catch(() => {
        return new Response(
            JSON.stringify({
                status: 400,
                error: "Invalid JSON",
                data: {},
            }),
            { status: 400 }
        );
    });

    if (!body) return body; // Return early if the body is an error response.

    const steamAuthTicket = body.steamAuthTicket;
    const projectKey = body.projectKey;

    if (!projectKey || !steamAuthTicket) {
        return new Response(
            JSON.stringify({
                status: 400,
                error: "Project key or steam auth ticket not provided",
                data: {},
            }),
            { status: 400 }
        );
    }

    const project = await prisma.project.findUnique({
        where: { projectKey },
    });

    if (!project) {
        return new Response(
            JSON.stringify({
                status: 404,
                error: "Project not found",
                data: {},
            }),
            { status: 404 }
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
            status: 200,
            error: null,
            data: { token, playerId },
        }),
        {
            status: 200,
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
                status: 404,
                error: "Project not found",
                data: {},
            }),
            { status: 404 }
        );
    }

    if (project.steamPublisherKey === null) {
        return new Response(
            JSON.stringify({
                status: 400,
                error: "Project does not have steam publisher key",
                data: {},
            }),
            { status: 400 }
        );
    }

    if (project.steamAppId === null) {
        return new Response(
            JSON.stringify({
                status: 400,
                error: "Project does not have steam app id",
                data: {},
            }),
            { status: 400 }
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
                status: 401,
                error: "Steam authentication failed",
                data: {},
            }),
            { status: 401 }
        );
    }

    return steamAuthResponse.data.response.params.steamid;
}
