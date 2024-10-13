<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import { signIn, signOut } from '@auth/sveltekit/client';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import NewNavbar from '$lib/components/NewNavbar.svelte';
    import * as Card from "$lib/components/ui/card";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import CustomFooter from "$lib/components/CustomFooter.svelte";

    let features = [
        {
            icon: '📊',
            title: 'Advanced Game Analytics',
            description: 'Unlock comprehensive insights into game performance, and engagement through detailed game analytics.'
        },
        {
            icon: '🏆',
            title: 'Global Leaderboards & Rankings',
            description: 'Boost player competitiveness by implementing leaderboards, fostering community and engagement.'
        },
        {
            icon: '🎮',
            title: 'Seamless Steam & Guest Login',
            description: 'Provide players with a hassle-free login experience via Steam integration or guest access, ensuring convenience and security.'
        },
        {
            icon: '🗂️',
            title: 'Customizable Player Metadata Management',
            description: 'Easily store, manage, and utilize player metadata to personalize gaming experiences and enhance user retention.'
        }
    ];

    let plans = [
        {
            title: 'Free',
            description: 'Perfect for small projects and personal use.',
            features: ['Up to 10,000 MAU per month', 'Basic moderation', 'Basic integrations', 'Community support'],
            buttonText: 'Get Started',
            link: "/dashboard"
        },
        {
            title: 'Enterprise',
            description: 'Ideal for large-scale projects and businesses.',
            features: ['Custom MAU per month', 'Advanced moderation', 'Custom integrations', '24/7 support'],
            buttonText: 'Contact Sales',
            link: "#"
        },
        {
            title: 'Self-Hosted',
            description: 'Full control with self-hosted solutions.',
            features: ['Customizable', 'Full Data Ownership', 'Custom integrations', 'Community Support'],
            buttonText: 'Get Source Code',
            link: "https://github.com/CrateBytes/CrateBytes/"
        }
    ];
</script>

<NewNavbar />
<div class="relative">
    <!-- Hero -->
    <main class="flex flex-col-reverse md:flex-row items-center justify-between px-4 py-16 lg:py-24 gap-8 ">
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
                <Button variant="outline" class="px-6 py-3 text-lg" href="https://github.com/CrateBytes/CrateBytes">
                    Source Code
                </Button>
            </div>
        </div>

        <div class="w-1/4 justify-center lg:justify-end hidden md:flex">
            <img src="/CrateBytes.png" alt="CrateBytes" class="max-w-full object-cover rounded-md" />
        </div>
    </main>

    <!-- Features -->
    <section class="my-32">
        <div class="container mx-auto px-4">
            <h2 class="text-2xl lg:text-4xl font-bold text-center mb-12">Features</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {#each features as feature}
                    <Card.Root class="rounded-lg shadow-md">
                        <Card.Header>
                            <span class="text-4xl mb-4">{feature.icon}</span>
                            <Card.Title class="text-xl font-semibold mb-4">{feature.title}</Card.Title>
                        </Card.Header>
                        <Card.Content>
                            <Card.Description class="text-muted-foreground">{feature.description}</Card.Description>
                        </Card.Content>
                    </Card.Root>
                {/each}
            </div>
        </div>
    </section>

    <!-- Pricing -->
    <section class="my-32">
        <div class="container mx-auto px-4">
            <h2 class="text-2xl lg:text-4xl font-bold text-center mb-12">Pricing Plans</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                {#each plans as plan}
                    <Card.Root class="rounded-lg shadow-md">
                        <Card.Header>
                            <Card.Title class="text-xl font-semibold mb-4">{plan.title}</Card.Title>
                        </Card.Header>
                        <Card.Content>
                            <Card.Description class="text-muted-foreground mb-4">
                                {plan.description}
                            </Card.Description>
                            <ul class="list-disc list-inside text-muted-foreground mb-4">
                                {#each plan.features as feature}
                                    <li>{feature}</li>
                                {/each}
                            </ul>
                            <Button variant="default" class="w-full" href={plan.link}>{plan.buttonText}</Button>
                        </Card.Content>
                    </Card.Root>
                {/each}
            </div>
        </div>
    </section>
</div>

<CustomFooter />