import { csv } from "d3-fetch";

export class Metadata {
    rows: MetadataRow[];
    columnTypes: Map<string, "categorical" | "numeric">;
    sorts: Map<string, MetadataSort>;
    filters: Map<string, MetadataFilter>;
    labels: string[];

    constructor() {
        this.rows = [];
        this.columnTypes = new Map();
        this.sorts = new Map();
        this.filters = new Map();
        this.labels = [];
    }

    /**
     * Parses a metadata.csv file into an array of row objects and initializes
     * `this.metadata` and `this.columnTypes`.
     */
    async parseMetadata(filepath: string) {
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

        // remove type row, save remaining rows
        this.rows = metadataRows.slice(1);
    }

    /**
     *
     */
    addSort(column: string, ascending: boolean) {
        // determine if column categorical or numeric
        const columnType = this.columnTypes.get(column);

        let sortFunc;
        // if categorical, sort levels alphabetically
        if (columnType == "categorical") {
            sortFunc = (row1: MetadataRow, row2: MetadataRow) => {
                if (row1[column] < row2[column]) {
                    if (ascending) {
                        return -1;
                    } else {
                        return 1;
                    }
                } else {
                    if (ascending) {
                        return 1;
                    } else {
                        return -1;
                    }
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
        // create name
        // add name and function to this.sorts
    }

    /**
     *
     */
    removeSort(name: string) {
        this.sorts.delete(name);
    }

    /**
     *
     */
    addCategoricalFilter(
        column: string,
        levelsKept: string[] | null,
        levelsRemoved: string[] | null,
    ) {}

    addNumericFilter(column: string, value: number, operator: ">" | "<") {}

    removeFilter(name: string) {}

    /**
     * Adds a new sample label of `column`, if valid.
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
     *
     */
    getSampleOrdering(): string[] {
        // apply all sorts & filters
        // return resulting ordering
    }
}

type MetadataSort = (row1: object, row2: object) => number;
type MetadataFilter = (row: object) => boolean;
type MetadataRow = { [key: string]: string | number };
