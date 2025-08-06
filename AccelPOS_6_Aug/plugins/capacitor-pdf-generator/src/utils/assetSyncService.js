/**
 * Asset Sync Service
 * Handles downloading and updating templates from server
 */

export class AssetSyncService {
  constructor() {
    this.isInitialized = false;
    this.syncInProgress = false;
  }

  /**
   * Initialize the asset sync service
   */
  async initialize() {
    if (this.isInitialized) {
      return { success: true, message: 'Asset sync service already initialized' };
    }

    try {
      this.isInitialized = true;
      return { success: true, message: 'Asset sync service initialized successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync templates from server
   */
  async syncTemplates(manifestUrl) {
    if (this.syncInProgress) {
      return { success: false, error: 'Sync already in progress' };
    }

    this.syncInProgress = true;

    try {
      // Step 1: Download manifest
      const manifest = await this.downloadManifest(manifestUrl);
      
      // Step 2: Compare versions
      const needsUpdate = await this.compareVersions(manifest);
      
      if (!needsUpdate) {
        this.syncInProgress = false;
        return { success: true, message: 'Templates are up to date' };
      }
      
      // Step 3: Download new templates
      const templates = await this.downloadTemplates(manifest);
      
      // Step 4: Store templates locally
      await this.storeTemplates(templates);
      
      // Step 5: Update manifest
      await this.updateLocalManifest(manifest);
      
      this.syncInProgress = false;
      return { success: true, message: 'Templates updated successfully' };
    } catch (error) {
      this.syncInProgress = false;
      return { success: false, error: error.message };
    }
  }

  /**
   * Download manifest from server
   */
  async downloadManifest(manifestUrl) {
    try {
      const response = await fetch(manifestUrl);
      if (!response.ok) {
        throw new Error(`Failed to download manifest: ${response.status}`);
      }
      
      const manifest = await response.json();
      return manifest;
    } catch (error) {
      throw new Error(`Failed to download manifest: ${error.message}`);
    }
  }

  /**
   * Compare versions to determine if update is needed
   */
  async compareVersions(serverManifest) {
    try {
      // Get local manifest
      const localManifest = this.getLocalManifest();
      
      // Compare versions
      const serverVersion = serverManifest.version || '1.0.0';
      const localVersion = localManifest.version || '0.0.0';
      
      return this.isVersionNewer(serverVersion, localVersion);
    } catch (error) {
      // If no local manifest, update is needed
      return true;
    }
  }

  /**
   * Check if server version is newer than local version
   */
  isVersionNewer(serverVersion, localVersion) {
    const serverParts = serverVersion.split('.').map(Number);
    const localParts = localVersion.split('.').map(Number);
    
    for (let i = 0; i < Math.max(serverParts.length, localParts.length); i++) {
      const serverPart = serverParts[i] || 0;
      const localPart = localParts[i] || 0;
      
      if (serverPart > localPart) return true;
      if (serverPart < localPart) return false;
    }
    
    return false; // Versions are equal
  }

  /**
   * Download templates from server
   */
  async downloadTemplates(manifest) {
    const templates = {};
    
    try {
      // Download each template
      for (const [key, templateInfo] of Object.entries(manifest.templates)) {
        const templateUrl = templateInfo.url;
        const response = await fetch(templateUrl);
        
        if (response.ok) {
          const templateContent = await response.text();
          templates[key] = {
            content: templateContent,
            version: templateInfo.version,
            lastModified: templateInfo.lastModified
          };
        } else {
          console.warn(`Failed to download template: ${key}`);
        }
      }
      
      return templates;
    } catch (error) {
      throw new Error(`Failed to download templates: ${error.message}`);
    }
  }

  /**
   * Store templates locally
   */
  async storeTemplates(templates) {
    try {
      // Store in localStorage
      const templatesData = {};
      for (const [key, template] of Object.entries(templates)) {
        templatesData[key] = template;
      }
      
      localStorage.setItem('downloadedTemplates', JSON.stringify(templatesData));
      
      return { success: true, message: 'Templates stored successfully' };
    } catch (error) {
      throw new Error(`Failed to store templates: ${error.message}`);
    }
  }

  /**
   * Update local manifest
   */
  async updateLocalManifest(manifest) {
    try {
      localStorage.setItem('templateManifest', JSON.stringify(manifest));
      return { success: true, message: 'Local manifest updated' };
    } catch (error) {
      throw new Error(`Failed to update local manifest: ${error.message}`);
    }
  }

  /**
   * Get local manifest
   */
  getLocalManifest() {
    try {
      const manifestData = localStorage.getItem('templateManifest');
      return manifestData ? JSON.parse(manifestData) : null;
    } catch (error) {
      console.warn('Failed to get local manifest:', error.message);
      return null;
    }
  }

  /**
   * Get downloaded templates
   */
  getDownloadedTemplates() {
    try {
      const templatesData = localStorage.getItem('downloadedTemplates');
      return templatesData ? JSON.parse(templatesData) : {};
    } catch (error) {
      console.warn('Failed to get downloaded templates:', error.message);
      return {};
    }
  }

  /**
   * Clear downloaded templates
   */
  async clearDownloadedTemplates() {
    try {
      localStorage.removeItem('downloadedTemplates');
      localStorage.removeItem('templateManifest');
      return { success: true, message: 'Downloaded templates cleared' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isInitialized: this.isInitialized,
      syncInProgress: this.syncInProgress,
      localManifest: this.getLocalManifest(),
      downloadedTemplates: Object.keys(this.getDownloadedTemplates()).length
    };
  }

  /**
   * Force sync (ignore version check)
   */
  async forceSync(manifestUrl) {
    try {
      // Download manifest
      const manifest = await this.downloadManifest(manifestUrl);
      
      // Download templates
      const templates = await this.downloadTemplates(manifest);
      
      // Store templates
      await this.storeTemplates(templates);
      
      // Update manifest
      await this.updateLocalManifest(manifest);
      
      return { success: true, message: 'Force sync completed successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
} 