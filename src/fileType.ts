import * as JSZip from 'jszip';
import { UnidentifiedFileTypeError } from './errors';

export enum FileType {
    Docx = 'docx',
    Pptx = 'pptx',
    Odt = 'odt'
}

export class FileTypeHelper {

    public static getFileType(zipFile: JSZip): FileType {

        if (FileTypeHelper.isDocx(zipFile))
            return FileType.Docx;

        if (FileTypeHelper.isPptx(zipFile))
            return FileType.Pptx;

        if (FileTypeHelper.isOdt(zipFile))
            return FileType.Odt;

        throw new UnidentifiedFileTypeError();
    }

    public static isDocx(zipFile: JSZip): boolean {
        return !!(zipFile.files["word/document.xml"] || zipFile.files["word/document2.xml"]);
    }

    public static isPptx(zipFile: JSZip): boolean {
        return !!zipFile.files["ppt/presentation.xml"];
    }

    public static isOdt(zipFile: JSZip): boolean {
        return !!zipFile.files['mimetype'];
    }
}