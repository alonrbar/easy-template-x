export class MaxXmlDepthError extends Error {

    public readonly maxDepth: number;

    constructor(maxDepth: number) {
        super(`XML maximum depth reached (max depth: ${maxDepth}).`);

        this.maxDepth = maxDepth;

        // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, MaxXmlDepthError.prototype);
    }
}