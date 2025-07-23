import { csv } from "d3-fetch";

export class Metadata {
    rows: MetadataRow[];
    rendered: MetadataRow[];
    columnTypes: Map<string, "categorical" | "numeric">;
    sorts: MetadataSort[];
    filters: Map<string, MetadataFilter>;
    labels: string[];

    constructor() {
        this.rows = [];
        this.columnTypes = new Map();
        this.sorts = [];
        this.filters = new Map();
        this.labels = [];
    }

    /**
     * Parses a metadata.csv file into an array of row objects and initializes
     * `this.metadata` and `this.columnTypes`.
     */
    async parse(filepath: string) {
        let metadataRowsD3 = await csv(filepath);

        let metadataRows: MetadataRow[] = [];
        for (let row of metadataRowsD3) {
            metadataRows.push(row);
        }

        // get metadata type row, create column type map
        const typesRow = metadataRows[0];
        if (typesRow.sampleID != "#q2:types") {
            throw new Error("Expected types row in metadata.");
        }

        for (let column in typesRow) {
            if (column == "sampleID") {
                continue;
            }

            this.columnTypes.set(
                column,
                typesRow[column] as "categorical" | "numeric",
            );
        }

        // remove types row
        this.rows = metadataRows.slice(1);

        // ensure categorical columns are strings; numeric are numbers
        for (let row of this.rows) {
            for (let column in row) {
                const columnType = this.columnTypes.get(column);
                if (columnType == "categorical") {
                    row[column] = String(row[column]);
                } else {
                    row[column] = Number(row[column]);
                }
            }
        }
    }

    /**
     * Adds a metadata sorting function to `this.sorts`. If the sorting column
     * is categorical then levels are sorted in alphabetical order.
     */
    addSort(column: string, ascending: boolean) {
        const columnType = this.columnTypes.get(column);
        let sortFunc;
        if (columnType == "categorical") {
            sortFunc = (row1: MetadataRow, row2: MetadataRow) => {
                if (row1[column] < row2[column]) {
                    if (ascending) {
                        return -1;
                    } else {
                        return 1;
                    }
                } else if (row1[column] > row2[column]) {
                    if (ascending) {
                        return 1;
                    } else {
                        return -1;
                    }
                } else {
                    return 0;
                }
            };
        } else {
            sortFunc = (row1: MetadataRow, row2: MetadataRow) => {
                if (ascending) {
                    return (row1[column] as number) - (row2[column] as number);
                } else {
                    return (row2[column] as number) - (row1[column] as number);
                }
            };
        }

        this.sorts.push(sortFunc);
    }

    /**
     * Removes a metadata sort by index.
     */
    removeSort(index: number) {
        this.sorts = [
            ...this.sorts.slice(0, index),
            ...this.sorts.slice(index + 1),
        ];
    }

    /**
     * Adds a categorical metadata filter to `this.filters`.
     */
    addCategoricalFilter(column: string, levels: string[], keep: boolean) {
        let filterFunc;
        if (keep) {
            filterFunc = (row: MetadataRow) => {
                return levels.indexOf(row[column] as string) != -1;
            };
        } else {
            filterFunc = (row: MetadataRow) => {
                return levels.indexOf(row[column] as string) == -1;
            };
        }

        const name = `${column}_${levels.join(";")}`;

        this.filters.set(name, filterFunc);
    }

    /**
     * Adds a numeric metadata column filter to `this.filters`.
     */
    addNumericFilter(column: string, value: number, operator: ">" | "<") {
        let filterFunc;
        if (operator == ">") {
            filterFunc = (row: MetadataRow) => {
                return (row[column] as number) > value;
            };
        } else {
            filterFunc = (row: MetadataRow) => {
                return (row[column] as number) < value;
            };
        }

        const name = `${column}-${operator}-${value}`;

        this.filters.set(name, filterFunc);
    }

    /**
     * Removes a metadata filter by name.
     */
    removeFilter(name: string) {
        this.filters.delete(name);
    }

    /**
     * Adds a new sample label of `column`, if allowed.
     */
    addLabel(column: string) {
        if (this.labels.length >= 3) {
            alert("Can not have more than 3 labels.");
            return;
        }

        this.labels.push(column);
    }

    /**
     * Removes the `column` label, if present.
     */
    removeLabel(column: string) {
        const labelIndex = this.labels.indexOf(column);
        if (labelIndex == -1) {
            throw new Error(`The column ${column} is not a label.`);
        }

        this.labels = [
            ...this.labels.slice(0, labelIndex),
            ...this.labels.slice(labelIndex + 1),
        ];
    }

    /**
     * Apply all filters and all sorts to the metadata records, and return the
     * final list of rendered sample IDs.
     */
    getRenderedSamples(): string[] {
        let rendered = this.rows;

        // apply filters
        for (let filterFunc of this.filters.values()) {
            rendered = rendered.filter(filterFunc);
        }

        // apply sorts
        const finalBossSortFunc = (row1: MetadataRow, row2: MetadataRow) => {
            let diff = this.sorts[0](row1, row2);

            let sortIndex = 1;
            while (diff == 0 && sortIndex < this.sorts.length) {
                diff = this.sorts[sortIndex](row1, row2);
            }

            return diff;
        };
        rendered = rendered.sort(finalBossSortFunc);

        return rendered.map((row) => row.sampleID as string);
    }
}

type MetadataRow = { [key: string]: string | number };
type MetadataSort = (row1: MetadataRow, row2: MetadataRow) => number;
type MetadataFilter = (row: MetadataRow) => boolean;
