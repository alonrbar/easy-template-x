export const LoopOver = Object.freeze({
    /**
     * Loop over the entire row.
     */
    Row: 'row',
    /**
     * Loop over the entire column.
     */
    Column: 'column',
    /**
     * Loop over the content enclosed between the opening and closing tag.
     */
    Content: 'content'
} as const);

export type LoopOver = typeof LoopOver[keyof typeof LoopOver];

export class LoopTagOptions {
    public loopOver: LoopOver = LoopOver.Content;
}
