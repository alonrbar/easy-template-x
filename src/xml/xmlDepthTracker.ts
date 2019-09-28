import { MaxXmlDepthError } from '../errors';

export class XmlDepthTracker {
    
    private depth = 0;

    constructor(private readonly maxDepth: number) { }

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