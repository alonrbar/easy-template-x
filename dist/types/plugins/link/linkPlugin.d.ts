import { ScopeData, Tag, TemplateContext } from '../../compilation';
import { TemplatePlugin } from '../templatePlugin';
export declare class LinkPlugin extends TemplatePlugin {
    private static readonly linkRelType;
    readonly contentType = "link";
    simpleTagReplacements(tag: Tag, data: ScopeData, context: TemplateContext): Promise<void>;
    private generateMarkup;
    private insertHyperlinkNode;
}
