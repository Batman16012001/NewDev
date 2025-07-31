import { TemplateManager } from '../utils/templateManager.js';
import { CSVLoader } from '../utils/csvLoader.js';
import { PDFGenerator } from '../utils/pdfGenerator.js';

export class QuotationProcessor {
  constructor() {
    this.templateManager = TemplateManager.getInstance();
    this.csvLoader = CSVLoader.getInstance();
    this.pdfGenerator = PDFGenerator.getInstance();
    this.cache = new Map();
  }

  /**
   * Process quotation data and generate output
   * Ported from frontend illustrationProcessing.js logic
   */
  async process(data, template, options) {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(data, template, options);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Step 1: Process illustration input (same as frontend)
      const planName = data.productName?.replace(/\s+/g, '-').toLowerCase() || '';
      const config = await this.processIllustrationInput(data, planName);

      // Step 2: Create DOM from template
      const dom = document.createElement('div');
      dom.innerHTML = config.templateHtml;

      // Step 3: Fill template recursively
      await this.fnKeyValueRecursiveCall(dom, data, config);

      // Step 4: Show/hide sections
      const divHideArray = this.fnfindShowHidePositions(dom, data, config);
      this.fnfindArrayDifference(dom, divHideArray, config);

      // Step 5: Inject notes
      await this.fnnoteaccordingtoplantype(dom, planName, config.normalizedProductName);

      // Step 6: Serialize filled DOM to HTML
      const filledHtml = dom.innerHTML;

      // Step 7: Generate PDF/HTML
      const result = await this.pdfGenerator.generatePDF(filledHtml, options || { format: 'pdf' });

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
    // Normalize plan and product names
    const normalizedPlanName = planName.replace(/\s+/g, '-').toLowerCase();
    const normalizedProductName = (requestJSON.productType || '').replace(/\s+/g, '-').toLowerCase();
    console.log("Plan:", normalizedPlanName);         // Plan: life-saver-plus
    console.log("Product:", normalizedProductName);   // Product: proposal-document

    // Load template and config using template manager
    const templateConfig = await this.templateManager.selectTemplateAndConfig({
      productName: requestJSON.productName || '',
      productType: requestJSON.productType || '',
      planName: normalizedPlanName,
      outputType: 'quotation'
    });

    console.log('templateConfig', templateConfig)
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

    // Return all loaded and normalized data for next steps
    return {
      templateHtml: templateConfig.templateHtml,
      tableFormatJson,
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
      replacement,
      summarybenefitekey,
      normalizedPlanName,
      normalizedProductName,
      requestJSON
    };
  }

  /**
   * Recursive function to fill template with data and generate tables (ported from frontend)
   */
  async fnKeyValueRecursiveCall(dom, data, config, keyPrefix = "") {
    const {
      TableCreateJSON,
      excludeHeaders,
      DivShowHide,
      requestJSON,
    } = config;

    if (typeof data === 'object' && data !== null) {
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const newKey = keyPrefix ? `${keyPrefix}.${key}` : key;
          if (TableCreateJSON && TableCreateJSON.includes(newKey)) {
            // Table generation: load products/riders from CSV
            let Insured = newKey.split('.')[0];
            let tabletype = newKey.split('.')[1];
            const planCode = requestJSON.productCode;
            const paymentFrequency = requestJSON.paymentFrequency;

            // Load products/riders from CSV
            const products = await this.csvLoader.filterPlanWiseRiderCSV(planCode, Insured, paymentFrequency);

            const tableDiv = dom.querySelector(`[name="${newKey}"]`);
            if (tableDiv) {
              tableDiv.innerHTML = await this.fngenerateTable(data[key], config, newKey, products);
            }
          } else {
            await this.fnKeyValueRecursiveCall(dom, data[key], config, newKey);
          }
        }
      }
    } else {
      // Replace placeholders
      const replacedString = `||${keyPrefix}||`;
      dom.innerHTML = dom.innerHTML.replaceAll(replacedString, data);
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
        rowHTML = data.map(row =>
          '<tr>' + headers.map(h => `<td>${row[h] !== undefined ? row[h] : ''}</td>`).join('') + '</tr>'
        ).join('');
      }
    }

    return `<table border=\"1\" width=\"100%\" class=\"table3\" style=\"border-collapse:collapse\"><thead><tr>${headerHtml}</tr></thead><tbody>${rowHTML}</tbody></table>`;
  }

  /**
   * Generate row rider table (ported from frontend fngenerateRowRiderTable)
   */
  fngenerateRowRiderTable(data, products, headers, insuredType, config) {
    // Group products by section (protection, health, disability)
    const protectionBenefitsRider = config.protectionBenefitsRider || [];
    const healthBenefitsRider = config.healthBenefitsRider || [];
    const disabilityBenefitsRider = config.disabilityBenefitsRider || [];
    let protection_bene = {};
    let health_bene = {};
    let disability_bene = {};
    let detail_data = Object.keys(data);

    // Build benefit objects (same logic as frontend)
    if (products && Array.isArray(products)) {
      for (let i = 0; i < products.length; i++) {
        const coverage = products[i].abbreviation;
        for (let key = 0; key < detail_data.length; key++) {
          if (protectionBenefitsRider.includes(coverage)) {
            protection_bene[coverage] = {};
            if (data[key].coverageLookup === coverage) {
              for (const col in data[key]) {
                if (typeof data[key][col] === 'object') {
                  protection_bene[coverage][col] = data[key][col].applicationValue;
                } else {
                  protection_bene[coverage][col] = data[key][col] || "Not Available";
                }
              }
              break;
            } else {
              for (const col in data[0]) {
                protection_bene[coverage][col] = "Not Requested";
              }
            }
          }
          if (healthBenefitsRider.includes(coverage)) {
            health_bene[coverage] = {};
            if (data[key].coverageLookup === coverage) {
              for (const col in data[key]) {
                if (typeof data[key][col] === 'object') {
                  health_bene[coverage][col] = data[key][col].applicationValue;
                } else {
                  health_bene[coverage][col] = data[key][col] || "Not Available";
                }
              }
              break;
            } else {
              for (const col in data[0]) {
                health_bene[coverage][col] = "Not Requested";
              }
            }
          }
          if (disabilityBenefitsRider.includes(coverage)) {
            disability_bene[coverage] = {};
            if (data[key].coverageLookup === coverage) {
              for (const col in data[key]) {
                if (typeof data[key][col] === 'object') {
                  disability_bene[coverage][col] = data[key][col].applicationValue;
                } else {
                  disability_bene[coverage][col] = data[key][col] || "Not Available";
                }
              }
              break;
            } else {
              for (const col in data[0]) {
                disability_bene[coverage][col] = "Not Requested";
              }
            }
          }
        }
      }
    }

    // Helper to build section rows
    const buildSectionRows = (sectionObj, sectionLabel) => {
      let html = '';
      const keys = Object.keys(sectionObj);
      if (keys.length > 0) {
        html += `<tr><td colspan="${headers.length}"><span class="paddingLeft5"><b style="color: #000">${sectionLabel}</b></span></td></tr>`;
        keys.forEach(key => {
          html += '<tr>';
          html += `<td>${this.fnRiderNames(key, products)}</td>`;
          headers.slice(1).forEach(header => {
            let val = sectionObj[key][header];
            if (val !== undefined && val !== "Not Requested" && val !== "Not Available") {
              val = this.fnaddCommaToValue(val);
            }
            html += `<td class="text-center">${val !== undefined ? val : ''}</td>`;
          });
          html += '</tr>';
        });
      }
      return html;
    };

    let html = '';
    html += buildSectionRows(protection_bene, 'Protection Benefit');
    html += buildSectionRows(health_bene, 'Health Benefit');
    html += buildSectionRows(disability_bene, 'Disability Benefit');

    // Add total/premium row if needed (same as frontend)
    let termvalue, totalprevalue;
    for (let key = 0; key < detail_data.length; key++) {
      if (data[key].coverageLookup === "basic plan") {
        termvalue = data[key].benefitPeriod.applicationValue;
      }
      if (data[key].coverageLookup === "Total") {
        totalprevalue = data[key].Premium.applicationValue;
      }
    }
    if (termvalue !== undefined || totalprevalue !== undefined) {
      html += `<tr class="stripcolor"><td><span class="paddingLeft5"><b style="color: #000">Premium Payable</b></span></td>`;
      html += `<td class="text-center"><span class="paddingLeft5"><b style="color: #000">${termvalue !== undefined ? termvalue : ''}</b></span></td>`;
      html += `<td></td>`;
      html += `<td class="text-center"><span class="paddingLeft5"><b style="color: #000">${totalprevalue !== undefined ? totalprevalue : ''}</b></span></td></tr>`;
    }

    return html;
  }

  // All the helper functions ported from frontend
  fnillustationtable(data, headers) {
    let rowHTML = '';
    data.forEach(item => {
      rowHTML += '<tr>';
      headers.forEach(header => {
        rowHTML += `<td>${item[header] || ''}</td>`;
      });
      rowHTML += '</tr>';
    });
    return rowHTML;
  }

  fnillustationtable_investment(data, headers, replacement = {}) {
    const numRows = Math.ceil(data.length / 2);
    let rowHTML = '<tr>';
    headers.forEach(header => {
      let displayValue = replacement[header] || header;
      rowHTML += `<th class='c3 backcolor' style='color:#FFF'>${displayValue}</th>`;
    });
    headers.forEach(header => {
      let displayValue = replacement[header] || header;
      rowHTML += `<th class='c3 backcolor' style='color:#FFF'>${displayValue}</th>`;
    });
    rowHTML += '</tr>';
    for (let i = 0; i < numRows; i++) {
      rowHTML += '<tr>';
      // First half
      if (data[i]) {
        headers.forEach(key => {
          rowHTML += `<td>${data[i][key] || ''}</td>`;
        });
      } else {
        headers.forEach(() => (rowHTML += '<td></td>'));
      }
      // Second half
      if (data[i + numRows]) {
        headers.forEach(key => {
          rowHTML += `<td>${data[i + numRows][key] || ''}</td>`;
        });
      } else {
        headers.forEach(() => (rowHTML += '<td></td>'));
      }
      rowHTML += '</tr>';
    }
    return rowHTML;
  }

  fnSummaryBeneFormula(oldKey, data, products, headers, config) {
    const summarybenefitekey = config.summarybenefitekey || [];
    const lossoflife = config.lossoflife || [];
    const lossofaccident = config.lossofaccident || [];
    let rowsHtml = '';
    const conditions = [lossoflife, lossofaccident];
    data.forEach(item => {
      rowsHtml += '<tr>';
      Object.keys(item).forEach(key => {
        for (let i = 0; i < summarybenefitekey.length; i++) {
          if (item[key] === summarybenefitekey[i]) {
            let benefitAmountvalue = 0;
            const condition = conditions[i % conditions.length];
            for (let j = 0; j < products.length; j++) {
              const coverage = products[j]["coverageLookup"];
              if (condition.includes(coverage)) {
                benefitAmountvalue += products[j].benefitAmount["applicationValue"];
              }
            }
            item["RS"] = benefitAmountvalue;
          }
        }
        rowsHtml += `<td>${item[key]}</td>`;
      });
      rowsHtml += '</tr>';
    });
    return rowsHtml;
  }

  fnTotalPremium(data, headers, config) {
    const replacement = config.replacement || {};
    let dataRows = '';
    Object.keys(data).forEach(key => {
      dataRows += '<tr>';
      headers.forEach(header => {
        let cellValue = data[key][header];
        let displayValue = replacement[cellValue] || cellValue;
        dataRows += `<td class="text-center">${displayValue}</td>`;
      });
      dataRows += '</tr>';
    });
    return dataRows;
  }

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

  fnPremiumtableinvestment(data, headers, config) {
    let dataRows = '';
    const headersSequence = (config.tableFormatJson && config.tableFormatJson.hederssequence) || headers;
    headers.sort((a, b) => headersSequence.indexOf(a) - headersSequence.indexOf(b));
    data.forEach(item => {
      dataRows += '<tr>';
      headers.forEach(header => {
        let cellValue = item[header]?.applicationValue || '';
        dataRows += `<td class="text-center">${cellValue}</td>`;
      });
      dataRows += '</tr>';
    });
    return dataRows;
  }

  fncoveragescra(data, headers) {
    let row = "<tr class ='text-center'>";
    headers.forEach(header => {
      const value = data[header] || "";
      row += `<td>${value}</td>`;
    });
    row += "</tr>";
    return row;
  }

  fncreateaccumationrate(data, headers, config) {
    const replacement = config.replacement || {};
    let row = "<tr class ='text-center'>";
    headers.forEach(header => {
      let value = data[header] || "";
      value = replacement[value] || value;
      row += `<td>${value}</td>`;
    });
    row += "</tr>";
    return row;
  }

  fnRiderNames(abbreviation, products) {
    if (!products || !Array.isArray(products)) return abbreviation;
    for (let i = 0; i < products.length; i++) {
      if (products[i].abbreviation === abbreviation) {
        return products[i].Rider_output_Name || products[i].riderOutputName || abbreviation;
      }
    }
    return abbreviation;
  }

  fnaddCommaToValue(value) {
    if (typeof value !== 'string' && typeof value !== 'number') return value;
    let input = String(value).replace(/,/g, '');
    if (/\d{3,}/.test(input)) {
      input = input.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    }
    return input;
  }

  getProductName(config) {
    return (config.normalizedProductName || '').toLowerCase();
  }

  getHeaderReplacement(config, header) {
    return (config.replacement && config.replacement[header]) ? config.replacement[header] : header;
  }

  /**
   * Inject plan-specific notes into the template (ported from frontend)
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
      if (tableDiv) tableDiv.innerHTML = ul;
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  }

  /**
   * Generate cache key
   */
  generateCacheKey(data, template, options) {
    const dataKey = JSON.stringify(data);
    const templateKey = template || 'default';
    const optionsKey = JSON.stringify(options || {});
    return `quotation-${templateKey}-${dataKey}-${optionsKey}`;
  }

  /**
   * Clear processor cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
} 