<script>
    import { taxonomy } from '../stores/taxonomy.js';
    import { tableStore } from '../stores/table.js';
    import { hoveredTaxon } from '../stores/hoveredTaxon.js';

    export let sample;
    export let sampleIndex;
    export let dimensions;

    const sampleWidth = 40;

    let x = sampleWidth * sampleIndex;

    function handleHover(event) {
        if ($hoveredTaxon.frozen) {
            return;
        }
        hoveredTaxon.setTaxon(event.target.dataset, taxonomy, tableStore);
    }

    function handleClick(event) {
        const clickedId = event.target.dataset['taxonId'];
        const previousId = $hoveredTaxon.taxon.id;

        if (!$hoveredTaxon.frozen) {
            hoveredTaxon.setFrozen(true);
        } else {
            hoveredTaxon.setFrozen(false);
            handleHover(event);
            if (clickedId != previousId) {
                hoveredTaxon.setFrozen(true);
            }
        }
    }
</script>

<g>
    {#each sample.features as feature}
        <rect
            data-taxon-id={feature.id}
            data-sample-id={sample.id}
            data-abundance={feature.abundance}
            data-color={feature.color}
            x={x}
            y={(feature.cumAbun - feature.abundance) * dimensions.height}
            height={feature.abundance * dimensions.height}
            width={sampleWidth}
            taxon={feature.id}
            fill={feature.color}
            on:mouseover={handleHover}
            on:click={handleClick}
        />
    {/each}
</g>
