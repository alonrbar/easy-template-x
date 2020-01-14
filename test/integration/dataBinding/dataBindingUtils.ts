import { TemplateHandler, TemplateHandlerOptions } from "src";
import {
    DataBindingExtension,
    createDefaultDataBindingPlugins
} from "src/extensions/dataBindingExtension";

export function createHandler() {
    return new TemplateHandler(
        new TemplateHandlerOptions({
            extensions: [new DataBindingExtension(createDefaultDataBindingPlugins())]
        })
    );
}
