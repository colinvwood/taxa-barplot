<script lang="ts">
    import Plot from "./lib/Plot.svelte";
    import FeatureControls from "./lib/FeatureControls.svelte";
    import SampleControls from "./lib/SampleControls.svelte";
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
    <div class="flex flex-col w-[100%] justify-around">
        <Plot />
        <div class="flex flex-row justify-around">
            <FeatureControls />
            <SampleControls />
        </div>
    </div>
{:catch error}
    <p>An error occured: {error}</p>
{/await}
