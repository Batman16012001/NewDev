const Ajv = require('ajv');
const fs = require('fs');
var jsdom = require("jsdom");
const express = require('express');
const path = require('path');
const app = express();
var HTMLParser = require('node-html-parser');
var { JSDOM } = jsdom;
var _ = require('lodash');
var wkhtmltopdf = require('wkhtmltopdf');
require('dotenv').config();
const mongoConnection = require("../DAO/mongoConnectionProcess");
//const controllerService = require('../controllers/packageController');
const readFile = require('../services/fileUtil')
const AWS = require("@aws-sdk/client-s3");
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = new AWS.S3();
const bucketName = process.env.S3_BUCKET_NAME;
var htmlFileData = "";
var jsonFileData ="";
var schemaPath = "";
var pathidvalue ="";
const key = process.env.DIRECTORY_PATH;

let response_data = "";
var read_template = "";
let base64Data = "";
//let pdfDataArray = [];
let Request = "";
let DocumentObject = "";
let InterviewCategoryData = {};
var PlanName = "";
var productName ="";
var caseId = "";
var TableFormatJsonPath = "";
var readtemplatePath = "";
var TableFormatJson = "";
var TableCreateJSON = ""
var TableJSONKey = ""
var InnerTableCreation = ""
var AllLife_Coverages = ""
var Interview = ""
var InterviewUIFormat = ""
var InterviewFormat = ""
var TableInStucturedFormat = ""
var InteviewCategory = ""
var InterviewTableCreateJSONMain = ""
var InterviewTableJSONKey = ""
var InterviewTableJSONKeyOther = ""
var TableJSONKeyOther = ""
var DivShowHide = ""
var DivHideArray = [];

async function packageProvision(requstJSON)
{
  app.use(express.static(path.join(__dirname, "..", 'public')));
  Request = requstJSON;
  PlanName = requstJSON.product.planName;
  productName =requstJSON.product.productType;

  //TableFormatJsonPath = path.join(__dirname, "..", 'public', 'template', PlanName, 'TableFormat.json');
 // TableFormatJsonPath = path.join(__dirname, "..", 'public', 'template', productName, 'TableFormat.json');
  
  //let readtemplatePath = path.join(__dirname, "..", 'public', 'template', PlanName, 'template.html');
  //let readtemplatePath = path.join(__dirname, "..", 'public', 'template', productName, 'template.html');

//load file from s3 bucket
  process.stdout.write("key "+ key+ "\n");
  PlanName = PlanName.replace(/\s+/g, '-').toLowerCase();

  pathidvalue = key + PlanName;  
  process.stdout.write(" pathidvalue "+ pathidvalue+ "\n");

  // const isDirectory = await new Promise((resolve, reject) =>
  // {
  //   readFile.checkS3Directory(bucketName, pathidvalue, function(exists)
  //   {
  //     if (exists)
  //     {
  //       process.stdout.write('AWS s3 Directory exists.'+ "\n");
  //       resolve(true)
  //     }
  //     else
  //     {
  //       process.stdout.write('AWS s3  Directory does not exist.'+ "\n");
  // resolve(false)
  //     }
  //   });
  // });
  // process.stdout.write("isDirectory "+ isDirectory+ "\n")

  // if (isDirectory)
  // {
  //   TableFormatJsonPath = key  +PlanName+"/" + "TableFormat.json"
  //   process.stdout.write("aws file in plan wise folder loaed table "+ TableFormatJsonPath+ "\n")
  //   jsonFileData = await readFile.readFileFromS3(TableFormatJsonPath);

  //   readtemplatePath = key  +PlanName+"/" + "template.html"
  //   process.stdout.write("aws file in plan wise folder loaed html"+ readtemplatePath+ "\n")
  //   htmlFileData = await readFile.readFileFromS3(readtemplatePath);
  // }
  // else if(PlanName.includes("saver"))
  // {
  //   TableFormatJsonPath = key+"life-saver/TableFormat.json"
  //   process.stdout.write("aws file in life saver wise folder loaed table "+ TableFormatJsonPath+ "\n")
  //   jsonFileData = await readFile.readFileFromS3(TableFormatJsonPath);

  //   readtemplatePath = key+"life-saver/template.html"
  //   process.stdout.write("aws file in life saver wise folder loaed html"+ readtemplatePath+ "\n")
  //   htmlFileData = await readFile.readFileFromS3(readtemplatePath);    
  // }
  // else
  // {
  //   productName = productName.replace(/\s+/g, '-').toLowerCase();
  //   TableFormatJsonPath = key + productName+"/" + "TableFormat.json"
  //   process.stdout.write("aws file in product  wise folder loaed table "+ TableFormatJsonPath+ "\n")
  //   jsonFileData = await readFile.readFileFromS3(TableFormatJsonPath);

  //   readtemplatePath = key + productName+"/" + "template.html"
  //   process.stdout.write("aws file in product wise folder loaed html "+ readtemplatePath+ "\n")
  //   htmlFileData = await readFile.readFileFromS3(readtemplatePath);
  // }
  // // process.stdout.write("json responce file "+ htmlFileData)
  // // process.stdout.write("json responce file "+ jsonFileData)
  // TableFormatJson = JSON.parse(jsonFileData);
  // var data = htmlFileData;


//uncomment the below code for access file from device dir

var pathidvalue = `./public/template/${PlanName}`;
		
    if (doesDirectoryExist(pathidvalue))
		{
       TableFormatJsonPath = path.join(__dirname, "..", 'public', 'template', PlanName, 'TableFormat.json');
       readtemplatePath = path.join(__dirname, "..", 'public', 'template', PlanName, 'template.html');
		   process.stdout.write("sandhya in plan wise folder loaed "+ "\n");
		}
		else if(PlanName.includes("Saver"))
		{
		  TableFormatJsonPath = path.join(__dirname, "..", 'public', 'template', "Life Saver", 'TableFormat.json');
      readtemplatePath = path.join(__dirname, "..", 'public', 'template', "Life Saver", 'template.html');
		  process.stdout.write("sandhya in Life saver  folder loaed "+ "\n");
		}
		else
		{
			TableFormatJsonPath = path.join(__dirname, "..", 'public', 'template', productName, 'TableFormat.json');
      readtemplatePath = path.join(__dirname, "..", 'public', 'template', productName, 'template.html');
			process.stdout.write("sandhya in proudct name wise loaded "+ "\n");
		}
TableFormatJson = require(TableFormatJsonPath);
var data = fs.readFileSync(readtemplatePath);



  caseId = requstJSON.caseId;
  spouseInsuredID = requstJSON.product.spouseInsured //sandhya
  child1InsuredID = requstJSON.product.child1Insured
  subplanname = requstJSON.product.planName;
  process.stdout.write("subplanname " + subplanname+ "\n");
  
  TableCreateJSON = TableFormatJson.TableCreateJSON;
  TableJSONKey = TableFormatJson.TableJSONKey;
  InnerTableCreation = TableFormatJson.InnerTableCreation;
  AllLife_Coverages = TableFormatJson.AllLife_Coverages;
  Interview = TableFormatJson.Interview;
  InterviewUIFormat = TableFormatJson.InterviewUIFormat;
  InterviewFormat = TableFormatJson.InterviewFormat;
  TableInStucturedFormat = TableFormatJson.TableInStucturedFormat;
  InteviewCategory = TableFormatJson.InteviewCategory;
  InterviewTableCreateJSONMain = TableFormatJson.InterviewTableCreateJSONMain;
  InterviewTableJSONKey = TableFormatJson.InterviewTableJSONKey;
  InterviewTableJSONKeyOther = TableFormatJson.InterviewTableJSONKeyOther;
  TableJSONKeyOther = TableFormatJson.TableJSONKeyOther;
  DivShowHide = TableFormatJson.DivShowHide;

  read_template = data.toString();
  var caseIdPath = `./public/${caseId}`;

  if (doesDirectoryExist(caseIdPath))
  {
    process.stdout.write(`The directory exists.`+ "\n");
    try
    {
      fs.rmdirSync(caseIdPath,
      {
        recursive: true
      });
      process.stdout.write(`Director deleted successfully.`+caseIdPath+ "\n");
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

  fnKeyValueRecursiveCall(Request, Request);

  for (let count = 0; count < TableFormatJson.optionalData.length; count++)
  {
    let replacedString = TableFormatJson.optionalData[count];
   
    read_template = read_template.replaceAll(replacedString, "");
  }

  fnReplaceundfinedvalue();

  fnRiderDivHideShow(subplanname);
   


  fnRplaceCoveragesWithNo(TableFormatJson.coverages);
  findShowHidePositions(Request);
  //process.stdout.write("DivHideArray=====>"+DivHideArray+ "\n")
  findArrayDifference();
  response_data = read_template;
  try
  {
    //uncomment below code saving pdf in local device
   fs.mkdirSync(`./public/${caseId}`);
   let readOutputPath = `./public/${caseId}/${caseId}.pdf`;
    // file written successfully
    var pdfDataArray = await generatePDF(response_data, caseId);
    return pdfDataArray;
  }
  catch (err)
  {
   // console.error(err);
   console.error('Error during searchProduct process:', err.stack);
   return 'InternalServerError';
    
  }
 
}

function doesDirectoryExist(directoryPath)
{
  try
  {
    // Check if the directory exists
    return fs.statSync(directoryPath).isDirectory();
  }
  catch (error)
  {
    // Handle the error if the directory does not exist
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

function fnKeyValueRecursiveCall(data, Request, keyPrefix = "")
{
  //process.stdout.write("data fnKeyValueRecursiveCall=====>" +data+ "\n" );
  if (typeof data === 'object')
  {
    for (const key in data)
    {
      //process.stdout.write("data fnKeyValueRecursiveCall=====>"+typeof data+ "\n" );
      
      if (data.hasOwnProperty(key))
      {
        const newKey = keyPrefix ? `${keyPrefix}.${key}` : key;
        // process.stdout.write("newKey=====>"+newKey+ "\n");
        if (TableCreateJSON.includes(newKey))
        {
         
          //process.stdout.write("Request=====>"+ Request+ "\n");
          fnCreateTable(newKey, data[key], Request);
        }
        else if (Interview.includes(newKey))
        {
          //fnSortTheInetrview(data[key],newKey);
          if (InterviewUIFormat.includes("Same"))
          {
            // process.stdout.write("InterviewUIFormat.includes(Same))"+InterviewUIFormat+ "\n")
            if (InterviewFormat.includes(newKey))
            {
              InterviewCategoryData = {};
              // process.stdout.write("InterviewFormat.includes(newKey) "+newKey+ "\n")
              //process.stdout.write("InterviewFormat.InteviewCategory " + InteviewCategory+ "\n")
              for (let count = 0; count < InteviewCategory.length; count++)
              {
                InterviewCategoryData[InteviewCategory[count]] = [];
              }
              categorizeQuestions(data[key]);
              sortArraysDynamically(InterviewCategoryData);
              // process.stdout.write("InterviewCategoryData "+InterviewCategoryData+ "\n")
              createTableInteviewForProposed(InterviewCategoryData, newKey);
              // process.stdout.write(JSON.stringify(InterviewCategoryData));
            }
          }
          else
          {
            fnSortTheInetrview(data[key], newKey);
          }
        }
        else if (AllLife_Coverages.includes(newKey))
        {
          fnCreateCoverages(data[key], newKey, null);
        }
        else if (TableInStucturedFormat.includes(newKey))
        {
          //process.stdout.write("data=====>"+newKey+ "\n");
          let datanew = data[key];
          let tableRows = createTableRows(datanew);
          var htmlDomObj = new JSDOM(read_template);
          let tableOne = `<table border="1"  style="width:100%;border-collapse: collapse;border-color: #7a0114;" ><tr><th></th><th></th><th>Yes/No</th><th>Please give details.</th></tr>${tableRows}</table>`;
          let tableID = htmlDomObj.window.document.getElementById(newKey);
          tableID.innerHTML = tableOne;
          read_template = "<!DOCTYPE html>" + htmlDomObj.window.document.getElementsByTagName('html')[0].outerHTML;
        }
        else
        {
          fnKeyValueRecursiveCall(data[key], Request, newKey);
        }
      }
    }
  }
  else
  {
    //process.stdout.write("=====>"+`${keyPrefix}: ${data}`);
    let replacedString = "||" + keyPrefix + "||";

    if (!read_template.includes(replacedString))
    {
        
      DocumentObject = HTMLParser.parse(read_template);
      let checkID = DocumentObject.getElementById(keyPrefix);
      if (typeof checkID != undefined && checkID != null)
      {

      }
      else
      {
        //process.stdout.write("=====>"+"||"+ keyPrefix +"#CHECKBOX#"+data+"||");
        let checkCheckBox = DocumentObject.getElementById(keyPrefix + "#CHECKBOX#" + data);
        // process.stdout.write("=====>"+"||"+ "#CHECKBOX# checkCheckBox "+checkCheckBox+"||");
        if (typeof checkCheckBox != undefined && checkCheckBox != null)
        {
          //process.stdout.write("type of checkbox "+typeof checkCheckBox+ "\n")
          checkCheckBox.innerHTML = '&#10004;' //"✔";
          read_template = "<!DOCTYPE html>" + DocumentObject.getElementsByTagName('html')[0].outerHTML;
        }
      }
       }

    else
    {

      read_template = read_template.replaceAll(replacedString, data);
    }
  }
}

function categorizeQuestions(data)
{
  data.answeredQuestions.forEach(question =>
  {
    InterviewCategoryData[question.category].push(question);
  });
}
const sortByPosition = (arr) => arr.sort((a, b) => a.position - b.position);
const sortArraysDynamically = async (data) =>
{
  for (const category in data)
  {
    if (Object.hasOwnProperty.call(data, category))
    {
      data[category] = sortByPosition(data[category]);
    }
  }
};

function createTableInteviewForProposed(InterviewCategoryData, newKey)
{
  let rows = '';
  let counter = 0;
  let subCounter = 0;
  let reflexiveCounter = 0;
  let htmlDomObj = new JSDOM(read_template);
  let GetCategory = Object.keys(InterviewCategoryData);
  var JSONObjectForCount = [];
  var BaseQuestionCount = 0;
  let Category = null;
  //process.stdout.write("GetCategory keys "+GetCategory.length+ "\n");
  for (let c = 0; c < GetCategory.length; c++)
  {
    if (Category == null)
    {
      Category = GetCategory[c];
    }
    else if (Category != GetCategory[c])
    {
      Category = GetCategory[c];
      BaseQuestionCount = 0;
    }
    let CategoryArray = InterviewCategoryData[Object.keys(InterviewCategoryData)[c]];
    //process.stdout.write("CategoryArray======"+CategoryArray.length+ "\n");
    //process.stdout.write("CategoryArray======"+JSON.stringify(CategoryArray)+ "\n");
    let tableID = htmlDomObj.window.document.getElementById(newKey + "." + Category);
    for (let a = 0; a < CategoryArray.length; a++)
    {
      let getQuestionId = CategoryArray[a].id;
      let row = htmlDomObj.window.document.createElement("tr");
      let cellNo = htmlDomObj.window.document.createElement("td");
      cellNo.innerHTML = ++BaseQuestionCount;
      row.appendChild(cellNo);
      let cell = htmlDomObj.window.document.createElement("td");
      cell.innerHTML = CategoryArray[a][InterviewTableCreateJSONMain[newKey][0]]; //1 =td
      row.appendChild(cell);
      for (let colName = 0; colName < InterviewTableJSONKey[newKey + "." + Category].length; colName++)
      {
        let cell = htmlDomObj.window.document.createElement("td");
        if (typeof CategoryArray[a][InterviewTableJSONKey[newKey + "." + Category][colName]] != 'undefined')
        {
          cell.style.width = "60px";
          cell.innerHTML = CategoryArray[a][InterviewTableJSONKey[newKey + "." + Category][colName]];
        }
        else
        {
          cell.style.width = "100px";
          cell.innerHTML = " ";
        }
        row.appendChild(cell);
      }
      createTableInteviewForSpouseAndOther(InterviewTableJSONKeyOther[newKey], newKey, row, htmlDomObj, InterviewTableJSONKey, getQuestionId, "", "", "Base", Category);
      tableID.appendChild(row);
      if (typeof CategoryArray[a].disclosures != "undefined" && typeof CategoryArray[a].disclosures != undefined)
      {
        let DisclosuresCount = 64;
        for (let dis_count = 0; dis_count < CategoryArray[a].disclosures.length; dis_count++)
        {
          //   process.stdout.write("disclosures======"+JSON.stringify(CategoryArray[a].disclosures[dis_count])+ "\n");
          let row = htmlDomObj.window.document.createElement("tr");
          let cellNo = htmlDomObj.window.document.createElement("td");
          cellNo.innerHTML = String.fromCharCode(++DisclosuresCount)
          row.appendChild(cellNo);
          let cell = htmlDomObj.window.document.createElement("td");
          cell.innerHTML = CategoryArray[a].disclosures[dis_count][InterviewTableCreateJSONMain[newKey][0]]; //1 =td
          row.appendChild(cell);
          let disclosuresID = CategoryArray[a].disclosures[dis_count]["id"];
          for (let colName = 0; colName < InterviewTableJSONKey[newKey + "." + Category].length; colName++)
          {
            let cell = htmlDomObj.window.document.createElement("td");
            if (typeof CategoryArray[a].disclosures[dis_count][InterviewTableJSONKey[newKey + "." + Category][colName]] != 'undefined')
            {
              cell.style.width = "60px";
              cell.innerHTML = CategoryArray[a].disclosures[dis_count][InterviewTableJSONKey[newKey + "." + Category][colName]];
            }
            else
            {
              cell.style.width = "100px";
              cell.innerHTML = " ";
            }
            row.appendChild(cell);
          }
          createTableInteviewForSpouseAndOther(InterviewTableJSONKeyOther[newKey], newKey, row, htmlDomObj, InterviewTableJSONKey, getQuestionId, disclosuresID, "", "Disclosure", Category);
          tableID.appendChild(row);
          if (typeof CategoryArray[a].disclosures[dis_count].reflexiveQuestions != "undefined" && typeof CategoryArray[a].disclosures[dis_count].reflexiveQuestions != undefined)
          {
            let ReflexiveQuestionsCount = 96;
            for (let ref_count = 0; ref_count < CategoryArray[a].disclosures[dis_count].reflexiveQuestions.length; ref_count++)
            {
              let row = htmlDomObj.window.document.createElement("tr");
              let cellNo = htmlDomObj.window.document.createElement("td");
              cellNo.innerHTML = String.fromCharCode(++ReflexiveQuestionsCount);
              row.appendChild(cellNo);
              let cell = htmlDomObj.window.document.createElement("td");
              cell.innerHTML = CategoryArray[a].disclosures[dis_count][InterviewTableCreateJSONMain[newKey][0]]; //1 =td
              row.appendChild(cell);
              let reflexivePosition = CategoryArray[a].disclosures[dis_count].reflexiveQuestions[ref_count].position;
              for (let colName = 0; colName < InterviewTableJSONKey[newKey + "." + Category].length; colName++)
              {
                let cell = htmlDomObj.window.document.createElement("td");
                if (typeof CategoryArray[a].disclosures[dis_count].reflexiveQuestions[ref_count][InterviewTableJSONKey[newKey + "." + Category][colName]] != 'undefined')
                {
                  cell.style.width = "60px";
                  cell.innerHTML = CategoryArray[a].disclosures[dis_count].reflexiveQuestions[ref_count][InterviewTableJSONKey[newKey + "." + Category][colName]];
                }
                else
                {
                  cell.style.width = "100px";
                  cell.innerHTML = " ";
                }
                row.appendChild(cell);
              }
              createTableInteviewForSpouseAndOther(InterviewTableJSONKeyOther[newKey], newKey, row, htmlDomObj, InterviewTableJSONKey, getQuestionId, disclosuresID, reflexivePosition, "Reflexive", Category);
              tableID.appendChild(row);
            }
          }
        }
      }
    }
  }
  read_template = "<!DOCTYPE html>" + htmlDomObj.window.document.getElementsByTagName('html')[0].outerHTML;
}

function createTableInteviewForSpouseAndOther(InterviewTableJSONKeyOther, newKey, row, htmlDomObj, InterviewTableJSONKey, getQuestionId, disclosuresID, reflexivePosition, QuetionType, Category)
{
  
  for (let other = 0; other < InterviewTableJSONKeyOther.length; other++)
  {
    let SpouseKey = newKey.replaceAll("proposedInsured", InterviewTableJSONKeyOther[other]);
    var spouseDtailsJSON = _.get(Request, SpouseKey);
    if (QuetionType == "Base")
    {
      if (typeof spouseDtailsJSON != 'undefined' && typeof spouseDtailsJSON != undefined)
      {
        let resultSpouseId = spouseDtailsJSON.answeredQuestions.find(question => question.id === getQuestionId);
        for (let colName = 0; colName < InterviewTableJSONKey[SpouseKey + "." + Category].length; colName++)
        {
          let cell = htmlDomObj.window.document.createElement("td");
          if (typeof resultSpouseId[InterviewTableJSONKey[SpouseKey + "." + Category][colName]] != 'undefined')
          {
            cell.style.width = "60px";
            cell.innerHTML = resultSpouseId[InterviewTableJSONKey[SpouseKey + "." + Category][colName]];
          }
          else
          {
            cell.style.width = "100px";
            cell.innerHTML = " ";
          }
          row.appendChild(cell);
        }
      }
      else
      {
        if( productName == "Life" || productName == "Life Saver")
          {
        let cell = htmlDomObj.window.document.createElement("td");
        cell.style.width = "100px";
        cell.innerHTML = " ";
        row.appendChild(cell);
        let cell2 = htmlDomObj.window.document.createElement("td");
        cell.style.width = "100px";
        cell.innerHTML = " ";
        row.appendChild(cell2);
          }
      }
    }
    else if (QuetionType == "Disclosure")
    {
      if (typeof spouseDtailsJSON != 'undefined' && typeof spouseDtailsJSON != undefined)
      {
        let resultSpouseId = spouseDtailsJSON.answeredQuestions.find(question => question.id === getQuestionId);
        let disclosureWithId = resultSpouseId.disclosures.find(disclosure => disclosure.id === disclosuresID);
       
        for (let colName = 0; colName < InterviewTableJSONKey[SpouseKey + "." + Category].length; colName++)
        {
          let cell = htmlDomObj.window.document.createElement("td");
          if (typeof disclosureWithId[InterviewTableJSONKey[SpouseKey + "." + Category][colName]] != 'undefined')
          {
            cell.style.width = "60px";
            cell.innerHTML = disclosureWithId[InterviewTableJSONKey[SpouseKey + "." + Category][colName]];
          }
          else
          {
            cell.style.width = "100px";
            cell.innerHTML = " ";
          }
          row.appendChild(cell);
        }
      }
      else
      {
        if( productName == "Life" || productName == "Life Saver")
          {
        let cell = htmlDomObj.window.document.createElement("td");
        cell.style.width = "100px";
        cell.innerHTML = " ";
        row.appendChild(cell);
        let cell2 = htmlDomObj.window.document.createElement("td");
        cell.style.width = "100px";
        cell.innerHTML = " ";
        row.appendChild(cell2);
          }
      }
    }
    else if (QuetionType == "Reflexive")
    {
      if (typeof spouseDtailsJSON != 'undefined' && typeof spouseDtailsJSON != undefined)
      {
        let resultSpouseId = spouseDtailsJSON.answeredQuestions.find(question => question.id === getQuestionId);
        let disclosureWithId = resultSpouseId.disclosures.find(disclosure => disclosure.id === disclosuresID);
        let reflexiveWithId = disclosureWithId.reflexiveQuestions.find(reflexive => reflexive.position === reflexivePosition);
        
        for (let colName = 0; colName < InterviewTableJSONKey[SpouseKey + "." + Category].length; colName++)
        {
          let cell = htmlDomObj.window.document.createElement("td");
          if (typeof reflexiveWithId[InterviewTableJSONKey[SpouseKey + "." + Category][colName]] != 'undefined')
          {
            cell.style.width = "60px";
            cell.innerHTML = reflexiveWithId[InterviewTableJSONKey[SpouseKey + "." + Category][colName]];
          }
          else
          {
            cell.style.width = "100px";
            cell.innerHTML = " ";
          }
          row.appendChild(cell);
        }
      }
      else
      {
        if( productName == "Life" || productName == "Life Saver")
        {
        let cell = htmlDomObj.window.document.createElement("td");
        cell.style.width = "100px";
        cell.innerHTML = " ";
        row.appendChild(cell);
        let cell2 = htmlDomObj.window.document.createElement("td");
        cell.style.width = "100px";
        cell.innerHTML = " ";
        row.appendChild(cell2);
        //process.stdout.write("in Reflexive create table"+ "\n")
        }
      }
    }
  }
}

function createTableRows(data)
{
  process.stdout.write("in create table"+ data)
  let rows = '';
  let counter = 0;
  let subCounter = 0;
  let reflexiveCounter = 0;
  data.answeredQuestions.forEach(question =>
  {
    rows += `<tr><td>${++counter}</td><td>${question.text}</td><td>${question.answer}</td><td>${question.answerDetail || ''}</td></tr>`;
    if (question.disclosures)
    {
      question.disclosures.forEach(disclosure =>
      {
        let no = counter + "." + (++subCounter);
        rows += `<tr><td>${no}</td><td>${disclosure.text}</td><td>${disclosure.answer}</td><td></td></tr>`;
        if (disclosure.reflexiveQuestions)
        {
          disclosure.reflexiveQuestions.forEach(reflexiveQuestion =>
          {
            let reflexiveNo = no + "." + (++reflexiveCounter);
            rows += `<tr><td>${reflexiveNo}</td><td>${reflexiveQuestion.text}</td><td>${reflexiveQuestion.answer}</td><td></td></tr>`;
          });
        }
      });
    }
  });
  return rows;
}

function fnCreateCoverages(jsonData, oldKey, currentKey = null) //(coverages_data)
{
  if (typeof jsonData === 'object' && jsonData !== null)
  {
    if (Array.isArray(jsonData))
    {
      // process.stdout.write("=====coverage 1====>"+coverageLookupTepm+ "\n")
      jsonData.forEach((item, index) => fnCreateCoverages(item, oldKey, index));
    }
    else
    {
      Object.keys(jsonData).forEach(key =>
      {
        const newKey = currentKey !== null ? `${currentKey}.${key}` : key;
        //process.stdout.write(`Key: ${newKey}, Value: ${jsonData[key]}`);
        //process.stdout.write("=====coverage 2====>"+coverageLookupTepm+ "\n")
        fnCreateCoverages(jsonData[key], oldKey, newKey);
      });
    }
  }
  else
  {
    var coverageToSearch = oldKey + "." + currentKey;
    var coverageToReplace;
    var GetPlanName = "";
    if (!currentKey.includes('.coverageLookup'))
    {
      let regexIncludeNumber = /^[^\d]*\d/;
      let regexIncludeNumberData = coverageToSearch.match(regexIncludeNumber);
      GetPlanName = regexIncludeNumberData[0] + ".coverageLookup";
      GetPlanName = _.get(Request, GetPlanName);
      if (typeof GetPlanName != 'undefined' && typeof GetPlanName != undefined)
      {
        let regexNotNumber = /^[^\d]*/;
        let regexNotNumberData = coverageToSearch.match(regexNotNumber);
        let regexForCurrentKey = /\d(.*)$/;
        let regexForCurrentKeyData = currentKey.match(regexForCurrentKey);
        coverageToReplace = regexNotNumberData[0] + GetPlanName + regexForCurrentKeyData[1];
        let replacedString = "||" + coverageToReplace + "||";
        //process.stdout.write("replacedString=====>"+replacedString+ "\n" );
        //process.stdout.write("data=====>"+jsonData+ "\n");
        //console.error("Type Error ====> 3"+typeof(read_template)+ "\n");
        read_template = read_template.replaceAll(replacedString, jsonData);
      }
    }
    else
    {}
  }
}

function fnRplaceCoveragesWithNo(TableJsonParam)
{
  for (let count = 0; count < TableJsonParam.length; count++)
  {
    let replacedString = "||" + TableJsonParam[count] + "||";
    //process.stdout.write("=====>"+replacedString + "\n");
    if (read_template.includes(replacedString))
    {
      //console.error("Type Error ====> 4"+typeof(read_template)+ "\n");
      if(replacedString.includes("spouseInsured") && spouseInsuredID == undefined )
      {
        read_template = read_template.replaceAll(replacedString, "");
      }
      else
      {
        read_template = read_template.replaceAll(replacedString, "No");
      }
    }
  }
}

function fnCreateTable(oldKey, data, Request)
{
  let htmlDomObj = new JSDOM(read_template);
  let tableID = htmlDomObj.window.document.getElementById(oldKey);
  //process.stdout.write("tableID"+ tableID+ "\n");
  let detail_data = Object.keys(data);
  // process.stdout.write(" Object.keys(data)"+ Object.keys(data)+ "\n");
  //process.stdout.write("detail_data",detail_data)
  let containsCommonWord = InnerTableCreation.some(word => detail_data.includes(word));
  //process.stdout.write("containsCommonWord"+ containsCommonWord+ "\n")
  if (containsCommonWord)
  {
    if (detail_data.length > 1)
    {
      for (let detailsCount = 0; detailsCount < detail_data.length; detailsCount++)
      {
        //process.stdout.write("DATA One=====>"+detail_data[detailsCount]+ "\n");
        if (detail_data[detailsCount] == 'details')
        {
          for (let dataCount = 0; dataCount < data.details.length; dataCount++)
          {
            let row = htmlDomObj.window.document.createElement("tr");
            var cell = htmlDomObj.window.document.createElement("td");
            cell.innerHTML = parseInt(dataCount) + 1;
            row.appendChild(cell);
            for (let cellcount = 0; cellcount < TableJSONKey[oldKey].length; cellcount++)
            {
              var cell = htmlDomObj.window.document.createElement("td");
              if (typeof data.details[dataCount][TableJSONKey[oldKey][cellcount]] != 'undefined' && typeof data.details[dataCount][TableJSONKey[oldKey][cellcount]] != undefined)
              {
                cell.innerHTML = data.details[dataCount][TableJSONKey[oldKey][cellcount]];
              }
              else
              {
                cell.innerHTML = "";
              }
              row.appendChild(cell);
            }
            if (typeof TableJSONKeyOther[oldKey] != "undefined" && typeof TableJSONKeyOther[oldKey] != undefined)
            {
              for (let other = 0; other < TableJSONKeyOther[oldKey].length; other++)
              {
                let spouseDtailsTable = oldKey.replaceAll("proposedInsured", TableJSONKeyOther[oldKey][other]);
                var spouseDtailsJSON = _.get(Request, spouseDtailsTable);
                let spousedetailsMapData;
                if (typeof spouseDtailsJSON != 'undefined' && typeof spouseDtailsJSON != undefined)
                  {
                      spousedetailsMapData = spouseDtailsJSON.details[dataCount];
                  }
                  else{
                      spousedetailsMapData = spouseDtailsJSON;
                  }
                createTableOther(TableJSONKey, oldKey, htmlDomObj, spousedetailsMapData, spouseDtailsTable, spouseDtailsJSON, row);
              }
            }
            tableID.appendChild(row);
          }
        }
        else
        {
          let columeName = oldKey + "." + detail_data[detailsCount];
          let tableID = htmlDomObj.window.document.getElementById(columeName);
          // process.stdout.write("DATA One=====>"+JSON.stringify(data[detail_data[detailsCount]].details)+ "\n");
          for (let dataCount = 0; dataCount < data[detail_data[detailsCount]].details.length; dataCount++)
          {
            let row = htmlDomObj.window.document.createElement("tr");
            var cell = htmlDomObj.window.document.createElement("td");
            cell.innerHTML = parseInt(dataCount) + 1;
            row.appendChild(cell);
            // process.stdout.write("DATA One=====>"+JSON.stringify(data.details)+ "\n");
            for (let cellcount = 0; cellcount < TableJSONKey[columeName].length; cellcount++)
            {
              var cell = htmlDomObj.window.document.createElement("td");
              if (typeof data[detail_data[detailsCount]].details[dataCount][TableJSONKey[columeName][cellcount]] != 'undefined' && typeof data[detail_data[detailsCount]].details[dataCount][TableJSONKey[columeName][cellcount]] != undefined)
              {
                cell.innerHTML = data[detail_data[detailsCount]].details[dataCount][TableJSONKey[columeName][cellcount]];
              }
              else
              {
                cell.innerHTML = "";
              }
              row.appendChild(cell);
            }
            for (let other = 0; other < TableJSONKeyOther[columeName].length; other++)
            {
              let spouseDtailsTable = columeName.replaceAll("proposedInsured", TableJSONKeyOther[oldKey][other]);
              var spouseDtailsJSON = _.get(Request, spouseDtailsTable);
              let spousedetailsMapData;
          if (typeof spouseDtailsJSON != 'undefined' && typeof spouseDtailsJSON != undefined)
            {
                spousedetailsMapData = spouseDtailsJSON.details[dataCount]
            }
            else{
                spousedetailsMapData = spouseDtailsJSON;
            }
              createTableOther(TableJSONKey, oldKey, htmlDomObj, spousedetailsMapData, spouseDtailsTable, spouseDtailsJSON, row);
            }
            tableID.appendChild(row);
          }
        }
      }
    }
    else
    {
      for (let dataCount = 0; dataCount < data.details.length; dataCount++)
      {
       // process.stdout.write("DATA One122=====>"+data.details+ "\n");
        let row = htmlDomObj.window.document.createElement("tr");
        var cell = htmlDomObj.window.document.createElement("td");
        cell.innerHTML = parseInt(dataCount) + 1;
        row.appendChild(cell);
        for (let cellcount = 0; cellcount < TableJSONKey[oldKey].length; cellcount++)
        {
          var cell = htmlDomObj.window.document.createElement("td");
          if (typeof data.details[dataCount][TableJSONKey[oldKey][cellcount]] != 'undefined' && typeof data.details[dataCount][TableJSONKey[oldKey][cellcount]] != undefined)
          {
            cell.innerHTML = data.details[dataCount][TableJSONKey[oldKey][cellcount]];
          }
          else
          {
            cell.innerHTML = "";
          }
          row.appendChild(cell);
        }
        if (typeof TableJSONKeyOther[oldKey] != "undefined" && typeof TableJSONKeyOther[oldKey] != undefined)
        {
          for (let other = 0; other < TableJSONKeyOther[oldKey].length; other++)
          {
            let spouseDtailsTable = oldKey.replaceAll("proposedInsured", TableJSONKeyOther[oldKey][other]);
            var spouseDtailsJSON = _.get(Request, spouseDtailsTable);
            let spousedetailsMapData;
          if (typeof spouseDtailsJSON != 'undefined' && typeof spouseDtailsJSON != undefined)
            {
                spousedetailsMapData = spouseDtailsJSON.details[dataCount]
            }
            else{
                spousedetailsMapData = spouseDtailsJSON;
            }
            createTableOther(TableJSONKey, oldKey, htmlDomObj, spousedetailsMapData, spouseDtailsTable, spouseDtailsJSON, row);
          }
        }
        tableID.appendChild(row);
      }
    }
  }
  else
  {
    for (let dataCount = 0; dataCount < detail_data.length; dataCount++)
    {
        ;
      let row = htmlDomObj.window.document.createElement("tr");
      var cell = htmlDomObj.window.document.createElement("td");
      
      cell.innerHTML = detail_data[dataCount];
      
      row.appendChild(cell);
      
      for (let cellcount = 0; cellcount < TableJSONKey[oldKey].length; cellcount++)
      {
        var cell = htmlDomObj.window.document.createElement("td");
       

      //  console.log ("Data "+data+" datails data "+detail_data+" count "+dataCount+" datails "+data[detail_data[dataCount]].details+"table json key "+TableJSONKey+"old key "+oldKey+"cell count "+cellcount);

        if (typeof data[detail_data[dataCount]].details[TableJSONKey[oldKey][cellcount]] != 'undefined' && data[detail_data[dataCount]].details[TableJSONKey[oldKey][cellcount]] != undefined)
        {
            
          cell.innerHTML = data[detail_data[dataCount]].details[TableJSONKey[oldKey][cellcount]];
        }
        else
        {
         
          cell.innerHTML = "";
        }
        row.appendChild(cell);
      }
      if (typeof TableJSONKeyOther[oldKey] != "undefined" && typeof TableJSONKeyOther[oldKey] != undefined)
      {
       
        for (let other = 0; other < TableJSONKeyOther[oldKey].length; other++)
        {
            
          let spouseDtailsTable = oldKey.replaceAll("proposedInsured", TableJSONKeyOther[oldKey][other]);
         // process.stdout.write("DATA oldKey=====>  "+oldKey+ "\n");
         // process.stdout.write("DATA TableJSONKeyOther[oldKey][other]=====> "+TableJSONKeyOther[oldKey][other]+ "\n");
         // process.stdout.write("DATA spouseDtailsTable=====>  "+spouseDtailsTable+ "\n");
          var spouseDtailsJSON = _.get(Request, spouseDtailsTable);
         // product.proposedInsured.familyDetails.health
         // process.stdout.write("DATA One133333=====> spouseDtailsJSON "+JSON.stringify(spouseDtailsJSON)+ "\n");
          let spousedetailsMapData;
          if (typeof spouseDtailsJSON != 'undefined' && typeof spouseDtailsJSON != undefined)
            {
                spousedetailsMapData = spouseDtailsJSON[detail_data[dataCount]].details
            }
            else{
                spousedetailsMapData = spouseDtailsJSON;
            }
           // process.stdout.write("DATA One144444=====> spousedetailsMapData "+spousedetailsMapData+ "\n");
          
          createTableOther(TableJSONKey, oldKey, htmlDomObj, spousedetailsMapData, spouseDtailsTable, spouseDtailsJSON, row);
          //process.stdout.write("DATA One133333==8888===>");
        }
      }
      
      tableID.appendChild(row);
    }
  }
  read_template = "<!DOCTYPE html>" + htmlDomObj.window.document.getElementsByTagName('html')[0].outerHTML;
}

function createTableOther(TableJSONKey, oldKey, htmlDomObj, mapdata, spouseDtailsTable, spouseDtailsJSON, row)
{
   // process.stdout.write("DATA 999=====>");
  if (typeof spouseDtailsJSON != 'undefined' && typeof spouseDtailsJSON != undefined)
  {
    for (let cellcount = 0; cellcount < TableJSONKey[spouseDtailsTable].length; cellcount++)
    {
      var cell = htmlDomObj.window.document.createElement("td");
      
      if (typeof mapdata[TableJSONKey[spouseDtailsTable][cellcount]] != 'undefined' && mapdata[TableJSONKey[spouseDtailsTable][cellcount]] != undefined)
      {
        cell.innerHTML = mapdata[TableJSONKey[spouseDtailsTable][cellcount]];
      }
      else
      {
        cell.innerHTML = "";
      }
      row.appendChild(cell);
    }
  }
  else
  {
    //process.stdout.write("DATA One6666=====>");
    for (let cellcount = 0; cellcount < TableJSONKey[oldKey].length; cellcount++)
    {
        
      var cell = htmlDomObj.window.document.createElement("td");
      cell.innerHTML = "";
      row.appendChild(cell);
    }
  }
  //}
}

function fnSortTheInetrview(interviewObject, keyMerge)
{
  interviewObject.answeredQuestions.sort((a, b) => a.position - b.position);
  interviewObject.answeredQuestions.forEach((entry, index) =>
  {
    entry.position = index + 1;
  });
  fnMapInterviewAnswer(interviewObject, keyMerge);
}

function fnMapInterviewAnswer(interviewObject, keyMerge)
{
  var htmlDomObj = new JSDOM(read_template);
  var category = "";
  var getCategoryTable = "";
  var BaseQuestionCount = 0;
  var tableBody = "";
  var JSONObjectForCount = [];
  //var tableBody = htmlDomObj.window.document.createElement("tbody");
  for (let count = 0; count < interviewObject.answeredQuestions.length; count++)
  {
    category = keyMerge + "." + interviewObject.answeredQuestions[count].category;
    //process.stdout.write("keyMerge===="+category)
    tableBody = htmlDomObj.window.document.getElementById(category);
    var row = htmlDomObj.window.document.createElement("tr");
    if (JSONObjectForCount.length > 0)
    {
      let testCatFlag = false;
      for (let getCat = 0; getCat < JSONObjectForCount.length; getCat++)
      {
        if (Object.keys(JSONObjectForCount[getCat])[0] == category)
        {
          testCatFlag = true;
        }
      }
      if (testCatFlag)
      {
        for (let objCount = 0; objCount < JSONObjectForCount.length; objCount++)
        {
          if (JSONObjectForCount[objCount].hasOwnProperty(category))
          {
            let TempArray = "";
            if (Object.keys(JSONObjectForCount[objCount])[0] == category)
            {
              TempArray = JSONObjectForCount[objCount][category];
              let TempBaseQuestionCount = Math.max(...TempArray)
              let finalBaseQuestionCount = ++TempBaseQuestionCount;
              JSONObjectForCount[objCount][category].push(finalBaseQuestionCount)
              BaseQuestionCount = finalBaseQuestionCount;
              break;
            }
          }
        }
      }
      else
      {
        var tempArray = {
          [category]: [1]
        };
        JSONObjectForCount.push(tempArray);
        BaseQuestionCount = 1;
      }
    }
    else
    {
      var tempArray = {
        [category]: [1]
      };
      JSONObjectForCount.push(tempArray);
      BaseQuestionCount = 1;
    }
    for (let createCell = 0; createCell < 6; createCell++)
    {
      var cell = htmlDomObj.window.document.createElement("td");
      if (createCell == 0)
      {
        cell.innerHTML = BaseQuestionCount; //interviewObject.answeredQuestions[count].position;
        row.appendChild(cell);
      }
      else if (createCell == 1)
      {
        cell.innerHTML = interviewObject.answeredQuestions[count].text;
        row.appendChild(cell);
      }
      if (interviewObject.answeredQuestions[count].answer != "Yes" && interviewObject.answeredQuestions[count].answer != "No")
      {
        if (createCell == 2)
        {
          cell.innerHTML = interviewObject.answeredQuestions[count].answer;
          cell.setAttribute("colspan", "4");
          row.appendChild(cell);
        }
      }
      else
      {
        if (createCell == 2)
        {
          cell.innerHTML = "Yes";
          cell.setAttribute("width", "5%");
          row.appendChild(cell);
        }
        else if (createCell == 3)
        {
          let div = htmlDomObj.window.document.createElement("div");
          if (interviewObject.answeredQuestions[count].answer == "Yes")
          {
            div.innerHTML = "&#10004;"
          }
          div.className = 'noBg checked centerAlign verticalAlignMiddle';
          div.setAttribute("style", "border: 1px solid black");
          cell.appendChild(div)
          row.appendChild(cell);
        }
        else if (createCell == 4)
        {
          cell.innerHTML = "No";
          cell.setAttribute("width", "5%");
          row.appendChild(cell);
        }
        else if (createCell == 5)
        {
          let div = htmlDomObj.window.document.createElement("div");
          if (interviewObject.answeredQuestions[count].answer == "No")
          {
            div.innerHTML = "&#10004;"
          }
          div.className = 'noBg checked centerAlign verticalAlignMiddle';
          div.setAttribute("style", "border: 1px solid black");
          cell.appendChild(div)
          row.appendChild(cell);
        }
      }
      // process.stdout.write("tableBody=="+tableBody)
      tableBody.appendChild(row);
    }
    if (typeof interviewObject.answeredQuestions[count].disclosures != "undefined" && typeof interviewObject.answeredQuestions[count].disclosures != undefined)
    {
      var DisclosuresCount = 64;
      var DisclosuresLength = interviewObject.answeredQuestions[count].disclosures.length - 1;
      for (let dis_count = 0; dis_count < interviewObject.answeredQuestions[count].disclosures.length; dis_count++)
      {
        // interviewObject.answeredQuestions[count].disclosures[dis_count].answer
        var row = htmlDomObj.window.document.createElement("tr");
        for (let createCell = 0; createCell < 6; createCell++)
        {
          var cell = htmlDomObj.window.document.createElement("td");
          if (createCell == 0)
          {
            //cell.innerHTML = String.fromCharCode(++DisclosuresCount);//interviewObject.answeredQuestions[count].position;
            if (DisclosuresLength == 0 && typeof interviewObject.answeredQuestions[count].disclosures[dis_count].reflexiveQuestions == "undefined")
            {}
            else if (dis_count == 0)
            {
              cell.setAttribute("style", "border-bottom-color: white;");
            }
            else if (DisclosuresLength == dis_count)
            {
              //cell.setAttribute("style", "border-bottom-color: white;");
            }
            else
            {
              cell.setAttribute("style", "border-bottom-color: white;");
            }
            row.appendChild(cell);
          }
          else if (createCell == 1)
          {
            if (DisclosuresLength == 0 && typeof interviewObject.answeredQuestions[count].disclosures[dis_count].reflexiveQuestions == "undefined")
            {}
            else if (dis_count == 0)
            {
              //style="border-bottom-color: white;border-right-color: white;"
              cell.setAttribute("style", "border-bottom-color: white;");
            }
            else if (DisclosuresLength == dis_count)
            {
              //cell.setAttribute("style", "border-bottom-color: white;");
            }
            else
            {
              //cell.setAttribute("style", "border-color: white;");
              cell.setAttribute("style", "border-bottom-color: white;");
            }
            cell.innerHTML = String.fromCharCode(++DisclosuresCount) + "." + " " + interviewObject.answeredQuestions[count].disclosures[dis_count].text;
            row.appendChild(cell);
          }
          if (interviewObject.answeredQuestions[count].disclosures[dis_count].answer != "Yes" && interviewObject.answeredQuestions[count].disclosures[dis_count].answer != "No")
          {
            if (createCell == 2)
            {
              cell.innerHTML = interviewObject.answeredQuestions[count].disclosures[dis_count].answer;
              cell.setAttribute("colspan", "4");
              row.appendChild(cell);
            }
          }
          else
          {
            if (createCell == 2)
            {
              cell.innerHTML = "Yes";
              cell.setAttribute("width", "5%");
              row.appendChild(cell);
            }
            else if (createCell == 3)
            {
              let div = htmlDomObj.window.document.createElement("div");
              if (interviewObject.answeredQuestions[count].disclosures[dis_count].answer == "Yes")
              {
                div.innerHTML = "&#10004;"
              }
              div.className = 'noBg checked centerAlign verticalAlignMiddle';
              div.setAttribute("style", "border: 1px solid black");
              cell.appendChild(div)
              row.appendChild(cell);
            }
            else if (createCell == 4)
            {
              cell.innerHTML = "No";
              cell.setAttribute("width", "5%");
              row.appendChild(cell);
            }
            else if (createCell == 5)
            {
              let div = htmlDomObj.window.document.createElement("div");
              if (interviewObject.answeredQuestions[count].disclosures[dis_count].answer == "No")
              {
                div.innerHTML = "&#10004;"
              }
              div.className = 'noBg checked centerAlign verticalAlignMiddle';
              div.setAttribute("style", "border: 1px solid black");
              cell.appendChild(div)
              row.appendChild(cell);
            }
          }
          // process.stdout.write("tableBody=="+tableBody)//border-bottom-color: white;
          tableBody.appendChild(row);
        }
        if (typeof interviewObject.answeredQuestions[count].disclosures[dis_count].reflexiveQuestions != "undefined" && typeof interviewObject.answeredQuestions[count].disclosures[dis_count].reflexiveQuestions != undefined)
        {
          // var row = htmlDomObj.window.document.createElement("tr");
          var ReflexiveQuestionsCount = 96;
          var ReflexiveQuestionsLength = interviewObject.answeredQuestions[count].disclosures[dis_count].reflexiveQuestions.length - 1;
          for (let ref_count = 0; ref_count < interviewObject.answeredQuestions[count].disclosures[dis_count].reflexiveQuestions.length; ref_count++)
          {
            
            var row = htmlDomObj.window.document.createElement("tr");
            for (let createCell = 0; createCell < 6; createCell++)
            {
              var cell = htmlDomObj.window.document.createElement("td");
              if (createCell == 0)
              {
                if (ReflexiveQuestionsLength == ref_count)
                {
                  
                }
                else if (ref_count == 0)
                {
                  cell.setAttribute("style", "border-bottom-color: white;");
                }
                else
                {
                  cell.setAttribute("style", "border-bottom-color: white;");
                }
                
                row.appendChild(cell);
              }
              else if (createCell == 1)
              {
                if (ReflexiveQuestionsLength == ref_count)
                {
                  
                  cell.setAttribute("style", "padding-left: 20px;");
                }
                else if (ref_count == 0)
                {
                  cell.setAttribute("style", "border-bottom-color: white;padding-left: 20px;");
                }
                else
                {
                  
                  cell.setAttribute("style", "border-bottom-color: white;padding-left: 20px;");
                }
                cell.innerHTML = String.fromCharCode(++ReflexiveQuestionsCount) + "." + " " + interviewObject.answeredQuestions[count].disclosures[dis_count].reflexiveQuestions[ref_count].text;
                row.appendChild(cell);
              }
              if (interviewObject.answeredQuestions[count].disclosures[dis_count].reflexiveQuestions[ref_count].answer != "Yes" && interviewObject.answeredQuestions[count].disclosures[dis_count].reflexiveQuestions[ref_count].answer != "No")
              {
                if (createCell == 2)
                {
                  cell.innerHTML = interviewObject.answeredQuestions[count].disclosures[dis_count].reflexiveQuestions[ref_count].answer;
                  cell.setAttribute("colspan", "4");
                  row.appendChild(cell);
                }
              }
              else
              {
                if (createCell == 2)
                {
                  cell.innerHTML = "Yes";
                  cell.setAttribute("width", "5%");
                  row.appendChild(cell);
                }
                else if (createCell == 3)
                {
                  let div = htmlDomObj.window.document.createElement("div");
                  if (interviewObject.answeredQuestions[count].disclosures[dis_count].reflexiveQuestions[ref_count].answer == "Yes")
                  {
                    div.innerHTML = "&#10004;"
                  }
                  div.className = 'noBg checked centerAlign verticalAlignMiddle';
                  div.setAttribute("style", "border: 1px solid black");
                  cell.appendChild(div)
                  row.appendChild(cell);
                }
                else if (createCell == 4)
                {
                  cell.innerHTML = "No";
                  cell.setAttribute("width", "5%");
                  row.appendChild(cell);
                }
                else if (createCell == 5)
                {
                  let div = htmlDomObj.window.document.createElement("div");
                  if (interviewObject.answeredQuestions[count].disclosures[dis_count].reflexiveQuestions[ref_count].answer == "No")
                  {
                    div.innerHTML = "&#10004;"
                  }
                  div.className = 'noBg checked centerAlign verticalAlignMiddle';
                  div.setAttribute("style", "border: 1px solid black");
                  cell.appendChild(div)
                  row.appendChild(cell);
                }
              }
              // process.stdout.write("tableBody=="+tableBody)
              tableBody.appendChild(row);
            }
          }
        }
      }
    }
    // getCategoryTable.appendChild(tableBody);
  }
  read_template = "<!DOCTYPE html>" + htmlDomObj.window.document.getElementsByTagName('html')[0].outerHTML;
  //fs.writeFileSync('./template/test.html', htmlDomObj.window.document.getElementsByTagName('html')[0].outerHTML);
}

//uncomment below code saving pdf in local device
async function generatePDF(response_data, outputPath)
{
  var dirpath =`./public/${caseId}`; 
  let path = `./public/${caseId}/${caseId}.pdf`; 
  process.stdout.write("sandhya in generate pdf " + outputPath + "\n");
   //process.stdout.write("sandhya in generate pdf "+response_data+ "\n");
  var currentDate = new Date();
  var createdate = currentDate.toLocaleString();
  const collectionNames = process.env.COLLECTION_NAMES.split(",");
  const collectionName = collectionNames[0]; 
  process.stdout.write("collectionName in generate pdf " + collectionName + "\n");
  let pdfDataArray = [];
  return new Promise(async (resolve, reject) =>
  {
    process.stdout.write("collectionName in generate pdf 3" + collectionName + "\n");
   await wkhtmltopdf(response_data,
    {
      output: path,
      pageSize: 'A4'
    }, async (err) =>
    {
      
      if (err)
      {       
        process.stdout.write("sandhya in generate err " + err.stack);
        reject(err); // Reject the Promise if there's an error
      }
      else
      {
        let path = `./public/${caseId}/${caseId}.pdf`;    //process.env.path_pdf
        var data = fs.readFileSync(path);
         process.stdout.write("sandhya in generate err " + path + "\n");
        base64Data = data.toString('base64');
        let documents = {
          name: "Proposal",
          base64content: base64Data
        };
        pdfDataArray.push(documents);
        process.stdout.write("pdf is converted to base64"+ "\n");
        //return pdfDataArray
       const caseIdValue = await mongoConnection.getDataFromDB({ caseId: caseId }, collectionName);
        if (!caseIdValue) 
          {
            process.stdout.write(`caseIdValue not found ${caseIdValue}`+ "\n");
            
            const newproposal= {
              caseId: caseId,
              documentUrl : base64Data,
              creationDate : createdate,
              modificationDate : createdate
            };
    
            process.stdout.write("Inserted data:"+newproposal+ "\n");
    
            const result = await mongoConnection.insertDataIntoDB(
              newproposal,
              collectionName
            );
           
            process.stdout.write("Inserted new proposal into database:"+ result+ "\n");
            resolve(pdfDataArray);
          }
        else
        {
          var modificationDate = currentDate.toLocaleString();
          process.stdout.write("caseId Values found ."+ "\n");
          const updateQuery = {           
            caseId : caseId  
           };
          const updateOperation = {
            $set: {
                documentUrl: base64Data,
                modificationDate : modificationDate,
            }
         };       
          // process.stdout.write('Updating fetched_on for output:', updateQuery);
          // process.stdout.write('Updating updateOperation for output:', updateOperation);
          // process.stdout.write('Updating collectionName for output:', collectionName);

          const result = await mongoConnection.updateDataIntoDB(updateQuery, updateOperation, collectionName);
          
          process.stdout.write(`Updated  for updateOperation ID ${caseId}:`+ JSON.stringify(result)+ "\n");
          resolve(pdfDataArray);
        
        }
      }
      

      //To remove a file from a structure folder, uncomment the code below.
      /*fs.rmdirSync(dirpath,
        {
          recursive: true
        });
        process.stdout.write(`Director deleted successfully sandhya.`+dirpath+ "\n");
        */

    });
  });
}

// async function generatePDF(response_data, caseId) {
//   const bucketName = process.env.S3_BUCKET_NAME; // Your S3 bucket name
//   const s3OutputPath = `output-files/${caseId}/${caseId}.pdf`; // Path in S3 bucket

//   process.stdout.write("Starting PDF generation for caseId:"+ caseId+"\n");

//   return new Promise((resolve, reject) => {
//       wkhtmltopdf(
//           response_data,
//           { pageSize: 'A4' },
//           async (err, stream) => {
//               if (err) {
//                   process.stdout.write("Error during PDF generation:"+ err+"\n");
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
//                       process.stdout.write("PDF uploaded to S3:"+ s3OutputPath+"\n");

//                       // Base64 encoding for further use
//                       const base64Data = pdfBuffer.toString('base64');
//                       const documents = {
//                           name: "Proposal",
//                           base64content: base64Data,
//                       };

//                       const pdfDataArray = [documents];

//                       // Check or update the database
//                       const collectionName = process.env.COLLECTION_NAMES.split(",")[0];
//                       const currentDate = new Date().toLocaleString();
//                       const quoteIdValue = await mongoConnection.getDataFromDB({ caseId: caseId }, collectionName);

//                       if (!quoteIdValue) {
//                           const newProposal = {
//                               caseId: caseId,
//                               documentUrl: base64Data,
//                               creationDate: currentDate,
//                               modificationDate: currentDate,
//                           };

//                           await mongoConnection.insertDataIntoDB(newProposal, collectionName);
//                           process.stdout.write("Inserted new proposal into database."+"\n");
//                       } else {
//                           const updateQuery = { caseId: caseId };
//                           const updateOperation = {
//                               $set: {
//                                   documentUrl: base64Data,
//                                   modificationDate: currentDate,
//                               },
//                           };

//                           await mongoConnection.updateDataIntoDB(updateQuery, updateOperation, collectionName);
//                           process.stdout.write(`Updated existing proposal for caseId ${caseId}.`+"\n");
//                       }

//                       resolve(pdfDataArray);
//                   });
//               } catch (uploadError) {
//                 process.stdout.write("Error uploading to S3:"+ uploadError+"\n");
//                   reject(uploadError);
//               }
//           }
//       );
//   });
// }

// async function generatePDF(response_data, caseId) {
//   const bucketName = process.env.S3_BUCKET_NAME;
//   const s3OutputPath = `output-files/${caseId}/${caseId}.pdf`;

//   process.stdout.write("Starting PDF generation for caseId:" + caseId + "\n");

//   try {
//       const pdfBuffer = await new Promise((resolve, reject) => {
//           wkhtmltopdf(response_data, { pageSize: 'A4' }, (err, stream) => {
//               if (err) {
//                   process.stdout.write("Error during PDF generation: " + err + "\n");
//                   return reject(err);
//               }

//               const chunks = [];
//               stream.on('data', (chunk) => chunks.push(chunk));
//               stream.on('end', () => resolve(Buffer.concat(chunks)));
//               stream.on('error', (streamErr) => reject(streamErr));
//           });
//       });

//       const uploadParams = {
//           Bucket: bucketName,
//           Key: s3OutputPath,
//           Body: pdfBuffer,
//           ContentType: 'application/pdf',
//       };

//       // Upload to S3
//       try {
//           await s3.send(new PutObjectCommand(uploadParams));
//           process.stdout.write("PDF uploaded to S3: " + s3OutputPath + "\n");
//       } catch (s3Error) {
//           process.stdout.write("Error uploading to S3: " + s3Error + "\n");
//           throw s3Error;
//       }

//       const base64Data = pdfBuffer.toString('base64');
//       const documents = {
//           name: "Proposal",
//           base64content: base64Data,
//       };

//       const collectionName = process.env.COLLECTION_NAMES.split(",")[0];
//       const currentDate = new Date().toLocaleString();

//       // Database Operations
//       const quoteIdValue = await mongoConnection.getDataFromDB({ caseId: caseId }, collectionName);
//       if (!quoteIdValue) {
//           const newProposal = {
//               caseId: caseId,
//               documentUrl: base64Data,
//               creationDate: currentDate,
//               modificationDate: currentDate,
//           };
//           await mongoConnection.insertDataIntoDB(newProposal, collectionName);
//           process.stdout.write("Inserted new proposal into database.\n");
//       } else {
//           const updateQuery = { caseId: caseId };
//           const updateOperation = {
//               $set: {
//                   documentUrl: base64Data,
//                   modificationDate: currentDate,
//               },
//           };
//           await mongoConnection.updateDataIntoDB(updateQuery, updateOperation, collectionName);
//           process.stdout.write(`Updated existing proposal for caseId ${caseId}.\n`);
//       }

//       return [documents];
//   } catch (error) {
//       process.stdout.write("Critical error: " + error + "\n");
//       throw new Error(error); // Propagate the error
//   }
// }

const generateAndSavePDF = async (response_data, outputPath) =>
{
  try
  {
    const pdfDataArray = await generatePDF(response_data, outputPath);
    process.stdout.write('PDF generated successfully.' + pdfDataArray+ "\n");
    return pdfDataArray;
  }
  catch (error)
  {
    console.error('Error generating PDF:', error);
  }
}

function findShowHidePositions(data, keyPrefix = "")
{
  if (typeof data === 'object')
  {
    //  process.stdout.write("findPositions= 1==>")
    for (const key in data)
    {
      if (data.hasOwnProperty(key))
      {
        const newKey = keyPrefix ? `${keyPrefix}.${key}` : key;
        //process.stdout.write("findPositions===>"+newKey+ "\n")
        if (DivShowHide.includes(newKey))
        {
          DivHideArray.push(newKey);
         // process.stdout.write("Dive hide array "+DivHideArray+ "\n");
        }
        findShowHidePositions(data[key], newKey);
      }
    }
  }
}

function findArrayDifference()
{
  let htmlDomObj = new JSDOM(read_template);
  const difference1 = DivHideArray.filter(element => !DivShowHide.includes(element));
  //process.stdout.write("const difference1 "+difference1+ "\n");
  const difference2 = DivShowHide.filter(element => !DivHideArray.includes(element));
  //process.stdout.write("const difference2 "+difference2+ "\n");
  const result = difference1.concat(difference2);
 // process.stdout.write("Dive hide array "+result+ "\n");
  for (let i = 0; i < result.length; i++)
  {
    let tableID = htmlDomObj.window.document.getElementsByName(result[i]);
   // process.stdout.write("Inside findArrayDifference "+tableID)
    for (let j = 0; j < tableID.length; j++)
    {
      tableID[j].style.display = "none";
    }
    //tableID.style.display = "none";
  }
  read_template = "<!DOCTYPE html>" + htmlDomObj.window.document.getElementsByTagName('html')[0].outerHTML;
}

function fnReplaceundfinedvalue()
{
    if (productName == "Life" || productName =="Life Saver")
    {  
      if (spouseInsuredID == undefined)
      {
          for (let count = 0; count < TableFormatJson.spouseInsureddata.length; count++)
          {
            let replacedString = TableFormatJson.spouseInsureddata[count];
          
            read_template = read_template.replaceAll(replacedString, "");
          }
      }
    }
}

function fnRiderDivHideShow(subplanname)
{
  let htmlDomObj = new JSDOM(read_template);
  let hiderowarray = [];
  let showrowarray = [];
  if(subplanname == "Degree Saver" ||  subplanname=="Ceylinco_Life_Smart_Saver")
  {
     hiderowarray = ["IF_SA_pension","Pension_Saver_Option"];
     showrowarray = ["IF_SA_degree"];  
  }
  else if( subplanname =="Ceylinco_Life_Medical_Saver")
  {
    hiderowarray =["basic_sum_assured","basic_term","PensionSaverFund12","152R","Family_Protection_Benefit","LifeCoverOP","Pension_Saver_Option"];
    showrowarray=["LifeCoverOP_SA","LifeCoverOP_Policy_Term","MedicalSaverFund","159","YesBootbox_159"];

  }

  for (let i = 0; i < hiderowarray.length; i++)
    {
      let tableID = htmlDomObj.window.document.getElementById(hiderowarray[i]);
      process.stdout.write("table id hiderowarray "+hiderowarray[i]+ "\n");
    
      tableID.style.display = "none";    
    }
    
  for (let i = 0; i < showrowarray.length; i++)
    {
      let tableID = htmlDomObj.window.document.getElementById(showrowarray[i]);
      process.stdout.write("table id showrowarray "+showrowarray[i]+ "\n");
      if (tableID) {
        let tagName = tableID.tagName.toLowerCase(); 
        if (tagName === 'div') 
        {
          process.stdout.write("The element is a <div>."+ "\n");
          tableID.style.display = "block"; 
        }
        else if (tagName === 'table')
        {
          process.stdout.write("The element is a <table>."+ "\n");
          tableID.style.display = "block"; 
        }
        else if (tagName === 'tr') 
        {
          process.stdout.write("The element is a <tr> (table row)."+ "\n");
          tableID.style.display = "table-row"; 
        }
        else if (tagName === 'td') 
        {
          process.stdout.write("The element is a <td> (table cell)."+ "\n");
          tableID.style.display = "table-cell"; 
        }
        else
        {
          process.stdout.write("The element is of another type: " + tagName+ "\n");
        }
      }
            
    }
    read_template = "<!DOCTYPE html>" + htmlDomObj.window.document.getElementsByTagName('html')[0].outerHTML;
}

module.exports = {
  packageProvision
};

