<script lang="ts">
    import { sampleManager } from "./../classes/sampleManager.svelte";
    import { Taxon } from "./../classes/taxonomy.svelte";

    function handleColorSchemeChange(event: Event) {
        sampleManager.render();
    }

    function handleRemoveColor(taxon: Taxon) {
        return (event: Event) => {
            sampleManager.colors.removeCustomColor(taxon);

            sampleManager.render();
        };
    }
</script>

<div
    class="grid rows-auto-min grid-cols-3 gap-2 border-2 border-blue-300 w-[24rem]"
>
    <h1
        class="row-start-1 col-start-1 col-end-4 justify-self-center text-lg font-bold"
    >
        Color Controls
    </h1>
    <label class="row-start-2 col-start-1 justify-self-end" for=""
        >Color Scheme:</label
    >
    <select
        class="row-start-2 col-start-2 select-primary"
        name="colorScheme"
        bind:value={sampleManager.colors.colorScheme}
        onchange={handleColorSchemeChange}
    >
        {#each sampleManager.colors.getColorSchemeNames() as scheme}
            <option value={scheme}>{scheme}</option>
        {/each}
    </select>
    <p class="row-start-3 col-start-1 col-end-4 widget-subheading">
        Applied Custom Colors
    </p>
    <div
        class="row-start-4 col-start-1 col-end-4 w-[20rem] h-[10rem]
        justify-self-center bg-gray-50 border-2 border-gray-300 rounded-sm
        overflow-scroll"
    >
        {#each sampleManager.colors.customColors.entries() as [taxon, color]}
            <div
                class="flex justify-between items-center mx-2 mt-1 p-2 min-h-8 bg-white border-2 border-gray-300 rounded-lg"
            >
                <p class="text-sm">
                    {taxon.name}
                </p>
                <button
                    class="bg-red-400 rounded-lg w-6 h-6 hover:cursor-pointer"
                    onclick={handleRemoveColor(taxon)}>X</button
                >
            </div>
        {/each}
    </div>
</div>
