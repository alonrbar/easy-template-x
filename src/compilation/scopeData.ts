const getProp = require('lodash.get');

export class ScopeData {
    public path: (string | number)[] = [];
    public readonly allData: any;

    constructor(data: any) {
        this.allData = data;
    }

    public getScopeData(): any {
        let result: any;
        let curPath = this.path;
        while (result === undefined && curPath.length) {
            result = getProp(this.allData, curPath);
            curPath = curPath.slice(0, curPath.length - 1);
        }
        return result;
    }
}