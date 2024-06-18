<script>
    import { get } from 'svelte/store';
    import { table } from '../stores/stores.js';
    export let sample;
    export let sampleIndex;
    export let dimensions;

    const sampleWidth = 50;

    let x = sampleWidth * sampleIndex;


    </script>

<g>
    {#each sample.features as feature}
        {#if !feature.color}
            {console.log(feature)}
        {/if}
        <rect
            x={x}
            y={(feature.cumAbun - feature.abundance) * dimensions.height}
            height={feature.abundance * dimensions.height}
            width={sampleWidth}
            fill={feature.color}
        />
    {/each}

    </g>
