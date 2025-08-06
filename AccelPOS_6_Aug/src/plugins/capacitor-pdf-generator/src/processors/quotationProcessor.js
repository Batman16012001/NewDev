// /**
//  * Quotation Processor
//  * Ports business logic from quotepackgeService.js for quotation PDF generation
//  */

// import templateManager from '../utils/templateManager.js';
// import { CSVLoader } from '../utils/csvLoader.js';
// import { PDFGenerator } from '../utils/pdfGenerator.js';

// export class QuotationProcessor {
//   constructor() {
//     this.templateManager = templateManager;
//     this.csvLoader = new CSVLoader();
//     this.pdfGenerator = new PDFGenerator();
//     this.cache = new Map();
//     this.isInitialized = false;
//   }

//   /**
//    * Initialize the processor
//    */
//   async initialize() {
//     if (this.isInitialized) {
//       return { success: true, message: 'Quotation processor already initialized' };
//     }

//     try {
//       // Initialize dependencies
//       await this.csvLoader.initialize();
//       await this.pdfGenerator.initialize();

//       this.isInitialized = true;
//       return { success: true, message: 'Quotation processor initialized successfully' };
//     } catch (error) {
//       return { success: false, error: error.message };
//     }
//   }

//   /**
//    * Process quotation data and generate output
//    * Ported from frontend illustrationProcessing.js logic
//    */
//   async process(data, template, options) {
//     console.log('🔍 QuotationProcessor.process called with:', { template, options, dataKeys: Object.keys(data) });
//     console.log('🔍 Sample data values:', {
//       productName: data.productName,
//       productType: data.productType,
//       primaryInsured: data.primaryInsured ? Object.keys(data.primaryInsured) : 'undefined',
//       TotalPremium: data.TotalPremium ? Object.keys(data.TotalPremium) : 'undefined'
//     });

//     const startTime = Date.now();
//     const cacheKey = this.generateCacheKey(data, template, options);

//     // Check cache first
//     if (this.cache.has(cacheKey)) {
//       console.log('🔍 Returning cached result');
//       return this.cache.get(cacheKey);
//     }

//     try {
//       // Step 1: Process illustration input (same as frontend)
//       const planName = data.productName?.replace(/\s+/g, '-').toLowerCase() || '';
//       console.log('🔍 Plan name:', planName);
//       const config = await this.processIllustrationInput(data, planName);
//       console.log('🔍 Config loaded:', config ? 'success' : 'failed');

//       // Step 2: Create DOM from template (same as working version)
//       const dom = document.createElement('div');
//       dom.innerHTML = config.templateHtml;

//       console.log('🔍 Original template HTML length:', config.templateHtml.length);
//       console.log('🔍 Original template HTML preview:', config.templateHtml.substring(0, 500));

//       // Step 3: Fill template recursively
//       await this.fnKeyValueRecursiveCall(dom, data, config);
//       console.log('🔍 After filling template, DOM innerHTML length:', dom.innerHTML.length);

//       // Step 4: Show/hide sections
//       const divHideArray = this.fnfindShowHidePositions(dom, data, config);
//       this.fnfindArrayDifference(dom, divHideArray, config);

//       // Step 5: Inject notes
//       await this.fnnoteaccordingtoplantype(dom, planName, config.normalizedProductName);

//       // Step 6: Reconstruct full HTML document with CSS (same as working version)
//       const filledHtml = this.reconstructFullHtmlDocument(config.templateHtml, dom.innerHTML);

//       console.log('🔍 Final filled HTML length:', filledHtml.length);
//       console.log('🔍 Final filled HTML preview:', filledHtml.substring(0, 500));

//       // Step 7: Generate PDF/HTML
//       const result = await this.pdfGenerator.generatePDF(filledHtml, options || { format: 'pdf' });
//       console.log('🔍 PDF Generator result:', result);
//       console.log('🔍 Result type:', typeof result);
//       console.log('🔍 Result.data type:', typeof result?.data);
//       console.log('🔍 Result.data constructor:', result?.data?.constructor?.name);

//       // Cache the result
//       this.cache.set(cacheKey, result);

//       return result;
//     } catch (error) {
//       const errorResult = {
//         success: false,
//         error: `Quotation processing failed: ${error}`,
//         metadata: {
//           processingTime: Date.now() - startTime,
//           templateUsed: template || 'unknown',
//           outputSize: 0
//         }
//       };

//       this.cache.set(cacheKey, errorResult);
//       return errorResult;
//     }
//   }

//   /**
//    * Process illustration input (ported from frontend processIllustrationInput)
//    */
//   async processIllustrationInput(requestJSON, planName) {
//     console.log('🔍 processIllustrationInput called with planName:', planName);

//     // Normalize plan and product names
//     const normalizedPlanName = planName.replace(/\s+/g, '-').toLowerCase();
//     const normalizedProductName = (requestJSON.productType || '').replace(/\s+/g, '-').toLowerCase();
//     console.log("Plan:", normalizedPlanName);
//     console.log("Product:", normalizedProductName);

//     // Load template and config using template manager
//     const templateConfig = await this.templateManager.selectTemplateAndConfig({
//       productName: requestJSON.productName || '',
//       productType: requestJSON.productType || '',
//       planName: normalizedPlanName,
//       outputType: 'quotation'
//     });

//     console.log('templateConfig', templateConfig);

//     // Extract config values (same as frontend)
//     const tableFormatJson = templateConfig.tableFormatJson;
//     const TableCreateJSON = tableFormatJson.TableCreateJSON;
//     const protectionBenefitsRider = tableFormatJson.protectionBenefitsRider;
//     const healthBenefitsRider = tableFormatJson.healthBenefitsRider;
//     const disabilityBenefitsRider = tableFormatJson.disabilityBenefitsRider;
//     const RiderTablecreate = tableFormatJson.RiderTablecreate;
//     const lossoflife = tableFormatJson.lossoflife;
//     const lossofaccident = tableFormatJson.lossofaccident;
//     const riderData = tableFormatJson.rider_data;
//     const DivShowHide = tableFormatJson.DivShowHide;
//     const excludeHeaders = tableFormatJson.excludeHeaders;
//     const summarybenefit = tableFormatJson.summarybenefit;
//     const summarytable = tableFormatJson.summarytable;
//     let replacement = tableFormatJson.replacement;
//     replacement = Object.assign({}, ...replacement);
//     const summarybenefitekey = tableFormatJson.summarybenefitekey;

//     return {
//       templateHtml: templateConfig.templateHtml,
//       tableFormatJson: tableFormatJson,
//       normalizedProductName: normalizedProductName,
//       normalizedPlanName: normalizedPlanName,
//       TableCreateJSON,
//       protectionBenefitsRider,
//       healthBenefitsRider,
//       disabilityBenefitsRider,
//       RiderTablecreate,
//       lossoflife,
//       lossofaccident,
//       riderData,
//       DivShowHide,
//       excludeHeaders,
//       summarybenefit,
//       summarytable,
//       summarybenefitekey,
//       replacement,
//       requestJSON
//     };
//   }

//   /**
//    * Recursive key-value replacement (ported from frontend fnKeyValueRecursiveCall)
//    */
//   async fnKeyValueRecursiveCall(dom, data, config, keyPrefix = "") {
//     const {
//       TableCreateJSON,
//       excludeHeaders,
//       DivShowHide,
//       requestJSON,
//     } = config;

//     console.log(`🔍 fnKeyValueRecursiveCall called with keyPrefix: "${keyPrefix}", data type: ${typeof data}, data:`, data);

//     if (typeof data === 'object' && data !== null) {
//       for (const key in data) {
//         if (Object.prototype.hasOwnProperty.call(data, key)) {
//           const newKey = keyPrefix ? `${keyPrefix}.${key}` : key;
//           console.log(`🔍 Processing key: ${key}, newKey: ${newKey}, value type: ${typeof data[key]}`);

//           if (TableCreateJSON && TableCreateJSON.includes(newKey)) {
//             // Table generation: load products/riders from CSV
//             console.log(`🔍 Table generation for: ${newKey}`);
//             let Insured = newKey.split('.')[0];
//             let tabletype = newKey.split('.')[1];
//             const planCode = requestJSON.productCode;
//             const paymentFrequency = requestJSON.paymentFrequency;

//             // Load products/riders from CSV
//             const products = await this.csvLoader.loadPlanWiseRiderCSV(planCode, Insured, paymentFrequency);

//             const tableDiv = dom.querySelector(`[name="${newKey}"]`);
//             console.log(`🔍 Looking for table div with name="${newKey}"`);
//             console.log(`🔍 Table div found:`, tableDiv ? 'YES' : 'NO');

//             if (tableDiv) {
//               const tableContent = await this.fngenerateTable(data[key], config, newKey, products);
//               console.log(`🔍 Generated table content length:`, tableContent ? tableContent.length : 0);
//               console.log(`🔍 Generated table content preview:`, tableContent ? tableContent.substring(0, 200) : 'null');
//               tableDiv.innerHTML = tableContent;
//               console.log(`🔍 Table div innerHTML set successfully`);
//             } else {
//               console.log(`🔍 WARNING: No table div found for ${newKey}`);
//             }
//           } else {
//             await this.fnKeyValueRecursiveCall(dom, data[key], config, newKey);
//           }
//         }
//       }
//     } else {
//       // Replace placeholders
//       const replacedString = `||${keyPrefix}||`;
//       const originalHtml = dom.innerHTML;
//       dom.innerHTML = dom.innerHTML.replaceAll(replacedString, data);
//       if (originalHtml !== dom.innerHTML) {
//         console.log('🔍 Replaced placeholder:', replacedString, 'with value:', data);
//       }
//     }
//   }

//   /**
//    * Find sections to show/hide based on DivShowHide (ported from frontend)
//    */
//   fnfindShowHidePositions(dom, data, config, keyPrefix = "", DivHideArray = []) {
//     const { DivShowHide } = config;
//     if (typeof data === 'object' && data !== null) {
//       for (const key in data) {
//         if (Object.prototype.hasOwnProperty.call(data, key)) {
//           const newKey = keyPrefix ? `${keyPrefix}.${key}` : key;
//           if (DivShowHide && DivShowHide.includes(newKey)) {
//             DivHideArray.push(newKey);
//           }
//           this.fnfindShowHidePositions(dom, data[key], config, newKey, DivHideArray);
//         }
//       }
//     }
//     return DivHideArray;
//   }

//   /**
//    * Hide sections not present in data (ported from frontend)
//    */
//   fnfindArrayDifference(dom, DivHideArray, config) {
//     const { DivShowHide } = config;
//     const difference1 = DivHideArray.filter(element => !DivShowHide.includes(element));
//     const difference2 = DivShowHide.filter(element => !DivHideArray.includes(element));
//     const result = difference1.concat(difference2);
//     for (let i = 0; i < result.length; i++) {
//       const sectionDiv = dom.querySelector(`[name="${result[i]}"]`);
//       if (sectionDiv) {
//         sectionDiv.style.display = 'none';
//       }
//     }
//   }

//   /**
//    * Generate table HTML (ported from frontend fngenerateTable)
//    */
//   async fngenerateTable(data, config, newKey, products) {
//     const productName = this.getProductName(config);
//     const TableFormatJson = config.tableFormatJson;
//     const excludeHeaders = config.excludeHeaders || [];
//     let headers;
//     let rowHTML = '';
//     let tabletype = newKey.split('.')[1];

//     // Header logic (match frontend)
//     if (newKey === 'TotalPremium.Premiums') {
//       headers = Object.keys(data.Monthly).filter(key => ['PaymentFrequency', 'PremiumAmount'].includes(key));
//     } else if (
//       newKey === 'primaryInsured.coverages.0.AccountBalance.0.PremiumAmountOption1' ||
//       newKey === 'Accumulation.Rates'
//     ) {
//       headers = Object.keys(data).flatMap(key =>
//         !excludeHeaders.includes(key) && typeof data[key] === 'object' && data[key] !== null
//           ? Object.keys(data[key]).map(() => key)
//           : !excludeHeaders.includes(key)
//             ? key
//             : []
//       ).filter(Boolean);
//     } else {
//       headers = Array.isArray(data) && data.length > 0
//         ? Object.keys(data[0]).flatMap(key =>
//           !excludeHeaders.includes(key) && typeof data[0][key] === 'object'
//             ? Object.keys(data[0][key]).map(() => key)
//             : !excludeHeaders.includes(key)
//               ? key
//               : []
//         ).filter(Boolean)
//         : [];
//     }

//     // Header replacements
//     const headerHtml = headers.map(h => `<th class='c3 backcolor' style='color:#FFF'>${this.getHeaderReplacement(config, h)}</th>`).join('');

//     // Table type logic (same as frontend)
//     if (tabletype === 'coverages' && productName === 'life') {
//       rowHTML = this.fngenerateRowRiderTable(data, products, headers, newKey.split('.')[0], config);
//     } else if (tabletype === 'Premiums' && newKey !== 'TotalPremium.Premiums') {
//       if (productName === 'investment') {
//         const headersSequence = (TableFormatJson && TableFormatJson.hederssequence) || headers;
//         headers.sort((a, b) => headersSequence.indexOf(a) - headersSequence.indexOf(b));
//         rowHTML = this.fnillustationtable_investment(data, headers, config.replacement);
//       } else {
//         rowHTML = this.fnillustationtable(data, headers);
//       }
//     } else if (tabletype === 'summarybenefits') {
//       rowHTML = this.fnSummaryBeneFormula(newKey, data, products, headers, config);
//     } else if (tabletype === 'Premiums' && newKey === 'TotalPremium.Premiums') {
//       rowHTML = this.fnTotalPremium(data, headers, config);
//     } else if (tabletype === 'Maturity') {
//       rowHTML = this.fnmaturityAmount(data, headers, config);
//     } else if (tabletype === 'coverages' && productName === 'investment') {
//       const headersSequence = (TableFormatJson && TableFormatJson.hederssequence) || headers;
//       headers.sort((a, b) => headersSequence.indexOf(a) - headersSequence.indexOf(b));
//       rowHTML = this.fnPremiumtableinvestment(data, headers, config);
//     } else if (tabletype === 'coverages' && productName === 'cra') {
//       rowHTML = this.fncoveragescra(data, headers);
//     } else if (tabletype === 'Rates') {
//       rowHTML = this.fncreateaccumationrate(data, headers, config);
//     } else {
//       // Fallback: simple table
//       if (Array.isArray(data)) {
//         rowHTML = data.map(row => {
//           const cells = headers.map(header => {
//             const value = row[header] || '';
//             return `<td class='c3'>${this.fnaddCommaToValue(value)}</td>`;
//           }).join('');
//           return `<tr>${cells}</tr>`;
//         }).join('');
//       }
//     }

//     return `<table class='c3' style='width:100%'><thead><tr>${headerHtml}</tr></thead><tbody>${rowHTML}</tbody></table>`;
//   }

//   /**
//    * Generate rider table rows (ported from frontend fngenerateRowRiderTable)
//    */
//   fngenerateRowRiderTable(data, products, headers, insuredType, config) {
//     if (!Array.isArray(data) || data.length === 0) return '';

//     const productName = this.getProductName(config);
//     const TableFormatJson = config.tableFormatJson;
//     const excludeHeaders = config.excludeHeaders || [];

//     // Group products by section
//     const sections = {};
//     products.forEach(product => {
//       const section = product['primaryInsured Rider/ Rider Name'] || 'Other';
//       if (!sections[section]) {
//         sections[section] = [];
//       }
//       sections[section].push(product);
//     });

//     let rowHTML = '';

//     // Build section rows
//     const buildSectionRows = (sectionObj, sectionLabel) => {
//       let sectionHTML = '';
//       if (sectionLabel !== 'primaryInsured Rider') {
//         sectionHTML += `<tr><td colspan="${headers.length}" class="c3 backcolor" style="color:#FFF; font-weight:bold;">${sectionLabel}</td></tr>`;
//       }

//       sectionObj.forEach(product => {
//         const row = data.find(item => item.coverageLookup === product.Abbreviation);
//         if (row) {
//           const cells = headers.map(header => {
//             if (excludeHeaders.includes(header)) return '';
//             const value = row[header] || '';
//             return `<td class='c3'>${this.fnaddCommaToValue(value)}</td>`;
//           }).join('');
//           sectionHTML += `<tr>${cells}</tr>`;
//         }
//       });

//       return sectionHTML;
//     };

//     // Generate rows for each section
//     Object.entries(sections).forEach(([sectionName, sectionProducts]) => {
//       rowHTML += buildSectionRows(sectionProducts, sectionName);
//     });

//     return rowHTML;
//   }

//   /**
//    * Generate illustration table (ported from frontend)
//    */
//   fnillustationtable(data, headers) {
//     if (!Array.isArray(data)) return '';

//     return data.map(row => {
//       const cells = headers.map(header => {
//         const value = row[header] || '';
//         return `<td class='c3'>${this.fnaddCommaToValue(value)}</td>`;
//       }).join('');
//       return `<tr>${cells}</tr>`;
//     }).join('');
//   }

//   /**
//    * Generate investment illustration table (ported from frontend)
//    */
//   fnillustationtable_investment(data, headers, replacement = {}) {
//     if (!Array.isArray(data)) return '';

//     return data.map(row => {
//       const cells = headers.map(header => {
//         let value = row[header] || '';
//         if (replacement[header]) {
//           value = replacement[header];
//         }
//         return `<td class='c3'>${this.fnaddCommaToValue(value)}</td>`;
//       }).join('');
//       return `<tr>${cells}</tr>`;
//     }).join('');
//   }

//   /**
//    * Generate summary benefit formula (ported from frontend)
//    */
//   fnSummaryBeneFormula(oldKey, data, products, headers, config) {
//     if (!Array.isArray(data)) return '';

//     const productName = this.getProductName(config);
//     let rowHTML = '';

//     if (productName === 'life') {
//       // Group by rider type
//       const riderGroups = {};
//       products.forEach(product => {
//         const riderType = product['primaryInsured Rider/ Rider Name'] || 'Other';
//         if (!riderGroups[riderType]) {
//           riderGroups[riderType] = [];
//         }
//         riderGroups[riderType].push(product);
//       });

//       Object.entries(riderGroups).forEach(([riderType, riders]) => {
//         if (riderType !== 'primaryInsured Rider') {
//           rowHTML += `<tr><td colspan="${headers.length}" class="c3 backcolor" style="color:#FFF; font-weight:bold;">${riderType}</td></tr>`;
//         }

//         riders.forEach(rider => {
//           const row = data.find(item => item.coverageLookup === rider.Abbreviation);
//           if (row) {
//             const cells = headers.map(header => {
//               const value = row[header] || '';
//               return `<td class='c3'>${this.fnaddCommaToValue(value)}</td>`;
//             }).join('');
//             rowHTML += `<tr>${cells}</tr>`;
//           }
//         });
//       });
//     } else {
//       // Simple table for other products
//       rowHTML = this.fnillustationtable(data, headers);
//     }

//     return rowHTML;
//   }

//   /**
//    * Generate total premium table (ported from frontend)
//    */
//   fnTotalPremium(data, headers, config) {
//     if (!data || typeof data !== 'object') return '';

//     const frequencies = ['Monthly', 'Quarterly', 'Half Yearly', 'Annually'];
//     let rowHTML = '';

//     frequencies.forEach(freq => {
//       if (data[freq]) {
//         const cells = headers.map(header => {
//           const value = data[freq][header] || '';
//           return `<td class='c3'>${this.fnaddCommaToValue(value)}</td>`;
//         }).join('');
//         rowHTML += `<tr>${cells}</tr>`;
//       }
//     });

//     return rowHTML;
//   }

//   /**
//    * Generate maturity amount table (ported from frontend)
//    */
//   fnmaturityAmount(data, headers, config) {
//     let dataRows = '';
//     data.forEach(row => {
//       dataRows += '<tr>';
//       headers.forEach(header => {
//         let cellValue = row[header] && row[header].applicationValue ? row[header].applicationValue : '';
//         dataRows += `<td>${cellValue}</td>`;
//       });
//       dataRows += '</tr>';
//     });
//     return dataRows;
//   }

//   /**
//    * Generate premium table for investment (ported from frontend)
//    */
//   fnPremiumtableinvestment(data, headers, config) {
//     if (!Array.isArray(data)) return '';

//     return data.map(row => {
//       const cells = headers.map(header => {
//         const value = row[header] || '';
//         return `<td class='c3'>${this.fnaddCommaToValue(value)}</td>`;
//       }).join('');
//       return `<tr>${cells}</tr>`;
//     }).join('');
//   }

//   /**
//    * Generate coverages for CRA (ported from frontend)
//    */
//   fncoveragescra(data, headers) {
//     if (!Array.isArray(data)) return '';

//     return data.map(row => {
//       const cells = headers.map(header => {
//         const value = row[header] || '';
//         return `<td class='c3'>${this.fnaddCommaToValue(value)}</td>`;
//       }).join('');
//       return `<tr>${cells}</tr>`;
//     }).join('');
//   }

//   /**
//    * Create accumulation rate table (ported from frontend)
//    */
//   fncreateaccumationrate(data, headers, config) {
//     if (!Array.isArray(data)) return '';

//     return data.map(row => {
//       const cells = headers.map(header => {
//         const value = row[header] || '';
//         return `<td class='c3'>${this.fnaddCommaToValue(value)}</td>`;
//       }).join('');
//       return `<tr>${cells}</tr>`;
//     }).join('');
//   }

//   /**
//    * Get rider names from abbreviation (ported from frontend)
//    */
//   fnRiderNames(abbreviation, products) {
//     const product = products.find(p => p.Abbreviation === abbreviation);
//     return product ? product['primaryInsured Rider/ Rider Name'] : abbreviation;
//   }

//   /**
//    * Add comma to numeric values (ported from frontend)
//    */
//   fnaddCommaToValue(value) {
//     if (typeof value === 'number' || !isNaN(parseFloat(value))) {
//       return parseFloat(value).toLocaleString();
//       }
//     return value;
//   }

//   /**
//    * Get product name from config (ported from frontend)
//    */
//   getProductName(config) {
//     return config.normalizedProductName || 'life';
//   }

//   /**
//    * Get header replacement (ported from frontend)
//    */
//   getHeaderReplacement(config, header) {
//     return (config.replacement && config.replacement[header]) ? config.replacement[header] : header;
//   }

//   /**
//    * Inject notes according to plan type (ported from frontend)
//    */
//   async fnnoteaccordingtoplantype(dom, planname, productName) {
//     try {
//       // Use the correct path for plugin assets
//       const response = await fetch('/assets/notes/notes_files.json');
//       if (!response.ok) {
//         console.warn('Notes file not found at /assets/notes/notes_files.json, trying plugin asset path');
//         // Try plugin asset path
//         const altResponse = await fetch('./assets/notes/notes_files.json');
//         if (!altResponse.ok) {
//           console.warn('Notes file not found at plugin asset path either, using default notes');
//           this.injectDefaultNotes(dom, planname, productName);
//           return;
//         }
//         const notesData = await altResponse.json();
//         this.injectNotes(dom, planname, productName, notesData);
//       } else {
//         const notesData = await response.json();
//         this.injectNotes(dom, planname, productName, notesData);
//       }
//     } catch (error) {
//       console.warn('Failed to load notes:', error.message);
//       // Try to inject default notes as fallback
//       this.injectDefaultNotes(dom, planname, productName);
//     }
//   }

//   /**
//    * Inject notes into the DOM
//    */
//   injectNotes(dom, planname, productName, notesData) {
//     planname = planname.replace(/\s+/g, '_').toLowerCase();
//     let notesList = [];

//     if (productName === 'life') {
//       if (notesData['common']) notesList = notesList.concat(notesData['common']);
//       if (notesData['common_another']) notesList = notesList.concat(notesData['common_another']);
//       if (notesData[planname]) notesList = notesList.concat(notesData[planname]);
//     } else {
//       if (notesData[productName]) notesList = notesList.concat(notesData[productName]);
//     }

//     if (notesList.length > 0) {
//       const notesDiv = dom.querySelector('[name="notes"]');
//       if (notesDiv) {
//         const notesHTML = notesList.map(note => `<p class="note">${note}</p>`).join('');
//         notesDiv.innerHTML = notesHTML;
//       }
//     }
//   }

//   /**
//    * Inject default notes as fallback
//    */
//   injectDefaultNotes(dom, planname, productName) {
//     const defaultNotes = [
//       "This is only a quotation. The company will determine the final premium and the benefits of the receipt of the proposal and medical Reports (Questionnaire The policies issued will indicate the final premium benefits",
//       "Payment methods include Bank Standing Order, Credit Card Standing Order, or direct payments at Ceylinco Life Branch, Cargills Food City, Post Office, banking partners, or digital platforms (Ceylinco Life Website, mCash, eZ Cash, FriMi, Genie)",
//       "Check SMS receipt for payment confirmation",
//       "Quotation is valid for 30 days or until the next age nearer birthday",
//       "Any alterations to the quotation/illustration are not valid",
//       "Bonus assumptions are for illustration only and do not represent actual limits"
//     ];

//     const notesDiv = dom.querySelector('[name="notes"]');
//     if (notesDiv) {
//       const notesHTML = defaultNotes.map(note => `<p class="note">${note}</p>`).join('');
//       notesDiv.innerHTML = notesHTML;
//     }
//   }

//   /**
//    * Generate cache key
//    */
//   generateCacheKey(data, template, options) {
//     const dataStr = JSON.stringify(data);
//     const optionsStr = JSON.stringify(options);
//     return `${template}-${this.simpleHash(dataStr + optionsStr)}`;
//   }

//   /**
//    * Simple hash function
//    */
//   simpleHash(str) {
//     let hash = 0;
//     for (let i = 0; i < str.length; i++) {
//       const char = str.charCodeAt(i);
//       hash = ((hash << 5) - hash) + char;
//       hash = hash & hash; // Convert to 32-bit integer
//     }
//     return Math.abs(hash).toString(36);
//   }

//   /**
//    * Clear cache
//    */
//   clearCache() {
//     this.cache.clear();
//     return { success: true, message: 'Cache cleared successfully' };
//   }

//   /**
//    * Get cache statistics
//    */
//   getCacheStats() {
//     return {
//       cacheSize: this.cache.size,
//       cacheKeys: Array.from(this.cache.keys())
//     };
//   }

//   /**
//    * Reconstruct full HTML document with CSS (same as working version)
//    */
//   reconstructFullHtmlDocument(originalTemplate, filledBodyContent) {
//     // Parse the original template to extract head and body structure
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(originalTemplate, 'text/html');

//     // Get the head content (CSS, meta tags, etc.)
//     const headContent = doc.head.innerHTML;

//     // Get the body content and replace it with our filled content
//     const bodyElement = doc.body;
//     bodyElement.innerHTML = filledBodyContent;

//     // Reconstruct the full HTML document
//     const fullHtml = `<!DOCTYPE html>
// <html>
// <head>
// ${headContent}
// </head>
// <body>
// ${bodyElement.innerHTML}
// </body>
// </html>`;

//     return fullHtml;
//   }
// } 


/**
 * Quotation Processor
 * Ports business logic from quotepackgeService.js for quotation PDF generation
 */

import templateManager from '../utils/templateManager.js';
import { CSVLoader } from '../utils/csvLoader.js';
import { PDFGenerator } from '../utils/pdfGenerator.js';

export class QuotationProcessor {
  constructor() {
    this.templateManager = templateManager;
    this.csvLoader = new CSVLoader();
    this.pdfGenerator = new PDFGenerator();
    this.cache = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize the processor
   */
  async initialize() {
    if (this.isInitialized) {
      return { success: true, message: 'Quotation processor already initialized' };
    }

    try {
      // Initialize dependencies
      await this.csvLoader.initialize();
      await this.pdfGenerator.initialize();

      this.isInitialized = true;
      return { success: true, message: 'Quotation processor initialized successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Process quotation data and generate output
   * Ported from frontend illustrationProcessing.js logic
   */
  async process(data, template, options) {
    console.log('🔍 QuotationProcessor.process called with:', { template, options, dataKeys: Object.keys(data) });
    console.log('🔍 Sample data values:', {
      productName: data.productName,
      productType: data.productType,
      primaryInsured: data.primaryInsured ? Object.keys(data.primaryInsured) : 'undefined',
      TotalPremium: data.TotalPremium ? Object.keys(data.TotalPremium) : 'undefined'
    });

    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(data, template, options);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log('🔍 Returning cached result');
      return this.cache.get(cacheKey);
    }

    try {
      // Step 1: Process illustration input (same as frontend)
      const planName = data.productName?.replace(/\s+/g, '-').toLowerCase() || '';
      console.log('🔍 Plan name:', planName);
      const config = await this.processIllustrationInput(data, planName);
      console.log('🔍 Config loaded:', config ? 'success' : 'failed');

      // Step 2: Create DOM from template (same as working version)
      const dom = document.createElement('div');
      dom.innerHTML = config.templateHtml;

      console.log('🔍 Original template HTML length:', config.templateHtml.length);
      console.log('🔍 Original template HTML preview:', config.templateHtml.substring(0, 500));

      // Step 3: Fill template recursively
      await this.fnKeyValueRecursiveCall(dom, data, config);
      console.log('🔍 After filling template, DOM innerHTML length:', dom.innerHTML.length);

      // Step 4: Show/hide sections
      const divHideArray = this.fnfindShowHidePositions(dom, data, config);
      this.fnfindArrayDifference(dom, divHideArray, config);

      // Step 5: Inject notes
      await this.fnnoteaccordingtoplantype(dom, planName, config.normalizedProductName);

      // Step 6: Serialize filled DOM to HTML (same as working version)
      const filledHtml = dom.innerHTML;

      console.log('🔍 Final filled HTML length:', filledHtml.length);
      console.log('🔍 Final filled HTML preview:', filledHtml.substring(0, 500));

      // Step 7: Generate PDF/HTML
      const result = await this.pdfGenerator.generatePDF(filledHtml, options || { format: 'pdf' });
      console.log('🔍 PDF Generator result:', result);
      console.log('🔍 Result type:', typeof result);
      console.log('🔍 Result.data type:', typeof result?.data);
      console.log('🔍 Result.data constructor:', result?.data?.constructor?.name);

      // Cache the result
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: `Quotation processing failed: ${error}`,
        metadata: {
          processingTime: Date.now() - startTime,
          templateUsed: template || 'unknown',
          outputSize: 0
        }
      };

      this.cache.set(cacheKey, errorResult);
      return errorResult;
    }
  }

  /**
   * Process illustration input (ported from frontend processIllustrationInput)
   */
  async processIllustrationInput(requestJSON, planName) {
    console.log('🔍 processIllustrationInput called with planName:', planName);

    // Normalize plan and product names
    const normalizedPlanName = planName.replace(/\s+/g, '-').toLowerCase();
    const normalizedProductName = (requestJSON.productType || '').replace(/\s+/g, '-').toLowerCase();
    console.log("Plan:", normalizedPlanName);
    console.log("Product:", normalizedProductName);

    // Load template and config using template manager
    const templateConfig = await this.templateManager.selectTemplateAndConfig({
      productName: requestJSON.productName || '',
      productType: requestJSON.productType || '',
      planName: normalizedPlanName,
      outputType: 'quotation'
    });

    console.log('templateConfig', templateConfig);

    // Extract config values (same as frontend)
    const tableFormatJson = templateConfig.tableFormatJson;
    const TableCreateJSON = tableFormatJson.TableCreateJSON;
    const protectionBenefitsRider = tableFormatJson.protectionBenefitsRider;
    const healthBenefitsRider = tableFormatJson.healthBenefitsRider;
    const disabilityBenefitsRider = tableFormatJson.disabilityBenefitsRider;
    const RiderTablecreate = tableFormatJson.RiderTablecreate;
    const lossoflife = tableFormatJson.lossoflife;
    const lossofaccident = tableFormatJson.lossofaccident;
    const riderData = tableFormatJson.rider_data;
    const DivShowHide = tableFormatJson.DivShowHide;
    const excludeHeaders = tableFormatJson.excludeHeaders;
    const summarybenefit = tableFormatJson.summarybenefit;
    const summarytable = tableFormatJson.summarytable;
    let replacement = tableFormatJson.replacement;
    replacement = Object.assign({}, ...replacement);
    const summarybenefitekey = tableFormatJson.summarybenefitekey;

    return {
      templateHtml: templateConfig.templateHtml,
      tableFormatJson: tableFormatJson,
      normalizedProductName: normalizedProductName,
      normalizedPlanName: normalizedPlanName,
      TableCreateJSON,
      protectionBenefitsRider,
      healthBenefitsRider,
      disabilityBenefitsRider,
      RiderTablecreate,
      lossoflife,
      lossofaccident,
      riderData,
      DivShowHide,
      excludeHeaders,
      summarybenefit,
      summarytable,
      summarybenefitekey,
      replacement,
      requestJSON
    };
  }

  /**
   * Recursive key-value replacement (ported from frontend fnKeyValueRecursiveCall)
   */
  async fnKeyValueRecursiveCall(dom, data, config, keyPrefix = "") {
    const {
      TableCreateJSON,
      excludeHeaders,
      DivShowHide,
      requestJSON,
    } = config;

    console.log(`🔍 fnKeyValueRecursiveCall called with keyPrefix: "${keyPrefix}", data type: ${typeof data}, data:`, data);

    if (typeof data === 'object' && data !== null) {
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const newKey = keyPrefix ? `${keyPrefix}.${key}` : key;
          console.log(`🔍 Processing key: ${key}, newKey: ${newKey}, value type: ${typeof data[key]}`);

          if (TableCreateJSON && TableCreateJSON.includes(newKey)) {
            // Table generation: load products/riders from CSV
            console.log(`🔍 Table generation for: ${newKey}`);
            let Insured = newKey.split('.')[0];
            let tabletype = newKey.split('.')[1];
            const planCode = requestJSON.productCode;
            const paymentFrequency = requestJSON.paymentFrequency;

            // Load products/riders from CSV
            const products = await this.csvLoader.loadPlanWiseRiderCSV(planCode, Insured, paymentFrequency);

            const tableDiv = dom.querySelector(`[name="${newKey}"]`);
            console.log(`🔍 Looking for table div with name="${newKey}"`);
            console.log(`🔍 Table div found:`, tableDiv ? 'YES' : 'NO');

            if (tableDiv) {
              const tableContent = await this.fngenerateTable(data[key], config, newKey, products);
              console.log(`🔍 Generated table content length:`, tableContent ? tableContent.length : 0);
              console.log(`🔍 Generated table content preview:`, tableContent ? tableContent.substring(0, 200) : 'null');
              tableDiv.innerHTML = tableContent;
              console.log(`🔍 Table div innerHTML set successfully`);
            } else {
              console.log(`🔍 WARNING: No table div found for ${newKey}`);
            }
          } else {
            await this.fnKeyValueRecursiveCall(dom, data[key], config, newKey);
          }
        }
      }
    } else {
      // Replace placeholders
      const replacedString = `||${keyPrefix}||`;
      const originalHtml = dom.innerHTML;
      dom.innerHTML = dom.innerHTML.replaceAll(replacedString, data);
      if (originalHtml !== dom.innerHTML) {
        console.log('🔍 Replaced placeholder:', replacedString, 'with value:', data);
      }
    }
  }

  /**
   * Find sections to show/hide based on DivShowHide (ported from frontend)
   */
  fnfindShowHidePositions(dom, data, config, keyPrefix = "", DivHideArray = []) {
    const { DivShowHide } = config;
    if (typeof data === 'object' && data !== null) {
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const newKey = keyPrefix ? `${keyPrefix}.${key}` : key;
          if (DivShowHide && DivShowHide.includes(newKey)) {
            DivHideArray.push(newKey);
          }
          this.fnfindShowHidePositions(dom, data[key], config, newKey, DivHideArray);
        }
      }
    }
    return DivHideArray;
  }

  /**
   * Hide sections not present in data (ported from frontend)
   */
  fnfindArrayDifference(dom, DivHideArray, config) {
    const { DivShowHide } = config;
    const difference1 = DivHideArray.filter(element => !DivShowHide.includes(element));
    const difference2 = DivShowHide.filter(element => !DivHideArray.includes(element));
    const result = difference1.concat(difference2);
    for (let i = 0; i < result.length; i++) {
      const sectionDiv = dom.querySelector(`[name="${result[i]}"]`);
      if (sectionDiv) {
        sectionDiv.style.display = 'none';
      }
    }
  }

  /**
   * Generate table HTML (ported from frontend fngenerateTable)
   */
  async fngenerateTable(data, config, newKey, products) {
    const productName = this.getProductName(config);
    const TableFormatJson = config.tableFormatJson;
    const excludeHeaders = config.excludeHeaders || [];
    let headers;
    let rowHTML = '';
    let tabletype = newKey.split('.')[1];

    // Header logic (match frontend)
    if (newKey === 'TotalPremium.Premiums') {
      headers = Object.keys(data.Monthly).filter(key => ['PaymentFrequency', 'PremiumAmount'].includes(key));
    } else if (
      newKey === 'primaryInsured.coverages.0.AccountBalance.0.PremiumAmountOption1' ||
      newKey === 'Accumulation.Rates'
    ) {
      headers = Object.keys(data).flatMap(key =>
        !excludeHeaders.includes(key) && typeof data[key] === 'object' && data[key] !== null
          ? Object.keys(data[key]).map(() => key)
          : !excludeHeaders.includes(key)
            ? key
            : []
      ).filter(Boolean);
    } else {
      headers = Array.isArray(data) && data.length > 0
        ? Object.keys(data[0]).flatMap(key =>
          !excludeHeaders.includes(key) && typeof data[0][key] === 'object'
            ? Object.keys(data[0][key]).map(() => key)
            : !excludeHeaders.includes(key)
              ? key
              : []
        ).filter(Boolean)
        : [];
    }

    // Header replacements
    const headerHtml = headers.map(h => `<th class='c3 backcolor' style='color:#FFF'>${this.getHeaderReplacement(config, h)}</th>`).join('');

    // Table type logic (same as frontend)
    if (tabletype === 'coverages' && productName === 'life') {
      rowHTML = this.fngenerateRowRiderTable(data, products, headers, newKey.split('.')[0], config);
    } else if (tabletype === 'Premiums' && newKey !== 'TotalPremium.Premiums') {
      if (productName === 'investment') {
        const headersSequence = (TableFormatJson && TableFormatJson.hederssequence) || headers;
        headers.sort((a, b) => headersSequence.indexOf(a) - headersSequence.indexOf(b));
        rowHTML = this.fnillustationtable_investment(data, headers, config.replacement);
      } else {
        rowHTML = this.fnillustationtable(data, headers);
      }
    } else if (tabletype === 'summarybenefits') {
      rowHTML = this.fnSummaryBeneFormula(newKey, data, products, headers, config);
    } else if (tabletype === 'Premiums' && newKey === 'TotalPremium.Premiums') {
      rowHTML = this.fnTotalPremium(data, headers, config);
    } else if (tabletype === 'Maturity') {
      rowHTML = this.fnmaturityAmount(data, headers, config);
    } else if (tabletype === 'coverages' && productName === 'investment') {
      const headersSequence = (TableFormatJson && TableFormatJson.hederssequence) || headers;
      headers.sort((a, b) => headersSequence.indexOf(a) - headersSequence.indexOf(b));
      rowHTML = this.fnPremiumtableinvestment(data, headers, config);
    } else if (tabletype === 'coverages' && productName === 'cra') {
      rowHTML = this.fncoveragescra(data, headers);
    } else if (tabletype === 'Rates') {
      rowHTML = this.fncreateaccumationrate(data, headers, config);
    } else {
      // Fallback: simple table
      if (Array.isArray(data)) {
        rowHTML = data.map(row => {
          const cells = headers.map(header => {
            const value = row[header] || '';
            return `<td class='c3'>${this.fnaddCommaToValue(value)}</td>`;
          }).join('');
          return `<tr>${cells}</tr>`;
        }).join('');
      }
    }

    return `<table border=\"1\" width=\"100%\" class=\"table3\" style=\"border-collapse:collapse\"><thead><tr>${headerHtml}</tr></thead><tbody>${rowHTML}</tbody></table>`;
  }

  /**
   * Generate rider table rows (ported from frontend fngenerateRowRiderTable)
   */
  fngenerateRowRiderTable(data, products, headers, insuredType, config) {
    if (!Array.isArray(data) || data.length === 0) return '';

    const productName = this.getProductName(config);
    const TableFormatJson = config.tableFormatJson;
    const excludeHeaders = config.excludeHeaders || [];

    // Group products by section
    const sections = {};
    products.forEach(product => {
      const section = product['primaryInsured Rider/ Rider Name'] || 'Other';
      if (!sections[section]) {
        sections[section] = [];
      }
      sections[section].push(product);
    });

    let rowHTML = '';

    // Build section rows
    const buildSectionRows = (sectionObj, sectionLabel) => {
      let sectionHTML = '';
      if (sectionLabel !== 'primaryInsured Rider') {
        sectionHTML += `<tr><td colspan="${headers.length}" class="c3 backcolor" style="color:#FFF; font-weight:bold;">${sectionLabel}</td></tr>`;
      }

      sectionObj.forEach(product => {
        const row = data.find(item => item.coverageLookup === product.Abbreviation);
        if (row) {
          const cells = headers.map(header => {
            if (excludeHeaders.includes(header)) return '';
            const value = row[header] || '';
            return `<td class='c3'>${this.fnaddCommaToValue(value)}</td>`;
          }).join('');
          sectionHTML += `<tr>${cells}</tr>`;
        }
      });

      return sectionHTML;
    };

    // Generate rows for each section
    Object.entries(sections).forEach(([sectionName, sectionProducts]) => {
      rowHTML += buildSectionRows(sectionProducts, sectionName);
    });

    return rowHTML;
  }

  /**
   * Generate illustration table (ported from frontend)
   */
  fnillustationtable(data, headers) {
    if (!Array.isArray(data)) return '';

    return data.map(row => {
      const cells = headers.map(header => {
        const value = row[header] || '';
        return `<td class='c3'>${this.fnaddCommaToValue(value)}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
  }

  /**
   * Generate investment illustration table (ported from frontend)
   */
  fnillustationtable_investment(data, headers, replacement = {}) {
    if (!Array.isArray(data)) return '';

    return data.map(row => {
      const cells = headers.map(header => {
        let value = row[header] || '';
        if (replacement[header]) {
          value = replacement[header];
        }
        return `<td class='c3'>${this.fnaddCommaToValue(value)}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
  }

  /**
   * Generate summary benefit formula (ported from frontend)
   */
  fnSummaryBeneFormula(oldKey, data, products, headers, config) {
    if (!Array.isArray(data)) return '';

    const productName = this.getProductName(config);
    let rowHTML = '';

    if (productName === 'life') {
      // Group by rider type
      const riderGroups = {};
      products.forEach(product => {
        const riderType = product['primaryInsured Rider/ Rider Name'] || 'Other';
        if (!riderGroups[riderType]) {
          riderGroups[riderType] = [];
        }
        riderGroups[riderType].push(product);
      });

      Object.entries(riderGroups).forEach(([riderType, riders]) => {
        if (riderType !== 'primaryInsured Rider') {
          rowHTML += `<tr><td colspan="${headers.length}" class="c3 backcolor" style="color:#FFF; font-weight:bold;">${riderType}</td></tr>`;
        }

        riders.forEach(rider => {
          const row = data.find(item => item.coverageLookup === rider.Abbreviation);
          if (row) {
            const cells = headers.map(header => {
              const value = row[header] || '';
              return `<td class='c3'>${this.fnaddCommaToValue(value)}</td>`;
            }).join('');
            rowHTML += `<tr>${cells}</tr>`;
          }
        });
      });
    } else {
      // Simple table for other products
      rowHTML = this.fnillustationtable(data, headers);
    }

    return rowHTML;
  }

  /**
   * Generate total premium table (ported from frontend)
   */
  fnTotalPremium(data, headers, config) {
    if (!data || typeof data !== 'object') return '';

    const frequencies = ['Monthly', 'Quarterly', 'Half Yearly', 'Annually'];
    let rowHTML = '';

    frequencies.forEach(freq => {
      if (data[freq]) {
        const cells = headers.map(header => {
          const value = data[freq][header] || '';
          return `<td class='c3'>${this.fnaddCommaToValue(value)}</td>`;
        }).join('');
        rowHTML += `<tr>${cells}</tr>`;
      }
    });

    return rowHTML;
  }

  /**
   * Generate maturity amount table (ported from frontend)
   */
  fnmaturityAmount(data, headers, config) {
    let dataRows = '';
    data.forEach(row => {
      dataRows += '<tr>';
      headers.forEach(header => {
        let cellValue = row[header] && row[header].applicationValue ? row[header].applicationValue : '';
        dataRows += `<td>${cellValue}</td>`;
      });
      dataRows += '</tr>';
    });
    return dataRows;
  }

  /**
   * Generate premium table for investment (ported from frontend)
   */
  fnPremiumtableinvestment(data, headers, config) {
    if (!Array.isArray(data)) return '';

    return data.map(row => {
      const cells = headers.map(header => {
        const value = row[header] || '';
        return `<td class='c3'>${this.fnaddCommaToValue(value)}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
  }

  /**
   * Generate coverages for CRA (ported from frontend)
   */
  fncoveragescra(data, headers) {
    if (!Array.isArray(data)) return '';

    return data.map(row => {
      const cells = headers.map(header => {
        const value = row[header] || '';
        return `<td class='c3'>${this.fnaddCommaToValue(value)}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
  }

  /**
   * Create accumulation rate table (ported from frontend)
   */
  fncreateaccumationrate(data, headers, config) {
    if (!Array.isArray(data)) return '';

    return data.map(row => {
      const cells = headers.map(header => {
        const value = row[header] || '';
        return `<td class='c3'>${this.fnaddCommaToValue(value)}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
  }

  /**
   * Get rider names from abbreviation (ported from frontend)
   */
  fnRiderNames(abbreviation, products) {
    const product = products.find(p => p.Abbreviation === abbreviation);
    return product ? product['primaryInsured Rider/ Rider Name'] : abbreviation;
  }

  /**
   * Add comma to numeric values (ported from frontend)
   */
  fnaddCommaToValue(value) {
    if (typeof value === 'number' || !isNaN(parseFloat(value))) {
      return parseFloat(value).toLocaleString();
    }
    return value;
  }

  /**
   * Get product name from config (ported from frontend)
   */
  getProductName(config) {
    return config.normalizedProductName || 'life';
  }

  /**
   * Get header replacement (ported from frontend)
   */
  getHeaderReplacement(config, header) {
    return (config.replacement && config.replacement[header]) ? config.replacement[header] : header;
  }

  /**
   * Inject notes according to plan type (ported from frontend)
   */
  async fnnoteaccordingtoplantype(dom, planname, productName) {
    try {
      // Load notes from plugin assets
      const notesResp = await fetch('/assets/notes/notes_files.json');
      const notesfilesjson = await notesResp.json();
      planname = planname.replace(/\s+/g, '_').toLowerCase();
      let notesList = [];
      if (productName === 'life') {
        if (notesfilesjson['common']) notesList = notesList.concat(notesfilesjson['common']);
        if (notesfilesjson['common_another']) notesList = notesList.concat(notesfilesjson['common_another']);
        if (notesfilesjson[planname]) notesList = notesList.concat(notesfilesjson[planname]);
      } else {
        if (notesfilesjson[productName]) notesList = notesList.concat(notesfilesjson[productName]);
      }
      let ul = '<ul>';
      notesList.forEach(note => {
        ul += `<li>${note}</li>`;
      });
      ul += '</ul>';
      const tableDiv = dom.querySelector('[name="notes"]');
      if (tableDiv) {
        tableDiv.innerHTML = ul;
      }
    } catch (error) {
      console.warn('Failed to load notes:', error.message);
    }
  }

  /**
   * Generate cache key
   */
  generateCacheKey(data, template, options) {
    const dataStr = JSON.stringify(data);
    const optionsStr = JSON.stringify(options);
    return `${template}-${this.simpleHash(dataStr + optionsStr)}`;
  }

  /**
   * Simple hash function
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    return { success: true, message: 'Cache cleared successfully' };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      cacheKeys: Array.from(this.cache.keys())
    };
  }
} 