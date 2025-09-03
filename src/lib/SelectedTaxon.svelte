<script lang="ts">
    import { sampleManager } from "./../classes/sampleManager.svelte";

    let filtered: boolean = $state(false);

    sampleManager.eventBus.addEventListener("taxon-selected", (e) => {
        const viewTaxon = (e as any).detail.viewTaxon;
        sampleManager.selectedTaxon = viewTaxon;
    });

    function handleTaxonFilter(event: Event) {
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
</script>

<div
    class="grid rows-auto-min grid-cols-2 gap-2 w-[20rem] border-2 border-blue-300"
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
    <p class="row-start-3 col-start-1 justify-self-end">Mean Abundance:</p>
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
            class="row-start-5 col-start-2 w-[1.5rem] h-[1.5rem] border-2 border-gray-300 rounded-md hover:cursor-pointer"
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
            onchange={handleTaxonFilter}
        />
    {/if}
</div>
