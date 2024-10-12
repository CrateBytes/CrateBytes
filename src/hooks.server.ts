import { VerifyToken } from "$lib/jwt";
import { handle as AuthHandle } from "./auth";

export async function handle({ event, resolve }) {
    if (!event.url.pathname.startsWith("/api")) {
        return AuthHandle({ event, resolve });
    }

    if (event.url.pathname.startsWith("/api/game")) {
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
