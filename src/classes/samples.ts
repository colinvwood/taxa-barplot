import { csv } from "d3-fetch";
import { Taxonomy, Taxon, ViewTaxon, Feature } from "./taxonomy";
import { Metadata } from "./metadata";
import { Colors } from "./colors";

class SampleManager {
    samples: Sample[];
    renderedSamples: Sample[];
    metadata: Metadata;
    taxonomy: Taxonomy;
    private plotDimensions: PlotDimensions;
    vtFilters: Map<string, (vt: ViewTaxon) => boolean>;
    vtSort: string;

    constructor() {
        this.samples = [];
        this.renderedSamples = [];
        this.metadata = new Metadata();
        this.taxonomy = new Taxonomy();
        this.plotDimensions = { width: 0, height: 0 };
        this.vtFilters = new Map();
        this.vtSort = "mean relative abundance (descending)";
    }

    /**
     * Parses a feature table saved as a tsv file (with samples as columns,
     * rows as features) into `Sample` and `Feature` objects, and stores the
     * created samples in `this.samples`.
     */
    async parseFeatureTable(filepath: string) {
        let tableLines = await csv(filepath);

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
    setPlotDimensions(width: number, height: number) {
        this.plotDimensions.width = width;
        this.plotDimensions.height = height;
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
     * Adds an abundance filter to `this.fitlers`.
     */
    addAbundanceFilter(value: number, operator: ">" | "<") {
        let filterFunc;
        if (operator == ">") {
            filterFunc = (t: ViewTaxon) => t.relAbun <= value;
        } else {
            filterFunc = (t: ViewTaxon) => t.relAbun >= value;
        }

        const name = `abundance-${operator}-${value}`;

        this.vtFilters.set(name, filterFunc);
    }

    /**
     * Adds a proportional or absolute prevalence filter to `this.filters`.
     */
    addPrevalenceFilter(
        value: number,
        type: "proportion" | "absolute",
        operator: ">" | "<",
    ) {
        let filterFunc;
        if (type == "proportion") {
            if (operator == ">") {
                filterFunc = (vt: ViewTaxon) => vt.prevalProp <= value;
            } else {
                filterFunc = (vt: ViewTaxon) => vt.prevalProp >= value;
            }
        } else {
            if (operator == ">") {
                filterFunc = (vt: ViewTaxon) => vt.preval <= value;
            } else {
                filterFunc = (vt: ViewTaxon) => vt.preval >= value;
            }
        }

        const name = `${type}-proportion-${operator}-${value}`;

        this.vtFilters.set(name, filterFunc);
    }

    /**
     * Removes an abundance or prevalence filter by name.
     */
    removeFilter(name: string) {
        this.vtFilters.delete(name);
    }

    /**
     * Changes `this.sort` to a new `sort`, if valid.
     */
    setSort(sort: string) {
        const validSorts = [
            "mean relative abundance (descending)",
            "mean relative abundance (ascending)",
            "prevalence (descending)",
            "prevalence (ascending)",
        ];

        if (validSorts.indexOf(sort) == -1) {
            throw new Error(`The ${sort} is not valid.`);
        }

        this.vtSort = sort;
    }

    /**
     * Returns the current view taxon sorting function.
     */
    getSortFunc(): (t1: ViewTaxon, t2: ViewTaxon) => number {
        if (this.vtSort == "mean relative abundance (descending)") {
            return (t1, t2) => t1.meanRelAbun - t2.meanRelAbun;
        } else if (this.vtSort == "mean relative abundance (ascending)") {
            return (t1, t2) => t2.meanRelAbun - t1.meanRelAbun;
        } else if (this.vtSort == "prevalence (descending)") {
            return (t1, t2) => t1.preval - t2.preval;
        } else if (this.vtSort == "prevalence (ascending)") {
            return (t1, t2) => t2.preval - t1.preval;
        } else {
            throw new Error(`The ${this.vtSort} sort is not valid.`);
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

        // filter and sort samples
        const renderedSampleIDs = this.metadata.getRenderedSampleIDs();
        this.renderedSamples = this.samples.filter((s) => {
            return renderedSampleIDs.indexOf(s.sampleID) != -1;
        });

        // filter and sort view taxa per sample
        for (let sample of this.renderedSamples) {
            sample.filterViewTaxa(this.vtFilters);
            sample.sortViewTaxa(this.getSortFunc());
        }

        // draw samples
        this.drawSamples();
    }

    /**
     * Draws each sample to the barplot.
     */
    private drawSamples() {
        // clear <svg> content
        const svgElem = document.querySelector(".barplot")!;
        svgElem.innerHTML = "";

        // draw each sample
        const barWidth = this.plotDimensions.width / this.samples.length;
        const barHeight = this.plotDimensions.height;
        const barPadding = 2;

        for (let [index, sample] of this.samples.entries()) {
            const x0 = index * barWidth;
            const y0 = 0;
            sample.draw(x0, y0, barWidth - barPadding, barHeight);
        }
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

            if (viewTaxaMap.get(displayTaxon) == null) {
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
     * Filters `this.viewTaxa` with all filters stored in the sample manager's
     * `filters` attribute.
     */
    filterViewTaxa(filters: Map<string, (vt: ViewTaxon) => boolean>) {
        for (let filterFunc of filters.values()) {
            this.viewTaxa = this.viewTaxa.filter(filterFunc);
        }
    }

    /**
     * Sorts `this.viewTaxa` with the sort stored in the sample manager's
     * `sort` attribute.
     */
    sortViewTaxa(sort: (t1: ViewTaxon, t2: ViewTaxon) => number) {
        this.viewTaxa = this.viewTaxa.sort(sort);
    }

    /**
     *
     */
    draw(x0: number, y0: number, barWidth: number, barHeight: number) {
        const svgElem = document.querySelector(".barplot")!;
        const svgNamespace = "http://www.w3.org/2000/svg";

        for (let viewTaxon of this.viewTaxa) {
            // create and append rect
            const rectHeight = viewTaxon.relAbun * barHeight;
            const rect = document.createElementNS(svgNamespace, "rect");
            rect.setAttribute("x", x0.toString());
            rect.setAttribute("y", y0.toString());
            rect.setAttribute("width", barWidth.toString());
            rect.setAttribute("height", rectHeight.toString());

            // TODO: use `Colors`
            if (Math.random() < 0.5) {
                rect.setAttribute("fill", "#4f34eb");
            } else {
                rect.setAttribute("fill", "#cba4ab");
            }

            // TODO: register click handler

            svgElem.appendChild(rect);
            y0 += rectHeight;
        }
    }
}

type PlotDimensions = {
    height: number;
    width: number;
};

export const sampleManager = new SampleManager();
