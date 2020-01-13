import { TemplateCompiler } from '../compilation/templateCompiler';
import { DocxParser } from '../office';
import { XmlParser } from '../xml';

export interface IExtensionUtilities {
    compiler: TemplateCompiler;
    docxParser: DocxParser;
    xmlParser: XmlParser;
}
