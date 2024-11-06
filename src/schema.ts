import { z } from "zod";

//#region project
export const createProjectSchema = z.object({
    name: z.string().min(1).max(50),
    description: z.string().min(1).max(255),
});

export const deleteProjectSchema = z.object({
    ProjectId: z.string(),
});

export const updateProjectGeneralSchema = z.object({
    projectId: z.string(),
    name: z.string().min(1).max(50),
    description: z.string().min(1).max(255),
    appid: z.number(),
    publisherKey: z.string(),
});
// #endregion

//#region leaderboard
export const createLeaderboardSchema = z.object({
    projectId: z.string(),
    name: z.string().min(1).max(50),
    description: z.string().min(1).max(255),
});

export const deleteLeaderboardSchema = z.object({
    leaderboardId: z.string(),
});

export const deleteLeaderboardEntrySchema = z.object({
    leaderboardId: z.string(),
    playerId: z.string(),
});
//#endregion

//#region Scripts
export const editScriptSchema = z.object({
    projectId: z.string(),
    eventType: z.string(),
    script: z.string(),
});

export const testScriptSchema = z.object({
    projectId: z.string(),
    eventType: z.string(),
    script: z.string(),
    inputs: z.string(),
});
//#endregion

export type CreateProjectSchema = typeof createProjectSchema;
export type DeleteProjectSchema = typeof deleteProjectSchema;
export type UpdateProjectGeneralSchema = typeof updateProjectGeneralSchema;

export type CreateLeaderboardSchema = typeof createLeaderboardSchema;
export type DeleteLeaderboardSchema = typeof deleteLeaderboardSchema;
export type DeleteLeaderboardEntrySchema = typeof deleteLeaderboardEntrySchema;

export type EditScriptSchema = typeof editScriptSchema;
export type TestScriptSchema = typeof testScriptSchema;
