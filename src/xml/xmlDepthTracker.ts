import { MaxXmlDepthError } from '../errors';

export class XmlDepthTracker {

    private depth = 0;

    private readonly maxDepth: number;

    constructor(maxDepth: number) {
        this.maxDepth = maxDepth;
    }

    public increment(): void {
        this.depth++;
        if (this.depth > this.maxDepth) {
            throw new MaxXmlDepthError(this.maxDepth);
        }
    }

    public decrement(): void {
        this.depth--;
    }
}