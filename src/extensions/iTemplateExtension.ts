import { TemplateContext } from '../compilation';

export interface ITemplateExtension {
    execute(context: TemplateContext): void | Promise<void>;
}