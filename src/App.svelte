<script lang="ts">
    import Plot from "./lib/Plot.svelte";
    import PlotControls from "./lib/PlotControls.svelte";
    import Legend from "./lib/Legend.svelte";
    import FeatureSort from "./lib/feature-controls/FeatureSort.svelte";
    import FeatureFilters from "./lib/feature-controls/FeatureFilters.svelte";
    import SampleSorts from "./lib/sample-controls/SampleSorts.svelte";
    import SampleFilters from "./lib/sample-controls/SampleFilters.svelte";
    import SampleLabels from "./lib/sample-controls/SampleLabels.svelte";
    import SelectedTaxon from "./lib/SelectedTaxon.svelte";
    import ColorControls from "./lib/ColorControls.svelte";
    import { sampleManager } from "./classes/sampleManager.svelte";

    const smPromise = sampleManager.parseFeatureTable("table.csv");

    const parsedPromise = smPromise.then((r) => {
        const tPromise = sampleManager.taxonomy.parse("taxonomy.tsv");
        const mdPromise =
            sampleManager.sampleControls.metadata.parse("metadata.tsv");
        const cPromise = sampleManager.colors.parse("colors.csv");

        return Promise.all([tPromise, mdPromise, cPromise]);
    });
</script>

{#await parsedPromise}
    <p>Loading...</p>
{:then}
    <div class="flex flex-col justify-around w-[100%]">
        <Plot />
        <div class="flex flex-row flex-wrap justify-start items-start">
            <PlotControls />
            <Legend />
            <FeatureSort />
            <FeatureFilters />
            <SampleSorts />
            <SampleFilters />
            <SampleLabels />
            <SelectedTaxon />
            <ColorControls />
        </div>
    </div>
{:catch error}
    <p>An error occured: {error}</p>
{/await}
