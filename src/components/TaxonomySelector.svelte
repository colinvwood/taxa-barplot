<script>
    import { onMount, onDestroy } from 'svelte';
    import { get } from 'svelte/store';

    import { getTaxaAtLevel } from '../util/taxonomy.js';
    import {
        globalTaxonomyStore, parentStore, siblingsStore, childrenStore
    } from '../stores/stores.js';

    import TaxonList from './TaxonList.svelte';

    let currentLevel = 1;
    let currentLevelTaxa = [];

    let unsubscribe;
    onMount(async() => {
        unsubscribe = globalTaxonomyStore.subscribe(async(taxonomy) => {
            currentLevelTaxa = await getTaxaAtLevel(
                taxonomy, currentLevel
            );
        });
    });

    onDestroy(() => {
        unsubscribe();
    });

    async function handleLevelChange(event) {
        currentLevelTaxa = await getTaxaAtLevel(
            get(globalTaxonomyStore), currentLevel
        );
    }


</script>


<div id="container">
    <input bind:value={currentLevel} />
    <button on:click={handleLevelChange}>Update</button>

    <p>parent</p>
    <div id="parent">
        <TaxonList taxa={$parentStore} />
    </div>

    <p>siblings</p>
    <div id="siblings">
        <TaxonList taxa={$siblingsStore}/>
    </div>

    <p>taxa at level {currentLevel}</p>
    <div id="currentLevel">
        <TaxonList taxa={currentLevelTaxa} selectable={true} />
    </div>

    <p>children</p>
    <div id="children">
        <TaxonList taxa={$childrenStore} />
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

    #container {
        width: 400px;
        border: none;
        display: block;
    }
    #parent {
        height: 25px;
    }
    #siblings {
        height: 100px;
    }
    #currentLevel {
        height: 400px;
    }
    #children {
        height: 200px;
    }
</style>
