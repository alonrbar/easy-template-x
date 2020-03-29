import { ScopeData, Tag } from '../../compilation';
import { TemplatePlugin } from '../templatePlugin';
export declare class RawXmlPlugin extends TemplatePlugin {
    readonly contentType = "rawXml";
    simpleTagReplacements(tag: Tag, data: ScopeData): void;
}
