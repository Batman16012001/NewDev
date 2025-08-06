export class CSVLoader {
  constructor() {
    this.cache = new Map();
    this.csvData = null;
    this.instance = null;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new CSVLoader();
    }
    return this.instance;
  }

  /**
   * Load PlanWiseRider.csv from assets
   */
  async loadPlanWiseRiderCSV() {
    if (this.csvData) {
      return this.csvData;
    }

    try {
      const response = await fetch('/assets/csv/PlanWiseRider.csv');
      if (!response.ok) {
        throw new Error('Failed to load PlanWiseRider.csv');
      }
      
      const csvText = await response.text();
      this.csvData = this.parseCSV(csvText);
      return this.csvData;
    } catch (error) {
      throw new Error(`CSV loading failed: ${error.message}`);
    }
  }

  /**
   * Parse CSV text to array of objects
   */
  parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }

    return data;
  }

  /**
   * Filter CSV data based on criteria (ported from frontend)
   */
  async filterPlanWiseRiderCSV(planCode, lifeName, paymentFrequency) {
    const cacheKey = `${planCode}-${lifeName}-${paymentFrequency}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const csvData = await this.loadPlanWiseRiderCSV();
      
      // Map payment frequency to CSV format
      const mappedPaymentFrequency = this.mapPaymentFrequency(paymentFrequency);
      
      // Filter data (same logic as frontend)
      const filtered = csvData.filter(row => {
        return row['Life'] === lifeName &&
               row['PlanCode'] === planCode &&
               row['Payment_Freqeuncy'] === mappedPaymentFrequency &&
               row['Visibility'] !== 'N';
      });

      this.cache.set(cacheKey, filtered);
      return filtered;
    } catch (error) {
      console.error('Error filtering CSV:', error);
      return [];
    }
  }

  /**
   * Map payment frequency to CSV format
   */
  mapPaymentFrequency(frequency) {
    const mapping = {
      'M': 'M', // Monthly
      'Q': 'Q', // Quarterly
      'H': 'H', // Half Yearly
      'A': 'A', // Annually
      'Y': 'Y'  // Yearly
    };
    return mapping[frequency] || frequency;
  }

  /**
   * Clear CSV cache
   */
  clearCache() {
    this.cache.clear();
    this.csvData = null;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      csvLoaded: this.csvData !== null
    };
  }
} 