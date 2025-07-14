import { tsv } from "d3-fetch";
import { Taxonomy, Taxon } from "./taxonomy.ts";

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

    /**
     *
     */
    drawSamples() {
        // clear <svg> content
    }

    /**
     *
     */
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
     * Maps a sample's features to a set of "view taxa", which are the taxa
     * that the features are displayed as in the stacked bar chart. Updates
     * (and overwrites) `this.viewTaxa`.
     */
    mapToViewTaxa(taxonomy: Taxonomy) {
        const viewTaxaMap: Map<Taxon, ViewTaxon> = new Map();

        for (let feature of this.features) {
            const displayTaxon = taxonomy.getDisplayTaxon(feature.featureID);

            if (!viewTaxaMap.get(displayTaxon)) {
                const newViewTaxon = new ViewTaxon(displayTaxon);
                viewTaxaMap.set(displayTaxon, newViewTaxon);
            }

            const viewTaxon = viewTaxaMap.get(displayTaxon)!;
            viewTaxon.abundance += feature.abundance;
            viewTaxon.features.push(feature);
        }

        this.viewTaxa = [...viewTaxaMap.values()];
    }

    /**
     * Calculates and assigns the relative abundance of each taxon in
     * `this.viewTaxa`.
     */
    calcRelAbun() {
        const totalAbundance = this.viewTaxa.reduce((sum, taxon) => {
            return (sum += taxon.abundance);
        }, 0);

        for (let viewTaxon of this.viewTaxa) {
            viewTaxon.relAbun = viewTaxon.abundance / totalAbundance;
        }
    }

    /**
     * Updates a prevalence map with each of the taxa in `this.viewTaxa`.
     */
    tallyPrevalence(prevalenceMap: Map<ViewTaxon, number>) {
        for (let viewTaxon of this.viewTaxa) {
            if (!prevalenceMap.get(viewTaxon)) {
                prevalenceMap.set(viewTaxon, 1);
            } else {
                const prevalence = prevalenceMap.get(viewTaxon) as number;
                prevalenceMap.set(viewTaxon, prevalence + 1);
            }
        }
    }

    /**
     * Uses a fully populated prevalence map to record the prevalence of each
     * taxon in `this.viewTaxa`.
     */
    calcPrevalence(prevalenceMap: Map<ViewTaxon, number>, numSamples: number) {
        for (let viewTaxon of this.viewTaxa) {
            const prevalence = prevalenceMap.get(viewTaxon) as number;
            const prevalenceProportion = prevalence / numSamples;
            viewTaxon.preval = prevalence;
            viewTaxon.prevalProp = prevalenceProportion;
        }
    }

    /**
     *
     */
    filterViewTaxa(filters: string) {}

    /**
     *
     */
    sortViewTaxa(taxonomy: Taxonomy) {}

    /**
     *
     */
    draw(x0: number, y0: number, barWidth: number, barHeight: number) {
        const svgElem = document.querySelector(".barplot")!;
        const svgNamespace = "http://www.w3.org/2000/svg";

        for (let viewTaxon of this.viewTaxa) {
            // TODO: use `Colors`
            const color = "#4f34eb";

            // create and append rect
            const rectHeight = viewTaxon.relAbun * barHeight;
            const rect = document.createElementNS(svgNamespace, "rect");
            rect.setAttribute("x", x0.toString());
            rect.setAttribute("y", y0.toString());
            rect.setAttribute("width", barWidth.toString());
            rect.setAttribute("height", rectHeight.toString());
            rect.setAttribute("fill", color);

            // TODO: register click handler

            svgElem.appendChild(rect);
            y0 += rectHeight;
        }
    }
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
    relAbun: number;
    preval: number;
    prevalProp: number;
    collapsed: boolean;
    expanded: boolean;
    color: string;

    constructor(taxon: Taxon) {
        this.taxon = taxon;
    }
}

class Colors {}
