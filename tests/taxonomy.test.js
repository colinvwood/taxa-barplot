import { test, expect } from 'vitest';
import {
    getTaxaAtLevel, getTaxaAboveLevel, getTaxaBeneathLevel, getTaxonById,
    getParent, getSiblings, getChildren, getDescendants, getAncestors
} from '../src/util/taxonomy.js';


// note: `group` and `expand` properties not included for brevity
const taxonomy = [
    {id: 'a1', name: 'a1', parent: null, level: 1},
    {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2},
    {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2},
    {id: 'a2', name: 'a2', parent: null, level: 1},
    {id: 'a2;b2', name: 'b2', parent: 'a2', level: 2},
    {id: 'a2;b2;c1', name: 'c1', parent: 'a2;b2', level: 3},
];

test('getTaxaAtLevel', async () => {
    let obs = await getTaxaAtLevel(taxonomy, 1);
    let exp = [
        {id: 'a1', name: 'a1', parent: null, level: 1},
        {id: 'a2', name: 'a2', parent: null, level: 1},
    ];
    expect(obs).toEqual(exp);

    obs = await getTaxaAtLevel(taxonomy, 3);
    exp = [
        {id: 'a2;b2;c1', name: 'c1', parent: 'a2;b2', level: 3},
    ];
    expect(obs).toEqual(exp);

    obs = await getTaxaAtLevel(taxonomy, 4);
    exp = [];
    expect(obs).toEqual(exp);

    obs = await getTaxaAtLevel(taxonomy, 0);
    exp = [];
    expect(obs).toEqual(exp);
});

test('getTaxaAboveLevel', async () => {
    let obs = await getTaxaAboveLevel(taxonomy, 2);
    let exp = [
        {id: 'a1', name: 'a1', parent: null, level: 1},
        {id: 'a2', name: 'a2', parent: null, level: 1},
    ];
    expect(obs).toEqual(exp);

    obs = await getTaxaAboveLevel(taxonomy, 3);
    exp = [
        {id: 'a1', name: 'a1', parent: null, level: 1},
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2},
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2},
        {id: 'a2', name: 'a2', parent: null, level: 1},
        {id: 'a2;b2', name: 'b2', parent: 'a2', level: 2},
    ];
    expect(obs).toEqual(exp);

    obs = await getTaxaAboveLevel(taxonomy, 4);
    expect(obs).toEqual(taxonomy);
    obs = await getTaxaAboveLevel(taxonomy, 100);
    expect(obs).toEqual(taxonomy);

    obs = await getTaxaAboveLevel(taxonomy, 0);
    exp = [];
    expect(obs).toEqual(exp);
});

test('getTaxaBeneathLevel', async () => {
    let obs = await getTaxaBeneathLevel(taxonomy, 1);
    let exp = [
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2},
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2},
        {id: 'a2;b2', name: 'b2', parent: 'a2', level: 2},
        {id: 'a2;b2;c1', name: 'c1', parent: 'a2;b2', level: 3},
    ];
    expect(obs).toEqual(exp);

    obs = await getTaxaBeneathLevel(taxonomy, 2);
    exp = [
        {id: 'a2;b2;c1', name: 'c1', parent: 'a2;b2', level: 3},
    ];
    expect(obs).toEqual(exp);

    obs = await getTaxaBeneathLevel(taxonomy, 3);
    exp = [];
    expect(obs).toEqual(exp);

    obs = await getTaxaBeneathLevel(taxonomy, 100);
    exp = [];
    expect(obs).toEqual(exp);

    obs = await getTaxaBeneathLevel(taxonomy, 0);
    expect(obs).toEqual(taxonomy);
});

test('getTaxonById', async () => {
    let obs = await getTaxonById(taxonomy, 'a2;b2');
    let exp = {id: 'a2;b2', name: 'b2', parent: 'a2', level: 2};
    expect(obs).toEqual(exp);

    obs = await getTaxonById(taxonomy, 'john cena');
    exp = null;
    expect(obs).toEqual(exp);
});

test('getParent', async () => {
    let taxon = taxonomy[1];
    let exp = taxonomy[0];
    let obs = await getParent(taxonomy, taxon);
    expect(obs).toEqual(exp);

    taxon = taxonomy[4];
    exp = taxonomy[3];
    obs = await getParent(taxonomy, taxon);
    expect(obs).toEqual(exp);

    taxon = taxonomy[0];
    exp = null;
    obs = await getParent(taxonomy, taxon);
    expect(obs).toEqual(exp);

    taxon = {id: 'a;b;c', name: 'c', parent: 'a;b', level: 3};
    exp = null;
    obs = await getParent(taxonomy, taxon);
    expect(obs).toEqual(exp);
});


test('getSiblings', async () => {
    let taxon = taxonomy[1];
    let exp = [taxonomy[2]];
    let obs = await getSiblings(taxonomy, taxon);
    expect(obs).toEqual(exp);

    taxon = taxonomy[0];
    exp = [];
    obs = await getSiblings(taxonomy, taxon);
    expect(obs).toEqual(exp);
});

test('getChildren', async () => {
    let taxon = taxonomy[0];
    let exp = [taxonomy[1], taxonomy[2]];
    let obs = await getChildren(taxonomy, taxon);
    expect(obs).toEqual(exp);

    taxon = taxonomy[4];
    exp = [taxonomy[5]];
    obs = await getChildren(taxonomy, taxon);
    expect(obs).toEqual(exp);

    taxon = {id: 'a;b;c', name: 'c', parent: 'a;b', level: 3}
    exp = [];
    obs = await getChildren(taxonomy, taxon);
    expect(obs).toEqual(exp);
});

test('getDescendants', async () => {
    let taxon = taxonomy[0];
    let exp = [taxonomy[1], taxonomy[2]];
    let obs = await getDescendants(taxonomy, taxon);
    expect(obs).toEqual(exp);

    taxon = taxonomy[3];
    exp = [taxonomy[4], taxonomy[5]];
    obs = await getDescendants(taxonomy, taxon);
    expect(obs).toEqual(exp);

    taxon = taxonomy[5];
    exp = [];
    obs = await getDescendants(taxonomy, taxon);
    expect(obs).toEqual(exp);
});

test('getAncestors', async () => {
    let taxon = taxonomy[5];
    let exp = [taxonomy[3], taxonomy[4]];
    let obs = await getAncestors(taxonomy, taxon);
    expect(obs).toEqual(exp);

    taxon = taxonomy[1];
    exp = [taxonomy[0]];
    obs = await getAncestors(taxonomy, taxon);
    expect(obs).toEqual(exp);

    taxon = taxonomy[0];
    exp = [];
    obs = await getAncestors(taxonomy, taxon);
    expect(obs).toEqual(exp);
});
