import { getPosts } from "$lib/utils.js";

export async function GET({ url }) {
    const { posts } = await getPosts(-1);

    const headers = { "Content-Type": "application/xml" };
    const xml = `
		<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
			<channel>
				<title>CrateBytes</title>
				<description>CrateBytes offers an open-source backend solution designed to streamline game development. Simplify server management, user authentication, and more.</description>
				<link>${url.origin}</link>
				<atom:link href="${url.origin}/rss.xml" rel="self" type="application/rss+xml"/>
				${posts
                    .map(
                        (post) => `
						<item>
							<title>${post.title}</title>
							<description>${post.description}</description>
							<link>${url.origin}/blog/${post.slug}</link>
							<guid isPermaLink="true">${url.origin}/${post.slug}</guid>
							<pubDate>${new Date(post.date).toUTCString()}</pubDate>
                            <author>${post.author}</author>
                            <media:thumbnail url="${post.thumbnail}" />
						</item>
					`
                    )
                    .join("")}
			</channel>
		</rss>
	`.trim();

    return new Response(xml, { headers });
}
