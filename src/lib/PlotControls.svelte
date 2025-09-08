<script lang="ts">
    import { sampleManager } from "../classes/sampleManager.svelte";

    let displayLevel: number = $state(1);
    let dynamicAxis: boolean = $state(false);
    let showFiltered: boolean = $state(false);

    let levels: number[] = $state([]);
    for (let i = 1; i <= sampleManager.taxonomy.getDepth(); i++) {
        levels.push(i);
    }

    function handleDisplayLevelChange(event: Event) {
        sampleManager.taxonomy.displayLevel = displayLevel;
        sampleManager.render();
    }

    function decreaseBarWidth() {
        sampleManager.plot.dims.barWidth *= 0.9;
        sampleManager.render();
    }
    function increaseBarWidth() {
        sampleManager.plot.dims.barWidth *= 1.1;
        sampleManager.render();
    }

    function handleDynamicAxisChange() {
        sampleManager.plot.dynamicAxis = dynamicAxis;

        if (dynamicAxis && showFiltered) {
            sampleManager.plot.showFiltered = false;
            showFiltered = false;
        }

        sampleManager.render();
    }

    function handleShowFilteredChange() {
        sampleManager.plot.showFiltered = showFiltered;

        if (showFiltered && dynamicAxis) {
            sampleManager.plot.dynamicAxis = false;
            dynamicAxis = false;
        }

        sampleManager.render();
    }
</script>

<div
    class="grid rows-auto-min grid-cols-3 gap-2 w-[26rem] border-2 border-blue-300 py-[1rem]"
>
    <h1
        class="row-start-1 col-start-1 col-end-4 justify-self-center text-lg font-bold"
    >
        Plot Controls
    </h1>

    <label class="row-start-2 col-start-1 justify-self-end" for="displayLevel">
        Display Level:
    </label>
    <select
        class="row-start-2 col-start-2 select-primary"
        name="displayLevel"
        bind:value={displayLevel}
        onchange={handleDisplayLevelChange}
    >
        {#each levels as level}
            <option value={level}>{level}</option>
        {/each}
    </select>

    <p class="row-start-3 col-start-1 justify-self-end">Bar Width:</p>
    <div class="row-start-3 col-start-2 col-end-3 flex items-center">
        <button
            class="flex items-center justify-center w-[1.9rem] h-[1.9rem]! mr-[0.5rem] button-primary"
            onclick={decreaseBarWidth}
        >
            -
        </button>
        <button
            class="flex items-center justify-center w-[1.9rem] h-[1.9rem]! button-primary"
            onclick={increaseBarWidth}
        >
            +
        </button>
    </div>

    <label class="row-start-4 col-start-1 justify-self-end" for="dynamicAxis">
        Dynamic Y-axis:
    </label>
    <input
        class="row-start-4 col-start-2 self-center justify-self-start w-[1.25rem] h-[1.25rem]"
        name="dynamicAxis"
        type="checkbox"
        bind:checked={dynamicAxis}
        onchange={handleDynamicAxisChange}
    />

    <label class="row-start-5 col-start-1 justify-self-end" for="showFiltered">
        Show Filtered:
    </label>
    <input
        class="row-start-5 col-start-2 self-center justify-self-start w-[1.25rem] h-[1.25rem]"
        name="showFiltered"
        type="checkbox"
        bind:checked={showFiltered}
        onchange={handleShowFilteredChange}
    />
</div>
