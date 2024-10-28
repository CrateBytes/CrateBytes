import { redirect } from "@sveltejs/kit";
import { prisma } from "../../../../../prisma";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params, locals }) => {
    const session = await locals.auth();

    if (!session) {
        throw redirect(302, "/login");
    }

    if (!params.id) {
        throw redirect(302, "/dashboard");
    }

    const project = await prisma.project.findUnique({
        where: {
            id: params.id,
            ownerId: session.user?.id,
        },
        include: {
            owner: true,
        },
    });

    if (!project) {
        throw redirect(302, "/dashboard");
    }

    const players = await prisma.player.findMany({
        where: {
            projectId: params.id,
            lastPlayed: {
                gt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        },
        select: {
            guest: true,
            playTime: true,
            lastPlayed: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    // Get player count and average play time for each day
    const Days: {
        day: Date;
        count: number;
        averagePlayTime: number;
    }[] = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(new Date().getTime() - i * 24 * 60 * 60 * 1000);
        const count = players.filter(
            (player) => player.lastPlayed.toDateString() === date.toDateString()
        ).length;
        const averagePlayTime =
            players
                .filter(
                    (player) =>
                        player.lastPlayed.toDateString() === date.toDateString()
                )
                .reduce((acc, player) => {
                    return acc + player.playTime;
                }, 0) / count;

        Days.push({
            day: date,
            count,
            averagePlayTime: isNaN(averagePlayTime) ? 0 : averagePlayTime,
        });
    }

    const TotalPlayerCount = await prisma.player.count({
        where: {
            projectId: params.id,
        },
    });

    const AveragePlayTime =
        players.reduce((acc, player) => {
            return acc + player.playTime;
        }, 0) / players.length;

    const CurrentActivePlayers = await prisma.playerSession.count({
        where: {
            projectId: params.id,
            endTime: null,
            lastHeartbeat: {
                gt: new Date(new Date().getTime() - 10 * 60 * 1000),
            },
        },
    });

    return {
        project: {
            id: project.id,
            name: project.name,
            description: project.description,
        },
        owner: {
            name: project.owner.name,
            image: project.owner.image,
        },
        Days,
        TotalPlayerCount,
        AveragePlayTime,
        CurrentActivePlayers,
    };
}) satisfies PageServerLoad;
