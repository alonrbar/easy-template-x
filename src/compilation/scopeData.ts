import { TemplateContent, TemplateData } from '../templateData';
import { isNumber, last } from '../utils';
import { Tag } from './tag';

const getProp = require("lodash.get");

export type PathPart = Tag | number;

export type ScopeDataResolver = (path: PathPart[], data: TemplateData) => TemplateContent | TemplateData[];

export class ScopeData {
    public scopeDataResolver: ScopeDataResolver;
    public allData: TemplateData;

    private readonly path: PathPart[] = [];
    private readonly strPath: string[] = [];

    constructor(data: TemplateData) {
        this.allData = data;
    }

    public pathPush(pathPart: PathPart): void {
        this.path.push(pathPart);
        const strItem = isNumber(pathPart) ? pathPart.toString() : pathPart.name;
        this.strPath.push(strItem);
    }

    public pathPop(): Tag | number {
        this.strPath.pop();
        return this.path.pop();
    }

    public pathString(): string {
        return this.strPath.join(".");
    }

    public getScopeData<T extends TemplateContent | TemplateData[]>(): T{
        // Custom resolver.
        let result: any;
        if (this.scopeDataResolver) {
            result = this.scopeDataResolver(this.path, this.allData);
        }

        // Default resolution.
        const lastKey = last(this.strPath);
        const curPath = this.strPath.slice();
        while (result === undefined && curPath.length) {
            curPath.pop();
            result = getProp(this.allData, curPath.concat(lastKey));
        }
        return result;
    }
}
