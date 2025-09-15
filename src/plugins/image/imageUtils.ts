import { TemplateDataError } from "src/errors";

export function nameFromId(imageId: number): string {
    return `Picture ${imageId}`;
}

export function pixelsToEmu(pixels: number): number {

    // https://stackoverflow.com/questions/20194403/openxml-distance-size-units
    // https://docs.microsoft.com/en-us/windows/win32/vml/msdn-online-vml-units#other-units-of-measurement
    // https://en.wikipedia.org/wiki/Office_Open_XML_file_formats#DrawingML
    // http://www.java2s.com/Code/CSharp/2D-Graphics/ConvertpixelstoEMUEMUtopixels.htm

    return Math.round(pixels * 9525);
}

export function transparencyPercentToAlpha(transparencyPercent: number): number {
    if (transparencyPercent < 0 || transparencyPercent > 100) {
        throw new TemplateDataError(`Transparency percent must be between 0 and 100, but was ${transparencyPercent}.`);
    }
    return Math.round((100 - transparencyPercent) * 1000);
}