import { test, expect } from 'vitest';
import {
    getTaxaAtLevel, getTaxaAboveLevel, getTaxaBeneathLevel, getTaxonById,
    getParent, getSiblings, getChildren, getDescendants, getAncestors,
    renderTaxonomicView
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

test('getTaxaAtLevel', () => {
    let obs = getTaxaAtLevel(taxonomy, 1);
    let exp = [
        {id: 'a1', name: 'a1', parent: null, level: 1},
        {id: 'a2', name: 'a2', parent: null, level: 1},
    ];
    expect(exp).toEqual(obs);

    obs = getTaxaAtLevel(taxonomy, 3);
    exp = [
        {id: 'a2;b2;c1', name: 'c1', parent: 'a2;b2', level: 3},
    ];
    expect(exp).toEqual(obs);

    obs = getTaxaAtLevel(taxonomy, 4);
    exp = [];
    expect(exp).toEqual(obs);

    obs = getTaxaAtLevel(taxonomy, 0);
    exp = [];
    expect(exp).toEqual(obs);
});

test('getTaxaAboveLevel', () => {
    let obs = getTaxaAboveLevel(taxonomy, 2);
    let exp = [
        {id: 'a1', name: 'a1', parent: null, level: 1},
        {id: 'a2', name: 'a2', parent: null, level: 1},
    ];
    expect(exp).toEqual(obs);

    obs = getTaxaAboveLevel(taxonomy, 3);
    exp = [
        {id: 'a1', name: 'a1', parent: null, level: 1},
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2},
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2},
        {id: 'a2', name: 'a2', parent: null, level: 1},
        {id: 'a2;b2', name: 'b2', parent: 'a2', level: 2},
    ];
    expect(exp).toEqual(obs);

    obs = getTaxaAboveLevel(taxonomy, 4);
    expect(obs).toEqual(taxonomy);
    obs = getTaxaAboveLevel(taxonomy, 100);
    expect(obs).toEqual(taxonomy);

    obs = getTaxaAboveLevel(taxonomy, 0);
    exp = [];
    expect(exp).toEqual(obs);
});

test('getTaxaBeneathLevel', () => {
    let obs = getTaxaBeneathLevel(taxonomy, 1);
    let exp = [
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2},
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2},
        {id: 'a2;b2', name: 'b2', parent: 'a2', level: 2},
        {id: 'a2;b2;c1', name: 'c1', parent: 'a2;b2', level: 3},
    ];
    expect(exp).toEqual(obs);

    obs = getTaxaBeneathLevel(taxonomy, 2);
    exp = [
        {id: 'a2;b2;c1', name: 'c1', parent: 'a2;b2', level: 3},
    ];
    expect(exp).toEqual(obs);

    obs = getTaxaBeneathLevel(taxonomy, 3);
    exp = [];
    expect(exp).toEqual(obs);

    obs = getTaxaBeneathLevel(taxonomy, 100);
    exp = [];
    expect(exp).toEqual(obs);

    obs = getTaxaBeneathLevel(taxonomy, 0);
    expect(obs).toEqual(taxonomy);
});

test('getTaxonById', async () => {
    let obs = await getTaxonById(taxonomy, 'a2;b2');
    let exp = {id: 'a2;b2', name: 'b2', parent: 'a2', level: 2};
    expect(exp).toEqual(obs);

    obs = await getTaxonById(taxonomy, 'john cena');
    exp = null;
    expect(exp).toEqual(obs);
});

test('getParent', async () => {
    let taxon = taxonomy[1];
    let exp = taxonomy[0];
    let obs = await getParent(taxonomy, taxon);
    expect(exp).toEqual(obs);

    taxon = taxonomy[4];
    exp = taxonomy[3];
    obs = await getParent(taxonomy, taxon);
    expect(exp).toEqual(obs);

    taxon = taxonomy[0];
    exp = null;
    obs = await getParent(taxonomy, taxon);
    expect(exp).toEqual(obs);

    taxon = {id: 'a;b;c', name: 'c', parent: 'a;b', level: 3};
    exp = null;
    obs = await getParent(taxonomy, taxon);
    expect(exp).toEqual(obs);
});


test('getSiblings', async () => {
    let taxon = taxonomy[1];
    let exp = [taxonomy[2]];
    let obs = await getSiblings(taxonomy, taxon);
    expect(exp).toEqual(obs);

    taxon = taxonomy[0];
    exp = [];
    obs = await getSiblings(taxonomy, taxon);
    expect(exp).toEqual(obs);
});

test('getChildren', () => {
    let taxon = taxonomy[0];
    let exp = [taxonomy[1], taxonomy[2]];
    let obs = getChildren(taxonomy, taxon);
    expect(exp).toEqual(obs);

    taxon = taxonomy[4];
    exp = [taxonomy[5]];
    obs = getChildren(taxonomy, taxon);
    expect(exp).toEqual(obs);

    taxon = {id: 'a;b;c', name: 'c', parent: 'a;b', level: 3}
    exp = [];
    obs = getChildren(taxonomy, taxon);
    expect(exp).toEqual(obs);
});

test('getDescendants', () => {
    let taxon = taxonomy[0];
    let exp = [taxonomy[1], taxonomy[2]];
    let obs = getDescendants(taxonomy, taxon);
    expect(exp).toEqual(obs);

    taxon = taxonomy[3];
    exp = [taxonomy[4], taxonomy[5]];
    obs = getDescendants(taxonomy, taxon);
    expect(exp).toEqual(obs);

    taxon = taxonomy[5];
    exp = [];
    obs = getDescendants(taxonomy, taxon);
    expect(exp).toEqual(obs);
});

test('getAncestors', async () => {
    let taxon = taxonomy[5];
    let exp = [taxonomy[3], taxonomy[4]];
    let obs = await getAncestors(taxonomy, taxon);
    expect(exp).toEqual(obs);

    taxon = taxonomy[1];
    exp = [taxonomy[0]];
    obs = await getAncestors(taxonomy, taxon);
    expect(exp).toEqual(obs);

    taxon = taxonomy[0];
    exp = [];
    obs = await getAncestors(taxonomy, taxon);
    expect(exp).toEqual(obs);
});

test('renderTaxonomicView groups', async () => {
    const taxonomy = [
        {id: 'a1', name: 'a1', parent: null, level: 1, group: false},
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2, group: false},
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2, group: false},
        {id: 'a1;b2;c1', name: 'b2', parent: 'a1;b2', level: 3, group: false},
        {id: 'a2', name: 'a2', parent: null, level: 1, group: false},
        {id: 'a2;b1', name: 'b1', parent: 'a2', level: 2, group: false},
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3, group: false},
        {id: 'a2;b1;c2', name: 'c2', parent: 'a2;b1', level: 3, group: false},
    ];

    // single group
    taxonomy[5].group = true;
    let obs = await renderTaxonomicView(taxonomy, 3);
    let exp = [
        {id: 'a1;b2;c1', name: 'b2', parent: 'a1;b2', level: 3, group: false},
        {id: 'a2;b1', name: 'b1', parent: 'a2', level: 2, group: true},
    ];
    expect(exp).toEqual(obs);
    taxonomy[5].group = false;

    // two groups
    taxonomy[0].group = true;
    taxonomy[4].group = true;
    obs = await renderTaxonomicView(taxonomy, 3);
    exp = [
        {id: 'a1', name: 'a1', parent: null, level: 1, group: true},
        {id: 'a2', name: 'a2', parent: null, level: 1, group: true},
    ];
    expect(exp).toEqual(obs);
    taxonomy[0].group = false;
    taxonomy[4].group = false;

    // ignored group
    taxonomy[1].group = true;
    obs = await renderTaxonomicView(taxonomy, 1);
    exp = [
        {id: 'a1', name: 'a1', parent: null, level: 1, group: false},
        {id: 'a2', name: 'a2', parent: null, level: 1, group: false},
    ];
    expect(exp).toEqual(obs);
    taxonomy[1].group = false;

    // impossible group
    taxonomy[3].group = true;
    obs = await renderTaxonomicView(taxonomy, 3);
    exp = [
        {id: 'a1;b2;c1', name: 'b2', parent: 'a1;b2', level: 3, group: true},
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3, group: false},
        {id: 'a2;b1;c2', name: 'c2', parent: 'a2;b1', level: 3, group: false},
    ];
    expect(exp).toEqual(obs);
    taxonomy[3].group = false;

    // nested groups
    taxonomy[0].group = true;
    taxonomy[2].group = true;
    obs = await renderTaxonomicView(taxonomy, 3);
    exp = [
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3, group: false},
        {id: 'a2;b1;c2', name: 'c2', parent: 'a2;b1', level: 3, group: false},
        {id: 'a1', name: 'a1', parent: null, level: 1, group: true},
    ];
    expect(exp).toEqual(obs);
    taxonomy[0].group = false;
    taxonomy[2].group = false;
});

test('renderTaxonomicView expansions', async () => {
    const taxonomy = [
        {id: 'a1', name: 'a1', parent: null, level: 1, expand: false},
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2, expand: false},
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2, expand: false},
        {id: 'a1;b2;c1', name: 'b2', parent: 'a1;b2', level: 3, expand: false},
        {id: 'a2', name: 'a2', parent: null, level: 1, expand: false},
        {id: 'a2;b1', name: 'b1', parent: 'a2', level: 2, expand: false},
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3, expand: false},
        {id: 'a2;b1;c2', name: 'c2', parent: 'a2;b1', level: 3, expand: false},
    ];

    // single expansion
    taxonomy[5].expand = true;
    let obs = await renderTaxonomicView(taxonomy, 2);
    let exp = [
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2, expand: false},
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2, expand: false},
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3, expand: false},
        {id: 'a2;b1;c2', name: 'c2', parent: 'a2;b1', level: 3, expand: false},
    ];
    expect(exp).toEqual(obs);
    taxonomy[5].expand = false;

    // two expansions
    taxonomy[2].expand = true;
    taxonomy[5].expand = true;
    obs = await renderTaxonomicView(taxonomy, 2);
    exp = [
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2, expand: false},
        {id: 'a1;b2;c1', name: 'b2', parent: 'a1;b2', level: 3, expand: false},
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3, expand: false},
        {id: 'a2;b1;c2', name: 'c2', parent: 'a2;b1', level: 3, expand: false},
    ];
    expect(exp).toEqual(obs);
    taxonomy[2].expand = false;
    taxonomy[5].expand = false;

    // ignored expansion
    taxonomy[2].expand = true;
    obs = await renderTaxonomicView(taxonomy, 1);
    exp = [
        {id: 'a1', name: 'a1', parent: null, level: 1, expand: false},
        {id: 'a2', name: 'a2', parent: null, level: 1, expand: false},
    ];
    expect(exp).toEqual(obs);
    taxonomy[2].expand = false;

    // impossible expansion
    taxonomy[1].expand = true;
    obs = await renderTaxonomicView(taxonomy, 2);
    exp = [
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2, expand: false},
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2, expand: false},
        {id: 'a2;b1', name: 'b1', parent: 'a2', level: 2, expand: false},
    ];
    expect(exp).toEqual(obs);
    taxonomy[2].expand = false;

    // nested expansions
    taxonomy[4].expand = true;
    taxonomy[5].expand = true;
    obs = await renderTaxonomicView(taxonomy, 1);
    exp = [
        {id: 'a1', name: 'a1', parent: null, level: 1, expand: false},
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3, expand: false},
        {id: 'a2;b1;c2', name: 'c2', parent: 'a2;b1', level: 3, expand: false},
    ];
    expect(exp).toEqual(obs);
    taxonomy[4].expand = false;
    taxonomy[5].expand = false;
});

test('renderTaxonomicView groups and expansions', async () => {
    const taxonomy = [
        {id: 'a1', name: 'a1', parent: null, level: 1, group: false,
         expand: false},
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2, group: false,
         expand: false},
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2, group: false,
         expand: false},
        {id: 'a1;b2;c1', name: 'b2', parent: 'a1;b2', level: 3, group: false,
         expand: false},
        {id: 'a2', name: 'a2', parent: null, level: 1, group: false,
         expand: false},
        {id: 'a2;b1', name: 'b1', parent: 'a2', level: 2, group: false,
         expand: false},
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3, group: false,
         expand: false},
        {id: 'a2;b1;c2', name: 'c2', parent: 'a2;b1', level: 3, group: false,
         expand: false},
   ];

    // group and expand
    taxonomy[0].group = true;
    taxonomy[5].expand = true;
    let obs = await renderTaxonomicView(taxonomy, 2);
    let exp = [
        {id: 'a1', name: 'a1', parent: null, level: 1, group: true,
         expand: false},
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3, group: false,
         expand: false},
        {id: 'a2;b1;c2', name: 'c2', parent: 'a2;b1', level: 3, group: false,
         expand: false},
    ];
    expect(exp).toEqual(obs);
    taxonomy[0].group = false;
    taxonomy[5].expand = false;

    // group overrides expand
    taxonomy[0].group = true;
    taxonomy[1].expand = true;
    obs = await renderTaxonomicView(taxonomy, 2);
    exp = [
        {id: 'a2;b1', name: 'b1', parent: 'a2', level: 2, group: false,
         expand: false},
        {id: 'a1', name: 'a1', parent: null, level: 1, group: true,
         expand: false},
    ];
    expect(exp).toEqual(obs);
    taxonomy[0].group = false;
    taxonomy[1].expand = false;

});
