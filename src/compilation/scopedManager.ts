import { Tag, TagDisposition } from './tag';
const getProp = require('lodash.get');

export class ScopeManager {

    public readonly allData: any;    

    public path: string[] = [];

    constructor(allData: any) {
        this.allData = allData;
    }

    public updateScopeBefore(tag: Tag): void {
        switch (tag.disposition) {
            case TagDisposition.Open:
            case TagDisposition.SelfClosed:
                this.path.push(tag.name);
                break;
            case TagDisposition.Close:
                this.path.pop();
                break;
            default:
                throw new Error(`Unrecognized tag disposition: '${tag.disposition}'.`);
        }
    }

    public updateScopeAfter(tag: Tag): void {
        if (tag.disposition === TagDisposition.SelfClosed)
            this.path.pop();
    }

    public getScopedData(): any {
        return getProp(this.allData, this.path);
    }
}