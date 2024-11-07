import { VerifyToken } from "$lib/jwt";
import { handle as AuthHandle } from "./auth";

const API_AUTH_URLS = ["/api/game/gameplay", "/api/game/metadata"];

const isAuthUrl = (url: string) => {
    for (const authUrl of API_AUTH_URLS) {
        if (
            url.startsWith(authUrl) ||
            (url.startsWith("/api/game/leaderboards") && url.endsWith("submit"))
        ) {
            return true;
        }
    }

    return false;
};

export async function handle({ event, resolve }) {
    if (!event.url.pathname.startsWith("/api")) {
        return AuthHandle({ event, resolve });
    }

    if (isAuthUrl(event.url.pathname)) {
        const token = event.request.headers
            .get("authorization")
            ?.replace("Bearer ", "");

        if (token) {
            const payload = VerifyToken(token);
            event.locals.user = payload;
        } else {
            return new Response("Unauthorized", {
                status: 401,
            });
        }
    }

    return await resolve(event);
}
