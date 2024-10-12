<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import { signIn, signOut } from '@auth/sveltekit/client';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import NewNavbar from '$lib/components/NewNavbar.svelte';

</script>

<NewNavbar />
<div class="relative">

    <main class="flex flex-col-reverse md:flex-row items-center justify-between px-4 py-16 lg:py-24 bg-background gap-8">
        <div class="lg:w-1/2 text-left">
            <h1 class="text-3xl lg:text-5xl font-extrabold tracking-tight text-primary mb-4">
                Level Up Your Game Development with CrateBytes
            </h1>
            <p class="text-lg lg:text-xl text-muted-foreground mb-6">
                CrateBytes is the ultimate open-source backend solution, built to simplify life for game developers like you.
            </p>

            <div class="flex gap-4 flex-col md:flex-row">
                <Button variant="default" class="px-6 py-3 text-lg" on:click={() => goto('/dashboard')}>
                    {#if $page.data.session == null}
                        Get Started For Free
                    {:else}
                        Dashboard
                    {/if}
                </Button>
                <Button variant="outline" class="px-6 py-3 text-lg" on:click={() => goto('#')}>
                    Source Code
                </Button>
            </div>
        </div>

        <div class="w-1/4 justify-center lg:justify-end hidden md:flex">
            <img src="/CrateBytes.png" alt="CrateBytes" class="max-w-full object-cover rounded-md" />
        </div>
    </main>
</div>