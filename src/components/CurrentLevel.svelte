<script>
    import Taxon from './Taxon.svelte';

    import { globalTaxonomy } from '../stores/stores.js';
    import { getTaxaAtViewLevel } from '../util/taxonomy.js';

    export let viewLevel;
    export let currentLevel = false;

    $: taxaPromise = getTaxaAtViewLevel($globalTaxonomy, viewLevel)
</script>

{#await taxaPromise then taxa}
    <p>{console.log('current level rerender', taxa)}
    {#each taxa as taxon}
        <Taxon {taxon} {currentLevel} {viewLevel} />
    {/each}
{/await}
