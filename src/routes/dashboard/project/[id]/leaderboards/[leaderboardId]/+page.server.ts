import { redirect, type Actions } from "@sveltejs/kit";
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

export const actions: Actions = {
    DeleteLeaderboardEntry: async (event) => {
        const DeleteLeaderboardEntryForm = await superValidate(
            event,
            zod(deleteLeaderboardEntrySchema)
        );

        const session = await event.locals.auth();
        if (!session) {
            return fail(401, {
                DeleteLeaderboardEntryForm,
            });
        }

        if (!DeleteLeaderboardEntryForm.valid) {
            return fail(400, {
                DeleteLeaderboardEntryForm,
            });
        }

        const entry = await prisma.leaderboardEntry.findUnique({
            where: {
                playerId_leaderboardId: {
                    leaderboardId:
                        DeleteLeaderboardEntryForm.data.leaderboardId,
                    playerId: DeleteLeaderboardEntryForm.data.playerId,
                },
            },
            include: {
                leaderboard: true,
            },
        });
        console.log(entry);

        if (!entry) {
            return fail(404, {
                DeleteLeaderboardEntryForm,
            });
        }

        const leaderboard = await prisma.leaderboard.findUnique({
            where: {
                id: entry.leaderboardId,
            },
            include: {
                project: true,
            },
        });

        if (!leaderboard) {
            return fail(404, {
                DeleteLeaderboardEntryForm,
            });
        }

        if (leaderboard.project.ownerId !== session.user?.id) {
            return fail(403, {
                DeleteLeaderboardEntryForm,
            });
        }

        await prisma.leaderboardEntry
            .delete({
                where: {
                    playerId_leaderboardId: {
                        playerId: DeleteLeaderboardEntryForm.data.playerId,
                        leaderboardId:
                            DeleteLeaderboardEntryForm.data.leaderboardId,
                    },
                },
            })
            .catch((error) => {
                console.log(error);
            });

        return {
            DeleteLeaderboardEntryForm,
        };
    },
};
