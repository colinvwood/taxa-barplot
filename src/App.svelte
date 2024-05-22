<script>
    import { parseTaxonomy, parseFeatureTable }  from './util/parse.js';
    import { calculateTaxonomyStats } from './util/table.js';
    import { globalTaxonomy } from './stores/stores.js';

    import TaxonomySelector from './components/TaxonomySelector.svelte';
    import TaxonomyLog from './components/TaxonomyLog.svelte';

    let table = parseFeatureTable('table.csv', 'sample-id');
    let taxonomy = parseTaxonomy('taxonomy.tsv');

    Promise.all([table, taxonomy]).then((values) => {
        let table = values[0];
        let taxonomy = values[1];
        return calculateTaxonomyStats(taxonomy, table);
    })
    .then((taxonomy) => {
        globalTaxonomy.set(taxonomy);
    });

</script>

<TaxonomySelector />
<TaxonomyLog />

<style>
</style>
