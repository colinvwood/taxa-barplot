import { tsv } from "d3-fetch";
import { Legend } from "./legend";

export class Taxonomy {
    rootTaxon: Taxon;
    displayLevel: number;
    legend: Legend;

    constructor() {
        this.rootTaxon = new Taxon("placeholder", null);
        this.displayLevel = 1;
        this.legend = new Legend();
    }

    /**
     * Parses a taxonomy.tsv file into a tree of `Taxon` objects. Initializes
     * `this.rootTaxon` to the root of this tree.
     */
    async parse(filepath: string) {
        const root = new Taxon("root", null);
        this.rootTaxon = root;

        const taxonomyRecords = await tsv(filepath);

        for (let taxonRecord of taxonomyRecords) {
            let parentNode = root;

            const featureID = taxonRecord["Feature ID"];
            const levelNames = taxonRecord["Taxon"]
                .split(";")
                .map((n: string) => n.trim())
                .filter((n: string) => n != "");

            for (let [levelIndex, levelName] of levelNames.entries()) {
                const existingChild = this.findChildByName(
                    parentNode,
                    levelName,
                );
                if (existingChild != null) {
                    parentNode = existingChild;
                } else {
                    const newChild = new Taxon(levelName, parentNode);
                    parentNode.children.push(newChild);
                    parentNode = newChild;
                }

                if (levelIndex == levelNames.length - 1) {
                    // the final node is the classification of a feature
                    parentNode.featureIDs.push(featureID);
                }
            }
        }
    }

    /**
     * Updates `this.displayLevel` as long as the desired level is within the
     * valid range.
     */
    setDisplayLevel(displayLevel: number) {
        const descendants = this.getDescendants(this.rootTaxon);
        const levels = descendants.map((d) => this.getTaxonLevel(d));
        const maxLevel = Math.max(...levels);

        if (displayLevel < 1) {
            alert("Can not set display level lower than 1.");
        } else if (displayLevel > maxLevel) {
            alert(`Can not set display level to more than ${maxLevel}.`);
        } else {
            this.displayLevel = displayLevel;
        }
    }

    /**
     *
     */
    addExpandFromAncestor(taxon: Taxon, expandToLevel: number): boolean {
        // ensure taxon level is less than the level to which to expand
        const taxonLevel = this.getTaxonLevel(taxon);
        if (taxonLevel >= expandToLevel) {
            alert("Expansion from-level must be less than to-level.");
            return false;
        }

        // ensure taxon has descendants to which to expand
        const descendantTaxa = this.getDescendantsAtLevel(taxon, expandToLevel);
        if (descendantTaxa.length == 0) {
            alert(`Taxon has no descendants at level ${expandToLevel}.`);
            return false;
        }

        // scan sub tree to ensure no other expand/collapse
        if (!this.isSubTreeClear(taxon, expandToLevel)) {
            alert("An expansion or collapse was detected in the subtree.");
            return false;
        }

        taxon.expandTo = expandToLevel;

        // todo: update data structure tracking expansions & collapses

        return true;
    }

    /**
     *
     */
    addCollapseFromDescendant(taxon: Taxon, collapseToLevel: number): boolean {
        // ensure taxon level is greater than the level to which to collpase
        const taxonLevel = this.getTaxonLevel(taxon);
        if (taxonLevel <= collapseToLevel) {
            alert("Collapse from-level must be greater than to-level.");
            return false;
        }

        const ancestor = this.getAncestorAtLevel(taxon, collapseToLevel);

        // scan sub tree to ensure no other expand/collapse
        if (!this.isSubTreeClear(ancestor, taxonLevel)) {
            alert("An expansion or collapse was detected in the subtree.");
            return false;
        }

        ancestor.collapseFrom = taxonLevel;

        // todo: update data structure tracking expansions & collapses

        return true;
    }

    /**
     * For a given feature ID find the taxon at which it is displayed, taking
     * into account display level, expansions, and collapses.
     */
    getDisplayTaxon(featureID: string): Taxon {
        // find taxon by feature ID
        const featureTaxon = this.findTaxonByFeatureID(featureID);
        const featureTaxonLevel = this.getTaxonLevel(featureTaxon);

        // map to ancestor if needed
        let taxon: Taxon;
        if (featureTaxonLevel > this.displayLevel) {
            taxon = this.getAncestorAtLevel(featureTaxon, this.displayLevel);
        } else {
            taxon = featureTaxon;
        }

        // follow expansion if present
        if (taxon.expandTo != null) {
            if (taxon.expandTo >= featureTaxonLevel) {
                return featureTaxon;
            }
            return this.getAncestorAtLevel(featureTaxon, taxon.expandTo);
        }

        // follow collapse if present
        const ancestors = this.getAncestors(taxon);
        const collapsedAncestors = ancestors.filter((a) => {
            return (
                a.collapseFrom != null && a.collapseFrom >= this.displayLevel
            );
        });

        if (collapsedAncestors.length > 1) {
            throw new Error("Expected at most one valid collapse ancestor.");
        }
        if (collapsedAncestors.length == 1) {
            return collapsedAncestors[0];
        }

        return taxon;
    }

    /**
     * Checks a subtree in the taxonomy extending from `ancestor` down to
     * `descendantLevel` for any taxa marked as expanded or collapsed. If any
     * are found, false is returned; if none are found true is returned.
     */
    private isSubTreeClear(ancestor: Taxon, descendantLevel: number): boolean {
        const descendants = this.getDescendants(ancestor);
        const violators = descendants.filter((d) => {
            const inSubTree = this.getTaxonLevel(d) <= descendantLevel;
            const isCollapsed = d.expandTo != null;
            const isExpanded = d.collapseFrom != null;

            return inSubTree && (isCollapsed || isExpanded);
        });

        return violators.length == 0;
    }

    /**
     * Return all descendants of `taxon`, including `taxon`.
     */
    getDescendants(taxon: Taxon): Taxon[] {
        const descendants: Taxon[] = [taxon];

        for (let child of taxon.children) {
            descendants.push(...this.getDescendants(child));
        }

        return descendants;
    }

    /**
     * Returns the descendants of `taxon` at `level` or an empty array if there
     * are none.
     */
    getDescendantsAtLevel(taxon: Taxon, level: number): Taxon[] {
        const descendants = this.getDescendants(taxon);
        if (descendants.length == 0) {
            return descendants;
        }

        return descendants.filter((descendant) => {
            return this.getTaxonLevel(descendant) == level;
        });
    }

    /**
     * Return all ancestors of `taxon`, including `taxon`.
     */
    getAncestors(taxon: Taxon): Taxon[] {
        if (taxon.parent == null) {
            return [taxon];
        }

        return [...this.getAncestors(taxon.parent), taxon];
    }

    /**
     * Returns the ancestor of `taxon` at level `level`.
     */
    getAncestorAtLevel(taxon: Taxon, level: number): Taxon {
        if (this.getTaxonLevel(taxon) < level) {
            throw new Error("Taxon level less than ancestor level.");
        }

        const ancestors = this.getAncestors(taxon);

        const ancestorsAtLevel = ancestors.filter((ancestor) => {
            return this.getTaxonLevel(ancestor) == level;
        });

        if (ancestorsAtLevel.length > 1) {
            throw new Error("Multiple ancestors.");
        }
        if (ancestorsAtLevel.length < 1) {
            throw new Error("No ancestor found.");
        }

        return ancestorsAtLevel[0];
    }

    /**
     * Searches all children of `parent` for a child with name `name`. Returns
     * the child if found, or null if no matching child is found.
     */
    private findChildByName(parent: Taxon, name: string): Taxon | null {
        let matchingChildren = parent.children.filter((child) => {
            return child.name == name;
        });

        if (matchingChildren.length > 1) {
            throw new Error("More than one matching child found.");
        }
        if (matchingChildren.length == 0) {
            return null;
        }

        return matchingChildren[0];
    }

    /**
     * Find the classification of the feature with id `featureID` by searching
     * the entire taxonomy.
     */
    private findTaxonByFeatureID(featureID: string): Taxon {
        const allTaxa = this.getDescendants(this.rootTaxon);
        const matches = allTaxa.filter(
            (t) => t.featureIDs.indexOf(featureID) != -1,
        );

        if (matches.length > 1) {
            throw new Error(
                `Feature ${featureID} classified to more than one taxon:
                 ${matches}.`,
            );
        }
        if (matches.length == 0) {
            throw new Error(`Feature ${featureID} not found in taxonomy.`);
        }
        return matches[0];
    }

    private getTaxonLevel(taxon: Taxon): number {
        if (taxon.parent == null) {
            return 1;
        }

        return this.getTaxonLevel(taxon.parent) + 1;
    }

    /**
     * Return the full taxonomic string of `taxon`. Serves as a unique id.
     */
    private getFullTaxonomicString(taxon: Taxon): string {
        const ancestors = this.getAncestors(taxon);

        return ancestors.join(";");
    }
}

export class Taxon {
    name: string;
    parent: Taxon | null;
    children: Taxon[];

    selected: boolean;
    expandTo: number | null;
    collapseFrom: number | null;

    featureIDs: string[];

    constructor(name: string, parent: Taxon | null) {
        this.name = name;
        this.parent = parent;
        this.children = [];
        this.selected = false;
        this.expandTo = null;
        this.collapseFrom = null;
        this.featureIDs = [];
    }
}

export class ViewTaxon {
    taxon: Taxon;
    features: Feature[];
    abundance: number;
    relAbun: number;
    meanRelAbun: number;
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
        this.meanRelAbun = -1;
        this.preval = -1;
        this.prevalProp = -1;
        this.collapsed = false;
        this.expanded = false;
        this.color = "";
    }
}

export class Feature {
    featureID: string;
    abundance: number;

    constructor(featureID: string, abundance: number) {
        this.featureID = featureID;
        this.abundance = abundance;
    }
}
