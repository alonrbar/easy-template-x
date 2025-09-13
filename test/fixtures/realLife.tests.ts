import { TemplateHandler } from "src/templateHandler";
import { describe, it } from "vitest";
import { randomParagraphs, randomWords } from "../testUtils";
import { readFixture } from "./fixtureUtils";

describe('real life fixtures', () => {

    it("handles a real life template (in Hebrew)", async () => {

        const handler = new TemplateHandler();

        const template = readFixture("real life - he.docx");

        // const data = {
        //     'תלמידים': [
        //         {
        //             'שם_התלמיד': 'אלון בר',
        //             'קבוצות': [
        //                 {
        //                     'שם_הקבוצה': 'אנגלית',
        //                     'שם_המורה': 'משה משה',
        //                     'הערכה מילולית': 'טעון שיפור'
        //                 }
        //             ]
        //         }]
        // };

        const data: any = {
            'תלמידים': [],
            'עמוד חדש': '<w:br w:type="page"/>'
        };

        const studentsCount = 3;
        const groupsCount = 3;
        for (let i = 0; i < studentsCount; i++) {
            const student: any = {
                'שם התלמיד': randomWords(),
                'קבוצות': []
            };

            for (let j = 0; j < groupsCount; j++) {
                student['קבוצות'].push({
                    'שם הקבוצה': randomWords(),
                    'שם המורה': randomWords(2),
                    'הערכה מילולית': randomParagraphs(2)
                });
            }
            data['תלמידים'].push(student);
        }

        await handler.process(template, data);

        // writeTempFile('real life - output.docx', doc);
    });
});
