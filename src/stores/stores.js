import { writable } from 'svelte/store';

export const globalTaxonomy = writable([]);
export const currentLevelStore = writable([]);
export const selectedTaxon = writable({});
export const hubTaxon = writable({});

export const taxonomyLog = writable([]);
