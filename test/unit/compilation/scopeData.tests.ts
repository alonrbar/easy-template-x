import { ScopeData, Tag } from "src/compilation";
import { describe, expect, it } from "vitest";

describe(ScopeData, () => {

    it('uses custom scope data resolver (no path)', () => {
        const scopeData = new ScopeData({});

        const value1 = scopeData.getScopeData();
        expect(value1).toEqual(undefined);

        scopeData.scopeDataResolver = (args) => {
            expect(args.path).toEqual([]);
            expect(args.strPath).toEqual([]);
            expect(args.data).toEqual({});
            return 7;
        };

        const value2 = scopeData.getScopeData();
        expect(value2).toEqual(7);
    });

    it('uses custom scope data resolver (with path)', () => {
        const scopeData = new ScopeData({ hello: "world" });
        scopeData.pathPush({ name: "hello" } as Tag);

        const value1 = scopeData.getScopeData();
        expect(value1).toEqual("world");

        scopeData.scopeDataResolver = (args) => {
            expect(args.path).toEqual([{ name: "hello" }]);
            expect(args.strPath).toEqual(["hello"]);
            expect(args.data).toEqual({ hello: "world" });
            return "Bobby";
        };

        const value2 = scopeData.getScopeData();
        expect(value2).toEqual("Bobby");
    });
});
