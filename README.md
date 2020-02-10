# easy-template-x

Generate docx documents from templates, in Node or in the browser.

[![CircleCI](https://circleci.com/gh/alonrbar/easy-template-x.svg?style=shield)](https://circleci.com/gh/alonrbar/easy-template-x)
[![npm version](https://img.shields.io/npm/v/easy-template-x.svg)](https://www.npmjs.com/package/easy-template-x)
[![npm license](https://img.shields.io/npm/l/easy-template-x.svg)](https://www.npmjs.com/package/easy-template-x)
[![dependencies](https://david-dm.org/alonrbar/easy-template-x.svg)](https://github.com/alonrbar/easy-template-x)

- [Node Example](#node-example)
- [Browser Example](#browser-example)
- [Live Demo](#live-demo)
- [Standard plugins](#standard-plugins)
  - [Text plugin](#text-plugin)
  - [Loop plugin](#loop-plugin)
  - [Image plugin](#image-plugin)
  - [Link plugin](#link-plugin)
  - [Raw xml plugin](#raw-xml-plugin)
- [Scope resolution](#scope-resolution)
- [Writing your own plugins](#writing-your-own-plugins)
- [Advanced API](#advanced-api)
- [Supported Binary Formats](#supported-binary-formats)
- [Philosophy](#philosophy)
- [Prior art and motivation](#prior-art-and-motivation)
- [Changelog](#changelog)

## Node Example

```typescript
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

```typescript
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

## Live Demo

Checkout this [live demo](https://codesandbox.io/s/easy-template-x-demo-x4ppu?fontsize=14&module=%2Findex.ts) on CodeSandbox 😎

## Standard plugins

`easy-template-x` comes bundled with several plugins:

- [Simple text replacement plugin.](#text-plugin)
- [Loop plugin for iterating text, table rows and list rows.](#loop-plugin)
- [Image plugin for embedding images.](#image-plugin)
- [Link plugin for hyperlinks creation.](#link-plugin)
- [Raw xml plugin for custom xml insertion.](#raw-xml-plugin)

### Text plugin

The most basic plugin. Replaces a single tag with custom text. Preserves the original text style.

Input template:

![input template](./docs/assets/text-plugin-in.png?raw=true)

Input data:

```json
{
    "First Tag": "Quis et ducimus voluptatum\nipsam id.",
    "Second Tag": "Dolorem sit voluptas magni dolorem molestias."
}
```

Output document:

![output document](./docs/assets/text-plugin-out.png?raw=true)

### Loop plugin

Iterates text, table rows and lists.  
Requires an opening tag that starts with `#` and a closing tag that has the same
name and starts with `/`.

Input template:

![input template](./docs/assets/loop-plugin-in.png?raw=true)

Input data:

```json
{
    "Beers": [
        { "Brand": "Carlsberg", "Price": 1 },
        { "Brand": "Leaf Blonde", "Price": 2 },
        { "Brand": "Weihenstephan", "Price": 1.5 }
    ]
}
```

Output document:

![output document](./docs/assets/loop-plugin-out.png?raw=true)

### Image plugin

Embed images into the document.

Input template:

![input template](./docs/assets/image-plugin-in.png?raw=true)

Input data:

```javascript
{
    "Kung Fu Hero": {
        _type: "image",
        source: fs.readFileSync("hero.png"),
        format: MimeType.Png,
        width: 200,
        height: 200
    }
}
```

Output document:

![output document](./docs/assets/image-plugin-out.png?raw=true)

### Link plugin

Inserts hyperlinks into the document.  
Like text tags link tags also preserve their original style.

Input template:

![input template](./docs/assets/link-plugin-in.png?raw=true)

Input data:

```javascript
{
    "easy": {
        _type: 'link',
        text: 'super easy',  // optional - if not specified the `target` property will be used
        target: 'https://github.com/alonrbar/easy-template-x'
    }
}
```

Output document:

![output document](./docs/assets/link-plugin-out.png?raw=true)

### Raw xml plugin

Add custom xml into the document to be interpreted by Word.

**Tip**:  
You can add page breaks using this plugin and the following xml markup:  
`<w:br w:type="page"/>`

Input template:

![input template](./docs/assets/rawxml-plugin-in.png?raw=true)

Input data:

```javascript
{
    "Dont worry be happy": {
        _type: 'rawXml',
        xml: '<w:sym w:font="Wingdings" w:char="F04A"/>'
    }
}
```

Output document:

![output document](./docs/assets/rawxml-plugin-out.png?raw=true)

## Scope resolution

`easy-template-x` supports tag data scoping. That is, you can reference
"shallow" data from within deeper in the hierarchy similarly to how you can
reference an outer scope variables from within a function in JavaScript. You can
leverage this property to declare "top level" data (your logo and company name
or some useful xml snippets like page breaks, etc.) to be used anywhere in the
document.

Input template:

(notice that we are using the "Company" tag inside the "Employees" loop)

![input template](./docs/assets/scope-in.png?raw=true)

Input data:

(notice that the "Company" data is declared outside the "Employees" loop, in it's so
called "outer scope")

```javascript
{
    "Company": "Contoso Ltd.",
    "Employees": [
        { "Surname": "Gates", "Given name": "William" },
        { "Surname": "Nadella", "Given name": "Satya" },
    ]
}
```

Output document:

![output document](./docs/assets/scope-out.png?raw=true)

## Writing your own plugins

To write a plugin inherit from the [TemplatePlugin](./src/plugins/templatePlugin.ts) class.  
The base class provides two methods you can implement and a set of [utilities](./src/plugins/templatePlugin.ts) to
make it easier to do the actual xml modification.

_To better understand the internal structure of Word documents check out [this excellent source](http://officeopenxml.com/WPcontentOverview.php)._

Example plugin implementation ([source](./src/plugins/rawXmlPlugin.ts)):

```typescript
/**
 * A plugin that inserts raw xml to the document.
 */
export class RawXmlPlugin extends TemplatePlugin {

    // Declare the unique "content type" this plugin handles
    public readonly contentType = 'rawXml';

    // Plugin logic goes here:
    public simpleTagReplacements(tag: Tag, data: ScopeData): void {

        // Tag.xmlTextNode always reference the actual xml text node.
        // In MS Word each text node is wrapped by a <w:t> node so we retrieve that.
        const wordTextNode = this.utilities.docxParser.containingTextNode(tag.xmlTextNode);

        // Get the value to use from the input data.
        const value = data.getScopeData() as RawXmlContent;
        if (value && typeof value.xml === 'string') {

            // If it contains a "xml" string property parse it and insert.
            const newNode = this.utilities.xmlParser.parse(value.xml);
            XmlNode.insertBefore(newNode, wordTextNode);
        }

        // Remove the placeholder node.
        // We can be sure that only the placeholder is removed since easy-template-x
        // makes sure that each tag is isolated into it's own separate <w:t> node.
        XmlNode.remove(wordTextNode);
    }
}
```

The content type that this plugin expects to see is:

```typescript
export interface RawXmlContent extends PluginContent {
    _type: 'rawXml';
    xml: string;
}
```

## Advanced API

You'll usually just use the `TemplateHandler` as seen in the examples but if you
want to implement a custom plugin or otherwise do some advanced work yourself
checkout the [typings](./dist/types/index.d.ts) file. Do note however that while the
advanced API is mostly documented in the typings file it's still considered an
internal implementation detail and may break between minor versions, use at your
own risk.

## Supported Binary Formats

The library supports the following binary formats:

- [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) (browser)
- [Buffer](https://nodejs.org/api/buffer.html) (node)
- [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) (browser and node)

## Philosophy

The main principal the package aspire to adhere to is **being simple and easy**.  
It tries to keep it simple and has the following priorities in mind:

1. Easy for the **end user** who writes the templates.
2. Easy for the **developer** who process them using the exposed APIs.
3. Easy for the **maintainer/contributor** who maintain the `easy-template-x` package itself.

## Extensions

Although most document manipulation can be achieved by using plugins, developing your
own if required there are some that cannot.

- [Content Controls](http://www.datypic.com/sc/ooxml/e-w_sdtContent-2.html) have highly formatted XML that does not look like text
- [Data Binding](https://blogs.msdn.microsoft.com/modonovan/2006/05/22/word-2007-content-controls-and-xml-part-1-the-basics/) stores its data in files other than the base word files.

In order to extend document processing you can specify extensions that will be run after the standard template processing.

By default no extensions will be loaded.

To specify the desired extensions, the order they run in and the extension specific plugins they will use use TemplateHandlerOptions.

```typescript
const handler = new TemplateHandler(
  new TemplateHandlerOptions({
    extensions: [
      new ContentControlExtension(createDefaultContentControlPlugins()),
      new DataBindingExtension(createDefaultDataBindingPlugins())
    ]
  });
);
```

## Prior art and motivation

There are already some very good templating libraries out there, most notably these two:

- [docxtemplater](https://github.com/open-xml-templating/docxtemplater)
- [docx-templates](https://github.com/guigrpa/docx-templates)

`easy-template-x` takes great inspiration from both. It aspires to take the best
out of both and to add some good of it's own.

While these packages has some great features such as GraphQL and inline
JavaScript support in `docx-templates` and a breadth of additional (payed)
modules in `docxtemplater`. This package, in accordance with it's declared above
philosophy, offers some unique benefits including a most simple, non-programmer
oriented template syntax, an even neater API (IMHO 😄), a _free_ image insertion
plugin and a TypeScript code base. Hopefully it will serve you well :)

## Changelog

The change log can be found [here](https://github.com/alonrbar/easy-template-x/blob/master/CHANGELOG.md).
