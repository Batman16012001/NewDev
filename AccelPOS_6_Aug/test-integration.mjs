/**
 * Integration Test for Capacitor PDF Generator Plugin
 * This test simulates the QuotationOutput.js integration
 */

// Mock Capacitor Network
global.Network = {
  getStatus: async () => ({ connected: false }) // Simulate offline
};

// Mock Capacitor
global.Capacitor = {
  isNativePlatform: () => false
};

// Mock fetch
global.fetch = async (url) => {
  console.log(`Mock fetch called with: ${url}`);
  return {
    ok: true,
    json: async () => ({}),
    text: async () => ''
  };
};

// Mock localStorage
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

// Mock document
global.document = {
  createElement: () => ({
    innerHTML: '',
    style: {},
    querySelectorAll: () => []
  }),
  head: { appendChild: () => {} },
  body: { appendChild: () => {}, removeChild: () => {} }
};

// Mock window
global.window = {
  html2pdf: () => ({
    from: () => ({
      set: () => ({
        outputPdf: () => Promise.resolve(new Blob(['test'], { type: 'application/pdf' }))
      })
    })
  })
};

// Import the plugin
import capacitorPdfGenerator from 'capacitor-pdf-generator';

async function testIntegration() {
  console.log('🧪 Testing Plugin Integration...\n');
  
  try {
    // Test 1: Initialize plugin
    console.log('1️⃣ Testing plugin initialization...');
    await capacitorPdfGenerator.initialize();
    console.log('✅ Plugin initialized successfully');
    
    // Test 2: Test with sample quotation data
    console.log('\n2️⃣ Testing PDF generation with sample data...');
    
    const sampleQuotedata = {
      "QuoteId": "SQS123456789",
      "applicationType": "03",
      "productType": "Life",
      "productName": "Endowment",
      "productCode": "3",
      "residentialExtra": "No",
      "paymentFrequency": "M",
      "contributionFund": 1000,
      "primaryInsured": {
        "coverages": [
          {
            "coverageLookup": "basic plan",
            "benefitPeriod": { "applicationValue": 5 },
            "eliminationPeriod": { "applicationValue": 0 },
            "benefitAmount": { "applicationValue": 37 },
            "Premium": { "applicationValue": "548" }
          }
        ],
        "person": {
          "name": "John Doe",
          "age": 30,
          "gender": "Male",
          "dob": "1993-01-01"
        }
      }
    };
    
    const result = await capacitorPdfGenerator.generatePDF({
      outputType: 'quotation',
      inputData: sampleQuotedata,
      template: 'endowment'
    });
    
    console.log('✅ PDF generation result:', result);
    
    if (result.success) {
      console.log('✅ PDF generated successfully');
      console.log('✅ Data type:', typeof result.data);
      console.log('✅ Is Blob:', result.data instanceof Blob);
    } else {
      console.error('❌ PDF generation failed:', result.error);
    }
    
    console.log('\n🎉 Integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
  }
}

// Run the test
testIntegration(); 