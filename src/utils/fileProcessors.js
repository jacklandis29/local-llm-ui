import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Process a text file
 */
async function processTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        content: e.target.result,
        metadata: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          processedAt: new Date().toISOString(),
        }
      });
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Process a PDF file
 */
async function processPDFFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    const numPages = pdf.numPages;

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
    }

    return {
      content: fullText.trim(),
      metadata: {
        fileName: file.name,
        fileType: 'application/pdf',
        fileSize: file.size,
        pageCount: numPages,
        processedAt: new Date().toISOString(),
      }
    };
  } catch (error) {
    throw new Error(`Failed to process PDF: ${error.message}`);
  }
}

/**
 * Process a DOCX file
 */
async function processDOCXFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    return {
      content: result.value,
      metadata: {
        fileName: file.name,
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        fileSize: file.size,
        processedAt: new Date().toISOString(),
      }
    };
  } catch (error) {
    throw new Error(`Failed to process DOCX: ${error.message}`);
  }
}

/**
 * Process an image file (placeholder for vision model integration)
 */
async function processImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        content: '[Image file - requires vision model for analysis]',
        imageData: e.target.result,
        metadata: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          processedAt: new Date().toISOString(),
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Main file processor - routes to appropriate handler
 */
export async function processFile(file) {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    // PDF files
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await processPDFFile(file);
    }

    // DOCX files
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
      return await processDOCXFile(file);
    }

    // Image files (for future vision model support)
    if (fileType.startsWith('image/')) {
      return await processImageFile(file);
    }

    // Text-based files
    if (
      fileType.startsWith('text/') ||
      fileName.endsWith('.txt') ||
      fileName.endsWith('.md') ||
      fileName.endsWith('.markdown') ||
      fileName.endsWith('.json') ||
      fileName.endsWith('.js') ||
      fileName.endsWith('.jsx') ||
      fileName.endsWith('.ts') ||
      fileName.endsWith('.tsx') ||
      fileName.endsWith('.py') ||
      fileName.endsWith('.java') ||
      fileName.endsWith('.c') ||
      fileName.endsWith('.cpp') ||
      fileName.endsWith('.cs') ||
      fileName.endsWith('.go') ||
      fileName.endsWith('.rs') ||
      fileName.endsWith('.rb') ||
      fileName.endsWith('.php') ||
      fileName.endsWith('.html') ||
      fileName.endsWith('.css') ||
      fileName.endsWith('.xml') ||
      fileName.endsWith('.yaml') ||
      fileName.endsWith('.yml') ||
      fileName.endsWith('.toml')
    ) {
      return await processTextFile(file);
    }

    throw new Error(`Unsupported file type: ${fileType || 'unknown'}`);
  } catch (error) {
    console.error('File processing error:', error);
    throw error;
  }
}

/**
 * Get supported file types
 */
export function getSupportedFileTypes() {
  return {
    documents: ['.pdf', '.docx', '.txt', '.md'],
    code: ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.cs', '.go', '.rs', '.rb', '.php'],
    data: ['.json', '.xml', '.yaml', '.yml', '.toml', '.csv'],
    web: ['.html', '.css'],
    images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  };
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename) {
  const parts = filename.split('.');
  return parts.length > 1 ? '.' + parts.pop().toLowerCase() : '';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
