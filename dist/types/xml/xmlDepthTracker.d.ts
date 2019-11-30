export declare class XmlDepthTracker {
    private readonly maxDepth;
    private depth;
    constructor(maxDepth: number);
    increment(): void;
    decrement(): void;
}
