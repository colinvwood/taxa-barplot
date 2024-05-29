<script>
    import { get } from 'svelte/store';

    import Taxon from './Taxon.svelte';

    import { globalTaxonomy, viewLevel } from '../stores/stores.js';
    import { getTaxaAtViewLevel, renderTaxonomy } from '../util/taxonomy.js';

    export let currentLevel = false;

    let taxa = [];

    // rerender taxonomy when view level changes
    $: {
        renderTaxonomy(
            get(globalTaxonomy), $viewLevel
        ).then((renderedTaxonomy) => {
            console.log('taxonomy rerenderd to level in current level');
            globalTaxonomy.set(renderedTaxonomy);
        })
    }

    // update taxonomy in list when taxonomy store changes
    $: {
        getTaxaAtViewLevel(
            $globalTaxonomy, get(viewLevel)
        ).then((taxaAtLevel) => {
            console.log('getting taxa at level in current level component')
            console.log('view level', get(viewLevel));
            taxa = taxaAtLevel;
        });
    }

</script>

{#each taxa as taxon}
    <Taxon {taxon} {currentLevel} />
{/each}
