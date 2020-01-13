import { IExtensionUtilities } from "./IExtensionUtilities";

export abstract class ExtensionUtilities implements IExtensionUtilities {
    compiler: import("..").TemplateCompiler;    
    docxParser: import("..").DocxParser;
    xmlParser: import("..").XmlParser;
}
