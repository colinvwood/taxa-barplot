import * as d3 from 'd3-fetch';


export async function parseFeatureTable(
    tableFile, sampleId, readFunc = d3.csv
) {
    const table = await readFunc(tableFile);

    const tableMap = new Map();
    for (let sample of table) {
        const features = new Map();

        for (let attr in sample) {
            if (attr != sampleId) {
                let abundance = Number(sample[attr]);
                if (abundance == 0) {
                    continue;
                }
                features.set(attr, abundance);
            }
        }
        tableMap.set(sample.id, {id: sample.id, features: features});
    }

    return tableMap;
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
        names = names.map(name => name.trim());

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
                    viewLevel: i + 1,
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
