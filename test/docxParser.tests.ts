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
                        <w:t>1</w:t>
                        <w:t>2</w:t>
                        <w:t>3</w:t>
                    </w:r>
                </w:p>
            `);
            const runNode = paragraphNode.childNodes[0];
            const firstXmlTextNode = runNode.childNodes[0].childNodes[0] as XmlTextNode;
            expect(firstXmlTextNode.textContent).to.eql('1');
            const lastXmlTextNode = runNode.childNodes[2].childNodes[0] as XmlTextNode;
            expect(lastXmlTextNode.textContent).to.eql('3');

            const parser = new DocxParser();
            parser.joinTextNodesRange(firstXmlTextNode, lastXmlTextNode);

            expect(runNode.childNodes.length).to.eql(1);
            expect(runNode.childNodes[0].childNodes.length).to.eql(1);
            expect(runNode.childNodes[0].childNodes[0]).to.eql(firstXmlTextNode);
            expect(firstXmlTextNode.textContent).to.eql('123');
        });

        it('joins a range of text nodes from three different runs', () => {
            const paragraphNode = parseXml(`
                <w:p>
                    <w:r>
                        <w:t>1</w:t>
                        <w:t>2</w:t>
                        <w:t>3</w:t>
                    </w:r>
                    <w:r>
                        <w:t>4</w:t>
                    </w:r>
                    <w:r>
                        <w:t>5</w:t>
                        <w:t>6</w:t>
                    </w:r>
                </w:p>
            `);
            const firstRunNode = paragraphNode.childNodes[0];
            const firstXmlTextNode = firstRunNode.childNodes[0].childNodes[0] as XmlTextNode;
            expect(firstXmlTextNode.textContent).to.eql('1');
            const thirdRunNode = paragraphNode.childNodes[2];
            const lastXmlTextNode = thirdRunNode.childNodes[1].childNodes[0] as XmlTextNode;
            expect(lastXmlTextNode.textContent).to.eql('6');

            const parser = new DocxParser();
            parser.joinTextNodesRange(firstXmlTextNode, lastXmlTextNode);

            expect(paragraphNode.childNodes.length).to.eql(1);
            expect(firstRunNode.childNodes.length).to.eql(1);
            expect(firstRunNode.childNodes[0].childNodes.length).to.eql(1);
            expect(firstRunNode.childNodes[0].childNodes[0]).to.eql(firstXmlTextNode);
            expect(firstXmlTextNode.textContent).to.eql('123456');
        });

        it('does not join nodes from outside the specified range', () => {
            const paragraphNode = parseXml(`
                <w:p>
                    <w:r>
                        <w:t>0</w:t>
                    </w:r>
                    <w:r>
                        <w:t>1</w:t>
                        <w:t>2</w:t>
                        <w:t>3</w:t>
                    </w:r>
                    <w:r>
                        <w:t>4</w:t>
                    </w:r>
                    <w:r>
                        <w:t>5</w:t>
                        <w:t>6</w:t>
                    </w:r>
                </w:p>
            `);
            
            const fromRunNode = paragraphNode.childNodes[1];
            const fromXmlTextNode = fromRunNode.childNodes[1].childNodes[0] as XmlTextNode;
            expect(fromXmlTextNode.textContent).to.eql('2');

            const toRunNode = paragraphNode.childNodes[2];
            const toXmlTextNode = toRunNode.childNodes[0].childNodes[0] as XmlTextNode;
            expect(toXmlTextNode.textContent).to.eql('4');

            // parse

            const parser = new DocxParser();
            parser.joinTextNodesRange(fromXmlTextNode, toXmlTextNode);

            // assert

            expect(paragraphNode.childNodes.length).to.eql(3);
            expect(fromRunNode.childNodes.length).to.eql(2);
            expect(fromRunNode.childNodes[1].childNodes.length).to.eql(1);
            expect(fromRunNode.childNodes[1].childNodes[0]).to.eql(fromXmlTextNode);
            expect(fromXmlTextNode.textContent).to.eql('234');
        });

    });

});