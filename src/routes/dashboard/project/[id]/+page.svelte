<script lang="ts">
    import NewNavbar from '$lib/components/NewNavbar.svelte';

    export let data;

</script>

<svelte:head>
    <title>CrateBytes - {data.project.name}</title>
</svelte:head>

<NewNavbar id={data.project.id} />
<div class="md:ml-16">
    <main class="flex flex-row bg-background gap-4 h-full">
        <section class="flex flex-col gap-4 w-full my-4">
            <h1 class="text-4xl font-bold">{data.project.name}</h1>
        </section>
    </main>
</div>