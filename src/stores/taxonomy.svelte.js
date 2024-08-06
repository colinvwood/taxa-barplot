import { writable, get } from 'svelte/store';

import { renderCurrentView, getDescendantsAtLevel } from '../util/taxonomy.js';

function createTaxonomy() {
    // level at which taxonomy is viewed
    let viewLevel = $state(1);

    // all taxa in taxonomy
    let taxonomy = $state([]);
    // taxa at viewed level
    let rendered = $state([]);

    // custom taxonomy adjustments
    let changes = $state({
        expansions: new Map(),
        groupings: new Map(),
        filters: new Set(),
    });

    function getTaxon(id) {
        for (let taxon of taxonomy) {
            if (taxon.id == taxon.id) {
                return taxon;
            }
        }
        return null;
    }

    function setProperty(id, property, value) {
        taxonomy = taxonomy.map(taxon => {
            if (taxon.id == id) {
                taxon[property] = value;
            }
            return taxon;
        });
    }

    function toggleProperty(id, property) {
        taxonomy = taxonomy.map(taxon => {
            if (taxon.id == id) {
                taxon[property] = !taxon[property];
            }
            return taxon;
        });
    }

    function render(viewLevel, changes) {
        rendered = renderCurrentView(taxonomy, viewLevel, changes);
    }

    function expand(taxon, level) {
        if (changes.expansions.has(taxon.id)) {
            changes.expansions.delete(taxon.id);
        } else {
            changes.expansions.set(taxon.id, level);
        }
        console.log('expansions updated');
    }

    function group(taxon, level) {
        const descendants = getDescendantsAtLevel(taxonomy, taxon, level);
        if (descendants.length == 0) {
            alert('Can not group leaf taxon.');
            return;
        }

        if (
            changes.groupings.has(descendants[0].id) &&
            changes.groupings.get(descendants[0].id) == taxon.level
        ) {
            for (const descendant of descendants) {
                changes.groupings.delete(descendant.id);
            }
        } else {
            for (const descendant of descendants) {
                changes.groupings.set(descendant.id, taxon.level);
            }
        }
    }

    function filter(taxon) {
        if (changes.filters.has(taxon.id)) {
            changes.filters.delete(taxon.id);
        } else {
            changes.filters.add(taxon.id);
        }
        render();
    }

    return {
        get viewLevel() {return viewLevel},
        set viewLevel(v) {viewLevel = v},

        get taxonomy() {return taxonomy},
        set taxonomy(t) {taxonomy = t},
        get rendered() {return rendered},
        getTaxon,
        setProperty,
        toggleProperty,
        render,

        get changes() {return changes},
        expand,
        group,
        filter
    };
}
export const taxonomy = createTaxonomy();

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
        const rendered = renderCurrentView(get(taxonomy), level, changes);
        return rendered;
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
// export const taxonomy = createTaxonomyStore();


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
// export const taxonomyChanges = createTaxonomyChangesStore();




export const selectedTaxon = writable({});

export const taxonomyLog = writable([]);
