<script lang="ts">
    import * as Table from "$lib/components/ui/table";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import * as Form from "$lib/components/ui/form";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as Pagination from "$lib/components/ui/pagination";
    import ChevronLeft from "lucide-svelte/icons/chevron-left";
    import ChevronRight from "lucide-svelte/icons/chevron-right";

    import { Input } from "$lib/components/ui/input/index.js";
    import Icon from "@iconify/svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import NewNavbar from '$lib/components/NewNavbar.svelte';
    import { onMount } from "svelte";
    import { invalidateAll } from "$app/navigation";
    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";

    import { deleteLeaderboardEntrySchema } from "../../../../../../schema";
    import Separator from "$lib/components/ui/separator/separator.svelte";

    export let data;

    type LeaderboardEntry = {
        PlayerCustomData: {
            data: string;
        };
        playerId: string;
        guest: boolean;
        score: number;
    }

    let isFetching = false;
    let currentPageNumber = 0;
    let totalPages = 0;
    $: totalEntries = 0;
    let LeaderboardEntries: LeaderboardEntry[] = [];
    $: perPage = 10;

    async function fetchLeaderboardEntries(page: number = 0) {
        isFetching = true;
        const res = await fetch(`/api/leaderboards/${data.leaderboard.id}?page=${page}`);
        const json = await res.json();

        LeaderboardEntries = json.entries.map((entry: {
            player: {
                PlayerCustomData: { data: string; }[];
                playerId: string;
                guest: boolean;
            };
            score: number;
        }) => ({
            playerId: entry.player.playerId,
            score: entry.score,
            guest: entry.player.guest,
            PlayerCustomData: entry.player.PlayerCustomData,
        }));

        totalPages = json.pages;
        totalEntries = json.totalEntries;
        currentPageNumber = page;
        isFetching = false;
    }

    function handlePageChange(page: number) {
        if (page >= 0 && page < totalPages && !isFetching) {
            fetchLeaderboardEntries(page);
        }
    }

    let customDataToShow: LeaderboardEntry;

    function SetupShowCustomData(entry: LeaderboardEntry) {
        customDataToShow = entry;
        ShowCustomDataDialogTrigger = true;
    }

    function SetupDeleteEntry(entry: LeaderboardEntry) {
        DeleteLeaderboardEntryDialogTrigger = true;
        DeleteLeaderboardEntryFormData.set({
            leaderboardId: data.leaderboard.id,
            playerId: entry.playerId,
        });
    }

    onMount(async () => {
        await fetchLeaderboardEntries();
    });

    const DeleteLeaderboardEntryForm = superForm(data.DeleteLeaderboardEntryForm, {
        validators: zodClient(deleteLeaderboardEntrySchema),
        invalidateAll: true,
    });

    const { form: DeleteLeaderboardEntryFormData, enhance: DeleteLeaderboardEntryFormEnhance, submitting: DeleteLeaderboardEntryFormSubmitting } = DeleteLeaderboardEntryForm;

    let DeleteLeaderboardEntryDialogTrigger = false;
    let ShowCustomDataDialogTrigger = false;
</script>

<svelte:head>
    <title>CrateBytes - {data.leaderboard.name}</title>
</svelte:head>

<NewNavbar id={data.project.id} />

<AlertDialog.Root open={DeleteLeaderboardEntryDialogTrigger} onOpenChange={(open) => {
    DeleteLeaderboardEntryDialogTrigger = open;
}}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Are you sure you want to delete this entry?</AlertDialog.Title>
            <AlertDialog.Description>
                This action cannot be undone.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <form action="?/DeleteLeaderboardEntry" method="POST">
                <Form.Field form={DeleteLeaderboardEntryForm} name="leaderboardId">
                    <Form.Control let:attrs>
                    <Input type="hidden" {...attrs} bind:value={$DeleteLeaderboardEntryFormData.leaderboardId} />
                    </Form.Control>
                </Form.Field>
                
                <Form.Field form={DeleteLeaderboardEntryForm} name="playerId">
                    <Form.Control let:attrs>
                    <Input type="hidden" {...attrs} bind:value={$DeleteLeaderboardEntryFormData.playerId} />
                    </Form.Control>
                </Form.Field>

                <Form.Button>
                    {#if $DeleteLeaderboardEntryFormSubmitting}
                        <Icon icon="line-md:loading-loop" />
                    {:else}
                        Confirm
                    {/if}
                </Form.Button>
            </form>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<AlertDialog.Root open={ShowCustomDataDialogTrigger} onOpenChange={(open) => {
    ShowCustomDataDialogTrigger = open;
}}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Custom Data of {customDataToShow.playerId}</AlertDialog.Title>
            <AlertDialog.Description>
                <div class="custom-data-item">
                    <pre class="bg-muted p-2 rounded-md">{JSON.stringify(customDataToShow.PlayerCustomData, null, 2)}</pre>
                </div>
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel>Close</AlertDialog.Cancel>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<div class="md:ml-16">
    <main class="flex flex-col bg-background gap-4 h-full sm:mx-16 sm:my-8 m-4">
        <div class="w-full lg:w-1/2 flex flex-col gap-4 justify-center">
            <h2 class="font-bold text-3xl">{data.leaderboard.name} <span class="text-sm text-muted-foreground">({data.leaderboard.id})</span></h2>
            <div class="text-muted-foreground text-md"> {data.leaderboard.description} </div>
        </div>
        <Separator />
        <h3 class="font-bold text-xl">Leaderboard Entries</h3>
        {#if isFetching}
            <div class="flex justify-center items-center h-64">
                <Icon icon="line-md:loading-loop" class="h-12 w-12 animate-spin" />
            </div>
        {:else}
            <div class="rounded-md border">
                <Table.Root>
                    <!-- Table Header -->
                    <Table.Header>
                        <Table.Row>
                            <Table.Head class="w-2/12">Player ID</Table.Head>
                            <Table.Head>Score</Table.Head>
                            <Table.Head>Guest</Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#if LeaderboardEntries.length > 0}
                            {#each LeaderboardEntries as entry}
                                <Table.Row class="text-ellipsis">
                                    <Table.Cell>{entry.playerId}</Table.Cell>
                                    <Table.Cell>{entry.score}</Table.Cell>
                                    <Table.Cell>{entry.guest ? "Yes" : "No"}</Table.Cell>
                                    <Table.Cell class="flex justify-center">
                                        <DropdownMenu.Root>
                                            <DropdownMenu.Trigger class="dropdown-trigger-button">
                                                <Button variant="ghost" size="icon">
                                                    <Icon icon="mdi:dots-vertical" width="1.2rem" height="1.2rem" />
                                                </Button>
                                            </DropdownMenu.Trigger>
                                            <DropdownMenu.Content>
                                                <DropdownMenu.Group>
                                                    <DropdownMenu.Item class="cursor-pointer" on:click={() => SetupShowCustomData(entry)}>Show Custom Data</DropdownMenu.Item>
                                                    <DropdownMenu.Item class="text-red-600 cursor-pointer" on:click={() => SetupDeleteEntry(entry)}>Delete</DropdownMenu.Item>
                                                </DropdownMenu.Group>
                                            </DropdownMenu.Content>
                                        </DropdownMenu.Root>
                                    </Table.Cell>
                                </Table.Row>
                            {/each}
                        {:else}
                            <Table.Row>
                                <Table.Cell></Table.Cell>
                                <Table.Cell>
                                    <div class="text-accent-foreground text-md w-full text-center"> No submissions found </div>
                                    <div class="text-muted-foreground text-sm w-full text-center"> This leaderboard has no entries. </div>
                                </Table.Cell>
                                <Table.Cell></Table.Cell>
                            </Table.Row>
                        {/if}
                    </Table.Body>
                </Table.Root>
            </div>
        {/if}
        
        <div>
            <Pagination.Root count={totalEntries} {perPage} let:pages let:currentPage>
                <Pagination.Content>
                    <Pagination.Item>
                        <Pagination.PrevButton on:click={() => handlePageChange(currentPageNumber - 1)} disabled={currentPageNumber === 0}>
                            <ChevronLeft class="h-4 w-4" />
                            <span class="hidden sm:block">Previous</span>
                        </Pagination.PrevButton>
                    </Pagination.Item>
                    {#each pages as page (page.key)}
                        {#if page.type === "ellipsis"}
                            <Pagination.Item>
                                <Pagination.Ellipsis />
                            </Pagination.Item>
                        {:else}
                            <Pagination.Item>
                                <Pagination.Link {page} isActive={currentPage === page.value} on:click={() => handlePageChange(page.value)}>
                                    {page.value}
                                </Pagination.Link>
                            </Pagination.Item>
                        {/if}
                    {/each}
                    <Pagination.Item>
                        <Pagination.NextButton on:click={() => handlePageChange(currentPageNumber + 1)} disabled={currentPageNumber === totalPages - 1}>
                            <span class="hidden sm:block">Next</span>
                            <ChevronRight class="h-4 w-4" />
                        </Pagination.NextButton>
                    </Pagination.Item>
                </Pagination.Content>
            </Pagination.Root>
        </div>
    </main>    
</div>