import { Delimiters } from './delimiters';
import { TemplatePlugin } from './plugins';
export declare class TemplateHandlerOptions {
    plugins?: TemplatePlugin[];
    defaultContentType?: string;
    containerContentType?: string;
    delimiters?: Partial<Delimiters>;
    maxXmlDepth?: number;
    constructor(initial?: Partial<TemplateHandlerOptions>);
}
