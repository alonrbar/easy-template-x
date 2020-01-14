import {
  DataBindingBooleanPlugin,
  DataBindingBooleanContent
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

describe(nameof(DataBindingBooleanPlugin), () => {
  describe.each(["Closed", "Open", "Full"])(
    "setting $1 tag values",
    nodeName => {
      it("sets the value", () => {
        const content: DataBindingBooleanContent = {
          _type: "boolean",
          value: true
        };

        const plugin: DataBindingBooleanPlugin = getPlugin(xmlParser);

        const node: XmlNode = XmlNode.findChildByName(rootNode, nodeName);

        plugin.setNodeContents(node, content);

        expect(xmlParser.serialize(node)).toEqual(
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><${nodeName}>true</${nodeName}>`
        );
      });
    }
  );
});

function getPlugin(xmlParser: XmlParser): DataBindingBooleanPlugin {
  const plugin = new DataBindingBooleanPlugin();

  plugin.setUtilities({
    compiler: null,
    docxParser: null,
    xmlParser: xmlParser
  });

  return plugin;
}
