import { Delimiters } from './delimiters';
import { createDefaultPlugins, TemplatePlugin } from './plugins';

// tslint:disable:whitespace
export class TemplateHandlerOptions {

    public plugins?: TemplatePlugin[] = createDefaultPlugins();

    public delimiters?= new Delimiters();

    public maxXmlDepth = 20;

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
// tslint:enable