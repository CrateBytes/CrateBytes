import { error } from "@sveltejs/kit";

export async function load({ params }) {
    try {
        const post = await import(`../../../posts/${params.slug}.md`);

        return {
            content: post.default,
            meta: post.metadata as App.Post,
        };
    } catch (e) {
        throw error(404, `Couldn't find post`);
    }
}
