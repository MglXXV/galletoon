declare module 'pdfinfo' {
  /**
   * Interface for PDF information returned by pdfinfo
   */
  interface PdfInfo {
    /** The total number of pages in the PDF */
    pages: number;
    /** The title of the PDF document */
    title?: string;
    /** The creator of the PDF document */
    creator?: string;
    /** The producer of the PDF document */
    producer?: string;
    /** Whether the PDF is encrypted */
    encrypted?: boolean;
    /** Page size information (e.g., "612 x 792 pts (letter)") */
    pageSize?: string;
    /** PDF file size in bytes */
    fileSize?: number;
    /** PDF version */
    pdfVersion?: string;
    /** Other metadata properties */
    [key: string]: any;
  }

  /**
   * Extracts metadata from a PDF file
   * @param filePath Path to the PDF file
   * @returns Promise that resolves with the PDF information
   */
  function pdfinfo(filePath: string): Promise<PdfInfo>;

  export = pdfinfo;
}
