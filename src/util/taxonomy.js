 /**
  * Returns all taxa that at level `level` in the taxonomy.
  *
  * @param {Array<object>} taxonomy - the taxonomy to filter
  * @param {Number} level - the taxonomic level at which to retain taxa
  *
  * @returns {Promise<Array<Object>>} - the taxa at level `level`
  */
export async function getTaxaAtLevel(taxonomy, level) {
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
 * @returns {Promise<Array<Object>>} - the taxa above level `level`
 */
export async function getTaxaAboveLevel(taxonomy, level) {
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
 * @returns {Promise<Array<Object>>} - the taxa above `level`
 */
export async function getTaxaBeneathLevel(taxonomy, level) {
    return taxonomy.filter((taxon) => {
        return taxon.level > level;
    });
}

/**
 * Return the taxon with id `taxonId`.
 *
 * @param {Array<Object>} taxonomy - the taxonomy to search
 * @param {String} taxonId - the id of the taxon of interest
 *
 * @returns {Promise<Object|null>} - the taxon with id `taxonId` or null if no
 * match was found
 */
export async function getTaxonById(taxonomy, taxonId) {
    for (let taxon of taxonomy) {
        if (taxon.id == taxonId) {
            return taxon;
        }
    }

    return null;
}

/**
 * Return the parent taxon of `taxon`.
 *
 * @param {Array<Object>} taxonomy - the taxonomy to search
 * @param {Object} taxon - the taxon of which to find the parent
 *
 * @returns {Promise<Object|null} - the parent of taxon `taxon` or null if not
 * found
 */
export async function getParent(taxonomy, taxon) {
    return getTaxonById(taxonomy, taxon.parent);
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
             otherTaxon != taxon && otherTaxon.parent == taxon.parent
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
 * @returns {Promise<Array<Object>>} - the descendant taxa, if any
 */
export async function getDescendants(taxonomy, taxon) {
    return taxonomy.filter((otherTaxon) => {
        return otherTaxon != taxon && otherTaxon.id.indexOf(taxon.id) == 0;
    });
}

/**
 * Return all ancestors of  `taxon`.
 *
 * @param {Array<Object>} taxonomy - the taxonomy to search
 * @param {Object} taxon - the taxon of which to find descendants
 *
 * @returns {Promise<Array<Object>>} - the ancestor taxa, if any
 */
export async function getAncestors(taxonomy, taxon) {
    return taxonomy.filter((otherTaxon) => {
        return otherTaxon != taxon && taxon.id.indexOf(otherTaxon.id) == 0;
    });
}


export async function renderTaxonomicView(taxonomy, level) {
    let view = await getTaxaAtLevel(taxonomy, level);

    // deal with groups


    // deal with expansions

    // return view (i.e. all taxa shown at `level`)
}
