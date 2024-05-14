<script>
    import Taxon from './Taxon.svelte';

    import { globalTaxonomy, hubTaxon } from '../stores/stores.js';

    export let subsetter;
    export let currentLevel = false;

    $: taxaPromise = subsetter($globalTaxonomy, $hubTaxon)
</script>

{#await taxaPromise then taxa}
    {#if taxa != null && taxa.constructor === Array}
        {#each taxa as taxon}
            <Taxon {taxon} {currentLevel} />
        {/each}
    {:else if taxa != null}
        <Taxon taxon={taxa} {currentLevel} />
    {/if}
{/await}
