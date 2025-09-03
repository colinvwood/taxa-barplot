<script lang="ts">
    import { onMount } from "svelte";
    import { sampleManager } from "../classes/sampleManager.svelte";

    onMount(() => {
        sampleManager.taxonomy.setDisplayLevel(6);
        sampleManager.render();
    });
</script>

<div class="border-2 border-blue-300 w-[75%] h-[50rem] overflow-scroll">
    <svg id="barplot" class="h-[49rem] border-2 border-gray-300"></svg>
</div>
