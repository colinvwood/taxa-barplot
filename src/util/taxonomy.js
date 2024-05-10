 /**
  * Returns all taxa that at level `level` in the taxonomy.
  *
  * @param {Array<object>} taxonomy - the taxonomy to filter
  * @param {Number} level - the taxonomic level at which to retain taxa
  *
  * @returns {Array<Object>} - the taxa at level `level`
  */
export function getTaxaAtLevel(taxonomy, level) {
    return taxonomy.filter((taxon) => {
        return taxon.level == level;
    });
}

/**
 * Returns all taxa that are above `level` in the taxonomy. Note that above
 * means those that have a lesser `level` property.
 *
 * @param {Array<object>} taxonomy - the taxonomy to filter
 * @param {Number} level - the taxonomic level above which to retain taxa
 *
 * @returns {Array<Object>} - the taxa above level `level`
 */
export function getTaxaAboveLevel(taxonomy, level) {
    return taxonomy.filter((taxon) => {
        return taxon.level < level;
    });
}

/**
 * Returns all taxa that are beneath `level` in the taxonomy. Note that beneath
 * means those that have a greater `level` property.
 *
 * @param {Array<object>} taxonomy - the taxonomy to filter
 * @param {Number} level - the taxonomic level beneath which to retain taxa
 *
 * @returns {Array<Object>} - the taxa above `level`
 */
export function getTaxaBeneathLevel(taxonomy, level) {
    return taxonomy.filter((taxon) => {
        return taxon.level > level;
    });
}

/**
 * Return the parent taxon of `taxon`.
 *
 * @param {Array<Object>} taxonomy - the taxonomy to search
 * @param {Object} taxon - the taxon of which to find the parent
 *
 * @returns {Object|null} - the parent of taxon `taxon` or null if not
 * found
 */
export function getParent(taxonomy, taxon) {
    for (let otherTaxon of taxonomy) {
        if (otherTaxon.id == taxon.parent) {
           return otherTaxon;
        }
    }
    return null;
}


/**
 * Return the siblings of `taxon`, i.e. the taxa that have the same parent as
 * `taxon`.
 *
 * @param {Array<Object>} taxonomy - the taxonomy to search
 * @param {Object} taxon - the taxon of which to find the siblings
 *
 * @returns {Array<Object>} - the sibling taxa, if any
 */
export function getSiblings(taxonomy, taxon) {
     return taxonomy.filter((otherTaxon) => {
         return (
             otherTaxon.parent != null &&
             otherTaxon.id != taxon.id && otherTaxon.parent == taxon.parent
         );
     });
}

/**
 * Return the children of `taxon`.
 *
 * @param {Array<Object>} taxonomy - the taxonomy to search
 * @param {Object} taxon - the taxon of which to find the children
 *
 * @returns {Array<Object>} - the children taxa, if any
 */
export function getChildren(taxonomy, taxon) {
    return taxonomy.filter((otherTaxon) => {
        return otherTaxon.parent == taxon.id;
    });
}

/**
 * Return all descendants of  `taxon`.
 *
 * @param {Array<Object>} taxonomy - the taxonomy to search
 * @param {Object} taxon - the taxon of which to find descendants
 *
 * @returns {Array<Object>} - the descendant taxa, if any
 */
export function getDescendants(taxonomy, taxon) {
    return taxonomy.filter((otherTaxon) => {
        return (
            otherTaxon.id != taxon.id && otherTaxon.id.indexOf(taxon.id) == 0
        );
    });
}

/**
 * Return all ancestors of  `taxon`.
 *
 * @param {Array<Object>} taxonomy - the taxonomy to search
 * @param {Object} taxon - the taxon of which to find descendants
 *
 * @returns {Array<Object>} - the ancestor taxa, if any
 */
export function getAncestors(taxonomy, taxon) {
    return taxonomy.filter((otherTaxon) => {
        return (
            otherTaxon.id != taxon.id && taxon.id.indexOf(otherTaxon.id) == 0
        );
    });
}

/**
 * Sort taxonomy in ascending or descending order of level.
 *
 * @param {Array<Object>} taxonomy - the taxonomy to sort
 * @param {Boolean} descending - whether to sort in descending order, false by
 * default
 *
 * @returns {Array<Object>} - the sorted taxonomy
 */
export function sortTaxaByLevel(taxonomy, descending = false) {
    return structuredClone(taxonomy).sort((a, b) => {
        if (descending) {
            return b.level - a.level;
        }
        return a.level - b.level;
    });
}

/**
 * Remove `removeTaxa` from `taxonomy`.
 *
 * @param {Array<Object>} taxonomy - the taxonomy to subset
 * @param {Array<Object>} removeTaxa - the taxa to remove from `taxonomy`
 *
 * @returns {Array<Object>} - the subsetted taxonomy
 */
export function subsetTaxonomy(taxonomy, removeTaxa) {
    return taxonomy.filter((taxon) => {
        for (let removeTaxon of removeTaxa) {
            if (removeTaxon.id == taxon.id) {
                return false;
            }
        }
        return true;
    });
}

/**
 * Parses current taxonomy to render all taxa viewed at `level` after taking
 * groupings and expansions into account.
 *
 * @param {Array<Object>} taxonomy - the global taxonomy
 * @param {Number} level - the taxonomic level at which to render
 *
 * @returns {Promise<Array<Object>>} - the rendered taxonomic view at `level`
 */
export async function renderTaxonomicView(taxonomy, level) {
    let view = getTaxaAtLevel(taxonomy, level);

    // resolve groups
    let remaining = sortTaxaByLevel(getTaxaAboveLevel(taxonomy, level));
    while (remaining.length) {
        let taxon = remaining.shift();
        if (taxon.group) {
            view.push(taxon);

            let descendants = getDescendants(taxonomy, taxon);
            view = subsetTaxonomy(view, descendants);
            remaining = subsetTaxonomy(remaining, descendants);
        }
    }

    // resolve expansions
    while ( view.filter(taxon => taxon.expand).length ) {
        for (let taxon of view) {
            if (taxon.expand) {
                let children = getChildren(taxonomy, taxon);
                if (!children.length) {
                    // TODO: disallow this in onClick?
                    taxon.expand = false;
                } else {
                    view = subsetTaxonomy(view, [taxon]);
                    view.push(...children);
                }
            }
        }
    }

    return view;
}
