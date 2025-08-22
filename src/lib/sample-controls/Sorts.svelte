<script lang="ts">
    import { onMount } from "svelte";
    import { sampleManager } from "../../classes/sampleManager";

    let sorts: string[] = $state([]);

    let sortColumn: string = $state("");
    let mdSortDirection: string = $state("ascending");

    let sortTaxon: string = $state("");
    let abunSortDirection: string = $state("ascending");

    let dragIndex: number | null = $state(null);

    // TODO: render hook
    let viewTaxaNames: string[] = $state([]);
    onMount(() => {
        viewTaxaNames = sampleManager
            .getAllViewTaxa()
            .map((vt) => vt.taxon.getFullTaxonomicString());
    });

    function handleAddMetadataSort(event: Event) {
        sampleManager.sampleControls.addMetadataSort(
            sortColumn,
            mdSortDirection == "ascending",
        );

        sortColumn = "";
        mdSortDirection = "ascending";

        sorts = sampleManager.sampleControls.sorts.map((s) => s.name);
        sampleManager.render();
    }
    function handleAddAbundanceSort(event: Event) {
        sampleManager.sampleControls.addAbundanceSort(
            sortTaxon,
            abunSortDirection == "ascending",
        );

        sortTaxon = "";
        abunSortDirection = "ascending";

        sorts = sampleManager.sampleControls.sorts.map((s) => s.name);
        sampleManager.render();
    }
    function handleRemoveSort(event: Event, sortName: string) {
        sampleManager.sampleControls.removeSort(sortName);
        sorts = sampleManager.sampleControls.sorts.map((s) => s.name);
        sampleManager.render();
    }

    function handleDragStart(event: DragEvent, index: number) {
        dragIndex = index;
        event.dataTransfer!.effectAllowed = "move";
    }
    function handleDragOver(event: DragEvent) {
        event.preventDefault();
        event.dataTransfer!.dropEffect = "move";
    }
    async function handleDragDrop(event: DragEvent, dropIndex: number) {
        event.preventDefault();

        if (dragIndex != null && dragIndex != dropIndex) {
            const updated = [...sorts];
            const [moved] = updated.splice(dragIndex, 1);
            updated.splice(dropIndex, 0, moved);
            sorts = updated;
        }

        dragIndex = null;

        sampleManager.sampleControls.updateSortOrder(sorts);
        setTimeout(() => {
            sampleManager.render();
        }, 10);
    }
</script>

<div class="w-[200px] flex flex-col border m-2">
    <h2 class="font-bold">Add a Metadata Sort</h2>
    <select class="" name="sort" bind:value={sortColumn}>
        {#each sampleManager.sampleControls.metadata.getColumnNames() as name}
            <option value={name}>{name}</option>
        {/each}
    </select>
    <select name="sort" bind:value={mdSortDirection}>
        <option value="ascending">ascending</option>
        <option value="descending">descending</option>
    </select>
    <button onclick={handleAddMetadataSort}>Add</button>

    <h2 class="font-bold">Add a Taxon Abundance Sort</h2>
    <select class="" name="sort" bind:value={sortTaxon}>
        {#each viewTaxaNames as name}
            <option value={name}>{name}</option>
        {/each}
    </select>
    <select name="sort" bind:value={abunSortDirection}>
        <option value="ascending">ascending</option>
        <option value="descending">descending</option>
    </select>
    <button onclick={handleAddAbundanceSort}>Add</button>

    <ul>
        {#each sorts as sort, index}
            <li
                class="p-2 border mb-1 cursor-move"
                draggable="true"
                ondragstart={(e) => handleDragStart(e, index)}
                ondragover={handleDragOver}
                ondrop={(e) => handleDragDrop(e, index)}
            >
                <p>{sort}</p>
                <button onclick={(e) => handleRemoveSort(e, sort)}>
                    Remove
                </button>
            </li>
        {/each}
    </ul>
</div>
