import { Delimiters } from "src/delimiters";
import { Regex } from "src/utils";

export function tagRegex(delimiters: Delimiters, global: boolean = false): RegExp {
    const tagOptionsPattern = `${Regex.escape(delimiters.tagOptionsStart)}(?<tagOptions>.*?)${Regex.escape(delimiters.tagOptionsEnd)}`;
    const tagPattern = `${Regex.escape(delimiters.tagStart)}(?<tagName>.*?)(?:\\s*${tagOptionsPattern})?\\s*${Regex.escape(delimiters.tagEnd)}`;
    const flags = global ? 'gm' : 'm';
    return new RegExp(tagPattern, flags);
}