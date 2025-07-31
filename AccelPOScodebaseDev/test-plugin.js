// Test plugin import
const outputProcessing = require('output-processing-plugin');

console.log('Plugin imported:', outputProcessing);
console.log('Plugin type:', typeof outputProcessing);
console.log('Plugin methods:', Object.getOwnPropertyNames(outputProcessing));

if (outputProcessing && typeof outputProcessing.initialize === 'function') {
  console.log('✅ Plugin initialize method found');
} else {
  console.log('❌ Plugin initialize method NOT found');
}

if (outputProcessing && typeof outputProcessing.generateQuotation === 'function') {
  console.log('✅ Plugin generateQuotation method found');
} else {
  console.log('❌ Plugin generateQuotation method NOT found');
}