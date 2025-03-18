import { Docx, OpenXmlPart } from '../office';

export interface TemplateContext {
    docx: Docx;
    currentPart: OpenXmlPart;
}
