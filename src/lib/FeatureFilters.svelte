<script lang="ts">
    import { sampleManager } from "../classes/sampleManager";

    let filters: string[] = $state([]);

    let form = $state({ type: "", operator: "", value: "" });

    function updateLocalFilters() {
        filters = sampleManager.featureControls.filters.map((f) => f.name);
    }

    function handleAddFilter(event: Event) {
        if (isNaN(Number(form.value))) {
            alert("Please enter a number for filter value.");
            return;
        }

        // apply filter
        if (form.type == "relAbun") {
            sampleManager.featureControls.addAbundanceFilter(
                Number(form.value),
                form.operator as ">" | "<",
            );
        } else if (form.type == "prevalAbs") {
            sampleManager.featureControls.addPrevalenceFilter(
                Number(form.value),
                "absolute",
                form.operator as ">" | "<",
            );
        } else if (form.type == "prevalProp") {
            sampleManager.featureControls.addPrevalenceFilter(
                Number(form.value),
                "proportion",
                form.operator as ">" | "<",
            );
        }

        form = { type: "", value: "", operator: "" };

        updateLocalFilters();

        sampleManager.render();
    }

    function handleRemoveFilter(name: string) {
        return (event: Event) => {
            sampleManager.featureControls.removeFilter(name);

            updateLocalFilters();

            sampleManager.render();
        };
    }
</script>

<div style="border: 1px solid gray;">
    <select name="filterType" bind:value={form.type}>
        <option value="relAbun">Relative Abundance</option>
        <option value="prevalAbs">Prevalence (number)</option>
        <option value="prevalProp">Prevalence (proportion)</option>
    </select>

    <button
        class={`cursor-pointer bg-blue-200 w-[25px] h-[25px] ${form.operator == ">" && "bg-blue-500"}`}
        id="greaterThan"
        onclick={() => (form.operator = ">")}
    >
        {">"}
    </button>
    <button
        class={`cursor-pointer bg-blue-200 w-[25px] h-[25px] ${form.operator == "<" && "bg-blue-500"}`}
        id="lessThan"
        onclick={() => (form.operator = "<")}
    >
        {"<"}
    </button>

    <label for="filterValue">Value:</label>
    <input type="text" name="filterValue" bind:value={form.value} />

    <button onclick={handleAddFilter}>Add Filter</button>
</div>

<div>
    {#each filters as filter}
        <div>
            <p>{filter}</p>
            <button onclick={handleRemoveFilter(filter)}>Remove</button>
        </div>
    {/each}
</div>
