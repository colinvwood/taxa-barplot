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

<div class="grid auto-rows-min grid-cols-3 gap-x-2 gap-y-2">
    <h1 class="row-start-1 col-start-2 justify-self-center text-lg font-bold">
        Sample Sorts
    </h1>

    <p
        class="row-start-2 col-start-2 justify-self-center text-sm font-bold text-center"
    >
        Sort by Metadata
    </p>

    <label class="row-start-3 col-start-1 justify-self-end" for="sortColumn">
        Column:
    </label>
    <select
        class="row-start-3 col-start-2 select-primary"
        name="sortColumn"
        bind:value={sortColumn}
    >
        {#each sampleManager.sampleControls.metadata.getColumnNames() as name}
            <option value={name}>{name}</option>
        {/each}
    </select>

    <label class="row-start-4 col-start-1 justify-self-end" for="sortDirection">
        Direction:
    </label>
    <select
        class="row-start-4 col-start-2 select-primary"
        name="sortDirection"
        bind:value={mdSortDirection}
    >
        <option value="ascending">ascending</option>
        <option value="descending">descending</option>
    </select>

    <button
        class="row-start-5 col-start-2 justify-self-center button-primary"
        onclick={handleAddMetadataSort}>Add</button
    >

    <p
        class="p-0 m-0 row-start-6 col-start-2 justify-self-center text-sm font-bold leading-none text-center"
    >
        Sort by Taxon Abundance
    </p>

    <label class="row-start-7 col-start-1 justify-self-end" for="sortTaxon">
        Taxon:
    </label>
    <select
        class="row-start-7 col-start-2 select-primary"
        name="sortTaxon"
        bind:value={sortTaxon}
    >
        {#each viewTaxaNames as name}
            <option value={name}>{name}</option>
        {/each}
    </select>
    <label
        class="row-start-8 col-start-1 justify-self-end"
        for="taxonDirection"
    >
        Direction:
    </label>
    <select
        class="row-start-8 col-start-2 select-primary"
        name="taxonDirection"
        bind:value={abunSortDirection}
    >
        <option value="ascending">ascending</option>
        <option value="descending">descending</option>
    </select>
    <button
        class="row-start-9 col-start-2 justify-self-center button-primary"
        onclick={handleAddAbundanceSort}
    >
        Add
    </button>

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
