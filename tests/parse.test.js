import { test, expect } from 'vitest';
import {
    parseTaxonomy, parseFeatureTable, mergeMetadata
} from './src/util/parse.js';


test('parse taxonomy', async () => {
    const mockedReadFunc = async (taxonomyFile) => {
        return [
            {'Feature ID': '1', Taxon: 'a1;b1;c1', Confidence: '0.9'},
            {'Feature ID': '2', Taxon: 'a1;b1;c2', Confidence: '0.9'},
            {'Feature ID': '3', Taxon: 'a2;b2;c3', Confidence: '0.9'},
        ];
    };

    const exp = [
        {id: 'a1', name: 'a1', parent: null, level: 1, group: false,
         expand: false},
        {id: 'a1;b1', name: 'b1', parent: 'a1', level: 2, group: false,
         expand: false},
        {id: 'a1;b1;c1', name: 'c1', parent: 'a1;b1', level: 3, group: false,
         expand: false},
        {id: 'a1;b1;c2', name: 'c2', parent: 'a1;b1', level: 3, group: false,
         expand: false},
        {id: 'a2', name: 'a2', parent: null, level: 1, group: false,
         expand: false},
        {id: 'a2;b2', name: 'b2', parent: 'a2', level: 2, group: false,
         expand: false},
        {id: 'a2;b2;c3', name: 'c3', parent: 'a2;b2', level: 3, group: false,
         expand: false},
    ];

    const obs = await parseTaxonomy('taxonomy.tsv', mockedReadFunc);

    expect(exp).toEqual(obs);
});


test('parse feature table', async () => {
    const mockedReadFunc = async (tableFile) => {
        return [
            {'id': '1', 'a': '0', 'b': '2', 'c': '3'},
            {'id': '2', 'a': '7', 'b': '4', 'c': '100'},
            {'id': '3', 'a': '0', 'b': '0', 'c': '0'},
        ];
    };

    const exp = [
        {'id': '1', 'features': {'a': 0, 'b': 2, 'c': 3}},
        {'id': '2', 'features': {'a': 7, 'b': 4, 'c': 100}},
        {'id': '3', 'features': {'a': 0, 'b': 0, 'c': 0}},
    ];

    const obs = await parseFeatureTable('table.csv', 'id', mockedReadFunc);

    expect(exp).toEqual(obs);
});

test('merge metadata', () => {
    const table = [
        {'id': '1', 'features': {'a': 0, 'b': 2, 'c': 3}},
        {'id': '2', 'features': {'a': 7, 'b': 4, 'c': 100}},
        {'id': '3', 'features': {'a': 0, 'b': 0, 'c': 0}},
    ];
    const metadata = [
        {'id': '1', 'week': 1, 'age': 20},
        {'id': '2', 'week': 2, 'age': 40},
        {'id': '3', 'week': 3, 'age': ''},
    ];
    const exp = [
        {
            'id': '1',
            'features': {'a': 0, 'b': 2, 'c': 3},
            'week': 1,
            'age': 20
        },
        {
            'id': '2',
            'features': {'a': 7, 'b': 4, 'c': 100},
            'week': 2,
            'age': 40
        },
        {
            'id': '3',
            'features': {'a': 0, 'b': 0, 'c': 0},
            'week': 3,
            'age': ''
        },
    ];

    const obs = mergeMetadata(table, metadata);

    expect(exp).toEqual(obs);
});
