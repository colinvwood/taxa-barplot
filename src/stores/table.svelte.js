import { get, writable, derived } from 'svelte/store';
import { assignColors } from '../util/colors.js';
import { renderTable } from '../util/table.js';


function createTable() {
    let table = $state(new Map());
    let rendered = $state([]);

    function getSample(id) {
        return table.get(id);
    }

    function render(taxonomy, changes, level, colorScheme, customColors) {
        return null;
    }

}
// export let table = createTable();

function createTableStore() {
    const data = writable({table: new Map(), rendered: []});
    let { subscribe, update, set } = data;

    const getSample = (id) => {
        return get(data).table.get(id);
    };

    const render = async (
        taxonomy, changes, level, colorScheme, customColors
    ) => {
        const rendered = await renderTable(
            get(data).table, taxonomy, changes, level
        );
        const colored = assignColors(
            rendered, colorScheme, customColors
        );
        data.update(state => {
            return {...state, rendered: colored};
        });
    };

    const color = (colorScheme, customColors) => {
        const colored = assignColors(
            get(data).rendered, colorScheme, customColors
        );
        data.update(state => {
            return {...state, rendered: colored};
        });
    };

    return {
        subscribe,
        update,
        set,
        getSample,
        render,
        color,
    };
}
export const tableStore = createTableStore();

export const table = derived(
    tableStore,
    ($tableStore) => $tableStore.table,
);

export const rendered = derived(
    tableStore,
    ($tableStore) => $tableStore.rendered,
);
