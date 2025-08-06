/**
 * FNA Processor
 * Ports business logic from fnaOutputService.js for FNA PDF generation
 */

import templateManager from '../utils/templateManager.js';
import { PDFGenerator } from '../utils/pdfGenerator.js';

export class FNAProcessor {
  constructor() {
    this.templateManager = templateManager;
    this.pdfGenerator = new PDFGenerator();
    this.cache = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize the processor
   */
  async initialize() {
    if (this.isInitialized) {
      return { success: true, message: 'FNA processor already initialized' };
    }

    try {
      // Initialize dependencies
      await this.pdfGenerator.initialize();
      
      this.isInitialized = true;
      return { success: true, message: 'FNA processor initialized successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Process FNA data and generate output
   * Ported from fnaOutputService.js fnaOutput function
   */
  async process(data, template, options = {}) {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(data, template, options);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Step 1: Process FNA input
      const config = await this.processFNAInput(data);

      // Step 2: Create DOM from template
      const dom = document.createElement('div');
      dom.innerHTML = config.templateHtml;

      // Step 3: Fill template recursively
      await this.fnKeyValueRecursiveCall(dom, data, config);

      // Step 4: Serialize filled DOM to HTML
      const filledHtml = dom.innerHTML;

      // Step 5: Generate PDF/HTML
      const result = await this.pdfGenerator.generatePDF(filledHtml, options || { format: 'pdf' });

      // Cache the result
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: `FNA processing failed: ${error}`,
        metadata: {
          processingTime: Date.now() - startTime,
          templateUsed: template || 'unknown',
          outputSize: 0
        }
      };

      this.cache.set(cacheKey, errorResult);
      return errorResult;
    }
  }

  /**
   * Process FNA input (ported from backend)
   */
  async processFNAInput(requestJSON) {
    // Load template and config using template manager
    const templateConfig = await this.templateManager.selectTemplateAndConfig({
      productName: '',
      productType: '',
      planName: '',
      outputType: 'fna'
    });

    return {
      templateHtml: templateConfig.templateHtml,
      tableFormatJson: templateConfig.tableFormatJson
    };
  }

  /**
   * Recursive key-value replacement (ported from backend)
   */
  async fnKeyValueRecursiveCall(dom, data, config, keyPrefix = "") {
    if (typeof data === 'object' && data !== null) {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const newKey = keyPrefix ? `${keyPrefix}.${key}` : key;
          
          // Continue recursion
          await this.fnKeyValueRecursiveCall(data[key], data, config, newKey);
        }
      }
    } else {
      // Replace placeholder in template
      const placeholder = `||${keyPrefix}||`;
      const replacement = data !== null && data !== undefined ? data : '';
      
      // Replace in DOM
      const elements = dom.querySelectorAll('*');
      elements.forEach(element => {
        if (element.innerHTML.includes(placeholder)) {
          element.innerHTML = element.innerHTML.replace(new RegExp(placeholder, 'g'), replacement);
        }
      });
    }
  }

  /**
   * Generate cache key
   */
  generateCacheKey(data, template, options) {
    const dataStr = JSON.stringify(data);
    const templateStr = template || '';
    const optionsStr = JSON.stringify(options);
    return `${dataStr}-${templateStr}-${optionsStr}`;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    return { success: true, message: 'FNA processor cache cleared' };
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