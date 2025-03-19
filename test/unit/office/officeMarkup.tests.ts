import { officeMarkup, OfficeMarkup } from 'src/office';
import { XmlTextNode } from 'src/xml';
import { parseXml } from '../../testUtils';

describe(OfficeMarkup, () => {

    describe("modify", () => {

        describe(officeMarkup.modify.joinTextNodesRange, () => {

            test('join a range of text nodes from the same run', () => {
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
                expect(firstXmlTextNode.textContent).toEqual('1');
                const lastXmlTextNode = runNode.childNodes[2].childNodes[0] as XmlTextNode;
                expect(lastXmlTextNode.textContent).toEqual('3');

                officeMarkup.modify.joinTextNodesRange(firstXmlTextNode, lastXmlTextNode);

                expect(runNode.childNodes.length).toEqual(1);
                expect(runNode.childNodes[0].childNodes.length).toEqual(1);
                expect(runNode.childNodes[0].childNodes[0]).toEqual(firstXmlTextNode);
                expect(firstXmlTextNode.textContent).toEqual('123');
            });

            test('join a range of text nodes from three different runs', () => {
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
                expect(firstXmlTextNode.textContent).toEqual('1');
                const thirdRunNode = paragraphNode.childNodes[2];
                const lastXmlTextNode = thirdRunNode.childNodes[1].childNodes[0] as XmlTextNode;
                expect(lastXmlTextNode.textContent).toEqual('6');

                officeMarkup.modify.joinTextNodesRange(firstXmlTextNode, lastXmlTextNode);

                expect(paragraphNode.childNodes.length).toEqual(1);
                expect(firstRunNode.childNodes.length).toEqual(1);
                expect(firstRunNode.childNodes[0].childNodes.length).toEqual(1);
                expect(firstRunNode.childNodes[0].childNodes[0]).toEqual(firstXmlTextNode);
                expect(firstXmlTextNode.textContent).toEqual('123456');
            });

            test('only join nodes from the specified range', () => {
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
                expect(fromXmlTextNode.textContent).toEqual('2');

                const toRunNode = paragraphNode.childNodes[2];
                const toXmlTextNode = toRunNode.childNodes[0].childNodes[0] as XmlTextNode;
                expect(toXmlTextNode.textContent).toEqual('4');

                // modify

                officeMarkup.modify.joinTextNodesRange(fromXmlTextNode, toXmlTextNode);

                // assert

                expect(paragraphNode.childNodes.length).toEqual(3);
                expect(fromRunNode.childNodes.length).toEqual(2);
                expect(fromRunNode.childNodes[1].childNodes.length).toEqual(1);
                expect(fromRunNode.childNodes[1].childNodes[0]).toEqual(fromXmlTextNode);
                expect(fromXmlTextNode.textContent).toEqual('234');
            });

        });
    });

});
