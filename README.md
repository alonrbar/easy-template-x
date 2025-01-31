# easy-template-x

Generate docx documents from templates, in Node or in the browser.

[![ci](https://github.com/alonrbar/easy-template-x/actions/workflows/ci.yaml/badge.svg)](https://github.com/alonrbar/easy-template-x/actions/workflows/ci.yaml)
[![npm version](https://img.shields.io/npm/v/easy-template-x.svg)](https://www.npmjs.com/package/easy-template-x)
[![npm license](https://img.shields.io/npm/l/easy-template-x.svg)](https://www.npmjs.com/package/easy-template-x)

> ---
>
> 🚀 **Looking for a managed solution?**
>
> Check out [templatedocs.io](https://templatedocs.io) - a cloud platform for document generation with:
>
> ✓ PDF support  
> ✓ REST API integration  
> ✓ Live preview functionality  
> ✓ Easy-to-use UI  
>
> And more...
>
> ---

- [Node Example](#node-example)
- [Browser Example](#browser-example)
- [Live Demo](#live-demo)
- [Plugins](#plugins)
  - [Text plugin](#text-plugin)
  - [Loop plugin](#loop-plugin)
    - [Conditions](#conditions)
    - [Nested Conditions](#nested-conditions)
    - [Controlling loop behavior](#controlling-loop-behavior)
  - [Image plugin](#image-plugin)
  - [Link plugin](#link-plugin)
  - [Raw xml plugin](#raw-xml-plugin)
  - [Writing custom plugins](#writing-your-own-plugins)
- [Listing tags](#listing-tags)
- [Scope resolution](#scope-resolution)
- [Extensions](#extensions)
  - [Community Extensions](#community-extensions)
    - [Data Binding Extension](#data-binding-extension)
- [Template handler options](#template-handler-options)
  - [Custom tag delimiters](#custom-tag-delimiters)
  - [Advanced syntax and custom resolvers](#advanced-syntax-and-custom-resolvers)
- [Supported Binary Formats](#supported-binary-formats)
- [Internal API](#note---internal-api)
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

Checkout this [live demo](https://codesandbox.io/p/sandbox/easy-template-x-demo-x4ppu?file=%2Findex.ts) on CodeSandbox 😎

## Plugins

`easy-template-x` uses a plugin model to support it's various template manipulation capabilities. There are some built-in plugins and you can also write your own custom plugins if required.

These are the plugins that comes bundled with `easy-template-x`:

- [Simple text replacement plugin.](#text-plugin)
- [Loop plugin for iterating text, table rows and list rows and for simple conditions.](#loop-plugin)
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
Requires an opening tag that starts with `#` and a closing tag that starts with `/` ([configurable](#custom-tag-delimiters)).

**Note**: The closing tag does not need to have the same name as the opening tag, or a name at all. This will work `{#loop}{/loop}`, but also this `{#loop}{/}` and even this `{#loop}{/something else}`.

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

#### Conditions

You can render content conditionally depending on a boolean value using the same syntax used for loops.

The example below shows two lines being rendered, each with different content depending on the truthy value.

Input template:

![input template](./docs/assets/simple-condition-in.png?raw=true)

Input data:

```javascript
{
    lines: [
        { visible: true },
        { invisible: true }
    ]
}
```

Output document:

![output document](./docs/assets/simple-condition-out.png?raw=true)

#### Nested Conditions

Nested conditions are also supported, so you can nest other tags including loop tags and even other conditions in them. When doing so remember to format your data accordingly. See the example below for clarification:

Input template:

![input template](./docs/assets/nested-conditions-in.png?raw=true)

Input data:

Notice how even though `name` and `members` are nested in the template under the `show` condition their values are adjacent to it in the input data.

```javascript
{
    "teams": [
        {
            show: true,
            name: "A-Team",
            members: [
                { name: "Hannibal" },
                { name: "Face" },
                { name: "Murdock" },
                { name: "Baracus" },
            ]
        },
        {
            show: false,
            name: "B-Team",
            members: [
                { name: "Alice" },
                { name: "Bob" },
                { name: "Charlie" },
                { name: "Dave" },
            ]
        }
    ],
}
```

Output document:

![output document](./docs/assets/nested-conditions-out.png?raw=true)

_If you are looking for a yet more powerful conditional syntax see the [alternative syntax](#advanced-syntax-and-custom-resolvers) section._

#### Controlling loop behavior

To control the loop (or condition) behavior you can use the `loopOver` option.

Given this data:

```javascript
{
    students: [
        { name: "Alice" },
        { name: "Bob" }
    ]
}
```

You can use either this template:

![input template](./docs/assets/loop-over-row-in.png?raw=true)

Or this one:

![input template](./docs/assets/loop-over-content-in.png?raw=true)

The first will produce this document:

![output document](./docs/assets/loop-over-row-out.png?raw=true)

And the second will produce this one:

![output document](./docs/assets/loop-over-content-out.png?raw=true)

By default `easy-template-x` will loop over "content" if the opening and closing loop tags are in the same table cell and "row" otherwise.

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
        height: 200,
        altText: "Kung Fu Hero", // Optional
        transparencyPercent: 80 // Optional
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
        text: 'super easy',  // Optional - if not specified the `target` property will be used
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
        xml: '<w:sym w:font="Wingdings" w:char="F04A"/>',
        replaceParagraph: false,  // Optional - should the plugin replace an entire paragraph or just the tag itself
    }
}
```

Output document:

![output document](./docs/assets/rawxml-plugin-out.png?raw=true)

### Writing your own plugins

To write a plugin inherit from the [TemplatePlugin](./src/plugins/templatePlugin.ts) class.  
The base class provides two methods you can implement and a set of [utilities](./src/plugins/templatePlugin.ts) to
make it easier to do the actual xml modification.

_To better understand the internal structure of Word documents check out [this excellent source](http://officeopenxml.com/WPcontentOverview.php)._

Example plugin implementation ([source](./src/plugins/rawXml/rawXmlPlugin.ts)):

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

## Listing tags

You can get the list of [tags](https://github.com/alonrbar/easy-template-x/blob/8a88535ef090fc357cf3523411bef0d0729d10c8/src/compilation/tag.ts) in a template by calling the `parseTags` method as follows:

```typescript
import { TemplateHandler } from 'easy-template-x';

const templateFile = fs.readFileSync('myTemplate.docx');

const handler = new TemplateHandler();
const tags = await handler.parseTags(templateFile);
```

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

## Extensions

While most document manipulation can be achieved using plugins, there are some cases where a more powerful tool is required. In order to extend the document manipulation process you can specify extensions that will be run before and/or after the standard template processing.

To write an extension inherit from the [TemplateExtension](./src/extensions/templateExtension.ts) class.  

By default no extension is loaded. Extensions and the order they run in are specified via the `TemplateHandlerOptions`.

```typescript
const handler = new TemplateHandler({
    extensions: {
        afterCompilation: [
            new DataBindingExtension()
        ]
    }
});
```

### Community Extensions

The following extensions were developed by the community.  
Want to see your extension here? Submit a pull request or [open an issue](https://github.com/alonrbar/easy-template-x/issues).

#### Data Binding Extension

The [easy-template-x-data-binding](https://github.com/sebastianrogers/easy-template-x-data-binding) extension supports updating [custom XML files](https://docs.microsoft.com/en-gb/archive/blogs/modonovan/word-2007-content-controls-and-xml-part-1-the-basics) inside Word documents.

This allows using `easy-template-x` to automatically fill [Word forms](https://support.office.com/en-us/article/create-forms-that-users-complete-or-print-in-word-040c5cc1-e309-445b-94ac-542f732c8c8b) that uses content controls.

## Template handler options

You can configure the template handler behavior by passing an options object to it's constructor.

Below is the list of options along with their types and default values:

```typescript
const handler = new TemplateHandler({

    plugins: createDefaultPlugins(), // TemplatePlugin[]

    defaultContentType: TEXT_CONTENT_TYPE, // string 

    containerContentType: LOOP_CONTENT_TYPE, // string

    delimiters: { // Partial<Delimiters>
        tagStart: "{",
        tagEnd: "}",
        containerTagOpen: "#",
        containerTagClose: "/",
        tagOptionsStart: "[",
        tagOptionsEnd: "]"
    },

    maxXmlDepth: 20,

    extensions: { // ExtensionOptions
        beforeCompilation: undefined, // TemplateExtension[]
        afterCompilation: undefined // TemplateExtension[]
    },

    scopeDataResolver: undefined // ScopeDataResolver
})
```

### Custom tag delimiters

To use custom tag delimiters and container marks (used for loops and conditions) specify the `delimiters` option of the template handler.

For instance, to change from `{#open loop}` and `{/close loop}` to `{{>>open loop}}` and `{{<<close loop}}` do the following:

```typescript
const handler = new TemplateHandler({
    delimiters: {
        tagStart: "{{",
        tagEnd: "}}",
        containerTagOpen: ">>",
        containerTagClose: "<<"
    },
})
```

### Advanced syntax and custom resolvers

Custom [scope data resolvers](https://github.com/alonrbar/easy-template-x/blob/master/src/compilation/scopeData.ts#L18) gives the developer a way to hook into `easy-template-x` in order to change how it interprets the tag syntax.

For instance, to use [Angular](https://angular.io/)-like expressions you can import [easy-template-x-angular-expressions](https://github.com/alonrbar/easy-template-x-angular-expressions) by doing the following:

```typescript
import { createResolver } from "easy-template-x-angular-expressions"

const handler = new TemplateHandler({
    scopeDataResolver: createResolver()
})
```

This allows the use of advanced syntax expressions such as:

![output document](./docs/assets/angular-syntax.png?raw=true)

## Supported Binary Formats

The library supports the following binary formats:

- [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) (browser)
- [Buffer](https://nodejs.org/api/buffer.html) (node)
- [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) (browser and node)

## Note - Internal API

In addition to what's described here in the readme file the library exports many
more types and functions. While you are free to use them as you see fit please note
that anything not documented in the readme file is considered an internal
implementation detail and may break between minor versions, use at your own
risk.

## Philosophy

This library was originally developed as part of an app for non-English speaking k-12 teachers. As such it assumes the template editors do not necessarily have technical background and certainly no programming experience.

In order to stay friendly for such potential users it keeps the template syntax as simple as possible, limiting the required knowledge to `{tags}` and `{#loop tags}{/loop tags}` alone (and can be customized to support an alternative, potentially simpler syntax, such as `{>>loop tags}{<<loop tags}`).

For the same reason it supports tags with whitespace and any unicode supported alphabet such as `{שם התלמיד}` or `{اسم المعلم}`.

If your template does not need to meet such requirements, especially if they are meant to be edited by developers you can adopt a more sophisticated [alternative syntax](#advanced-syntax-and-custom-resolvers).

## Changelog

The change log can be found [here](https://github.com/alonrbar/easy-template-x/blob/master/CHANGELOG.md).
