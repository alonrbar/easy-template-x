import { MimeType } from '../mimeType';
import { Binary } from '../utils';
import { PluginContent } from './pluginContent';

export type ImageFormat = MimeType.Jpeg | MimeType.Png;

export interface ImageContent extends PluginContent {
    _type: 'image';
    source: Binary;
    format: ImageFormat;
    width: number;
    height: number;
}