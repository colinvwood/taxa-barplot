<script lang="ts">
    import { sampleManager } from "./../classes/sampleManager";
    import { ViewTaxon } from "./../classes/taxonomy";

    let localViewTaxon: ViewTaxon | null = $state(null);
    let filtered = $state(false);

    sampleManager.eventBus.addEventListener("taxon-selected", (e) => {
        localViewTaxon = (e as any).detail.viewTaxon;
    });

    sampleManager.eventBus.addEventListener("taxon-filter-removed", (e) => {
        filtered = localViewTaxon?.taxon.filtered ?? false;
    });

    function handleTaxonFilter(event: Event) {
        console.log("in handler");
        if (localViewTaxon == null) {
            return;
        }

        localViewTaxon.taxon.filtered = filtered;

        if (filtered) {
            sampleManager.featureControls.addTaxonFilter(localViewTaxon.taxon);
        } else {
            sampleManager.featureControls.removeFilter(
                localViewTaxon.taxon.name,
            );
        }

        sampleManager.eventBus.dispatchEvent(
            new CustomEvent("sync-taxon-filters"),
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
        {localViewTaxon?.taxon.name ?? ""}
    </p>
    <p class="row-start-3 col-start-1 justify-self-end">Mean Abundance:</p>
    <p class="row-start-3 col-start-2 justify-self-start">
        {localViewTaxon?.meanRelAbun.toFixed(3) ?? ""}
    </p>
    <p class="row-start-4 col-start-1 justify-self-end">Prevalence:</p>
    <p class="row-start-4 col-start-2 justify-self-start">
        {`${localViewTaxon?.preval.toFixed(3) ?? ""} (${localViewTaxon?.prevalProp.toFixed(3)} ?? "")`}
    </p>
    <p class="row-start-5 col-start-1 justify-self-end">Color:</p>
    <p class="row-start-5 col-start-2 justify-self-start">
        {"todo"}
    </p>
    <p class="row-start-6 col-start-1 justify-self-end">Filter:</p>
    <input
        class="row-start-6 col-start-2 justify-self-start"
        type="checkbox"
        bind:checked={filtered}
        onchange={handleTaxonFilter}
    />
</div>
