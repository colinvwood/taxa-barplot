/**
 *
 *
 *
 */
export async function getTaxaAtLevel(taxonomy, level) {
    return taxonomy.filter((taxon) => {
        return taxon.level == level;
    });
}


/**
 *
 *
 *
 */
async function getTaxonById(taxonomy, taxonId) {
    for (let taxon of taxonomy) {
        if (taxon.id == taxonId) {
            return taxon;
        }
    }

    return null;
}


/**
 *
 *
 *
 */
export async function getParent(taxonomy, taxon) {
    return getTaxonById(taxonomy, taxon.parent);
}


/**
 *
 *
 *
 */
export async function getSiblings(taxonomy, taxon) {
     return taxonomy.filter((otherTaxon) => {
         return otherTaxon.parent == taxon.parent;
     });
}


/**
 *
 *
 *
 */
export async function getChildren(taxonomy, taxon) {
    return taxonomy.filter((otherTaxon) => {
        return otherTaxon.parent == taxon.id;
    });
}


/**
 * Expands a given taxon's children into the currently viewed taxonomic level.
 * Modifies taxonomy in place.
 *
 * @param {Array<Object>} taxonomy - the current taxonomic view
 * @param {String} expandId - the id of the taxon the children of which should
 * be expanded
 * @param {Number} viewLevel - the currently viewed taxonomic level
 */
export function expand(taxonomy, expandId, viewLevel) {
    for (let taxon of taxonomy) {
        if (taxon.id == expandId) {
            taxon.viewLevel = 0;
        } else if (taxon.parent == expandId) {
            taxon.viewLevel = viewLevel;
        }
    }
}


/**
 * Groups a given taxon's children into their parent at the currently viewed
 * taxonomic level. Modifies taxonomy in place.
 *
 * @param {Array<Object>} taxonomy - the current taxonomic view
 * @param {String} groupId - the id of the taxon the children of which should
 * be grouped
 * @param {Number} viewLevel - the currently viewed taxonomic level
 *
 */
export function group(taxonomy, groupId, viewLevel) {
    for (let taxon of taxonomy) {
        if (taxon.id == groupId) {
            taxon.viewLevel = viewLevel;
        } else if (taxon.parent == groupId) {
            taxon.viewLevel = 0;
        }
    }
}


/**
 * Un-groups/un-expands groupings/expansions.
 *
 * @param {Array<Object>} taxonomy - the current taxonomic view
 * @param {String} parentId - the parent taxon of the grouping/expansion that
 * should be undone
 */
export function resetViewLevels(taxonomy, parentId) {
    for (let taxon of taxonomy) {
        if (taxon.id == parentId || taxon.parent == parentId) {
            taxon.viewLevel = taxon.level;
        }
    }
}
