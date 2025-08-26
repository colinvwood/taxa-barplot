<script lang="ts">
    import { onMount } from "svelte";
    import { sampleManager } from "../../classes/sampleManager";

    let filters: string[] = $state([]);

    let categoricalForm = $state({ column: "", levels: [], keep: false });
    let numericForm = $state({ column: "", value: "", operator: "" });
    let taxonForm = $state({ taxonId: "", operator: "", value: "" });

    let categoricalColumnLevels: string[] = $derived(
        categoricalForm.column != ""
            ? sampleManager.sampleControls.metadata.getCategoricalColumnLevels(
                  categoricalForm.column,
              )
            : [],
    );

    // TODO: render hook
    let viewTaxaNames: string[] = $state([]);
    onMount(() => {
        viewTaxaNames = sampleManager
            .getAllViewTaxa()
            .map((vt) => vt.taxon.getFullTaxonomicString());
    });

    function clearForms() {
        categoricalForm = { column: "", levels: [], keep: false };
        numericForm = { column: "", value: "", operator: ">" };
        taxonForm = { taxonId: "", operator: "", value: "" };
    }

    function updateLocalFilters() {
        filters = sampleManager.sampleControls.filters.map((f) => f.name);
    }

    function handleAddCategoricalFilter(event: Event) {
        sampleManager.sampleControls.addCategoricalMetadataFilter(
            categoricalForm.column,
            categoricalForm.levels,
            categoricalForm.keep,
        );

        clearForms();
        updateLocalFilters();
        sampleManager.render();
    }

    function handleAddNumericFilter(event: Event) {
        if (isNaN(Number(numericForm.value))) {
            alert("Please enter a valid number for 'value'.");
            clearForms();
            return;
        }

        sampleManager.sampleControls.addNumericMetadataFilter(
            numericForm.column,
            Number(numericForm.value),
            numericForm.operator as ">" | "<",
        );

        clearForms();
        updateLocalFilters();
        sampleManager.render();
    }

    function handleAddTaxonFilter(event: Event) {
        if (isNaN(Number(taxonForm.value))) {
            alert("Please enter a valid number for 'value'.");
            clearForms();
            return;
        }

        sampleManager.sampleControls.addAbundanceFilter(
            taxonForm.taxonId,
            Number(taxonForm.value),
            taxonForm.operator as ">" | "<",
        );

        clearForms();
        updateLocalFilters();
        sampleManager.render();
    }

    const categoricalColumns =
        sampleManager.sampleControls.metadata.getColumnNamesOfType(
            "categorical",
        );
    const numericColumns =
        sampleManager.sampleControls.metadata.getColumnNamesOfType("numeric");
</script>

<div class="">
    <h2>Add a Categorical Metadata Filter</h2>
    <select class="" name="column" bind:value={categoricalForm.column}>
        {#each categoricalColumns as name}
            <option value={name}>{name}</option>
        {/each}
    </select>
    <div>
        {#each categoricalColumnLevels as level}
            <input
                type="checkbox"
                value={level}
                name={level}
                bind:group={categoricalForm.levels}
            />
            <label for={level}>{level}</label>
        {/each}
    </div>
    <input
        type="checkbox"
        id="filter-or-retain"
        name="retain"
        bind:checked={categoricalForm.keep}
    />
    <label for="filter-or-retain">Retain</label>
    <button class="bg-blue-200 px-2" onclick={handleAddCategoricalFilter}>
        Add
    </button>

    <h2>Add a Numeric Metadata Filter</h2>
    <select class="" name="column" bind:value={numericForm.column}>
        {#each numericColumns as name}
            <option value={name}>{name}</option>
        {/each}
    </select>
    <label for="numericValue">Value:</label>
    <input type="text" name="numericValue" bind:value={numericForm.value} />
    <button class="" onclick={() => (numericForm.operator = ">")}>{">"}</button>
    <button class="" onclick={() => (numericForm.operator = "<")}>{"<"}</button>
    <button class="bg-blue-200 px-2" onclick={handleAddNumericFilter}>
        Add
    </button>

    <h2>Add a Taxon Abundance Filter</h2>
    <select class="" name="sort" bind:value={taxonForm.taxonId}>
        {#each viewTaxaNames as name}
            <option value={name}>{name}</option>
        {/each}
    </select>
    <label for="taxonValue">Value:</label>
    <input type="text" name="taxonValue" bind:value={taxonForm.value} />
    <button class="" onclick={() => (taxonForm.operator = ">")}>{">"}</button>
    <button class="" onclick={() => (taxonForm.operator = "<")}>{"<"}</button>
    <button class="bg-blue-200 px-2" onclick={handleAddTaxonFilter}>
        Add
    </button>
</div>
