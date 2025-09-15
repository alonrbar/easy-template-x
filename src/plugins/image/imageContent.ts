import { MimeType } from '../../mimeType';
import { Binary } from '../../utils';
import { PluginContent } from '../pluginContent';

export type ImageFormat = typeof MimeType.Jpeg | typeof MimeType.Png | typeof MimeType.Gif | typeof MimeType.Bmp | typeof MimeType.Svg;

export interface ImageContent extends PluginContent {
    _type: 'image';
    source: Binary;
    format: ImageFormat;
    /**
     * When using an image placeholder, `width` and `height` properties are
     * optional and if not set the image will keep its original size. Otherwise,
     * they are required.
     */
    width?: number;
    /**
     * When using an image placeholder, `width` and `height` properties are
     * optional and if not set the image will keep its original size. Otherwise,
     * they are required.
     */
    height?: number;
    /**
     * Optional.
     */
    altText?: string;
    /**
     * Optional. A value between 0 and 100. If this is not set, new images will
     * be fully opaque and placeholder images will keep their original
     * transparency.
     */
    transparencyPercent?: number;
}
