<script>
    import { get } from 'svelte/store'
    import {
        globalTaxonomy, selectedTaxon, hubTaxon, taxonomyLog
    } from '../stores/stores.js';

    export let taxon;
    export let currentLevel = false;

    function handleSelect() {
        selectedTaxon.set(taxon);

        if (currentLevel) {
            hubTaxon.set(taxon);
        }
    }

    function toggleTaxonProperty(property) {
        return async () => {
            let remove = true;

            // update global taxonomy
            let taxonomy = get(globalTaxonomy);
            for (let otherTaxon of taxonomy) {
                if (otherTaxon.id == taxon.id) {
                    otherTaxon[property] = !taxon[property];

                    if (otherTaxon[property]) {
                        remove = false;
                    }
                }
            }
            globalTaxonomy.set(taxonomy);

            // sync action with log
            let logTaxon = structuredClone(taxon);
            logTaxon.action = property;
            if (remove) {
                taxonomyLog.update((log) => {
                    return log.filter((item) => item.id != logTaxon.id);
                });
            } else {
                taxonomyLog.update((log) => [logTaxon, ...log]);
            }
        }
    }

    $: filtered = taxon.viewLevel == -1;

</script>

<div
    class="taxon"
    class:filtered
    on:click={handleSelect}
    on:keydown={handleSelect}
    role="button"
    tabindex="0"
>
    <span>{taxon.name}</span>
    <div class="buttons-container">
        <button
            class="filter-button {taxon.filter ? 'filter-selected' : ''}"
            on:click={toggleTaxonProperty('filter')}
        >F</button>
        <button
            class="group-button {taxon.group ? 'group-selected' : ''}"
            on:click={toggleTaxonProperty('group')}
        >G</button>
        <button
            class="expand-button {taxon.expand ? 'expand-selected' : ''}"
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
    .filtered {
        background-color: #ffaa98;
        font-size: 40;
    }

    .group-button {
    }
    .group-selected {
        font-weight: bold;
        background-color: #609146;
    }

    .filter-button {
    }
    .filter-selected {
        font-weight: bold;
        background-color: #df4e28;
    }

    .expand-button {
    }
    .expand-selected {
        font-weight: bold;
        background-color: #fff44b;
    }
</style>
