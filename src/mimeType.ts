import { UnsupportedFileTypeError } from './errors';

export enum MimeType {
    // TODO: support more image types
    Png = "image/png",
    Jpeg = "image/jpeg"
}

export class MimeTypeHelper {

    public static getDefaultExtension(mime: MimeType): string {
        switch (mime) {
            case MimeType.Png:
                return 'png';
            case MimeType.Jpeg:
                return 'jpg';
            default:
                throw new UnsupportedFileTypeError(mime);
        }
    }

    public static getOfficeRelType(mime: MimeType): string {
        switch (mime) {
            case MimeType.Png:
            case MimeType.Jpeg:
                return "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image";
            default:
                throw new UnsupportedFileTypeError(mime);
        }
    }
}