import {
    DataBindingBooleanPlugin,
    DataBindingDatePlugin,
    DataBindingTextPlugin
} from ".";
import { ITemplatePlugin } from "src/extensions/ITemplatePlugin";

export function createDefaultDataBindingPlugins(): ITemplatePlugin[] {
    return [
        new DataBindingBooleanPlugin(),
        new DataBindingDatePlugin(),
        new DataBindingTextPlugin()
    ];
}
