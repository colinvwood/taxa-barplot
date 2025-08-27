import { Sample } from "./sample";
import { Colors } from "./colors";
import { Metadata } from "./metadata";

export class Plot {
    dims: PlotDimensions;
    dynamicAxis: boolean;
    filteredGray: boolean;

    constructor() {
        this.dims = {
            barWidth: 15,
            barPadding: 2,
            margin: 75,
            axisOffset: 10,
        };
        this.dynamicAxis = false;
        this.filteredGray = false;
    }

    getBarHeight(): number {
        const svgElem = document.querySelector("#barplot")!;
        const rect = svgElem.getBoundingClientRect();

        return rect.height - 2 * this.dims.margin;
    }

    getYAxisTickInterval(yAxisMax: number): number {
        let quotient = 0;
        let tickInterval = 0.1;
        while (Math.floor(1 / tickInterval) < 10) {
            tickInterval = tickInterval / 2;
        }

        return tickInterval;
    }

    /**
     *
     */
    async drawSamples(samples: Sample[], colors: Colors) {
        // clear <svg> content
        const svgElem = document.querySelector("#barplot")!;
        svgElem.innerHTML = "";

        // resize svg
        const width =
            2 * this.dims.margin + samples.length * this.dims.barWidth;
        svgElem.setAttribute("width", width.toString());

        // draw each sample
        const barHeight = this.getBarHeight();
        for (let [index, sample] of samples.entries()) {
            await new Promise((r) => setTimeout(r, 6));

            const x0 = this.dims.margin + index * this.dims.barWidth;
            const y0 = this.dims.margin;
            sample.draw(
                x0,
                y0,
                this.dims.barWidth - this.dims.barPadding,
                this.getBarHeight(),
                colors,
            );
        }

        this.drawYAxis(samples);
        // this.drawXAxis(samples, labels, metadata);
    }

    /**
     *
     */
    drawYAxis(samples: Sample[]) {
        const barHeight = this.getBarHeight();

        // draw axis
        this.drawSvgLine(
            this.dims.margin - this.dims.axisOffset,
            this.dims.margin - this.dims.axisOffset,
            this.dims.margin,
            this.dims.margin + barHeight,
            2,
        );

        // draw axis ticks
        const relAbunSums: number[] = samples.map((s) => s.getRelAbunSum());
        const maxRelAbunSum = Math.max(...relAbunSums);

        let tickInterval: number;
        if (this.dynamicAxis) {
            tickInterval = this.getYAxisTickInterval(maxRelAbunSum);
        } else {
            tickInterval = 0.1;
        }

        let numTicks = Math.floor(maxRelAbunSum / tickInterval);
        let yPosition;
        while (numTicks >= 0) {
            const tickValue = Number((numTicks * tickInterval).toFixed(3));
            yPosition = this.dims.margin + (barHeight - tickValue * barHeight);

            // tick
            this.drawSvgLine(
                this.dims.margin - this.dims.axisOffset,
                this.dims.margin - this.dims.axisOffset - 5,
                yPosition,
                yPosition,
                2,
            );

            // tick number
            this.drawSvgText(
                tickValue.toString(),
                this.dims.margin - this.dims.axisOffset - 10,
                yPosition,
                12,
                "end",
            );

            numTicks--;
        }
    }

    drawXAxis(samples: Sample[], labels: string[], metadata: Metadata) {}

    drawSvgLine(
        x1: number,
        x2: number,
        y1: number,
        y2: number,
        strokeWidth: number,
    ) {
        const svgElem = document.querySelector("#barplot")!;
        const svgNamespace = "http://www.w3.org/2000/svg";

        const line = document.createElementNS(svgNamespace, "line");

        line.setAttribute("x1", x1.toString());
        line.setAttribute("x2", x2.toString());
        line.setAttribute("y1", y1.toString());
        line.setAttribute("y2", y2.toString());
        line.setAttribute("stroke-width", strokeWidth.toString());
        line.setAttribute("stroke", "black");
        line.setAttribute("stroke-linecap", "round");

        svgElem.appendChild(line);
    }

    drawSvgText(
        content: string,
        x: number,
        y: number,
        fontSize: number,
        textAnchor: string = "start",
    ) {
        const svgElem = document.querySelector("#barplot")!;
        const svgNamespace = "http://www.w3.org/2000/svg";

        const text = document.createElementNS(svgNamespace, "text");

        text.innerHTML = content;
        text.setAttribute("x", x.toString());
        text.setAttribute("y", y.toString());
        text.setAttribute("font-size", fontSize.toString());
        text.setAttribute("text-anchor", textAnchor);
        text.setAttribute("dominant-baseline", "middle");

        svgElem.appendChild(text);
    }

    /**
     *
     */
    exportToFigure() {}
}

type PlotDimensions = {
    barWidth: number;
    barPadding: number;
    margin: number;
    axisOffset: number;
};
