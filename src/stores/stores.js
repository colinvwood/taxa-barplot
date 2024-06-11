import { writable, get } from 'svelte/store';

import { renderExpansions, renderGroupings } from '../util/taxonomy.js';
import { renderTable } from '../util/table.js';


export const viewLevel = writable(1);

function createTaxonomyStore() {
    const data = writable([]);
    const { subscribe, update, set } = data;

    const updateTaxonomy = () => {
        // todo (individual changes)
        return 0;
    }

    const getTaxon = (id) => {
        for (let [index, taxon] of get(data).entries()) {
            if (taxon.id == id) {
                return {taxon, index}
            }
        }
        return null;
    }

    const updateTaxon = (newTaxon) => {
        let { taxon, index } = getTaxon(newTaxon.id);
        update(taxonomy => {
            return [
                ...taxonomy.slice(index), taxon, ...taxonomy.slice(index + 1)
            ];
        });
    }

    const renderExpansion = async (taxon) => {
        update(current => {
            renderExpansions(current, taxon);
            return current;
        });
    }

    const renderGrouping = async (taxon) => {
        update(current => {
            renderGroupings(current, taxon);
            return current;
        });
    }

    const renderFilter = async (taxon) => {
        // todo
    }

    const setProperty = (id, property, value) => {
        update(taxonomy => {
            return taxonomy.map(taxon => {
                if (taxon.id == id) {
                    taxon[property] = value;
                }
                return taxon;
            });
        });
    }

    const toggleProperty = (id, property) => {
        let newValue;
        update(taxonomy => {
            return taxonomy.map(taxon => {
                if (taxon.id == id) {
                    taxon[property] = !taxon[property];
                    newValue = taxon[property];
                }
                return taxon;
            });
        });

        return newValue;
    }

    return {
        subscribe,
        set,
        renderExpansion,
        renderGrouping,
        setProperty,
        toggleProperty
    }
}
export const taxonomy = createTaxonomyStore();

function createTableStore() {
    const data = writable([]);
    const { subscribe, update, set } = data;

    const updateTable = () => {
        // todo (individual changes)
    }

    const render = async (taxonomy, level) => {
        const rendered = await renderTable(get(data), taxonomy, level);
        set(rendered);
    }

    return {
        subscribe,
        set,
        render,
    }
}
export const table = createTableStore();


export const selectedTaxon = writable({});
export const hubTaxon = writable({});

export const taxonomyLog = writable([]);
