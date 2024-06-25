<script>
    import {
        getParent, getSiblings, getChildren
    } from '../util/taxonomy.js';
    import { selectedTaxon, viewLevel } from '../stores/stores.js';

    import TaxonList from './TaxonList.svelte';
    import SelectedTaxon from './SelectedTaxon.svelte';
    import CurrentLevel from './CurrentLevel.svelte';

</script>


<div class="container">
    <input bind:value={$viewLevel} />

    <p>parent</p>
    <div class="parent">
        <TaxonList subsetter={getParent} />
    </div>

    <p>siblings</p>
    <div class="siblings">
        <TaxonList subsetter={getSiblings} />
    </div>

    <p>taxa at level {$viewLevel}</p>
    <div class="currentLevel">
        <CurrentLevel />
    </div>

    <p>children</p>
    <div class="children">
        <TaxonList subsetter={getChildren} />
    </div>

    <p>info</p>
    <div class="info">
        <SelectedTaxon />
    </div>

</div>

<style>
    div {
        border: 1px solid black;
        width: 300px;
        overflow: scroll;
        margin: 10px;
    }
    p {
        margin-top: 20px;
        margin-left: 10px;
        margin-bottom: 0px;
    }

    .container {
        width: 400px;
        border: none;
        display: block;
    }
    .parent {
        height: 25px;
    }
    .siblings {
        height: 100px;
    }
    .currentLevel {
        height: 400px;
    }
    .children {
        height: 200px;
    }
</style>
