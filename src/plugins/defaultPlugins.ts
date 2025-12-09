import { ChartPlugin } from "./chart";
import { ImagePlugin } from "./image";
import { LinkPlugin } from "./link";
import { LoopPlugin } from "./loop";
import { RawXmlPlugin } from "./rawXml";
import { RawXmlMultiPlugin } from "./rawXmlMulti";
import { TemplatePlugin } from "./templatePlugin";
import { TextPlugin } from "./text";

export function createDefaultPlugins(): TemplatePlugin[] {
    return [
        new LoopPlugin(),
        new RawXmlPlugin(),
        new RawXmlMultiPlugin(),
        new ChartPlugin(),
        new ImagePlugin(),
        new LinkPlugin(),
        new TextPlugin()
    ];
}
