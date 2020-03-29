import { ScopeData, Tag, TemplateContext } from '../../compilation';
import { TemplatePlugin } from '../templatePlugin';
export declare class ImagePlugin extends TemplatePlugin {
    readonly contentType = "image";
    simpleTagReplacements(tag: Tag, data: ScopeData, context: TemplateContext): Promise<void>;
    private createMarkup;
    private pictureMarkup;
    private pixelsToEmu;
}
