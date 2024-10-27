import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex } from "mdsvex";
import remarkUnwrapImages from "remark-unwrap-images";
import remarkToc from "remark-toc";
import rehypeSlug from "rehype-slug";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    extensions: [".svelte", ".md"],

    preprocess: [
        mdsvex({
            extensions: [".md"],
            remarkPlugins: [remarkUnwrapImages, remarkToc],
            rehypePlugins: [rehypeSlug],
        }),
        vitePreprocess(),
    ],

    kit: {
        adapter: adapter(),
        alias: {
            "@/*": "./path/to/lib/*",
        },
    },
};

export default config;
