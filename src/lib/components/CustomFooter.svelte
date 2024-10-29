<script>
    import Icon from "@iconify/svelte";
    import Separator from "./ui/separator/separator.svelte";
    import { page } from "$app/stores";
</script>

<Separator />
<footer class="py-6 text-center">
    <div class="social-links mb-4 flex justify-center">
        <a href="https://github.com/CrateBytes/CrateBytes/" target="_blank" rel="noopener noreferrer" class="mx-2 text-white hover:underline">
            <Icon icon="mdi:github" class="inline-block w-6 h-6" />
        </a>
        <a href="https://www.linkedin.com/company/cratebytes" target="_blank" rel="noopener noreferrer" class="mx-2 text-white hover:underline">
            <Icon icon="mdi:linkedin" class="inline-block w-6 h-6" />
        </a>
        <a href="https://discord.gg/UP4kzXZ66g" target="_blank" rel="noopener noreferrer" class="mx-2 text-white hover:underline">
            <Icon icon="mdi:discord" class="inline-block w-6 h-6" />
        </a>
        <a href="{$page.url.origin}/rss.xml" target="_blank" rel="noopener noreferrer" class="mx-2 text-white hover:underline">
            <Icon icon="mdi:rss" class="inline-block w-6 h-6" />
        </a>
    </div>
    <p>Built by game developers, for game developers.</p>
    <p>&copy; {new Date().getFullYear()} CrateBytes. All rights reserved.</p>
</footer>