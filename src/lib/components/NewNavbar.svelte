<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Avatar from "$lib/components/ui/avatar";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { mode, ModeWatcher, toggleMode } from "mode-watcher";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import Sun from "lucide-svelte/icons/sun";
    import Moon from "lucide-svelte/icons/moon";
    import Separator from "./ui/separator/separator.svelte";
    import { goto } from "$app/navigation";
    import Icon from "@iconify/svelte";
    import { page } from "$app/stores";
    import { signOut } from "@auth/sveltekit/client";

    export let id: string | undefined = undefined;

    const tabs = [
        // { name: "Home", href: `/dashboard/project/${id}`, icon: "mdi:home" },
        { name: "Analytics", href: `/dashboard/project/${id}/analytics`, icon: "mdi:analytics" },
        { name: "Leaderboards", href: `/dashboard/project/${id}/leaderboards` , icon: "mdi:medal"},
        { name: "Settings", href: `/dashboard/project/${id}/settings`, icon: "mdi:settings" },
    ];

    let sidebarOpen = false;
    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
    }

</script>
<ModeWatcher />

<div class="block h-20"> </div>
<div class="absolute w-full z-10 top-0">

    <header class="flex items-center justify-between py-5 px-3 bg-background drop-shadow-sm top-0 left-0 right-0 border-b-2 border-border">
        <button class="flex items-center gap-4" on:click={() => goto('/')}>
            <img src="/CrateBytes.png" alt="CrateBytes" class="h-10 w-10 hidden sm:block" />
            <h1 class="text-2xl font-bold">CrateBytes</h1>
        </button>
    
        <div class="flex items-center gap-2">
            <Button href="https://github.com/CrateBytes/CrateBytes" variant="ghost" size="icon">
                <Icon icon="mdi:github"
                    class="absolute h-[1.2rem] w-[1.2rem]"
                />
                <span class="sr-only">Source code</span>
            </Button>
    
            <Button on:click={toggleMode} variant="ghost" size="icon">
                <Sun
                    class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                />
                <Moon
                    class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                />
                <span class="sr-only">Toggle theme</span>
            </Button>
    
            {#if $page.data.session == null}
                <Button on:click={() => goto('/login')} variant="outline">
                    <p class="text-sm font-semibold">Login</p>
                </Button>
            {:else}
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild let:builder>
                        <Button builders={[builder]} variant="outline" class="w-8 h-8">
                            <Avatar.Root class="w-8 h-8">
                                <Avatar.Image src={$page.data.session.user?.image} alt="Avatar" />
                                <Avatar.Fallback>{$page.data.session.user?.name}</Avatar.Fallback>
                            </Avatar.Root>
                        </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content class="w-56">
                        <DropdownMenu.Label class="text-sm font-medium"> {$page.data.session.user?.name} </DropdownMenu.Label>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item class="text-sm font-medium cursor-pointer" on:click={() => goto('/dashboard')}>Dashboard</DropdownMenu.Item>
                        <!-- <DropdownMenu.Item class="text-sm font-medium cursor-pointer" on:click={() => goto('/settings')}>Settings</DropdownMenu.Item> -->
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item class="text-sm font-medium cursor-pointer" on:click={() => signOut()}> Logout </DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
            {/if}
        </div>
    </header>
    
    {#if id}
    <div class="flex flex-row-reverse h-full fixed bg-background">
        <button class="flex sm:hidden bg-muted-foreground h-32 w-3 mt-5 border-foreground border-r-2 border-y-2 rounded-r-lg
                        transition-transform duration-300 ease-in-out
                        absolute top-0 transform
                        {sidebarOpen ? 'translate-x-3 right-0' : 'translate-x-3 right-0'}" 
            on:click={toggleSidebar} />
    
        <div class="relative left-0 top-0 bottom-0 flex-col h-full border-r-2 border-border w-16 px-3 pt-2 gap-2 transform transition-transform duration-300 ease-in-out {sidebarOpen ? 'translate-x-0' : 'hidden -translate-x-full'} sm:translate-x-0 sm:flex items-center"> 
            {#each tabs as tab}
                <Tooltip.Root>
                    <Tooltip.Trigger>
                        <Button class="!w-12 !h-12 !m-0 !p-0 flex items-center justify-center text-white" variant="{$page.url.pathname === tab.href ? "default" : "ghost"}" href={tab.href}>
                            <Icon icon={tab.icon} width=32 height=32 />
                        </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        <p>{tab.name}</p>
                    </Tooltip.Content>
                </Tooltip.Root>
            {/each}
        </div>
    </div>
    {/if}
</div>