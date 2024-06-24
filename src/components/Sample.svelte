<script>
    import { get } from 'svelte/store';
    import { table } from '../stores/stores.js';
    export let sample;
    export let sampleIndex;
    export let dimensions;

    const sampleWidth = 50;

    let x = sampleWidth * sampleIndex;


    function handleHover(event) {
        console.log('id', event.target.dataset['featureId']);
        console.log('features', sample.features);
    }
    </script>

<g>
    {#each sample.features as feature}
        {#if !feature.color}
            {console.log(feature)}
        {/if}
        <rect
            data-feature-id={feature.id}
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
