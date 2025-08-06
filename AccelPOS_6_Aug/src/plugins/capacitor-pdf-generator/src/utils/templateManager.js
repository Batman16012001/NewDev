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
   * Load template HTML from assets
   */
  async loadTemplate(templatePath) {
    try {
      // For Capacitor plugin, we'll use fetch to load from assets
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error(`Template not found: ${templatePath}`);
      }
      return await response.text();
    } catch (error) {
      throw new Error(`Failed to load template: ${error.message}`);
    }
  }

  /**
   * Load configuration JSON from assets
   */
  async loadConfig(configPath) {
    try {
      // For Capacitor plugin, we'll use fetch to load from assets
      const response = await fetch(configPath);
      if (!response.ok) {
        throw new Error(`Config not found: ${configPath}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to load config: ${error.message}`);
    }
  }

  /**
   * Select template and config based on criteria
   */
  async selectTemplateAndConfig(criteria) {
    const { productName, productType, planName, outputType } = criteria;
    const cacheKey = `${outputType}-${productName}-${productType}-${planName}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      let templatePath, configPath;

      // Template selection logic (ported from QuotepackageController.js)
      if (outputType === 'quotation') {
        console.log("Inside Quotation: "+ outputType)
        const normalizedPlanName = planName?.replace(/\s+/g, '-').toLowerCase() || '';
        const normalizedProductName = (productType || '').replace(/\s+/g, '-').toLowerCase();
        
        // Map missing templates to existing ones
        let effectivePlanName = normalizedPlanName;
        if (normalizedPlanName === 'endowment') {
          effectivePlanName = 'life'; // Map endowment to life template
          console.log('🔍 Mapping endowment plan to life template');
        }
        
        // Check if plan-specific template exists
        templatePath = `/assets/templates/sqs/${effectivePlanName}/sqs_template.html`;
        configPath = `/assets/configs/sqs/${effectivePlanName}_TableFormat.json`;
        
        // Fallback logic for "Saver" plans
        if (effectivePlanName.includes('saver')) {
          templatePath = `/assets/templates/sqs/life-saver/sqs_template.html`;
          configPath = `/assets/configs/sqs/life-saver_TableFormat.json`;
        } else if (effectivePlanName === 'life') {
          // Use life template as default for endowment
          templatePath = `/assets/templates/sqs/life/sqs_template.html`;
          configPath = `/assets/configs/sqs/life_TableFormat.json`;
        } else {
          // Fallback to product type
          templatePath = `/assets/templates/sqs/${normalizedProductName}/sqs_template.html`;
          configPath = `/assets/configs/sqs/${normalizedProductName}_TableFormat.json`;
        }
      } else if (outputType === 'proposal') {
        // Proposal template selection logic (to be implemented)
        templatePath = `/assets/templates/proposal/${productType}/proposal_template.html`;
        configPath = `/assets/configs/proposal/${productType}/TableFormat.json`;
      } else if (outputType === 'fna') {
        // FNA template selection logic (to be implemented)
        templatePath = `/assets/templates/fna/output_FNA.html`;
        configPath = `/assets/configs/fna/fnaOutputSchema.json`;
      }

      console.log('🔍 Template path:', templatePath);
      console.log('🔍 Config path:', configPath);

      // Load template and config
      const [templateHtml, tableFormatJson] = await Promise.all([
        this.loadTemplate(templatePath),
        this.loadConfig(configPath)
      ]);

      const result = {
        templateHtml,
        tableFormatJson,
        templatePath,
        configPath,
        normalizedProductName: (productType || '').replace(/\s+/g, '-').toLowerCase(),
        normalizedPlanName: planName?.replace(/\s+/g, '-').toLowerCase() || ''
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      throw new Error(`Template selection failed: ${error.message}`);
    }
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