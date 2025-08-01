/**
 * PDF Generator Engine
 * Contains business logic for processing data and generating PDFs
 */

class PDFEngine {
  constructor() {
    this.templates = {};
    this.csvData = {};
    this.config = {};
  }

  /**
   * Main function called by native code
   */
  async generatePDF(inputData, templateType) {
    try {
      console.log('PDF Engine: Starting PDF generation for', templateType);
      
      // Step 1: Load appropriate template
      const template = await this.loadTemplate(templateType, inputData);
      
      // Step 2: Execute business logic
      const processedData = await this.processBusinessLogic(inputData, templateType);
      
      // Step 3: Fill template with data
      const filledHTML = await this.fillTemplate(template, processedData);
      
      // Step 4: Apply show/hide logic
      const finalHTML = await this.applyConditionalLogic(filledHTML, processedData);
      
      // Step 5: Render to DOM
      document.getElementById('pdf-content').innerHTML = finalHTML;
      
      // Step 6: Signal ready for PDF capture
      window.parent.postMessage({
        type: 'PDF_READY',
        success: true
      }, '*');
      
    } catch (error) {
      console.error('PDF Engine Error:', error);
      window.parent.postMessage({
        type: 'PDF_ERROR',
        error: error.message
      }, '*');
    }
  }

  /**
   * Load template based on type and data
   */
  async loadTemplate(templateType, data) {
    const planName = data.productName?.replace(/\s+/g, '-').toLowerCase() || '';
    const productType = data.productType?.replace(/\s+/g, '-').toLowerCase() || '';
    
    // Template selection logic (ported from backend)
    let templatePath = '';
    
    if (templateType === 'quotation') {
      if (planName.includes('saver')) {
        templatePath = 'templates/quotation/life-saver/template.html';
      } else {
        templatePath = `templates/quotation/${planName}/template.html`;
      }
    } else if (templateType === 'proposal') {
      templatePath = `templates/proposal/${productType}/template.html`;
    } else if (templateType === 'fna') {
      templatePath = 'templates/fna/template.html';
    }
    
    try {
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error(`Template not found: ${templatePath}`);
      }
      return await response.text();
    } catch (error) {
      // Fallback to default template
      return this.getDefaultTemplate(templateType);
    }
  }

  /**
   * Get default template if loading fails
   */
  getDefaultTemplate(templateType) {
    const defaultTemplates = {
      quotation: `
        <div class="header">
          <h1>Quotation</h1>
          <p>Product: ||productName||</p>
          <p>Quote ID: ||QuoteId||</p>
        </div>
        <div class="section">
          <h2>Primary Insured</h2>
          <p>Name: ||primaryInsured.person.name.first|| ||primaryInsured.person.name.last||</p>
          <p>Age: ||primaryInsured.person.age||</p>
        </div>
      `,
      proposal: `
        <div class="header">
          <h1>Proposal</h1>
          <p>Product: ||product.planName||</p>
        </div>
        <div class="section">
          <h2>Application Details</h2>
          <p>Application Type: ||applicationType||</p>
        </div>
      `,
      fna: `
        <div class="header">
          <h1>Financial Needs Analysis</h1>
          <p>FNA ID: ||fnaMainId||</p>
        </div>
        <div class="section">
          <h2>Analysis Results</h2>
        </div>
      `
    };
    
    return defaultTemplates[templateType] || defaultTemplates.quotation;
  }

  /**
   * Process business logic (ported from microservice)
   */
  async processBusinessLogic(data, templateType) {
    const processedData = { ...data };
    
    // Apply business rules based on template type
    if (templateType === 'quotation') {
      processedData.paymentFrequencyText = this.getPaymentFrequencyText(data.paymentFrequency);
      processedData.contributionFundFormatted = this.formatCurrency(data.contributionFund);
      
      // Process insured data
      if (processedData.primaryInsured) {
        processedData.primaryInsured.formattedName = this.formatName(processedData.primaryInsured.person.name);
      }
      
      if (processedData.spouseInsured) {
        processedData.spouseInsured.formattedName = this.formatName(processedData.spouseInsured.person.name);
      }
      
      // Process children
      if (processedData.Child && Array.isArray(processedData.Child)) {
        processedData.Child.forEach(child => {
          if (child.person && child.person.name) {
            child.formattedName = this.formatName(child.person.name);
          }
        });
      }
    }
    
    return processedData;
  }

  /**
   * Fill template with processed data
   */
  async fillTemplate(template, data) {
    let filledTemplate = template;
    
    // Recursive key-value replacement
    const replaceKeys = (obj, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          replaceKeys(value, fullKey);
        } else {
          const placeholder = `||${fullKey}||`;
          const replacement = value !== null && value !== undefined ? value : '';
          filledTemplate = filledTemplate.replace(new RegExp(placeholder, 'g'), replacement);
        }
      }
    };
    
    replaceKeys(data);
    return filledTemplate;
  }

  /**
   * Apply conditional logic (show/hide sections)
   */
  async applyConditionalLogic(html, data) {
    // Create temporary DOM element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Apply show/hide logic based on data
    this.applyShowHideLogic(tempDiv, data);
    
    return tempDiv.innerHTML;
  }

  /**
   * Apply show/hide logic
   */
  applyShowHideLogic(element, data) {
    // Hide sections based on conditions
    const sectionsToHide = [];
    
    // Example: Hide spouse section if no spouse data
    if (!data.spouseInsured || !data.spouseInsured.person) {
      sectionsToHide.push('.spouse-section');
    }
    
    // Example: Hide children section if no children
    if (!data.Child || data.Child.length === 0) {
      sectionsToHide.push('.children-section');
    }
    
    // Apply hiding
    sectionsToHide.forEach(selector => {
      const elements = element.querySelectorAll(selector);
      elements.forEach(el => {
        el.classList.add('hidden');
      });
    });
  }

  /**
   * Utility functions
   */
  getPaymentFrequencyText(frequency) {
    const frequencyMap = {
      'A': 'Annual',
      'S': 'Semi-Annual',
      'Q': 'Quarterly',
      'M': 'Monthly',
      'R': 'Regular'
    };
    return frequencyMap[frequency] || frequency;
  }

  formatCurrency(amount) {
    if (!amount) return '0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatName(name) {
    if (!name) return '';
    const first = name.first || '';
    const last = name.last || '';
    return `${first} ${last}`.trim();
  }
}

// Initialize engine
window.pdfEngine = new PDFEngine();

// Global function for native code to call
window.generatePDF = function(inputData, templateType) {
  return window.pdfEngine.generatePDF(inputData, templateType);
}; 