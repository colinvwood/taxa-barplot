import { writable } from 'svelte/store';

export const globalTaxonomyStore = writable([]);
export const parentStore = writable([]);
export const siblingsStore = writable([]);
export const childrenStore = writable([]);
