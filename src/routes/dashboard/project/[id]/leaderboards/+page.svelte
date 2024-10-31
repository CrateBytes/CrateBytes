<script lang="ts">
    import * as Table from "$lib/components/ui/table";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as Avatar from "$lib/components/ui/avatar/index.js";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as Form from "$lib/components/ui/form";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import Icon from "@iconify/svelte";
    import { Input } from "$lib/components/ui/input/index.js";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";

    import { createLeaderboardSchema, deleteLeaderboardSchema } from "../../../../../schema";
    import NewNavbar from '$lib/components/NewNavbar.svelte';
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";
    export let data;

    const CreateLeaderboardForm = superForm(data.CreateLeaderboardForm, {
        validators: zodClient(createLeaderboardSchema),
        invalidateAll: true,
        onResult: async ({ result } : { result: any}) => {
            if (result.status !== 200) return;
            CreateLeaderboardDialogTrigger = false;

            if(browser) window.location.href = `/dashboard/project/${data.project.id}/leaderboards/${result.data.leaderboardId}`;
        },
    });

    const { form: CreateLeaderboardFormData, enhance: CreateLeaderboardFormEnhance, submitting: CreateLeaderboardFormSubmitting } = CreateLeaderboardForm;

    const DeleteLeaderboardForm = superForm(data.DeleteLeaderboardForm, {
        validators: zodClient(deleteLeaderboardSchema),
        invalidateAll: true,
        onResult(event) {
            DeleteLeaderboardDialogTrigger = false;
        },
    });

    const { form: DeleteLeaderboardFormData, enhance: DeleteLeaderboardFormEnhance, submitting: DeleteLeaderboardFormSubmitting } = DeleteLeaderboardForm;

    let DeleteLeaderboardDialogData = {
        id: "",
        name: "",
    }

    function SetupDeleteLeaderboardDialog(Leaderboard: {
        id: string,
        name: string,
    }) {
        DeleteLeaderboardFormData.set({
            leaderboardId: Leaderboard.id,
        });

        DeleteLeaderboardDialogData = {
            id: Leaderboard.id,
            name: Leaderboard.name,
        }

        DeleteLeaderboardDialogTrigger = true;
    }

    function SetupCreateLeaderboardDialog() {
        CreateLeaderboardFormData.set({
            projectId: data.project.id,
            name: "",
            description: "",
        });

        CreateLeaderboardDialogTrigger = true;
    }

    let CreateLeaderboardDialogTrigger = false;
    let DeleteLeaderboardDialogTrigger = false;
</script>

<svelte:head>
    <title>CrateBytes - {data.project.name} leaderboards</title>
</svelte:head>

<NewNavbar id={data.project.id} />

<!-- #region Create Leaderboard -->
<Dialog.Root open={CreateLeaderboardDialogTrigger} onOpenChange={(open) => {
    CreateLeaderboardDialogTrigger = open;
}}>
    <Dialog.Trigger>
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Create Leaderboard</Dialog.Title>
            <Dialog.Description>
                Create a new Leaderboard for your game.
            </Dialog.Description>
        </Dialog.Header>
        <form action="?/CreateLeaderboard" method="POST" use:CreateLeaderboardFormEnhance>
            <div class="grid gap-4 py-4">
                <Form.Field form={CreateLeaderboardForm} name="projectId">
                    <Form.Control let:attrs>
                    <Input type="hidden" {...attrs} bind:value={$CreateLeaderboardFormData.projectId} />
                    </Form.Control>
                </Form.Field>

                <Form.Field form={CreateLeaderboardForm} name="name">
                    <Form.Control let:attrs>
                    <Form.Label>Name</Form.Label>
                    <Input {...attrs} bind:value={$CreateLeaderboardFormData.name} />
                    </Form.Control>
                    <Form.FieldErrors />
                </Form.Field>

                <Form.Field form={CreateLeaderboardForm} name="description">
                    <Form.Control let:attrs>
                    <Form.Label>Description</Form.Label>
                    <Input {...attrs} bind:value={$CreateLeaderboardFormData.description} />
                    </Form.Control>
                    <Form.FieldErrors />
                </Form.Field>
            </div>
            <Dialog.Footer>
                <Form.Button class="transition-all">
                        {#if $CreateLeaderboardFormSubmitting}
                            <Icon icon="line-md:loading-loop" />
                        {:else}
                            Create Leaderboard
                        {/if}
                    </Form.Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
<!-- #endregion -->

<!-- #region Delete Leaderboard -->
<AlertDialog.Root open={DeleteLeaderboardDialogTrigger} onOpenChange={(open) => {
    DeleteLeaderboardDialogTrigger = open;
}}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Are you sure you want to delete "{DeleteLeaderboardDialogData.name}"?</AlertDialog.Title>
            <AlertDialog.Description>
            This action cannot be undone. This will permanently delete your Leaderboard
            and remove your data from our servers.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <form action="?/DeleteLeaderboard" method="POST" use:DeleteLeaderboardFormEnhance>
                <Form.Field form={DeleteLeaderboardForm} name="leaderboardId">
                    <Form.Control let:attrs>
                    <Input type="hidden" {...attrs} bind:value={$DeleteLeaderboardFormData.leaderboardId} />
                    </Form.Control>
                </Form.Field>
                <Form.Button>
                    {#if $DeleteLeaderboardFormSubmitting}
                        <Icon icon="line-md:loading-loop" />
                    {:else}
                        Confirm
                    {/if}
                </Form.Button>
            </form>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>
<!-- #endregion -->

<div class="md:ml-16">
    <main class="flex flex-col md:flex-row bg-background gap-16 h-full sm:mx-16 sm:my-8 m-4">
        <div class="flex flex-col gap-8 md:flex-[2] w-full">
            <section class="flex flex-col gap-4">
                <div class="flex flex-row justify-between gap-2">
                    <span class="text-accent-foreground text-2xl font-bold"> Leaderboards </span>
                    <Button variant="outline" class="px-3 py-3 text-md" on:click={() => SetupCreateLeaderboardDialog()}> Create </Button>
                </div>
                
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.Head class="w-2/12">#</Table.Head>
                            <Table.Head>Name</Table.Head>
                            <Table.Head>Description</Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#if data.leaderboards.length > 0}
                            {#each data.leaderboards as leaderboard, i (i)}
                                <Table.Row class="text-ellipsis cursor-pointer" on:click={(event) => {
                                    // @ts-ignore
                                    if (event.target.closest('.dropdown-trigger-button')) return;

                                    goto(`/dashboard/project/${data.project.id}/leaderboards/${leaderboard.id}`);
                                }}>
                                    <Table.Cell>{i + 1}</Table.Cell>
                                    <Table.Cell>{leaderboard.name}</Table.Cell>
                                    <Table.Cell class="text-ellipsis whitespace-nowrap overflow-hidden max-w-40">{leaderboard.description}</Table.Cell>
                                    <Table.Cell class="flex justify-center">
                                        <DropdownMenu.Root>
                                            <DropdownMenu.Trigger class="dropdown-trigger-button">
                                                <Button variant="ghost" size="icon">
                                                    <Icon icon="mdi:dots-vertical" width="1.2rem" height="1.2rem" />
                                                </Button>
                                            </DropdownMenu.Trigger>
                                            <DropdownMenu.Content>
                                                <DropdownMenu.Group>
                                                    <DropdownMenu.Item class="text-red-600 cursor-pointer" on:click={() => SetupDeleteLeaderboardDialog(leaderboard)}>Delete</DropdownMenu.Item>
                                                </DropdownMenu.Group>
                                            </DropdownMenu.Content>
                                        </DropdownMenu.Root>
                                    </Table.Cell>
                                </Table.Row>
                            {/each}
                        {:else}
                            <Table.Row>
                                <Table.Cell> <!-- Empty --> </Table.Cell>
                                <Table.Cell>
                                    <div class="text-accent-foreground text-md w-full text-center"> No leaderboards found </div>
                                    <div class="text-muted-foreground text-sm w-full text-center"> Create a new leaderboard to get started </div>
                                </Table.Cell>
                                <Table.Cell> <!-- Empty --> </Table.Cell>
                            </Table.Row>
                        {/if}

                    </Table.Body>
                </Table.Root>
            </section>
        </div>
    </main>
</div>