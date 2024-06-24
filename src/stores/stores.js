import { writable, get } from 'svelte/store';

import { renderCurrentView, getDescendantsAtLevel } from '../util/taxonomy.js';
import { renderTable } from '../util/table.js';


export const viewLevel = writable(1);


function createTaxonomyStore() {
    const taxonomy = writable([]);
    const { subscribe, update, set } = taxonomy;

    const getTaxon = (id) => {
        for (let taxon of get(taxonomy)) {
            if (taxon.id == id) {
                return taxon;
            }
        }
        return null;
    };

    const setProperty = (id, property, value) => {
        update(taxonomy => {
            return taxonomy.map(taxon => {
                if (taxon.id == id) {
                    taxon[property] = value;
                }
                return taxon;
            });
        });
    };

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
    };

    const render = (level, changes) => {
        return renderCurrentView(get(taxonomy), level, changes);
    };

    return {
        subscribe,
        set,
        getTaxon,
        setProperty,
        toggleProperty,
        render
    }
}
export const taxonomy = createTaxonomyStore();


function createTaxonomyChangesStore() {
    const changes = writable({
        expansions: new Map(),
        groupings: new Map(),
        filters: new Set(),
    });
    const { subscribe, set, update } = changes;

    const expand = (taxon, level) => {
        update(data => {
            if (data.expansions.has(taxon.id)) {
                // undo
                data.expansions.delete(taxon.id);
            } else {
                data.expansions.set(taxon.id, level);
            }
            return data;
        });
    };

    const group = (taxonomy, taxon, level) => {
        const descendants = getDescendantsAtLevel(taxonomy, taxon, level);
        if (descendants.length == 0) {
            alert('Can not group leaf taxon.');
            return;
        }

        update(data => {
            if (
                data.groupings.has(descendants[0].id) &&
                data.groupings.get(descendants[0].id) == taxon.level
            ) {
                // undo
                for (const descendant of descendants) {
                    data.groupings.delete(descendant.id);
                }
            } else {
                for (const descendant of descendants) {
                    data.groupings.set(descendant.id, taxon.level);
                }
            }
            return data;
        });
    };

    const filter = (taxon) => {
        update(data => {
            if (data.filters.has(taxon.id)) {
                data.filters.delete(taxon.id);
            } else {
                data.filters.add(taxon.id);
            }
            return data;
        });
    };

    return {
        subscribe,
        expand,
        group,
        filter,
    }
}
export const taxonomyChanges = createTaxonomyChangesStore();


function createTableStore() {
    const table = writable(new Map());
    let { subscribe, update, set } = table;

    const render = async (taxonomy, level, changes, accessor) => {
        return await renderTable(
            get(table), taxonomy, level, changes, accessor
        );
    }

    return {
        subscribe,
        update,
        set,
        render,
    }
}
export const table = createTableStore();

export const selectedTaxon = writable({});

export const taxonomyLog = writable([]);
