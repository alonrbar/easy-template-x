import { last, pushMany } from '../utils';
import { Tag, TagDisposition } from './tag';
const getProp = require('lodash.get');

type DataType = 'object' | 'array';

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
    private dataTypes: DataType[] = [];

    private _scopedData: any;
    private isScopedDataUpToDate = false;

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
                throw new Error(`Unexpected close tag: '${tag.rawText}'.`);
            default:
                throw new Error(`Unrecognized tag disposition: '${tag.disposition}' (tag: ${tag.rawText}).`);
        }
    }

    public updateScopeAfter(tag: Tag): void {
        switch (tag.disposition) {
            case TagDisposition.Open:
            case TagDisposition.SelfClosed:
                this.pop();
                break;
            case TagDisposition.Close:
                throw new Error(`Unexpected close tag: '${tag.rawText}'.`);
            default:
                throw new Error(`Unrecognized tag disposition: '${tag.disposition}' (tag: ${tag.rawText}).`);
        }
    }

    private push(tag: Tag, index: number): void {
        const isArray = Array.isArray(this.scopedData);

        // path
        const pathParts = (isArray ? [index, tag.name] : [tag.name]);
        pushMany(this.path, pathParts);

        // data type
        this.dataTypes.push(isArray ? 'array' : 'object');

        // invalidate cache
        this.isScopedDataUpToDate = false;
    }

    private pop(): void {

        // path
        this.path.pop();
        if (last(this.dataTypes) === 'array')
            this.path.pop();

        // data type
        this.dataTypes.pop();

        // invalidate cache
        this.isScopedDataUpToDate = false;
    }
}