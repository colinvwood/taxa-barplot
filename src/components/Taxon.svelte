<script>
    import { get } from 'svelte/store';

    import {
        globalTaxonomy, selectedTaxon, hubTaxon
    } from '../stores/stores.js';
    import {
        getParent, getSiblings, getChildren
    } from '../util/taxonomy.js';

    export let taxon;
    export let currentLevel = false;

    function handleSelect() {
        selectedTaxon.set(taxon);

        if (currentLevel) {
            hubTaxon.set(taxon);
        }
    }

    function toggleTaxonProperty(property) {
        return () => {
            globalTaxonomy.update(taxa => {
                for (let otherTaxon of taxa) {
                    if (otherTaxon == taxon) {
                        otherTaxon[property] = !taxon[property];
                    }
                }
                return taxa;
            });
        }
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
    <div class="buttons-container">
        <button
            class="filter-button {taxon.filter ? 'filtered' : ''}"
            on:click={toggleTaxonProperty('filter')}
        >F</button>
        <button
            class="group-button {taxon.group ? 'grouped' : ''}"
            on:click={toggleTaxonProperty('group')}
        >G</button>
        <button
            class="expand-button {taxon.expand ? 'expanded' : ''}"
            on:click={toggleTaxonProperty('expand')}
        >E</button>
    </div>
</div>


<style>
    .taxon {
        display: flex;
        justify-content: space-between;
        padding: 1px 10px;
    }

    .group-button {
    }
    .grouped {
        font-weight: bold;
        background-color: #609146;
    }

    .filter-button {
    }
    .filtered {
        font-weight: bold;
        background-color: #df4e28;
    }

    .expand-button {
    }
    .expanded {
        font-weight: bold;
        background-color: #fff44b;
    }
</style>
