export const mockExecute = jest.fn();
export const mockGetXmlDocuments = jest.fn();

const mock = jest.fn().mockImplementation(() => {
    return {
        getXmlDocuments: null,
        execute: mockExecute
    };
});

export default mock;
