 /**
  * Returns all taxa at level `level` in the taxonomy.
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
 * Returns all taxa viewable at `viewLevel`. These include filtered taxa.
 *
 * @param {Array<object>} taxonomy - the taxonomy to filter
 * @param {Number} viewLevel - the taxonomic viewLevel at which to retain taxa
 *
 * @returns {Promise<Array<Object>>} - the taxa at viewLevel `viewLevel`
 */
export async function getTaxaAtViewLevel(taxonomy, viewLevel) {
   return taxonomy.filter((taxon) => {
       if (taxon.viewLevel == viewLevel) {
           return true;
       } else if (taxon.viewLevel == -1 && taxon.level == viewLevel) {
           return true;
       }
       return false;
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
 * @returns {Promise<Object|null>} - the parent of taxon `taxon` or null if not
 * found
 */
export async function getParent(taxonomy, taxon) {
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
 * @returns {Promise<Array<Object>>} - the sibling taxa, if any
 */
export async function getSiblings(taxonomy, taxon) {
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
 * @returns {Promise<Array<Object>>} - the children taxa, if any
 */
export async function getChildren(taxonomy, taxon) {
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
 * Return all leaf descendants of `taxon`. If `taxon` is itself a leaf,
 * [`taxon`] will be returned.
 *
 * @param {Array<Object>} taxonomy - the taxonomy to search
 * @param {Object} taxon - the taxon of which to find leaf descendants
 *
 * @returns {Promise<Array<Object>>} - the descendant taxa, if any
 */
export async function getLeafDescendants(taxonomy, taxon) {
    const descendants = getDescendants(taxonomy, taxon);

    if (!descendants.length) {
        return [taxon];
    }

    let leaves = [];
    for (let descendant of descendants) {
        let children = await getChildren(taxonomy, descendant);
        if (!children.length) {
            leaves.push(descendant);
        }
    }

    return leaves;
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
export function sortTaxaByLevel(taxonomy, clone = true, descending = false) {
    if (clone) {
        taxonomy = structuredClone(taxonomy);
    }
    return taxonomy.sort((a, b) => {
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
 * Assigns the proper `viewLevel` to all taxa, taking into account the render
 * level, and any filters, groups, expansions. Note that `taxonomy` is
 * side-effected.
 *
 * @param {Array<Object>} taxonomy - the global taxonomy
 * @param {Number} level - the taxonomic level at which to render
 *
 * @returns {Promise<Array<Object>>} - the rendered taxonomic view
 */
export async function renderTaxonomy(taxonomy, level) {
    // TODO: deal with this
    taxonomy = structuredClone(taxonomy);
    for (let taxon of taxonomy) {
        taxon.viewLevel = taxon.level;
    }

    // resolve filters
    let toBeFiltered = sortTaxaByLevel(taxonomy, false);
    let filteredTaxonomy = [];
    while (toBeFiltered.length) {
        let taxon = toBeFiltered.shift();
        filteredTaxonomy.push(taxon);

        if (taxon.filter) {
            taxon.viewLevel = -1;

            let descendants = getDescendants(toBeFiltered, taxon);
            for (let descendant of descendants) {
                descendant.viewLevel = -1;
            }

            toBeFiltered = subsetTaxonomy(toBeFiltered, descendants);
            filteredTaxonomy.push(...descendants);
        }
    }
    taxonomy = filteredTaxonomy;

    // resolve groupings
    let toBeGrouped = sortTaxaByLevel(taxonomy, false);
    let groupedTaxonomy = [];
    while (toBeGrouped.length) {
        let taxon = toBeGrouped.shift();
        groupedTaxonomy.push(taxon);

        if (taxon.level >= level || taxon.viewLevel == -1) {
            continue;
        }

        if (taxon.group) {
            taxon.viewLevel = level;

            let descendants = getDescendants(toBeGrouped, taxon);
            for (let descendant of descendants) {
                descendant.viewLevel = 0;
            }
            toBeGrouped = subsetTaxonomy(toBeGrouped, descendants);
            groupedTaxonomy.push(...descendants);
        }
    }
    taxonomy = groupedTaxonomy;

    // resolve expansions
    let toBeExpanded = sortTaxaByLevel(taxonomy, false);
    let expandedTaxonomy = [];
    while (toBeExpanded.length) {
        let taxon = toBeExpanded.shift();
        expandedTaxonomy.push(taxon);

        if (taxon.expand && taxon.viewLevel == level) {
            let children = await getChildren(toBeExpanded, taxon);
            if (children.length) {
                taxon.viewLevel = 0;
                for (let child of children) {
                    child.viewLevel = level;
                }
            }
        }
    }
    taxonomy = expandedTaxonomy;

    return taxonomy;
}
