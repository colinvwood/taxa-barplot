import { writable, get } from 'svelte/store';

import { renderTaxonomy } from '../util/taxonomy.js';
import { renderTable } from '../util/table.js';


export const globalTable = writable([]);
export const viewLevel = writable(1);

function createTaxonomy() {
    const data = writable([]);
    const { subscribe, update, set } = data;

    const updateTaxonomy = () => {
        // todo (individual changes)
        return 0;
    }

    const render = async (level) => {
        const rendered = await renderTaxonomy(get(data), level);
        set(rendered);
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
        render,
        setProperty,
        toggleProperty
    }
}
export const taxonomy = createTaxonomy();

function createTable() {
    const data = writable([]);
    const { subscribe, update, set } = data;



    return {
        subscribe,
        set,

    }
}
export const table = createTable();


export const selectedTaxon = writable({});
export const hubTaxon = writable({});

export const taxonomyLog = writable([]);
