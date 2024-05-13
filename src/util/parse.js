import * as d3 from 'd3-fetch';


/**
 * Parse a feature table file into an array of sample objects of the form:
 *
 * {
 *     id: 'L1S105',
 *     features: {
 *         'k__K;p__P;c__C;o__O;f__F;g__G;s__S1': 0.1,
 *         'k__K;p__P;c__C;o__O;f__F;g__G;s__S2': 0.4,
           (...)
 *     }
 * }
 *
 * @param {String} tableFile - filepath of the feature table file
 * @param {String} sampleId - name of the column that identifies the sample
 * @param {Function} readFunc - function used to parse the feature table
 *
 * @returns {Promise<Array<Object>>} - array of sample objects
 */
export async function parseFeatureTable(
    tableFile, sampleId, readFunc = d3.csv
) {
    const table = await readFunc(tableFile);

    // restructure and convert counts to floats
    for (let sample of table) {
        sample.features = {};
        for (let attr in sample) {
            if (attr != sampleId && attr != 'features') {
                sample.features[attr] = Number(sample[attr]);
                delete sample[attr];
            }
        }
    }

    return table;
}

/**
 * Parses a taxonomy file into a tree data structure represented as an
 * an array of objects of the form:
 *
 *     {
 *         id: 'd__Bacteria;p__Bacilota;c__Bacilli',
 *         name: 'c__Bacilli',
 *         parent: 'd__Bacteria;p__Bacilota',
 *         level: 3,
 *         filter: false,
 *         group: false,
 *         expand: false
 *     }
 *
 * @param {String} taxonomyFile - filepath of the taxonomy file
 * @param {Function} readFunc - function used to parse the taxonomy
 * file, expected to return an array of row objects
 * @param {String} delimiter=; - the character delimiting the taxonomic levels
 * within the taxon strings in the taxonomy file
 *
 * @returns {Promise<Array<Object>>} - array of taxon objects
 */
export async function parseTaxonomy(
    taxonomyFile, readFunc = d3.tsv, delimiter = ';'
) {
    const data = await readFunc(taxonomyFile);

    let taxonomy = [];
    let ids = [];
    for (let row of data) {
        let names = row.Taxon.split(delimiter);

        for (let i = 0; i < names.length; i++) {
            let name = names[i];
            let parent, id;
            if (i == 0) {
                id = name;
                parent = null;
            }
            else {
                id = names.slice(0, i + 1).join(delimiter);
                parent = names.slice(0, i).join(delimiter);
            }
            if (!ids.includes(id)) {
                ids.push(id);
                taxonomy.push({
                    id,
                    name,
                    parent,
                    level: i + 1,
                    filter: false,
                    group: false,
                    expand: false
                });
            }
        }
    }

    return taxonomy;
}

/**
 * Parses a metadata file into an array of per-sample objects.
 *
 * @param {String} metadataFile - file path of the metadata file
 * @param {Function} readFunc - function used to parse the metadata file,
 * expected to return an array of row objects
 *
 * @returns {Promise<Array<Object>>} - array of sample objects
 */
export async function parseMetadata(metadataFile, readFunc = d3.csv) {
    const metadata = await readFunc(metadataFile);

    // TODO: deal with types
    return metadata;
}

/**
 * Merge the metadata with the per sample taxon objects.
 *
 * @param {Array<Object>} table -
 * @param {Array<Object>} metadata -
 *
 * @returns {Array<Object>} -
 */
export function mergeMetadata(table, metadata) {
    for (let sample of table) {
        let matches = metadata.filter((item) => {
            return item['id'] == sample.id;
        });

        if (matches.length != 1) {
            throw new Error('found none or 2 or more matching ids in metadata');
        }
        let metadataMatch = matches[0];

        for (let column in metadataMatch) {
            if (column != 'id') {
                sample[column] = metadataMatch[column];
            }
        }
    }

    return table;
}
