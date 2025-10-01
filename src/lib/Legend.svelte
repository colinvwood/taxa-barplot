<script lang="ts">
    import { sampleManager } from "../classes/sampleManager.svelte";
    import { ViewTaxon } from "../classes/taxonomy.svelte";

    let legendRecords = $derived.by(() => {
        return sampleManager.colors.getLegendData(
            sampleManager,
            sampleManager.colors.assignedColors,
            sampleManager.colors.customColors,
        );
    });

    function handleLegendClick(viewTaxon: ViewTaxon) {
        return () => {
            sampleManager.selectedTaxon = viewTaxon;
        };
    }
</script>

<div
    class="flex flex-col align-center w-[26rem] border-2 border-blue-300 py-[1rem]"
>
    <h1>Legend</h1>
    {#each legendRecords as legendRecord}
        <div
            class="flex w-[24rem] border-2 border-gray-300 rounded-lg hover:cursor-pointer"
            onclick={handleLegendClick(legendRecord[0])}
            role="button"
            tabindex="0"
            onkeydown={() => {}}
        >
            <div
                class="w-[1.5rem] h-[1.5rem] border-2 border-gray-300 rounded-md mr-[0.5rem]"
                style="background-color: {legendRecord[1]};"
            ></div>
            <p>{legendRecord[0].taxon.name}</p>
        </div>
    {/each}
</div>
