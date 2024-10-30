import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "../../../../../prisma.js";

export async function DELETE({ locals, params, request }) {
    const playerId = locals.user.playerId;
    const projectKey = locals.user.projectKey;

    if (!projectKey || !playerId) {
        return new Response(
            JSON.stringify({
                status: 400,
                error: "Project key or player id not provided",
                data: {},
            }),
            { status: 400 }
        );
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
        return new Response(
            JSON.stringify({
                status: 404,
                error: "Project not found",
                data: {},
            }),
            { status: 404 }
        );
    }

    await prisma.playerCustomData.delete({
        where: {
            playerId_projectId: {
                playerId,
                projectId: project.id,
            },
        },
    });

    return new Response(
        JSON.stringify({
            status: 200,
            error: null,
            data: { message: "Deleted" },
        }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
    );
}
