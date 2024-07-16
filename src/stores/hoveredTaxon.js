import { writable, get } from 'svelte/store';

function hoveredTaxonStore() {
    const hoveredTaxon = writable({
        taxon: {},
        sample: {},
        frozen: false,
    });
    const { update, set, subscribe } = hoveredTaxon;

    const setTaxon = (eventDataset, taxonomy, table) => {
        // find taxon of interest by id
        const taxonId = eventDataset['taxonId'];
        const taxon = structuredClone(taxonomy.getTaxon(taxonId));

        // find sample of interest by id
        const sampleId = eventDataset['sampleId'];
        const sample = structuredClone(table.getSample(sampleId));

        // access abundance and color
        const abundance = eventDataset['abundance'];
        const color = eventDataset['color'];
        taxon.abundance = abundance;
        taxon.color = color;

        hoveredTaxon.update(state => {
            return {...state, taxon, sample};
        });
    };

    const setFrozen = (freeze) => {
        hoveredTaxon.update(state => {
            return {...state, frozen: freeze};
        });
    };

    return {
        update,
        set,
        subscribe,
        setTaxon,
        setFrozen,
    }
}
export const hoveredTaxon = hoveredTaxonStore();
