const colorSchemes = {
    marine:  [
        '#d9ed92', '#b5e48c', '#99d98c', '#76c893', '#52b69a', '#34a0a4', '#168aad',
        '#1a759f', '#1e6091', '#184e77'
    ],
};

export function assignColors(renderedTable, colorScheme) {
    colorScheme = colorSchemes[colorScheme];

    // map of feature.id -> assigned color
    const featureToColor = new Map();

    // use first sample to cycle through colors
    let colorIndex = 0;
    for (let feature of renderedTable[0].features) {
        if (colorIndex == colorScheme.length) {
            colorIndex = 0;
        }

        feature.color = colorScheme[colorIndex];
        colorIndex++;

        featureToColor.set(feature.id, colorScheme[colorIndex]);
    }

    // use map to assign features form rest of samples
    for (let i=1; i < renderedTable.length; i++) {
        let previousColor = null;
        for (let feature of renderedTable[i].features) {
            if (featureToColor.has(feature.id)) {
                feature.color = featureToColor.get(feature.id);
                previousColor = feature.color;
            } else {
                if (previousColor == null) {
                    // get random color
                    let color = getRandomColor(colorScheme);
                    feature.color = color;
                    featureToColor.set(feature.id, color);
                } else {
                    // get color as far away from previous color as possible
                    // to mitigate two taxa of same color touching
                    let previousColorIndex = colorScheme.indexOf(previousColor);
                    let newIndex =
                        ((previousColorIndex + colorScheme.length) / 2) %
                        colorScheme.length;
                    feature.color = colorScheme[newIndex];
                    featureToColor.set(feature.id, colorScheme[newIndex]);
                }
            }
        }
    }

    // TODO: also return featureToColor for legend?
    return renderedTable;
}


function getRandomColor(colorScheme) {
    const index = Math.floor(Math.random() * colorScheme.length);
    return colorScheme[index];
}
