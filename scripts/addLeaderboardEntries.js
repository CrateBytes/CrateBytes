import { PrismaClient } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";

const prisma = new PrismaClient();
const args = process.argv.slice(2);

const leaderboardId = args[0];
const amount = args[1];

if (!leaderboardId || !amount) {
    console.error("Please provide a projectId and userAmount");
    process.exit(1);
}

async function main() {
    const leaderboard = await prisma.leaderboard.findUnique({
        where: {
            id: leaderboardId,
        },
    });

    if (!leaderboard) {
        console.error("leaderboard not found");
        process.exit(1);
    }

    const players = await prisma.player.findMany({
        where: {
            projectId: leaderboard.projectId,
        },
        take: parseInt(amount),
    });

    for (let i = 0; i < players.length; i++) {
        await prisma.leaderboardEntry
            .upsert({
                where: {
                    playerId_leaderboardId: {
                        playerId: players[i].id,
                        leaderboardId: leaderboard.id,
                    },
                },
                update: {
                    score: Math.floor(Math.random() * 1000),
                },
                create: {
                    score: Math.floor(Math.random() * 1000),
                    playerId: players[i].id,
                    leaderboardId: leaderboard.id,
                },
            })
            .catch((e) => {
                console.error(e);
            });
    }
}

main()
    .catch((e) => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
