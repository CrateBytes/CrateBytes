import { fail, redirect, type Actions } from "@sveltejs/kit";
import { prisma } from "../../prisma";
import type { PageServerLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { createProjectSchema, deleteProjectSchema } from "../../schema";

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
    const News: {
        title: string;
        description: string;
        link: string;
        image: string;
    }[] = [
        {
            title: "CrateBytes 2.0 Released: Next-gen Backend for Game Developers",
            description:
                "The CrateBytes team has just released version 2.0, bringing enhanced performance, scalability, and easier integration with popular game engines. Learn how these features can streamline your game development process.",
            link: "#",
            image: "https://placehold.co/960x540",
        },
        {
            title: "CrateBytes: Open-Source Backend That's Revolutionizing Indie Game Development",
            description:
                "Indie developers around the globe are switching to CrateBytes, the open-source backend solution designed to make game development more accessible and efficient. Discover how it works and why it's taking the industry by storm.",
            link: "#",
            image: "https://placehold.co/960x540",
        },
        {
            title: "Integrating CrateBytes with Unity and Unreal Engine: Step-by-Step Guide",
            description:
                "CrateBytes now offers seamless integration with Unity and Unreal Engine. Read our guide to learn how you can easily connect your backend to these powerful game development tools.",
            link: "#",
            image: "https://placehold.co/960x540",
        },
        {
            title: "CrateBytes Community Grows: Over 50,000 Developers Now Onboard",
            description:
                "CrateBytes celebrates a major milestone as its developer community surpasses 50,000 users. Find out what’s next for this rapidly growing open-source project.",
            link: "#",
            image: "https://placehold.co/960x540",
        },
        {
            title: "CrateBytes: Top Features You Should Be Using",
            description:
                "Not sure if you're taking full advantage of CrateBytes? This article highlights the top features that can boost your backend performance and simplify your workflow.",
            link: "#",
            image: "https://placehold.co/960x540",
        },
    ];

    return {
        Projects: Projects.map((project) => ({
            id: project.id,
            name: project.name,
            description: project.description,
        })),
        News,
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
