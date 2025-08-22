<script lang="ts">
    import { onMount } from "svelte";
    import { sampleManager } from "../classes/sampleManager";

    onMount(() => {
        sampleManager.plot.setDimensions(500, 500);
        sampleManager.taxonomy.setDisplayLevel(4);
        sampleManager.colors.setColorScheme("before-dawn");
        sampleManager.render();
    });
</script>

<svg class="barplot" width="500" height="500"></svg>

<style></style>
