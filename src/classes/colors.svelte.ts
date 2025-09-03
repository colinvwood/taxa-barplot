import { csv } from "d3-fetch";
import { Taxon } from "./taxonomy.svelte";
import { SvelteMap } from "svelte/reactivity";

export class Colors {
    colorSchemes: Map<string, string[]>;
    colorScheme: string;
    schemeIndex: number;
    colorLevel: number;
    customColors: Map<Taxon, string>;
    assignedColors: Map<Taxon, string>;
    previousColor: string;

    constructor() {
        this.colorSchemes = new Map();
        this.colorScheme = $state("before-dawn");
        this.schemeIndex = 0;
        this.colorLevel = 0;
        this.customColors = $state(new SvelteMap());
        this.assignedColors = new Map();
        this.previousColor = "";
    }

    /**
     * Parses a color scheme csv file into `this.colorSchemes`.
     */
    async parse(filepath: string) {
        const colorRows = await csv(filepath);
        for (let row of colorRows) {
            this.colorSchemes.set(row.schemeName, row.colors.split(";"));
        }
    }

    getColorSchemeNames(): string[] {
        return [...this.colorSchemes.keys()];
    }

    setColorScheme(colorScheme: string) {
        if (!this.colorSchemes.has(colorScheme)) {
            throw new Error(`The ${colorScheme} color scheme does not exist.`);
        }

        this.colorScheme = colorScheme;
    }

    addCustomColor(taxon: Taxon, color: string) {
        this.customColors.set(taxon, color);
    }

    removeCustomColor(taxon: Taxon) {
        this.customColors.delete(taxon);
    }

    reset() {
        this.assignedColors = new Map();
        this.schemeIndex = 0;
        this.previousColor = "";
    }

    /**
     * Returns a taxon's assigned color, taking into account custom colors, and
     * higher-level coloring. Higher-level coloring refers to coloring all taxa
     * in the same clade different shades of a central color.
     */
    colorTaxon(taxon: Taxon, displayLevel: number): string {
        let color: string;
        const customColor = this.customColors.get(taxon);
        const assignedColor = this.assignedColors.get(taxon);

        if (customColor) {
            color = customColor;
            this.incrementSchemeIndex();
        } else if (assignedColor) {
            color = assignedColor;
        } else {
            color = this.getNextColor();

            if (color == this.previousColor) {
                color = this.getNextColor();
            }

            this.assignedColors.set(taxon, color);
        }

        this.previousColor = color;

        return color;
    }

    getTaxonColor(taxon: Taxon) {
        const customColor = this.customColors.get(taxon);
        const assignedColor = this.assignedColors.get(taxon);

        if (customColor) {
            return customColor;
        } else if (assignedColor) {
            return assignedColor;
        } else {
            return null;
        }
    }

    private incrementSchemeIndex() {
        const schemeValues = this.colorSchemes.get(this.colorScheme)!;

        this.schemeIndex++;
        if (this.schemeIndex == schemeValues.length) {
            this.schemeIndex = 0;
        }
    }

    private getNextColor(): string {
        const schemeValues = this.colorSchemes.get(this.colorScheme)!;
        const color = schemeValues[this.schemeIndex];
        this.incrementSchemeIndex();

        return color;
    }
}
