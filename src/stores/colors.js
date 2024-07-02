import { writable } from 'svelte/store';

function createColorSchemeStore() {
    const data = writable({colors: [], currentScheme: ''});
    const { update, set, subscribe } = data;


    return {
        update,
        set,
        subscribe,
    };
};
export const colorScheme = createColorSchemeStore();

function customColorsStore() {
    const customColors = writable(new Map());
    const { update, set, subscribe } = customColors;

    const addCustomColor = (taxonId, color) => {
        customColors.update(state => {
            state.set(taxonId, color);
            return state;
        });
    };

    const clearCustomColor = (taxonId) => {
        customColors.update(state => {
            state.delete(taxonId);
            return state;
        });
    };

    return {
        update,
        set,
        subscribe,
        addCustomColor,
        clearCustomColor,
    };

};
export const customColors = customColorsStore();
