const fs = require('fs');
var jsdom = require("jsdom");
const express = require('express');
const path = require('path');
const app = express();
var {	JSDOM} = jsdom;
var wkhtmltopdf = require('wkhtmltopdf');
require('dotenv').config();
let response_data = "";
var read_template = "";
let base64Data = "";
TableCreateJSON = [];
const mongoConnection = require("../DAO/mongoConnectionProcess");

const fnaOutput = async (reqBody) => 
{
	app.use(express.static(path.join(__dirname, "..", 'public','FNA_templates')));
	var pathidvalue = `./public`;
	if (doesDirectoryExist(pathidvalue)) 
    {
		readtemplatePath = path.join(__dirname, "..", 'public', 'FNA_templates','output_FNA.html');
		console.log("FNA in plan wise file loaed  " + "\n");
	} 
    else 
    {
		console.log("in else file  not prsent   " + "\n");
	}

	var data = fs.readFileSync(readtemplatePath);
	read_template = data.toString();
	fnaMainId = reqBody.fnaMainId;

	var caseIdPath = `./public/${fnaMainId}`;
	if (doesDirectoryExist(caseIdPath)) 
    {
		console.log(`The directory exists.` + "\n");
		try {
			fs.rmdirSync(caseIdPath, {
				recursive: true
			});
			console.log(`Director deleted successfully.` + caseIdPath + "\n");
		} catch (error) {
			console.error("Error deleting directory" + "\n");
		}
	}
    else
    {
		console.log(`The directory does not exist.` + "\n");
	}
	console.log(" read_template = data.toString();222222")
	await fnKeyValueRecursiveCall(reqBody, reqBody);
	response_data = read_template;

	try
    {
		fs.mkdirSync(`./public/${fnaMainId}`);     
		var pdfDataArray = await generatePDF(response_data, fnaMainId);
		return pdfDataArray;
	} 
    catch (error) 
    {
		console.error('Error during genertate pdf process:' + error.message + "\n");
		return 'InternalServerError';
	}
}

async function generatePDF(response_data, outputPath) 
{
	console.log("sandhya in generate pdf " + outputPath + "\n");
	var currentDate = new Date();
	var createdate = currentDate.toLocaleString();
	const collectionNames = process.env.COLLECTION_NAMES.split(",");
	const collectionName = collectionNames[2]; 
	let pdfDataArray = [];
	let path = `./public/${fnaMainId}/${fnaMainId}.pdf`;
	return new Promise((resolve, reject) => {
		wkhtmltopdf(response_data, {
			output: path,
			pageSize: 'A4'
		}, async (err) => {
			if (err) {
				console.log("sandhya in generate err " + err + "\n");
				reject(err); 
			} else {
				var data = fs.readFileSync(path);
				base64Data = data.toString('base64');
				let documents = {
					name: "FNA Output",
					base64content: base64Data
				};
				pdfDataArray.push(documents);
				console.log("pdf is converted to base64" + "\n");
				//return pdfDataArray
				//db store
				const fnaIdVAlue = await mongoConnection.getDataFromDB({ fnaMainId: fnaMainId }, collectionName);
				if (!fnaIdVAlue) 
				  {
				     console.log(`fnaIdVAlue not found ${fnaIdVAlue}`+ "\n");

				    const newproposal= {
				      fnaMainId: fnaMainId,
				      documentUrl : base64Data,
				      creationDate : createdate,
				      modificationDate : createdate
				    };

				    console.log("Inserted data:"+newproposal+ "\n");

				    const result = await mongoConnection.insertDataIntoDB(
				      newproposal,
				      collectionName
				    );

				     console.log("Inserted new proposal into database:"+ result +"/n");
				  }
				else
				{
				  var modificationDate = currentDate.toLocaleString();
				  console.log("caseId Values found ."+ "\n");
				  const updateQuery = {           
				    fnaMainId : fnaMainId  
				   };
				  const updateOperation = {
				    $set: {
				        documentUrl: base64Data,
				        modificationDate : modificationDate,
				    }
				 };       
				  //  console.log('Updating fetched_on for output:'+ updateQuery);
				  //  console.log('Updating updateOperation for output:'+ updateOperation);
				  //  console.log('Updating collectionName for output:'+ collectionName);

				  const result = await mongoConnection.updateDataIntoDB(updateQuery, updateOperation, collectionName);

				  console.log(`Updated  for updateOperation ID ${fnaMainId}:`+JSON.stringify(result)+ "\n");


				}
			}
			resolve(pdfDataArray);
		});
	});
}

async function fnKeyValueRecursiveCall(data, Request, keyPrefix = "") 
{
	let htmlDomObj = new JSDOM(read_template);
	if (typeof data === 'object') 
    {
		for (const key in data) 
        {
			if (data.hasOwnProperty(key)) 
            {
				const newKey = keyPrefix ? `${keyPrefix}.${key}` : key;
                console.log("keyPrefix=====> " + keyPrefix );
                console.log("key=====> " + key );;
				console.log("newKey=====> " + newKey + "\n");
                
                fnKeyValueRecursiveCall(data[key], Request, newKey);
                
			}
		}
	} 
    else 
    {
		let replacedString = "||" + keyPrefix + "||";
        read_template = read_template.replaceAll(replacedString, data);
		
	}

}

function doesDirectoryExist(directoryPath) {
    try {
        return fs.statSync(directoryPath).isDirectory();
    } catch (error) {
        if (error.code === 'ENOENT') {
            return false;
        } else {
            throw error; 
        }
    }
}
module.exports = {
	fnaOutput
};