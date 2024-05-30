<script>
    import { get } from 'svelte/store';

    import Taxon from './Taxon.svelte';

    import { taxonomy, viewLevel } from '../stores/stores.js';
    import { getTaxaAtViewLevel, renderTaxonomy } from '../util/taxonomy.js';

    export let currentLevel = false;

    let taxa = [];

    // rerender taxonomy when view level changes
    $: taxonomy.render($viewLevel)

    // update taxonomy in list when taxonomy store changes
    $: {
        getTaxaAtViewLevel(
            $taxonomy, get(viewLevel)
        ).then((taxaAtLevel) => {
            taxa = taxaAtLevel;
        });
    }

</script>

{#each taxa as taxon}
    <Taxon {taxon} {currentLevel} />
{/each}
