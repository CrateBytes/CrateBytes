import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const args = process.argv.slice(2);

const projectId = args[0];

async function main() {
    await prisma.leaderboardEntry.deleteMany({
        where: {
            leaderboard: {
                projectId: projectId,
            },
        },
    });

    await prisma.playerSession.deleteMany({
        where: {
            projectId: projectId,
        },
    });

    await prisma.playerCustomData.deleteMany({
        where: {
            projectId: projectId,
        },
    });

    await prisma.player.deleteMany({
        where: {
            projectId: projectId,
        },
    });
}

main()
    .catch((e) => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
