<script>
    import { get } from 'svelte/store';

    import HoveredTaxon from './HoveredTaxon.svelte';
    import Sample from './Sample.svelte';

    import { tableStore, table, rendered } from '../stores/table.svelte.js';

    import { taxonomy } from '../stores/taxonomy.svelte.js';
    import { customColors } from '../stores/colors.js';

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

    $: tableStore.render(
        taxonomy.taxonomy, taxonomy.changes, taxonomy.viewLevel, 'marine', $customColors
    );

</script>

<svg
    style="width: {dimensions.width}px; height: {dimensions.height}px;"
>
    {#each $rendered as sample, index}
        <Sample {sample} sampleIndex={index} {dimensions} />
    {/each}
</svg>
<HoveredTaxon />

<style>
    svg {
        width: 1000px;
        height: 500px;
    }
</style>
