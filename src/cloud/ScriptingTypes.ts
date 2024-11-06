export enum EventType {
    GameplayStart = "GameplayStart",
    GameplayEnd = "GameplayEnd",
    LeaderboardSubmit = "LeaderboardSubmit",
    MetadataAdd = "MetadataAdd",
    MetadataDelete = "MetadataDelete",
}

const fooPlayer = {
    playerId: "bcbmvy059xvmz5epv50vqokd",
    guest: true,
    playTime: 3600,
    lastPlayed: new Date(),
};

export const eventBaseCode: {
    [key: string]: {
        name: string;
        description: string;
        code: string;
        inputs: string;
    };
} = {
    [EventType.GameplayStart]: {
        name: "Gameplay Start",
        description: "This script is ran when gameplay starts for a player",
        code: `/**
 * This script is ran when gameplay starts for a player
 *
 * @param {Object} inputs - The input parameters for the event.
 * @param {Object} inputs.player - The player object containing player information.
 * @param {string} inputs.player.playerId - The unique identifier for the player.
 * @param {boolean} inputs.player.guest - Indicates if the player is a guest.
 * @param {number} inputs.player.playTime - The duration of playtime in seconds.
 * @param {Date} inputs.player.lastPlayed - The timestamp of the last gameplay session.
 * @returns {Promise<boolean>} - Return true or false, false will stop the event
*/
async function code(inputs) {
    return true;
}`,
        inputs: JSON.stringify({ player: fooPlayer }, null, 4),
    },

    [EventType.GameplayEnd]: {
        name: "Gameplay End",
        description: "This script is ran when gameplay ends for a player",
        code: `/**
 * This script is ran when gameplay ends for a player
 *
 * @param {Object} inputs - The input parameters for the event
 * @param {string} inputs.gameplayDuration - The duration of the gameplay session in seconds
 * @param {Object} inputs.player - The player object containing player information.
 * @param {string} inputs.player.playerId - The unique identifier for the player.
 * @param {boolean} inputs.player.guest - Indicates if the player is a guest.
 * @param {number} inputs.player.playTime - The duration of playtime in seconds.
 * @param {Date} inputs.player.lastPlayed - The timestamp of the last gameplay session.
 * @returns {Promise<boolean>} - Return true or false, false will stop the event and prevents saving the gameplay session
*/
async function code(inputs) {
    return true;
}`,
        inputs: JSON.stringify(
            { gameplayDuration: 3600, player: fooPlayer },
            null,
            4
        ),
    },

    [EventType.LeaderboardSubmit]: {
        name: "Leaderboard Submit",
        description:
            "This script is ran when a player submits a score to the leaderboard",
        code: `/**
 * This script is ran when a player submits a score to the leaderboard
 *
 * @param {Object} inputs - The input parameters for the event
 * @param {string} inputs.leaderboard - The ID of the leaderboard
 * @param {string} inputs.leaderboard.id - The ID of the leaderboard
 * @param {string} inputs.leaderboard.name - The name of the leaderboard
 * @param {number} inputs.score - The score submitted by the player
 * @param {Object} inputs.player - The player object containing player information.
 * @param {string} inputs.player.playerId - The unique identifier for the player.
 * @param {boolean} inputs.player.guest - Indicates if the player is a guest.
 * @param {number} inputs.player.playTime - The duration of playtime in seconds.
 * @param {Date} inputs.player.lastPlayed - The timestamp of the last gameplay session.
 * @returns {Promise<number>} - Return the score to be saved to the leaderboard, return -1 to prevent saving the score
*/
async function code(inputs) {
    return inputs.score;
}`,
        inputs: JSON.stringify(
            {
                leaderboard: {
                    id: "cm2m56mkq0006bj6w4qksjlgq",
                    name: "foo leaderboard",
                },
                score: 100,
                player: fooPlayer,
            },
            null,
            4
        ),
    },

    [EventType.MetadataAdd]: {
        name: "Metadata Add",
        description:
            "This script is ran when metadata is added/updated for a player",
        code: `/**
 * This script is ran when metadata is added/updated for a player
 *
 * @param {Object} inputs - The input parameters for the event
 * @param {string} inputs.data - the metadata to be added/updated
 * @param {string} inputs.oldData - the previous metadata
 * @param {Object} inputs.player - The player object containing player information.
 * @param {string} inputs.player.playerId - The unique identifier for the player.
 * @param {boolean} inputs.player.guest - Indicates if the player is a guest.
 * @param {number} inputs.player.playTime - The duration of playtime in seconds.
 * @param {Date} inputs.player.lastPlayed - The timestamp of the last gameplay session.
 * @returns {Promise<string>} - Return the metadata to be saved, return null to prevent saving the metadata
*/
async function code(inputs) {
    return inputs.data;
}`,
        inputs: JSON.stringify(
            {
                data: "metadata",
                oldData: "old metadata",
                player: fooPlayer,
            },
            null,
            4
        ),
    },

    [EventType.MetadataDelete]: {
        name: "Metadata Delete",
        description: "This script is ran when metadata is deleted for a player",
        code: `/**
 * This script is ran when metadata is deleted for a player
 *
 * @param {Object} inputs - The input parameters for the event
 * @param {string} inputs.data - the metadata to be deleted
 * @param {Object} inputs.player - The player object containing player information.
 * @param {string} inputs.player.playerId - The unique identifier for the player.
 * @param {boolean} inputs.player.guest - Indicates if the player is a guest.
 * @param {number} inputs.player.playTime - The duration of playtime in seconds.
 * @param {Date} inputs.player.lastPlayed - The timestamp of the last gameplay session.
 * @returns {Promise<boolean>} - Return true to delete the metadata, return false to prevent deleting the metadata
*/
async function code(inputs) {
    return true;
}`,
        inputs: JSON.stringify(
            {
                data: "metadata",
                player: fooPlayer,
            },
            null,
            4
        ),
    },
};
