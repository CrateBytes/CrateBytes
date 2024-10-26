import { PrismaClient } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";

const prisma = new PrismaClient();
const args = process.argv.slice(2);

const projectId = args[0];
const userAmount = args[1];

if (!projectId || !userAmount) {
    console.error("Please provide a projectId and userAmount");
    process.exit(1);
}

async function main() {
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
    });

    if (!project) {
        console.error("Project not found");
        process.exit(1);
    }

    const players = [];
    for (let i = 0; i < userAmount; i++) {
        const playerId = createId();
        players.push({
            id: playerId,
            playerId: playerId,
            guest: Math.floor(Math.random() * 2) === 0,
            playTime: Math.floor(Math.random() * 1000),
            lastPlayed: new Date(
                Date.now() -
                    Math.floor(Math.random() * (7 * 24 * 60 * 60 * 1000))
            ),
            projectId: project.id,
        });
    }

    await prisma.player.createMany({
        data: players,
    });
}

main()
    .catch((e) => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
