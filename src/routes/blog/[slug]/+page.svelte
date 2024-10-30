<script lang="ts">
    import NewNavbar from '$lib/components/NewNavbar.svelte';
    import CustomFooter from '$lib/components/CustomFooter.svelte';
    import { page } from '$app/stores';
    import { Badge } from '$lib/components/ui/badge';
    import Icon from '@iconify/svelte';
    import StarUsButton from '$lib/components/StarUsButton.svelte';
    
    export let data;

</script>

<svelte:head>
    <title>{data.meta.title}</title>
    <meta name="description" content={data.meta.description} />
    <meta name="tags" content={data.meta.categories.join(", ")} />
    <meta name="author" content={data.meta.author} />
    <meta property="og:type" content="article" />
    <meta property="og:title" content={data.meta.title} />
    <meta property="og:description" content={data.meta.description} />
    <meta property="og:image" content={data.meta.thumbnail} />
    <meta property="og:url" content={$page.url.href} />
    
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={data.meta.title} />
    <meta name="twitter:description" content={data.meta.description} />
    <meta name="twitter:image" content={data.meta.thumbnail} />

    <meta name="keywords" content={data.meta.categories.join(", ")} />
    <meta name="date" content={data.meta.date} />
</svelte:head>

<NewNavbar />
<main class="w-full flex flex-col">
    <article class="flex-1 py-8 px-8 sm:px-16 md:px-32 lg:px-64 flex flex-col items-center gap-4">
        <hgroup class="flex flex-col gap-4">
            <h1 class="text-3xl font-bold text-center">{data.meta.title}</h1>
            
            <div class="flex justify-center gap-2">
                {#each data.meta.categories as category}
                    <Badge variant="secondary">{category}</Badge>
                {/each}
            </div>

            <div class="flex items-center justify-center">
                {data.meta.author}
                <p class="text-2xl font-bold mx-2">·</p>
                {new Date(data.meta.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })}
            </div>
        </hgroup>
    
        <img src={data.meta.thumbnail} alt={data.meta.slug} class="rounded-3xl w-full ">

        <div class="flex flex-col justify-center items-center">
            <div class="flex items-center gap-2">
                <a href={`https://twitter.com/intent/tweet?text=${data.meta.title}&url=${$page.url.href}`} target="_blank" rel="noopener noreferrer">
                    <Icon icon="mdi:twitter" class="w-6 h-6" />
                </a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${$page.url.href}`} target="_blank" rel="noopener noreferrer">
                    <Icon icon="mdi:facebook" class="w-6 h-6" />
                </a>
                <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${$page.url.href}&title=${data.meta.title}`} target="_blank" rel="noopener noreferrer">
                    <Icon icon="mdi:linkedin" class="w-6 h-6" />
                </a>
                <button class="cursor-pointer" on:click={() => navigator.clipboard.writeText($page.url.href)} title="Copy link">
                    <Icon icon="mdi:link" class="w-6 h-6" />
                </button>
            </div>
        </div>
        
        <div class="w-4/5 mt-4 ">
            <div class="reset">
                <svelte:component this={data.content} />
            </div>
        </div>
    </article>
</main>

<StarUsButton />
<CustomFooter />

<style>
    :global(.reset *){
        all: revert;
    }
</style>