import { TemplateContent, TemplateData } from "../templateData";
import { last } from "../utils";

const getProp = require("lodash.get");

export class ScopeData {
    public readonly path: (string | number)[] = [];
    public readonly allData: TemplateData;

    constructor(data: TemplateData) {
        this.allData = data;
    }

    public getScopeData<T = TemplateContent | TemplateData[]>(): T{
        const lastKey = last(this.path);

        let result: any;
        let curPath = this.path.slice();

        while (result === undefined && curPath.length) {
            const curScopePath = curPath.slice(0, curPath.length - 1);
            result = getProp(this.allData, curScopePath.concat(lastKey));
            curPath = curScopePath;
        }
        return result;
    }
}
