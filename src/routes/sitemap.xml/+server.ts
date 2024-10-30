import { getPosts } from "$lib/utils";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {
    const siteUrl = "https://cratebytes.com";
    const posts = await getPosts(-1);
    const routes = [
        { path: "/", lastmod: "2024-10-30" },
        { path: "/blog", lastmod: "2024-10-30" },
        { path: "/privacy", lastmod: "2024-10-30" },
    ];

    posts.posts.forEach((post) => {
        routes.push({
            path: "/blog/" + post.slug,
            lastmod: new Date(post.date).toISOString().split("T")[0],
        });
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8" ?>
                    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                    ${routes
                        .map((route) => {
                            const priority =
                                route.path === "/"
                                    ? 1.0
                                    : 1.0 - route.path.split("/").length * 0.1;
                            return `
                        <url>
                        <loc>${siteUrl}${route.path}</loc>
                        <lastmod>${route.lastmod}</lastmod>
                        <priority>${priority}</priority>
                        </url>`;
                        })
                        .join("")}
                    </urlset>`;

    return new Response(sitemap, {
        headers: {
            "Content-Type": "application/xml",
        },
    });
};
