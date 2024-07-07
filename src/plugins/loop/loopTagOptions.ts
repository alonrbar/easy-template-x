export enum LoopOver {
    /**
     * Loop over the entire row.
     */
    Row = 'row',
    /**
     * Loop over the content enclosed between the opening and closing tag.
     */
    Content = 'content'
}

export class LoopTagOptions {
    public loopOver = LoopOver.Content;
}
