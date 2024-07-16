<script>
    import { get } from 'svelte/store';
    import { onMount } from 'svelte';

    import { parseTaxonomy, parseFeatureTable }  from './util/parse.js';
    import { calculateTaxonomyStats } from './util/table.js';
    import { taxonomy, taxonomyChanges } from './stores/taxonomy.js';
    import { tableStore } from './stores/table.js';
    import { customColors } from './stores/colors.js';

    import Plot from './components/Plot.svelte';
    import TaxonomySelector from './components/TaxonomySelector.svelte';
    import TaxonomyLog from './components/TaxonomyLog.svelte';

    onMount(() => {
        let parsedTable = parseFeatureTable('table.csv', 'sample-id');
        let parsedTaxonomy = parseTaxonomy('taxonomy.tsv');

        Promise.all([parsedTable, parsedTaxonomy]).then((values) => {
            let parsedTable = values[0];
            tableStore.update(state => {
                return {...state, table: parsedTable}
            });

            let parsedTaxonomy = values[1];
            return calculateTaxonomyStats(parsedTaxonomy, parsedTable);
        })
        .then((taxonomyWithStats) => {
            taxonomy.set(taxonomyWithStats);
            tableStore.render(
                get(taxonomy), get(taxonomyChanges), 1, 'marine', $customColors
            );
        });
    });

</script>

<Plot />
<TaxonomySelector />
<TaxonomyLog />

<style>
</style>
