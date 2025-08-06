# Capacitor PDF Generator Plugin

A Capacitor plugin for generating PDF outputs offline with hybrid web/mobile strategy.

## 🎯 Overview

This plugin provides a unified solution for PDF generation across different platforms:

- **Web**: Always uses backend API (online only)
- **Mobile**: Uses backend API when online, plugin when offline
- **Offline Capability**: Full offline PDF generation on mobile devices
- **Template Management**: Dynamic template updates without app rebuilds

## 🏗️ Architecture

### Hybrid Strategy

```
Platform Detection → Connectivity Check → Processing Method
     ↓                    ↓                    ↓
   Web?              Online?              Backend API
     ↓                    ↓                    ↓
   Mobile?           Offline?              Plugin
```

### Plugin Structure

```
capacitor-pdf-generator/
├── src/
│   ├── index.js                    # Plugin interface
│   ├── web/
│   │   ├── engine.html             # Template rendering engine
│   │   ├── engine.js               # Business logic execution
│   │   └── template-assets/        # Downloaded templates
│   ├── processors/
│   │   ├── quotationProcessor.js   # Quotation processing
│   │   ├── proposalProcessor.js    # Proposal processing
│   │   └── fnaProcessor.js         # FNA processing
│   └── utils/
│       ├── templateManager.js      # Template loading & caching
│       ├── csvLoader.js            # CSV data processing
│       ├── pdfGenerator.js         # PDF generation utilities
│       └── assetSyncService.js     # Template updates
├── assets/
│   └── templates/                  # Default bundled templates
├── android/                        # Android native code
├── ios/                           # iOS native code
└── package.json
```

## 🚀 Installation

### 1. Install Plugin

```bash
cd AccelPOScodebaseDev
npm install ./plugins/capacitor-pdf-generator
```

### 2. Build Plugin

```bash
cd plugins/capacitor-pdf-generator
npm run build
```

### 3. Sync Capacitor

```bash
cd AccelPOScodebaseDev
npx cap sync
```

## 📱 Usage

### Basic Usage

```javascript
import capacitorPdfGenerator from 'capacitor-pdf-generator';

// Initialize plugin
await capacitorPdfGenerator.initialize();

// Generate PDF
const result = await capacitorPdfGenerator.generatePDF({
  outputType: 'quotation',
  inputData: {
    QuoteId: 'SQS123456',
    productName: 'Endowment',
    productType: 'Life',
    productCode: '3',
    paymentFrequency: 'M',
    contributionFund: 1000,
    primaryInsured: {
      person: {
        name: { first: 'John', last: 'Doe' },
        age: 35,
        gender: 'Male',
        occupation: 'Engineer'
      }
    }
  }
});

if (result.success) {
  console.log('PDF generated:', result.data);
} else {
  console.error('PDF generation failed:', result.error);
}
```

### Platform-Specific Behavior

#### Web (Browser)
```javascript
// Web always uses backend API
const result = await capacitorPdfGenerator.generatePDF({
  outputType: 'quotation',
  inputData: data
});
// Throws error if offline: "PDF generation on web requires internet connection"
```

#### Mobile (Android/iOS)
```javascript
// Mobile uses hybrid approach
const result = await capacitorPdfGenerator.generatePDF({
  outputType: 'quotation',
  inputData: data
});
// Online: Uses backend API
// Offline: Uses plugin with local templates
```

### Template Management

#### Update Templates
```javascript
// Download latest templates from server
await capacitorPdfGenerator.updateTemplates({
  url: 'https://your-server.com/templates/manifest.json'
});
```

#### Get Template Version
```javascript
const version = await capacitorPdfGenerator.getTemplateVersion();
console.log('Template version:', version);
```

### Cache Management

```javascript
// Clear all caches
await capacitorPdfGenerator.clearCache();

// Get cache statistics
const stats = await capacitorPdfGenerator.getCacheStats();
console.log('Cache stats:', stats);
```

## 🔧 Configuration

### Template Manifest

Create a manifest file on your server:

```json
{
  "version": "1.2.0",
  "templates": {
    "quotation/endowment": {
      "url": "https://your-server.com/templates/quotation/endowment/template.html",
      "version": "1.2.0",
      "lastModified": "2024-01-15T10:30:00Z"
    },
    "quotation/life-saver": {
      "url": "https://your-server.com/templates/quotation/life-saver/template.html",
      "version": "1.1.0",
      "lastModified": "2024-01-10T14:20:00Z"
    }
  }
}
```

### Asset Structure

```
assets/
├── templates/
│   ├── cra/
│   │   ├── sqs_template.html
│   │   ├── TableFormat.json
│   │   └── validation_request.json
│   ├── life-saver/
│   │   ├── sqs_template.html
│   │   ├── TableFormat.json
│   │   └── validation_request.json
│   ├── life/
│   ├── pradeepa/
│   ├── investment/
│   ├── advance-payment/
│   ├── proposal/
│   ├── fna/
│   └── notes_files.json
├── csv/
│   └── PlanWiseRider.csv
└── notes/
    └── notes_files.json
```

## 🧩 Business Logic Porting

The plugin ports business logic from your microservice:

### Quotation Processing
- Template selection logic
- CSV data loading and filtering
- DOM manipulation and table generation
- Show/hide logic
- Notes injection

### Data Flow
```
Input JSON → Template Selection → Data Processing → Template Filling → PDF Generation
```

## 📊 Supported Output Types

1. **Quotation** (`quotation`)
   - Endowment plans
   - Life Saver plans
   - Custom plans

2. **Proposal** (`proposal`)
   - Application forms
   - Interview data
   - Coverage details

3. **FNA** (`fna`)
   - Financial needs analysis
   - Risk assessment
   - Recommendations

## 🔄 Template Update System

### Priority Order
1. **Downloaded Assets** (from server)
2. **Bundled Assets** (default templates)
3. **Fallback Templates** (built-in)

### Update Process
1. Download manifest from server
2. Compare versions
3. Download new templates
4. Store locally
5. Update manifest

## 🛠️ Development

### Building the Plugin

```bash
cd plugins/capacitor-pdf-generator
npm run build
```

### Development Mode

```bash
npm run build:dev
npm run watch
```

### Testing

```bash
npm test
```

## 📝 API Reference

### Main Methods

#### `initialize()`
Initialize the plugin and all processors.

#### `generatePDF(options)`
Generate PDF with hybrid strategy.

**Parameters:**
- `outputType`: 'quotation' | 'proposal' | 'fna'
- `inputData`: JSON data for processing
- `template`: Optional template override

#### `updateTemplates(options)`
Update templates from server.

**Parameters:**
- `url`: Manifest URL

#### `getTemplateVersion()`
Get current template version information.

#### `clearCache()`
Clear all caches.

#### `getPluginInfo()`
Get plugin information and status.

### Processor Classes

#### `QuotationProcessor`
Handles quotation PDF generation.

#### `ProposalProcessor`
Handles proposal PDF generation.

#### `FNAProcessor`
Handles FNA PDF generation.

## 🚨 Error Handling

### Common Errors

1. **Web Offline Error**
   ```
   Error: PDF generation on web requires internet connection
   ```

2. **Template Not Found**
   ```
   Error: Template not found: templates/quotation/endowment/template.html
   ```

3. **CSV Loading Error**
   ```
   Warning: Failed to load PlanWiseRider.csv
   ```

### Error Recovery

- Plugin automatically falls back to bundled templates
- Default templates ensure basic functionality
- Cache prevents repeated failures

## 🔒 Security Considerations

- Templates are validated before use
- Local storage is used for downloaded assets
- No sensitive data is logged
- HTTPS required for template downloads

## 📈 Performance

### Optimization Features

- **Caching**: Results cached to avoid reprocessing
- **Lazy Loading**: Templates loaded on demand
- **Compression**: Assets compressed for faster downloads
- **Background Sync**: Templates updated in background

### Memory Management

- Automatic cache cleanup
- DOM elements properly disposed
- Large files handled efficiently

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:

1. Check the documentation
2. Review error logs
3. Test with minimal data
4. Contact development team

## 🔄 Version History

### v1.0.0
- Initial release
- Hybrid web/mobile strategy
- Template management system
- Offline PDF generation
- Business logic porting 