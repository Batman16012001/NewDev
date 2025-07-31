import React, { useEffect, useRef, useState } from 'react'
import "./QuotationOutput.css"
import { useNavigate } from 'react-router-dom';
import { findRecordById } from '../../db/indexedDB';
import { createDirectory, writeFile } from '../../native/nativeoperation';
import QuotationTemplate from './QuotationTemplate';
import { QuotationProcessor } from '../../utils/quotationProcessor.js';
import { TemplateManager } from '../../utils/templateManager.js';
import { CSVLoader } from '../../utils/csvLoader.js';
import { PDFGenerator } from '../../utils/pdfGenerator.js';
import { Network } from '@capacitor/network';

//import { saveAs } from 'file-saver';

const QuotationOutput = () => {
    //{ data, sqs_data, rider_data, signature }
    const pageRef = useRef();
    const [sqs_data, setsqs_data] = useState()
    const [rider_data, setrider_data] = useState()
    const [agentdata, setagentdata] = useState();
    const [loading, setLoading] = useState(true);
    const [signatureUrl, setSignatureUrl] = useState();
    const [sqs_id, setSqsId] = useState(null);
    const [paymentMode, setPaymentMode] = useState();
    const [paymentFrequency, setPaymentFrequency] = useState();

    const [pdfBlobUrlstate, setPdfBlobUrlstate] = useState(null);

    const navigate = useNavigate();
    //console.log("Got the data in Pages:", data, sqs_data, rider_data, signature);

    const sqsID = sessionStorage.getItem("sqsID")
    const riderid = sessionStorage.getItem("riderID")
    const applicationType = sessionStorage.getItem("applicationType")
    console.log("got rider id::", riderid)

    // let PayloadForApi = {
    //     "QuoteId":sqsID,
    //     "applicationType" : 
    // }
    //let PayloadForApi = {}

    // if(applicationType == "Single Life"){
    //     PayloadForApi = {
    //         "QuoteId" : sqsID,
    //         "applicationType" : 

    //     }
    // }



    const OutputAPI = async (sqsdata, riderdata, personaldata) => {
        //console.log("Inside OutputAPI function::::", sqsdata , riderdata)
        const sqsrealdata = sqsdata.result;
        const riderrealdata = riderdata.result
        const persondata = personaldata.result
        const childKeys = ["firstChildInsured", "secondChildInsured", "thirdChildInsured", "fourthChildInsured", "fifthChildInsured"];
        console.log("Sqs data ::::", sqsrealdata);
        console.log("Rider data::::", riderrealdata);
        console.log("Person data::::", persondata);

        const person_name = persondata.primaryInsured.person.name.first + "" + persondata.primaryInsured.person.name.last;

        let quotedata = {}

        // quotedata = {
        //     "QuoteId": "SQS123456788",
        //     "applicationType": "03",
        //     "productType": "Life",
        //     "productName": "Advance payment",
        //     "productCode": "3",
        //     "residentialExtra": "No",
        //     "paymentFrequency": "R",
        //     "contributionFund": 1000,
        //     "primaryInsured": {
        //         "coverages": [
        //             {
        //                 "coverageLookup": "basic plan",
        //                 "benefitPeriod": {
        //                     "applicationValue": 5
        //                 },
        //                 "eliminationPeriod": {
        //                     "applicationValue": 0
        //                 },
        //                 "benefitAmount": {
        //                     "applicationValue": 37
        //                 },
        //                 "Premium": {
        //                     "applicationValue": "548"
        //                 }
        //             },
        //             {
        //                 "coverageLookup": "horr",
        //                 "benefitPeriod": {
        //                     "applicationValue": 2
        //                 },
        //                 "eliminationPeriod": {
        //                     "applicationValue": 0
        //                 },
        //                 "benefitAmount": {
        //                     "applicationValue": 38
        //                 },
        //                 "Premium": {
        //                     "applicationValue": "548"
        //                 }
        //             },
        //             {
        //                 "coverageLookup": "ider",
        //                 "benefitPeriod": {
        //                     "applicationValue": 52
        //                 },
        //                 "eliminationPeriod": {
        //                     "applicationValue": 0
        //                 },
        //                 "benefitAmount": {
        //                     "applicationValue": 36
        //                 },
        //                 "Premium": {
        //                     "applicationValue": "5438"
        //                 }
        //             },
        //             {
        //                 "coverageLookup": "fibr",
        //                 "benefitPeriod": {
        //                     "applicationValue": 15
        //                 },
        //                 "eliminationPeriod": {
        //                     "applicationValue": 0
        //                 },
        //                 "benefitAmount": {
        //                     "applicationValue": 34
        //                 },
        //                 "Premium": {
        //                     "applicationValue": "741"
        //                 }
        //             },
        //             {
        //                 "coverageLookup": "adbr",
        //                 "benefitPeriod": {
        //                     "applicationValue": 9
        //                 },
        //                 "eliminationPeriod": {
        //                     "applicationValue": 0
        //                 },
        //                 "benefitAmount": {
        //                     "applicationValue": 30
        //                 },
        //                 "Premium": {
        //                     "applicationValue": "548"
        //                 }
        //             },
        //             {
        //                 "coverageLookup": "fdtr",
        //                 "benefitPeriod": {
        //                     "applicationValue": 4
        //                 },
        //                 "eliminationPeriod": {
        //                     "applicationValue": 0
        //                 },
        //                 "benefitAmount": {
        //                     "applicationValue": 300000
        //                 },
        //                 "Premium": {
        //                     "applicationValue": "511"
        //                 }
        //             },
        //             {
        //                 "coverageLookup": "Total",
        //                 "Premium": {
        //                     "applicationValue": "31233"
        //                 }
        //             }
        //         ],
        //         "person": {
        //             "name": person_name,
        //             "age": persondata.primaryInsured.person.age,
        //             "gender": persondata.primaryInsured.person.gender,
        //             "dob": persondata.primaryInsured.person.dateOfBirth
        //         }
        //     },
        //     "child1": {
        //         "coverages": [
        //             {
        //                 "coverageLookup": "zier",
        //                 "benefitPeriod": {
        //                     "applicationValue": 5
        //                 },
        //                 "eliminationPeriod": {
        //                     "applicationValue": 0
        //                 },
        //                 "benefitAmount": {
        //                     "applicationValue": 300000
        //                 },
        //                 "Premium": {
        //                     "applicationValue": "511"
        //                 }
        //             },
        //             {
        //                 "coverageLookup": "Total",
        //                 "Premium": {
        //                     "applicationValue": "357"
        //                 }
        //             }
        //         ],
        //         "person": {
        //             "name": "child 1 sandhya",
        //             "age": 5,
        //             "gender": "Male",
        //             "dob": "06/03/2019"
        //         }
        //     },
        //     "child2": {
        //         "coverages": [
        //             {
        //                 "coverageLookup": "zier",
        //                 "benefitPeriod": {
        //                     "applicationValue": 5
        //                 },
        //                 "eliminationPeriod": {
        //                     "applicationValue": 0
        //                 },
        //                 "benefitAmount": {
        //                     "applicationValue": 300000
        //                 },
        //                 "Premium": {
        //                     "applicationValue": "511"
        //                 }
        //             },
        //             {
        //                 "coverageLookup": "Total",
        //                 "Premium": {
        //                     "applicationValue": "677"
        //                 }
        //             }
        //         ],
        //         "person": {
        //             "name": "child 2 sandhya",
        //             "age": 3,
        //             "gender": "Male",
        //             "dob": "09/02/2022"
        //         }
        //     },
        //     "child3": {
        //         "coverages": [
        //             {
        //                 "coverageLookup": "zier",
        //                 "benefitPeriod": {
        //                     "applicationValue": 5
        //                 },
        //                 "eliminationPeriod": {
        //                     "applicationValue": 0
        //                 },
        //                 "benefitAmount": {
        //                     "applicationValue": 300000
        //                 },
        //                 "Premium": {
        //                     "applicationValue": "511"
        //                 }
        //             },
        //             {
        //                 "coverageLookup": "Total",
        //                 "Premium": {
        //                     "applicationValue": "567"
        //                 }
        //             }
        //         ],
        //         "person": {
        //             "name": "child 3 sandhya",
        //             "age": 3,
        //             "gender": "Male",
        //             "dob": "09/02/2022"
        //         }
        //     },
        //     "child4": {
        //         "coverages": [
        //             {
        //                 "coverageLookup": "zier",
        //                 "benefitPeriod": {
        //                     "applicationValue": 5
        //                 },
        //                 "eliminationPeriod": {
        //                     "applicationValue": 0
        //                 },
        //                 "benefitAmount": {
        //                     "applicationValue": 300000
        //                 },
        //                 "Premium": {
        //                     "applicationValue": "511"
        //                 }
        //             },
        //             {
        //                 "coverageLookup": "Total",
        //                 "Premium": {
        //                     "applicationValue": "987"
        //                 }
        //             }
        //         ],
        //         "person": {
        //             "name": "child 4 sandhya",
        //             "age": 3,
        //             "gender": "Male",
        //             "dob": "09/02/2022"
        //         }
        //     },
        //     "child5": {
        //         "coverages": [
        //             {
        //                 "coverageLookup": "zier",
        //                 "benefitPeriod": {
        //                     "applicationValue": 5
        //                 },
        //                 "eliminationPeriod": {
        //                     "applicationValue": 0
        //                 },
        //                 "benefitAmount": {
        //                     "applicationValue": 300000
        //                 },
        //                 "Premium": {
        //                     "applicationValue": "511"
        //                 }
        //             },
        //             {
        //                 "coverageLookup": "Total",
        //                 "Premium": {
        //                     "applicationValue": "897"
        //                 }
        //             }
        //         ],
        //         "person": {
        //             "name": "child 5 sandhya",
        //             "age": 3,
        //             "gender": "Male",
        //             "dob": "09/02/2022"
        //         }
        //     },
        //     "TotalPremium": {
        //         "CoverageLookup": "Total",
        //         "Premiums": {
        //             "Monthly": {
        //                 "PaymentFrequency": "Monthly",
        //                 "PreviousPremiumAmount": "21194",
        //                 "PremiumAmount": "21741"
        //             },
        //             "Quarterly": {
        //                 "PaymentFrequency": "Quarterly",
        //                 "PreviousPremiumAmount": "21194",
        //                 "PremiumAmount": "21485"
        //             },
        //             "Half Yearly": {
        //                 "PaymentFrequency": "Half Yearly",
        //                 "PreviousPremiumAmount": "21194",
        //                 "PremiumAmount": "2140"
        //             },
        //             "Annually": {
        //                 "PaymentFrequency": "Annually",
        //                 "PreviousPremiumAmount": "21194",
        //                 "PremiumAmount": "2567"
        //             }
        //         }
        //     },
        //     "illustration": {
        //         "CoverageLookup": "illustration",
        //         "Premiums": [
        //             {
        //                 "year_option": "1",
        //                 "Annual_Premium": "10000",
        //                 "Account_Balance_4": "121194.0",
        //                 "Surrende_Value_4": "121194.0",
        //                 "Account_Balance_8": "121194.0",
        //                 "Surrende_Value_8": "121194.0",
        //                 "Account_Balance_12": "121194.0",
        //                 "Surrende_Value_12": "121194.0"
        //             },
        //             {
        //                 "year_option": "2",
        //                 "Annual_Premium": "250000",
        //                 "Account_Balance_4": "2421194.0",
        //                 "Surrende_Value_4": "2421194.0",
        //                 "Account_Balance_8": "2821194.0",
        //                 "Surrende_Value_8": "2821194.0",
        //                 "Account_Balance_12": "21221194.0",
        //                 "Surrende_Value_12": "21221194.0"
        //             },
        //             {
        //                 "year_option": "3",
        //                 "Annual_Premium": "370000",
        //                 "Account_Balance_4": "321194.0",
        //                 "Surrende_Value_4": "321194.0",
        //                 "Account_Balance_8": "321194.0",
        //                 "Surrende_Value_8": "321194.0",
        //                 "Account_Balance_12": "321194.0",
        //                 "Surrende_Value_12": "321194.0"
        //             },
        //             {
        //                 "year_option": "4",
        //                 "Annual_Premium": "490000",
        //                 "Account_Balance_4": "421194.0",
        //                 "Surrende_Value_4": "421194.0",
        //                 "Account_Balance_8": "421194.0",
        //                 "Surrende_Value_8": "421194.0",
        //                 "Account_Balance_12": "421194.0",
        //                 "Surrende_Value_12": "421194.0"
        //             }
        //         ]
        //     },
        //     "maturityAmount": {
        //         "Maturity": [
        //             {
        //                 "MaturityBenefit": {
        //                     "applicationValue": "guaranteedMaturity"
        //                 },
        //                 "RS": {
        //                     "applicationValue": "511"
        //                 }
        //             },
        //             {
        //                 "MaturityBenefit": {
        //                     "applicationValue": "guaranteedMaturity1"
        //                 },
        //                 "RS": {
        //                     "applicationValue": "511"
        //                 }
        //             },
        //             {
        //                 "MaturityBenefit": {
        //                     "applicationValue": "guaranteedMaturity2"
        //                 },
        //                 "RS": {
        //                     "applicationValue": "511"
        //                 }
        //             },
        //             {
        //                 "MaturityBenefit": {
        //                     "applicationValue": "guaranteedMaturity3"
        //                 },
        //                 "RS": {
        //                     "applicationValue": "511"
        //                 }
        //             },
        //             {
        //                 "MaturityBenefit": {
        //                     "applicationValue": "illustratedMaturity"
        //                 },
        //                 "RS": {
        //                     "applicationValue": "2555"
        //                 }
        //             }
        //         ]
        //     }
        // }


        //Dynamic data need to uncomment
        quotedata = {
            "QuoteId": sqsID,
            "applicationType": "04",
            "productType": sqsrealdata.policyDetails.productType,
            "productName": sqsrealdata.policyDetails.productName,
            "productCode": sqsrealdata.policyDetails.productCode,
            "residentialExtra": "No",
            "paymentFrequency": sqsrealdata.payment.paymentFrequency,
            "contributionFund": 1000,
            "primaryInsured": {
                "coverages": riderrealdata.primaryInsured.coverages.map(coverage => ({
                    coverageLookup:
                        // coverage.benefitAmount?.riderPremium?.[0]?.coverageLookup || "", // Extract the first coverageLookup or use an empty string as default
                        coverage.riderName === "base"
                            ? "basic plan"
                            : coverage.riderName,

                    benefitPeriod: {
                        applicationValue: coverage.benefitPeriod?.applicationValue || 0
                    },
                    eliminationPeriod: {
                        applicationValue: coverage.eliminationPeriod?.applicationValue || 0
                    },
                    benefitAmount: {
                        applicationValue: coverage.benefitAmount?.applicationValue || 0
                    },
                    Premium: {
                        applicationValue: (coverage.Premium?.applicationValue || 0).toString()
                    }
                })),
                "person": {
                    "name": person_name,
                    "age": persondata.primaryInsured.person.age,
                    "gender": persondata.primaryInsured.person.gender,
                    "dob": persondata.primaryInsured.person.dateOfBirth
                }

            },
            "TotalPremium": {
                "CoverageLookup": "Total",
                "Premiums": Object.fromEntries(
                    [
                        { frequency: "Monthly", label: "Monthly" },
                        { frequency: "Quarterly", label: "Quarterly" },
                        { frequency: "SemiAnnually", label: "Half Yearly" },
                        { frequency: "Annually", label: "Annually" }
                    ].map(({ frequency, label }) => {
                        const matchingPremium = riderrealdata.allTotalPremiumData.find(p => p.paymentFrequency === frequency);
                        return [
                            label,
                            {
                                PaymentFrequency: label,
                                PreviousPremiumAmount: (matchingPremium?.PremiumAmount || "0").toString(), // Correct case of "PremiumAmount"
                                PremiumAmount: (matchingPremium?.PremiumAmount || "0").toString()
                            }
                        ];
                    })
                )
            },
            "illustration": {
                "CoverageLookup": "illustration",
                "Premiums": [
                    {
                        "year_option": "1",
                        "Annual_Premium": "10000",
                        "Account_Balance_4": "121194.0",
                        "Surrende_Value_4": "121194.0",
                        "Account_Balance_8": "121194.0",
                        "Surrende_Value_8": "121194.0",
                        "Account_Balance_12": "121194.0",
                        "Surrende_Value_12": "121194.0"
                    },
                    {
                        "year_option": "2",
                        "Annual_Premium": "250000",
                        "Account_Balance_4": "2421194.0",
                        "Surrende_Value_4": "2421194.0",
                        "Account_Balance_8": "2821194.0",
                        "Surrende_Value_8": "2821194.0",
                        "Account_Balance_12": "21221194.0",
                        "Surrende_Value_12": "21221194.0"
                    },
                    {
                        "year_option": "3",
                        "Annual_Premium": "370000",
                        "Account_Balance_4": "321194.0",
                        "Surrende_Value_4": "321194.0",
                        "Account_Balance_8": "321194.0",
                        "Surrende_Value_8": "321194.0",
                        "Account_Balance_12": "321194.0",
                        "Surrende_Value_12": "321194.0"
                    },
                    {
                        "year_option": "4",
                        "Annual_Premium": "490000",
                        "Account_Balance_4": "421194.0",
                        "Surrende_Value_4": "421194.0",
                        "Account_Balance_8": "421194.0",
                        "Surrende_Value_8": "421194.0",
                        "Account_Balance_12": "421194.0",
                        "Surrende_Value_12": "421194.0"
                    }
                ]
            },
            "maturityAmount": {
                "Maturity": [
                    {
                        "MaturityBenefit": {
                            "applicationValue": "guaranteedMaturity"
                        },
                        "RS": {
                            "applicationValue": "511"
                        }
                    },
                    {
                        "MaturityBenefit": {
                            "applicationValue": "guaranteedMaturity1"
                        },
                        "RS": {
                            "applicationValue": "511"
                        }
                    },
                    {
                        "MaturityBenefit": {
                            "applicationValue": "guaranteedMaturity2"
                        },
                        "RS": {
                            "applicationValue": "511"
                        }
                    },
                    {
                        "MaturityBenefit": {
                            "applicationValue": "guaranteedMaturity3"
                        },
                        "RS": {
                            "applicationValue": "511"
                        }
                    },
                    {
                        "MaturityBenefit": {
                            "applicationValue": "illustratedMaturity"
                        },
                        "RS": {
                            "applicationValue": "2555"
                        }
                    }
                ]
            }
        }

        // Assume persondata is your input object.


        if (applicationType === 'Joint Life') {
            quotedata["secondaryInsured"] = {
                "coverages": riderrealdata.spouseInsured
                    .coverages.map(coverage => ({
                        coverageLookup:
                            coverage.benefitAmount?.riderPremium?.[0]?.coverageLookup || "", // Extract the first coverageLookup or use an empty string as default
                        benefitPeriod: {
                            applicationValue: coverage.benefitPeriod?.applicationValue || 0
                        },
                        eliminationPeriod: {
                            applicationValue: coverage.eliminationPeriod?.applicationValue || 0
                        },
                        benefitAmount: {
                            applicationValue: coverage.benefitAmount?.applicationValue || 0
                        },
                        Premium: {
                            applicationValue: coverage.PremiumAmount?.applicationValue || 0
                        }
                    })),
                "person": {
                    "name": persondata.secondaryInsured.person.name.first,
                    "age": persondata.secondaryInsured.age,
                    "gender": persondata.secondaryInsured.gender,
                    "dob": persondata.secondaryInsured.dateOfBirth
                }
            }
        }

        if (persondata.primaryInsured.person.kids === 'yes') {
            const transformedChildren = {};

            childKeys.forEach((childKey, index) => {
                // Fetch data for the current child from the updated structure.
                const childData = riderrealdata.childInsured.coverages[childKey];

                if (childData && persondata.Child[index]) {
                    const childPerson = persondata.Child[index];
                    // Transform the child data to match the required structure.
                    const transformedChild = {
                        coverages: (childData.coverages || []).map(coverage => ({
                            coverageLookup: coverage.riderName || "Unknown",
                            benefitPeriod: {
                                applicationValue: coverage.benefitPeriod?.riderTerm || 0
                            },
                            eliminationPeriod: {
                                applicationValue: 0 // Assuming no elimination period in the provided data.
                            },
                            benefitAmount: {
                                applicationValue: coverage.benefitAmount?.riderValue || 0
                            },
                            Premium: {
                                applicationValue: coverage.benefitAmount?.riderPremium || 0
                            }
                        })),
                        person: {
                            name: childPerson.name.first,
                            age: childPerson.age,
                            gender: childPerson.gender,
                            dob: childPerson.dateOfBirth
                        }
                    };

                    // Assign to the new structure using keys like "child1", "child2", etc.
                    quotedata[`child${index + 1}`] = transformedChild;
                }
            });

            //console.log(transformedChildren);
            // The transformedChildren object now has the desired structure.
        }
        // Use Capacitor Network API for offline detection
        const status = await Network.getStatus();
        if (!status.connected) {
            console.log('Offline mode - Using local processing');
            // OFFLINE: Use local processing classes
            let planName = sqsrealdata.policyDetails.productName.replace(/\s+/g, '-').toLowerCase();

            try {
                // Initialize processing classes
                const quotationProcessor = new QuotationProcessor();

                // Generate quotation using local processing
                const result = await quotationProcessor.process(
                    quotedata,
                    planName,
                    { format: 'pdf' }
                );

                if (result.success) {
                    // Create blob URL from the PDF blob
                    const pdfBlobUrl = URL.createObjectURL(result.data);
                    console.log('Local processing generated PDF URL:', pdfBlobUrl);
                    return pdfBlobUrl;
                } else {
                    console.error('Local processing failed:', result.error);
                    throw new Error(result.error);
                }
            } catch (error) {
                console.error('Local processing error:', error);
                throw error;
            }
        } else {
            // ONLINE: Call backend as before
            try {
                console.log("Payload to quote API :::: ", quotedata)
                console.log("Pranav Shinde :::: ")
                const apicall = await fetch("http://192.168.2.7:4004/outputProcessingService/quotation", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(quotedata)
                });
                const result = await apicall.json();
                console.log('API Response on Beneficiery screen:', result);
                const base64content = result[0].base64content;
                const base64String = base64content.replace(/^data:application\/pdf;base64,/, "");
                const binaryString = atob(base64String);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const pdfBlob = new Blob([bytes], { type: 'application/pdf' });
                const pdfBlobUrl = URL.createObjectURL(pdfBlob);
                return pdfBlobUrl;
            } catch (error) {
                console.log("Error while calling the API::::", error)
            }
        }
        console.log("API data for package quote::", quotedata)
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const sqsID = sessionStorage.getItem("sqsID");
                const riderID = sessionStorage.getItem("riderID");
                const person_id = sessionStorage.getItem("personID")

                if (sqsID) {
                    var sqs_fetch = await findRecordById('al_sqs_details', sqsID);
                    console.log("Fetched sqs details:", sqs_fetch);
                    setsqs_data(sqs_fetch);
                    setLoading(false);

                    // Check if signatureFile exists and is a valid string (Base64 or URL)
                    if (sqs_fetch.result.signatureFile) {
                        const base64Signature = sqs_fetch.result.signatureFile;

                        // Convert Base64 back to Blob
                        fetch(base64Signature)
                            .then(res => res.blob())
                            .then(blob => {
                                const fileUrl = URL.createObjectURL(blob);
                                setSignatureUrl(fileUrl); // Set the signature URL for the img tag
                            })
                            .catch(error => {
                                console.error('Error converting Base64 to Blob:', error);
                            });
                    } else {
                        console.error('No signatureFile found in sqs_fetch.result');
                    }

                    setSqsId(sqs_fetch.result.sqs_id);
                    setPaymentMode(sqs_fetch.result.payment.paymentMode);
                    setPaymentFrequency(sqs_fetch.result.payment.paymentFrequency);
                } else {
                    console.log("No sqs ID present");
                }

                if (riderID) {
                    console.log("riderID:", riderID);

                    var riderFetch = await findRecordById('al_rider_details', riderID);
                    console.log("Fetched rider data:", riderFetch);
                    setrider_data(riderFetch);
                    setLoading(false);
                } else {
                    console.error('No rider ID found in session storage.');
                }

                var person_data = await findRecordById("al_person_details", person_id)
                console.log("Person Data :::", person_data)

                const blobUrl = await OutputAPI(sqs_fetch, riderFetch, person_data);
                console.log("Output API is called::::", blobUrl)
                setPdfBlobUrlstate(blobUrl);

                // Assuming the base64 content is in `result[0].base64content`


            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    // const savehtml = () => {
    //     console.log("Inside savehtml:::");
    //     console.log("pageref.current:::", pageRef.current);

    //     if (pageRef.current) {
    //         // Function to convert image URL to Base64
    //         const toBase64 = (url) => {
    //             return fetch(url)
    //                 .then(res => res.blob())
    //                 .then(blob => new Promise((resolve, reject) => {
    //                     const reader = new FileReader();
    //                     reader.onloadend = () => resolve(reader.result);
    //                     reader.onerror = reject;
    //                     reader.readAsDataURL(blob);
    //                 }));
    //         };

    //         // Check if the user is on an Android device
    //         const isAndroid = /Android/i.test(navigator.userAgent);

    //         // First, we fetch and convert the company logo and signature image to Base64
    //         Promise.all([
    //             toBase64('companylogo.jpg'),  // Convert company logo to Base64
    //             signatureUrl ? toBase64(signatureUrl) : Promise.resolve(null)  // Convert signature if available
    //         ]).then(([companyLogoBase64, signatureBase64]) => {
    //             // Now we have both images as Base64

    //             // Update ALL company logo <img> tags
    //             const logoImgs = pageRef.current.querySelectorAll("img[src='companylogo.jpg']");
    //             logoImgs.forEach(logoImg => {
    //                 logoImg.src = companyLogoBase64;  // Replace with Base64 for each instance
    //             });

    //             // Update the signature <img> tag, if signature is present
    //             const signatureDiv = pageRef.current.querySelector('#sign_mlife_div');
    //             if (signatureDiv && signatureBase64) {
    //                 const imgElement = document.createElement('img');
    //                 imgElement.src = signatureBase64;  // Use Base64 as img src
    //                 imgElement.alt = 'Customer Signature';

    //                 // Clear and append the signature image
    //                 signatureDiv.innerHTML = '';
    //                 signatureDiv.appendChild(imgElement);
    //             }

    //             // Serialize the entire HTML (with Base64 images) to save
    //             const htmlContent = pageRef.current.outerHTML;

    //             if (isAndroid) {
    //                 // For Android devices, use FileReader to convert HTML to Base64 and save
    //                 console.log("Entered in android")
    //                 const reader = new FileReader();
    //                 reader.onloadend = () => {
    //                     const base64data = reader.result;  // The HTML content in Base64
    //                     createDirectory(sqsID)
    //                     const fileName = sqsID + "/" + sqsID + '.html';

    //                     // Save the Base64 HTML content to the file
    //                     writeFile(fileName, base64data);
    //                     console.log("Done", fileName);
    //                 };
    //                 const blob = new Blob([htmlContent], { type: 'text/html' });
    //                 reader.readAsDataURL(blob);
    //             } else {
    //                 // For non-Android devices, save as a regular Blob
    //                 console.log("Entered in web")
    //                 const blob = new Blob([htmlContent], { type: 'text/html' });
    //                 const fileName = sqsID + '.html';

    //                 // Create a link element, trigger the download, and then remove it
    //                 const link = document.createElement('a');
    //                 link.href = URL.createObjectURL(blob);
    //                 link.download = fileName;
    //                 document.body.appendChild(link);
    //                 link.click();
    //                 document.body.removeChild(link);
    //                 URL.revokeObjectURL(link.href);
    //             }
    //         }).catch(error => {
    //             console.error('Error converting images to Base64:', error);
    //         });
    //     }

    // };


    // const gotomysavedquotation = () => {
    //     console.log('Navigating to saved quotations');
    //     navigate('/mysavedquotations')
    // }
    const exithtml = () => {
        try {
            console.log('Navigating to saved quotations');
            //navigate('/benefitselection');
            navigate(-1);
        } catch (error) {
            console.error("Error while navigating:", error);
        }
    };

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
        document.body.classList.add("ios-safeareasubmission");
    } else {
        document.body.classList.remove("ios-safeareasubmission");
    }

    return (
        <>
            <div className="safearea safearea-top"></div>
            <div className='iosmargintop'>
                {/* <button type="button" class="btn btn-primary" onClick={savehtml}>Save</button> */}
                <button type="button" class="btn btn-danger" onClick={exithtml}>Exit</button>
            </div>
            <div>
                <QuotationTemplate pdfBlobUrl={pdfBlobUrlstate} />
            </div>



            <div className="safearea safearea-bottom"></div>
        </>
    )
}

export default QuotationOutput
