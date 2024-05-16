<script>
    import { get } from 'svelte/store';
    import Taxon from './Taxon.svelte';

    import { globalTaxonomy } from '../stores/stores.js';
    import { getTaxaAtViewLevel, renderTaxonomy } from '../util/taxonomy.js';

    export let viewLevel;
    export let currentLevel = false;

    let taxa = [];
    $: {
        renderTaxonomy($globalTaxonomy, viewLevel)
            .then((renderedTaxonomy) => {
                return getTaxaAtViewLevel(renderedTaxonomy, viewLevel);
            })
            .then((taxaAtLevel) => {
                taxa = taxaAtLevel;
            });

    }
</script>

{#each taxa as taxon}
    <Taxon {taxon} {currentLevel} />
{/each}
