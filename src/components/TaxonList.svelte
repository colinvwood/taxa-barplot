<script>
    import Taxon from './Taxon.svelte';

    export let taxa = [];
    export let selectable = false;

</script>

<div>
    {#each taxa as taxon}
        <Taxon {taxon} {selectable} />
    {/each}
</div>
