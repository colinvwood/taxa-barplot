
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

function getDescendantsAtLevel(taxonomy, taxon, level) {
    const descendants = getDescendants(taxonomy, taxon);
    return descendants.filter(t => t.level == level);
}


function getSubTree(taxonomy, taxon, level) {
    const descendants = getDescendants(taxonomy, taxon);
    return descendants.filter(t => t.level >= level);
}

function flagsSet(taxon) {
    return (
        taxon.groupTo || taxon.expandTo || taxon.groupedTo ||
        taxon.expandedTo
    );
}

function validateChange(taxonomy, taxon, level) {
    if (flagsSet(taxon)) {
        return false;
    }

    if (
        (taxon.groupTo && taxon.groupTo <= taxon.level) ||
        (taxon.expandTo && taxon.expandTo <= taxon.level)
    ) {
        return false;
    }

    const subTree = getSubTree(taxonomy, taxon, level);
    const violators = subTree.filter(t => flagsSet(t));
    if (violators.length > 0) {
        return false;
    }

    return true;

}

export function expandOrGroupTo(taxonomy, taxonId, action, level=0) {
    // set proper attributes according to action
    let rootProp;
    let descendantProp;
    if (action == 'group') {
        rootProp = 'groupTo';
        descendantProp = 'groupedTo'
    } else if (action == 'expand') {
        rootProp = 'expandTo';
        descendantProp = 'expandedTo';
    }

    let taxon = getTaxonById(taxonomy, taxonId);
    let rootMark;
    let descendantMark;
    if (level == 0) {
        // undo grouping/expansion
        rootMark = 0;
        descendantMark = 0;
        level = taxon[rootProp];
    } else {
        // make sure grouping is valid
        if (!validateChange(taxonomy, taxon, level)) {
            return {taxonomy, diff: false};
        }

        rootMark = level;
        descendantMark = taxon.level;
    }

    // get taxa at target level to be grouped
    const descendantsAtLevel = getDescendantsAtLevel(taxonomy, taxon, level);

    // make set of affected taxa for fast lookup
    let descendantsSet = new Set(descendantsAtLevel.map(d => d.id));
    descendantsSet.add(taxon.id);

    // add untouched taxa back to taxonomy
    let newTaxonomy = [];
    for (let taxon of taxonomy) {
        if (!descendantsSet.has(taxon.id)) {
            newTaxonomy.push(taxon);
        }
    }

    // update current grouping taxon and add to new taxonomy
    taxon[rootProp] = rootMark;
    newTaxonomy.push(taxon);

    // update and add groupedTo taxa to new taxonomy
    for (let descendant of descendantsAtLevel) {
        descendant[descendantProp] = descendantMark;
        newTaxonomy.push(descendant);
    }

    if (!(taxonomy.length == newTaxonomy.length)) {
        throw new Error('expected updated taxonomy to be same length');
    }

    return {taxonomy: newTaxonomy, diff: true}
}


export function renderCurrentView(taxonomy, renderLevel) {
    return taxonomy.filter(taxon => {
        if (taxon.filter) {
            return false;
        }
        if (taxon.level == renderLevel && !flagsSet(taxon)) {
            return true;
        }
        return (
            taxon.expandedTo == renderLevel || taxon.groupTo == renderLevel
        );
    });
}
