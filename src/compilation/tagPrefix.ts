import { TagDisposition, TagType } from './tag';

export interface TagPrefix {
    prefix: string;
    tagType: TagType;
    tagDisposition: TagDisposition;
}