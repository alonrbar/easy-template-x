export declare enum MimeType {
    Png = "image/png",
    Jpeg = "image/jpeg",
    Gif = "image/gif",
    Bmp = "image/bmp",
    Svg = "image/svg+xml"
}
export declare class MimeTypeHelper {
    static getDefaultExtension(mime: MimeType): string;
    static getOfficeRelType(mime: MimeType): string;
}
