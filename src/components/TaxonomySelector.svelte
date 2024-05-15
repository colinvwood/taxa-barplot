<script>
    import { onMount, onDestroy } from 'svelte';
    import { get } from 'svelte/store';

    import {
        renderTaxonomy, getParent, getSiblings, getChildren
    } from '../util/taxonomy.js';
    import { globalTaxonomy, selectedTaxon } from '../stores/stores.js';

    import TaxonList from './TaxonList.svelte';
    import TaxonInfo from './TaxonInfo.svelte';
    import CurrentLevel from './CurrentLevel.svelte';

    let viewLevel = 1;

</script>


<div class="container">
    <input bind:value={viewLevel} />

    <p>parent</p>
    <div class="parent">
        <TaxonList subsetter={getParent} {viewLevel} />
    </div>

    <p>siblings</p>
    <div class="siblings">
        <TaxonList subsetter={getSiblings} {viewLevel} />
    </div>

    <p>taxa at level {viewLevel}</p>
    <div class="currentLevel">
        <CurrentLevel currentLevel={true} {viewLevel} />
    </div>

    <p>children</p>
    <div class="children">
        <TaxonList subsetter={getChildren} {viewLevel} />
    </div>

    <p>info</p>
    <div class="info">
        <TaxonInfo taxon={$selectedTaxon} />
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
