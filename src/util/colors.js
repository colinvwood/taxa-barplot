export const colorSchemes = {
    marine:  [
        '#d9ed92', '#b5e48c', '#99d98c', '#76c893', '#52b69a', '#34a0a4',
        '#168aad', '#1a759f', '#1e6091', '#184e77'
    ],
};

export function assignColors(renderedTable, colorScheme, customColors) {
    colorScheme = colorSchemes[colorScheme];

    // map of feature.id -> assigned color
    const featureToColor = new Map();

    // use first sample to cycle through colors
    let colorIndex = 0;
    for (let feature of renderedTable[0].features) {
        if (customColors.has(feature.id)) {
            feature.color = customColors.get(feature.id);
            featureToColor.set(feature.id, customColors.get(feature.id));
            continue;
        }

        if (colorIndex == colorScheme.length) {
            colorIndex = 0;
        }

        let color = colorScheme[colorIndex];
        feature.color = color;
        colorIndex++;

        featureToColor.set(feature.id, color);
    }

    // use map to assign features form rest of samples
    for (let i=1; i < renderedTable.length; i++) {
        let previousColor = null;
        for (let feature of renderedTable[i].features) {
            if (featureToColor.has(feature.id)) {
                feature.color = featureToColor.get(feature.id);
                previousColor = feature.color;
            } else if (customColors.has(feature.id)) {
                let color = customColors.get(feature.id);
                feature.color = color;
                previousColor = color;
                featureToColor.set(feature.id, color);
            } else {
                if (previousColor == null) {
                    // get random color
                    let color = getRandomColor(colorScheme);
                    feature.color = color;
                    previousColor = color;
                    featureToColor.set(feature.id, color);
                } else {
                    // get color as far away from previous color as possible
                    // to mitigate two taxa of same color touching
                    let previousColorIndex = colorScheme.indexOf(previousColor);
                    let newIndex = Math.floor(
                        previousColorIndex + colorScheme.length / 2
                    ) % colorScheme.length;
                    let color = colorScheme[newIndex];
                    feature.color = color;
                    previousColor = color;
                    featureToColor.set(feature.id, color);
                }
            }
        }
    }

    // TODO: also return featureToColor for legend?
    const coloredTable = renderedTable;
    return coloredTable;
}

function getRandomColor(colorScheme) {
    const index = Math.floor(Math.random() * colorScheme.length);
    return colorScheme[index];
}
