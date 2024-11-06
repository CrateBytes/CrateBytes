import { redirect, type Actions } from "@sveltejs/kit";
import { prisma } from "../../../../../prisma";
import type { PageServerLoad } from "./$types";
import { fail, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { ScriptEventType } from "@prisma/client";
import { editScriptSchema, testScriptSchema } from "../../../../../schema";
import { runScript } from "../../../../../cloud/CloudScriptingHandler";

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

    const scripts = await prisma.projectScript.findMany({
        where: {
            projectId: project.id,
        },
        select: {
            script: true,
            eventType: true,
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
        scripts: scripts,
        EditScriptSchema: await superValidate(zod(editScriptSchema)),
        TestScriptSchema: await superValidate(zod(testScriptSchema)),
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    SaveScript: async (event) => {
        const EditScriptSchema = await superValidate(
            event,
            zod(editScriptSchema)
        );

        const session = await event.locals.auth();
        if (!session) {
            return fail(401, {
                EditScriptSchema: EditScriptSchema,
            });
        }

        if (!EditScriptSchema.valid) {
            return fail(400, {
                EditScriptSchema: EditScriptSchema,
            });
        }

        const project = await prisma.project.findUnique({
            where: {
                id: EditScriptSchema.data.projectId,
            },
            select: {
                ownerId: true,
            },
        });

        if (!project) {
            return fail(404, {
                EditScriptSchema: EditScriptSchema,
            });
        }

        if (project.ownerId !== session.user?.id) {
            return fail(403, {
                EditScriptSchema: EditScriptSchema,
            });
        }

        if (
            Object.values(ScriptEventType).includes(
                EditScriptSchema.data.eventType as ScriptEventType
            ) === false
        ) {
            return fail(400, {
                EditScriptSchema: EditScriptSchema,
            });
        }

        await prisma.projectScript.upsert({
            where: {
                projectId_eventType: {
                    projectId: EditScriptSchema.data.projectId,
                    eventType: EditScriptSchema.data
                        .eventType as ScriptEventType,
                },
            },
            update: {
                script: EditScriptSchema.data.script,
            },
            create: {
                projectId: EditScriptSchema.data.projectId,
                eventType: EditScriptSchema.data.eventType as ScriptEventType,
                script: EditScriptSchema.data.script,
            },
        });

        return {
            EditScriptSchema,
        };
    },
    TestScript: async (event) => {
        const TestScriptSchema = await superValidate(
            event,
            zod(testScriptSchema)
        );

        const session = await event.locals.auth();
        if (!session) {
            return fail(401, {
                TestScriptSchema: TestScriptSchema,
            });
        }

        if (!TestScriptSchema.valid) {
            return fail(400, {
                TestScriptSchema: TestScriptSchema,
            });
        }

        const project = await prisma.project.findUnique({
            where: {
                id: TestScriptSchema.data.projectId,
            },
            select: {
                ownerId: true,
            },
        });

        if (!project) {
            return fail(404, {
                TestScriptSchema: TestScriptSchema,
            });
        }

        if (project.ownerId !== session.user?.id) {
            return fail(403, {
                TestScriptSchema: TestScriptSchema,
            });
        }

        if (
            Object.values(ScriptEventType).includes(
                TestScriptSchema.data.eventType as ScriptEventType
            ) === false
        ) {
            return fail(400, {
                TestScriptSchema: TestScriptSchema,
            });
        }

        try {
            const result = await runScript(
                TestScriptSchema.data.script,
                JSON.parse(TestScriptSchema.data.inputs)
            );

            return {
                TestScriptSchema,
                result,
            };
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);

            return fail(500, {
                TestScriptSchema: TestScriptSchema,
                error: errorMessage || "An error occurred",
            });
        }
    },
};
