import {
    ContentControlCheckBoxPlugin,
    ContentControlDatePickerPlugin,
    ContentControlPlainTextPlugin,
    ContentControlRichTextPlugin,
    ContentControlTemplatePlugin
} from ".";

export function createDefaultContentControlPlugins(): ContentControlTemplatePlugin[] {
    return [
        new ContentControlCheckBoxPlugin(),
        new ContentControlDatePickerPlugin(),
        new ContentControlPlainTextPlugin(),
        new ContentControlRichTextPlugin()
    ];
}
