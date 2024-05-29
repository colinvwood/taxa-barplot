import { writable } from 'svelte/store';

export const globalTaxonomy = writable([]);
export const globalTable = writable([]);

export const viewLevel = writable(1);

export const selectedTaxon = writable({});
export const hubTaxon = writable({});

export const taxonomyLog = writable([]);
