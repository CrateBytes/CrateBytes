import { getPosts } from "$lib/utils";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
    const page = url.searchParams.get("page") || "0";

    const parsedPage: number = parseInt(page);
    if (isNaN(parsedPage)) {
        return json({ error: "Invalid page number" });
    }

    const posts = await getPosts(parsedPage);

    return json(posts);
};
