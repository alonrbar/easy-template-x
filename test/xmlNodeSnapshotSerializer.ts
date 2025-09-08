import { XmlNodeType, xml } from 'src/xml';
import type { SnapshotSerializer } from 'vitest';

// add XmlNode snapshot serializer
// (otherwise simple image markup snapshot takes more than 100MB!)
const serializer: SnapshotSerializer = {

    test(value) {
        // check that 'value' is an XmlNode
        return value &&
            value.nodeName &&
            value.nodeType &&
            (value.nodeType === XmlNodeType.General || value.nodeType === XmlNodeType.Text);
    },

    print(value) {
        return xml.parser.serializeNode(value as any);
    },
};

export default serializer;
