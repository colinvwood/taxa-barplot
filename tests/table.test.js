import { test, expect } from 'vitest';

import {
    calculateTaxonomyStats, renderTable, calcCumAbun
} from '../src/util/table.js';
import { renderCurrentView, expandOrGroupTo } from '../src/util/taxonomy.js';


test('caclulateTaxonomyStats', async () => {
    // some props omitted for brevity
    const taxonomy = [
        {id: 'a1', name: 'a1', parent: null, level: 1},
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2},
        {id: 'a1;b1;c1', name: 'c1', parent: 'a1;b1', level: 3},
        {id: 'a1;b1;c2', name: 'c2', parent: 'a1;b1', level: 3},
        {id: 'a2', name: 'a2', parent: null, level: 1},
        {id: 'a2;b1', name: 'b1', parent: 'a2', level: 2},
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3},
    ];
    const sample1 = {
        id: '1',
        features: new Map([
            ['a1;b1;c1', 0.2], ['a1;b1;c2', 0.5], ['a2;b1;c1', 0.3]
        ])
    };
    const sample2 = {
        id: '2',
        features: new Map([
            ['a1;b1;c2', 0.5], ['a2;b1;c1', 0.5]
        ])
    };
    const sample3 = {
        'id': '3',
        features: new Map([
            ['a1;b1;c1', 0.8], ['a1;b1;c2', 0.1], ['a2;b1;c1', 0.1]
        ])
    };
    const table = new Map([['1', sample1], ['2', sample2], ['3', sample3]]);

    let exp = [
        {id: 'a1', name: 'a1', parent: null, level: 1, prevalence: '1.000',
         averageAbundance: '0.700'},
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2, prevalence: '1.000',
         averageAbundance: '0.700'},
        {id: 'a1;b1;c1', name: 'c1', parent: 'a1;b1', level: 3,
         prevalence: '0.667', averageAbundance: '0.333'},
        {id: 'a1;b1;c2', name: 'c2', parent: 'a1;b1', level: 3,
         prevalence: '1.000', averageAbundance: '0.367'},
        {id: 'a2', name: 'a2', parent: null, level: 1, prevalence: '1.000',
         averageAbundance: '0.300'},
        {id: 'a2;b1', name: 'b1', parent: 'a2', level: 2, prevalence: '1.000',
         averageAbundance: '0.300'},
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3,
         prevalence: '1.000', averageAbundance: '0.300'},
    ];

    let obs = await calculateTaxonomyStats(taxonomy, table);
    expect(obs[0].prevalence).toEqual('1.000');
    expect(obs[0].averageAbundance).toEqual('0.700');

    expect(obs[5].prevalence).toEqual('1.000');
    expect(obs[5].averageAbundance).toEqual('0.300');
});

test('renderTable', async () => {
    const taxonomy = [
        {id: 'a1', name: 'a1', parent: null, level: 1},
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2},
        {id: 'a1;b1;c1', name: 'c1', parent: 'a1;b1', level: 3},
        {id: 'a1;b1;c2', name: 'c2', parent: 'a1;b1', level: 3},
        {id: 'a2', name: 'a2', parent: null, level: 1},
        {id: 'a2;b1', name: 'b1', parent: 'a2', level: 2},
        {id: 'a2;b1;c1', name: 'c1', parent: 'a2;b1', level: 3},
    ];
    const sample1 = {
        id: '1',
        features: new Map([
            ['a1;b1;c1', 0.2], ['a1;b1;c2', 0.5], ['a2;b1;c1', 0.3]
        ])
    };
    const sample2 = {
        id: '2',
        features: new Map([
            ['a1;b1;c2', 0.5], ['a2;b1;c1', 0.5]
        ])
    };
    const sample3 = {
        'id': '3',
        features: new Map([
            ['a1;b1;c1', 0.8], ['a1;b1;c2', 0.1], ['a2;b1;c1', 0.1]
        ])
    };
    const table = new Map([['1', sample1], ['2', sample2], ['3', sample3]]);

    let taxonomyView = renderCurrentView(taxonomy, 2);
    let obs = await renderTable(table, taxonomy, taxonomyView);
    expect(obs.tableView[0]).toEqual({
        id: '1',
        features: [
            {id: 'a1;b1', name: 'b1', level: 2, abundance: 0.7},
            {id: 'a2;b1', name: 'b1', level: 2, abundance: 0.3},
        ]
    });

    // filter
    taxonomy[1].filter = true;
    taxonomyView = renderCurrentView(taxonomy, 2);
    obs = await renderTable(table, taxonomy, taxonomyView);
    expect(obs.tableView[0]).toEqual({
        id: '1',
        features: [
            {id: 'a2;b1', name: 'b1', level: 2, abundance: 0.3},
        ]
    });
    delete taxonomy[1].filter;

    // grouping
    let grouped = await expandOrGroupTo(
        structuredClone(taxonomy), 'a1', 'group', 3
    );
    taxonomyView = renderCurrentView(grouped.taxonomy, 3);
    obs = await renderTable(table, taxonomy, taxonomyView);
    expect( new Set(obs.tableView[2].features) ).toEqual( new Set([
            {id: 'a1', name: 'a1', level: 1, abundance: 0.9},
            {id: 'a2;b1;c1', name: 'c1', level: 3, abundance: 0.1}
    ]) );


    // expanding
    let expanded = await expandOrGroupTo(
        structuredClone(taxonomy), 'a1;b1', 'expand', 3
    );
    taxonomyView = renderCurrentView(expanded.taxonomy, 2);
    obs = await renderTable(table, taxonomy, taxonomyView);
    expect( new Set(obs.tableView[0].features) ).toEqual( new Set([
        {id: 'a1;b1;c1', name: 'c1', level: 3, abundance: 0.2},
        {id: 'a1;b1;c2', name: 'c2', level: 3, abundance: 0.5},
        {id: 'a2;b1', name: 'b1', level: 2, abundance: 0.3},
    ]) );
});

test('calcCumAbun', async () => {
    let sample = {
        id: '1',
        features: [
            {id: 'a1', level: 1, viewLevel: 1, abundance: 0.25},
            {id: 'a2', level: 1, viewLevel: 1, abundance: 0.1},
            {id: 'a3', level: 1, viewLevel: 1, abundance: 0.15},
            {id: 'a4', level: 1, viewLevel: 1, abundance: 0.5},
        ]
    };

    await calcCumAbun(sample);
    let exp = {
        id: '1',
        features: [
            {id: 'a1', level: 1, viewLevel: 1, abundance: 0.25, cumAbun: 0.25},
            {id: 'a2', level: 1, viewLevel: 1, abundance: 0.1, cumAbun: 0.35},
            {id: 'a3', level: 1, viewLevel: 1, abundance: 0.15, cumAbun: 0.5},
            {id: 'a4', level: 1, viewLevel: 1, abundance: 0.5, cumAbun: 1},
        ]
    };
    expect(sample).toEqual(exp);
});
