// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            user: any;
        }
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
        interface Post {
            title: string;
            description: string;
            tags: string;
            author: string;
            thumbnail: string;
            date: string;
            categories: string[];
            published: boolean;
            slug: string;
        }
    }
}

export {};
