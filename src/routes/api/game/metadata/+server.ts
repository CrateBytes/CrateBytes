import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "../../../../prisma.js";

export async function GET({ locals, params, request }) {
    const playerId = locals.user.playerId;
    const projectKey = locals.user.projectKey;

    if (!projectKey || !playerId) {
        return new Response("Project key or player id not provided", {
            status: 400,
        });
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
        return new Response("Project not found", {
            status: 404,
        });
    }

    const player = await prisma.playerCustomData.findUnique({
        where: {
            playerId_projectId: {
                playerId,
                projectId: project.id,
            },
        },
        select: {
            data: true,
        },
    });

    return new Response(JSON.stringify(player), {
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function PUT({ locals, params, request }) {
    const body = await request.json().catch((error) => {
        return new Response("Invalid JSON", {
            status: 400,
        });
    });

    const { data } = body;
    const playerId = locals.user.playerId;
    const projectKey = locals.user.projectKey;

    if (data.length > 1000) {
        return new Response("Data too long", {
            status: 400,
        });
    }

    if (!projectKey || !playerId) {
        return new Response("Project key or player id not provided", {
            status: 400,
        });
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
        return new Response("Project not found", {
            status: 404,
        });
    }

    const player = await prisma.playerCustomData.upsert({
        where: {
            playerId_projectId: {
                playerId: playerId,
                projectId: project.id,
            },
        },
        update: {
            data,
        },
        create: {
            playerId,
            projectId: project.id,
            data,
        },
    });

    return new Response(JSON.stringify(player), {
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function DELETE({ locals, params, request }) {
    const playerId = locals.user.playerId;
    const projectKey = locals.user.projectKey;

    if (!projectKey || !playerId) {
        return new Response("Project key or player id not provided", {
            status: 400,
        });
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
        return new Response("Project not found", {
            status: 404,
        });
    }

    await prisma.playerCustomData.delete({
        where: {
            playerId_projectId: {
                playerId,
                projectId: project.id,
            },
        },
    });

    return new Response("", {
        status: 204,
    });
}
