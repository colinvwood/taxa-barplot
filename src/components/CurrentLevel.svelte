<script>
    import Taxon from './Taxon.svelte';

    import { globalTaxonomy, hubTaxon } from '../stores/stores.js';

    export let subsetter;
    export let level;
    export let currentLevel = false;

    $: taxaPromise = subsetter($globalTaxonomy, level)
</script>

{#await taxaPromise then taxa}
    {#each taxa as taxon}
        <Taxon {taxon} {currentLevel} />
    {/each}
{/await}
