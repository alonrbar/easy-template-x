declare module "ts-nameof" {
    interface Api {
        (): any;
        replaceInFiles(fileNames: string[], opts?: { encoding?: string }, onFinished?: (err?: any) => void): void;
        replaceInFiles(fileNames: string[], onFinished?: (err?: any) => void): void;
        replaceInText(fileText: string): { fileText?: string; replaced: boolean; };
    }
    var func: Api;
    export = func;
}

declare function nameof<T>(func?: (obj: T) => void): string;

declare function nameof(obj: Object | null | undefined): string;

declare namespace nameof {
    function full<T>(periodIndex?: number): string;
    function full<T>(func: (obj: T) => void, periodIndex?: number): string;
    function full(obj: Object | null | undefined, periodIndex?: number): string;
}
