
/**
 * Wordprocessing Markup Language node names.
 */
class W {
    public readonly Paragraph = 'w:p';
    public readonly ParagraphProperties = 'w:pPr';
    public readonly Run = 'w:r';
    public readonly RunProperties = 'w:rPr';
    public readonly Text = 'w:t';
    public readonly Table = 'w:tbl';
    public readonly TableRow = 'w:tr';
    public readonly TableCell = 'w:tc';
    public readonly NumberProperties = 'w:numPr';
}

/**
 * Drawing Markup Language node names.
 *
 * These elements are part of the main drawingML namespace:
 * xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main".
 */
class A {
    public readonly Paragraph = 'a:p';
    public readonly ParagraphProperties = 'a:pPr';
    public readonly Run = 'a:r';
    public readonly RunProperties = 'a:rPr';
    public readonly Text = 'a:t';
}

/**
 * Office Markup Language (OML) node names.
 *
 * Office Markup Language is my generic term for the markup languages that are
 * used in Office Open XML documents. Including but not limited to
 * Wordprocessing Markup Language, Drawing Markup Language and Spreadsheet
 * Markup Language.
 */
export class OmlNode {

    /**
     * Wordprocessing Markup Language node names.
     */
    public static readonly W = new W();

    /**
     * Drawing Markup Language node names.
     */
    public static readonly A = new A();
}

export class OmlAttribute {
    public static readonly SpacePreserve = 'xml:space';
}