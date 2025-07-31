const fs = require("fs");
const path = require("path");
require("dotenv").config();
const csv = require("csv-parser");

const AWS = require("@aws-sdk/client-s3");

const S3Client = AWS.S3Client;
const GetObjectCommand = AWS.GetObjectCommand;

const s3 = new AWS.S3();

const s3Client = new S3Client({ region: process.env.AWS_REGION });

const bucketName = process.env.S3_BUCKET_NAME;

const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });

//read  file from s3 buket 
async function readFileFromS3(filePath) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: filePath,
  });

  try {
    const data = await s3Client.send(command);
    const bodyContents = await streamToBuffer(data.Body);
    
    // Convert buffer to  string
    const Content = bodyContents.toString('utf-8');
   // process.stdout.write(' content:'+ Content+ "\n");
    return Content;

  } catch (err) {
    console.error('Error retrieving file from S3:', err);
  }
}

// this function check directory is present  in aws s3 bucket or not 
// function checkS3Directory(bucketName, directoryPath, callback)
// {
//   const params = {
//     Bucket: bucketName,
//     Prefix: directoryPath.endsWith('/') ? directoryPath : `${directoryPath}/`,
//     MaxKeys: 1
//   };
//   process.stdout.write("params"+JSON.stringify(params)+ "\n");
//   s3.listObjectsV2(params, function(err, data)
//   {
//     if (err)
//     {
//       console.error("Error checking S3 directory:", err);
//       callback(false);
//     }
//     else
//     {
//      // process.stdout.write("datadatadata"+ data+ "\n");
// 	//  process.stdout.write("datadatadata  data.Contents "+ data.Contents == undefined+ "\n");
// 	  //process.stdout.write("datadatadata data.Contents.length"+ data.Contents.length+ "\n");

//     //  if (data.Contents.length > 0)
// 		if (data.Contents != undefined)
// 		{
// 			process.stdout.write(`Directory "${directoryPath}" exists in bucket "${bucketName}".`+ "\n");
// 			callback(true);
// 		}
// 		else
// 		{
// 			process.stdout.write(`Directory "${directoryPath}" does not exist in bucket "${bucketName}".`+ "\n");
// 			callback(false);
// 		}
//     }
//   });
// }


//code to read csv files from csvFile folder
const filePath = path.join(__dirname, process.env.CSV_FILE_PATH);

// Read CSV File
const readCSVFile = (planCode, lifeName,paymentFrequency) => {
  process.stdout.write("plancode: "+planCode+ "\n")
  process.stdout.write("lifeName: "+lifeName+ "\n")
  process.stdout.write("paymentFrequency: "+paymentFrequency+ "\n")
  return new Promise((resolve, reject) => {
    const products = [];
    const headers = [];

    process.stdout.write("Starting to read the CSV file...");

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("headers", (headerList) => {
        headers.push(...headerList);
        //process.stdout.write("Headers read:"+ headers+ "\n");
      })
      .on("data", (row) => {
        if (row['Life'] === lifeName && row['PlanCode'] === planCode && row['Payment_Freqeuncy'] === paymentFrequency && row['Visibility'] !="N")
        {
          const selectedData = {
            planName: row['PlanName_Abbreviation'],
            productName: row['Product_Type'],
            paymentFreqeuncy :row['Payment_Freqeuncy'],
            planCode :row['PlanCode'],
            life: row['Life'],
            abbreviation: row['Abbreviation'],
            riderOutputName: row['Rider_output_Name']
          };
          products.push(selectedData);
        }
      })
      .on("end", () => {
        process.stdout.write("Finished reading CSV file."+products+ "\n");
        resolve({ products });
      })
      .on("error", (error) => {
        console.error("Error reading CSV file:", error.message);
        reject(error);
      });
  });
};

//AWS file path :- and read file from aws
// const filePath = process.env.CSV_FILE_PATH_S3;

// const readCSVFile = async (planCode, lifeName, paymentFrequency) => {
//   const command = new GetObjectCommand({
//     Bucket: bucketName,
//     Key: filePath,
//   });

  // try {
  //   const { Body } = await s3Client.send(command);
  //   process.stdout.write("plancode "+planCode+ "\n")
  //   process.stdout.write("lifeName "+lifeName+ "\n")
  //   process.stdout.write("paymentFrequency "+paymentFrequency+ "\n")
  //   return new Promise((resolve, reject) => {
  //     const products = [];
  //     const headers = [];
  //     Body.pipe(csv())
  //       .on("headers", (headerList) => {
  //         headers.push(...headerList);
  //       })
  //       .on("data", (row) => {
  //         if (row["Life"] === lifeName &&row["PlanCode"] === planCode && row["Payment_Freqeuncy"] === paymentFrequency && row["Visibility"] !== "N" ) 
  //           {
  //             products.push({
  //               planName: row["PlanName_Abbreviation"],
  //               productName: row["Product_Type"],
  //               paymentFreqeuncy: row["Payment_Freqeuncy"],
  //               planCode: row["PlanCode"],
  //               life: row["Life"],
  //               abbreviation: row["Abbreviation"],
  //               riderOutputName: row["Rider_output_Name"],
  //           });
  //         }
  //       })
  //       .on("end", () => {
  //         process.stdout.write("Finished reading CSV file. "+products+ "\n");
  //         resolve({ products });
  //       })
  //       .on("error", (error) => {
  //         console.error("Error reading CSV file:", error.message);
  //         reject(error);
  //       });
  //   });
  // } catch (error) {
  //   console.error("Error reading from S3:", error.message);
  //   throw error;
  // }
// };

module.exports = {
  readFileFromS3,
  // checkS3Directory,
  readCSVFile
};
