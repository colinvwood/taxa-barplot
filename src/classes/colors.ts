import { csv } from "d3-fetch";
import { Taxon } from "./taxonomy";

export class Colors {
    colorSchemes: Map<string, string[]>;
    colorScheme: string[];
    schemeIndex: number;
    colorLevel: number;
    customColors: Map<Taxon, string>;
    assignedColors: Map<Taxon, string>;
    previousColor: string;

    constructor() {
        this.colorSchemes = new Map();
        this.colorScheme = [];
        this.schemeIndex = 0;
        this.colorLevel = 0;
        this.customColors = new Map();
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

    /**
     *
     */
    updateColorScheme(schemeName: string) {
        if (!this.colorSchemes.has(schemeName)) {
            throw new Error(`The ${schemeName} color scheme does not exist.`);
        }

        this.colorScheme = this.colorSchemes.get(schemeName)!;
    }

    /**
     *
     */
    addCustomColor(taxon: Taxon, color: string) {
        this.customColors.set(taxon, color);
    }

    /**
     *
     */
    removeCustomColor(taxon: Taxon) {
        this.customColors.delete(taxon);
    }

    /**
     * Returns a taxon's assigned color, taking into account custom colors, and
     * higher-level coloring. Higher-level coloring refers to coloring all taxa
     * in the same clade different shades of a central color.
     */
    getTaxonColor(taxon: Taxon, displayLevel: number): string {
        let color: string;
        const customColor = this.customColors.get(taxon);
        const assignedColor = this.assignedColors.get(taxon);

        if (customColor) {
            color = customColor;
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

    /**
     *
     */
    private getNextColor(): string {
        const color = this.colorScheme[this.schemeIndex];
        this.schemeIndex = ++this.schemeIndex % this.colorScheme.length;

        return color;
    }
}
