import { ScopeData, Tag } from '../../compilation';
import { TemplatePlugin } from '../templatePlugin';
export declare const TEXT_CONTENT_TYPE = "text";
export declare class TextPlugin extends TemplatePlugin {
    readonly contentType = "text";
    simpleTagReplacements(tag: Tag, data: ScopeData): void;
    private replaceSingleLine;
    private replaceMultiLine;
    private getLineBreak;
    private createWordTextNode;
}
