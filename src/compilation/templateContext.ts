import * as JSZip from 'jszip';

export interface TemplateContext {
    zipFile: JSZip;
    currentFilePath: string;
}