import { ScopeData, Tag, TemplateContext } from '../../compilation';
import { PluginUtilities, TemplatePlugin } from '../templatePlugin';
export declare const LOOP_CONTENT_TYPE = "loop";
export declare class LoopPlugin extends TemplatePlugin {
    readonly contentType = "loop";
    private readonly loopStrategies;
    setUtilities(utilities: PluginUtilities): void;
    containerTagReplacements(tags: Tag[], data: ScopeData, context: TemplateContext): Promise<void>;
    private repeat;
    private compile;
}
