// /**
//  * PDF Generator
//  * Handles PDF generation from HTML content
//  */

// export class PDFGenerator {
//   constructor() {
//     this.cache = new Map();
//     this.isInitialized = false;
//   }

//   /**
//    * Initialize the PDF generator
//    */
//   async initialize() {
//     if (this.isInitialized) {
//       return { success: true, message: 'PDF generator already initialized' };
//     }

//     try {
//       // Check if html2pdf is available
//       if (typeof window.html2pdf === 'undefined') {
//         // Try to load html2pdf dynamically
//         await this.loadHtml2Pdf();
//       }

//       this.isInitialized = true;
//       return { success: true, message: 'PDF generator initialized successfully' };
//     } catch (error) {
//       return { success: false, error: error.message };
//     }
//   }

//   /**
//    * Load html2pdf library dynamically
//    */
//   async loadHtml2Pdf() {
//     return new Promise((resolve, reject) => {
//       // Check if already loaded
//       if (typeof window.html2pdf !== 'undefined') {
//         resolve();
//         return;
//       }

//       // Create script element
//       const script = document.createElement('script');
//       script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
//       script.onload = () => {
//         console.log('html2pdf.js loaded successfully');
//         resolve();
//       };
//       script.onerror = () => {
//         reject(new Error('Failed to load html2pdf.js'));
//       };

//       document.head.appendChild(script);
//     });
//   }

//   /**
//    * Generate PDF from HTML content
//    */
//   async generatePDF(html, options = {}) {
//     const startTime = Date.now();
//     const cacheKey = this.generateCacheKey(html, options);

//     // Check cache first
//     if (this.cache.has(cacheKey)) {
//       return this.cache.get(cacheKey);
//     }

//     try {
//       if (!this.isInitialized) {
//         await this.initialize();
//       }

//       // Create temporary container
//       const container = document.createElement('div');
//       container.innerHTML = html;
//       container.style.position = 'absolute';
//       container.style.left = '-9999px';
//       container.style.top = '-9999px';
//       document.body.appendChild(container);

//       // Default options
//       const defaultOptions = {
//         margin: [10, 10, 10, 10],
//         filename: 'generated-document.pdf',
//         image: { type: 'jpeg', quality: 0.98 },
//         html2canvas: { 
//           scale: 2,
//           useCORS: true,
//           allowTaint: true
//         },
//         jsPDF: { 
//           unit: 'mm', 
//           format: 'a4', 
//           orientation: 'portrait' 
//         }
//       };

//       const pdfOptions = { ...defaultOptions, ...options };

//       // Generate PDF
//       const pdfBlob = await this.htmlToPdfBlob(container, pdfOptions);

//       // Clean up
//       document.body.removeChild(container);

//       const result = {
//         success: true,
//         data: pdfBlob,
//         metadata: {
//           processingTime: Date.now() - startTime,
//           size: pdfBlob.size,
//           type: pdfBlob.type
//         }
//       };

//       // Cache the result
//       this.cache.set(cacheKey, result);

//       return result;
//     } catch (error) {
//       const errorResult = {
//         success: false,
//         error: `PDF generation failed: ${error.message}`,
//         metadata: {
//           processingTime: Date.now() - startTime,
//           size: 0
//         }
//       };

//       this.cache.set(cacheKey, errorResult);
//       return errorResult;
//     }
//   }

//   /**
//    * Convert HTML to PDF blob
//    */
//   async htmlToPdfBlob(element, options) {
//     return new Promise((resolve, reject) => {
//       try {
//         // Use html2pdf library
//         const pdf = window.html2pdf()
//           .from(element)
//           .set(options)
//           .outputPdf('blob')
//           .then(blob => {
//             resolve(blob);
//           })
//           .catch(error => {
//             reject(error);
//           });
//       } catch (error) {
//         reject(error);
//       }
//     });
//   }

//   /**
//    * Generate cache key
//    */
//   generateCacheKey(html, options) {
//     const htmlHash = this.simpleHash(html);
//     const optionsHash = this.simpleHash(JSON.stringify(options));
//     return `${htmlHash}-${optionsHash}`;
//   }

//   /**
//    * Simple hash function
//    */
//   simpleHash(str) {
//     let hash = 0;
//     if (str.length === 0) return hash;

//     for (let i = 0; i < str.length; i++) {
//       const char = str.charCodeAt(i);
//       hash = ((hash << 5) - hash) + char;
//       hash = hash & hash; // Convert to 32-bit integer
//     }

//     return hash.toString();
//   }

//   /**
//    * Clear cache
//    */
//   clearCache() {
//     this.cache.clear();
//     return { success: true, message: 'PDF generator cache cleared' };
//   }

//   /**
//    * Get cache statistics
//    */
//   getCacheStats() {
//     return {
//       cacheSize: this.cache.size,
//       cacheKeys: Array.from(this.cache.keys())
//     };
//   }
// } 


/**
 * PDF Generator
 * Handles PDF generation from HTML content
 */

export class PDFGenerator {
  constructor() {
    this.cache = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize the PDF generator
   */
  async initialize() {
    if (this.isInitialized) {
      return { success: true, message: 'PDF generator already initialized' };
    }

    try {
      // Check if html2pdf is available
      if (typeof window.html2pdf === 'undefined') {
        // Try to load html2pdf dynamically
        await this.loadHtml2Pdf();
      }

      this.isInitialized = true;
      return { success: true, message: 'PDF generator initialized successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Load html2pdf library dynamically
   */
  async loadHtml2Pdf() {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (typeof window.html2pdf !== 'undefined') {
        resolve();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        console.log('html2pdf.js loaded successfully');
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load html2pdf.js'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Generate PDF from HTML content
   */
  async generatePDF(html, options = {}) {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(html, options);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Generate PDF using the same approach as working version
      const pdfBlob = await this.htmlToPdfBlob(html, options);

      console.log('🔍 PDF blob generated:', pdfBlob);
      console.log('🔍 Blob type:', pdfBlob?.type);
      console.log('🔍 Blob size:', pdfBlob?.size);

      const result = {
        success: true,
        data: pdfBlob,
        metadata: {
          processingTime: Date.now() - startTime,
          size: pdfBlob?.size || 0,
          type: pdfBlob?.type || 'unknown'
        }
      };

      // Cache the result
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: `PDF generation failed: ${error.message}`,
        metadata: {
          processingTime: Date.now() - startTime,
          size: 0
        }
      };

      this.cache.set(cacheKey, errorResult);
      return errorResult;
    }
  }

  /**
   * Convert HTML to PDF blob (match working version exactly)
   */
  async htmlToPdfBlob(html, options = {}) {
    return new Promise((resolve, reject) => {
      // Create hidden container (same as working version)
      const hiddenContainer = document.createElement('div');
      hiddenContainer.style.position = 'absolute';
      hiddenContainer.style.left = '-9999px';
      hiddenContainer.style.visibility = 'hidden';

      // Parse the full HTML document to extract CSS and body content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Create element with HTML content (same as working version)
      const element = document.createElement('div');

      // Extract CSS from head and apply it
      const headStyles = doc.head.querySelectorAll('style');
      headStyles.forEach(style => {
        const styleElement = document.createElement('style');
        styleElement.textContent = style.textContent;
        element.appendChild(styleElement);
      });

      // Set the body content
      element.innerHTML += doc.body.innerHTML;

      hiddenContainer.appendChild(element);
      document.body.appendChild(hiddenContainer);

      // Default options (same as working version)
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

      // Generate PDF (same call order as working version)
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
   * Merge options objects (same as working version)
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
   * Generate cache key
   */
  generateCacheKey(html, options) {
    const htmlHash = this.simpleHash(html);
    const optionsHash = this.simpleHash(JSON.stringify(options));
    return `${htmlHash}-${optionsHash}`;
  }

  /**
   * Simple hash function
   */
  simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return hash.toString();
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    return { success: true, message: 'PDF generator cache cleared' };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      cacheKeys: Array.from(this.cache.keys())
    };
  }
} 