import * as fs from 'fs/promises';
import * as path from 'path';
import JSZip from 'jszip';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

try {
    await main();
} catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
}

async function main(): Promise<void> {
    console.log("");

    const args = process.argv.slice(2);
    if (args.length !== 1) {
        console.error('Usage: node prepare_for_compare.ts <folder_name>');
        console.error('Example: node prepare_for_compare.ts ./documents');
        process.exit(1);
    }

    const folderPath = args[0];
    console.log(`Processing folder: ${folderPath}`);

    // List docx files
    const docxFiles = await listDocxFiles(folderPath);
    if (docxFiles.length === 0) {
        console.log('No DOCX files found in the specified folder.');
        return;
    }
    console.log(`Found ${docxFiles.length} DOCX file(s):`);
    docxFiles.forEach(file => console.log(`  - ${file}`));

    // Extract docx files
    const outputFolders: string[] = [];
    for (const docxFile of docxFiles) {

        // Get docx file path
        const docxPath = path.join(folderPath, docxFile);
        const outputFolderName = path.basename(docxFile, '.docx');
        const outputFolderPath = path.join(folderPath, outputFolderName);

        // Extract docx file as zip
        console.log(`\nExtracting: ${docxFile} -> ${outputFolderName}`);
        await extractZipFile(docxPath, outputFolderPath);

        outputFolders.push(outputFolderPath);
        console.log(`✓ Successfully extracted to: ${outputFolderPath}`);
    }

    // Prettify extracted XML files
    console.log('\nPrettifying XML files...');
    for (const outputFolder of outputFolders) {
        await prettifyXmlFilesInFolder(outputFolder);
    }

    console.log('\n✓ All operations completed!');
}

async function listDocxFiles(folderPath: string): Promise<string[]> {

    const entries = await fs.readdir(folderPath, { withFileTypes: true });

    const docxFiles = entries
        .filter(entry => entry.isFile())
        .filter(entry => path.extname(entry.name).toLowerCase() === '.docx')
        .map(entry => entry.name);

    return docxFiles;
}

async function extractZipFile(zipPath: string, outputDir: string): Promise<void> {
    const fileContent = await fs.readFile(zipPath);
    const zip = await JSZip.loadAsync(fileContent);

    // Create root output folder
    await fs.mkdir(outputDir, { recursive: true });

    // Extract all files
    const files = Object.keys(zip.files);
    for (const fileName of files) {
        const file = zip.files[fileName];
        if (file.dir) {
            continue;
        }

        // Read content
        const content = await file.async('uint8array');
        const filePath = path.join(outputDir, fileName);

        // Make folder for nested files
        const dir = path.join(outputDir, fileName.split('/').slice(0, -1).join('/'));
        if (dir !== outputDir) {
            await fs.mkdir(dir, { recursive: true });
        }

        // Write file
        await fs.writeFile(filePath, content);
    }
}

async function prettifyXmlFilesInFolder(dir: string): Promise<void> {

    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Recursive call
        if (entry.isDirectory()) {
            await prettifyXmlFilesInFolder(fullPath);
            continue;
        }

        if (!entry.isFile()) {
            continue;
        }

        // Prettify xml file
        const ext = path.extname(entry.name).toLowerCase();
        if (ext === '.xml' || ext === '.rels' || ext === '.xml.rels') {
            await prettifyXmlFile(fullPath);
            console.log(`Prettified: ${fullPath}`);
        }
    }
}

async function prettifyXmlFile(xmlPath: string): Promise<void> {
    const parser = new DOMParser();
    const serializer = new XMLSerializer();

    const content = await fs.readFile(xmlPath, 'utf-8');
    const doc = parser.parseFromString(content, 'text/xml');
    const xml = serializer.serializeToString(doc);

    // Add line breaks and indentation for better readability
    const prettyXml = xml
        .replace(/></g, '>\n<')
        .replace(/^</gm, '  <')
        .replace(/^<\?xml/g, '<?xml');

    await fs.writeFile(xmlPath, prettyXml, 'utf-8');
}
