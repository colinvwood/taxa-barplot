<script>
    import { get } from 'svelte/store';
    import {
        taxonomy, taxonomyLog
    } from '../stores/taxonomy.svelte.js';

    export let taxon;

    function handleClear() {
        taxonomyLog.update((log) => {
            return log.filter((item) => item.id != taxon.id);
        });

        taxonomy.toggleProperty(taxon.id, taxon.action);
        taxonomy.render();
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
