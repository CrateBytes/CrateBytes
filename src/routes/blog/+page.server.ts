import { getPosts } from "$lib/utils";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
    const postsData = await getPosts(0);

    return {
        posts: postsData.posts,
        totalPages: postsData.pages,
        totalPosts: postsData.totalPosts,
    };
}) satisfies PageServerLoad;
