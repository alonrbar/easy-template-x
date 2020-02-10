import { Delimiters } from './delimiters';
import { TemplatePlugin } from './plugins';
import { ExtensionOptions } from './extensions';
export declare class TemplateHandlerOptions {
    plugins?: TemplatePlugin[];
    defaultContentType?: string;
    containerContentType?: string;
    delimiters?: Partial<Delimiters>;
    maxXmlDepth?: number;
    extensions?: ExtensionOptions;
    constructor(initial?: Partial<TemplateHandlerOptions>);
}
