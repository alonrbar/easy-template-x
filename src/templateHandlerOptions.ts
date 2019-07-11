import { Delimiters } from './delimiters';
import { createDefaultPlugins, LOOP_TAG_TYPE, TemplatePlugin, TEXT_TAG_TYPE } from './plugins';

export class TemplateHandlerOptions {

    public plugins?: TemplatePlugin[] = createDefaultPlugins();

    public defaultPlugin = TEXT_TAG_TYPE;

    public containerPlugin = LOOP_TAG_TYPE;

    public delimiters?= new Delimiters();

    public maxXmlDepth? = 20;

    constructor(initial?: Partial<TemplateHandlerOptions>) {
        Object.assign(this, initial);

        if (initial) {
            this.delimiters = new Delimiters(initial.delimiters);
        }

        if (!this.plugins.length) {
            throw new Error('Plugins list can not be empty');
        }
    }
}