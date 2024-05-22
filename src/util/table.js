import { getTaxaAtViewLevel, getLeafDescendants } from './taxonomy.js';


/**
 *
 *
 *
 *
 */
export async function renderTable(table, taxonomyView, level, globalTaxonomy) {
    taxonomyView = await getTaxaAtViewLevel(taxonomyView, level);

    let renderedTable = [];
    for (const sample of table) {
        let renderedSample = {...sample, features: []};

        // find abundance of each taxon in currently rendered level
        for (const taxon of taxonomyView) {
            if (taxon.viewLevel == -1) {
                continue;
            }

            const leaves = await getLeafDescendants(globalTaxonomy, taxon);
            const abundance = getSumLeafAbundances(sample, leaves);

            renderedSample.features.push({abundance, ...taxon});
        }

        // normalize in case of filters
        const sampleSum = renderedSample.features.reduce((acc, taxon) => {
            return acc + taxon.abundance;
        }, 0);
        renderedSample.features = renderedSample.features.map(taxon => {
            return {...taxon, abundance: taxon.abundance / sampleSum};
        });

        renderedTable.push(renderedSample);
    }

    return renderedTable;
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
                if (
                    sample.features.hasOwnProperty(leaf.id) &&
                    sample.features[leaf.id] > 0
                ) {
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
        if (sample.features[leaf.id]) {
            sum += sample.features[leaf.id];
        }
    }
    return sum;
}
