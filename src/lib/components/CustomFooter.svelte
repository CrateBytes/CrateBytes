<script>
    import Icon from "@iconify/svelte";
    import Separator from "./ui/separator/separator.svelte";
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
        <a href="https://discord.gg/8aaK9sC27r" target="_blank" rel="noopener noreferrer" class="mx-2 text-white hover:underline">
            <Icon icon="mdi:discord" class="inline-block w-6 h-6" />
        </a>
    </div>
    <p>&copy; {new Date().getFullYear()} CrateBytes. All rights reserved.</p>
</footer>