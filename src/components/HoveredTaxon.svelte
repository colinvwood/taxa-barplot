<script>
    import { hoveredTaxon } from '../stores/stores.js';

    $: taxon = $hoveredTaxon
</script>

<div>
    <p>Name: {taxon.name}</p>
    <p>Abundance: {taxon.abundance}</p>
    <p>ID: {taxon.id}</p>
    <p>Sample: {taxon.sampleId}</p>
</div>
