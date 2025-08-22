import { ViewTaxon } from "./taxonomy";

export class FeatureControls {
    filters: FeatureFilter[];
    sort: FeatureSort;

    constructor() {
        this.filters = [];
        this.sort = this.setSort("mean relative abundance", false);
    }

    addAbundanceFilter(value: number, operator: ">" | "<") {
        let func;
        if (operator == ">") {
            func = (t: ViewTaxon) => t.relAbun <= value;
        } else {
            func = (t: ViewTaxon) => t.relAbun >= value;
        }

        const name = `abundance ${operator} ${value}`;
        const filter = { name, func };
        this.filters.push(filter);
    }

    addPrevalenceFilter(
        value: number,
        type: "absolute" | "proportion",
        operator: ">" | "<",
    ) {
        let property: "preval" | "prevalProp";
        if (type == "absolute") {
            property = "preval";
        } else {
            property = "prevalProp";
        }

        let func;
        if (operator == ">") {
            func = (vt: ViewTaxon) => vt[property] <= value;
        } else {
            func = (vt: ViewTaxon) => vt[property] >= value;
        }

        const name = `${type}-prevalence-${operator}-${value}`;
        const filter = { name, func };
        this.filters.push(filter);
    }

    removeFilter(name: string) {
        const names = this.filters.map((f) => f.name);
        const index = names.indexOf(name);

        this.filters = [
            ...this.filters.slice(0, index),
            ...this.filters.slice(index + 1),
        ];
    }

    setSort(
        type: "mean relative abundance" | "prevalence",
        ascending: boolean,
    ): FeatureSort {
        let func: (t1: ViewTaxon, t2: ViewTaxon) => number;

        if (type == "mean relative abundance" && ascending) {
            func = (t1, t2) => t1.meanRelAbun - t2.meanRelAbun;
        } else if (type == "mean relative abundance" && !ascending) {
            func = (t1, t2) => t2.meanRelAbun - t1.meanRelAbun;
        } else if (type == "prevalence" && ascending) {
            func = (t1, t2) => t1.preval - t2.preval;
        } else {
            func = (t1, t2) => t2.preval - t1.preval;
        }

        const name = `${type} ${ascending ? "ascending" : "descending"}`;
        const sort = { name, func };
        this.sort = sort;

        return sort;
    }
}

export type FeatureFilter = {
    name: string;
    func: (t: ViewTaxon) => boolean;
};
export type FeatureSort = {
    name: string;
    func: (t1: ViewTaxon, t2: ViewTaxon) => number;
};
