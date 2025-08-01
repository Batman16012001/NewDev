/**
 * Quotation Processor
 * Ports business logic from quotepackgeService.js for quotation PDF generation
 */

import templateManager from '../utils/templateManager.js';
import { CSVLoader } from '../utils/csvLoader.js';
import { PDFGenerator } from '../utils/pdfGenerator.js';

export class QuotationProcessor {
  constructor() {
    this.templateManager = templateManager;
    this.csvLoader = new CSVLoader();
    this.pdfGenerator = new PDFGenerator();
    this.cache = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize the processor
   */
  async initialize() {
    if (this.isInitialized) {
      return { success: true, message: 'Quotation processor already initialized' };
    }

    try {
      // Initialize dependencies
      await this.csvLoader.initialize();
      await this.pdfGenerator.initialize();
      
      this.isInitialized = true;
      return { success: true, message: 'Quotation processor initialized successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Process quotation data and generate output
   * Ported from quotepackgeService.js QuoteProvision function
   */
  async process(data, template, options = {}) {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(data, template, options);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Step 1: Process illustration input (same as backend)
      const planName = data.productName?.replace(/\s+/g, '-').toLowerCase() || '';
      const config = await this.processIllustrationInput(data, planName);

      // Step 2: Create DOM from template
      const dom = document.createElement('div');
      dom.innerHTML = config.templateHtml;

      // Step 3: Fill template recursively
      await this.fnKeyValueRecursiveCall(dom, data, config);

      // Step 4: Show/hide sections
      const divHideArray = this.fnfindShowHidePositions(dom, data, config);
      this.fnfindArrayDifference(dom, divHideArray, config);

      // Step 5: Inject notes
      await this.fnnoteaccordingtoplantype(dom, planName, config.normalizedProductName);

      // Step 6: Serialize filled DOM to HTML
      const filledHtml = dom.innerHTML;

      // Step 7: Generate PDF/HTML
      const result = await this.pdfGenerator.generatePDF(filledHtml, options || { format: 'pdf' });

      // Cache the result
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: `Quotation processing failed: ${error}`,
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
   * Process illustration input (ported from backend processIllustrationInput)
   */
  async processIllustrationInput(requestJSON, planName) {
    // Normalize plan and product names (same as backend logic)
    const normalizedPlanName = planName.replace(/\s+/g, '-').toLowerCase();
    const normalizedProductName = (requestJSON.productType || '').replace(/\s+/g, '-').toLowerCase();

    // Template selection logic (ported from backend)
    let templateKey = '';
    let configKey = '';
    
    // Check if plan-specific template exists
    if (this.templateManager.bundledAssets.has(`quotation/${normalizedPlanName}`)) {
      templateKey = `quotation/${normalizedPlanName}`;
      configKey = normalizedPlanName;
    } else if (normalizedPlanName.includes('saver')) {
      // Fallback to life-saver template
      templateKey = 'quotation/life-saver';
      configKey = 'life-saver';
    } else {
      // Fallback to cra template
      templateKey = 'quotation/cra';
      configKey = 'cra';
    }

    // Load template HTML
    const templateHtml = this.templateManager.bundledAssets.get(templateKey);
    if (!templateHtml) {
      throw new Error(`Template not found: ${templateKey}`);
    }

    // Load config JSON
    const configResponse = await fetch(`assets/templates/${configKey}/TableFormat.json`);
    if (!configResponse.ok) {
      throw new Error(`Config not found: ${configKey}/TableFormat.json`);
    }
    const tableFormatJson = await configResponse.json();

    // Extract config values (same as backend)
    const TableCreateJSON = tableFormatJson.TableCreateJSON || [];
    const protectionBenefitsRider = tableFormatJson.protectionBenefitsRider || [];
    const healthBenefitsRider = tableFormatJson.healthBenefitsRider || [];
    const disabilityBenefitsRider = tableFormatJson.disabilityBenefitsRider || [];
    const RiderTablecreate = tableFormatJson.RiderTablecreate || [];
    const lossoflife = tableFormatJson.lossoflife || [];
    const lossofaccident = tableFormatJson.lossofaccident || [];
    const riderData = tableFormatJson.rider_data || [];
    const DivShowHide = tableFormatJson.DivShowHide || [];
    const excludeHeaders = tableFormatJson.excludeHeaders || [];
    const summarybenefit = tableFormatJson.summarybenefit || [];
    const summarytable = tableFormatJson.summarytable || [];
    const summarybenefitekey = tableFormatJson.summarybenefitekey || [];

    return {
      templateHtml: templateHtml,
      tableFormatJson: tableFormatJson,
      normalizedProductName,
      normalizedPlanName,
      TableCreateJSON,
      protectionBenefitsRider,
      healthBenefitsRider,
      disabilityBenefitsRider,
      RiderTablecreate,
      lossoflife,
      lossofaccident,
      riderData,
      DivShowHide,
      excludeHeaders,
      summarybenefit,
      summarytable,
      summarybenefitekey
    };
  }

  /**
   * Recursive key-value replacement (ported from backend fnKeyValueRecursiveCall)
   */
  async fnKeyValueRecursiveCall(dom, data, config, keyPrefix = "") {
    if (typeof data === 'object' && data !== null) {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const newKey = keyPrefix ? `${keyPrefix}.${key}` : key;
          
          if (config.TableCreateJSON.includes(newKey)) {
            // Handle table creation
            const insured = newKey.split('.')[0];
            const tableType = newKey.split('.')[1];
            
            // Load CSV data for this insured
            const products = await this.csvLoader.loadPlanWiseRiderCSV(
              data.productCode,
              insured,
              data.paymentFrequency
            );
            
            // Generate table
            await this.fngenerateTable(data[key], config, newKey, products);
          } else {
            // Continue recursion
            await this.fnKeyValueRecursiveCall(data[key], data, config, newKey);
          }
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
   * Find show/hide positions (ported from backend fnfindShowHidePositions)
   */
  fnfindShowHidePositions(dom, data, config, keyPrefix = "", DivHideArray = []) {
    if (typeof data === 'object' && data !== null) {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const newKey = keyPrefix ? `${keyPrefix}.${key}` : key;
          
          if (config.DivShowHide.includes(newKey)) {
            DivHideArray.push(newKey);
          }
          
          this.fnfindShowHidePositions(data[key], data, config, newKey, DivHideArray);
        }
      }
    }
    
    return DivHideArray;
  }

  /**
   * Find array difference and apply show/hide (ported from backend fnfindArrayDifference)
   */
  fnfindArrayDifference(dom, DivHideArray, config) {
    const elementsToHide = config.DivShowHide.filter(item => !DivHideArray.includes(item));
    
    elementsToHide.forEach(selector => {
      const elements = dom.querySelectorAll(`[data-key="${selector}"]`);
      elements.forEach(element => {
        element.style.display = 'none';
      });
    });
  }

  /**
   * Generate table (ported from backend fngenerateTable)
   */
  async fngenerateTable(data, config, newKey, products) {
    if (!data || !Array.isArray(data)) return;

    const insured = newKey.split('.')[0];
    const tableType = newKey.split('.')[1];
    
    // Create table HTML
    let tableHTML = '<table class="data-table">';
    
    // Add headers
    if (products.length > 0) {
      tableHTML += '<thead><tr>';
      Object.keys(products[0]).forEach(header => {
        if (!config.excludeHeaders.includes(header)) {
          tableHTML += `<th>${this.getHeaderReplacement(config, header)}</th>`;
        }
      });
      tableHTML += '</tr></thead>';
    }
    
    // Add data rows
    tableHTML += '<tbody>';
    data.forEach(row => {
      tableHTML += '<tr>';
      Object.keys(row).forEach(key => {
        if (!config.excludeHeaders.includes(key)) {
          tableHTML += `<td>${row[key] || ''}</td>`;
        }
      });
      tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';
    
    // Replace placeholder in DOM
    const placeholder = `||${newKey}||`;
    const elements = dom.querySelectorAll('*');
    elements.forEach(element => {
      if (element.innerHTML.includes(placeholder)) {
        element.innerHTML = element.innerHTML.replace(new RegExp(placeholder, 'g'), tableHTML);
      }
    });
  }

  /**
   * Get header replacement (ported from backend)
   */
  getHeaderReplacement(config, header) {
    // Add header replacement logic here
    return header;
  }

  /**
   * Inject notes according to plan type (ported from backend fnnoteaccordingtoplantype)
   */
  async fnnoteaccordingtoplantype(dom, planName, productName) {
    try {
      // Load notes configuration
      const notesResponse = await fetch('assets/notes/notes_files.json');
      if (notesResponse.ok) {
        const notesConfig = await notesResponse.json();
        
        // Find notes for this plan
        const planNotes = notesConfig[planName] || notesConfig[productName] || [];
        
        if (planNotes.length > 0) {
          let notesHTML = '<div class="notes-section"><h3>Notes</h3><ul>';
          planNotes.forEach(note => {
            notesHTML += `<li>${note}</li>`;
          });
          notesHTML += '</ul></div>';
          
          // Insert notes into DOM
          const notesContainer = dom.querySelector('.notes-container');
          if (notesContainer) {
            notesContainer.innerHTML = notesHTML;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load notes:', error.message);
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
    return { success: true, message: 'Quotation processor cache cleared' };
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