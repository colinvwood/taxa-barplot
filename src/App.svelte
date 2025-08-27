<script lang="ts">
    import Plot from "./lib/Plot.svelte";
    import SampleFilters from "./lib/sample-controls/SampleFilters.svelte";
    import SampleSorts from "./lib/sample-controls/SampleSorts.svelte";
    import SampleLabels from "./lib/sample-controls/SampleLabels.svelte";
    import FeatureFilters from "./lib/feature-controls/FeatureFilters.svelte";
    import FeatureSort from "./lib/feature-controls/FeatureSort.svelte";
    import { sampleManager } from "./classes/sampleManager";

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
    <div class="flex flex-col justify-around">
        <Plot />
        <div class="flex flex-row flex-wrap justify-around items-start">
            <FeatureSort />
            <FeatureFilters />
            <SampleSorts />
            <SampleFilters />
            <SampleLabels />
        </div>
    </div>
{:catch error}
    <p>An error occured: {error}</p>
{/await}
