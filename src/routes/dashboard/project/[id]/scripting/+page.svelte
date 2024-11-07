<script lang="ts">
    import NewNavbar from "$lib/components/NewNavbar.svelte";
    import * as Form from "$lib/components/ui/form";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Select from "$lib/components/ui/select";
    import * as Dialog from "$lib/components/ui/dialog";
    import { Textarea } from "$lib/components/ui/textarea";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import CodeMirror from "svelte-codemirror-editor";
    import { javascript } from "@codemirror/lang-javascript";
    import { onMount } from "svelte";
    import { espresso, barf } from 'thememirror';
    import { mode } from "mode-watcher";
    import { eventBaseCode, EventType } from "../../../../../cloud/ScriptingTypes";
    import type { Selected } from "bits-ui";
    import { Label } from "$lib/components/ui/label";
    import { Button } from "$lib/components/ui/button";
    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import { editScriptSchema, testScriptSchema } from "../../../../../schema";
    import Icon from "@iconify/svelte";

    export let data;

    const EditScriptForm = superForm(data.EditScriptSchema, {
        validators: zodClient(editScriptSchema),
        invalidateAll: true,
        multipleSubmits: "prevent",
        resetForm: false,
        onResult: async ({ result } : { result: any}) => {
            if (result.type === "success") {
                changedCode = false;

                const scriptToUpdate = scripts.find(script => script.eventType === result.data.EditScriptSchema.data.eventType);
                if (scriptToUpdate) {
                    scriptToUpdate.script = result.data.EditScriptSchema.data.script;
                }
            }
        }
    });

    const { form: editScriptFormData, enhance: EditScriptEnhance, submitting: EditScriptSubmitting } = EditScriptForm;

    const TestScriptForm = superForm(data.TestScriptSchema, {
        validators: zodClient(testScriptSchema),
        invalidateAll: true,
        multipleSubmits: "prevent",
        resetForm: false,
        onResult: async ({ result } : { result: any}) => {
            if (result.status === 200) {
                output = result.data.result;
            } else if (result.status === 500) {
                output = result.data.error;
            }

            testScriptDialogOpen = false;
            setTimeout(() => {
                document.getElementById("output")?.scrollIntoView({ behavior: "smooth" });
            }, 50);
        }
    });

    const { form: testScriptFormData, enhance: TestScriptEnhance, submitting: TestScriptSubmitting } = TestScriptForm;

    let scripts = data.scripts.map(script => {
        return {
            script: script.script,
            eventType: EventType[script.eventType],
        }
    });

    Object.keys(eventBaseCode).forEach(key => {
        if (!scripts.find(script => script.eventType === key)) {
            scripts.push({
                script: eventBaseCode[key].code,
                eventType: key as EventType,
            });
        }
    });

    let eventType = "GameplayStart";
    let eventName = eventBaseCode[eventType].name;
    let eventDescription = eventBaseCode[eventType].description;
    let value = scripts.find(script => script.eventType === eventType)?.script || eventBaseCode[eventType].code;
    let changedCode = false;
    let output = "";

    editScriptFormData.set({
        projectId: data.project.id,
        eventType: eventType,
        script: value,
    });

    testScriptFormData.set({
        projectId: data.project.id,
        eventType: eventType,
        script: value,
        inputs: eventBaseCode[eventType].inputs,
    });

    async function onSelectedChange(selected: Selected<string> | undefined) {
        if (selected) {
            document.getElementById("SaveScriptButton")?.click();

            eventType = selected.value;
            eventName = eventBaseCode[selected.value].name;
            eventDescription = eventBaseCode[selected.value].description;
            value = scripts.find(script => script.eventType === selected.value)?.script || eventBaseCode[selected.value].code;

            editScriptFormData.set({
                projectId: data.project.id,
                eventType: eventType,
                script: value,
            });

            testScriptFormData.set({
                projectId: data.project.id,
                eventType: eventType,
                script: value,
                inputs: eventBaseCode[eventType].inputs,
            });
        }
    }

    function onChange() {
        changedCode = true;

        editScriptFormData.set({
            projectId: data.project.id,
            eventType: eventType,
            script: value,
        });

        testScriptFormData.set({
            projectId: data.project.id,
            eventType: eventType,
            script: value,
            inputs: eventBaseCode[eventType].inputs,
        });
    }

    onMount(async () => {
        window.addEventListener('beforeunload', e => {
            if (changedCode) {
                e.preventDefault()
                return e.returnValue = "Are you sure you want to exit?";
            }
        });

        window.addEventListener('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                document.getElementById("SaveScriptButton")?.click();
            }
        });
    });


    let testScriptDialogOpen = false;
</script>

<NewNavbar id={data.project.id}/>
<div class="md:ml-16 my-8">
    <main class="flex flex-col bg-background gap-4 min-h-full items-center">
        <div class="flex flex-col items-center gap-2 text-center">
            <h1 class="text-4xl font-bold"> Cloud Scripting </h1>
            <p class="text-lg text-muted-foreground">
                Here, you can create TypeScript scripts for your project that execute in response to specific events.
            </p>
        </div>

        <!-- Event drop down -->
        <div class="flex clex-col justify-center items-center w-1/2">
            <Label class="text-lg mx-4">Event: </Label>
            <Select.Root selected={{ value: "GameplayStart", label: "Gameplay Start" }} onSelectedChange={onSelectedChange}>
                <Select.Trigger class="w-1/2">
                    <Select.Value placeholder="Event" />
                </Select.Trigger>
                <Select.Content>
                    <span class="ml-6 font-bold">Gameplay</span>
                    <Select.Item value="GameplayStart">Gameplay Start</Select.Item>
                    <Select.Item value="GameplayEnd">Gameplay End</Select.Item>
                    <Separator />
                    <span class="ml-6 font-bold">Leaderboard</span>
                    <Select.Item value="LeaderboardSubmit">Leaderboard Submit</Select.Item>
                    <Separator />
                    <span class="ml-6 font-bold">Metadata</span>
                    <Select.Item value="MetadataAdd">Metadata Add/Update</Select.Item>
                    <Select.Item value="MetadataDelete">Metadata Delete</Select.Item>
                </Select.Content>
            </Select.Root>
        </div>

        <!-- Event details -->
        <div class="flex flex-col items-center gap-2">
            <h2 class="text-2xl font-bold"> {eventName} </h2>
            <p class="text-lg text-muted-foreground"> {eventDescription} </p>
        </div>

        <!-- Script Editor -->
        <div class="w-4/5 border bg-[{$mode === "light" ? "#fff" : "#15191EFA"}] relative rounded-lg overflow-hidden">
            <CodeMirror bind:value class="h-96 overflow-y-scroll"
            lang={javascript({ typescript: true })} on:change={onChange} tabSize={4} useTab={true} lineWrapping={true} theme={$mode === "light" ? espresso : barf}/>

            <div class="bg-[#15191EFA] w-[29.2px] h-full" ></div>
        </div>
        <!-- Save & Test buttons -->
        <div class="w-4/5 flex justify-end gap-2">
            <!-- Test Script -->
            <Dialog.Root open={testScriptDialogOpen} onOpenChange={open => {
                editScriptFormData.set({
                    projectId: data.project.id,
                    eventType: eventType,
                    script: value,
                });

                testScriptFormData.set({
                    projectId: data.project.id,
                    eventType: eventType,
                    script: value,
                    inputs: eventBaseCode[eventType].inputs,
                });
                
                testScriptDialogOpen = open
            }}>
                <Dialog.Trigger>
                    <Button class="px-6" variant="outline">Test</Button>
                </Dialog.Trigger>
                <Dialog.Content>
                    <Dialog.Header>
                        <Dialog.Title>Test Script</Dialog.Title>
                        <Dialog.Description>
                            <p class="text-lg text-muted-foreground">
                                Test the script with the provided inputs.
                            </p>

                            <form action="?/TestScript" method="post" use:TestScriptEnhance class="flex flex-col gap-2">
                                <Form.Field form={TestScriptForm} name="projectId">
                                    <Form.Control let:attrs>
                                        <Input {...attrs} bind:value={$testScriptFormData.projectId} type="hidden" readonly/>
                                    </Form.Control>
                                </Form.Field>

                                <Form.Field form={TestScriptForm} name="eventType">
                                    <Form.Control let:attrs>
                                        <Input {...attrs} bind:value={$testScriptFormData.eventType} type="hidden" readonly/>
                                    </Form.Control>
                                </Form.Field>

                                <Form.Field form={TestScriptForm} name="script">
                                    <Form.Control let:attrs>
                                        <textarea {...attrs} bind:value={$testScriptFormData.script} readonly class="hidden"/>
                                    </Form.Control>
                                </Form.Field>

                                <Form.Field form={TestScriptForm} name="inputs">
                                    <Form.Control let:attrs>
                                        <Textarea {...attrs} bind:value={$testScriptFormData.inputs} placeholder="Inputs" class="w-full p-2 border rounded-lg" rows={12} />
                                    </Form.Control>
                                </Form.Field>

                                <Form.Button class="px-6 relative" variant="secondary" disabled={$TestScriptSubmitting ? true : false}>
                                    {#if $TestScriptSubmitting}
                                        <Icon icon="line-md:loading-loop" class="h-6 w-6" />
                                    {:else}
                                        Test
                                    {/if}
                                </Form.Button>
                            </form>
                        </Dialog.Description>
                    </Dialog.Header>
                </Dialog.Content>
            </Dialog.Root>

            <!-- Save Code -->
            <form action="?/SaveScript" method="POST" use:EditScriptEnhance>
                <Form.Field form={EditScriptForm} name="projectId">
                    <Form.Control let:attrs>
                        <Input {...attrs} bind:value={$editScriptFormData.projectId} type="hidden" readonly/>
                    </Form.Control>
                </Form.Field>

                <Form.Field form={EditScriptForm} name="eventType">
                    <Form.Control let:attrs>
                        <Input {...attrs} bind:value={$editScriptFormData.eventType} type="hidden" readonly/>
                    </Form.Control>
                </Form.Field>

                <Form.Field form={EditScriptForm} name="script">
                    <Form.Control let:attrs>
                        <textarea {...attrs} bind:value={$editScriptFormData.script} readonly class="hidden"/>
                    </Form.Control>
                </Form.Field>

                <Form.Button class="px-6 relative" variant="secondary" disabled={$EditScriptSubmitting ? true : false} id="SaveScriptButton">
                    {#if changedCode}
                    <span class="absolute left-[-5px] top-[-5px] flex h-4 w-4">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
                    </span>
                    {/if}

                    {#if $EditScriptSubmitting}
                        <Icon icon="line-md:loading-loop" class="h-6 w-6" />
                    {:else}
                        Save
                    {/if}
                </Form.Button>
            </form>
        </div>

        {#if output}
        <Separator class="w-4/5"/>
        <!-- output -->
        <div class="w-4/5 flex flex-col gap-4" id="output">
            <h2 class="text-2xl font-bold"> Output </h2>
            <div class="w-full p-4 border rounded-lg whitespace-pre bg-[{$mode === "light" ? "#fff" : "#15191EFA"}]">{output}</div>
        </div>
        {/if}
    </main>
</div>