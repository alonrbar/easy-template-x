import { ImagePlugin } from './imagePlugin';
import { LinkPlugin } from './linkPlugin';
import { LoopPlugin } from './loopPlugin';
import { RawXmlPlugin } from './rawXmlPlugin';
import { TemplatePlugin } from './templatePlugin';
import { TextPlugin } from './textPlugin';

export function createDefaultPlugins(): TemplatePlugin[] {
    return [
        new LoopPlugin(), 
        new RawXmlPlugin(),
        new ImagePlugin(),
        new LinkPlugin(),
        new TextPlugin()
    ];
}