<script lang="ts">
    import NewNavbar from '$lib/components/NewNavbar.svelte';
    import * as Card from "$lib/components/ui/card";
    import Icon from '@iconify/svelte';
    export let data;
    import { VisXYContainer, VisLine, VisScatter, VisTooltip, VisAxis } from '@unovis/svelte'
    import { Line, Scatter } from '@unovis/ts';

    const chartData: {
        count: number;
        averagePlayTime: number;
    }[] = data.Days;

    const playerCountX = (d: {
        day: Date;
        count: number;
        averagePlayTime: number;
    }) => d.day.getTime();

    const playerCountY = (d: {
        day: Date;
        count: number;
        averagePlayTime: number;
    }) => d.count;

    const averageSessionTimeX = (d: {
        day: Date;
        count: number;
        averagePlayTime: number;
    }) => d.day.getTime();

    const averageSessionTimeY = (d: {
        day: Date;
        count: number;
        averagePlayTime: number;
    }) => d.averagePlayTime;

    const playerCountTriggers = {
        [Scatter.selectors.point]: (d: {
            day: Date;
            count: number;
            averagePlayTime: number;
        }) => {
            const playTime = d.averagePlayTime;
            let formattedPlayTime;
            if (playTime >= 3600) formattedPlayTime = `${(playTime / 3600).toFixed(2)}h`;
            else if (playTime >= 60) formattedPlayTime = `${(playTime / 60).toFixed(2)}m`;
            else formattedPlayTime = `${playTime.toFixed(2)}s`;

            return `<span>Player Count: ${d.count}<br/>Average Session Time: ${formattedPlayTime}</span><br/>Day: ${d.day.toLocaleString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            })}`;
        }
    }
</script>

<svelte:head>
    <title>CrateBytes - {data.project.name} Analytics</title>
</svelte:head>

<NewNavbar id={data.project.id} />
<div class="md:ml-16">
    <main class="flex flex-col bg-background gap-4 h-full mx-8 mb-8">
        <h1 class="text-3xl font-bold text-center mt-8">
            {data.project.name} Analytics
        </h1>
        <section class="mt-8 w-full flex flex-col md:flex-row gap-4 justify-center">
            <div class="bg-card border rounded-md p-6 shadow-lg">
                <div class="flex flex-col items-center gap-4">
                    <div class="flex items-center gap-2 text-xl font-semibold">
                        <Icon icon="mdi:people" width="32"/> 
                        <span>Lifetime Player Count</span>
                    </div>
                    <div class="text-4xl font-bold text-primary">
                        {data.TotalPlayerCount}
                    </div>
                </div>
            </div>

            <div class="bg-card border rounded-md p-6 shadow-lg">
                <div class="flex flex-col items-center gap-4">
                    <div class="flex items-center gap-2 text-xl font-semibold">
                        <Icon icon="mdi:clock-outline" width="32"/> 
                        <span>Average Session Time</span>
                    </div>
                    <div class="text-4xl font-bold text-primary">
                        {#if isNaN(data.AveragePlayTime)}
                            0s
                        {:else if data.AveragePlayTime >= 3600}
                            {(data.AveragePlayTime / 3600).toFixed(2)}h
                        {:else if data.AveragePlayTime >= 60}
                            {(data.AveragePlayTime / 60).toFixed(2)}m
                        {:else}
                            {data.AveragePlayTime.toFixed(2)}s
                        {/if}
                    </div>
                </div>
            </div>

            <div class="bg-card border rounded-md p-6 shadow-lg">
                <div class="flex flex-col items-center gap-4">
                    <div class="flex items-center gap-2 text-xl font-semibold">
                        <Icon icon="fluent:live-20-filled" width="32"/> 
                        <span>Currently Active Players</span>
                    </div>
                    <div class="text-4xl font-bold text-primary">
                        {data.CurrentActivePlayers}
                    </div>
                </div>
            </div>
        </section>

        <section class="w-full flex flex-col gap-4 border rounded-md p-4 md:p-8">
            <h2 class="text-2xl font-bold text-center mb-4">
                Player Count past week
            </h2>
            <VisXYContainer data={chartData}>
                <VisLine x={playerCountX} y={playerCountY}/>
                <VisScatter x={playerCountX} y={playerCountY}/>
                <VisTooltip triggers={playerCountTriggers} horizontalPlacement="left" verticalPlacement="bottom"/>
                <VisAxis type="y"/>
            </VisXYContainer>
        </section>

        <section class="w-full flex flex-col gap-4 border rounded-md p-4 md:p-8">
            <h2 class="text-2xl font-bold text-center mb-4">
                Average Session Time past week
            </h2>
            <VisXYContainer data={chartData}>
                <VisLine x={averageSessionTimeX} y={averageSessionTimeY}/>
                <VisScatter x={averageSessionTimeX} y={averageSessionTimeY}/>
                <VisTooltip triggers={playerCountTriggers} horizontalPlacement="left" verticalPlacement="bottom"/>
                <VisAxis type="y"/>
            </VisXYContainer>
        </section>
    </main>
</div>