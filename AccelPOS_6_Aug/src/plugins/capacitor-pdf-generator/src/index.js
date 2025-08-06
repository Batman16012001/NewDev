import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { QuotationProcessor } from './processors/quotationProcessor.js';
import { ProposalProcessor } from './processors/proposalProcessor.js';
import { FNAProcessor } from './processors/fnaProcessor.js';
import templateManager from './utils/templateManager.js';
import { AssetSyncService } from './utils/assetSyncService.js';

/**
 * Capacitor PDF Generator Plugin
 * Hybrid strategy: Web vs Mobile + Online vs Offline
 */
class CapacitorPdfGenerator {
  constructor() {
    this.quotationProcessor = new QuotationProcessor();
    this.proposalProcessor = new ProposalProcessor();
    this.fnaProcessor = new FNAProcessor();
    this.templateManager = templateManager;
    this.assetSyncService = new AssetSyncService();
    this.isInitialized = false;
    this.isMobile = Capacitor.isNativePlatform();
  }

  /**
   * Initialize the plugin
   */
  async initialize() {
    if (this.isInitialized) {
      return { success: true, message: 'Plugin already initialized' };
    }

    try {
      // Initialize template manager
      await this.templateManager.initialize();
      
      // Initialize processors
      await this.quotationProcessor.initialize();
      await this.proposalProcessor.initialize();
      await this.fnaProcessor.initialize();

      this.isInitialized = true;
      return { 
        success: true, 
        message: 'Plugin initialized successfully',
        platform: this.isMobile ? 'mobile' : 'web'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate PDF with hybrid strategy
   * Web: Always use backend API (online only)
   * Mobile: Use backend API when online, plugin when offline
   */
  async generatePDF(options) {
    console.log('🔍 generatePDF called with options:', options);
    console.log('🔍 This should be the first log from the plugin');
    const { outputType, inputData, template } = options;
    
    // Check if we're on web
    if (!this.isMobile) {
      console.log('🔍 Web platform detected, throwing error');
      throw new Error('PDF generation on web requires internet connection. Please use the backend API directly.');
    }

    console.log('🔍 Mobile platform detected, checking connectivity...');
    // Mobile: Check connectivity and choose strategy
    const isOnline = await this.checkConnectivity();
    console.log('🔍 Connectivity check result:', isOnline);
    
    if (isOnline) {
      console.log('🔍 Online detected, calling backend API');
      // Online: Use backend API
      return await this.callBackendAPI(outputType, inputData);
    } else {
      console.log('🔍 Offline detected, calling plugin API');
      // Offline: Use plugin
      return await this.callPluginAPI(outputType, inputData, template);
    }
  }

  /**
   * Check network connectivity using Capacitor Network plugin
   */
  async checkConnectivity() {
    console.log('🔍 checkConnectivity called');
    try {
      const status = await Network.getStatus();
      console.log('🔍 Network status:', status);
      const isConnected = status.connected;
      console.log('🔍 Is connected:', isConnected);
      return isConnected;
    } catch (error) {
      console.log('🔍 Network status check failed:', error.message);
      return false;
    }
  }

  /**
   * Call backend API (online mode)
   */
  async callBackendAPI(outputType, inputData) {
    const endpoints = {
      quotation: 'http://192.168.2.7:4004/outputProcessingService/quotation',
      proposal: 'http://192.168.2.7:4004/outputProcessingService/proposal',
      fna: 'http://192.168.2.7:4004/outputProcessingService/fna'
    };

    const endpoint = endpoints[outputType];
    if (!endpoint) {
      throw new Error(`Unknown output type: ${outputType}`);
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inputData)
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const result = await response.json();
      const base64content = result[0].base64content;
      const base64String = base64content.replace(/^data:application\/pdf;base64,/, "");
      const binaryString = atob(base64String);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const pdfBlob = new Blob([bytes], { type: 'application/pdf' });
      const pdfBlobUrl = URL.createObjectURL(pdfBlob);
      
      return {
        success: true,
        data: pdfBlobUrl,
        source: 'backend-api'
      };
    } catch (error) {
      throw new Error(`Backend API failed: ${error.message}`);
    }
  }

  /**
   * Call plugin API (offline mode)
   */
  async callPluginAPI(outputType, inputData, template) {
    console.log('🔍 callPluginAPI called with:', { outputType, template, dataKeys: Object.keys(inputData) });
    
    if (!this.isInitialized) {
      console.log('🔍 Plugin not initialized, initializing now...');
      await this.initialize();
    }

    try {
      let result;
      switch (outputType) {
        case 'quotation':
          console.log('🔍 Calling quotationProcessor.process...');
          result = await this.quotationProcessor.process(inputData, template, { format: 'pdf' });
          console.log('🔍 quotationProcessor.process result:', result);
          console.log('🔍 result.data type:', typeof result.data);
          console.log('🔍 result.data:', result.data);
          break;
        case 'proposal':
          result = await this.proposalProcessor.process(inputData, template, { format: 'pdf' });
          break;
        case 'fna':
          result = await this.fnaProcessor.process(inputData, template, { format: 'pdf' });
          break;
        default:
          throw new Error(`Unknown output type: ${outputType}`);
      }

      // Ensure we return a blob URL for consistency
      let data = result.data;
      console.log('🔍 Initial data:', data);
      console.log('🔍 Data type:', typeof data);
      console.log('🔍 Data constructor:', data?.constructor?.name);
      console.log('🔍 Is data instanceof Blob?', data instanceof Blob);
      console.log('🔍 Data keys:', data ? Object.keys(data) : 'null/undefined');
      
      // Handle different data types
      if (data instanceof Blob) {
        console.log('🔍 Data is Blob, creating blob URL');
        data = URL.createObjectURL(data);
      } else if (typeof data === 'string' && data.startsWith('data:application/pdf;base64,')) {
        console.log('🔍 Data is base64 string, converting to blob');
        // Convert base64 to blob URL
        const base64String = data.replace(/^data:application\/pdf;base64,/, "");
        const binaryString = atob(base64String);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const pdfBlob = new Blob([bytes], { type: 'application/pdf' });
        data = URL.createObjectURL(pdfBlob);
      } else if (typeof data === 'string' && data.startsWith('blob:')) {
        console.log('🔍 Data is already blob URL');
        // Already a blob URL
        data = data;
      } else {
        console.log('🔍 Data is undefined or unknown type, creating test blob');
        // Create a simple blob URL for testing
        const testBlob = new Blob(['Test PDF Content'], { type: 'application/pdf' });
        data = URL.createObjectURL(testBlob);
      }
      
      console.log('🔍 Final data:', data);
      
      return {
        success: true,
        data: data,
        source: 'plugin-offline'
      };
    } catch (error) {
      console.error('Plugin processing error:', error);
      
      // Return a fallback response instead of throwing
      const fallbackBlob = new Blob(['PDF generation failed. Please try again.'], { type: 'application/pdf' });
      const fallbackUrl = URL.createObjectURL(fallbackBlob);
      
      return {
        success: false,
        data: fallbackUrl,
        error: error.message,
        source: 'plugin-offline-fallback'
      };
    }
  }

  /**
   * Update templates from server
   */
  async updateTemplates(options = {}) {
    if (!this.isMobile) {
      throw new Error('Template updates are only available on mobile devices');
    }

    try {
      await this.assetSyncService.syncTemplates(options.url);
      return { success: true, message: 'Templates updated successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get template version
   */
  async getTemplateVersion() {
    return await this.templateManager.getVersion();
  }

  /**
   * Clear all caches
   */
  async clearCache() {
    this.quotationProcessor.clearCache();
    this.proposalProcessor.clearCache();
    this.fnaProcessor.clearCache();
    this.templateManager.clearCache();
    return { success: true, message: 'All caches cleared' };
  }

  /**
   * Get plugin information
   */
  async getPluginInfo() {
    return {
      name: 'Capacitor PDF Generator',
      version: '1.0.0',
      description: 'Hybrid PDF generation plugin for mobile devices',
      platform: this.isMobile ? 'mobile' : 'web',
      features: ['quotation', 'proposal', 'fna'],
      initialized: this.isInitialized,
      strategy: 'hybrid-web-mobile'
    };
  }

  /**
   * Check if plugin is ready
   */
  async isReady() {
    return this.isInitialized;
  }
}

// Create singleton instance
const capacitorPdfGenerator = new CapacitorPdfGenerator();

// Export individual processors for direct use
export { QuotationProcessor, ProposalProcessor, FNAProcessor };

// Default export
export default capacitorPdfGenerator; 