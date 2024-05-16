import { test, expect } from 'vitest';

import { calculateTaxonomyStats } from '../src/util/stats.js';


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
    const table = [
        {
            id: '1',
            features: {'a1;b1;c1': 0.2, 'a1;b1;c2': 0.5, 'a2;b1;c1': 0.3},
        },
        {
            id: '2',
            features: {'a1;b1;c1': 0, 'a1;b1;c2': 0.5, 'a2;b1;c1': 0.5},
        },
        {
            'id': '3',
            features: {'a1;b1;c1': 0.8, 'a1;b1;c2': 0.1, 'a2;b1;c1': 0.1},
        },
    ];

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
    expect(obs).toEqual(exp);
});
