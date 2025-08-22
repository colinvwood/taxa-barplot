import { csv } from "d3-fetch";
import { Taxonomy, Taxon, ViewTaxon, Feature } from "./taxonomy";
import { Sample } from "./sample";
import { SampleControls } from "./sampleControls";
import { Colors } from "./colors";
import { Plot } from "./plot";

class SampleManager {
    samples: Sample[];
    renderedSamples: Sample[];
    sampleControls: SampleControls;
    taxonomy: Taxonomy;
    colors: Colors;
    plot: Plot;
    vtFilters: Map<string, (vt: ViewTaxon) => boolean>;
    vtSort: string;

    constructor() {
        this.samples = [];
        this.renderedSamples = [];
        this.sampleControls = new SampleControls();
        this.taxonomy = new Taxonomy();
        this.colors = new Colors();
        this.plot = new Plot();
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
     * Calculates relative abundance, prevalence, prevalence proportion, and
     * mean relative abundance for each view taxon in each sample.
     */
    calcTaxaStats() {
        const prevalMap: Map<Taxon, number> = new Map();
        const relAbunMap: Map<Taxon, number> = new Map();

        for (let sample of this.samples) {
            sample.calcRelAbun();
            sample.tallyGlobalStats(prevalMap, relAbunMap);
        }
        for (let sample of this.samples) {
            sample.calcGlobalStats(prevalMap, relAbunMap, this.samples.length);
        }
    }

    /**
     *
     */
    getAllViewTaxa(): ViewTaxon[] {
        const allViewTaxa: Set<ViewTaxon> = new Set();
        for (let sample of this.renderedSamples) {
            for (let viewTaxon of sample.viewTaxa) {
                allViewTaxa.add(viewTaxon);
            }
        }

        return [...allViewTaxa];
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

        const name = `${type}-prevalence-${operator}-${value}`;

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
        if (this.getValidSorts().indexOf(sort) == -1) {
            throw new Error(`The ${sort} is not valid.`);
        }

        this.vtSort = sort;
    }

    /**
     *
     */
    getValidSorts(): string[] {
        return [
            "mean relative abundance (descending)",
            "mean relative abundance (ascending)",
            "prevalence (descending)",
            "prevalence (ascending)",
        ];
    }

    /**
     * Returns the current view taxon sorting function.
     */
    getSortFunc(): (t1: ViewTaxon, t2: ViewTaxon) => number {
        if (this.vtSort == "mean relative abundance (descending)") {
            return (t1, t2) => t2.meanRelAbun - t1.meanRelAbun;
        } else if (this.vtSort == "mean relative abundance (ascending)") {
            return (t1, t2) => t1.meanRelAbun - t2.meanRelAbun;
        } else if (this.vtSort == "prevalence (descending)") {
            return (t1, t2) => t2.preval - t1.preval;
        } else if (this.vtSort == "prevalence (ascending)") {
            return (t1, t2) => t1.preval - t2.preval;
        } else {
            throw new Error(`The ${this.vtSort} sort is not valid.`);
        }
    }

    /**
     * Performs an entire render cycle of the barplot, including calculating
     * the set of view taxa, calculating stats for each view taxon, sample
     * filtering & sorting, view taxon filtering & sorting, and sample drawing.
     */
    async render() {
        // find view taxa
        for (let sample of this.samples) {
            sample.mapToViewTaxa(this.taxonomy);
        }

        // calculate taxa stats
        this.calcTaxaStats();

        // filter and sort samples
        this.renderedSamples = this.sampleControls.getRenderedSamples(
            this.samples,
        );

        // filter and sort view taxa per sample
        for (let sample of this.renderedSamples) {
            sample.filterViewTaxa(this.vtFilters);
            sample.sortViewTaxa(this.getSortFunc());
        }

        // draw samples
        this.plot.drawSamples(this.renderedSamples, this.colors);
    }
}

export const sampleManager = new SampleManager();
