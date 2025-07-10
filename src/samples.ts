import { tsv } from "d3-fetch";
import { Taxonomy } from "./taxonomy.ts";

export class SampleManager {
    samples: Sample[];
    metadata: Metadata;
    taxonomy: Taxonomy;
    abundanceFilters: string[];

    /**
     * Parses a feature table saved as a tsv file (with samples as columns,
     * rows as features) into `Sample` and `Feature` objects, and stores the
     * created samples in `this.samples`.
     */
    async parseFeatureTable(filepath: string) {
        const tableLines = await tsv(filepath);

        let sampleHeader = tableLines.shift();

        for (let [index, sampleID] of sampleHeader.entries()) {
            if (sampleID == "OTU ID") {
                continue;
            }

            const sample = new Sample(sampleID);
            for (let tableRow of tableLines) {
                const abundance = Number(tableRow[index]);
                if (abundance > 0) {
                    const featureID = tableRow[0];
                    const feature = new Feature(featureID, abundance);
                    sample.features.push(feature);
                }
            }

            this.samples.push(sample);
        }
    }

    drawSamples() {}

    calcTaxaStats() {}
}

class Sample {
    sampleID: string;
    features: Feature[];
    viewTaxa: ViewTaxon[];
    colors: Colors;

    constructor(sampleID: string) {
        this.sampleID = sampleID;
        this.features = [];
    }

    /**
     *
     */
    mapToTaxa(taxonomy: Taxonomy) {
        // for each feature, find display taxon
        // if no such view taxon yet, create one and add abundance and feature id
        // if existing view taxon, add abundance and feature id
    }

    calcRelAbun() {}

    tallyPrevalence(prevalenceMap: Map<string, number>) {}

    calcPrevalence(prevalenceMap: Map<string, number>) {}

    applyFilters(filters: function[]) {}

    sortViewTaxa(taxonomy: Taxonomy) {}

    draw(x0: number, y0: number, width: number, height: number) {}
}

class Feature {
    featureID: string;
    abundance: number;

    constructor(featureID: string, abundance: number) {
        this.featureID = featureID;
        this.abundance = abundance;
    }
}

class ViewTaxon {
    taxon: Taxon;
    features: Feature[];
    abundance: number;
    relativeAbundance: number;
    prevalence: number;
    collapsed: boolean;
    expanded: boolean;
    color: string;
}
