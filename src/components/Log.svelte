<script>
    import { get } from 'svelte/store';
    import {
        globalTaxonomy, taxonomyLog, viewLevel
    } from '../stores/stores.js';
    import { renderTaxonomy } from '../util/taxonomy.js';

    export let taxon;

    function handleClear() {
        taxonomyLog.update((log) => {
            return log.filter((item) => item.id != taxon.id);
        });

        // update taxon in local copy of taxonomy
        let taxonomy = get(globalTaxonomy).map(globalTaxon => {
            if (globalTaxon.id == taxon.id) {
                globalTaxon[taxon.action] = false;
            }
            return globalTaxon;
        });

        // render modified taxonomy and update store
        renderTaxonomy(taxonomy, get(viewLevel)).then(renderedTaxonomy => {
            globalTaxonomy.set(renderedTaxonomy);
        })

    }


</script>

<div class="log">
    <span>{taxon.name}</span>
    <span>{taxon.action}</span>
    <button on:click={handleClear}>X</button>
</div>

<style>
    .log {
        display: flex;
        justify-content: space-between;
        padding: 1px 5px;
    }

</style>
