<script>
    import { get } from 'svelte/store';
    import { table, taxonomy, hoveredTaxon } from '../stores/stores.js';
    export let sample;
    export let sampleIndex;
    export let dimensions;

    const sampleWidth = 40;

    let x = sampleWidth * sampleIndex;

    function handleHover(event) {
        const taxonId = event.target.dataset['featureId'];
        const taxon = structuredClone(taxonomy.getTaxon(taxonId));

        const sampleId = event.target.dataset['sampleId'];
        const sample = structuredClone(table.getSample(sampleId));
        delete sample.features;
        sample.sampleId = sample.id;
        delete sample.id;

        const abundance = event.target.dataset['abundance'];

        hoveredTaxon.set({...taxon, ...sample, abundance});
    }
</script>

<g>
    {#each sample.features as feature}
        <rect
            data-feature-id={feature.id}
            data-sample-id={sample.id}
            data-abundance={feature.abundance}
            x={x}
            y={(feature.cumAbun - feature.abundance) * dimensions.height}
            height={feature.abundance * dimensions.height}
            width={sampleWidth}
            taxon={feature.id}
            fill={feature.color}
            on:mouseover={handleHover}
        />
    {/each}
</g>
