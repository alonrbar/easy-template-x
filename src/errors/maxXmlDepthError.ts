export class MaxXmlDepthError extends Error {

    public readonly maxDepth: number;

    constructor(maxDepth: number) {
        super(`XML maximum depth reached (max depth: ${maxDepth}).`);

        this.maxDepth = maxDepth;
    }
}
