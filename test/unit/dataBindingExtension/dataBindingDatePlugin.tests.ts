import {
    DataBindingDatePlugin,
    DataBindingDateContent
} from "../../../src/extensions/dataBindingExtension";
import { XmlParser, XmlNode } from "../../../src/xml";

const xmlParser: XmlParser = new XmlParser();

const rootNode = xmlParser.parse(`
<?xml version="1.0" encoding="utf-8"?>
<Data xmlns="External data">
    <Closed/>

    <Open>
    </Open>

    <Full>false</Full>
</Data>`);

describe(nameof(DataBindingDatePlugin), () => {
    describe.each(["Closed", "Open", "Full"])(
        "setting $1 tag values",
        nodeName => {
            it("sets the value", () => {
                const content: DataBindingDateContent = {
                    _type: "date",
                    value: new Date("2020-01-09T14:47:00Z")
                };

                const plugin: DataBindingDatePlugin = getPlugin(xmlParser);

                const node: XmlNode = XmlNode.findChildByName(rootNode, nodeName);

                plugin.setNodeContents(node, content);

                expect(xmlParser.serialize(node)).toEqual(
                    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><${nodeName}>2020-01-09</${nodeName}>`
                );
            });
        }
    );
});

function getPlugin(xmlParser: XmlParser): DataBindingDatePlugin {
    const plugin = new DataBindingDatePlugin();

    plugin.setUtilities({
        compiler: null,
        docxParser: null,
        xmlParser: xmlParser
    });

    return plugin;
}
