import { redirect, type Actions } from "@sveltejs/kit";
import { prisma } from "../../../../../prisma";
import type { PageServerLoad } from "./$types";
import { fail, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { updateProjectGeneralSchema } from "../../../../../schema";

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

    return {
        project: {
            id: project.id,
            name: project.name,
            description: project.description,
            projectKey: project.projectKey,
            steamAppId: project.steamAppId,
            steamPublisherKey: project.steamPublisherKey,
        },
        owner: {
            name: project.owner.name,
            image: project.owner.image,
        },
        UpdateProjectGeneralSchema: await superValidate(
            zod(updateProjectGeneralSchema)
        ),
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    UpdateProjectGeneral: async (event) => {
        const UpdateProjectGeneralSchema = await superValidate(
            event,
            zod(updateProjectGeneralSchema)
        );

        const session = await event.locals.auth();
        if (!session) {
            return fail(401, {
                UpdateProjectGeneralSchema,
            });
        }

        if (!UpdateProjectGeneralSchema.valid) {
            return fail(400, {
                UpdateProjectGeneralSchema,
            });
        }

        const project = await prisma.project.findUnique({
            where: {
                id: UpdateProjectGeneralSchema.data.projectId,
            },
            select: {
                ownerId: true,
            },
        });

        if (!project) {
            return fail(404, {
                UpdateProjectGeneralSchema,
            });
        }

        if (project.ownerId !== session.user?.id) {
            return fail(403, {
                UpdateProjectGeneralSchema,
            });
        }

        await prisma.project.update({
            where: {
                id: UpdateProjectGeneralSchema.data.projectId,
            },
            data: {
                name: UpdateProjectGeneralSchema.data.name,
                description: UpdateProjectGeneralSchema.data.description,
                steamAppId: UpdateProjectGeneralSchema.data.appid,
                steamPublisherKey: UpdateProjectGeneralSchema.data.publisherKey,
            },
        });

        return {
            UpdateProjectGeneralSchema,
        };
    },
};
