<script>
    import Taxon from './Taxon.svelte';

    import { taxonomy, viewLevel } from '../stores/stores.js';
    import { getTaxaAtViewLevel, renderTaxonomy } from '../util/taxonomy.js';

    export let currentLevel = false;


    // update taxonomy in list when taxonomy store changes
    let taxa = [];
    $: taxa = getTaxaAtViewLevel($taxonomy, $viewLevel)

</script>

{#each taxa as taxon}
    <Taxon {taxon} {currentLevel} />
{/each}
