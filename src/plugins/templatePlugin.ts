import { TagTree } from "../compilation";

export abstract class TemplatePlugin {

    /**
     * @param path Current path
     * @param tagNode Current tag node
     * @param data Relevant part of the data
     */
    public setTagValue(path: string[], tagNode: TagTree, data: any): void {
        // noop
    }
}