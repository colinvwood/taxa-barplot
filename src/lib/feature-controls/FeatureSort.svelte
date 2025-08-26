<script lang="ts">
    import { sampleManager } from "../../classes/sampleManager";

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

<div class="grid grid-cols-3 grid-rows-4 items-start gap-2 my-4">
    <h1 class="row-start-1 col-start-2 justify-self-center font-bold text-lg">
        Taxon Sort
    </h1>
    <label class="row-start-2 col-start-1 justify-self-end" for="sort">
        Sort by:
    </label>
    <select
        class="row-start-2 col-start-2 justify-self-start select-primary"
        name="sort"
        bind:value={form.sort}
    >
        {#each sorts as sort}
            <option value={sort}>{sort}</option>
        {/each}
    </select>

    <label class="row-start-3 col-start-1 justify-self-end" for="direction">
        Order:
    </label>
    <select
        class="row-start-3 col-start-2 select-primary"
        name="direction"
        bind:value={form.direction}
    >
        {#each directions as direction}
            <option value={direction}>{direction}</option>
        {/each}
    </select>
    <button
        class="row-start-4 col-start-2 button-primary mx-5"
        onclick={handleSetSort}>Apply</button
    >
</div>
