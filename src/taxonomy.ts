import { tsv } from "d3-fetch";

export class Taxonomy {
    rootTaxon: Taxon;
    displayLevel: number;
    sort: string;

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
                .filter((n) => n != "");

            for (let [levelIndex, levelName] of levelNames.entries()) {
                const existingChild = this.findChildByName(
                    parentNode,
                    levelName,
                );
                if (existingChild) {
                    parentNode = existingChild;
                } else {
                    const newChild = new Taxon(levelName, parentNode);
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
     * Mark `taxon` and its descendants at level `expandToLevel` as part of an
     * expansion, if valid.
     */
    addExpandFromAncestor(taxon: Taxon, expandToLevel: number): undefined {
        // ensure taxon level is less than the level to which to expand
        const taxonLevel = this.getTaxonLevel(taxon);
        if (taxonLevel >= expandToLevel) {
            throw new Error(
                `Can not expand from level ${taxonLevel} to ${expandToLevel}` +
                    `(from-level must be less than to-level).`,
            );
        }

        // ensure expansion does not create expand/collapse cycle
        if (
            taxon.collapseStatus.ancestor &&
            taxon.collapseStatus.descendantLevel == expandToLevel
        ) {
            throw new Error(
                `Taxon ${taxon.name} can not be expanded to level ` +
                    `${expandToLevel} because it is already collapsed to ` +
                    `from that level.`,
            );
        }

        // ensure taxon is not already the ancestor of an expansion
        if (taxon.expandStatus.ancestor) {
            throw new Error(
                `Taxon ${taxon.name} can not be expanded because it is ` +
                    `already expanded to level ` +
                    `${taxon.expandStatus.descendantLevel}`,
            );
        }

        // ensure taxon has descendants to which to expand
        const descendantTaxa = this.getDescendantsAtLevel(taxon, expandToLevel);
        if (descendantTaxa.length == 0) {
            throw new Error(
                `Taxon ${taxon.name} has no descendants at level ` +
                    `${expandToLevel}.`,
            );
        }

        taxon.expandStatus = {
            ...taxon.expandStatus,
            ancestor: true,
            ancestorLevel: taxonLevel,
            descendantLevel: expandToLevel,
        };

        for (let descendant of descendantTaxa) {
            descendant.expandStatus = {
                ...descendant.expandStatus,
                descendant: true,
                ancestorLevel: taxonLevel,
                descendantLevel: expandToLevel,
            };
        }
    }

    /**
     * Mark `taxon`, its ancestor at level `collapseToLevel`, and all of the
     * siblings of `taxon` with respect to that ancestor as part of a collapse,
     * if valid.
     */
    addCollapseFromDescendant(
        taxon: Taxon,
        collapseToLevel: number,
    ): undefined {
        // ensure taxon level is greater than the level to which to collpase
        const taxonLevel = this.getTaxonLevel(taxon);
        if (taxonLevel <= collapseToLevel) {
            throw new Error(
                `Can not collapse from level ${taxonLevel} to ` +
                    `${collapseToLevel} (from-level must be greater than ` +
                    `to-level).`,
            );
        }

        // ensure collapse does not create expand/collapse cycle
        if (
            taxon.expandStatus.descendant &&
            taxon.expandStatus.ancestorLevel == collapseToLevel
        ) {
            throw new Error(
                `Taxon ${taxon.name} can not be collapsed to level ` +
                    `${collapseToLevel} because it is already expanded from ` +
                    `that level.`,
            );
        }

        const ancestor = this.getAncestorAtLevel(taxon, collapseToLevel);
        const siblings = this.getDescendantsAtLevel(ancestor, taxonLevel);

        // ensure no sibling is already a descendant of a collapse
        for (let sibling of siblings) {
            if (sibling.collapseStatus.descendant) {
                throw new Error(
                    `Taxon ${taxon.name} can not be collapsed because it or ` +
                        `one of its siblings is already collapsed to level ` +
                        `${taxon.collapseStatus.ancestorLevel}.`,
                );
            }
        }

        ancestor.collapseStatus = {
            ...ancestor.collapseStatus,
            ancestor: true,
            ancestorLevel: collapseToLevel,
            descendantLevel: taxonLevel,
        };

        for (let sibling of siblings) {
            sibling.collapseStatus = {
                ...sibling.collapseStatus,
                descendant: true,
                ancestorLevel: collapseToLevel,
                descendantLevel: taxonLevel,
            };
        }
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
    findChildByName(parent: Taxon, name: string): Taxon | null {
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
    findTaxonByFeatureID(featureID: string): Taxon {
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

    getTaxonLevel(taxon: Taxon): number {
        if (taxon.parent == null) {
            return 1;
        }

        return this.getTaxonLevel(taxon.parent) + 1;
    }
}

type ExpandCollapseStatus = {
    ancestor: boolean;
    descendant: boolean;
    ancestorLevel: number | null;
    descendantLevel: number | null;
};

class Taxon {
    name: string;
    parent: Taxon | null;
    children: Taxon[];

    selected: boolean;
    expandStatus: ExpandCollapseStatus;
    collapseStatus: ExpandCollapseStatus;

    featureIDs: string[];

    constructor(name: string, parent: Taxon | null) {
        this.name = name;
        this.parent = parent;

        this.selected = false;

        this.expandStatus = {
            ancestor: false,
            descendant: false,
            ancestorLevel: null,
            descendantLevel: null,
        };
        this.collapseStatus = {
            ancestor: false,
            descendant: false,
            ancestorLevel: null,
            descendantLevel: null,
        };

        this.featureIDs = [];
    }
}

class Feature {
    featureID: string;
    abundance: number;
    taxon: Taxon;

    constructor(featureID: string, taxon: Taxon) {
        this.featureID = featureID;
        this.taxon = taxon;
    }
}
