import { getDescendants, getChildren } from './taxonomy.js';

/**
 * Render the barplot frequencies given the current taxonomy view at some
 * `level`, in other words, calculate the relative abundances of all taxa
 * viewed at `level` for each sample.
 *
 */
export async function renderTable(table, taxonomy, currentView) {
    let tableView = [];
    for (const sampleId of table.keys()) {
        let renderedSample = {...table.get(sampleId), features: []};

        // find abundance of each taxon in currently rendered level
        for (const taxon of currentView) {
            let abundance;
            if (!table.get(sampleId).features.has(taxon.id)) {
                const leaves = await getLeafDescendants(taxonomy, taxon);
                abundance = getSumLeafAbundances(table.get(sampleId), leaves);
                table.get(sampleId).features.set(taxon.id, abundance);
            } else {
                abundance = table.get(sampleId).features.get(taxon.id);
            }

            // do not include if abundace is 0
            if (abundance == 0) {
                continue;
            }

            renderedSample.features.push({
                id: taxon.id,
                name: taxon.name,
                level: taxon.level,
                averageAbundance: taxon.averageAbundance,
                prevalence: taxon.prevalence,
                abundance
            });
        }

        // sort features by decreasing average abundance
        renderedSample.features = renderedSample.features.sort((a, b) => {
            return b.averageAbundance - a.averageAbundance;
        });

        tableView.push(renderedSample);
    }

    return {table, tableView};
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
        let children = getChildren(taxonomy, descendant);
        if (!children.length) {
            leaves.push(descendant);
        }
    }

    return leaves;
}

/**
 * Calculates the cumulative abundance for each taxon in `sample.features`.
 * Side-effects `sample`.
 *
 * @param {Object} sample - the sample object containg the `features` array
 */
export async function calcCumAbun(sample) {
    let cumulativeAbun = 0;
    for (const feature of sample.features) {
        cumulativeAbun += feature.abundance;
        feature.cumAbun = cumulativeAbun;
    }
}

/**
 * Calculate prevalence and average abundance of each node in `taxonomy`,
 * and attach these as properties in the returned taxonomy.
 *
 * @param {Array<Object>} taxonomy - the taxonomy for which to calculate
 * the above statistics
 * @param {Array<Object>} table - the abundance table containing the relative
 * abundances of each leaf taxon
 *
 * @returns {Promise<Array<Object>>} - the taxonomy with the stats properties
 * attached
 */
export async function calculateTaxonomyStats(taxonomy, table) {
    taxonomy = structuredClone(taxonomy);

    for (let taxon of taxonomy) {
        // calculate prevalence
        let leaves = await getLeafDescendants(taxonomy, taxon);
        let presentSamples = table.filter(sample => {
            for (let leaf of leaves) {
                if (sample.features.get(leaf.id)) {
                    return true;
                }
            }
            return false;
        });
        taxon.prevalence = (presentSamples.length / table.length).toFixed(3);

        // calculate average abundance
        let sumAbuns = presentSamples.map(sample => {
            return getSumLeafAbundances(sample, leaves);
        });

        let sum = sumAbuns.reduce((acc, abun) => {
            return acc + abun;
        }, 0);

        taxon.averageAbundance = (sum / table.length).toFixed(3);
    }

    return taxonomy;
}

/**
 * Given a `sample` and set of `leaves`, find the sum of the abundances of
 * each leaf from `leaves` in `sample`. The `leaves` can be any subset of the
 * features in `sample`.
 *
 * @param {Object} sample - sample containing 0 or more of the `leaves`
 * @param {Array<Object>} leaves - the leaf taxa for which to search
 *
 * @returns {Number} - the sum of the abundances of `leaves` in `sample`
 */
function getSumLeafAbundances(sample, leaves) {
    let sum = 0;
    for (let leaf of leaves) {
        if (sample.features.get(leaf.id)) {
            sum += sample.features.get(leaf.id);
        }
    }
    return sum;
}
