/**
 * Proposal Processor
 * Ports business logic from packageService.js for proposal PDF generation
 */

import templateManager from '../utils/templateManager.js';
import { PDFGenerator } from '../utils/pdfGenerator.js';

export class ProposalProcessor {
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
      return { success: true, message: 'Proposal processor already initialized' };
    }

    try {
      // Initialize dependencies
      await this.pdfGenerator.initialize();
      
      this.isInitialized = true;
      return { success: true, message: 'Proposal processor initialized successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Process proposal data and generate output
   * Ported from packageService.js packageProvision function
   */
  async process(data, template, options = {}) {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(data, template, options);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Step 1: Process proposal input
      const planName = data.product?.planName?.replace(/\s+/g, '-').toLowerCase() || '';
      const config = await this.processProposalInput(data, planName);

      // Step 2: Create DOM from template
      const dom = document.createElement('div');
      dom.innerHTML = config.templateHtml;

      // Step 3: Fill template recursively
      await this.fnKeyValueRecursiveCall(dom, data, config);

      // Step 4: Show/hide sections
      const divHideArray = this.fnfindShowHidePositions(dom, data, config);
      this.fnfindArrayDifference(dom, divHideArray, config);

      // Step 5: Serialize filled DOM to HTML
      const filledHtml = dom.innerHTML;

      // Step 6: Generate PDF/HTML
      const result = await this.pdfGenerator.generatePDF(filledHtml, options || { format: 'pdf' });

      // Cache the result
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: `Proposal processing failed: ${error}`,
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
   * Process proposal input (ported from backend)
   */
  async processProposalInput(requestJSON, planName) {
    // Normalize plan and product names
    const normalizedPlanName = planName.replace(/\s+/g, '-').toLowerCase();
    const normalizedProductName = (requestJSON.product?.productType || '').replace(/\s+/g, '-').toLowerCase();

    // Load template and config using template manager
    const templateConfig = await this.templateManager.selectTemplateAndConfig({
      productName: requestJSON.product?.planName || '',
      productType: requestJSON.product?.productType || '',
      planName: normalizedPlanName,
      outputType: 'proposal'
    });

    return {
      templateHtml: templateConfig.templateHtml,
      tableFormatJson: templateConfig.tableFormatJson,
      normalizedProductName,
      normalizedPlanName
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
   * Find show/hide positions (ported from backend)
   */
  fnfindShowHidePositions(dom, data, config, keyPrefix = "", DivHideArray = []) {
    if (typeof data === 'object' && data !== null) {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const newKey = keyPrefix ? `${keyPrefix}.${key}` : key;
          
          if (config.DivShowHide && config.DivShowHide.includes(newKey)) {
            DivHideArray.push(newKey);
          }
          
          this.fnfindShowHidePositions(data[key], data, config, newKey, DivHideArray);
        }
      }
    }
    
    return DivHideArray;
  }

  /**
   * Find array difference and apply show/hide (ported from backend)
   */
  fnfindArrayDifference(dom, DivHideArray, config) {
    if (!config.DivShowHide) return;
    
    const elementsToHide = config.DivShowHide.filter(item => !DivHideArray.includes(item));
    
    elementsToHide.forEach(selector => {
      const elements = dom.querySelectorAll(`[data-key="${selector}"]`);
      elements.forEach(element => {
        element.style.display = 'none';
      });
    });
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
    return { success: true, message: 'Proposal processor cache cleared' };
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