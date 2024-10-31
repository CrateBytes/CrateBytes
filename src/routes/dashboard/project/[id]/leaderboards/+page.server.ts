import { redirect, type Actions } from "@sveltejs/kit";
import { prisma } from "../../../../../prisma";
import type { PageServerLoad } from "./$types";
import {
    createLeaderboardSchema,
    deleteLeaderboardSchema,
} from "../../../../../schema";
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

    const leaderboards = await prisma.leaderboard.findMany({
        where: {
            projectId: project.id,
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
        leaderboards: leaderboards,
        CreateLeaderboardForm: await superValidate(
            zod(createLeaderboardSchema)
        ),
        DeleteLeaderboardForm: await superValidate(
            zod(deleteLeaderboardSchema)
        ),
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    CreateLeaderboard: async (event) => {
        const CreateLeaderboardForm = await superValidate(
            event,
            zod(createLeaderboardSchema)
        );

        const session = await event.locals.auth();
        if (!session) {
            return fail(401, {
                CreateLeaderboardForm,
            });
        }

        if (!CreateLeaderboardForm.valid) {
            return fail(400, {
                CreateLeaderboardForm,
            });
        }

        const project = await prisma.project.findUnique({
            where: {
                id: CreateLeaderboardForm.data.projectId,
                ownerId: session.user?.id,
            },
        });

        if (!project) {
            return fail(404, {
                CreateLeaderboardForm,
            });
        }

        const leaderboard = await prisma.leaderboard
            .create({
                data: {
                    name: CreateLeaderboardForm.data.name,
                    description: CreateLeaderboardForm.data.description,
                    project: {
                        connect: {
                            id: project.id,
                        },
                    },
                },
            })
            .catch((error) => {
                console.log(error);
            });

        return {
            CreateLeaderboardForm,
            leaderboardId: leaderboard?.id,
        };
    },
    DeleteLeaderboard: async (event) => {
        const DeleteLeaderboardForm = await superValidate(
            event,
            zod(deleteLeaderboardSchema)
        );

        const session = await event.locals.auth();
        if (!session) {
            return fail(401, {
                DeleteLeaderboardForm,
            });
        }

        if (!DeleteLeaderboardForm.valid) {
            return fail(400, {
                DeleteLeaderboardForm,
            });
        }

        const leaderboard = await prisma.leaderboard.findUnique({
            where: {
                id: DeleteLeaderboardForm.data.leaderboardId,
            },
            include: {
                project: true,
            },
        });

        if (!leaderboard) {
            return fail(404, {
                DeleteLeaderboardForm,
            });
        }

        if (leaderboard.project.ownerId !== session.user?.id) {
            return fail(403, {
                DeleteLeaderboardForm,
            });
        }

        await prisma.leaderboardEntry.deleteMany({
            where: {
                leaderboardId: DeleteLeaderboardForm.data.leaderboardId,
            },
        });

        await prisma.leaderboard
            .delete({
                where: {
                    id: DeleteLeaderboardForm.data.leaderboardId,
                    projectId: leaderboard.project.id,
                },
            })
            .catch((error) => {
                console.log(error);
            });

        return {
            DeleteLeaderboardForm,
        };
    },
};
