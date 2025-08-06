/**
* Template Manager
* Handles template loading, caching, and asset management
*/

export class TemplateManager {
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
      // For now, we'll use a fallback approach since bundled assets need to be handled differently
      // In a real implementation, these would be bundled with the plugin
      console.log('Bundled assets loading skipped - will use fallback templates');

      // Store empty templates for now - they will be loaded on demand
      const defaultTemplates = [
        'quotation/cra',
        'quotation/life-saver',
        'quotation/life',
        'quotation/pradeepa',
        'quotation/investment',
        'quotation/advance-payment'
      ];

      for (const key of defaultTemplates) {
        this.bundledAssets.set(key, null); // Will be loaded on demand
      }

      console.log('Bundled assets cache initialized');
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
      // Try to load from the plugin's assets directory
      const response = await fetch(`/plugins/capacitor-pdf-generator/${path}`);
      if (response.ok) {
        return await response.text();
      }

      // Fallback: try to load from the main app's public directory
      const fallbackResponse = await fetch(`/templates/${path.split('/').pop()}`);
      if (fallbackResponse.ok) {
        return await fallbackResponse.text();
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

    console.log('template::::', template);
    console.log('config::::', config);
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

// Export singleton instance as default
export default templateManager; 