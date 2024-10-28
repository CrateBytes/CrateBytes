import { SvelteKitAuth } from "@auth/sveltekit";
import GitHub from "@auth/sveltekit/providers/github";
import {
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    AUTH_SECRET,
} from "$env/static/private";
import discord from "@auth/sveltekit/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import google from "@auth/sveltekit/providers/google";

// @ts-ignore
export const { handle, signIn, signOut } = SvelteKitAuth(function () {
    const authOptions = {
        adapter: PrismaAdapter(prisma),
        providers: [
            GitHub({
                clientId: GITHUB_CLIENT_ID,
                clientSecret: GITHUB_CLIENT_SECRET,
            }),
            discord({
                clientId: DISCORD_CLIENT_ID,
                clientSecret: DISCORD_CLIENT_SECRET,
            }),
            google({
                clientId: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
            }),
        ],
        secret: AUTH_SECRET,
        session: {
            strategy: "database",
            maxAge: 30 * 24 * 60 * 60,
        },
        trustHost: true,
        callbacks: {
            session: async ({ session, user }: any) => {
                if (session?.user) {
                    session.user.id = user.id;
                }

                return {
                    user: {
                        id: session.user.id,
                        name: session.user.name,
                        email: session.user.email,
                        image: session.user.image,
                    },
                    expires: session.expires,
                };
            },
        },
    };
    return authOptions;
});
