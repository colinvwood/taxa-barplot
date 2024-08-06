<script>
    import Taxon from './Taxon.svelte';

    import { taxonomy } from '../stores/taxonomy.svelte.js';

    $effect(() => {
        taxonomy.render(taxonomy.viewLevel, taxonomy.changes);
        console.log('effect re ran');
    })
</script>

{#each taxonomy.rendered as taxon}
    <Taxon {taxon} />
{/each}
