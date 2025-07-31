const packageService = require('../services/packageService');
const readFile = require('../services/fileUtil');
require("dotenv").config();
const Ajv = require('ajv');
const fs = require('fs');
var jsdom = require("jsdom");
const express = require('express');
const path = require('path');
const app = express();
const errors = require('../error');
const ajvFormats = require('ajv-formats');
const axios = require('axios');
const apiEndpoint = process.env.PROPOSAL_MANAGEMENT_API_URL;
const AWS = require("@aws-sdk/client-s3");
const s3 = new AWS.S3();
const bucketName = process.env.S3_BUCKET_NAME;
var jsonFileData = "";
var schemaPath = "";
var pathidvalue ="";
const key = process.env.DIRECTORY_PATH;

exports.getPackageData = async (req, res, next) =>
{
  const ajv = new Ajv(
  {
    allErrors: true
  });
  ajvFormats(ajv);
  var caseId = req.body.caseId;
  process.stdout.write(`Sending request to API with caseId: ${caseId}`+ "\n");
  try
  {
    const response = await axios.get(`${apiEndpoint}`,
    {
      params:
      {
        caseid: caseId
      }
    });
	//use PROPOSAL_MANAGEMENT_API_URL  for  validate case id
    if (response.status === 200 && response.data.caseIdStatus === "isValid")
      // if (1==1)
    {
      process.stdout.write("Case ID fetched successfully:"+ caseId + "\n");
      var PlanName = req.body.product.planName;
      var productName = req.body.product.productType;
      process.stdout.write("productnae"+ productName + "\n")
      var tempPlanSchema = {
        "planName": PlanName,
        "productType": productName
      }
      process.stdout.write("tempPlanSchema plan name " + tempPlanSchema.planName + "\n");
      const productNameSchema = {
        type: 'object',
        properties:
        {
          productName:
          {
            type: 'string'
            //enum: ['Pradeepa','CRA',"Life Saver","Life"]
          },
          PlanName:
          {
            type: 'string'
            //enum: ['Advance Payment','CRA Single']
          }
        },
        required: ['productType', 'planName'],
        additionalProperties: true,
      }
      const plan_validate = ajv.compile(productNameSchema);
      const plan_isValid = plan_validate(tempPlanSchema);
      if (!plan_isValid)
      {
        res.status(400).json(plan_validate.errors);
        return;
      }
      
      process.stdout.write("key"+ key+ "\n");
      PlanName = PlanName.replace(/\s+/g, '-').toLowerCase();

      pathidvalue = key + PlanName;  
      process.stdout.write("sandhya pathidvalue "+ pathidvalue+ "\n");

    //   const isDirectory = await new Promise((resolve, reject) =>
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
		// 	resolve(false)
    //       }
    //     });
    //   });
    //   process.stdout.write("isDirectory "+ isDirectory+ "\n")
	 
	  // //this below code for read json  file from aws s3 bucket 
    //   if (isDirectory)
    //   {
    //     schemaPath = key  +PlanName+"/" + "validation_request.json"
    //     process.stdout.write("aws file in plan wise folder loaed "+ schemaPath+ "\n")
    //     jsonFileData = await readFile.readFileFromS3(schemaPath);
    //   }
	  // else if(PlanName.includes("saver"))
	  // {
		// schemaPath = key+"life-saver/validation_request.json"
		// process.stdout.write("aws file in life -saver wise folder loaed "+ schemaPath+ "\n")
    //     jsonFileData = await readFile.readFileFromS3(schemaPath);
	  // }
	  // else
	  // {
		// productName = productName.replace(/\s+/g, '-').toLowerCase();
		// schemaPath = key + productName+"/" + "validation_request.json"
		// process.stdout.write("aws file in proudct wise folder loaed "+ schemaPath+ "\n")
    //     jsonFileData = await readFile.readFileFromS3(schemaPath);       
	  // }
	  //process.stdout.write("json responce file "+ jsonFileData+ "\n")
	  //const schema = JSON.parse(jsonFileData);

	   //uncomment the below code is you want to read from  device   directory
	
	  app.use(express.static(path.join(__dirname, "..", 'public'))); 
	  var pathidvalue = `./public/template/${PlanName}`;
      process.stdout.write("sandhya plan name "+PlanName+"  doesDirectoryExist(pathidvalue) "+doesDirectoryExist(pathidvalue)+ "\n")
      if (doesDirectoryExist(pathidvalue))
      {
       schemaPath = path.join(__dirname, "..", 'public', 'template', PlanName, 'validation_request.json');
       process.stdout.write("sandhya in plan wise folder loaed "+ "\n");
      }
      else if(PlanName.includes("Saver"))
      {
        schemaPath = path.join(__dirname, "..", 'public', 'template', 'Life Saver', 'validation_request.json');
        process.stdout.write("sandhya in Life saver  folder loaed "+ "\n");
      }
      else
      {
      	schemaPath = path.join(__dirname, "..", 'public', 'template', productName, 'validation_request.json');
      	process.stdout.write("sandhya in proudct name wise loaded "+ "\n");
      }
      const schema = require(schemaPath);
      const validate = ajv.compile(schema);
      // const isValid = validate(req.body);



      
      var isValid = ajv.validate(schema, req.body);
      process.stdout.write("isValid value"+ isValid+ "\n");
      var covervalue = req.body.product.proposedInsured.coverages
      var isriderValid = true;
      validateCoverage(covervalue);
      if (!isValid)
      {
        process.stdout.write("isValid value"+ isValid+ "\n");
        process.stdout.write("start Validation Errors: "+ JSON.stringify(ajv.errors)+ "\n");
        // Separate missing required fields from invalid data formats
        const missingFields = ajv.errors.filter(error => error.keyword === 'required').map(error => error.params.missingProperty);
        if (missingFields.length > 0)
        {
          const error = errors.MissingRequiredFields;
          return res.status(error.statusCode).json(
          {
            errorCode: error.errorCode,
            message: `The following required fields are missing: ${missingFields.join(', ')}`,
            details: error.details
          });
        }
        const validationErrors = ajv.errors.map(error =>
        {
          let parameter = error.instancePath.substr(1);
          const pathSegments = error.instancePath.split('/');
          const key = pathSegments[pathSegments.length - 1];
          if (error.keyword === 'enum')
          {
            displayMessage = `${key}: Value must be one of the allowed values: ${error.params.allowedValues.join(', ')}`;
          }
          else if (error.keyword === 'minLength')
          {
            displayMessage = `${key}: must not be empty.`;
          }
          else if (error.keyword === 'maxLength')
          {
            displayMessage = `${key}: Value must not have more than ${error.params.limit}.`;
          }
          else if (error.keyword === "pattern")
          {
            displayMessage = `${key}:  not in proper Format.`;
          }
          else if (error.keyword === "type")
          {
            displayMessage = `${key}: must be ${error.params.type} .`;
          }
          return {
            parameter: parameter,
            message: displayMessage
          };
        });
        const invalidFields = validationErrors.map(err => err.parameter);
        process.stdout.write("Validation Errors with parameters: "+ JSON.stringify(validationErrors)+ "\n");
        const error = errors.InvalidDataFormat;
        return res.status(error.statusCode).json(
        {
          errorCode: error.errorCode,
          message: `One or more validation errors occurred : ${invalidFields.join(', ')}.`,
          details: validationErrors.map(err => err.message)
        });
      }
      else
      {
        if (!isriderValid)
        {
          process.stdout.write("rider error "+ "\n");
        }
        else
        {
          packageService.packageProvision(req.body).then((responseJSON) =>
          {
            //process.stdout.write("responseJSON Object: "+responseJSON+ "\n");
            res.status(200).json(responseJSON);
          }).catch((error) =>
          {
            process.stdout.write("Error"+ error+ "\n");
          });
        }
      }
    }
    else
    {
      if (error.response && error.response.status === 404)
      {
        process.stdout.write("response returned is 404_1"+ "\n");
        const caseIdError = errors.CaseIdNotFound;
        return res.status(caseIdError.statusCode).json(
        {
          errorCode: caseIdError.errorCode,
          message: caseIdError.message.replace('{caseId}', caseId),
          details: caseIdError.details
        });
      }
    }
  }
  catch (error)
  {
    if (error.response && error.response.status === 404)
    {
      process.stdout.write("response returned is 404_3"+ "\n");
      const caseIdError = errors.CaseIdNotFound;
      return res.status(caseIdError.statusCode).json(
      {
        errorCode: caseIdError.errorCode,
        message: caseIdError.message.replace('{caseId}', caseId),
        details: caseIdError.details
      });
    }
    if (error.message.includes("DatabaseError"))
    {
      console.error("Failed to get Pages due to a database error.", error.message);
      const databaseError = errors.DatabaseError;
      return res.status(databaseError.statusCode).json(
      {
        errorCode: databaseError.errorCode,
        message: databaseError.message,
        details: databaseError.details
      });
      //return 'DatabaseError';
    }
    console.error("Failed to get Pages due to an internal server error.", error.message);
    const internalServerError = errors.InternalServerError;
    return res.status(internalServerError.statusCode).json(
    {
      errorCode: internalServerError.errorCode,
      message: internalServerError.message,
      details: internalServerError.details
    });
  }

  // this function use for apply  validatition on rider(ine rider should be basic plan)
  function validateCoverage(coverages)
	{
		//process.stdout.write("coverages "+coverages)
		const hasBasicPlan = coverages.some(coverage => coverage.coverageLookup === "basic plan");
		if (!hasBasicPlan)
		{
			isriderValid = false;
			const ridervaluemis = errors.MissingRiderFields;
			return res.status(ridervaluemis.statusCode).json(
			{
			errorCode: ridervaluemis.errorCode,
			message: ridervaluemis.message,
			details: ridervaluemis.details
			});
		}
		process.stdout.write("Validation passed!" + "\n");
	}

}


// this function check particular directory is present in device or not 
function doesDirectoryExist(directoryPath)
{
  try
  {
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

exports.healthCheck = async (req, res, next) => {
  process.stdout.write("request hitting healthcheck" + "\n");    
  res.status(200).json({ status: 'ok' });
  }
