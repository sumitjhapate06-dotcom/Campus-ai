import pdfParse from 'pdf-parse';

/**
 * Extracts clean, normalized text from a PDF Buffer
 * @param {Buffer} dataBuffer 
 * @returns {Promise<{text: string, numPages: number, info: object}>}
 */
export async function extractTextFromPDF(dataBuffer) {
  try {
    const data = await pdfParse(dataBuffer);
    
    // Normalize raw text
    let cleanText = data.text || '';
    
    // Fix hyphenated word breaks at line ends (e.g., "struct- \n ure" -> "structure")
    cleanText = cleanText.replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2');
    
    // Normalize whitespace (keep line breaks for structure detection)
    cleanText = cleanText.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ');
    
    // Remove repeated page numbers / footer headers (e.g. "Page 1 of 12")
    cleanText = cleanText.replace(/Page\s+\d+\s+of\s+\d+/gi, '');

    return {
      text: cleanText,
      numPages: data.numpages || 1,
      info: data.info || {}
    };
  } catch (err) {
    console.error('PDF Extraction Error:', err);
    throw new Error(`Failed to extract text from PDF: ${err.message}`);
  }
}
