import { pushMany } from '../utils';
import { Tag, TagDisposition } from './tag';
const getProp = require('lodash.get');

export class ScopeManager {

    public readonly allData: any;

    public get scopedData(): any {
        if (!this.path.length)
            return this.allData;

        if (!this.isScopedDataUpToDate) {
            this._scopedData = getProp(this.allData, this.path);
            this.isScopedDataUpToDate = true;
        }
        return this._scopedData;
    }

    public path: (string | number)[] = [];

    private _scopedData: any;
    private isScopedDataUpToDate = false;
    private lastDataIsArray: boolean;

    constructor(allData: any) {
        this.allData = allData;
    }

    public updateScopeBefore(tag: Tag, index: number): void {
        switch (tag.disposition) {
            case TagDisposition.Open:
            case TagDisposition.SelfClosed:
                this.push(tag, index);
                break;
            case TagDisposition.Close:
                this.pop();
                break;
            default:
                throw new Error(`Unrecognized tag disposition: '${tag.disposition}'.`);
        }
    }

    public updateScopeAfter(tag: Tag): void {
        if (tag.disposition === TagDisposition.SelfClosed) {
            this.pop();
        }
    }

    private push(tag: Tag, index: number): void {
        this.lastDataIsArray = Array.isArray(this.scopedData);
        const pathParts = (this.lastDataIsArray ? [index, tag.name] : [tag.name]);
        pushMany(this.path, pathParts);
        this.isScopedDataUpToDate = false;
    }

    private pop(): void {
        this.path.pop();
        if (this.lastDataIsArray)
            this.path.pop();
        this.isScopedDataUpToDate = false;
    }
}