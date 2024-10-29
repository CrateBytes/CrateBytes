<script lang="ts">
    import * as Card from "$lib/components/ui/card/index.js";
    import Icon from "@iconify/svelte";
</script>

<a href="https://cratebytes.mintlify.app/">
    <Card.Root class="relative rounded-lg shadow-md cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-[1.01]">
        <Card.Header>
            <Icon icon="fluent:book-20-filled" width="48" />
            <Card.Title class="text-xl font-semibold mb-4">Documentation</Card.Title>
        </Card.Header>
        <Card.Content>
            <Card.Description class="text-muted-foreground">
                Learn how to use CrateBytes and get started with your projects.
            </Card.Description>
        </Card.Content>

        <div class="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-muted-foreground"></div>
    </Card.Root>
</a>

<a href="https://discord.gg/UP4kzXZ66g" target="_blank">
    <Card.Root class="relative rounded-lg shadow-md cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-[1.01]">
        <Card.Header>
            <Icon icon="mdi:discord" width="48" />
            <Card.Title class="text-xl font-semibold mb-4">Discord Community</Card.Title>
        </Card.Header>
        <Card.Content>
            <Card.Description class="text-muted-foreground">
                Join our Discord server to chat with other developers and get help.
            </Card.Description>
        </Card.Content>

        <div class="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-muted-foreground"></div>
    </Card.Root>
</a>

<a href="/blog">
    <Card.Root class="relative rounded-lg shadow-md cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-[1.01]">
        <Card.Header>
            <Icon icon="fluent:news-20-filled" width="48" />
            <Card.Title class="text-xl font-semibold mb-4"> Blog </Card.Title>
        </Card.Header>
        <Card.Content>
            <Card.Description class="text-muted-foreground">
                Stay updated with the latest news and updates from CrateBytes.
            </Card.Description>
        </Card.Content>

        <div class="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-muted-foreground"></div>
    </Card.Root>
</a>

