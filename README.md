# easy-template-x

Generate docx documents from templates, in Node or in the browser.

- [Prior art and motivation](#prior-art-and-motivation)
- [Short Example](#short-example)
- [Writing your own plugins](#writing-your-own-plugins)
- [API](#api)
- [Limitations](#limitations)
- [Changelog](#changelog)

## Prior art and motivation

There are already some very good templating libraries out there, most notably these two:

- [docxtemplater](https://github.com/open-xml-templating/docxtemplater)
- [docx-templates](https://github.com/guigrpa/docx-templates)

`easy-template-x` takes great inspiration from both. It aspires to take the best
out of both and to support some usecases that are not supported by either.
Specifically, it keeps the ease of use that `docxtemplater` provides to the end
user and adds _line break auto insertion_ which is currently missing there.

Internally it works more like `docx-templates` than `docxtemplater` in that
sense that it traverses xml documents node by node in a strongly typed manner rather than
using a text matching approach.

It was also inspired by `docxtemplater` modules system and introduces a similar
**plugins system**. The main difference in that area is that the library is fully written
in **TypeScript** and the code base provides a lot of comments and explanation
inside, thus making it as easy as possible to write your own custom plugins.

## Short Example

Below is a Node example but the library works on the browser as well.

```javascript
import { TemplateHandler } from 'easy-template-x';

const templateFile = fs.readFileSync('myTemplate.docx');

const data = {
    posts: [
        { author: 'Alon Bar', text: 'Very important\ntext here!' },
        { author: 'Alon Bar', text: 'Forgot to mention that...' }
    ]
};

const handler = new TemplateHandler();
const doc = await handler.process(templateFile, data);

fs.writeFileSync('myTemplate - output.docx', doc);
```

Input:

![input template](./docs/assets/template-in.png?raw=true)

Output:

![output document](./docs/assets/template-out.png?raw=true)

## Writing your own plugins

To write a plugin inherit from the [TemplatePlugin](./src/plugins/templatePlugin.ts) class.  
The base class provides two methods you can implement and a set of [utilities](./src/plugins/templatePlugin.ts) to
make it easier to do the actual xml modification.

Example plugin implementation ([source](./src/plugins/rawXmlPlugin.ts)):

```javascript
/**
 * A plugin that inserts raw xml to the document.
 */
export class RawXmlPlugin extends TemplatePlugin {

    // Declare your prefix:
    // This plugin replaces tags that starts with a @ sign.
    // For instance {@my-tag}
    public readonly prefixes: TagPrefix[] = [{
        prefix: '@',
        tagType: 'rawXml',
        tagDisposition: TagDisposition.SelfClosed
    }];

    // Plugin logic goes here:
    public simpleTagReplacements(tag: Tag, data: ScopeData): void {

        // Tag.xmlTextNode always reference the actual xml text node.
        // In MS Word each text node is wrapped by a <w:t> node so we retrieve that.
        const wordTextNode = this.utilities.docxParser.containingTextNode(tag.xmlTextNode);

        // Get the value to use from the input data.
        const value = data.getScopeData();
        if (typeof value === 'string') {

            // If it's a string parse it as xml and insert.
            const newNode = this.utilities.xmlParser.parse(value);
            XmlNode.insertBefore(newNode, wordTextNode);
        }

        // Remove the placeholder node.
        // We can be sure that only the placeholder is removed since easy-template-x
        // makes sure that each tag is isolated into it's own separate <w:t> node.
        XmlNode.remove(wordTextNode);
    }
}
```

## API

TODO

## Limitations

Iterating table rows is currently not supported. Feel free to write your own plugin for that ;)

## Changelog

The change log can be found [here](https://github.com/alonrbar/easy-template-x/blob/master/CHANGELOG.md).