<script lang="ts">
    import * as Tabs from "$lib/components/ui/tabs";
    import * as Card from "$lib/components/ui/card";
    import * as Form from "$lib/components/ui/form";
    import { Input } from "$lib/components/ui/input/index.js";
    export let data;

    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";

    import { updateProjectGeneralSchema } from "../../../../../schema";
    import { Separator } from "$lib/components/ui/separator";
    import { Label } from "$lib/components/ui/label";
    import NewNavbar from "$lib/components/NewNavbar.svelte";

    const UpdateGeneralForm = superForm(data.UpdateProjectGeneralSchema, {
        validators: zodClient(updateProjectGeneralSchema),
        invalidateAll: true,
    });

    const { form: generalFormData, enhance: updateGeneralFormEnhance } = UpdateGeneralForm;

    generalFormData.set({
        projectId: data.project.id,
        name: data.project.name,
        description: data.project.description || "",
        appid: data.project.steamAppId || 480,
        publisherKey: data.project.steamPublisherKey || "",
    });

</script>

<NewNavbar id={data.project.id}/>

<div class="md:ml-16">
    
    <main class="flex flex-row bg-background gap-4 min-h-full">
        <Card.Root class="w-4/5 sm:w-1/2 m-auto my-5">
            <Card.Header>
              <Card.Title class="text-3xl font-bold">Game Settings</Card.Title>
            </Card.Header>
            <Separator class="mt-5"/>

            <Card.Content>
                <form action="?/UpdateProjectGeneral" method="POST">
                    <Form.Field form={UpdateGeneralForm} name="projectId">
                        <Form.Control let:attrs>
                            <Input {...attrs} bind:value={$generalFormData.projectId} type="hidden" readonly/>
                        </Form.Control>
                    </Form.Field>

                    <h2 class="text-2xl font-semibold mb-5">General</h2>
                    
                    <div class="ml-5">
                        <Form.Field form={UpdateGeneralForm} name="name">
                            <Form.Control let:attrs>
                                <Form.Label>Name</Form.Label>
                                <Input {...attrs} bind:value={$generalFormData.name} />
                            </Form.Control>
                            <Form.Description />
                            <Form.FieldErrors />
                        </Form.Field>
    
                        <Form.Field form={UpdateGeneralForm} name="description">
                            <Form.Control let:attrs>
                                <Form.Label>Description</Form.Label>
                                <Input {...attrs} bind:value={$generalFormData.description} />
                            </Form.Control>
                            <Form.Description />
                            <Form.FieldErrors />
                        </Form.Field>
                    </div>

                    <Separator class="my-5" />

                    <h2 class="text-2xl font-semibold mb-5">Steam</h2>

                    <div class="ml-5">
                        <Form.Field form={UpdateGeneralForm} name="appid">
                            <Form.Control let:attrs>
                                <Form.Label>App ID</Form.Label>
                                <Input {...attrs} bind:value={$generalFormData.appid} />
                            </Form.Control>
                            <Form.Description />
                            <Form.FieldErrors />
                        </Form.Field>
    
                        <Form.Field form={UpdateGeneralForm} name="publisherKey">
                            <Form.Control let:attrs>
                                <Form.Label>Publisher Key</Form.Label>
                                <Input {...attrs} bind:value={$generalFormData.publisherKey} />
                            </Form.Control>
                            <Form.Description />
                            <Form.FieldErrors />
                        </Form.Field>
                    </div>
                    
                    <Separator class="my-5" />

                    <h2 class="text-2xl font-semibold mb-5">Api Keys</h2>

                    <div class="ml-5">
                        <Label>Project Key (Used for API requests)</Label>
                        <Input value={data.project.projectKey} readonly />
                    </div>
                    
                    <Separator class="my-5" />

                    <Form.Button>Save</Form.Button>
                </form>
            </Card.Content>
        </Card.Root>
    </main>
</div>