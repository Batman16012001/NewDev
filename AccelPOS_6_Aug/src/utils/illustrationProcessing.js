// src/utils/illustrationProcessing.js
// Port of backend quotepackgeService.js logic for offline illustration processing

import { loadPlanWiseRiderCSV } from './csvLoader';

// Helper to select template/config like backend
async function selectTemplateAndConfig(normalizedPlanName, normalizedProductName) {
    // Try plan-specific folder first
    let planDir = `/templates/${normalizedPlanName}/`;
    try {
        const templateHtml = await fetch(planDir + 'sqs_template.html').then(r => {
            if (!r.ok) throw new Error('Not found');
            return r.text();
        });
        const tableFormatJson = await fetch(planDir + 'TableFormat.json').then(r => {
            if (!r.ok) throw new Error('Not found');
            return r.json();
        });
        return { templateHtml, tableFormatJson };
    } catch (e) {
        // If plan name includes 'saver', try 'life-saver'
        if (normalizedPlanName.includes('saver')) {
            planDir = `/templates/life-saver/`;
            try {
                const templateHtml = await fetch(planDir + 'sqs_template.html').then(r => {
                    if (!r.ok) throw new Error('Not found');
                    return r.text();
                });
                const tableFormatJson = await fetch(planDir + 'TableFormat.json').then(r => {
                    if (!r.ok) throw new Error('Not found');
                    return r.json();
                });
                return { templateHtml, tableFormatJson };
            } catch (e2) {
                // Fallback to product type folder
            }
        }
        // Fallback to product type folder
        planDir = `/templates/${normalizedProductName}/`;
        const templateHtml = await fetch(planDir + 'sqs_template.html').then(r => r.text());
        const tableFormatJson = await fetch(planDir + 'TableFormat.json').then(r => r.json());
        return { templateHtml, tableFormatJson };
    }
}

export async function processIllustrationInput(requestJSON, planName) {
    // Normalize plan and product names
    const normalizedPlanName = planName.replace(/\s+/g, '-').toLowerCase();
    const normalizedProductName = (requestJSON.productType || '').replace(/\s+/g, '-').toLowerCase();

    // Load template and config using backend-like logic
    const { templateHtml, tableFormatJson } = await selectTemplateAndConfig(normalizedPlanName, normalizedProductName);

    // Extract config values
    const TableCreateJSON = tableFormatJson.TableCreateJSON;
    console.log('tableFormatJson::', tableFormatJson)
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
        templateHtml,
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

// Recursive function to fill template with data and generate tables
export async function fnKeyValueRecursiveCall(dom, data, config, keyPrefix = "") {
    const {
        TableCreateJSON,
        excludeHeaders,
        DivShowHide,
        requestJSON,
        // ...other config as needed
    } = config;

    if (typeof data === 'object' && data !== null) {
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const newKey = keyPrefix ? `${keyPrefix}.${key}` : key;
                if (TableCreateJSON && TableCreateJSON.includes(newKey)) {
                    // Table generation: load products/riders from CSV
                    let Insured = newKey.split('.')[0];
                    console.log('Insured::::', Insured)
                    let tabletype = newKey.split('.')[1];
                    const planCode = requestJSON.productCode;
                    const paymentFrequency = requestJSON.paymentFrequency;
                    // Load products/riders from CSV (await)
                    const products = await loadPlanWiseRiderCSV(planCode, Insured, paymentFrequency);
                    console.log('products::::', products)
                    const tableDiv = dom.querySelector(`[name="${newKey}"]`);
                    if (tableDiv) {
                        tableDiv.innerHTML = await fngenerateTable(data[key], config, newKey, products);
                    }
                } else {
                    await fnKeyValueRecursiveCall(dom, data[key], config, newKey);
                }
            }
        }
    } else {
        // Replace placeholders
        const replacedString = `||${keyPrefix}||`;
        dom.innerHTML = dom.innerHTML.replaceAll(replacedString, data);
    }
}

// Find sections to show/hide based on DivShowHide
export function fnfindShowHidePositions(dom, data, config, keyPrefix = "", DivHideArray = []) {
    const { DivShowHide } = config;
    if (typeof data === 'object' && data !== null) {
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const newKey = keyPrefix ? `${keyPrefix}.${key}` : key;
                if (DivShowHide && DivShowHide.includes(newKey)) {
                    DivHideArray.push(newKey);
                }
                fnfindShowHidePositions(dom, data[key], config, newKey, DivHideArray);
            }
        }
    }
    return DivHideArray;
}

// Hide sections not present in data
export function fnfindArrayDifference(dom, DivHideArray, config) {
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

// Helper to get productName from config/request
function getProductName(config) {
    return (config.normalizedProductName || '').toLowerCase();
}

// Helper to get header replacements
function getHeaderReplacement(config, header) {
    return (config.replacement && config.replacement[header]) ? config.replacement[header] : header;
}

export function fngenerateRowRiderTable(data, products, headers, insuredType, config) {
  // Group products by section (protection, health, disability)
  const protectionBenefitsRider = config.protectionBenefitsRider || [];
  const healthBenefitsRider = config.healthBenefitsRider || [];
  const disabilityBenefitsRider = config.disabilityBenefitsRider || [];
  let protection_bene = {};
  let health_bene = {};
  let disability_bene = {};
  let detail_data = Object.keys(data);

  // Build benefit objects
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
  function buildSectionRows(sectionObj, sectionLabel) {
    let html = '';
    const keys = Object.keys(sectionObj);
    if (keys.length > 0) {
      html += `<tr><td colspan="${headers.length}"><span class="paddingLeft5"><b style="color: #000">${sectionLabel}</b></span></td></tr>`;
      keys.forEach(key => {
        html += '<tr>';
        html += `<td>${fnRiderNames(key, products)}</td>`;
        headers.slice(1).forEach(header => {
          let val = sectionObj[key][header];
          if (val !== undefined && val !== "Not Requested" && val !== "Not Available") {
            val = fnaddCommaToValue(val);
          }
          html += `<td class="text-center">${val !== undefined ? val : ''}</td>`;
        });
        html += '</tr>';
      });
    }
    return html;
  }

  let html = '';
  html += buildSectionRows(protection_bene, 'Protection Benefit');
  html += buildSectionRows(health_bene, 'Health Benefit');
  html += buildSectionRows(disability_bene, 'Disability Benefit');

  // Add total/premium row if needed (backend does this)
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

// Update fngenerateTable to call this function for coverages/life tables
export async function fngenerateTable(data, config, newKey, products) {
  const productName = getProductName(config);
  const TableFormatJson = config.tableFormatJson;
  const excludeHeaders = config.excludeHeaders || [];
  let headers;
  let rowHTML = '';
  let tabletype = newKey.split('.')[1];

  // Header logic (match backend)
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
  const headerHtml = headers.map(h => `<th class='c3 backcolor' style='color:#FFF'>${getHeaderReplacement(config, h)}</th>`).join('');

  // Table type logic (now fully wired)
  if (tabletype === 'coverages' && productName === 'life') {
    rowHTML = fngenerateRowRiderTable(data, products, headers, newKey.split('.')[0], config);
  } else if (tabletype === 'Premiums' && newKey !== 'TotalPremium.Premiums') {
    if (productName === 'investment') {
      const headersSequence = (TableFormatJson && TableFormatJson.hederssequence) || headers;
      headers.sort((a, b) => headersSequence.indexOf(a) - headersSequence.indexOf(b));
      rowHTML = fnillustationtable_investment(data, headers, config.replacement);
    } else {
      rowHTML = fnillustationtable(data, headers);
    }
  } else if (tabletype === 'summarybenefits') {
    rowHTML = fnSummaryBeneFormula(newKey, data, products, headers, config);
  } else if (tabletype === 'Premiums' && newKey === 'TotalPremium.Premiums') {
    rowHTML = fnTotalPremium(data, headers, config);
  } else if (tabletype === 'Maturity') {
    rowHTML = fnmaturityAmount(data, headers, config);
  } else if (tabletype === 'coverages' && productName === 'investment') {
    const headersSequence = (TableFormatJson && TableFormatJson.hederssequence) || headers;
    headers.sort((a, b) => headersSequence.indexOf(a) - headersSequence.indexOf(b));
    rowHTML = fnPremiumtableinvestment(data, headers, config);
  } else if (tabletype === 'coverages' && productName === 'cra') {
    rowHTML = fncoveragescra(data, headers);
  } else if (tabletype === 'Rates') {
    rowHTML = fncreateaccumationrate(data, headers, config);
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

// Ported: Simple illustration table (non-investment)
export function fnillustationtable(data, headers) {
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

// Ported: Illustration table for investment products
export function fnillustationtable_investment(data, headers, replacement = {}) {
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

// Summary Benefits Table
export function fnSummaryBeneFormula(oldKey, data, products, headers, config) {
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

// Total Premium Table
export function fnTotalPremium(data, headers, config) {
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

// Maturity Table
export function fnmaturityAmount(data, headers, config) {
    // Note: This is a simplified version; adjust as needed for your TableFormatJson
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

// Premium Table for Investment
export function fnPremiumtableinvestment(data, headers, config) {
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

// CRA Coverages Table
export function fncoveragescra(data, headers) {
    let row = "<tr class ='text-center'>";
    headers.forEach(header => {
        const value = data[header] || "";
        row += `<td>${value}</td>`;
    });
    row += "</tr>";
    return row;
}

// Accumulation Rate Table
export function fncreateaccumationrate(data, headers, config) {
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

// Lookup rider display name from products array
export function fnRiderNames(abbreviation, products) {
  if (!products || !Array.isArray(products)) return abbreviation;
  for (let i = 0; i < products.length; i++) {
    if (products[i].abbreviation === abbreviation) {
      return products[i].Rider_output_Name || products[i].riderOutputName || abbreviation;
    }
  }
  return abbreviation;
}

// Format numbers with commas
export function fnaddCommaToValue(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return value;
  let input = String(value).replace(/,/g, '');
  if (/\d{3,}/.test(input)) {
    input = input.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }
  return input;
}

// Inject plan-specific notes into the template (stub, expand as needed)
export async function fnnoteaccordingtoplantype(dom, planname, productName) {
  // Load notes_files.json from the correct path
  const notesResp = await fetch('/common-files/notes_files.json');
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
}

// Stub for accumulation rates (expand as needed)
export function fnaccumulationrates(planname, TableFormatJson) {
  // Implement if accumulation rate tables are used in your templates
  // This is a placeholder for backend parity
} 