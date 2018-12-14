import { ScopeData, Tag, TagDisposition, TagPrefix, TemplateContext } from '../compilation';
import { DocxParser } from '../docxParser';
import { LoopParagraphPlugin } from './loopParagraphPlugin';
import { LoopTablePlugin } from './loopTablePlugin';
import { PluginUtilities, TemplatePlugin } from './templatePlugin';

export class LoopPlugin extends TemplatePlugin {

    public readonly prefixes: TagPrefix[] = [
        {
            prefix: '#',
            tagType: 'loop',
            tagDisposition: TagDisposition.Open
        },
        {
            prefix: '/',
            tagType: 'loop',
            tagDisposition: TagDisposition.Close
        }
    ];

    private readonly loopParagraph = new LoopParagraphPlugin();
    private readonly loopTable = new LoopTablePlugin();

    public setUtilities(utilities: PluginUtilities) {
        this.utilities = utilities;
        this.loopParagraph.setUtilities(utilities);
        this.loopTable.setUtilities(utilities);
    }

    public containerTagReplacements(tags: Tag[], data: ScopeData, context: TemplateContext): void {

        const openTag = tags[0];
        const firstNode = this.utilities.docxParser.containingParagraphNode(openTag.xmlTextNode);

        if (firstNode.parentNode && firstNode.parentNode.nodeName === DocxParser.TABLE_CELL_NODE) {
            return this.loopTable.containerTagReplacements(tags, data, context);
        } else {
            return this.loopParagraph.containerTagReplacements(tags, data, context);
        }
    }
}