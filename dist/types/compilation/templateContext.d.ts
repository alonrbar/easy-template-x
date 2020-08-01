import { Docx, XmlPart } from '../office';
export interface TemplateContext {
    docx: Docx;
    currentPart: XmlPart;
}
