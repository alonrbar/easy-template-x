import { TemplateHandler, TemplateHandlerOptions } from "src";
import {
  ContentControlExtension,
  createDefaultContentControlPlugins
} from "src/extensions/contentControlExtension";

export function createHandler() {
  return new TemplateHandler(
    new TemplateHandlerOptions({
      extensions: [
        new ContentControlExtension(createDefaultContentControlPlugins())
      ]
    })
  );
}
