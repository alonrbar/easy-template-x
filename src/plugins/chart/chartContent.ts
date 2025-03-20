import { PluginContent } from "src/plugins/pluginContent";
import { ChartData } from "./chartData";

export interface ChartContent extends PluginContent, ChartData {
    _type: 'chart';
    title?: string;
}
