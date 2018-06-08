import * as fs from 'fs';
import { Tag } from 'src/compilation/tag';
import { LoopPlugin } from 'src/plugins';
import { XmlTextNode } from 'src/xmlNode';
import { XmlParser } from 'src/xmlParser';

describe(nameof(LoopPlugin), () => {

    it.skip('creates a correct clone of the relevant nodes', () => {

        const loop = new LoopPlugin();

        const template: string = fs.readFileSync("./test/res/plugins/loop plugin.xml", { encoding: 'utf8' });
        const root = new XmlParser().parse(template);
        const tags = [
            new Tag({
                xmlTextNode: root
                    .childNodes[1] // body
                    .childNodes[1] // paragraph
                    .childNodes[5] // run
                    .childNodes[3] as XmlTextNode // text node
            }),
            new Tag({
                xmlTextNode: root
                    .childNodes[1] // body
                    .childNodes[3] // paragraph
                    .childNodes[7] // run
                    .childNodes[3] as XmlTextNode // text node
            })
        ];

        loop.containerTagReplacements(0, 1, tags, {});
    });

});