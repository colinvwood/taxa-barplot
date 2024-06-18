<script>
    import { get } from 'svelte/store';
    import { parseTaxonomy, parseFeatureTable }  from './util/parse.js';
    import { calculateTaxonomyStats } from './util/table.js';
    import { taxonomy, table, taxonomyChanges } from './stores/stores.js';

    import Plot from './components/Plot.svelte';
    import TaxonomySelector from './components/TaxonomySelector.svelte';
    import TaxonomyLog from './components/TaxonomyLog.svelte';

    let parsedTable = parseFeatureTable('table.csv', 'sample-id');
    let parsedTaxonomy = parseTaxonomy('taxonomy.tsv');

    Promise.all([parsedTable, parsedTaxonomy]).then((values) => {
        let parsedTable = values[0];
        table.set(parsedTable);

        let parsedTaxonomy = values[1];
        return calculateTaxonomyStats(parsedTaxonomy, parsedTable);
    })
    .then((taxonomyWithStats) => {
        taxonomy.set(taxonomyWithStats);
        table.render(get(taxonomy), 1, get(taxonomyChanges));
    });

</script>

<Plot />
<TaxonomySelector />
<TaxonomyLog />

<style>
</style>
