<script>
    import Taxon from './Taxon.svelte';

    import { taxonomy, hubTaxon } from '../stores/stores.js';

    export let subsetter;
    export let currentLevel = false;

    $: taxa = subsetter($taxonomy, $hubTaxon)
</script>

{#if taxa != null && taxa.constructor === Array}
    {#each taxa as taxon}
        <Taxon {taxon} {currentLevel} />
    {/each}
{:else if taxa != null}
    <Taxon taxon={taxa} {currentLevel} />
{/if}
