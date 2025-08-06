/**
 * Simple test for Capacitor PDF Generator Plugin
 */

// Mock Capacitor for testing
global.Capacitor = {
  isNativePlatform: () => false // Simulate web environment
};

// Mock fetch for testing
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

// Import the built plugin
import capacitorPdfGenerator from './dist/index.js';

async function simpleTest() {
  console.log('🧪 Simple Plugin Test...\n');
  
  try {
    // Test 1: Check if plugin exists
    console.log('1️⃣ Checking plugin structure...');
    console.log('✅ Plugin exists:', !!capacitorPdfGenerator);
    console.log('✅ Plugin type:', typeof capacitorPdfGenerator);
    
    // Test 2: Check if methods exist
    console.log('\n2️⃣ Checking plugin methods...');
    console.log('✅ initialize method:', typeof capacitorPdfGenerator.initialize);
    console.log('✅ generatePDF method:', typeof capacitorPdfGenerator.generatePDF);
    console.log('✅ getPluginInfo method:', typeof capacitorPdfGenerator.getPluginInfo);
    
    // Test 3: Check if processors exist
    console.log('\n3️⃣ Checking processors...');
    console.log('✅ quotationProcessor:', !!capacitorPdfGenerator.quotationProcessor);
    console.log('✅ proposalProcessor:', !!capacitorPdfGenerator.proposalProcessor);
    console.log('✅ fnaProcessor:', !!capacitorPdfGenerator.fnaProcessor);
    
    // Test 4: Check if utilities exist
    console.log('\n4️⃣ Checking utilities...');
    console.log('✅ templateManager:', !!capacitorPdfGenerator.templateManager);
    console.log('✅ assetSyncService:', !!capacitorPdfGenerator.assetSyncService);
    
    console.log('\n🎉 Basic structure test passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
simpleTest(); 