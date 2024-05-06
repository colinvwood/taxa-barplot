import { test, expect } from 'vitest';
import { parseTaxonomy, parseFeatureTable, mergeMetadata } from './src/util/parse.js';

test('parse taxonomy', async () => {
    const mockedReadFunc = async (taxonomyFile) => {
        return [
            {'Feature ID': '1', Taxon: 'a__1;b__3;c__4', Confidence: '0.9'},
            {'Feature ID': '2', Taxon: 'a__1;b__3;c__5', Confidence: '0.9'},
            {'Feature ID': '3', Taxon: 'a__2;b__3;c__6', Confidence: '0.9'},
        ];
    };

    const exp = [
        {id: 'a__1', name: 'a__1', parent: null, level: 1, viewLevel: 1},
        {id: 'a__1;b__3', name: 'b__3', parent: 'a__1', level: 2, viewLevel: 2},
        {id: 'a__1;b__3;c__4', name: 'c__4', parent: 'a__1;b__3', level: 3,
         viewLevel: 3},
        {id: 'a__1;b__3;c__5', name: 'c__5', parent: 'a__1;b__3', level: 3,
         viewLevel: 3},
        {id: 'a__2', name: 'a__2', parent: null, level: 1, viewLevel: 1},
        {id: 'a__2;b__3', name: 'b__3', parent: 'a__2', level: 2, viewLevel: 2},
        {id: 'a__2;b__3;c__6', name: 'c__6', parent: 'a__2;b__3', level: 3,
         viewLevel: 3},
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
