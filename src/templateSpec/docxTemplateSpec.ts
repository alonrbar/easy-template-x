import * as JSZip from 'jszip';
import { ITemplateSpec } from './iTemplateSpec';

export class DocxTemplateSpec implements ITemplateSpec {

    public textTags = ["w:t", "m:t", "vt:lpstr", "dc:title", "dc:creator", "cp:keywords"];
    public lexedTags = ["w:tc", "w:tr", "w:table", "w:p", "w:r", "w:rPr", "w:pPr", "w:spacing"];
    public expandTags = [{ contains: "w:tc", expand: "w:tr" }];
    public onParagraphLoop = [{ contains: "w:p", expand: "w:p", onlyTextInTag: true }];
    public rawXmlTag = "w:p";
    public defaultTextTag = "w:t";

    public contentFilePaths(zip: JSZip) {
        const baseTags = [
            "docProps/core.xml",
            "docProps/app.xml",
            "word/document.xml",
            "word/document2.xml"
        ];

        const slideTemplates = zip
            .file(/word\/(header|footer)\d+\.xml/)
            .map(file => file.name);

        return slideTemplates.concat(baseTags);
    }

    public mainFilePath(zip: JSZip): string {
        if (zip.files["word/document.xml"]) {
            return "word/document.xml";
        }
        if (zip.files["word/document2.xml"]) {
            return "word/document2.xml";
        }
        return undefined;
    }
}