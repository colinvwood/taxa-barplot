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

    // let tableView;
    $: tableView = table.render(
        get(taxonomy), $viewLevel, $taxonomyChanges
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
