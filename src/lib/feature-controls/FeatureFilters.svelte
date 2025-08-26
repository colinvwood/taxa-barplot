<script lang="ts">
    import { sampleManager } from "../../classes/sampleManager";

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

<div class="grid grid-cols-3 grid-rows-10 gap-2 mt-4">
    <h1 class="row-start-1 col-start-2 justify-self-center font-bold text-lg">
        Taxon Filters
    </h1>

    <label class="row-start-2 col-start-1 justify-self-end" for="filterType">
        Type:
    </label>
    <select
        class="row-start-2 col-start-2 justify-self-start select-primary"
        name="filterType"
        bind:value={form.type}
    >
        <option value="relAbun">Relative Abundance</option>
        <option value="prevalAbs">Prevalence (number)</option>
        <option value="prevalProp">Prevalence (proportion)</option>
    </select>

    <label
        class="row-start-3 col-start-1 justify-self-end"
        for="filterOperator"
    >
        Relationship:
    </label>
    <select
        class="row-start-3 col-start-2 justify-self-start select-primary"
        name="filterOperator"
        bind:value={form.operator}
    >
        <option value=">">Greater than</option>
        <option value="<">Less than</option>
    </select>

    <label class="row-start-4 col-start-1 justify-self-end" for="filterValue">
        Value:
    </label>
    <input
        class="row-start-4 col-start-2 justify-self-start input-primary"
        type="text"
        name="filterValue"
        bind:value={form.value}
    />

    <button
        class="row-start-5 col-start-2 mx-4 button-primary"
        onclick={handleAddFilter}
    >
        Add Filter
    </button>

    <h2
        class="row-start-6 col-start-2 justify-self-center text-sm font-bold mt-2"
    >
        Applied Filters
    </h2>
    <div
        class="row-start-7 row-end-11 col-start-1 col-end-4 max-h-36 w-[70%] justify-self-center bg-gray-50 border-2 border-gray-300 rounded-sm overflow-scroll"
    >
        {#each filters as filter}
            <div
                class="flex justify-between items-center mx-2 mt-1 px-2 py-2 min-h-8 bg-white border-2 border-gray-300 rounded-lg"
            >
                <p class="text-sm">
                    {filter}
                </p>
                <button
                    class="bg-red-400 rounded-lg w-6 h-6 hover:cursor-pointer"
                    onclick={handleRemoveFilter(filter)}>X</button
                >
            </div>
        {/each}
    </div>
</div>
