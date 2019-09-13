import { UnsupportedFileTypeError } from './errors';

export enum MimeType {
    Png = 'image/png',
    Jpeg = 'image/jpeg',
    Gif = 'image/gif',
    Bmp = 'image/bmp',
    Svg = 'image/svg+xml'
}

export class MimeTypeHelper {

    public static getDefaultExtension(mime: MimeType): string {
        switch (mime) {
            case MimeType.Png:
                return 'png';
            case MimeType.Jpeg:
                return 'jpg';
            case MimeType.Gif:
                return 'gif';
            case MimeType.Bmp:
                return 'bmp';
            case MimeType.Svg:
                return 'svg';
            default:
                throw new UnsupportedFileTypeError(mime);
        }
    }

    public static getOfficeRelType(mime: MimeType): string {
        switch (mime) {
            case MimeType.Png:
            case MimeType.Jpeg:
            case MimeType.Gif:
            case MimeType.Bmp:
            case MimeType.Svg:
                return "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image";
            default:
                throw new UnsupportedFileTypeError(mime);
        }
    }
}