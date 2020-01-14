import {
    ContentControlCheckBoxPlugin,
    ContentControlCheckBoxContent
} from "../../../src/extensions/contentControlExtension";
import { XmlParser, XmlNode } from "../../../src/xml";
import { DocxParser } from "src";

describe(nameof(ContentControlCheckBoxPlugin), () => {
    it("checks a checked check box", () => {
        const xmlParser: XmlParser = new XmlParser();
        const initialState: XmlNode = getState(xmlParser, 1, "☒");
        const expectedState: XmlNode = getState(xmlParser, 1, "☒");
        const content: ContentControlCheckBoxContent = {
            _type: "checkBox",
            checked: true
        };

        const plugin: ContentControlCheckBoxPlugin = getPlugin(xmlParser);

        const structuredDocumentTagNode = XmlNode.findChildByName(
            initialState,
            DocxParser.STRUCTURED_DOCUMENT_TAG_NODE
        );

        plugin.setNodeContents(structuredDocumentTagNode, content);

        expect(xmlParser.serialize(initialState)).toEqual(
            xmlParser.serialize(expectedState)
        );
    });

    it("checks an unchecked check box", () => {
        const xmlParser: XmlParser = new XmlParser();
        const initialState: XmlNode = getState(xmlParser, 0, "☐");
        const expectedState: XmlNode = getState(xmlParser, 1, "☒");
        const content: ContentControlCheckBoxContent = {
            _type: "checkBox",
            checked: true
        };

        const plugin: ContentControlCheckBoxPlugin = getPlugin(xmlParser);

        const structuredDocumentTagNode = XmlNode.findChildByName(
            initialState,
            DocxParser.STRUCTURED_DOCUMENT_TAG_NODE
        );

        plugin.setNodeContents(structuredDocumentTagNode, content);

        expect(xmlParser.serialize(initialState)).toEqual(
            xmlParser.serialize(expectedState)
        );
    });

    it("unchecks a checked check box", () => {
        const xmlParser: XmlParser = new XmlParser();
        const initialState: XmlNode = getState(xmlParser, 1, "☒");
        const expectedState: XmlNode = getState(xmlParser, 0, "☐");
        const content: ContentControlCheckBoxContent = {
            _type: "checkBox",
            checked: false
        };

        const plugin: ContentControlCheckBoxPlugin = getPlugin(xmlParser);

        const structuredDocumentTagNode = XmlNode.findChildByName(
            initialState,
            DocxParser.STRUCTURED_DOCUMENT_TAG_NODE
        );

        plugin.setNodeContents(structuredDocumentTagNode, content);

        expect(xmlParser.serialize(initialState)).toEqual(
            xmlParser.serialize(expectedState)
        );
    });

    it("unchecks an unchecked check box", () => {
        const xmlParser: XmlParser = new XmlParser();
        const initialState: XmlNode = getState(xmlParser, 0, "☐");
        const expectedState: XmlNode = getState(xmlParser, 0, "☐");
        const content: ContentControlCheckBoxContent = {
            _type: "checkBox",
            checked: false
        };

        const plugin: ContentControlCheckBoxPlugin = getPlugin(xmlParser);

        const structuredDocumentTagNode = XmlNode.findChildByName(
            initialState,
            DocxParser.STRUCTURED_DOCUMENT_TAG_NODE
        );

        plugin.setNodeContents(structuredDocumentTagNode, content);

        expect(xmlParser.serialize(initialState)).toEqual(
            xmlParser.serialize(expectedState)
        );
    });
});

function getState(
    xmlParser: XmlParser,
    val: number,
    character: string
): XmlNode {
    return xmlParser.parse(`                    
    <w:p w14:paraId="1FB98982" w14:textId="340DB12D" w:rsidR="000F0D29" w:rsidRPr="002B620F" w:rsidRDefault="00E37889" w:rsidP="007E487F">
        <w:pPr>
            <w:rPr>
                <w:rFonts w:ascii="Arial" w:eastAsia="Times New Roman" w:hAnsi="Arial" w:cs="Arial"/>
                <w:sz w:val="20"/>
                <w:szCs w:val="20"/>
                <w:lang w:eastAsia="en-GB"/>
            </w:rPr>
        </w:pPr>
        <w:sdt>
            <w:sdtPr>
                <w:rPr>
                    <w:rFonts w:ascii="Arial" w:eastAsia="Times New Roman" w:hAnsi="Arial" w:cs="Arial"/>
                    <w:sz w:val="18"/>
                    <w:szCs w:val="18"/>
                    <w:lang w:eastAsia="en-GB"/>
                </w:rPr>
                <w:id w:val="-1585826254"/>
                <w:dataBinding w:prefixMappings="xmlns:ns0='CABHAS - Citations 1.1' " w:xpath="/ns0:Citation[1]/ns0:Age_Not_Known__c[1]" w:storeItemID="{FADB3A06-0A92-422A-9AC7-B5E851796500}"/>
                <w14:checkbox>
                    <w14:checked w14:val="${val}"/>
                    <w14:checkedState w14:val="2612" w14:font="MS Gothic"/>
                    <w14:uncheckedState w14:val="2610" w14:font="MS Gothic"/>
                </w14:checkbox>
            </w:sdtPr>
            <w:sdtEndPr/>
            <w:sdtContent>
                <w:r w:rsidR="00D91CD8">
                    <w:rPr>
                        <w:rFonts w:ascii="MS Gothic" w:eastAsia="MS Gothic" w:hAnsi="MS Gothic" w:cs="Arial" w:hint="eastAsia"/>
                        <w:sz w:val="18"/>
                        <w:szCs w:val="18"/>
                        <w:lang w:eastAsia="en-GB"/>
                    </w:rPr>
                    <w:t>
                        ${character}
                    </w:t>
                </w:r>
            </w:sdtContent>
        </w:sdt>
        <w:r w:rsidR="000F0D29">
            <w:rPr>
                <w:rFonts w:ascii="Arial" w:eastAsia="Times New Roman" w:hAnsi="Arial" w:cs="Arial"/>
                <w:sz w:val="18"/>
                <w:szCs w:val="18"/>
                <w:lang w:eastAsia="en-GB"/>
            </w:rPr>
            <w:t xml:space="preserve"> Age not known</w:t>
        </w:r>
    </w:p>
`);
}

function getPlugin(xmlParser: XmlParser): ContentControlCheckBoxPlugin {
    const plugin = new ContentControlCheckBoxPlugin();
    plugin.setUtilities({
        compiler: null,
        docxParser: null,
        xmlParser: xmlParser
    });

    return plugin;
}
