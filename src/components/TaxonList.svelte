<script>
    import Taxon from './Taxon.svelte';

    import { taxonomy, selectedTaxon } from '../stores/taxonomy.js';

    export let subsetter;

    $: taxa = subsetter($taxonomy, $selectedTaxon)
</script>

{#if taxa != null && taxa.constructor === Array}
    {#each taxa as taxon}
        <Taxon {taxon} />
    {/each}
{:else if taxa != null}
    <Taxon taxon={taxa} />
{/if}
