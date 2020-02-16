import { TemplateHandler } from 'src/templateHandler';
import { readFixture } from './fixtureUtils';

describe('custom delimiters', () => {

    it("process correctly a template with custom tag and container delimiters", async () => {

        const handler = new TemplateHandler({
            delimiters: {
                tagStart: '{{',
                tagEnd: '}}',
                containerTagOpen: '>>',
                containerTagClose: '<<'
            }
        });

        const template = readFixture("custom delimiters.docx");
        const data = {
            "@New Page": {
                _type: 'rawXml',
                xml: '<w:br w:type="page"/>'
            },
            Students: [
                {
                    "Student Name": "Alon Bar",
                    Groups: [
                        {
                            "Group Name": "Math",
                            "Evaluation: Grade": 100,
                            "Evaluation: Teacher Comments": "Very good!"
                        },
                        {
                            "Group Name": "English",
                            "Evaluation: Grade": 95,
                            "Evaluation: Teacher Comments": "Great!"
                        }
                    ]
                },
                {
                    "Student Name": "David Blum",
                    Groups: [
                        {
                            "Group Name": "Math",
                            "Evaluation: Grade": 99,
                            "Evaluation: Teacher Comments": "Consequuntur magni sit officia."
                        },
                        {
                            "Group Name": "English",
                            "Evaluation: Grade": 98,
                            "Evaluation: Teacher Comments": "Commodi alias in."
                        }
                    ]
                }
            ]
        };

        const doc = await handler.process(template, data);

        const docXml = await handler.getXml(doc);
        expect(docXml).toMatchSnapshot();

        // writeTempFile('custom delimiters - output.docx', doc);
    });
});
