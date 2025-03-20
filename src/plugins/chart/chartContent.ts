import { PluginContent } from "src/plugins/pluginContent";
import { ChartData } from "./chartData";

export type ChartContent = ChartPluginContent & ChartData;

interface ChartPluginContent extends PluginContent {
    _type: 'chart';
    title?: string;
}
