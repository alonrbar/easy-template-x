import { OpenXmlPart } from "src/office/openXmlPart";
import { RelType } from "src/office/relationship";
import { xml, XmlGeneralNode, XmlNode } from "src/xml";
import { ChartType, chartTypes } from "./chartData";

export interface SeriesAccentColor {
    name: string;
    lumMod: string;
    lumOff: string;
}

interface ColorVariation {
    lumMod: string;
    lumOff: string;
}

export class ChartColors {

    public static async load(chartPart: OpenXmlPart): Promise<ChartColors> {
        const colors = new ChartColors(chartPart);
        await colors.init();
        return colors;
    }

    private accents: string[];
    private variations: ColorVariation[];

    private initialized = false;
    private readonly chartPart: OpenXmlPart;

    private constructor(chartPart: OpenXmlPart) {
        this.chartPart = chartPart;
    }

    public setSeriesColor(chartType: ChartType, seriesNode: XmlNode, isNewSeries: boolean, color: string | number) {
        if (!this.initialized) {
            throw new Error("Chart colors not initialized");
        }

        if (!seriesNode) {
            return;
        }

        let colorRoot: XmlNode;

        if (chartType === chartTypes.scatterChart) {
            // Controls the color of the marker - the dot in the scatter chart
            colorRoot = seriesNode.childNodes?.find(child => child.nodeName === "c:marker");
        } else {
            // Controls the color of the shape - line, bar, bubble, etc.
            colorRoot = seriesNode.childNodes?.find(child => child.nodeName === "c:spPr");
        }
        if (!colorRoot) {
            return;
        }

        this.recurseSetColor(colorRoot, isNewSeries, color);
    }

    private recurseSetColor(node: XmlNode, isNewSeries: boolean, color: string | number) {
        if (!node) {
            return;
        }

        // Was accent color (auto-selected color)
        if (node.nodeName == "a:schemeClr" && /accent\d+/.test(node.attributes?.["val"] ?? "")) {

            // New color is a number (auto-select color by accent index)
            // Only auto-select the color if it's a new series, otherwise keep the existing color
            if (typeof color === "number" && isNewSeries) {
                this.setAccentColor(node, color);
                return;
            }

            // New color is a string (apply the user-selected hex color)
            if (typeof color === "string") {
                node.nodeName = "a:srgbClr";
                node.attributes["val"] = color;
                node.childNodes = [];
                return;
            }

            return;
        }

        // Was srgb color (user-defined color)
        if (node.nodeName == "a:srgbClr") {
            if (typeof color === "string") {
                node.attributes["val"] = color;
            }
            return;
        }

        for (const child of (node.childNodes ?? [])) {
            this.recurseSetColor(child, isNewSeries, color);
        }
    }

    private setAccentColor(currentNode: XmlGeneralNode, seriesIndex: number) {
        const colorConfig = this.getAccentColorConfig(seriesIndex);

        currentNode.attributes["val"] = colorConfig.name;

        if (colorConfig.lumMod) {
            let lumModeNode = currentNode.childNodes?.find(child => child.nodeName === "a:lumMod") as XmlGeneralNode;
            if (!lumModeNode) {
                lumModeNode = xml.create.generalNode("a:lumMod", {
                    attributes: {}
                });
                xml.modify.appendChild(currentNode, lumModeNode);
            }
            lumModeNode.attributes["val"] = colorConfig.lumMod;
        } else {
            const lumModeNode = currentNode.childNodes?.find(child => child.nodeName === "a:lumMod");
            if (lumModeNode) {
                xml.modify.removeChild(currentNode, lumModeNode);
            }
        }

        if (colorConfig.lumOff) {
            let lumOffNode = currentNode.childNodes?.find(child => child.nodeName === "a:lumOff") as XmlGeneralNode;
            if (!lumOffNode) {
                lumOffNode = xml.create.generalNode("a:lumOff", {
                    attributes: {}
                });
                xml.modify.appendChild(currentNode, lumOffNode);
            }
            lumOffNode.attributes["val"] = colorConfig.lumOff;
        } else {
            const lumOffNode = currentNode.childNodes?.find(child => child.nodeName === "a:lumOff");
            if (lumOffNode) {
                xml.modify.removeChild(currentNode, lumOffNode);
            }
        }
    }

    private getAccentColorConfig(seriesIndex: number): SeriesAccentColor {

        const accent = this.accents[seriesIndex % this.accents.length];
        let variation: ColorVariation;
        if (seriesIndex < this.accents.length) {
            variation = null;
        } else {
            const variationIndex = Math.floor(seriesIndex / this.accents.length) % this.variations.length;
            variation = this.variations[variationIndex];
        }

        return {
            name: accent,
            lumMod: variation?.lumMod,
            lumOff: variation?.lumOff,
        };
    }

    private async init(): Promise<void> {
        if (this.initialized) {
            return;
        }

        const colorsPart = await this.chartPart.getFirstPartByType(RelType.ChartColors);
        if (!colorsPart) {
            this.initialized = true;
            return;
        }

        const root = await colorsPart.xmlRoot();
        const accents = root.childNodes?.
            filter(child => child.nodeName === "a:schemeClr")?.
            map((node: XmlGeneralNode) => node.attributes["val"]);

        const variations: ColorVariation[] = root.childNodes?.
            filter(child => child.nodeName === "cs:variation")?.
            map((node: XmlGeneralNode) => {
                if (!node.childNodes?.length) {
                    return null;
                }
                const lumModNode = node.childNodes.find(n => n.nodeName === "a:lumMod") as XmlGeneralNode;
                const lumOffNode = node.childNodes.find(n => n.nodeName === "a:lumOff") as XmlGeneralNode;
                return {
                    lumMod: lumModNode?.attributes["val"],
                    lumOff: lumOffNode?.attributes["val"],
                };
            }).
            filter(Boolean);

        this.accents = accents;
        this.variations = variations;
        this.initialized = true;
    }
}
