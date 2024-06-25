<script>
    import { get } from 'svelte/store';
    import {
        taxonomy, selectedTaxon, viewLevel, taxonomyChanges
    } from '../stores/stores.js';

    let level = 0;
    let grouped = false;
    let expanded = false;

    const handleGroup = async () => {
        const taxon = get(selectedTaxon);
        if (taxon == {}) {
            alert('Must select a taxon before grouping.');
            return;
        }
        if (level <= taxon.level) {
            alert('Can not group to same or higher level.');
            return;
        }

        if (expanded) {
            alert('Can not group expanded taxon.');
            return;
        }

        taxonomyChanges.group(get(taxonomy), taxon, level);
        grouped = !grouped;
    }

    const handleExpand = async () => {
        const taxon = get(selectedTaxon);
        if (taxon == {}) {
            alert('Must select a taxon before expanding.');
            return;
        }

        if (level <= taxon.level) {
            alert('Can not expand to same or higher level.');
            return;
        }

        if (grouped) {
            alert('Can not expand grouped taxon.');
            return;
        }

        taxonomyChanges.expand(taxon, level);
        expanded = !expanded;
    }



</script>

<p>Name: {$selectedTaxon.name}</p>
<p>ID: {$selectedTaxon.id}</p>
<p>Level: {$selectedTaxon.level}</p>
<p>Average abundance: {$selectedTaxon.averageAbundance}</p>
<p>Prevalence: {$selectedTaxon.prevalence}</p>

<div class="group-expand-div">
    <p>Group or expand taxon to level:</p>
    <button
        class="group-button {grouped ? 'grouped' : ''}"
        on:click={handleGroup}
    >Group
    </button>

    <button
        class="expand-button {expanded ? 'expanded' : ''}"
        on:click={handleExpand}
    >Expand
    </button>
    <input name="level" bind:value={level} />
</div>

<style>
    .grouped {
        font-weight: bold;
        background-color: #609146;
    }

    .expanded {
        font-weight: bold;
        background-color: #fff44b;
    }

</style>
