import { getDescendants, getChildren } from './taxonomy.js';
import { assignColors } from './colors.js';

/**
 * Render the barplot frequencies given the current taxonomy view at some
 * `level`, in other words, calculate the relative abundances of all taxa
 * viewed at `level` for each sample.
 *
 */
export async function renderTable(table, taxonomy, level, changes) {
    let tableView = [];
    for (const sampleId of table.keys()) {
        const sampleAbundances = table.get(sampleId).features;
        let renderedAbundances = new Map();

        for (const feature of sampleAbundances.keys()) {
            const featureLevel = feature.split(';').length;
            let target;
            if (featureLevel <= level) {
                target = feature;
            } else if (featureLevel > level) {
                // find ancestor at view level
                const ancestor = feature.split(';').slice(0,level).join(';');

                // check for grouping/expansion
                if (changes.expansions.has(ancestor)) {
                    const expandToLevel = changes.expansions.get(ancestor);
                    const expandToAncestor =
                        feature.split(';').slice(0, expandToLevel).join(';');
                    target = expandToAncestor;
                } else if (changes.groupings.has(ancestor)) {
                    const groupToLevel = changes.groupings.get(ancestor);
                    const groupToAncestor =
                        feature.split(';').slice(0, groupToLevel).join(';');
                    target = groupToAncestor;
                } else {
                    target = ancestor;
                }
            }

            // make sure target is not filtered
            if (changes.filters.has(target)) {
                continue;
            }

            // update abundance for target
            if (!renderedAbundances.has(target)) {
                renderedAbundances.set(target, 0);
            }
            renderedAbundances.set(
                target,
                renderedAbundances.get(target) +
                sampleAbundances.get(feature)
            );
        }

        // comopose rendered sample object
        let renderedSample = {id: sampleId, features: []};
        for (const [taxon, abundance] of renderedAbundances.entries()) {
            renderedSample.features.push({id: taxon, abundance: abundance});
        }

        // sort sample features by decreasing average abundance
        renderedSample.features = renderedSample.features.sort((a, b) => {
            return b.averageAbundance - a.averageAbundance;
        });

        // calculate cumulative abundance for sample
        renderedSample = calcCumAbun(renderedSample);

        // add rendered sample object to view
        tableView.push(renderedSample);
    }

    // color features
    tableView = assignColors(tableView, 'marine');

    // TODO: sample sorting

    return tableView;
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

export function calcCumAbun(sample) {
    let cumulativeAbun = 0;
    for (const feature of sample.features) {
        cumulativeAbun += feature.abundance;
        feature.cumAbun = cumulativeAbun;
    }

    return sample;
}

/**
 * Calculate prevalence and average abundance of each node in `taxonomy`,
 * and attach these as properties in the returned taxonomy.
 */
export async function calculateTaxonomyStats(taxonomy, table) {
    taxonomy = structuredClone(taxonomy);

    let samples = Array.from(table.keys());
    for (let taxon of taxonomy) {
        // calculate prevalence
        let leaves = await getLeafDescendants(taxonomy, taxon);
        let presentSamples = samples.filter(sample => {
            for (let leaf of leaves) {
                if (table.get(sample).features.get(leaf.id)) {
                    return true;
                }
            }
            return false;
        });
        taxon.prevalence = (presentSamples.length / samples.length).toFixed(3);

        // calculate average abundance
        let sumAbuns = presentSamples.map(sample => {
            return getSumLeafAbundances(table, sample, leaves);
        });

        let sum = sumAbuns.reduce((acc, abun) => {
            return acc + abun;
        }, 0);

        taxon.averageAbundance = (sum / samples.length).toFixed(3);
    }

    return taxonomy;
}

/**
 * Given a `sample` and set of `leaves`, find the sum of the abundances of
 * each leaf from `leaves` in `sample`. The `leaves` can be any subset of the
 * features in `sample`.
 *
 * @param {Array<Object>} leaves - the leaf taxa for which to search
 *
 * @returns {Number} - the sum of the abundances of `leaves` in `sample`
 */
function getSumLeafAbundances(table, sampleId, leaves) {
    let sum = 0;
    for (let leaf of leaves) {
        if (table.get(sampleId).features.get(leaf.id)) {
            sum += table.get(sampleId).features.get(leaf.id);
        }
    }
    return sum;
}
