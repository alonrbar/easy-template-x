
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
    public readonly Drawing = 'w:drawing';
    public readonly NumberProperties = 'w:numPr';
}

/**
 * Drawing Markup Language main namespace node names.
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
    public readonly Graphic = 'a:graphic';
    public readonly GraphicData = 'a:graphicData';
}

/**
 * Drawing Markup Language "wordprocessing drawing" namespace node names.
 * 
 * These elements are part of the wordprocessingDrawing namespace:
 * xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing".
 */
class Wp {
    /**
     * docPr stands for "Drawing Object Non-Visual Properties", which isn't
     * exactly a good acronym but that's how it's called nevertheless.
     */
    public readonly DocPr = 'wp:docPr';
    /**
     * Inline DrawingML Object.
     *
     * see: http://officeopenxml.com/drwPicInline.php
     */
    public readonly Inline = 'wp:inline';
    /**
     * Anchor for Floating DrawingML Object.
     * 
     * see: http://officeopenxml.com/drwPicFloating.php
     */
    public readonly FloatingAnchor = 'wp:anchor';
}

/**
 * Drawing Markup Language "picture" namespace node names.
 * 
 * These elements are part of the picture namespace:
 * xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture".
 */
class Pic {
    public readonly Pic = 'pic:pic';
    public readonly NvPicPr = 'pic:nvPicPr';
    public readonly CnVPr = 'pic:cNvPr';
    public readonly BlipFill = 'pic:blipFill';
    public readonly Blip = 'a:blip';
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
     * Drawing Markup Language main namespace node names.
     */
    public static readonly A = new A();

    /**
     * Drawing Markup Language "wordprocessing drawing" namespace node names.
     */
    public static readonly Wp = new Wp();

    /**
     * Drawing Markup Language "picture" namespace node names.
     */
    public static readonly Pic = new Pic();
}

export class OmlAttribute {
    public static readonly SpacePreserve = 'xml:space';
}