import { Delimiters } from "./delimiters";
import {
  createDefaultPlugins,
  LOOP_CONTENT_TYPE,
  TemplatePlugin,
  TEXT_CONTENT_TYPE
} from "./plugins";
import { ITemplateExtension, createDefaultExtensions } from "./extensions";

export class TemplateHandlerOptions {
  public plugins?: TemplatePlugin[] = createDefaultPlugins();

  public extensions?: ITemplateExtension[] = createDefaultExtensions();

  public defaultContentType? = TEXT_CONTENT_TYPE;

  public containerContentType? = LOOP_CONTENT_TYPE;

  public delimiters?: Partial<Delimiters> = new Delimiters();

  public maxXmlDepth? = 20;

  constructor(initial?: Partial<TemplateHandlerOptions>) {
    Object.assign(this, initial);

    if (initial) {
      this.delimiters = new Delimiters(initial.delimiters);
    }

    if (!this.plugins.length) {
      throw new Error("Plugins list can not be empty");
    }
  }
}
