/**
 * Template Manager
 * Handles template loading, caching, and asset management
 */

class TemplateManager {
  constructor() {
    this.cache = new Map();
    this.downloadedAssets = new Map();
    this.bundledAssets = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize template manager
   */
  async initialize() {
    if (this.isInitialized) {
      return { success: true, message: 'Template manager already initialized' };
    }

    try {
      // Load bundled assets
      await this.loadBundledAssets();
      
      // Try to load downloaded assets
      await this.loadDownloadedAssets();
      
      this.isInitialized = true;
      return { success: true, message: 'Template manager initialized successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Load bundled assets (default templates)
   */
  async loadBundledAssets() {
    try {
      // Load default templates from assets directory
      const defaultTemplates = {
        'quotation/cra': await this.loadAsset('assets/templates/cra/sqs_template.html'),
        'quotation/life-saver': await this.loadAsset('assets/templates/life-saver/sqs_template.html'),
        'quotation/life': await this.loadAsset('assets/templates/life/sqs_template.html'),
        'quotation/pradeepa': await this.loadAsset('assets/templates/pradeepa/sqs_template.html'),
        'quotation/investment': await this.loadAsset('assets/templates/investment/sqs_template.html'),
        'quotation/advance-payment': await this.loadAsset('assets/templates/advance-payment/sqs_template.html')
      };

      // Store in bundled assets cache
      for (const [key, template] of Object.entries(defaultTemplates)) {
        if (template) {
          this.bundledAssets.set(key, template);
        }
      }

      console.log('Bundled assets loaded successfully');
    } catch (error) {
      console.warn('Failed to load bundled assets:', error.message);
    }
  }

  /**
   * Load downloaded assets from local storage
   */
  async loadDownloadedAssets() {
    try {
      // Check if downloaded assets exist in local storage
      const downloadedAssets = localStorage.getItem('downloadedTemplates');
      if (downloadedAssets) {
        const assets = JSON.parse(downloadedAssets);
        for (const [key, template] of Object.entries(assets)) {
          this.downloadedAssets.set(key, template);
        }
        console.log('Downloaded assets loaded successfully');
      }
    } catch (error) {
      console.warn('Failed to load downloaded assets:', error.message);
    }
  }

  /**
   * Load asset from file system
   */
  async loadAsset(path) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        return await response.text();
      }
      return null;
    } catch (error) {
      console.warn(`Failed to load asset: ${path}`, error.message);
      return null;
    }
  }

  /**
   * Select template and config based on criteria
   */
  async selectTemplateAndConfig(criteria) {
    const { productName, productType, planName, outputType } = criteria;
    
    // Normalize names
    const normalizedPlanName = planName?.replace(/\s+/g, '-').toLowerCase() || '';
    const normalizedProductName = productType?.replace(/\s+/g, '-').toLowerCase() || '';
    
    // Priority 1: Check downloaded assets
    let template = await this.getTemplateFromDownloaded(outputType, normalizedPlanName, normalizedProductName);
    let config = await this.getConfigFromDownloaded(outputType, normalizedPlanName, normalizedProductName);
    
    // Priority 2: Fallback to bundled assets
    if (!template) {
      template = await this.getTemplateFromBundled(outputType, normalizedPlanName, normalizedProductName);
      config = await this.getConfigFromBundled(outputType, normalizedPlanName, normalizedProductName);
    }
    
    // Priority 3: Use default template
    if (!template) {
      template = this.getDefaultTemplate(outputType);
      config = this.getDefaultConfig(outputType);
    }
    
    return {
      templateHtml: template,
      tableFormatJson: config,
      normalizedProductName,
      normalizedPlanName
    };
  }

  /**
   * Get template key based on plan name (ported from backend logic)
   */
  getTemplateKey(planName) {
    const normalizedPlanName = planName?.replace(/\s+/g, '-').toLowerCase() || '';
    
    // Check if plan-specific template exists
    if (this.bundledAssets.has(`quotation/${normalizedPlanName}`)) {
      return `quotation/${normalizedPlanName}`;
    } else if (normalizedPlanName.includes('saver')) {
      // Fallback to life-saver template
      return 'quotation/life-saver';
    } else {
      // Fallback to cra template
      return 'quotation/cra';
    }
  }

  /**
   * Get template from downloaded assets
   */
  async getTemplateFromDownloaded(outputType, planName, productName) {
    const keys = [
      `${outputType}/${planName}`,
      `${outputType}/${productName}`,
      `${outputType}/default`
    ];
    
    for (const key of keys) {
      const template = this.downloadedAssets.get(key);
      if (template) {
        return template;
      }
    }
    
    return null;
  }

  /**
   * Get template from bundled assets
   */
  async getTemplateFromBundled(outputType, planName, productName) {
    const keys = [
      `${outputType}/${planName}`,
      `${outputType}/${productName}`,
      `${outputType}/default`
    ];
    
    for (const key of keys) {
      const template = this.bundledAssets.get(key);
      if (template) {
        return template;
      }
    }
    
    return null;
  }

  /**
   * Get config from downloaded assets
   */
  async getConfigFromDownloaded(outputType, planName, productName) {
    // Similar logic to template loading
    return this.getDefaultConfig(outputType);
  }

  /**
   * Get config from bundled assets
   */
  async getConfigFromBundled(outputType, planName, productName) {
    // Similar logic to template loading
    return this.getDefaultConfig(outputType);
  }

  /**
   * Get default template
   */
  getDefaultTemplate(outputType) {
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
    
    return defaultTemplates[outputType] || defaultTemplates.quotation;
  }

  /**
   * Get default config
   */
  getDefaultConfig(outputType) {
    const defaultConfigs = {
      quotation: {
        TableCreateJSON: ['primaryInsured.coverages', 'spouseInsured.coverages'],
        protectionBenefitsRider: [],
        healthBenefitsRider: [],
        disabilityBenefitsRider: [],
        RiderTablecreate: [],
        lossoflife: [],
        lossofaccident: [],
        riderData: [],
        DivShowHide: [],
        excludeHeaders: [],
        summarybenefit: [],
        summarytable: [],
        summarybenefitekey: []
      },
      proposal: {
        TableCreateJSON: [],
        DivShowHide: [],
        excludeHeaders: []
      },
      fna: {
        TableCreateJSON: [],
        DivShowHide: [],
        excludeHeaders: []
      }
    };
    
    return defaultConfigs[outputType] || defaultConfigs.quotation;
  }

  /**
   * Store downloaded templates
   */
  async storeDownloadedTemplates(templates) {
    try {
      for (const [key, template] of Object.entries(templates)) {
        this.downloadedAssets.set(key, template);
      }
      
      // Save to localStorage
      const templatesData = {};
      for (const [key, template] of this.downloadedAssets.entries()) {
        templatesData[key] = template;
      }
      localStorage.setItem('downloadedTemplates', JSON.stringify(templatesData));
      
      return { success: true, message: 'Templates stored successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get version information
   */
  async getVersion() {
    return {
      bundled: '1.0.0',
      downloaded: this.downloadedAssets.size > 0 ? '1.0.0' : null,
      totalTemplates: this.bundledAssets.size + this.downloadedAssets.size
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    return { success: true, message: 'Template cache cleared' };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      bundledAssets: this.bundledAssets.size,
      downloadedAssets: this.downloadedAssets.size,
      cacheSize: this.cache.size
    };
  }
}

// Create singleton instance
const templateManager = new TemplateManager();

// Export
export { TemplateManager };
export default templateManager; 