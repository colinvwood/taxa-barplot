<script lang="ts">
    import Plot from "./lib/Plot.svelte";
    import FeatureSort from "./lib/FeatureSort.svelte";
    import FeatureFilters from "./lib/FeatureFilters.svelte";
    import SampleControls from "./lib/sample-controls/SampleControls.svelte";
    import { sampleManager } from "./classes/samples";

    const smPromise = sampleManager.parseFeatureTable("table.csv");

    const parsedPromise = smPromise.then((r) => {
        sampleManager.setPlotDimensions(500, 500);

        const tPromise = sampleManager.taxonomy.parse("taxonomy.tsv");
        const mdPromise = sampleManager.metadata.parse("metadata.tsv");
        const cPromise = sampleManager.colors.parse("colors.csv");

        return Promise.all([tPromise, mdPromise, cPromise]);
    });
</script>

{#await parsedPromise}
    <p>Loading...</p>
{:then}
    <Plot />
    <FeatureSort />
    <FeatureFilters />
    <SampleControls />
{:catch error}
    <p>An error occured: {error}</p>
{/await}
