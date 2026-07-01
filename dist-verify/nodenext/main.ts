
import {
    TemplateHandler,
    TemplateHandlerOptions,
    createDefaultPlugins,
    officeMarkup,
    OfficeMarkup,
    MimeType,
    TemplatePlugin,
    TemplateExtension,
    TextPlugin,
    LoopPlugin,
    ImagePlugin,
    LinkPlugin,
    RawXmlPlugin,
    ChartPlugin,
    ScopeData,
} from 'easy-template-x';

import type {
    TemplateData,
    TemplateContent,
    ImageContent,
    Tag,
    XmlNode,
} from 'easy-template-x';

import * as fs from 'fs';

const symbols = [
    TemplateHandlerOptions,
    createDefaultPlugins,
    officeMarkup,
    OfficeMarkup,
    MimeType,
    TemplatePlugin,
    TemplateExtension,
    TextPlugin,
    LoopPlugin,
    ImagePlugin,
    LinkPlugin,
    RawXmlPlugin,
    ChartPlugin,
    ScopeData,
];
type _Checks = [TemplateData, TemplateContent, ImageContent, Tag, XmlNode];

async function main() {
    if (symbols.length !== 14) {
        throw new Error('unexpected symbol count');
    }

    const templateFile = fs.readFileSync('../template.docx');
    const data: TemplateData = {
        "Beers": [
            { "Brand": "Carlsberg", "Price": 1 },
            { "Brand": "Leaf Blonde", "Price": 2 },
            { "Brand": "Weihenstephan", "Price": 1.5 }
        ]
    };

    const handler = new TemplateHandler();
    await handler.process(templateFile, data);

    console.log('nodenext verification completed successfully');
}
main();
