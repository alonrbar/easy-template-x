import getProp from 'lodash.get';
import { TemplateContent, TemplateData } from '../templateData';
import { isNumber, last } from '../utils';
import { Tag } from './tag';

export type PathPart = Tag | number;

export interface ScopeDataArgs {
    path: PathPart[];
    /**
     * The string representation of the path.
     */
    strPath: string[];
    data: TemplateData;
}

export type ScopeDataResolver = (args: ScopeDataArgs) => TemplateContent | TemplateData[];

export class ScopeData {

    public static defaultResolver(args: ScopeDataArgs): TemplateContent | TemplateData[] {
        let result: any;

        const lastKey = last(args.strPath);
        const curPath = args.strPath.slice();
        while (result === undefined && curPath.length) {
            curPath.pop();
            result = getProp(args.data, curPath.concat(lastKey));
        }
        return result;
    }

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

    public getScopeData<T extends TemplateContent | TemplateData[]>(): T {
        const args: ScopeDataArgs = {
            path: this.path,
            strPath: this.strPath,
            data: this.allData
        };
        if (this.scopeDataResolver) {
            return this.scopeDataResolver(args) as T;
        }
        return ScopeData.defaultResolver(args) as T;
    }
}
