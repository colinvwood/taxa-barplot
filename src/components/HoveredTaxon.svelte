<script>
    import { hoveredTaxon } from '../stores/hoveredTaxon.js';
    import { customColors } from '../stores/colors.js';

    $: taxon = $hoveredTaxon

    function handleColorChange(event) {
        const color = event.target.value;
        customColors.addCustomColor(taxon.taxon.id, color);
    }

</script>

<div>
    <p>Name: {taxon.taxon.name}</p>
    <p>Abundance: {taxon.taxon.abundance}</p>
    <p>ID: {taxon.taxon.id}</p>
    <p>Sample: {taxon.sample.id}</p>

    <input
        type="color" id="color-selector" name="color-selector"
        value={taxon.taxon.color} on:change={handleColorChange}
    />
    <label for="color-selector">Color</label>

    <button on:click={() => hoveredTaxon.setFrozen(false)}>Unfreeze</button>

</div>
