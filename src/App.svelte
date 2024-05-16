<script>
    import { parseTaxonomy, parseFeatureTable }  from './util/parse.js';
    import { globalTaxonomy } from './stores/stores.js';

    import TaxonomySelector from './components/TaxonomySelector.svelte';

    let table = parseFeatureTable('table.csv', 'sample-id');
    let taxonomy = parseTaxonomy('taxonomy.tsv');

    table.then((table) => {
        // console.log(table);
    });

    taxonomy.then((taxonomy) => {
        // calculate stats

        globalTaxonomy.set(taxonomy);
    });

</script>

<TaxonomySelector />

<style>
</style>
