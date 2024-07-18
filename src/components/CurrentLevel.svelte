<script>
    import Taxon from './Taxon.svelte';

    import { taxonomy } from '../stores/taxonomy.svelte.js';
</script>

{#each taxonomy.rendered as taxon}
    <Taxon {taxon} />
{/each}
