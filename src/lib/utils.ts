import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
    y?: number;
    x?: number;
    start?: number;
    duration?: number;
};

export const flyAndScale = (
    node: Element,
    params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
    const style = getComputedStyle(node);
    const transform = style.transform === "none" ? "" : style.transform;

    const scaleConversion = (
        valueA: number,
        scaleA: [number, number],
        scaleB: [number, number]
    ) => {
        const [minA, maxA] = scaleA;
        const [minB, maxB] = scaleB;

        const percentage = (valueA - minA) / (maxA - minA);
        const valueB = percentage * (maxB - minB) + minB;

        return valueB;
    };

    const styleToString = (
        style: Record<string, number | string | undefined>
    ): string => {
        return Object.keys(style).reduce((str, key) => {
            if (style[key] === undefined) return str;
            return str + `${key}:${style[key]};`;
        }, "");
    };

    return {
        duration: params.duration ?? 200,
        delay: 0,
        css: (t) => {
            const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
            const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
            const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

            return styleToString({
                transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                opacity: t,
            });
        },
        easing: cubicOut,
    };
};

const POSTS_PER_PAGE = 12;
export async function getPosts(page: number) {
    let posts: App.Post[] = [];

    const paths = import.meta.glob("/src/posts/*.md", { eager: true });

    for (const path in paths) {
        const file = paths[path];
        const slug = path.split("/").at(-1)?.replace(".md", "");

        if (file && typeof file === "object" && "metadata" in file && slug) {
            const metadata = file.metadata as Omit<App.Post, "slug">;
            const post = { ...metadata, slug } satisfies App.Post;
            post.published && posts.push(post);
        }
    }

    posts = posts.sort(
        (first, second) =>
            new Date(second.date).getTime() - new Date(first.date).getTime()
    );

    if (page == -1) {
        return {
            posts,
            totalPosts: posts.length,
            pages: Math.ceil(posts.length / POSTS_PER_PAGE),
        };
    }

    const SlicedPosts = posts.slice(
        page * POSTS_PER_PAGE,
        (page + 1) * POSTS_PER_PAGE
    );

    return {
        posts: SlicedPosts,
        totalPosts: posts.length,
        pages: Math.ceil(posts.length / POSTS_PER_PAGE),
    };
}
