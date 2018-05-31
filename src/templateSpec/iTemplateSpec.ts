import * as JSZip from 'jszip';

export interface ExpandTags {
    contains: string;
    expand: string;
}

export interface OnParagraphLoop extends ExpandTags {
    onlyTextInTag: boolean;
}

export interface ITemplateSpec {

    textTags: string[];
    lexedTags: string[];
    expandTags: ExpandTags[];
    onParagraphLoop: OnParagraphLoop[];
    rawXmlTag: string;
    defaultTextTag: string;

    contentFilePaths(zip: JSZip): string[];
    mainFilePath(zip?: JSZip): string;
}