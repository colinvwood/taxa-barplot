<script>
    import {
        globalTaxonomyStore, parentStore, siblingsStore, childrenStore
    } from '../stores/stores.js';
    import { getParent, getSiblings, getChildren } from '../util/taxonomy.js';

    export let taxon;
    export let selectable;

    function handleSelect(event) {
        if (!selectable) {
            return;
        }

        getParent($globalTaxonomyStore, taxon).then((parent) => {
            parentStore.set([parent]);
        });

        getSiblings($globalTaxonomyStore, taxon).then((siblings) => {
            siblingsStore.set(siblings);
        });

        getChildren($globalTaxonomyStore, taxon).then((children) => {
            childrenStore.set(children);
        });

    }

</script>

<button on:click={handleSelect}>{taxon.name}</button>

<style>
    button {
        display: block;
    }
</style>
