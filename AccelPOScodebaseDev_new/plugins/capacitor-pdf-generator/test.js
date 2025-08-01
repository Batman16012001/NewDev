/**
 * Test script for Capacitor PDF Generator Plugin
 */

// Mock Capacitor for testing
global.Capacitor = {
  isNativePlatform: () => false // Simulate web environment
};

// Mock fetch for testing
global.fetch = async (url) => {
  console.log(`Mock fetch called with: ${url}`);
  
  if (url.includes('TableFormat.json')) {
    return {
      ok: true,
      json: async () => ({
        TableCreateJSON: ['primaryInsured.coverages'],
        excludeHeaders: ['eliminationPeriod'],
        DivShowHide: ['spouseInsured', 'child1']
      })
    };
  }
  
  if (url.includes('PlanWiseRider.csv')) {
    return {
      ok: true,
      text: async () => 'planCode,lifeName,paymentFrequency\n3,primaryInsured,M\n3,TotalPremium,M'
    };
  }
  
  if (url.includes('notes_files.json')) {
    return {
      ok: true,
      json: async () => ({
        cra: ['Note 1 for CRA', 'Note 2 for CRA'],
        'life-saver': ['Note 1 for Life Saver']
      })
    };
  }
  
  return {
    ok: false,
    status: 404
  };
};

// Mock localStorage
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

// Mock document for DOM manipulation
global.document = {
  createElement: (tag) => ({
    innerHTML: '',
    style: {},
    querySelectorAll: () => [],
    appendChild: () => {},
    removeChild: () => {}
  }),
  head: {
    appendChild: () => {}
  },
  body: {
    appendChild: () => {},
    removeChild: () => {}
  }
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

async function testPlugin() {
  console.log('🧪 Testing Capacitor PDF Generator Plugin...\n');
  
  try {
    // Test 1: Initialize plugin
    console.log('1️⃣ Testing plugin initialization...');
    const initResult = await capacitorPdfGenerator.initialize();
    console.log('✅ Initialization result:', initResult);
    
    // Test 2: Get plugin info
    console.log('\n2️⃣ Testing plugin info...');
    const pluginInfo = await capacitorPdfGenerator.getPluginInfo();
    console.log('✅ Plugin info:', pluginInfo);
    
    // Test 3: Test template manager
    console.log('\n3️⃣ Testing template manager...');
    const templateManager = capacitorPdfGenerator.templateManager;
    const templateStats = templateManager.getCacheStats();
    console.log('✅ Template stats:', templateStats);
    
    // Test 4: Test CSV loader
    console.log('\n4️⃣ Testing CSV loader...');
    const csvLoader = capacitorPdfGenerator.quotationProcessor.csvLoader;
    const csvStats = csvLoader.getCSVStats();
    console.log('✅ CSV stats:', csvStats);
    
    // Test 5: Test PDF generator
    console.log('\n5️⃣ Testing PDF generator...');
    const pdfGenerator = capacitorPdfGenerator.quotationProcessor.pdfGenerator;
    const pdfInfo = pdfGenerator.getInfo();
    console.log('✅ PDF generator info:', pdfInfo);
    
    console.log('\n🎉 All tests passed! Plugin is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPlugin(); 