import { ScopeData, Tag } from 'src/compilation';

describe(nameof(ScopeData), () => {

    it('uses custom scope data resolver (no path)', () => {
        const scopeData = new ScopeData({});

        const value1 = scopeData.getScopeData();
        expect(value1).toEqual(undefined);

        scopeData.scopeDataResolver = (p, d) => {
            expect(p).toEqual([]);
            expect(d).toEqual({});
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

        scopeData.scopeDataResolver = (p, d) => {
            expect(p).toEqual([{ name: "hello" }]);
            expect(d).toEqual({ hello: "world" });
            return "Bobby";
        };

        const value2 = scopeData.getScopeData();
        expect(value2).toEqual("Bobby");
    });
});
