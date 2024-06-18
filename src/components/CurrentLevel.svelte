<script>
    import Taxon from './Taxon.svelte';

    import { taxonomy, viewLevel, taxonomyChanges } from '../stores/stores.js';
    import { renderCurrentView } from '../util/taxonomy.js';

    let taxa = [];
    $: $taxonomy, taxa = taxonomy.render($viewLevel, $taxonomyChanges);

</script>

{#each taxa as taxon}
    <Taxon {taxon} />
{/each}
