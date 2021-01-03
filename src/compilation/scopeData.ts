import {TemplateContent, TemplateData} from '../templateData';
import {last} from '../utils';

const getProp = require('lodash.get');
const TOKEN_ITEM_OF_ARRAY = '@item';
const TOKEN_INDEX_OF_ARRAY = '@index';
const TOKEN_COUNT_OF_ARRAY = '@count';

export class ScopeData {
    public readonly path: (string | number)[] = [];
    public readonly allData: TemplateData;

    constructor(data: TemplateData) {
        this.allData = data;
    }

    public getScopeData<T extends TemplateContent | TemplateData[]>(): T {
        const lastKey = last(this.path);

        let result: any;
        let curPath = this.path.slice();

        while (result === undefined && curPath.length) {
            const curScopePath = curPath.slice(0, curPath.length - 1);
            if (lastKey === TOKEN_ITEM_OF_ARRAY) {
                result = getProp(this.allData, curScopePath);
            } else if (lastKey === TOKEN_INDEX_OF_ARRAY) {
                result = last(curScopePath);
            } else if (lastKey === TOKEN_COUNT_OF_ARRAY) {
                result = last(curScopePath) as number + 1;
            } else {
                result = getProp(this.allData, curScopePath.concat(lastKey));
            }

            curPath = curScopePath;
        }
        return result;
    }
}
