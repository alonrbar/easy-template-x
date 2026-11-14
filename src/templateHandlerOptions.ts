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
    public skipEmptyTags? = false;

    /**
     * See:
     * https://github.com/alonrbar/easy-template-x#controlling-loop-behavior
     *
     * Controls how loops handle paragraphs.
     *
     * When enabled:
     * - If a loop without an explicit `repeat` option starts at the beginning
     *   of a paragraph and ends at the end of a paragraph, it repeats the
     *   entire paragraphs instead of just the content between the tags.
     * - Paragraphs containing only a loop tag are removed.
     *
     * Additional rules:
     * - Loops that repeat table rows, table columns or list items are not
     *   affected.
     * - Whitespace and non-text elements (bookmarks, images, shapes, etc.) are
     *   ignored when checking paragraph boundaries, so a paragraph containing
     *   them is still repeated as a whole.
     *
     * This behavior will become the default in a future major version.
     *
     * Default: false
     */
    public preferParagraphLoops? = false;

    public defaultContentType? = TEXT_CONTENT_TYPE;

    public containerContentType? = LOOP_CONTENT_TYPE;

    public delimiters?: Partial<Delimiters> = new Delimiters();

    public maxXmlDepth? = 20;

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
