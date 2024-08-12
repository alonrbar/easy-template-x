import { TemplateHandler } from 'easy-template-x';
import * as fs from 'fs';

async function main() {
    const templateFile = fs.readFileSync('../template.docx');
    const data = {
        "Beers": [
            { "Brand": "Carlsberg", "Price": 1 },
            { "Brand": "Leaf Blonde", "Price": 2 },
            { "Brand": "Weihenstephan", "Price": 1.5 }
        ]
    };

    const handler = new TemplateHandler();
    await handler.process(templateFile, data);

    console.log('es verification completed successfully');
}
main();
