<script>
    import Log from './Log.svelte';
    import { taxonomyLog } from '../stores/stores.js';
</script>

<div class="taxonomy-log">
    {#each $taxonomyLog as taxon}
        <Log {taxon} />
    {/each}
</div>

<style>
    .taxonomy-log {
        border: 1px solid black;
        height: 100px;
        width: 400px;
        overflow: scroll;
    }
</style>
