import { MimeType } from '../../mimeType';
import { Binary } from '../../utils';
import { PluginContent } from '../pluginContent';

export type ImageFormat = MimeType.Jpeg | MimeType.Png | MimeType.Gif | MimeType.Bmp | MimeType.Svg;

export interface ImageContent extends PluginContent {
    _type: 'image';
    source: Binary;
    /**
     * Optional. If this is not set the image will be marked as "decorative".
     */
    altText?: string;
    format: ImageFormat;
    width: number;
    height: number;
}
