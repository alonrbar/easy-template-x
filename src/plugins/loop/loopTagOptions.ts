import { ValueOf } from "src/types";

export const RepeatMode = Object.freeze({
    /**
     * Repeat the entire table row.
     */
    Row: 'row',
    /**
     * Repeat the entire table column.
     */
    Column: 'column',
    /**
     * Repeat the entire paragraph.
     */
    Paragraph: 'paragraph',
    /**
     * Repeat the content enclosed between the opening and closing tag.
     */
    Content: 'content'
} as const);

export type RepeatMode = ValueOf<typeof RepeatMode>;

export class LoopTagOptions {
    /**
     * What to repeat on each iteration.
     */
    public repeat?: RepeatMode;
    /**
     * @deprecated Use `repeat` instead.
     */
    public loopOver?: RepeatMode;
}

/**
 * Get the `repeat` option value of a loop tag, falling back to the deprecated
 * `loopOver` option.
 */
export function getRepeatMode(options: LoopTagOptions): RepeatMode {
    return options?.repeat ?? options?.loopOver;
}
