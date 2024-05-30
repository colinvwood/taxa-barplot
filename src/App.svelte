<script>
    import { parseTaxonomy, parseFeatureTable }  from './util/parse.js';
    import { calculateTaxonomyStats } from './util/table.js';
    import { taxonomy, globalTable } from './stores/stores.js';

    import TaxonomySelector from './components/TaxonomySelector.svelte';
    import TaxonomyLog from './components/TaxonomyLog.svelte';

    let table = parseFeatureTable('table.csv', 'sample-id');
    let taxonomyRecords = parseTaxonomy('taxonomy.tsv');

    Promise.all([table, taxonomyRecords]).then((values) => {
        let table = values[0];
        globalTable.set(table);

        let taxonomyRecords = values[1];
        return calculateTaxonomyStats(taxonomyRecords, table);
    })
    .then((taxonomyRecordsWithStats) => {
        taxonomy.set(taxonomyRecordsWithStats);
    });

</script>

<TaxonomySelector />
<TaxonomyLog />

<style>
</style>
