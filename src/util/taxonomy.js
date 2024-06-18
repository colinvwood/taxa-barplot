
/**
 * Return the children of `taxon`.
 *
 * @param {Array<Object>} taxonomy - the taxonomy to search
 * @param {Object} taxon - the taxon of which to find the children
 *
 * @returns {Array<Object>} - the children taxa, if any
 */
export function getChildren(taxonomy, taxon) {
    let children = [];
    for (let otherTaxon of taxonomy) {
        if (otherTaxon.parent == taxon.id) {
            children.push(otherTaxon);
        }
    }

    return children;
}

/**
 * Return the siblings of `taxon`, i.e. the taxa that have the same parent as
 * `taxon`.
 *
 * @param {Array<Object>} taxonomy - the taxonomy to search
 * @param {Object} taxon - the taxon of which to find the siblings
 *
 * @returns {<Array<Object>} - the sibling taxa, if any
 */
export function getSiblings(taxonomy, taxon) {
    let siblings = [];
    for (let otherTaxon of taxonomy) {
        if (otherTaxon.parent == taxon.parent && otherTaxon.id != taxon.id) {
            siblings.push(otherTaxon);
        }
    }

    return siblings;
}

/**
 * Return the parent taxon of `taxon`.
 *
 * @param {Array<Object>} taxonomy - the taxonomy to search
 * @param {Object} taxon - the taxon of which to find the parent
 *
 * @returns {Object | null} - the parent taxon if found, null otherwise
 */
export function getParent(taxonomy, taxon) {
    for (let otherTaxon of taxonomy) {
        if (otherTaxon.id == taxon.parent) {
            return otherTaxon;
        }
    }

    return null;
}

export function getTaxonById(taxonomy, id) {
    for (let taxon of taxonomy) {
        if (taxon.id == id) {
            return taxon;
        }
    }
    return null;
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
    return taxonomy.filter(t => {
        return t.id != taxon.id && t.id.indexOf(taxon.id) == 0;
    });
}

export function getDescendantsAtLevel(taxonomy, taxon, level) {
    const descendants = getDescendants(taxonomy, taxon);
    return descendants.filter(t => t.level == level);
}

function getAncestorAtLevel(taxonomy, taxon, level) {
    const ancestorId = taxon.id.split(';').slice(0, level).join(';');
    const ancestorTaxon = taxonomy.filter(t => t.id == ancestorId);
    if (ancestorTaxon.length > 1) {
        throw new Error('More than one ancestor found for taxon.')
    } else if (ancestorTaxon.length < 1) {
        throw new Error('Ancestor taxon not found.');
    }

    return ancestorTaxon[0];
}

export function renderCurrentView(taxonomy, level, changes) {
    const taxaAtLevel = taxonomy.filter(t => t.level == level);

    let view =  new Set();
    for (const taxon of taxaAtLevel) {
        if (changes.filters.has(taxon.id)) {
            continue;
        } else if (changes.groupings.has(taxon.id)) {
            const groupedToLevel = changes.groupings.get(taxon.id);
            const ancestor = getAncestorAtLevel(
                taxonomy, taxon, groupedToLevel
            );
            view.add(ancestor);
        } else if (changes.expansions.has(taxon.id)) {
            const expandedToLevel = changes.expansions.get(taxon.id);
            const descendants = getDescendantsAtLevel(
                taxonomy, taxon, expandedToLevel
            );
            for (const descendant of descendants) {
                view.add(descendant);
            }
        } else {
            view.add(taxon);
        }
    }

    return Array.from(view);
}
