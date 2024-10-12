import { redirect } from "@sveltejs/kit";
import { prisma } from "../../../../../../prisma";
import type { PageServerLoad } from "./$types";
import { deleteLeaderboardEntrySchema } from "../../../../../../schema";
import { fail, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

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

    const leaderboard = await prisma.leaderboard.findUnique({
        where: {
            id: params.leaderboardId,
        },
    });

    if (!leaderboard) {
        throw redirect(302, `/dashboard/project/${params.id}/leaderboards`);
    }

    return {
        project: {
            id: project.id,
            name: project.name,
            description: project.description,
        },
        leaderboard: {
            id: leaderboard.id,
            name: leaderboard.name,
            description: leaderboard.description,
        },
        owner: {
            name: project.owner.name,
            image: project.owner.image,
        },
        DeleteLeaderboardEntryForm: await superValidate(
            zod(deleteLeaderboardEntrySchema)
        ),
    };
}) satisfies PageServerLoad;
