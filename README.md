# easy-template-x

Generate docx documents from templates, in Node or in the browser.

[![CircleCI](https://circleci.com/gh/alonrbar/easy-template-x.svg?style=shield)](https://circleci.com/gh/alonrbar/easy-template-x)
[![npm version](https://img.shields.io/npm/v/easy-template-x.svg)](https://www.npmjs.com/package/easy-template-x)
[![npm license](https://img.shields.io/npm/l/easy-template-x.svg)](https://www.npmjs.com/package/easy-template-x)
[![dependencies](https://david-dm.org/alonrbar/easy-template-x.svg)](https://github.com/alonrbar/easy-template-x)

- [Prior art and motivation](#prior-art-and-motivation)
- [Node Example](#node-example)
- [Browser Example](#browser-example)
- [Writing your own plugins](#writing-your-own-plugins)
- [API](#api)
- [Binary Formats](#binary-formats)
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

## Node Example

```javascript
import * as fs from 'fs';
import { TemplateHandler } from 'easy-template-x';

// 1. read template file
const templateFile = fs.readFileSync('myTemplate.docx');

// 2. process the template
const data = {
    posts: [
        { author: 'Alon Bar', text: 'Very important\ntext here!' },
        { author: 'Alon Bar', text: 'Forgot to mention that...' }
    ]
};

const handler = new TemplateHandler();
const doc = await handler.process(templateFile, data);

// 3. save output
fs.writeFileSync('myTemplate - output.docx', doc);
```

Input:

![input template](./docs/assets/template-in.png?raw=true)

Output:

![output document](./docs/assets/template-out.png?raw=true)

## Browser Example

The following example produces the same output while running in the browser.
Notice that the actual template processing (step 2) is exactly the same as in the previous Node example.

```javascript
import { TemplateHandler } from 'easy-template-x';

// 1. read template file

// (in this example we're loading the template by performing  
//  an AJAX call using the fetch API, another common way to  
//  get your hand on a Blob is to use an HTML File Input)
const response = await fetch('http://somewhere.com/myTemplate.docx');
const templateFile = await response.blob();

// 2. process the template
const data = {
    posts: [
        { author: 'Alon Bar', text: 'Very important\ntext here!' },
        { author: 'Alon Bar', text: 'Forgot to mention that...' }
    ]
};

const handler = new TemplateHandler();
const doc = await handler.process(templateFile, data);

// 3. save output
saveFile('myTemplate - output.docx', doc);

function saveFile(filename, blob) {

    // see: https://stackoverflow.com/questions/19327749/javascript-blob-filename-without-link

    // get downloadable url from the blob
    const blobUrl = URL.createObjectURL(blob);

    // create temp link element
    let link = document.createElement("a");
    link.download = filename;
    link.href = blobUrl;

    // use the link to invoke a download
    document.body.appendChild(link);
    link.click();

    // remove the link
    setTimeout(() => {
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
        link = null;
    }, 0);
}
```

## Writing your own plugins

To write a plugin inherit from the [TemplatePlugin](./src/plugins/templatePlugin.ts) class.  
The base class provides two methods you can implement and a set of [utilities](./src/plugins/templatePlugin.ts) to
make it easier to do the actual xml modification.

_To better understand the internal structure of Word documents check out [this excellent source](http://officeopenxml.com/WPcontentOverview.php)._

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

TODO - Meanwhile, you can checkout the [typings](./dist/index.d.ts) file.

## Binary Formats

The library supports the following binary formats:

- [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) (browser)
- [Buffer](https://nodejs.org/api/buffer.html) (node)
- [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) (browser and node)

## Changelog

The change log can be found [here](https://github.com/alonrbar/easy-template-x/blob/master/CHANGELOG.md).