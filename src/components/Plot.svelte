<script>
    import { get } from 'svelte/store';

    import Sample from './Sample.svelte';
    import {
        table, taxonomy, viewLevel, taxonomyChanges
    } from '../stores/stores.js';

    let dimensions = {};
    $: {
        dimensions = {
            width: $table.size * 50,
            height: 500,
        }
    }

    const abundanceAccessor = (abundances) => {
        // NOTE: metadata accessor will take `sample` object;
        // abundance accessors (like this one) will take id -> abundance map
        const taxon = 'k__Bacteria;p__Bacteroidetes';
        if (!abundances.has(taxon)) {
            return 0;
        }
        return abundances.get(taxon);
    }

    // let tableView;
    $: tableView = table.render(
        get(taxonomy), $viewLevel, $taxonomyChanges, abundanceAccessor
    );

</script>

<svg
    style="width: {dimensions.width}px; height: {dimensions.height}px;"
>
    {#await tableView then view}
        {#each view as sample, index}
            <Sample {sample} sampleIndex={index} {dimensions} />
        {/each}
    {/await}
</svg>

<style>
    svg {
        width: 1000px;
        height: 500px;
    }
</style>
