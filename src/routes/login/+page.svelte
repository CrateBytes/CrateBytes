<script lang="ts">
    import NewNavbar from "$lib/components/NewNavbar.svelte";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import { signIn } from "@auth/sveltekit/client";
    import Icon from '@iconify/svelte';

</script>

<NewNavbar />
<div class="relative h-screen">

    <div class="flex items-center justify-center h-4/5">
        <Card.Root class="w-5/6 sm:w-1/2 max-w-md py-10">
            <Card.Header>
                <Card.Title class="text-center mb-5">Login</Card.Title>
            </Card.Header>
            <Card.Content class="flex flex-col gap-4">
                <div class="m-y-4">
                    <Button class="w-full flex items-center justify-center gap-2" on:click={ () => signIn("google")}>
                    <Icon icon="mdi:google" class="w-5 h-5" />
                    <p class="text-foreground"> Login with Google </p>
                    </Button>
                </div>

                <div class="m-y-4">
                    <Button class="w-full flex items-center justify-center gap-2" on:click={ () => signIn("github")}>
                    <Icon icon="mdi:github" class="w-5 h-5" />
                    <p class="text-foreground"> Login with GitHub </p>
                    </Button>
                </div>
                
                <div class="m-y-4">
                    <Button class="w-full flex items-center justify-center gap-2" on:click={ () => signIn("discord")}>
                    <Icon icon="mdi:discord" class="w-5 h-5" />
                    <p class="text-foreground"> Login with Discord </p>
                    </Button>
                </div>
            </Card.Content>
            <Card.Footer>
            </Card.Footer>
        </Card.Root>
    </div>
</div>
