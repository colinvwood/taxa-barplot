<script>
    import { get } from 'svelte/store';
    import { globalTaxonomy, taxonomyLog } from '../stores/stores.js';

    export let taxon;

    function handleClear() {
        taxonomyLog.update((log) => {
            return log.filter((item) => item.id != taxon.id);
        });

        // TODO: define func, replace here and in Taxon component
        globalTaxonomy.update(taxonomy => {
            return taxonomy.map(globalTaxon => {
                if (globalTaxon.id == taxon.id) {
                    globalTaxon[taxon.action] = false;
                }
                return globalTaxon;
            });
        });

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
