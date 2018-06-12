
class Platform {

    private _isNode: boolean = null;

    public get isNode(): boolean {
        if (this._isNode === null) {

            // https://stackoverflow.com/questions/4224606/how-to-check-whether-a-script-is-running-under-node-js

            const isNodeJS = (
                (typeof process !== 'undefined') &&
                (typeof (process as any).release !== 'undefined') &&
                (process as any).release.name === 'node'
            );
            const isBrowser = (typeof window !== 'undefined');

            this._isNode = (isNodeJS || !isBrowser);
        }
        return this._isNode;
    }
}

export const platform = new Platform();