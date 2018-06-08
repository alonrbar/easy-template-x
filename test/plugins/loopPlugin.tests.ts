import * as fs from 'fs';
import { Tag } from 'src/compilation/tag';
import { LoopPlugin } from 'src/plugins';
import { XmlParser } from 'src/xmlParser';

describe(nameof(LoopPlugin), () => {

    it.skip('creates a correct clone of the relevant nodes', () => {

        const loop = new LoopPlugin();

        const template: string = fs.readFileSync("./test/res/plugins/loop plugin.xml", { encoding: 'utf8' });
        const document = new XmlParser().parse(template);
        const tags = [
            new Tag({
                xmlTextNode: document.documentElement
                    .childNodes[1] // body
                    .childNodes[1] // paragraph
                    .childNodes[5] // run
                    .childNodes[3] as Text // text node
            }),
            new Tag({
                xmlTextNode: document.documentElement
                    .childNodes[1] // body
                    .childNodes[3] // paragraph
                    .childNodes[7] // run
                    .childNodes[3] as Text // text node
            })
        ];

        loop.containerTagReplacements(0, 1, tags, {});
    });

});