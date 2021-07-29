import { ScopeDataResolver } from './compilation';
import { Delimiters } from './delimiters';
import { ExtensionOptions } from './extensions';
import { createDefaultPlugins, LOOP_CONTENT_TYPE, TemplatePlugin, TEXT_CONTENT_TYPE } from './plugins';

export class TemplateHandlerOptions {

    public plugins?: TemplatePlugin[] = createDefaultPlugins();

    /**
     * Determines the behavior in case of an empty input data. If set to true
     * the tag will be left untouched, if set to false the tag will be replaced
     * by an empty string.
     *
     * Default: false
     */
    public skipEmptyTags?= false;

    public defaultContentType?= TEXT_CONTENT_TYPE;

    public containerContentType?= LOOP_CONTENT_TYPE;

    public delimiters?: Partial<Delimiters> = new Delimiters();

    public maxXmlDepth?= 20;

    public extensions?: ExtensionOptions = {};

    public scopeDataResolver?: ScopeDataResolver;

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
