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

    import { createProjectSchema, deleteProjectSchema } from "../../schema";

    import { goto } from "$app/navigation";
    import NewNavbar from "$lib/components/NewNavbar.svelte";
    import CustomFooter from "$lib/components/CustomFooter.svelte";
    export let data;

    const SplashText: string[] = [
        "Build. Test. Repeat.",
        "Code your dreams into existence!",
        "The future is built today.",
        "One bug at a time.",
        "Create, iterate, and innovate!",
        "Turn coffee into code!",
        "Break things, fix them, learn.",
        "Explore, experiment, evolve!",
        "Ideas are the blueprint of tomorrow.",
        "Make something the world hasn’t seen yet!",
        "Crafting the future, one line at a time.",
        "Bold ideas, bold code.",
        "Welcome back vro!",
        "Ohio vibes only in this code.",
        "Caught Baby Gronk glazing in the IDE.",
        "Sigma grindset, no breaks.",
        "POV: You're coding in Ohio.",
        "Is it a bug or a sigma move?",
        "Stop glazing, deploy it already!",
        "Imposter in the code, sussy vibes.",
        "Caught me mewing during standup, no cap.",
        "We coding the ocky way!",
        "Caught in the backrooms with a memory leak.",
        "It’s Morbin’ time in this pull request.",
        "Ratio’d by a runtime error 💀.",
        "Lightskin stare activated while debugging.",
        "This PR is on a giga-chad level, no cringe.",
    ];

    const CreateProjectForm = superForm(data.CreateProjectForm, {
        validators: zodClient(createProjectSchema),
        invalidateAll: true,
        onResult: async ({ result } : { result: any}) => {
            if (result.status !== 200) return;
            CreateProjectDialogTrigger = false;
        },
    });

    const { form: CreateProjectFormData, enhance: CreateProjectFormEnhance, submitting: CreateProjectFormSubmitting } = CreateProjectForm;

    const DeleteProjectForm = superForm(data.DeleteProjectForm, {
        validators: zodClient(deleteProjectSchema),
        invalidateAll: true,
        onResult(event) {
            DeleteProjectDialogTrigger = false;
        },
    });

    const { form: DeleteProjectFormData, enhance: DeleteProjectFormEnhance, submitting: DeleteProjectFormSubmitting } = DeleteProjectForm;

    let DeleteProjectDialogData = {
        id: "",
        name: "",
    }

    function SetupDeleteProjectDialog(project: {
        id: string,
        name: string,
    }) {
        DeleteProjectFormData.set({
            ProjectId: project.id,
        });

        DeleteProjectDialogData = {
            id: project.id,
            name: project.name,
        }

        DeleteProjectDialogTrigger = true;
    }
    
    let CreateProjectDialogTrigger: boolean = false;
    let DeleteProjectDialogTrigger: boolean = false;
</script>

<NewNavbar />
<div class="relative">

    <!-- #region Delete Project -->
    <AlertDialog.Root open={DeleteProjectDialogTrigger} onOpenChange={(open) => {
        DeleteProjectDialogTrigger = open;
    }}>
        <AlertDialog.Content>
            <AlertDialog.Header>
                <AlertDialog.Title>Are you sure you want to delete "{DeleteProjectDialogData.name}"?</AlertDialog.Title>
                <AlertDialog.Description>
                This action cannot be undone. This will permanently delete your project
                and remove your data from our servers.
                </AlertDialog.Description>
            </AlertDialog.Header>
            <AlertDialog.Footer>
                <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                <form action="?/DeleteProject" method="POST" use:DeleteProjectFormEnhance>
                    <Form.Field form={DeleteProjectForm} name="ProjectId">
                        <Form.Control let:attrs>
                        <Input type="hidden" {...attrs} bind:value={$DeleteProjectFormData.ProjectId} />
                        </Form.Control>
                    </Form.Field>
                    <Form.Button>
                        {#if $DeleteProjectFormSubmitting}
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
    
    <!-- #region Create Project -->
    <Dialog.Root open={CreateProjectDialogTrigger} onOpenChange={(open) => {
        CreateProjectDialogTrigger = open;
    }}>
        <Dialog.Trigger>
        </Dialog.Trigger>
        <Dialog.Content class="sm:max-w-[425px]">
            <Dialog.Header>
                <Dialog.Title>Create Project</Dialog.Title>
                <Dialog.Description>
                    Create a new project for your game.
                </Dialog.Description>
            </Dialog.Header>
            <form action="?/CreateProject" method="POST" use:CreateProjectFormEnhance>
                <div class="grid gap-4 py-4">
                    <Form.Field form={CreateProjectForm} name="name">
                        <Form.Control let:attrs>
                        <Form.Label>Name</Form.Label>
                        <Input {...attrs} bind:value={$CreateProjectFormData.name} />
                        </Form.Control>
                        <Form.FieldErrors />
                    </Form.Field>

                    <Form.Field form={CreateProjectForm} name="description">
                        <Form.Control let:attrs>
                        <Form.Label>Description</Form.Label>
                        <Input {...attrs} bind:value={$CreateProjectFormData.description} />
                        </Form.Control>
                        <Form.FieldErrors />
                    </Form.Field>
                </div>
                <Dialog.Footer>
                    <Form.Button class="transition-all">
                            {#if $CreateProjectFormSubmitting}
                                <Icon icon="line-md:loading-loop" />
                            {:else}
                                Create Project
                            {/if}
                        </Form.Button>
                </Dialog.Footer>
            </form>
        </Dialog.Content>
    </Dialog.Root>
    <!-- #endregion -->
    
    <main class="flex flex-col md:flex-row bg-background gap-16 h-full m-5 sm:m-10">
        <div class="flex flex-col gap-8 md:flex-[2] w-full">
            <Card.Root class="w-full lg:w-1/2">
                <Card.Content class="flex flex-row gap-4 items-center">
                    <Avatar.Root class="w-16 h-16">
                        <Avatar.Image src={data.session.user?.image} alt="Avatar" />
                        <Avatar.Fallback>{data.session.user?.name}</Avatar.Fallback>
                    </Avatar.Root>
                    <div>
                        <div class="text-accent-foreground text-md"> Hey, </div>
                        <div class="font-bold text-xl">{data.session.user?.name}</div>
                        <div class="text-muted-foreground text-sm"> { SplashText[Math.floor(Math.random() * SplashText.length)] } </div>
                    </div>
                </Card.Content>
            </Card.Root>

            <section class="flex flex-col gap-4">
                <div class="flex flex-row justify-between gap-2">
                    <span class="text-accent-foreground text-2xl font-bold"> Projects </span>
                    <Button variant="outline" class="px-3 py-3 text-md" on:click={() => CreateProjectDialogTrigger = true}> Create </Button>
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
                        {#if data.Projects.length > 0}
                            {#each data.Projects as project, i (i)}
                                <Table.Row class="text-ellipsis cursor-pointer" on:click={(event) => {
                                    // @ts-ignore
                                    if (event.target.closest('.dropdown-trigger-button')) return;

                                    goto(`/dashboard/project/${project.id}`);
                                }}>
                                    <Table.Cell>{i + 1}</Table.Cell>
                                    <Table.Cell>{project.name}</Table.Cell>
                                    <Table.Cell class="text-ellipsis whitespace-nowrap overflow-hidden max-w-40">{project.description}</Table.Cell>
                                    <Table.Cell class="flex justify-center">
                                        <DropdownMenu.Root>
                                            <DropdownMenu.Trigger class="dropdown-trigger-button">
                                                <Button variant="ghost" size="icon">
                                                    <Icon icon="mdi:dots-vertical" width="1.2rem" height="1.2rem" />
                                                </Button>
                                            </DropdownMenu.Trigger>
                                            <DropdownMenu.Content>
                                                <DropdownMenu.Group>
                                                    <DropdownMenu.Item class="text-red-600 cursor-pointer" on:click={() => SetupDeleteProjectDialog(project)}>Delete</DropdownMenu.Item>
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
                                    <div class="text-accent-foreground text-md w-full text-center"> No projects found </div>
                                    <div class="text-muted-foreground text-sm w-full text-center"> Create a new project to get started </div>
                                </Table.Cell>
                                <Table.Cell> <!-- Empty --> </Table.Cell>
                            </Table.Row>
                        {/if}

                    </Table.Body>
                </Table.Root>
            </section>
        </div>

        <div class="flex flex-row gap-8 md:flex-1 w-full">
            <Card.Root>
                <Card.Header>
                    <Card.Title>News</Card.Title>
                </Card.Header>
                <Card.Content class="flex flex-col gap-4">
                    {#each data.News as News}
                        <div class="flex flex-row items-center gap-2">
                            <div class="flex flex-col">
                                <div class="text-md font-bold">{News.title}</div>
                                <div class="text-muted-foreground text-sm h-10 overflow-hidden text-ellipsis">{News.description}</div>
                            </div>

                            <img src={News.image} alt={News.title} class="max-w-24 max-h-14 object-cover" />
                        </div>

                        <Separator />
                    {/each}
                </Card.Content>
            </Card.Root>
        </div>
    </main>
</div>

<CustomFooter/>