<script lang="ts">
    import { sampleManager } from "../../classes/sampleManager";

    let label: string = $state("");

    const columnNames = sampleManager.sampleControls.metadata.getColumnNames();

    function handleAddLabel(event: Event) {
        sampleManager.sampleControls.addLabel(label);
        label = "";
        sampleManager.render();
    }
</script>

<h2>Add a Sample Label</h2>
<select>
    {#each columnNames as column}
        <option value={column}>{column}</option>
    {/each}
</select>
<button onclick={handleAddLabel}>Add</button>
