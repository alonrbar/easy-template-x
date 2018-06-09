import { expect } from 'chai';
import { DocxParser } from 'src/docxParser';
import { XmlTextNode } from 'src/xmlNode';
import { parseXml } from './testUtils';

describe(nameof(DocxParser), () => {

    describe(nameof(DocxParser.prototype.joinTextNodesRange), () => {

        it('joins a range of text nodes from the same run', () => {
            const paragraphNode = parseXml(`
                <w:p>
                    <w:r>
                        <w:t>{#loop</w:t>
                        <w:t>}{</w:t>
                        <w:t>/loop}</w:t>
                    </w:r>
                </w:p>
            `);
            const runNode = paragraphNode.childNodes[0];
            const firstXmlTextNode = runNode.childNodes[0].childNodes[0] as XmlTextNode;
            const secondXmlTextNode = runNode.childNodes[1].childNodes[0] as XmlTextNode;

            const parser = new DocxParser();
            parser.joinTextNodesRange(firstXmlTextNode, secondXmlTextNode);

            expect(runNode.childNodes.length).to.eql(1);
        });

    });

});