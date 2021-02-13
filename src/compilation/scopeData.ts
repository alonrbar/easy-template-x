import { TemplateContent, TemplateData } from "../templateData";
import { last } from "../utils";

const getProp = require("lodash.get");

export class ScopeData {
    public readonly path: (string | number)[] = [];
    public readonly allData: TemplateData;

    constructor(data: TemplateData) {
        this.allData = data;
    }

    public getScopeData<T extends TemplateContent | TemplateData[]>(): T{
        const lastKey = last(this.path);

        let result: any;
        const curPath = this.path.slice();
        while (result === undefined && curPath.length) {
            curPath.pop();
            result = getProp(this.allData, curPath.concat(lastKey));
        }
        return result;
    }
}
