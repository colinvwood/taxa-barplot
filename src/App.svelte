<script>
    import { parseTaxonomy, parseFeatureTable }  from './util/parse.js';
    import { calculateTaxonomyStats } from './util/table.js';
    import { taxonomy, table } from './stores/stores.js';

    import TaxonomySelector from './components/TaxonomySelector.svelte';
    import TaxonomyLog from './components/TaxonomyLog.svelte';

    let tableRecords = parseFeatureTable('table.csv', 'sample-id');
    let taxonomyRecords = parseTaxonomy('taxonomy.tsv');

    Promise.all([tableRecords, taxonomyRecords]).then((values) => {
        let tableRecords = values[0];
        table.set(tableRecords);

        let taxonomyRecords = values[1];
        return calculateTaxonomyStats(taxonomyRecords, tableRecords);
    })
    .then((taxonomyRecordsWithStats) => {
        taxonomy.set(taxonomyRecordsWithStats);
    });

</script>

<TaxonomySelector />
<TaxonomyLog />

<style>
</style>
