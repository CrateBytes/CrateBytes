import { fail, redirect, type Actions } from "@sveltejs/kit";
import { prisma } from "../../prisma";
import type { PageServerLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { createProjectSchema, deleteProjectSchema } from "../../schema";
import { getPosts } from "$lib/utils";

export const load = (async ({ parent }) => {
    const { session } = await parent();

    if (!session) {
        throw redirect(302, "/login");
    }

    const Projects = await prisma.project.findMany({
        where: {
            ownerId: session.user?.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    // TODO: pull from database
    const { posts } = await getPosts(0);

    return {
        Projects: Projects.map((project) => ({
            id: project.id,
            name: project.name,
            description: project.description,
        })),
        News: posts,
        CreateProjectForm: await superValidate(zod(createProjectSchema)),
        DeleteProjectForm: await superValidate(zod(deleteProjectSchema)),
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    CreateProject: async (event) => {
        const CreateProjectForm = await superValidate(
            event,
            zod(createProjectSchema)
        );

        const session = await event.locals.auth();
        if (!session) {
            return fail(401, {
                CreateProjectForm,
            });
        }

        if (!CreateProjectForm.valid) {
            return fail(400, {
                CreateProjectForm,
            });
        }

        await prisma.project
            .create({
                data: {
                    name: CreateProjectForm.data.name,
                    description: CreateProjectForm.data.description,
                    owner: {
                        connect: {
                            id: session.user?.id as string,
                        },
                    },
                    projectKey: createProjectKey(session.user?.id as string),
                },
            })
            .catch((error) => {
                console.log(error);
            });

        return {
            CreateProjectForm,
        };
    },
    DeleteProject: async (event) => {
        const DeleteProjectForm = await superValidate(
            event,
            zod(deleteProjectSchema)
        );

        const session = await event.locals.auth();
        if (!session) {
            return fail(401, {
                DeleteProjectForm,
            });
        }

        if (!DeleteProjectForm.valid) {
            return fail(400, {
                DeleteProjectForm,
            });
        }

        await prisma.project
            .delete({
                where: {
                    id: DeleteProjectForm.data.ProjectId,
                },
            })
            .catch((error) => {
                console.log(error);
            });

        return {
            DeleteProjectForm,
        };
    },
};

function randomString(length: number) {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        .split("")
        .sort(() => Math.random() - 0.5)
        .slice(0, length)
        .join("");
}

function createProjectKey(userId: string) {
    return `${userId}-${randomString(16)}`;
}
