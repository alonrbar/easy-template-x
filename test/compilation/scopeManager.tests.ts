import { expect } from 'chai';
import { ScopeManager } from 'src/compilation/scopedManager';
import { Tag, TagDisposition, TagType } from 'src/compilation/tag';

describe(nameof(ScopeManager), () => {

    it.skip('handles nested loop tags correctly', () => {
        const tags = [
            new Tag({
                name: 'loop_prop1',
                disposition: TagDisposition.Open,
                type: TagType.Loop
            }),
            new Tag({
                name: 'loop_prop2',
                disposition: TagDisposition.Open,
                type: TagType.Loop
            }),
            new Tag({
                name: 'simple_prop',
                disposition: TagDisposition.SelfClosed,
                type: TagType.Simple
            }),
            new Tag({
                name: 'simple_prop',
                disposition: TagDisposition.SelfClosed,
                type: TagType.Simple
            }),
            new Tag({
                name: 'loop_prop2',
                disposition: TagDisposition.Open,
                type: TagType.Loop
            }),
            new Tag({
                name: 'simple_prop',
                disposition: TagDisposition.SelfClosed,
                type: TagType.Simple
            }),
            new Tag({
                name: 'simple_prop',
                disposition: TagDisposition.SelfClosed,
                type: TagType.Simple
            })
        ];

        const data = {
            loop_prop1: [
                {
                    loop_prop2: [
                        { simple_prop: 'first' },
                        { simple_prop: 'second' }
                    ]
                },
                {
                    loop_prop2: [
                        { simple_prop: 'third' },
                        { simple_prop: 'forth' }
                    ]
                }
            ]
        };

        const scopeManager = new ScopeManager(data);

        scopeManager.updateScopeBefore(tags[0], 0);
        expect(scopeManager.scopedData).to.eql(data.loop_prop1);
        scopeManager.updateScopeAfter(tags[0]);

        scopeManager.updateScopeBefore(tags[1], 1);
        expect(scopeManager.scopedData).to.eql(data.loop_prop1);
        scopeManager.updateScopeAfter(tags[0]);
        
        scopeManager.updateScopeBefore(tags[2], 2);
        expect(scopeManager.scopedData).to.eql(data.loop_prop1);
        scopeManager.updateScopeAfter(tags[0]);
        
        scopeManager.updateScopeBefore(tags[3], 3);
        expect(scopeManager.scopedData).to.eql(data.loop_prop1);
        scopeManager.updateScopeAfter(tags[0]);
        
        scopeManager.updateScopeBefore(tags[4], 4);
        expect(scopeManager.scopedData).to.eql(data.loop_prop1);
        
        scopeManager.updateScopeBefore(tags[5], 5);
        expect(scopeManager.scopedData).to.eql(data.loop_prop1);

        scopeManager.updateScopeBefore(tags[6], 6);
        expect(scopeManager.scopedData).to.eql(data.loop_prop1);
    });

});