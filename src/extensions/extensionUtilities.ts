import { TemplateCompiler } from '../compilation/templateCompiler';
import { DocxParser } from '../office';
import { XmlParser } from '../xml';

export interface ExtensionUtilities {
    compiler: TemplateCompiler;
    docxParser: DocxParser;
    xmlParser: XmlParser;
}
