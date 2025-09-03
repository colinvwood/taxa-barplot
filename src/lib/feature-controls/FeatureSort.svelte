<script lang="ts">
    import { sampleManager } from "../../classes/sampleManager.svelte";

    let sorts = ["mean relative abundance", "prevalence"];
    let directions = ["ascending", "descending"];

    let form = $state({ sort: "", direction: "" });

    function handleSetSort(event: Event) {
        sampleManager.featureControls.setSort(
            form.sort as "mean relative abundance" | "prevalence",
            form.direction == "ascending",
        );
        sampleManager.render();
    }
</script>

<div
    class="grid grid-cols-3 auto-rows-min items-start gap-2 py-2 w-[22rem] h-[10rem] border-2 border-blue-200"
>
    <h1 class="row-start-1 col-start-2 justify-self-center font-bold text-lg">
        Taxon Sort
    </h1>
    <label class="row-start-2 col-start-1 justify-self-end" for="sort">
        Sort by:
    </label>
    <select
        class="row-start-2 col-start-2 select-primary w-[12rem]"
        name="sort"
        bind:value={form.sort}
    >
        {#each sorts as sort}
            <option value={sort}>{sort}</option>
        {/each}
    </select>

    <label class="row-start-3 col-start-1 justify-self-end" for="direction">
        Direction:
    </label>
    <select
        class="row-start-3 col-start-2 select-primary w-[12rem]"
        name="direction"
        bind:value={form.direction}
    >
        {#each directions as direction}
            <option value={direction}>{direction}</option>
        {/each}
    </select>
    <button
        class="row-start-4 col-start-2 button-primary justify-self-center"
        onclick={handleSetSort}>Apply</button
    >
</div>
