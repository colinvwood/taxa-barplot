<script lang="ts">
    import { sampleManager } from "../classes/sampleManager";

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

<div>
    <label for="sort">Sort by:</label>
    <select name="sort" bind:value={form.sort}>
        {#each sorts as sort}
            <option value={sort}>{sort}</option>
        {/each}
    </select>

    <label for="direction">Order:</label>
    <select name="direction" bind:value={form.direction}>
        {#each directions as direction}
            <option value={direction}>{direction}</option>
        {/each}
    </select>
    <button onclick={handleSetSort}>Apply</button>
</div>
