import { test, expect } from 'vitest';
import {
    getTaxaAtLevel, getTaxaAboveLevel, getTaxaBeneathLevel, getParent,
    getSiblings, getChildren, getDescendants, getAncestors, sortTaxaByLevel,
    subsetTaxonomy, renderTaxonomy
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
    expect(obs).toEqual(exp);

    obs = getTaxaAtLevel(taxonomy, 3);
    exp = [
        {id: 'a2;b2;c1', name: 'c1', parent: 'a2;b2', level: 3},
    ];
    expect(obs).toEqual(exp);

    obs = getTaxaAtLevel(taxonomy, 4);
    exp = [];
    expect(obs).toEqual(exp);

    obs = getTaxaAtLevel(taxonomy, 0);
    exp = [];
    expect(obs).toEqual(exp);
});

test('getTaxaAboveLevel', () => {
    let obs = getTaxaAboveLevel(taxonomy, 2);
    let exp = [
        {id: 'a1', name: 'a1', parent: null, level: 1},
        {id: 'a2', name: 'a2', parent: null, level: 1},
    ];
    expect(obs).toEqual(exp);

    obs = getTaxaAboveLevel(taxonomy, 3);
    exp = [
        {id: 'a1', name: 'a1', parent: null, level: 1},
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2},
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2},
        {id: 'a2', name: 'a2', parent: null, level: 1},
        {id: 'a2;b2', name: 'b2', parent: 'a2', level: 2},
    ];
    expect(obs).toEqual(exp);

    obs = getTaxaAboveLevel(taxonomy, 4);
    expect(obs).toEqual(taxonomy);
    obs = getTaxaAboveLevel(taxonomy, 100);
    expect(obs).toEqual(taxonomy);

    obs = getTaxaAboveLevel(taxonomy, 0);
    exp = [];
    expect(obs).toEqual(exp);
});

test('getTaxaBeneathLevel', () => {
    let obs = getTaxaBeneathLevel(taxonomy, 1);
    let exp = [
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2},
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2},
        {id: 'a2;b2', name: 'b2', parent: 'a2', level: 2},
        {id: 'a2;b2;c1', name: 'c1', parent: 'a2;b2', level: 3},
    ];
    expect(obs).toEqual(exp);

    obs = getTaxaBeneathLevel(taxonomy, 2);
    exp = [
        {id: 'a2;b2;c1', name: 'c1', parent: 'a2;b2', level: 3},
    ];
    expect(obs).toEqual(exp);

    obs = getTaxaBeneathLevel(taxonomy, 3);
    exp = [];
    expect(obs).toEqual(exp);

    obs = getTaxaBeneathLevel(taxonomy, 100);
    exp = [];
    expect(obs).toEqual(exp);

    obs = getTaxaBeneathLevel(taxonomy, 0);
    expect(obs).toEqual(taxonomy);
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

test('getDescendants', () => {
    let taxon = taxonomy[0];
    let exp = [taxonomy[1], taxonomy[2]];
    let obs = getDescendants(taxonomy, taxon);
    expect(obs).toEqual(exp);

    taxon = taxonomy[3];
    exp = [taxonomy[4], taxonomy[5]];
    obs = getDescendants(taxonomy, taxon);
    expect(obs).toEqual(exp);

    taxon = taxonomy[5];
    exp = [];
    obs = getDescendants(taxonomy, taxon);
    expect(obs).toEqual(exp);
});

test('getAncestors', () => {
    let taxon = taxonomy[5];
    let exp = [taxonomy[3], taxonomy[4]];
    let obs = getAncestors(taxonomy, taxon);
    expect(obs).toEqual(exp);

    taxon = taxonomy[1];
    exp = [taxonomy[0]];
    obs = getAncestors(taxonomy, taxon);
    expect(obs).toEqual(exp);

    taxon = taxonomy[0];
    exp = [];
    obs = getAncestors(taxonomy, taxon);
    expect(obs).toEqual(exp);
});

test('sortTaxaByLevel', () => {
    let exp = [
        taxonomy[0], taxonomy[3], taxonomy[1], taxonomy[2], taxonomy[4],
        taxonomy[5]
    ];
    let obs = sortTaxaByLevel(taxonomy);
    expect(obs).toEqual(exp);

    exp = [
        taxonomy[5], taxonomy[1], taxonomy[2], taxonomy[4], taxonomy[0],
        taxonomy[3]
    ];
    obs = sortTaxaByLevel(taxonomy, true, true);
    expect(obs).toEqual(exp);
});

test('subsetTaxonomy', () => {
    const taxonomy = [
        {id: 'a1', name: 'a1', parent: null, level: 1},
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2},
        {id: 'a2', name: 'a2', parent: null, level: 1},
    ];

    let exp = [taxonomy[0], taxonomy[1]];
    let removeTaxa = [
        {id: 'a2', name: 'a2', parent: null, level: 1},
    ];
    let obs = subsetTaxonomy(taxonomy, removeTaxa);
    expect(obs).toEqual(exp);

    removeTaxa = [];
    obs = subsetTaxonomy(taxonomy, removeTaxa);
    expect(obs).toEqual(taxonomy);
});

test('renderTaxonomy filters', async () => {
    const taxonomy = [
        {id: 'a1', name: 'a1', parent: null, level: 1, viewLevel: 1,
         filter: false},
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2, viewLevel: 2,
         filter: false},
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2, viewLevel: 2,
         filter: false},
        {id: 'a2', name: 'a2', parent: null, level: 1, viewLevel: 1,
         filter: false},
        {id: 'a2;b2', name: 'b2', parent: 'a2', level: 2, viewLevel: 2,
         filter: false},
        {id: 'a2;b2;c1', name: 'c1', parent: 'a2;b2', level: 3, viewLevel: 3,
         filter: false},
    ];

    let exp = [
        {id: 'a1', name: 'a1', parent: null, level: 1, viewLevel: -1,
         filter: true},
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2, viewLevel: -1,
         filter: false},
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2, viewLevel: -1,
         filter: false},
        {id: 'a2', name: 'a2', parent: null, level: 1, viewLevel: 1,
         filter: false},
        {id: 'a2;b2', name: 'b2', parent: 'a2', level: 2, viewLevel: 2,
         filter: false},
        {id: 'a2;b2;c1', name: 'c1', parent: 'a2;b2', level: 3, viewLevel: 3,
         filter: false},
    ];

    // stop

    taxonomy[0].filter = true;
    let obs = await renderTaxonomy(structuredClone(taxonomy));
    expect(new Set(obs)).toEqual(new Set(exp));
    taxonomy[0].filter = false;

    exp = [
        ...taxonomy.slice(0, 5),
        {id: 'a2;b2;c1', name: 'c1', parent: 'a2;b2', level: 3, viewLevel: -1,
         filter: true},
    ]
    taxonomy[5].filter = true;
    obs = await renderTaxonomy(structuredClone(taxonomy));
    expect(new Set(obs)).toEqual(new Set(exp));

});

test('renderTaxonomy groups', async () => {
    const taxonomy = [
        {id: 'a1', name: 'a1', parent: null, level: 1, viewLevel: 1,
         group: false},
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2, viewLevel: 2,
         group: false},
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2, viewLevel: 2,
         group: false},
        {id: 'a1;b2;c1', name: 'b2', parent: 'a1;b2', level: 3, viewLevel: 3,
         group: false},
        {id: 'a2', name: 'a2', parent: null, level: 1, viewLevel: 1,
         group: false},
        {id: 'a2;b1', name: 'b1', parent: 'a2', level: 2, viewLevel: 2,
         group: false},
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3, viewLevel: 3,
         group: false},
        {id: 'a2;b1;c2', name: 'c2', parent: 'a2;b1', level: 3, viewLevel: 3,
         group: false},
    ];

    // single group
    taxonomy[5].group = true;
    let obs = await renderTaxonomy(structuredClone(taxonomy), 3);
    let exp = [
        ...taxonomy.slice(0, 5),
        {id: 'a2;b1', name: 'b1', parent: 'a2', level: 2, viewLevel: 3,
         group: true},
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3, viewLevel: 0,
         group: false},
        {id: 'a2;b1;c2', name: 'c2', parent: 'a2;b1', level: 3, viewLevel: 0,
         group: false},
    ];
    expect(new Set(obs)).toEqual(new Set(exp));
    taxonomy[5].group = false;

    // two groups
    taxonomy[0].group = true;
    taxonomy[4].group = true;
    obs = await renderTaxonomy(structuredClone(taxonomy), 3);
    exp = [
        {id: 'a1', name: 'a1', parent: null, level: 1, viewLevel: 3,
         group: true},
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2, viewLevel: 0,
         group: false},
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2, viewLevel: 0,
         group: false},
        {id: 'a1;b2;c1', name: 'b2', parent: 'a1;b2', level: 3, viewLevel: 0,
         group: false},
        {id: 'a2', name: 'a2', parent: null, level: 1, viewLevel: 3,
         group: true},
        {id: 'a2;b1', name: 'b1', parent: 'a2', level: 2, viewLevel: 0,
         group: false},
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3, viewLevel: 0,
         group: false},
        {id: 'a2;b1;c2', name: 'c2', parent: 'a2;b1', level: 3, viewLevel: 0,
         group: false},
    ];
    expect(new Set(obs)).toEqual(new Set(exp));
    taxonomy[0].group = false;
    taxonomy[4].group = false;

    // ignored group
    taxonomy[1].group = true;
    obs = await renderTaxonomy(structuredClone(taxonomy), 1);
    exp = [
        taxonomy[0],
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2, viewLevel: 2,
         group: true},
        ...taxonomy.slice(2, 9),
    ];
    expect(new Set(obs)).toEqual(new Set(exp));
    taxonomy[1].group = false;

    // leaf group
    taxonomy[3].group = true;
    obs = await renderTaxonomy(structuredClone(taxonomy), 3);
    exp = [
        ...taxonomy.slice(0, 3),
        {id: 'a1;b2;c1', name: 'b2', parent: 'a1;b2', level: 3, viewLevel: 3,
         group: true},
        ...taxonomy.slice(4,9),
    ];
    expect(new Set(obs)).toEqual(new Set(exp));
    taxonomy[3].group = false;

    // nested groups
    taxonomy[0].group = true;
    taxonomy[2].group = true;
    obs = await renderTaxonomy(structuredClone(taxonomy), 3);
    exp = [
        {id: 'a1', name: 'a1', parent: null, level: 1, viewLevel: 3,
         group: true},
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2, viewLevel: 0,
         group: false},
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2, viewLevel: 0,
         group: true},
        {id: 'a1;b2;c1', name: 'b2', parent: 'a1;b2', level: 3, viewLevel: 0,
         group: false},
        ...taxonomy.slice(4, 9),
    ];
    expect(new Set(obs)).toEqual(new Set(exp));
    taxonomy[0].group = false;
    taxonomy[2].group = false;
});

test('renderTaxonomy expansions', async () => {
    const taxonomy = [
        {id: 'a1', name: 'a1', parent: null, level: 1, viewLevel: 1,
         expand: false},
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2, viewLevel: 2,
         expand: false},
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2, viewLevel: 2,
         expand: false},
        {id: 'a1;b2;c1', name: 'b2', parent: 'a1;b2', level: 3, viewLevel: 3,
         expand: false},
        {id: 'a2', name: 'a2', parent: null, level: 1, viewLevel: 1,
         expand: false},
        {id: 'a2;b1', name: 'b1', parent: 'a2', level: 2, viewLevel: 2,
         expand: false},
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3, viewLevel: 3,
         expand: false},
        {id: 'a2;b1;c2', name: 'c2', parent: 'a2;b1', level: 3, viewLevel: 3,
         expand: false},
    ];

    // single expansion
    taxonomy[5].expand = true;
    let obs = await renderTaxonomy(structuredClone(taxonomy), 2);
    let exp = [
        ...taxonomy.slice(0, 5),
        {id: 'a2;b1', name: 'b1', parent: 'a2', level: 2, viewLevel: 0,
         expand: true},
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3, viewLevel: 2,
         expand: false},
        {id: 'a2;b1;c2', name: 'c2', parent: 'a2;b1', level: 3, viewLevel: 2,
         expand: false},
    ];
    expect(new Set(obs)).toEqual(new Set(exp));
    taxonomy[5].expand = false;

    // two expansions
    taxonomy[2].expand = true;
    taxonomy[5].expand = true;
    obs = await renderTaxonomy(structuredClone(taxonomy), 2);
    exp = [
        ...taxonomy.slice(0, 2),
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2, viewLevel: 0,
         expand: true},
        {id: 'a1;b2;c1', name: 'b2', parent: 'a1;b2', level: 3, viewLevel: 2,
         expand: false},
        {id: 'a2', name: 'a2', parent: null, level: 1, viewLevel: 1,
         expand: false},
        {id: 'a2;b1', name: 'b1', parent: 'a2', level: 2, viewLevel: 0,
         expand: true},
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3, viewLevel: 2,
         expand: false},
        {id: 'a2;b1;c2', name: 'c2', parent: 'a2;b1', level: 3, viewLevel: 2,
         expand: false},
    ];
    expect(new Set(obs)).toEqual(new Set(exp));
    taxonomy[2].expand = false;
    taxonomy[5].expand = false;

    // ignored expansion
    taxonomy[2].expand = true;
    obs = await renderTaxonomy(structuredClone(taxonomy), 1);
    exp = [
        ...taxonomy.slice(0, 2),
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2, viewLevel: 2,
         expand: true},
        ...taxonomy.slice(3, 9),
    ];
    expect(new Set(obs)).toEqual(new Set(exp));
    taxonomy[2].expand = false;

    // leaf expansion
    taxonomy[1].expand = true;
    obs = await renderTaxonomy(structuredClone(taxonomy), 2);
    exp = [
        taxonomy[0],
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2, viewLevel: 2,
         expand: true},
        ...taxonomy.slice(2, 9),
    ];
    expect(new Set(obs)).toEqual(new Set(exp));
    taxonomy[2].expand = false;

    // nested expansions
    taxonomy[4].expand = true;
    taxonomy[5].expand = true;
    obs = await renderTaxonomy(structuredClone(taxonomy), 1);
    exp = [
        ...taxonomy.slice(0, 4),
        {id: 'a2', name: 'a2', parent: null, level: 1, viewLevel: 0,
         expand: true},
        {id: 'a2;b1', name: 'b1', parent: 'a2', level: 2, viewLevel: 0,
         expand: true},
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3, viewLevel: 1,
         expand: false},
        {id: 'a2;b1;c2', name: 'c2', parent: 'a2;b1', level: 3, viewLevel: 1,
         expand: false},
    ];
    expect(new Set(obs)).toEqual(new Set(exp));
    taxonomy[4].expand = false;
    taxonomy[5].expand = false;
});

test('renderTaxonomy combinations', async () => {
    const props = {filter: false, group: false, expand: false}
    const taxonomy = [
        {id: 'a1', name: 'a1', parent: null, level: 1, viewLevel: 1,
         ...props},
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2, viewLevel: 2,
         ...props},
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2, viewLevel: 2,
         ...props},
        {id: 'a1;b2;c1', name: 'b2', parent: 'a1;b2', level: 3, viewLevel: 3,
         ...props},
        {id: 'a2', name: 'a2', parent: null, level: 1, viewLevel: 1,
         ...props},
        {id: 'a2;b1', name: 'b1', parent: 'a2', level: 2, viewLevel: 2,
         ...props},
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3, viewLevel: 3,
         ...props},
        {id: 'a2;b1;c2', name: 'c2', parent: 'a2;b1', level: 3, viewLevel: 3,
         ...props},
    ];

    // group and expand
    taxonomy[0].group = true;
    taxonomy[5].expand = true;
    let obs = await renderTaxonomy(structuredClone(taxonomy), 2);
    let exp = [
        {id: 'a1', name: 'a1', parent: null, level: 1, viewLevel: 2,
         filter: false, group: true, expand: false},
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2, viewLevel: 0,
         ...props},
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2, viewLevel: 0,
         ...props},
        {id: 'a1;b2;c1', name: 'b2', parent: 'a1;b2', level: 3, viewLevel: 0,
         ...props},
        {id: 'a2', name: 'a2', parent: null, level: 1, viewLevel: 1,
         ...props},
        {id: 'a2;b1', name: 'b1', parent: 'a2', level: 2, viewLevel: 0,
         filter: false, group: false, expand: true},
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3, viewLevel: 2,
         ...props},
        {id: 'a2;b1;c2', name: 'c2', parent: 'a2;b1', level: 3, viewLevel: 2,
         ...props},
    ];
    expect(new Set(obs)).toEqual(new Set(exp));
    taxonomy[0].group = false;
    taxonomy[5].expand = false;

    // group overrides expand
    taxonomy[0].group = true;
    taxonomy[1].expand = true;
    obs = await renderTaxonomy(structuredClone(taxonomy), 2);
    exp = [
        {id: 'a1', name: 'a1', parent: null, level: 1, viewLevel: 2,
         filter: false, group: true, expand: false},
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2, viewLevel: 0,
         filter: false, group: false, expand: true},
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2, viewLevel: 0,
         ...props},
        {id: 'a1;b2;c1', name: 'b2', parent: 'a1;b2', level: 3, viewLevel: 0,
         ...props},
        ...taxonomy.slice(4, 9),
    ];
    expect(new Set(obs)).toEqual(new Set(exp));
    taxonomy[0].group = false;
    taxonomy[1].expand = false;

    // TODO: filter overrides group & expand
});
