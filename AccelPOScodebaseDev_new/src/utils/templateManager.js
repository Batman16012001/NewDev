export class TemplateManager {
  constructor() {
    this.cache = new Map();
    this.instance = null;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new TemplateManager();
    }
    return this.instance;
  }

  /**
   * Select template and configuration based on product/plan
   */
  async selectTemplateAndConfig(params) {
    const { productName, productType, planName, outputType } = params;
    const cacheKey = `${outputType}-${productName}-${productType}-${planName}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      let templatePath, configPath;

      // Template selection logic (ported from QuotepackageController.js)
      if (outputType === 'quotation') {
        console.log("Inside Quotation: "+ outputType)
        const normalizedPlanName = planName.replace(/\s+/g, '-').toLowerCase();
        const normalizedProductName = (productType || '').replace(/\s+/g, '-').toLowerCase();
        
        // Check if plan-specific template exists
        templatePath = `/assets/templates/sqs/${normalizedPlanName}/sqs_template.html`;
        // configPath = `/assets/configs/sqs/${normalizedPlanName}/TableFormat.json`;
        configPath = `/assets/configs/sqs/${normalizedPlanName}_TableFormat.json`;
        
        // Fallback logic for "Saver" plans
        if (normalizedPlanName.includes('saver')) {
          templatePath = `/assets/templates/sqs/life-saver/sqs_template.html`;
          // configPath = `/assets/configs/sqs/life-saver/TableFormat.json`;
          configPath = `/assets/configs/sqs/life-saver_TableFormat.json`;
        } else {
          // Fallback to product type
          templatePath = `/assets/templates/sqs/${normalizedProductName}/sqs_template.html`;
          // configPath = `/assets/configs/sqs/${normalizedProductName}/TableFormat.json`;
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

      // Load template and config
      const [templateHtml, tableFormatJson] = await Promise.all([
        this.loadTemplate(templatePath),
        this.loadConfig(configPath)
      ]);

      const result = {
        templateHtml,
        tableFormatJson,
        templatePath,
        configPath
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      throw new Error(`Template selection failed: ${error.message}`);
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
   * Clear template cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
} 