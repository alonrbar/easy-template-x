export class MaxXmlDepthError extends Error {
    constructor(depth: number) {
        super(`XML maximum depth reached (depth: ${depth}).`);

        // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, MaxXmlDepthError.prototype);
    }
}