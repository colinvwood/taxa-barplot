<script lang="ts">
    import { sampleManager } from "./../classes/sampleManager.svelte";

    let filtered: boolean = $state(false);
    let expandLevel: number | null = null;

    sampleManager.eventBus.addEventListener("taxon-selected", (e) => {
        const viewTaxon = (e as any).detail.viewTaxon;
        sampleManager.selectedTaxon = viewTaxon;
    });

    function handleFilter(event: Event) {
        if (sampleManager.selectedTaxon == null) {
            return;
        }

        if (sampleManager.selectedTaxon.taxon.filtered) {
            sampleManager.featureControls.addTaxonFilter(
                sampleManager.selectedTaxon.taxon,
            );
            sampleManager.selectedTaxon.taxon.filtered = true;
        } else {
            sampleManager.featureControls.removeFilter(
                sampleManager.selectedTaxon.taxon.name,
            );
            sampleManager.selectedTaxon.taxon.filtered = false;
        }

        sampleManager.render();
    }

    function handleColorChange(event: Event) {
        const oldColor = sampleManager.colors.getTaxonColor(
            sampleManager.selectedTaxon!.taxon,
        );

        const newColor = (event.target as HTMLInputElement).value;

        if (oldColor!.toLowerCase() == newColor.toLowerCase()) {
            return;
        }

        sampleManager.colors.addCustomColor(
            sampleManager.selectedTaxon!.taxon,
            newColor,
        );

        sampleManager.render();
    }

    function handleExpansion(event: Event) {
        const selectedTaxonDepth =
            sampleManager.selectedTaxon!.taxon.getLevel();
        const maxDepth = sampleManager.taxonomy.getDepth();

        let expandToValue = Number(sampleManager.selectedTaxon!.taxon.expandTo);

        if (expandToValue == 0) {
            // empty input acts as reset
            sampleManager.selectedTaxon!.taxon.expandTo = null;
            sampleManager.taxonomy.expansions.delete(
                sampleManager.selectedTaxon!.taxon,
            );
            sampleManager.render();
            return;
        }

        if (isNaN(expandToValue)) {
            sampleManager.selectedTaxon!.taxon.expandTo = null;
            alert("Please enter a number for the expand-to level.");
            return;
        }

        if (expandToValue <= selectedTaxonDepth || expandToValue > maxDepth) {
            sampleManager.selectedTaxon!.taxon.expandTo = null;
            alert(
                `Level must be between ${selectedTaxonDepth + 1} and ${maxDepth}`,
            );
            return;
        }

        sampleManager.selectedTaxon!.taxon.expandTo = expandToValue;
        sampleManager.taxonomy.expansions.add(
            sampleManager.selectedTaxon!.taxon,
        );
        sampleManager.render();
    }
</script>

<div
    class="grid rows-auto-min grid-cols-2 gap-2 w-[26rem] border-2 border-blue-300 py-[1rem]"
>
    <h1
        class="row-start-1 col-start-1 col-end-4 justify-self-center text-lg font-bold"
    >
        Selected Taxon
    </h1>

    <p class="row-start-2 col-start-1 justify-self-end">Name:</p>
    <p class="row-start-2 col-start-2 justify-self-start">
        {#if sampleManager.selectedTaxon}
            {sampleManager.selectedTaxon.taxon.name}
        {/if}
    </p>
    <p class="row-start-3 col-start-1 justify-self-end">Mean Abun:</p>
    <p class="row-start-3 col-start-2 justify-self-start">
        {#if sampleManager.selectedTaxon}
            {sampleManager.selectedTaxon.meanRelAbun.toFixed(3)}
        {/if}
    </p>
    <p class="row-start-4 col-start-1 justify-self-end">Prevalence:</p>
    <p class="row-start-4 col-start-2 justify-self-start">
        {#if sampleManager.selectedTaxon}
            {`${sampleManager.selectedTaxon.preval.toString()}
            (${sampleManager.selectedTaxon.prevalProp.toFixed(3)})`}
        {/if}
    </p>
    <p class="row-start-5 col-start-1 justify-self-end">Color:</p>
    {#if sampleManager.selectedTaxon != null}
        <input
            class="row-start-5 col-start-2 w-[1.5rem] h-[1.5rem] rounded-md border-2 border-gray-300 hover:cursor-pointer"
            type="color"
            bind:value={sampleManager.selectedTaxon.taxon.color}
            onchange={handleColorChange}
        />
    {/if}
    <p class="row-start-6 col-start-1 justify-self-end">Filter:</p>
    {#if sampleManager.selectedTaxon != null}
        <input
            class="row-start-6 col-start-2 justify-self-start"
            type="checkbox"
            bind:checked={sampleManager.selectedTaxon.taxon.filtered}
            onchange={handleFilter}
        />
    {/if}
    <p class="row-start-7 col-start-1 justify-self-end">Level:</p>
    {#if sampleManager.selectedTaxon != null}
        <p class="row-start-7 col-start-2 text-md font-bold">
            {sampleManager.selectedTaxon.taxon.getLevel()}
        </p>
    {/if}
    <p class="row-start-8 col-start-1 justify-self-end">Expand to Level:</p>
    {#if sampleManager.selectedTaxon != null}
        <input
            class="row-start-8 col-start-2 input-primary w-[6rem]"
            type="text"
            bind:value={sampleManager.selectedTaxon.taxon.expandTo}
        />
    {/if}
    <button
        class="row-start-9 col-start-1 col-end-4 justify-self-center button-primary mt-[0.5rem]"
        onclick={handleExpansion}
    >
        Apply
    </button>
</div>
