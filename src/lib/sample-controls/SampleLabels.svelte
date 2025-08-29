<script lang="ts">
    import { sampleManager } from "../../classes/sampleManager";

    let labels: string[] = $state(sampleManager.sampleControls.labels);
    let formLabel: string = $state("");

    const columnNames = sampleManager.sampleControls.metadata.getColumnNames();

    function handleAddLabel(event: Event) {
        if (labels.length >= 3) {
            alert("Sorry, no more than three labels are allowed.");
            formLabel = "";
            return;
        }

        sampleManager.sampleControls.addLabel(formLabel);
        labels = sampleManager.sampleControls.labels;
        formLabel = "";
        sampleManager.render();
    }

    function handleRemoveLabel(name: string) {
        return (event: Event) => {
            sampleManager.sampleControls.removeLabel(name);
            labels = sampleManager.sampleControls.labels;
            sampleManager.render();
        };
    }
</script>

<div
    class="grid rows-auto-min grid-cols-3 gap-2 w-[24rem] border-2 border-blue-300"
>
    <h1
        class="row-start-1 col-start-1 col-end-4 justify-self-center text-lg font-bold"
    >
        Sample Labels
    </h1>

    <label class="row-start-2 col-start-1 justify-self-end" for="column">
        Column:
    </label>
    <select
        class="row-start-2 col-start-2 select-primary"
        name="column"
        bind:value={formLabel}
    >
        {#each columnNames as column}
            <option value={column}>{column}</option>
        {/each}
    </select>
    <button
        class="row-start-3 col-start-1 col-end-4 justify-self-center button-primary"
        onclick={handleAddLabel}
    >
        Add
    </button>

    <p
        class="row-start-4 col-start-1 col-end-4 justify-self-center widget-subheading"
    >
        Applied Labels
    </p>
    <div
        class="row-start-7 row-end-11 col-start-1 col-end-4 w-[20rem] h-[10rem] justify-self-center bg-gray-50 border-2 border-gray-300 rounded-sm overflow-scroll"
    >
        {#each labels as label}
            <div
                class="flex justify-between items-center mx-2 mt-1 p-2 min-h-8 bg-white border-2 border-gray-300 rounded-lg"
            >
                <p class="text-sm">
                    {label}
                </p>
                <button
                    class="bg-red-400 rounded-lg w-6 h-6 hover:cursor-pointer"
                    onclick={handleRemoveLabel(label)}>X</button
                >
            </div>
        {/each}
    </div>
</div>
