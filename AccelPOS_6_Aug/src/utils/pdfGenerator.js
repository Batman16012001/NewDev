export class PDFGenerator {
  constructor() {
    this.instance = null;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new PDFGenerator();
    }
    return this.instance;
  }

  /**
   * Generate PDF from HTML string
   */
  async generatePDF(html, options = {}) {
    const { format = 'pdf', ...pdfOptions } = options;
    
    if (format === 'html') {
      return {
        success: true,
        data: html,
        format: 'html',
        metadata: {
          size: html.length,
          timestamp: new Date().toISOString()
        }
      };
    }

    try {
      // Check if html2pdf is available
      if (typeof window.html2pdf === 'undefined') {
        throw new Error('html2pdf.js is not loaded. Please include it in your HTML.');
      }

      const pdfBlob = await this.htmlToPdfBlob(html, pdfOptions);
      
      return {
        success: true,
        data: pdfBlob,
        format: 'pdf',
        metadata: {
          size: pdfBlob.size,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `PDF generation failed: ${error.message}`,
        format: 'pdf',
        metadata: {
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Convert HTML to PDF blob using html2pdf.js
   */
  async htmlToPdfBlob(html, options = {}) {
    return new Promise((resolve, reject) => {
      // Create hidden container
      const hiddenContainer = document.createElement('div');
      hiddenContainer.style.position = 'absolute';
      hiddenContainer.style.left = '-9999px';
      hiddenContainer.style.visibility = 'hidden';

      // Create element with HTML content
      const element = document.createElement('div');
      element.innerHTML = html;
      hiddenContainer.appendChild(element);
      document.body.appendChild(hiddenContainer);

      // Default options
      const defaultOptions = {
        html2canvas: {
          scale: 3,
          useCORS: true,
          allowTaint: false,
          logging: false
        },
        jsPDF: {
          unit: 'pt',
          format: 'a4',
          orientation: 'portrait'
        }
      };

      // Merge with provided options
      const mergedOptions = this.mergeOptions(defaultOptions, options);

      // Generate PDF
      window.html2pdf()
        .set(mergedOptions)
        .from(element)
        .outputPdf('blob')
        .then(blob => {
          document.body.removeChild(hiddenContainer);
          resolve(blob);
        })
        .catch(err => {
          document.body.removeChild(hiddenContainer);
          reject(err);
        });
    });
  }

  /**
   * Create blob URL from blob
   */
  createBlobUrl(blob) {
    return URL.createObjectURL(blob);
  }

  /**
   * Revoke blob URL
   */
  revokeBlobUrl(url) {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Download PDF blob
   */
  downloadPDF(blob, filename = 'output.pdf') {
    const url = this.createBlobUrl(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.revokeBlobUrl(url);
  }

  /**
   * Merge options objects
   */
  mergeOptions(defaultOptions, userOptions) {
    const merged = { ...defaultOptions };
    
    for (const key in userOptions) {
      if (userOptions.hasOwnProperty(key)) {
        if (typeof userOptions[key] === 'object' && !Array.isArray(userOptions[key])) {
          merged[key] = this.mergeOptions(merged[key] || {}, userOptions[key]);
        } else {
          merged[key] = userOptions[key];
        }
      }
    }
    
    return merged;
  }

  /**
   * Check if html2pdf is available
   */
  isHtml2PdfAvailable() {
    return typeof window.html2pdf !== 'undefined';
  }

  /**
   * Get available PDF options
   */
  getAvailableOptions() {
    return {
      html2canvas: {
        scale: 'number (default: 3)',
        useCORS: 'boolean (default: true)',
        allowTaint: 'boolean (default: false)',
        logging: 'boolean (default: false)'
      },
      jsPDF: {
        unit: 'string (default: "pt")',
        format: 'string (default: "a4")',
        orientation: 'string (default: "portrait")'
      }
    };
  }
} 