<script lang="ts">
    import { page } from '$app/stores';
    import NewNavbar from '$lib/components/NewNavbar.svelte';
    import { onMount } from 'svelte';
    import * as Card from "$lib/components/ui/card";
    import CustomFooter from '$lib/components/CustomFooter.svelte';
    import { Badge } from "$lib/components/ui/badge";
    import * as Pagination from "$lib/components/ui/pagination";
    import ChevronLeft from "lucide-svelte/icons/chevron-left";
    import ChevronRight from "lucide-svelte/icons/chevron-right";
    import Icon from '@iconify/svelte';

    let posts: App.Post[] = [];
    let isFetching = false;
    let currentPageNumber = 0;
    let totalPages = 0;
    $: totalPosts = 0;
    $: perPage = 12;

    async function fetchLeaderboardEntries(page: number = 0) {
        isFetching = true;
        const res = await fetch(`/api/posts?page=${page}`);
        const json = await res.json();

        posts = json.posts;
        totalPages = json.pages;
        totalPosts = json.totalPosts;
        currentPageNumber = page;
        isFetching = false;
    }

    function handlePageChange(page: number) {
        fetchLeaderboardEntries(page);
    }

    onMount(async () => {
        await fetchLeaderboardEntries(0);
    });
</script>

<svelte:head>
    <title>CrateBytes - Blog</title>
    <meta name="description" content="Explore CrateBytes' blog for expert insights on game development, programming tips, and the latest news in the gaming industry. Join us!" />
    <meta name="keywords" content="game development, programming, CrateBytes news, gaming industry insights, programming tutorials" />
</svelte:head>

<NewNavbar />
<main class="flex flex-col bg-background gap-4 mb-10">
    <section class="flex flex-col gap-4 w-full mt-8 items-center">
        <h1 class="text-5xl font-bold">Blogs</h1>
        <span class="w-1/2 text-center text-muted-foreground">
            in our blogs, We talk about game development, programming, and other interesting topics. Also talk about CrateBytes news
        </span>
    </section>
    {#if isFetching}
        <div class="flex justify-center items-center h-64">
            <Icon icon="line-md:loading-loop" class="h-12 w-12 animate-spin" />
        </div>
    {:else}
        <section class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full p-8">
            {#each posts as post}
                <Card.Root>
                    <a href="/blog/{post.slug}">
                        <Card.Header>
                            <div class="w-full h-auto overflow-hidden border rounded-md mb-4">
                                <img src={post.thumbnail} alt={post.slug} class="w-full h-full object-fill transition-transform duration-300 hover:scale-110" />
                            </div>
                            <div class="flex gap-2 pb-2">
                                {#each post.categories as category}
                                    <Badge variant="secondary">{category}</Badge>
                                {/each}
                            </div>
                            <Card.Title>{post.title}</Card.Title>
                        </Card.Header>
                    </a>
                    <Card.Content>
                        <a href="/blog/{post.slug}">
                            <p class="text-muted-foreground">{post.description}</p>
                        </a>
                    </Card.Content>
                    <Card.Footer>
                        <p class="text-sm">{post.author}</p>
                        <p class="text-2xl font-bold mx-2">·</p>
                        <p class="text-sm">{new Date(post.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}</p>
                    </Card.Footer>
                </Card.Root>
            {/each}
        </section>
    {/if}
    <Pagination.Root count={totalPosts} {perPage} let:pages let:currentPage>
        <Pagination.Content>
            <Pagination.Item>
                <Pagination.PrevButton on:click={() => handlePageChange(currentPageNumber - 1)} disabled={currentPageNumber === 0}>
                    <ChevronLeft class="h-4 w-4" />
                    <span class="hidden sm:block">Previous</span>
                </Pagination.PrevButton>
            </Pagination.Item>
            {#each pages as page (page.key)}
                {#if page.type === "ellipsis"}
                    <Pagination.Item>
                        <Pagination.Ellipsis />
                    </Pagination.Item>
                {:else}
                    <Pagination.Item>
                        <Pagination.Link {page} isActive={currentPage === page.value} on:click={() => handlePageChange(page.value - 1)}>
                            {page.value}
                        </Pagination.Link>
                    </Pagination.Item>
                {/if}
            {/each}
            <Pagination.Item>
                <Pagination.NextButton on:click={() => handlePageChange(currentPageNumber + 1)} disabled={currentPageNumber === totalPages - 1}>
                    <span class="hidden sm:block">Next</span>
                    <ChevronRight class="h-4 w-4" />
                </Pagination.NextButton>
            </Pagination.Item>
        </Pagination.Content>
    </Pagination.Root>
</main>
<CustomFooter />