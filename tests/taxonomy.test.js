import { test, expect, vi } from 'vitest';

import {
    expandOrGroupTo, renderCurrentView, getTaxonById
} from '../src/util/taxonomy.js';

test('group with expandOrGroupTo', async () => {
    const props = {groupTo: 0, expandTo: 0, groupedTo: 0, expandedTo: 0};
    const taxonomy = [
        {id: 'a1', name: 'a1', parent: null, level: 1, ...props},
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2, ...props},
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2, ...props},
        {id: 'a1;b2;c1', name: 'b2', parent: 'a1;b2', level: 3, ...props},
        {id: 'a2', name: 'a2', parent: null, level: 1, ...props},
        {id: 'a2;b1', name: 'b1', parent: 'a2', level: 2, ...props},
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3, ...props},
        {id: 'a2;b1;c2', name: 'c2', parent: 'a2;b1', level: 3, ...props},
    ];

    // simple group
    let res = expandOrGroupTo(taxonomy, 'a1', 'group', 2);
    expect(res.diff).toEqual(true);

    let taxon = getTaxonById(res.taxonomy, 'a1');
    expect(taxon.groupTo).toEqual(2);

    let groupedTo = res.taxonomy.filter(t => t.groupedTo).map(t => t.id);
    expect(new Set(groupedTo)).toEqual( new Set(['a1;b1', 'a1;b2']) );

    let viewIds = renderCurrentView(res.taxonomy, 2).map(t => t.id);
    expect(new Set(viewIds)).toEqual( new Set(['a1', 'a2;b1']) );

    // undo group
    let groupedTaxonomy = res.taxonomy;
    res = expandOrGroupTo(groupedTaxonomy, 'a1', 'group', 0);
    expect(res.diff).toEqual(true);

    taxon = getTaxonById(res.taxonomy, 'a1');
    expect(taxon.groupTo).toEqual(0);

    groupedTo = res.taxonomy.filter(t => t.groupedTo).map(t => t.id);
    expect(groupedTo.length).toEqual(0);

    viewIds = renderCurrentView(res.taxonomy, 2).map(t => t.id);
    expect(new Set(viewIds)).toEqual( new Set(['a1;b1', 'a1;b2', 'a2;b1']) );

    // TODO: disallowed groupings
});

test('expand with expandOrGroupTo', () => {
    const props = {groupTo: 0, expandTo: 0, groupedTo: 0, expandedTo: 0};
    const taxonomy = [
        {id: 'a1', name: 'a1', parent: null, level: 1, ...props},
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2, ...props},
        {id: 'a1;b2', name: 'b2', parent: 'a1', level: 2, ...props},
        {id: 'a1;b2;c1', name: 'b2', parent: 'a1;b2', level: 3, ...props},
        {id: 'a2', name: 'a2', parent: null, level: 1, ...props},
        {id: 'a2;b1', name: 'b1', parent: 'a2', level: 2, ...props},
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3, ...props},
        {id: 'a2;b1;c2', name: 'c2', parent: 'a2;b1', level: 3, ...props},
    ];

    // simple expand
    let res = expandOrGroupTo(taxonomy, 'a1', 'expand', 2);
    expect(res.diff).toEqual(true);

    let taxon = getTaxonById(res.taxonomy, 'a1');
    expect(taxon.expandTo).toEqual(2);

    let groupedToSet = res.taxonomy.filter(t => t.expandedTo).map(t => t.id);
    expect(new Set(groupedToSet)).toEqual( new Set(['a1;b1', 'a1;b2']) );

    let viewIds = renderCurrentView(res.taxonomy, 1).map(t => t.id);
    expect(new Set(viewIds)).toEqual( new Set(['a1;b1', 'a1;b2', 'a2']) );

    // undo expand
    let expandedTaxonomy = res.taxonomy;
    res = expandOrGroupTo(expandedTaxonomy, 'a1', 'expand', 0);
    expect(res.diff).toEqual(true);

    taxon = getTaxonById(res.taxonomy, 'a1');
    expect(taxon.expandTo).toEqual(0);

    let groupedTo = res.taxonomy.filter(t => t.expandedTo).map(t => t.id);
    expect(groupedTo.length).toEqual(0);

    viewIds = renderCurrentView(res.taxonomy, 1).map(t => t.id);
    expect(new Set(viewIds)).toEqual( new Set(['a1', 'a2']) );

    // TODO: disallowed expansions
});
