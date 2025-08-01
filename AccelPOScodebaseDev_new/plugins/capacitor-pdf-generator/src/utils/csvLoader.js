/**
 * CSV Loader
 * Handles loading and filtering CSV data for PDF generation
 */

export class CSVLoader {
  constructor() {
    this.csvData = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the CSV loader
   */
  async initialize() {
    if (this.isInitialized) {
      return { success: true, message: 'CSV loader already initialized' };
    }

    try {
      // Load PlanWiseRider.csv
      await this.loadPlanWiseRiderCSV();
      
      this.isInitialized = true;
      return { success: true, message: 'CSV loader initialized successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Load PlanWiseRider.csv file
   */
  async loadPlanWiseRiderCSV() {
    try {
      const response = await fetch('assets/csv/PlanWiseRider.csv');
      if (!response.ok) {
        throw new Error(`Failed to load CSV: ${response.status}`);
      }
      
      const csvText = await response.text();
      this.csvData = this.parseCSV(csvText);
      
      console.log('PlanWiseRider.csv loaded successfully');
      return this.csvData;
    } catch (error) {
      console.warn('Failed to load PlanWiseRider.csv:', error.message);
      // Return empty array as fallback
      this.csvData = [];
      return this.csvData;
    }
  }

  /**
   * Parse CSV text to array of objects
   */
  parseCSV(csvText) {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    // Get headers from first line
    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    
    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = this.parseCSVLine(line);
      if (values.length === headers.length) {
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
   * Parse CSV line handling quoted values
   */
  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  }

  /**
   * Filter PlanWiseRider CSV data
   * Ported from backend logic
   */
  async filterPlanWiseRiderCSV(planCode, lifeName, paymentFrequency) {
    if (!this.csvData || this.csvData.length === 0) {
      console.warn('No CSV data available for filtering');
      return [];
    }

    console.log('Filtering PlanWiseRider.csv with:', { planCode, lifeName, paymentFrequency });

    // Map payment frequency to CSV format
    const frequencyMap = {
      'A': 'A', // Annual
      'S': 'S', // Semi-Annual
      'Q': 'Q', // Quarterly
      'M': 'M', // Monthly
      'R': 'R'  // Regular
    };

    const mappedFrequency = frequencyMap[paymentFrequency] || paymentFrequency;

    // Filter data based on criteria
    const filteredData = this.csvData.filter(row => {
      const planMatch = row.planCode === planCode.toString();
      const lifeMatch = row.lifeName === lifeName;
      const frequencyMatch = row.paymentFrequency === mappedFrequency;
      
      return planMatch && lifeMatch && frequencyMatch;
    });

    console.log('Filtered products:', filteredData.length);
    return filteredData;
  }

  /**
   * Load CSV data for specific criteria (main interface)
   */
  async loadPlanWiseRiderCSV(planCode, lifeName, paymentFrequency) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return await this.filterPlanWiseRiderCSV(planCode, lifeName, paymentFrequency);
  }

  /**
   * Get all CSV data
   */
  getAllCSVData() {
    return this.csvData || [];
  }

  /**
   * Get unique values for a column
   */
  getUniqueValues(columnName) {
    if (!this.csvData) return [];
    
    const values = new Set();
    this.csvData.forEach(row => {
      if (row[columnName]) {
        values.add(row[columnName]);
      }
    });
    
    return Array.from(values);
  }

  /**
   * Get CSV statistics
   */
  getCSVStats() {
    if (!this.csvData) {
      return {
        totalRows: 0,
        columns: [],
        isLoaded: false
      };
    }

    return {
      totalRows: this.csvData.length,
      columns: this.csvData.length > 0 ? Object.keys(this.csvData[0]) : [],
      isLoaded: true
    };
  }

  /**
   * Clear CSV data
   */
  clearCSVData() {
    this.csvData = null;
    this.isInitialized = false;
    return { success: true, message: 'CSV data cleared' };
  }
} 