import { Sample } from "./sample";
import { Colors } from "./colors";

export class Plot {
    dimensions: PlotDimensions;

    constructor() {
        this.dimensions = { width: 0, height: 0 };
    }

    /**
     *
     */
    setDimensions(width: number, height: number) {
        this.dimensions.width = width;
        this.dimensions.height = height;
    }

    /**
     *
     */
    async drawSamples(samples: Sample[], colors: Colors) {
        // clear <svg> content
        const svgElem = document.querySelector(".barplot")!;
        svgElem.innerHTML = "";

        // draw each sample
        const barWidth = this.dimensions.width / samples.length;
        const barHeight = this.dimensions.height;
        const barPadding = 2;

        for (let [index, sample] of samples.entries()) {
            await new Promise((r) => setTimeout(r, 10));

            const x0 = index * barWidth;
            const y0 = 0;
            sample.draw(x0, y0, barWidth - barPadding, barHeight, colors);
        }
    }

    /**
     *
     */
    drawAxes() {}

    /**
     *
     */
    exportToFigure() {}
}

type PlotDimensions = {
    height: number;
    width: number;
};
