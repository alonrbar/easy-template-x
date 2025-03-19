import { PluginContent } from "src/plugins/pluginContent";
import { ChartData } from "./updateChart";

export interface ChartContent extends PluginContent, ChartData {
    _type: 'chart';
}
