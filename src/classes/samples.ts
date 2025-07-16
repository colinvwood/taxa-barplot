import { csv } from "d3-fetch";
import { Taxonomy, Taxon } from "./taxonomy";
import { Metadata } from "./metadata";
import { Colors } from "./colors";
import { Legend } from "./legend";

class SampleManager {
    samples: Sample[];
    retainedSamples: Sample[];
    metadata: Metadata;
    taxonomy: Taxonomy;
    legend: Legend;
    #plotDimensions: PlotDimensions;
    abundanceFilters: ((vt: ViewTaxon) => boolean)[];

    constructor() {
        this.samples = [];
        this.retainedSamples = [];
        this.metadata = new Metadata();
        this.taxonomy = new Taxonomy();
        this.legend = new Legend();
        this.#plotDimensions = { width: 0, height: 0 };
        this.abundanceFilters = [];
    }

    /**
     * Parses a feature table saved as a tsv file (with samples as columns,
     * rows as features) into `Sample` and `Feature` objects, and stores the
     * created samples in `this.samples`.
     */
    async parseFeatureTable(filepath: string) {
        let tableLines = await csv(filepath);

        if (tableLines.length == 0) {
            alert("Taxonomy is empty.");
            return;
        }

        const featureHeader = tableLines.shift();

        for (let row of tableLines) {
            const sampleID = row.sampleID;
            const sample = new Sample(sampleID);

            for (let featureID in featureHeader) {
                if (featureID == "sampleID") {
                    continue;
                }

                const abundance = Number(row[featureID]);
                if (abundance > 0) {
                    const feature = new Feature(featureID, abundance);
                    sample.features.push(feature);
                }
            }

            this.samples.push(sample);
        }
    }

    /**
     * Updates the width and height of `this.plotDimensions`.
     */
    updatePlotDimensions(width: number, height: number) {
        this.#plotDimensions.width = width;
        this.#plotDimensions.height = height;
    }

    /**
     * Calculates relative abundance, prevalence, and prevalence proportion for
     * each view taxon in each sample.
     */
    calcTaxaStats() {
        for (let sample of this.samples) {
            sample.calcRelAbun();

            const prevalenceMap: Map<ViewTaxon, number> = new Map();
            sample.tallyPrevalence(prevalenceMap);
            sample.calcPrevalence(prevalenceMap, this.samples.length);
        }
    }

    /**
     * Draws each sample to the barplot.
     */
    drawSamples() {
        // clear <svg> content
        const svgElem = document.querySelector(".barplot")!;
        svgElem.innerHTML = "";

        // draw each sample
        const barWidth = this.#plotDimensions.width / this.samples.length;
        const barHeight = this.#plotDimensions.height;
        for (let [index, sample] of this.samples.entries()) {
            const x0 = index * barWidth;
            const y0 = 0;
            sample.draw(x0, y0, barWidth, barHeight);
        }
    }

    /**
     * Performs an entire render cycle of the barplot, including calculating
     * the set of view taxa, calculating stats for each view taxon, sample
     * filtering & sorting, view taxon filtering & sorting, and sample drawing.
     */
    render() {
        // find view taxa
        for (let sample of this.samples) {
            sample.mapToViewTaxa(this.taxonomy);
        }

        // calculate taxa stats
        this.calcTaxaStats();

        // TODO: filter samples (abundance & metadata)
        // TODO: sort samples (metadata)
        // TODO: filter view taxa
        // TODO: sort view taxa
        // TODO: recalculate taxa stats

        // draw samples
        this.drawSamples();
    }
}

class Sample {
    sampleID: string;
    features: Feature[];
    viewTaxa: ViewTaxon[];
    colors: Colors;

    constructor(sampleID: string) {
        this.sampleID = sampleID;
        this.features = [];
        this.viewTaxa = [];
        this.colors = new Colors();
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
        this.features = [];
        this.abundance = -1;
        this.relAbun = -1;
        this.preval = -1;
        this.prevalProp = -1;
        this.collapsed = false;
        this.expanded = false;
        this.color = "";
    }
}

type PlotDimensions = {
    height: number;
    width: number;
};

export const sampleManager = new SampleManager();
