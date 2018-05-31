import * as JSZip from 'jszip';
import { ITemplateSpec } from './iTemplateSpec';

//
// currently not supported, might be in the future
//

export class PptxTemplateSpec implements ITemplateSpec {

    public textTags: ["a:t", "m:t", "vt:lpstr", "dc:title", "dc:creator", "cp:keywords"];
    public lexedTags = ["p:sp", "a:tc", "a:tr", "a:table", "a:p", "a:r"];
    public expandTags = [{ contains: "a:tc", expand: "a:tr" }];
    public onParagraphLoop = [{ contains: "a:p", expand: "a:p", onlyTextInTag: true }];
    public rawXmlTag = "p:sp";
    public defaultTextTag = "a:t";

    public contentFilePaths(zip: JSZip): string[] {

        const slideTemplates = zip
            .file(/ppt\/(slides|slideMasters)\/(slide|slideMaster)\d+\.xml/)
            .map(file => file.name);

        return slideTemplates.concat([
            "ppt/presentation.xml",
            "docProps/app.xml",
            "docProps/core.xml"
        ]);
    }

    public mainFilePath(): string {
        return "ppt/slides/slide1.xml";
    }
}
