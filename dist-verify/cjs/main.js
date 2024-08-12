const easy = require('easy-template-x');
const fs = require('fs');

async function main() {
    const templateFile = fs.readFileSync('../template.docx');
    const data = {
        "Beers": [
            { "Brand": "Carlsberg", "Price": 1 },
            { "Brand": "Leaf Blonde", "Price": 2 },
            { "Brand": "Weihenstephan", "Price": 1.5 }
        ]
    };

    const handler = new easy.TemplateHandler();
    await handler.process(templateFile, data);

    console.log('cjs verification completed successfully');
}
main();
