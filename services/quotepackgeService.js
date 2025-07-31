const Ajv = require('ajv');
const fs = require('fs');
var jsdom = require("jsdom");
const express = require('express');
const path = require('path');
const app = express();
var HTMLParser = require('node-html-parser');
var{JSDOM} = jsdom;
var _ = require('lodash');
var wkhtmltopdf = require('wkhtmltopdf');
require('dotenv').config();
const jQuery = require('jquery');
var $ = "";
const readFile = require('../services/fileUtil');
const { console } = require('inspector');
let response_data = "";
var read_template = "";
let base64Data = "";
//let pdfDataArray = [];
let Request = "";
var PlanName = "";
var productName = "";
var QuoteId = "";
var TableFormatJsonPath = "";
var readtemplatePath = "";
var TableFormatJson = "";
var TableCreateJSON = ""
var protectionBenefitsRider = "";
var healthBenefitsRider = "";
var disabilityBenefitsRider = "";
var products = "";
var RiderTablecreate = "";
var lossoflife = "";
var lossofaccident = "";
var riderData = "";
var DivShowHide = ""
var DivHideArray = [];
var excludeHeaders = "";
var summarytable = "";
var replacement = "";
var notesfilesjson ="";
const key = process.env.DIRECTORY_PATH_SQS;
const bucketName = process.env.S3_BUCKET_NAME;
const mongoConnection = require("../DAO/mongoConnectionProcess");
const AWS = require("@aws-sdk/client-s3");
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = new AWS.S3();


async function QuoteProvision(requstJSON)
{
  app.use(express.static(path.join(__dirname, "..", 'public')));
  Request = requstJSON;
  PlanName = requstJSON.productName;
  productName = requstJSON.productType;
  PlanName = PlanName.replace(/\s+/g, '-').toLowerCase();
  productName = productName.replace(/\s+/g, '-').toLowerCase();
  var pathidvalue = `./public/SQS_template/${PlanName}`;
  process.stdout.write("pathidvaluepathidvaluepathidvalue"+ pathidvalue + "\n")
  //uncomment when you need ro access file from device folder

  if (doesDirectoryExist(pathidvalue))
  {
    TableFormatJsonPath = path.join(__dirname, "..", 'public', 'SQS_template', PlanName, 'TableFormat.json');
    readtemplatePath = path.join(__dirname, "..", 'public', 'SQS_template', PlanName, 'sqs_template.html');
    process.stdout.write("sandhya in plan wise folder loaed  "+ "\n");
  }
  else if (PlanName.includes("Saver"))
  {
    TableFormatJsonPath = path.join(__dirname, "..", 'public', 'SQS_template', "Life Saver", 'TableFormat.json');
    readtemplatePath = path.join(__dirname, "..", 'public', 'SQS_template', "Life Saver", 'sqs_template.html');
    process.stdout.write("sandhya in Life saver  folder loaed "+ "\n");
  }
  else
  {
    TableFormatJsonPath = path.join(__dirname, "..", 'public', 'SQS_template', productName, 'TableFormat.json');
    readtemplatePath = path.join(__dirname, "..", 'public', 'SQS_template', productName, 'sqs_template.html');
    process.stdout.write("sandhya in proudct name wise loaded "+ "\n");
  }
  var data = fs.readFileSync(readtemplatePath);
  TableFormatJson = require(TableFormatJsonPath);
// process.stdout.write("data:::"+ data + "\n");
process.stdout.write("TableFormatJson::"+ TableFormatJson + "\n");
process.stdout.write("readtemplatePath::"+ readtemplatePath + "\n");

  process.stdout.write("key"+ key + "\n");
  pathidvalue = key + PlanName;  
  process.stdout.write("sandhya pathidvalue "+ pathidvalue + "\n");
  // const isDirectory = await new Promise((resolve, reject) =>
  //   {
  //     readFile.checkS3Directory(bucketName, pathidvalue, function(exists)
  //     {
  //       if (exists)
  //       {
  //         process.stdout.write('AWS s3 Directory exists.'+ "\n");
  //         resolve(true)
  //       }
  //       else
  //       {
  //         process.stdout.write('AWS s3  Directory does not exist.'+ "\n");
  //   resolve(false)
  //       }
  //     });
  //   });
  //   process.stdout.write("isDirectory "+ isDirectory + "\n")
  
  //   if (isDirectory)
  //   {
  //     TableFormatJsonPath = key  +PlanName+"/" + "TableFormat.json"
  //     process.stdout.write("aws file in plan wise folder loaed table "+ TableFormatJsonPath + "\n")
  //     jsonFileData = await readFile.readFileFromS3(TableFormatJsonPath);
  
  //     readtemplatePath = key  +PlanName+"/" + "sqs_template.html"
  //     process.stdout.write("aws file in plan wise folder loaed html"+ readtemplatePath + "\n")
  //     htmlFileData = await readFile.readFileFromS3(readtemplatePath);
  //   }
  //   else if(PlanName.includes("saver"))
  //   {
  //     TableFormatJsonPath = key+"life-saver/TableFormat.json"
  //     process.stdout.write("aws file in life saver wise folder loaed table "+ TableFormatJsonPath + "\n")
  //     jsonFileData = await readFile.readFileFromS3(TableFormatJsonPath);
  
  //     readtemplatePath = key+"life-saver/sqs_template.html"
  //     process.stdout.write("aws file in life saver wise folder loaed html"+ readtemplatePath + "\n")
  //     htmlFileData = await readFile.readFileFromS3(readtemplatePath);    
  //   }
  //   else
  //   {
  //     productName = productName.replace(/\s+/g, '-').toLowerCase();
  //     TableFormatJsonPath = key + productName+"/" + "TableFormat.json"
  //     process.stdout.write("aws file in product  wise folder loaed table "+ TableFormatJsonPath + "\n")
  //     jsonFileData = await readFile.readFileFromS3(TableFormatJsonPath);
  
  //     readtemplatePath = key + productName+"/" + "sqs_template.html"
  //     process.stdout.write("aws file in product wise folder loaed html"+ readtemplatePath + "\n")
  //     htmlFileData = await readFile.readFileFromS3(readtemplatePath);
  //   }
    // process.stdout.write("json responce file "+ htmlFileData + "\n")
    // process.stdout.write("json responce file "+ jsonFileData + "\n")
    // TableFormatJson = JSON.parse(jsonFileData);
    // var data = htmlFileData;

  read_template = data.toString();
  QuoteId = requstJSON.QuoteId;
  subplanname = requstJSON.productName;
  plancode = requstJSON.productCode;
  paymentFrequency = requstJSON.paymentFrequency
  TableCreateJSON = TableFormatJson.TableCreateJSON;
  protectionBenefitsRider = TableFormatJson.protectionBenefitsRider;
  healthBenefitsRider = TableFormatJson.healthBenefitsRider
  disabilityBenefitsRider = TableFormatJson.disabilityBenefitsRider
  RiderTablecreate = TableFormatJson.RiderTablecreate
  lossoflife = TableFormatJson.lossoflife
  lossofaccident = TableFormatJson.lossofaccident
  riderData = TableFormatJson.rider_data;
  DivShowHide = TableFormatJson.DivShowHide;
  excludeHeaders = TableFormatJson.excludeHeaders
  summarybenefit = TableFormatJson.summarybenefit
  summarytable = TableFormatJson.summarytable
  replacement = TableFormatJson.replacement
  replacement = Object.assign({}, ...replacement);
  summarybenefitekey = TableFormatJson.summarybenefitekey;



  process.stdout.write("subplanname " + subplanname + "\n");
 
  var caseIdPath = `./public/${QuoteId}`;
 // let htmlDomObj = new JSDOM(read_template);


  if (doesDirectoryExist(caseIdPath))
  {
    process.stdout.write(`The directory exists.`+ "\n");
    try
    {
      fs.rmdirSync(caseIdPath,
      {
        recursive: true
      });
      process.stdout.write(`Director deleted successfully.` + caseIdPath + "\n");
    }
    catch (error)
    {
      // Handle the error if the directory deletion fails
      console.error("Error deleting directory"+ "\n");
    }
  }
  else
  {
    process.stdout.write(`The directory does not exist.`+ "\n");
  }

  await fnKeyValueRecursiveCall(Request, Request);
  fnfindShowHidePositions(Request);
  fnfindArrayDifference();
  await fnnoteaccordingtoplantype(subplanname,Request,productName);
  if(productName == "cra")
  {
    fnaccumulationrates(subplanname);

  }
  response_data = read_template;

  try
  {
      fs.mkdirSync(`./public/${QuoteId}`);
      let readOutputPath = `./public/${QuoteId}/${QuoteId}.pdf`;
    // file written successfully
    var pdfDataArray = await generatePDF(response_data, QuoteId);
    return pdfDataArray;
  }
  catch (err)
  {
    // console.error(err);
    console.error('Error during searchProduct process:'+ error.message + "\n");
    return 'InternalServerError';
  }

}
const generateAndSavePDF = async (response_data, outputPath) =>
{
  try
  {
    const pdfDataArray = await generatePDF(response_data, outputPath);
    process.stdout.write('PDF generated successfully.' + pdfDataArray + "\n");
    return pdfDataArray;
  }
  catch (error)
  {
    console.error('Error generating PDF:'+ error + "\n");
  }
}

function doesDirectoryExist(directoryPath)
{
  try
  {
    return fs.statSync(directoryPath).isDirectory();
  }
  catch (error)
  {
    if (error.code === 'ENOENT')
    {
      return false;
    }
    else
    {
      throw error; // Propagate other errors
    }
  }
}

//uncomment below code for saving file local folder
async function generatePDF(response_data, outputPath)
{
  process.stdout.write("sandhya in generate pdf " + outputPath + "\n");
  var currentDate = new Date();
  var createdate = currentDate.toLocaleString();
  const collectionNames = process.env.COLLECTION_NAMES.split(",");
  const collectionName = collectionNames[1]; 
  let pdfDataArray = [];
   let path = `./public/${QuoteId}/${QuoteId}.pdf`;
  process.stdout.write("collectionName  "+collectionName + "\n");
  return new Promise((resolve, reject) =>
  {
    wkhtmltopdf(response_data,
    {
      output: path,
      pageSize: 'A4'
    }, async (err) =>
    {
      if (err)
      {
        process.stdout.write("sandhya in generate err " + err + "\n");
        reject(err); // Reject the Promise if there's an error
      }
      else
      {
        let path = `./public/${QuoteId}/${QuoteId}.pdf`; //process.env.path_pdf
        var data = fs.readFileSync(path);
        base64Data = data.toString('base64');
        let documents = {
          name: "Quotation",
          base64content: base64Data
        };
        pdfDataArray.push(documents);
        process.stdout.write("pdf is converted to base64"+ "\n");
        //return pdfDataArray
        //db store
        const quoteIdValue = await mongoConnection.getDataFromDB({ QuoteId: QuoteId }, collectionName);
        if (!quoteIdValue) 
          {
             process.stdout.write(`quoteIdValue not found ${quoteIdValue}`+ "\n");
            
            const newproposal= {
              QuoteId: QuoteId,
              documentUrl : base64Data,
              creationDate : createdate,
              modificationDate : createdate
            };
    
            process.stdout.write("Inserted data:"+newproposal+ "\n");
    
            const result = await mongoConnection.insertDataIntoDB(
              newproposal,
              collectionName
            );
           
             process.stdout.write("Inserted new proposal into database:"+ result +"/n");
          }
        else
        {
          var modificationDate = currentDate.toLocaleString();
          process.stdout.write("caseId Values found ."+ "\n");
          const updateQuery = {           
            QuoteId : QuoteId  
           };
          const updateOperation = {
            $set: {
                documentUrl: base64Data,
                modificationDate : modificationDate,
            }
         };       
          //  process.stdout.write('Updating fetched_on for output:'+ updateQuery);
          //  process.stdout.write('Updating updateOperation for output:'+ updateOperation);
          //  process.stdout.write('Updating collectionName for output:'+ collectionName);

          const result = await mongoConnection.updateDataIntoDB(updateQuery, updateOperation, collectionName);
          
          process.stdout.write(`Updated  for updateOperation ID ${QuoteId}:`+JSON.stringify(result)+ "\n");

        
        }
      }
      resolve(pdfDataArray);
    });
  });
}

// async function generatePDF(response_data, QuoteId) {
//   const bucketName = process.env.S3_BUCKET_NAME; // Your S3 bucket name
//   const s3OutputPath = `output-files/${QuoteId}/${QuoteId}.pdf`; // Path in S3 bucket

//   process.stdout.write("Starting PDF generation for QuoteId:"+ QuoteId+ "\n");

//   return new Promise((resolve, reject) => {
//       wkhtmltopdf(
//           response_data,
//           { pageSize: 'A4' },
//           async (err, stream) => {
//               if (err) {
//                 process.stdout.write("Error during PDF generation:"+ err + "\n");
//                   return reject(err);
//               }

//               try {
//                   const chunks = [];
//                   stream.on('data', (chunk) => chunks.push(chunk));
//                   stream.on('end', async () => {
//                       const pdfBuffer = Buffer.concat(chunks);

//                       const uploadParams = {
//                           Bucket: bucketName,
//                           Key: s3OutputPath,
//                           Body: pdfBuffer,
//                           ContentType: 'application/pdf',
//                       };

//                       // Upload to S3 using PutObjectCommand
//                       await s3.send(new PutObjectCommand(uploadParams));
//                       process.stdout.write("PDF uploaded to S3:"+ s3OutputPath + "\n");

//                       // Base64 encoding for further use
//                       const base64Data = pdfBuffer.toString('base64');
//                       const documents = {
//                           name: "Quotation",
//                           base64content: base64Data,
//                       };

//                       const pdfDataArray = [documents];

//                       // Check or update the database
//                       const collectionName = process.env.COLLECTION_NAMES.split(",")[1];
//                       const currentDate = new Date().toLocaleString();
//                       const quoteIdValue = await mongoConnection.getDataFromDB({ QuoteId: QuoteId }, collectionName);

//                       if (!quoteIdValue) {
//                           const newProposal = {
//                               QuoteId: QuoteId,
//                               documentUrl: base64Data,
//                               creationDate: currentDate,
//                               modificationDate: currentDate,
//                           };

//                           await mongoConnection.insertDataIntoDB(newProposal, collectionName);
//                           process.stdout.write("Inserted new Quotation into database." + "\n");
//                       } else {
//                           const updateQuery = { QuoteId: QuoteId };
//                           const updateOperation = {
//                               $set: {
//                                   documentUrl: base64Data,
//                                   modificationDate: currentDate,
//                               },
//                           };

//                           await mongoConnection.updateDataIntoDB(updateQuery, updateOperation, collectionName);
//                           process.stdout.write(`Updated existing proposal for QuoteId ${QuoteId}.`+ "\n");
//                       }

//                       resolve(pdfDataArray);
//                   });
//               } 
//               catch (uploadError) 
//               {
//                 process.stdout.write("Error uploading to S3:"+ uploadError + "\n");
//                   reject(uploadError);
//               }
//           }
//       );
//   });
// }

async function fnKeyValueRecursiveCall(data, Request, keyPrefix = "")
{
  let htmlDomObj = new JSDOM(read_template);
  //process.stdout.write("data fnKeyValueRecursiveCall=====>" +data + "\n" );
  // new Promise(async (resolve, reject) => {
  if (typeof data === 'object')
  {
    for (const key in data)
    {
      //process.stdout.write("data fnKeyValueRecursiveCall=====>"+typeof data + "\n");
      if (data.hasOwnProperty(key))
      {
        const newKey = keyPrefix ? `${keyPrefix}.${key}` : key;
       process.stdout.write("newKey=====> " + newKey + "\n");
        if (TableCreateJSON.includes(newKey))
        {
          let Insured = newKey.split('.')[0];
          let tabletype = newKey.split('.')[1];
         // process.stdout.write("primaryInsured " + Insured+ " tabletype "+ tabletype + "\n");
          products = await readFile.readCSVFile(plancode, Insured, paymentFrequency);
          process.stdout.write("productsCSV=====>  " + JSON.stringify(products) + "\n");
          //process.stdout.write("data[key]"+ data[key] + "\n");
          //process.stdout.write("newKey=====>" + newKey + "\n");
          fngenerateTable(data[key], products, excludeHeaders, newKey);
        }
        else
        {
          await fnKeyValueRecursiveCall(data[key], Request, newKey);
        }
      }
    }
    //summaryBenefit(data);
  }
  else
  {
    //process.stdout.write("=====>"+`${keyPrefix}: ${data}`+ "\n");
    let replacedString = "||" + keyPrefix + "||";
    if (!read_template.includes(replacedString))
    {
      //for checkbox 
    }
    else
    {
      read_template = read_template.replaceAll(replacedString, data);
    }
  }
  if(productName == "life")
  {
    fnsummaryBenefit(data);
  }
  
}

function fnRiderNames(x)
{
  for (var i = 0; i < Object.values(products)[0].length; i++)
  {
    const coverage = Object.values(products)[0][i].abbreviation;
    if (x == coverage)
    {
      // process.stdout.write("Object.values(products)[0][i].riderOutputName"+Object.values(products)[0][i].riderOutputName + "\n")
      return Object.values(products)[0][i].riderOutputName;
    };
  }
}

function fnaddCommaToValue(respBeneData)
{
  //process.stdout.write("respBeneData :" + respBeneData + "\n");
  var pattern = new RegExp(/\d{3,}/);
  var input = String(respBeneData);
  input = input.replace(/,/g, "");
  if (pattern.test(input))
  {
    input = input.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }
  return input;
}

function fnSummaryBeneFormula(oldKey, data, products, headers)
{
  let htmlDomObj = new JSDOM(read_template);
  const window = htmlDomObj.window;
  const $ = jQuery(window);
  // summarybenefitekey = TableFormatJson.summarybenefitekey;
  const conditions = [lossoflife, lossofaccident];
  for (let i = 0; i < 9; i++)
  {
    //process.stdout.write("oldKey fnSummary12BeneFormula "+ oldKey + "\n");
   // process.stdout.write("data fnSummary11BeneFormula " + data + "\n")
    // process.stdout.write("products fnSummary11BeneFormula "+products + "\n")
   // process.stdout.write("headers fnSummary12BeneFormula " + headers + "\n");
    let Insured = oldKey.split('.')[0];
    if (Insured === 'primaryInsured' || Insured === 'spouseInsured')
    {
      let rowsHtml = '';
      data.forEach((item) =>
      {
        rowsHtml += "<tr>";
        Object.keys(item).forEach((key) =>
        {
          for (let i = 0; i < summarybenefitekey.length; i++)
          {
            if (item[key] === summarybenefitekey[i])
            {
              let benefitAmountvalue = 0;
              const condition = conditions[i % conditions.length];
              for (let j = 0; j < Object.values(products).length; j++)
              {
                const coverage = Object.values(products)[j]["coverageLookup"];
                if (condition.includes(coverage))
                {
                  benefitAmountvalue += products[j].benefitAmount["applicationValue"];
                }
              }
              item["RS"] = benefitAmountvalue;
              process.stdout.write(" benefitAmountvalue"+ benefitAmountvalue + "\n");
            }
          }
          rowsHtml += `<td>${item[key]}</td>`;
        });
        rowsHtml += "</tr>";
      });
      return rowsHtml
    }
  }
  read_template = "<!DOCTYPE html>" + htmlDomObj.window.document.getElementsByTagName('html')[0].outerHTML;
}

function fnfindShowHidePositions(data, keyPrefix = "")
{
  if (typeof data === 'object')
  {
    // process.stdout.write("findPositions= 1==>"+ "\n")
    for (const key in data)
    {
      if (data.hasOwnProperty(key))
      {
        const newKey = keyPrefix ? `${keyPrefix}.${key}` : key;
        // process.stdout.write("findPositions===>" + newKey + "\n")
        if (DivShowHide.includes(newKey))
        {
          DivHideArray.push(newKey);
          //process.stdout.write("Dive hide array "+ DivHideArray+ "\n");
        }
        fnfindShowHidePositions(data[key], newKey);
      }
    }
  }
}

function fnfindArrayDifference()
{
  let htmlDomObj = new JSDOM(read_template);
  const difference1 = DivHideArray.filter(element => !DivShowHide.includes(element));
  const difference2 = DivShowHide.filter(element => !DivHideArray.includes(element));
  const result = difference1.concat(difference2);
  //process.stdout.write("Dive hide array "+result+"const difference1 "+ difference1 +" const difference2 "+difference2 + "\n");
  for (let i = 0; i < result.length; i++)
  {
    let tableID = htmlDomObj.window.document.getElementsByName(result[i]);
    // process.stdout.write("Inside findArrayDifference "+ tableID + "\n")
    for (let j = 0; j < tableID.length; j++)
    {
      tableID[j].style.display = "none";
    }
  }
  read_template = "<!DOCTYPE html>" + htmlDomObj.window.document.getElementsByTagName('html')[0].outerHTML;
}

const fngenerateTable = (data, products, excludeHeaders, newKey) =>
{
  let htmlDomObj = new JSDOM(read_template);
  let headers;
  let Insured = newKey.split('.')[0];
  let tabletype = newKey.split('.')[1];
 //process.stdout.write("datadatadata"+ data+ "newKeynewKey"+ newKey+"productsproducts"+products + "\n")
  process.stdout.write("datadatadata "+ JSON.stringify(data)+ "newKeynewKey "+ newKey+"productsproducts "+products +"\n")
  var rowHTML = "";
  let tableID
  if(newKey =="TotalPremium.Premiums")
  {
     headers = Object.keys(data.Monthly).filter(key => ['PaymentFrequency', 'PremiumAmount'].includes(key));
  }
  else if(newKey == "primaryInsured.coverages.0.AccountBalance.0.PremiumAmountOption1" || newKey == "Accumulation.Rates")
  {
    headers = Object.keys(data).flatMap(key =>!excludeHeaders.includes(key) && typeof data[key] === 'object' && data[key] !== null
    ? Object.keys(data[key]).map(() => key): !excludeHeaders.includes(key)? key: []).filter(Boolean);
  }
  else
  {
     headers = Object.keys(data[0]).flatMap(key => !excludeHeaders.includes(key) && typeof data[0][key] === 'object'
   ? Object.keys(data[0][key]).map(() => key) : !excludeHeaders.includes(key) ? key : []).filter(Boolean);
  }
  

  tableID = htmlDomObj.window.document.getElementsByName(newKey)[0];
 // process.stdout.write("tableID"+ tableID + "\n")
  if (tableID != undefined)
  {
    let table = "<table border='1' width='100%' class='table3' style='border-collapse:collapse'><thead><tr>";
    if(tabletype == "coverages" && productName == "investment")
      {
        headersSequence = TableFormatJson.hederssequence
          headers.sort((a, b) => {
            return headersSequence.indexOf(a) - headersSequence.indexOf(b);
          });
      }

      headers.forEach(header =>
      {
        //process.stdout.write("replacement "+ replacement + "\n")
       // process.stdout.write("headers"+headers+ "\n")
        let displayValue = replacement[header] || header;
        if(productName == "investment" && tabletype == "Premiums")
        {
         // table = table +`<th class='c3 backcolor' style='color:#FFF'>${displayValue}</th>`;
        }
        else
        {
          table = table +`<th class='c3 backcolor' style='color:#FFF'>${displayValue}</th>`;
        }
        
      });    
      
    table = table + "</tr ></thead><tbody>";
    if (tabletype == "coverages" && productName == "life")
    {
      rowHTML = fngenerateRowRiderTable(data, products, headers,Insured);
    }
    else if (tabletype == "Premiums" && newKey != "TotalPremium.Premiums")
    {
      if(productName == "investment" )
      {
        rowHTML =  fnillustationtable_investment(data, headers)
      }
      else
      {
        rowHTML = fnillustationtable(data,headers);
      }
          
    }
    else if (tabletype == "summarybenefits")
    {
      rowHTML = fnSummaryBeneFormula(newKey, data, products, headers);
    }
    else if (tabletype == "Premiums" && newKey == "TotalPremium.Premiums")
    {
      rowHTML = fnTotalPremium( data,headers);
    }
    else if(tabletype == "Maturity")
    {
      rowHTML = fnmaturityAmount(data,headers);
    }
    else if(tabletype == "coverages" && productName == "investment")
    {
      rowHTML = fnPremiumtableinvestment(data,headers);
    }
    else if(tabletype == "coverages" && productName == "cra")
    {
      rowHTML = fncoveragescra(data,headers);
    }
    else if(tabletype == "Rates")
    {
      rowHTML = fncreateaccumationrate(data,headers)
    }
    else
    {
      process.stdout.write("nullllllllll" + "\n");
    }
    table = table + rowHTML;
    table = table + "</tbody></table>";
    tableID.innerHTML = table;
    process.stdout.write(" tableID.innerHTML"+tableID.innerHTML + "\n");
    read_template = "<!DOCTYPE html>" + htmlDomObj.window.document.getElementsByTagName('html')[0].outerHTML;
  }
  //return table;
};

function fngenerateRowRiderTable(data, products, headers,Insured)
{
  //process.stdout.write("headersheaders"+ headers.length+ "\n")
  let htmlDomObj = new JSDOM(read_template);
  let window = htmlDomObj.window;
  let $ = jQuery(window);
  let tableBody = htmlDomObj.window.document.createElement("tbody");
  let protection_bene = {};
  var health_bene = {};
  var disability_bene = {};
  let detail_data = Object.keys(data);
  for (let i = 0; i < Object.values(products)[0].length; i++)
  {
    const coverage = Object.values(products)[0][i].abbreviation;
    for (let key = 0; key < detail_data.length; key++)
    {
      if (protectionBenefitsRider.includes(coverage))
      {
        protection_bene[coverage] = {};
        if (data[key].coverageLookup === coverage)
        {
          // protection_bene[coverage] = {};
          for (const col in data[key])
          {
            if (typeof data[key][col] === 'object')
            {
              protection_bene[coverage][col] = data[key][col].applicationValue;
            }
            else
            {
              protection_bene[coverage][col] = data[key][col] || "Not Available";
            }
          }
          break;
        }
        else
        {
          // Set "Not Requested" for missing values
          for (const col in data[0])
          {
            protection_bene[coverage][col] = "Not Requested";
          }
        }
      }
      //health 
      if (healthBenefitsRider.includes(coverage))
      {
        health_bene[coverage] = {};
        if (data[key].coverageLookup === coverage)
        {
          for (const col in data[key])
          {
            if (typeof data[key][col] === 'object')
            {
              health_bene[coverage][col] = data[key][col].applicationValue;
            }
            else
            {
              health_bene[coverage][col] = data[key][col] || "Not Available";
            }
          }
          break;
        }
        else
        {
          // Set "Not Requested" for missing values
          //health_bene[coverage] = {};
         // process.stdout.write("Not Requested for missing values"+ health_bene + "\n")
          for (const col in data[0])
          {
            health_bene[coverage][col] = "Not Requested";
          }
        }
      }
      //
      //disability
      if (disabilityBenefitsRider.includes(coverage))
      {
        disability_bene[coverage] = {};
        if (data[key].coverageLookup === coverage)
        {
          for (const col in data[key])
          {
            if (typeof data[key][col] === 'object')
            {
              disability_bene[coverage][col] = data[key][col].applicationValue;
            }
            else
            {
              disability_bene[coverage][col] = data[key][col] || "Not Available";
            }
          }
          break;
        }
        else
        {
          // Set "Not Requested" for missing values
          //disability_bene[coverage] = {};
          //process.stdout.write("Not Requested for missing values"+ disability_bene + "\n")
          for (const col in data[0])
          {
            disability_bene[coverage][col] = "Not Requested";
          }
        }
      }
    }
  }
  // Generate rows for each entry in protection_bene
  if (Object.keys(protection_bene).length > 0)
  {
    let protection_keys = Object.keys(protection_bene);
    var tdh = htmlDomObj.window.document.createElement("tr");
    let tdLabel = htmlDomObj.window.document.createElement("td");
    tdLabel.colSpan = headers.length;
    tdLabel.innerHTML = '<span class="paddingLeft5"><b style="color: #000">' + "protection Benefits (Payable on Death)" + '</b></span>';
    tdLabel.setAttribute("class", "stripcolor");
    tdh.appendChild(tdLabel);
    tableBody.appendChild(tdh);
    protection_keys.forEach((key) =>
    {
      let tr = htmlDomObj.window.document.createElement("tr");
      let td = htmlDomObj.window.document.createElement("td");
      td.innerHTML = fnRiderNames(key);
      tr.appendChild(td);
      // Populate cells with data, ensuring each header has a <td>
      headers.slice(1).forEach(header =>
      {
        let td = htmlDomObj.window.document.createElement("td");
        td.className = "text-center";
        // process.stdout.write("protection_bene[key]"+protection_bene[key] + "\n");
        // process.stdout.write("[headers]"+header + "\n");
        // process.stdout.write("protection_bene[key][headers]"+protection_bene[key][headers] + "\n");
        if (protection_bene[key] !== undefined && protection_bene[key].Premium !== "Not Requested")
        {
          td.innerHTML = fnaddCommaToValue(protection_bene[key][header]);
        }
        else
        {
          td.innerHTML = "Not Requested";
        }
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });
  }
  // Generate rows for each entry in health_bene
  if (Object.keys(health_bene).length > 0)
  {
    let protection_keys = Object.keys(health_bene);
    var tdh = htmlDomObj.window.document.createElement("tr");
    let tdLabel = htmlDomObj.window.document.createElement("td");
    tdLabel.colSpan = headers.length;
    tdLabel.innerHTML = '<span class="paddingLeft5"><b style="color: #000">' + "health Benefits (Payable on Death)" + '</b></span>';
    tdLabel.setAttribute("class", "stripcolor");
    tdh.appendChild(tdLabel);
    tableBody.appendChild(tdh);
    protection_keys.forEach((key) =>
    {
      let tr = htmlDomObj.window.document.createElement("tr");
      let td = htmlDomObj.window.document.createElement("td");
      td.innerHTML = fnRiderNames(key);
      tr.appendChild(td);
      // Populate cells with data, ensuring each header has a <td>
      headers.slice(1).forEach(header =>
      {
        let td = htmlDomObj.window.document.createElement("td");
        td.className = "text-center";
        // process.stdout.write("protection_bene[key]"+protection_bene[key]+ "\n");
        // process.stdout.write("[headers]"+header + "\n");
        // process.stdout.write("protection_bene[key][headers]"+protection_bene[key][headers]+ "\n");
        if (health_bene[key] !== undefined && health_bene[key].Premium !== "Not Requested")
        {
          td.innerHTML = fnaddCommaToValue(health_bene[key][header]);
        }
        else
        {
          td.innerHTML = "Not Requested";
        }
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });
  }
  // Generate rows for each entry in disability_bene
  if (Object.keys(disability_bene).length > 0)
  {
    let protection_keys = Object.keys(disability_bene);
    var tdh = htmlDomObj.window.document.createElement("tr");
    let tdLabel = htmlDomObj.window.document.createElement("td");
    tdLabel.colSpan = headers.length;
    tdLabel.innerHTML = '<span class="paddingLeft5"><b style="color: #000">' + "Disability Benefits (Payable on Death)" + '</b></span>';
    tdLabel.setAttribute("class", "stripcolor");
    tdh.appendChild(tdLabel);
    tableBody.appendChild(tdh);
    protection_keys.forEach((key) =>
    {
      let tr = htmlDomObj.window.document.createElement("tr");
      let td = htmlDomObj.window.document.createElement("td");
      td.innerHTML = fnRiderNames(key);
      tr.appendChild(td);
      // Populate cells with data, ensuring each header has a <td>
      headers.slice(1).forEach(header =>
      {
        let td = htmlDomObj.window.document.createElement("td");
        td.className = "text-center";
        // process.stdout.write("protection_bene[key]"+protection_bene[key] + "\n");
        // process.stdout.write("[headers]"+ header + "\n");
        // process.stdout.write("protection_bene[key][headers]"+ protection_bene[key][headers] + "\n");
        if (disability_bene[key] !== undefined && disability_bene[key].Premium !== "Not Requested")
        {
          td.innerHTML = fnaddCommaToValue(disability_bene[key][header]);
        }
        else
        {
          td.innerHTML = "Not Requested";
        }
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });
  }
  //process.stdout.write(" total"+data + "\n")
  var termvalue,totalprevalue;
  for (let key = 0; key < detail_data.length; key++)
  {
    if(data[key].coverageLookup == "basic plan")
    {
             
      termvalue =  data[key].benefitPeriod.applicationValue
      basicplantermvalue =termvalue;
      // process.stdout.write(" total23"+termvalue + "\n")
    }
    else if (Insured !="primaryInsured" && data[key].coverageLookup != "Total")
    {
              
      termvalue =  data[key].benefitPeriod.applicationValue
      // process.stdout.write(" total23"+termvalue+ "\n")
    }
    
    if(data[key].coverageLookup == "Total")
    {
      totalprevalue =  data[key].Premium.applicationValue
      // process.stdout.write(" total23"+termvalue + "\n")
    }
  }
    var totaltr = htmlDomObj.window.document.createElement("tr");
    totaltr.setAttribute("class", "stripcolor ");    
    let totaltd1 = htmlDomObj.window.document.createElement("td");
    //totaltd1.className = "text-center";
    totaltd1.innerHTML = '<span class="paddingLeft5"><b style="color: #000">' + "Premium Payable" + '</b></span>';    
    totaltr.appendChild(totaltd1);
    let totaltd2 = htmlDomObj.window.document.createElement("td");
    totaltd2.className = "text-center";
    totaltd2.innerHTML= '<span class="paddingLeft5"><b style="color: #000">' + termvalue + '</b></span>';  
    totaltr.appendChild(totaltd2);
    let totaltd3 = htmlDomObj.window.document.createElement("td");
    totaltd3.innerHTML=" ";
    totaltr.appendChild(totaltd3);
    let totaltd4 = htmlDomObj.window.document.createElement("td");
    totaltd4.className = "text-center";
    totaltd4.innerHTML= '<span class="paddingLeft5 "><b style="color: #000">' + totalprevalue + '</b></span>';  
    totaltr.appendChild(totaltd4);

    tableBody.appendChild(totaltr);


  return tableBody.innerHTML;
}

function fnillustationtable(data, headers) 
{
  process.stdout.write("data"+ data  + "\n");
  let rowHTML = "";

  data.forEach(item => {
    rowHTML = rowHTML + "<tr>";
    headers.forEach(header => {
      rowHTML = rowHTML + `<td>${item[header] || ""}</td>`; 
    });
    rowHTML = rowHTML +"</tr>";
  });

  return rowHTML;
}

function fnillustationtable_investment(data, headers) {
  const numRows = Math.ceil(data.length / 2); 
  let rowHTML = "<tr>";

  headers.forEach(header => {
    let displayValue = replacement[header] || header;
    rowHTML = rowHTML + `<th class='c3 backcolor' style='color:#FFF'>${displayValue}</th>`;
  });

  headers.forEach(header => {
    let displayValue = replacement[header] || header;
    rowHTML = rowHTML + `<th class='c3 backcolor' style='color:#FFF'>${displayValue}</th>`;
  });

  rowHTML = rowHTML + "</tr>";

  for (let i = 0; i < numRows; i++) {
    rowHTML =rowHTML + "<tr>";

    // Add cells for the first half of the data
    if (data[i]) 
    {
      headers.forEach(key => {
        rowHTML =rowHTML + `<td>${data[i][key] || ''}</td>`;
      });
    } 
    else 
    {
      headers.forEach(() => rowHTML =rowHTML + "<td></td>");
    }

    // Add cells for the second half of the data (offset by numRows)
    if (data[i + numRows])
    {
      headers.forEach(key => {
        rowHTML =rowHTML + `<td>${data[i + numRows][key] || ''}</td>`;
      });
    }
    else
    {
      headers.forEach(() => rowHTML =rowHTML + "<td></td>");
    }

    rowHTML =rowHTML + "</tr>";
  }

  return rowHTML;
}

function fnsummaryBenefit(data)
{
  summarybenefit = TableFormatJson.summarybenefit
 // process.stdout.write("summarybenefit"+ summarybenefit + "\n")
  if (data["primaryInsured"] && data["primaryInsured"].coverages)
  {
   // process.stdout.write("summarybenefit data"+ data["primaryInsured"].coverages + "\n");
    newKey = "primaryInsured.summarybenefits";
    products = data["primaryInsured"].coverages;
    fngenerateTable(summarybenefit, products, excludeHeaders, newKey)
  }
}

function fnTotalPremium(data, headers) 
{
  let dataRows = "";
  process.stdout.write("replacement"+ data  + "\n")
  Object.keys(data).forEach(key => 
  {
    dataRows =  dataRows + "<tr>";
    headers.forEach(header => 
    {
      let cellValue = data[key][header];
      let displayValue = replacement[cellValue] || cellValue; 
      dataRows =  dataRows + `<td class="text-center" >${displayValue}</td>`;
    });
    dataRows =  dataRows + "</tr>";
  });
  return dataRows;  
}

async function fnnoteaccordingtoplantype (planname,data,productName)
{
  htmlDomObj = new JSDOM(read_template);
  planname = planname.replace(/\s+/g, '_').toLowerCase();

  //read file from device  file dolder
  notesfiles = path.join(__dirname, "..", 'public','common-files','notes_files.json');
  notesfilesjson = require(notesfiles);

  //read file from aws storage 
  // notesfiles =process.env.NOTES_FILE_S3
  // notesfilesjson =  await readFile.readFileFromS3(notesfiles);
  // notesfilesjson = JSON.parse(notesfilesjson);
 // process.stdout.write("notesfiles"+notesfiles  + "\n")

  
  //process.stdout.write("notesfilesjson"+notesfilesjson  + "\n")
  var tableID = htmlDomObj.window.document.getElementsByName("notes")[0];
  //process.stdout.write("table id notes "+tableID + "\n")
  if (tableID != undefined)
  {
    //process.stdout.write("found the div element" + "\n");
    let notesList = [];
    if(productName == "life")
    {
      if (notesfilesjson["common"]) 
        {
          notesList = notesList.concat(notesfilesjson["common"]);
        }
        if (notesfilesjson["common_another"]) 
        {
          notesList = notesList.concat(notesfilesjson["common_another"]);
        }
        if (notesfilesjson[planname])
        {
          notesList = notesList.concat(notesfilesjson[planname]);
        }

    }
    else
    {
      if (notesfilesjson[productName])
      {
        notesList = notesList.concat(notesfilesjson[productName]);
      }
    }
    
    let ul = "<ul>";
    notesList.forEach(note => 
    {
      ul = ul + `<li>${note}</li>`;
    });
    ul = ul + "</ul>";
    tableID.innerHTML = ul;
    process.stdout.write("table info"+tableID.innerHTML+ "\n");
    //read_template = "<!DOCTYPE html>" + htmlDomObj.window.document.getElementsByTagName('html')[0].outerHTML;

   
  }
  else
  {
    process.stdout.write(" not find "+ "\n")
  }
  keyPrefix = ""
  if (typeof data === 'object')
    {
       
      for (const key in data)
      {
        //process.stdout.write("data fnnoteaccordingtoplantype=====>"+typeof data  + "\n");
        if (data.hasOwnProperty(key)) 
        {
          var newKey = keyPrefix ? `${keyPrefix}.${key}` : key;
          //process.stdout.write("newKey=====>" + newKey  + "\n");
        
          if (newKey == "primaryInsured" || newKey == "spouseInsured") 
          {
           // process.stdout.write("data[key]"+ data[key]  + "\n");
        
            let coverages = data[key].coverages;
        
            if (Array.isArray(coverages))
            {
              for (let i = 0; i < coverages.length; i++)
              {
                let coverage = coverages[i];
                //process.stdout.write("let coverage = coverages[i]"+coverage.coverageLookup  + "\n")
                if (coverage.coverageLookup == "horr") 
                {
                  var tableID1 = htmlDomObj.window.document.getElementsByName("hsb")[0];
                  if (tableID1) 
                  {
                    tableID1.style.display = "block";
                  }
                  var tableID = htmlDomObj.window.document.getElementsByName("horr_notes")[0];
                 // process.stdout.write("let coverage = fsdfsfsdcoverages[i]1233"+tableID  + "\n")
                  if (tableID != undefined) 
                  {
                    let notesList = [];
        
                    //process.stdout.write("let coverage = fsdfsfsdcoverages[i]"+notesfilesjson + "\n")
                    if (notesfilesjson["HORR"])
                    {
                      notesList = notesList.concat(notesfilesjson["HORR"]);
                    }
        
                    let ul = "<ul>";
                    notesList.forEach(note => 
                    {
                      ul =  ul + `<li>${note}</li>`;
                    });
                    ul =  ul + "</ul>";
        
                    tableID.innerHTML = ul;
                  }
                  else
                  {
                    
                  }
                }
              }
            }
          }
        }
        
      }
    }
   read_template = "<!DOCTYPE html>" + htmlDomObj.window.document.getElementsByTagName('html')[0].outerHTML;
}

function fnmaturityAmount(data, headers)
{
  //const basicplantermvalue = "25";
  maturitybenefitjson = TableFormatJson.maturitybenefitjson;
  var benefitjsonkey = maturitybenefitjson[0][basicplantermvalue];
  let dataRows = "";
  data.forEach(row =>
  {
    dataRows = dataRows + "<tr>";
    headers.forEach(header =>
    {
      let cellValue;
      if (row[header] && row[header].applicationValue) 
      {
        cellValue = row[header].applicationValue;
      } 
      else 
      {
        cellValue = "";
      }
      let displayValue = replacement[cellValue] || cellValue; 
      if (benefitjsonkey && benefitjsonkey[cellValue])
      {
        const termValue = benefitjsonkey[cellValue];       
        cellValue = `${displayValue} ${termValue}th Year`;
      }
      dataRows = dataRows + `<td>${cellValue}</td>`;
    });
    dataRows = dataRows +"</tr>";
  });
  process.stdout.write("fnmaturityAmount dataRows: " + dataRows + "\n");
  return dataRows;
}

function fnPremiumtableinvestment(data, headers) 
{ 
  let dataRows = "";
  headersSequence = TableFormatJson.hederssequence
  headers.sort((a, b) => 
  {
    return headersSequence.indexOf(a) - headersSequence.indexOf(b);
  });
  data.forEach(item => 
  {
    dataRows =dataRows + "<tr>";

    headers.forEach(header => 
    {
      let cellValue = item[header]?.applicationValue || ""; // Fallback to an empty string if undefined

      dataRows = dataRows +`<td class="text-center">${cellValue}</td>`;
    });

    dataRows =dataRows + "</tr>";
  });
  
  return dataRows;
}

function fncoveragescra(data,headers)
{
  
  process.stdout.write("datadata=====> " +JSON.stringify(data) + "\n");
  process.stdout.write("headersheaders=====> " + headers + "\n");
  let row = "<tr class ='text-center'>";
  headers.forEach(header => 
  {
    const value = data[header] || ""; 
    row += `<td>${value}</td>`;
  });
  row += "</tr>";
  process.stdout.write("Generated Row=====> " + row +"\n");
  return row;
}

function fnaccumulationrates(planname)
{
  htmlDomObj = new JSDOM(read_template);
  planname = planname.replace(/\s+/g, '_').toLowerCase();
  AccumulationRates= TableFormatJson.AccumulationRates[0];
  process.stdout.write("AccumulationRates: " + JSON.stringify(AccumulationRates) + "\n");  
  process.stdout.write("plan name: " + planname + "\n"); 
  process.stdout.write("AccumulationRatesn plan name data: " + JSON.stringify(AccumulationRates[planname]) + "\n"); 
  newKey ="Accumulation.Rates" 
  var data =AccumulationRates[planname]; 
  fngenerateTable(data, products, excludeHeaders,newKey);  

}

function fncreateaccumationrate(data,headers)
{
  process.stdout.write("datadata=====> " +JSON.stringify(data) + "\n");
  process.stdout.write("headersheaders=====> " + headers + "\n");
  let row = "<tr class ='text-center'>";
  headers.forEach(header => 
  {
    var value = data[header] || ""; 
    value = replacement[value] || value;
    row += `<td>${value}</td>`;
  });
  row += "</tr>";
  return row;  
}



module.exports = {
  QuoteProvision
};
