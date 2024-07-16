<script>
    import { selectedTaxon } from '../stores/taxonomy.js';

    export let taxon;

    function handleSelect() {
        selectedTaxon.set(taxon);
    }
</script>

<div
    class="taxon"
    on:click={handleSelect}
    on:keydown={handleSelect}
    role="button"
    tabindex="0"
>
    <span>{taxon.name}</span>
</div>


<style>
    .taxon {
        display: flex;
        justify-content: space-between;
        padding: 1px 10px;
        cursor: pointer;
    }
</style>
