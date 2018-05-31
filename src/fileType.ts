import * as JSZip from 'jszip';
import { UnidentifiedFileTypeError } from './errors';

export enum FileType {
    Docx = 'docx',
    Pptx = 'pptx',
    Odt = 'odt'
}

// tslint:disable-next-line:no-namespace
export namespace FileType {

    export function getFileType(zipFile: JSZip): FileType {

        if (isDocx(zipFile))
            return FileType.Docx;

        if (isPptx(zipFile))
            return FileType.Pptx;

        if (isOdt(zipFile))
            return FileType.Odt;

        throw new UnidentifiedFileTypeError();
    }

    export function isDocx(zipFile: JSZip): boolean {
        return !!(zipFile.files["word/document.xml"] || zipFile.files["word/document2.xml"]);
    }

    export function isPptx(zipFile: JSZip): boolean {
        return !!zipFile.files["ppt/presentation.xml"];
    }

    export function isOdt(zipFile: JSZip): boolean {
        return !!zipFile.files['mimetype'];
    }
}