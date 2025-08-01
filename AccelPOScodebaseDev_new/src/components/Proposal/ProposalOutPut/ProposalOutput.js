import React, { useEffect, useState } from 'react'
import { findRecordById, updateDetailById } from '../../../db/indexedDB'
import Template from './Template'

const ProposalOutput = () => {

    const [apipayload, setapipayload] = useState()
    const [pdfUrl, setPdfUrl] = useState()
    const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
    const caseID = sessionStorage.getItem("CaseId")
    const [navigating_from_docupload , setnavigatingfromdocupload] = useState("")
    console.log("CaseId:::", caseID)
    const docIdgenerated = sessionStorage.getItem("docId")
    const erefid = sessionStorage.getItem("erefid")
    const applicationType = sessionStorage.getItem("applicationType")
    const navigation_check = sessionStorage.getItem("navigatingfromdocupload")




    useEffect(() => {
        console.log("Entered in Proposal Output")
        const fetchData = async () => {
            setnavigatingfromdocupload(navigation_check)
            console.log("Navigation Check:", navigation_check); 
            let data = {}
            data = {
                "docpreviewed": true
            }

            if(navigation_check === "navigatefromdocupload"){
                const update_flag = updateDetailById("al_document_details", docIdgenerated, data)
                console.log("PreviewDoc flag updated in proposal output::", update_flag)
            }
           
            let payload = {}
            try {
                const data = await findRecordById("al_application_main", erefid);
                console.log("Data in Proposal Output:::", data)
                //setapidata(data)


                // if (applicationType === "Single Life") {
                let primaryBeneficiaries = data.result.product.primaryInsured.beneficiary.map((beneficiary) => ({
                    "name": beneficiary.name.first + ' ' + beneficiary.name.last,
                    "relationship": beneficiary.relationship,
                    "dob": beneficiary.dob,
                    "adharCardNumber": beneficiary.adharCardNumber,
                    "deathBenifit": parseInt(beneficiary.benefits.deathBenefit) || 0,
                    "familyDigasiri": parseInt(beneficiary.benefits.FamilyDigasiriBenefit) || 0,
                    "familyIncome": parseInt(beneficiary.benefits.familyIncomeBenefit) || 0
                }));

                const coveragesArraymlife = data.result.product.primaryInsured.coverages.map((coverage, index) => {
                    // Create base structure for coverage item

                    let coverageItem = {
                        coverageLookup: index === 0 ? "basic plan" : (coverage.riderName || coverage.riderName), // Replace "default name" with a suitable fallback if needed
                        //coverage.riderName <<- uncomment this when rider data added,  // Assumes "riderName" holds the coverage lookup name
                        benefitAmount: {
                            "applicationValue": coverage.benefitAmount.riderPremium || 0,
                        },
                        benefitPeriod: {
                            "applicationValue": coverage.benefitPeriod.riderTerm || 0,
                        },
                    };

                    // Check for additional fields for "otherDetails"
                    if (coverage.otherDetails) {
                        coverageItem.otherDetails = {
                            "deductibleAmount": coverage.otherDetails.deductibleAmount || 0,
                            "coverType": coverage.otherDetails.coverType || "Individual",
                            "livesInsured": coverage.otherDetails.livesInsured || "Select",
                            "numberOfLives": coverage.otherDetails.numberOfLives || 0,
                        };
                    }

                    // Handle additional fields as needed
                    if (coverage.applicationType && coverage.productType) {
                        coverageItem = {
                            ...coverageItem,
                            "applicationType": "04",
                            "productType": "Life",//coverage.productType,
                            "productName": coverage.productName,
                            "productCode": coverage.productCode,
                            "residentialExtra": coverage.residentialExtra,
                            "paymentFrequency": coverage.paymentFrequency,
                        };
                    }

                    return coverageItem;
                });

                payload = {
                    "caseId": caseID,
                    "product": {
                        "planName": data.result.product.policyDetails.productName,
                        "applicationType": "03",
                        "productType": "Life",//data.result.product.policyDetails.productType,
                        "productCode": "003",
                        "proposedInsured": {
                            "person": {
                                "preferredLanguage": "English",
                                "dob": data.result.product.primaryInsured.person.dob,
                                "age": data.result.product.primaryInsured.person.age,
                                "insurancePolicy": "ePolicy",
                                "educationalQualification": data.result.product.primaryInsured.person.educationQualification,
                                "maritalStatus": data.result.product.primaryInsured.person.maritalStatus,
                                "nationality": data.result.product.primaryInsured.person.nationality,
                                "relationship": "Spouse",
                                "emailAddress": data.result.product.primaryInsured.person.emailAddress,
                                "height": {
                                    "centimeter": data.result.product.primaryInsured.person.height.inches
                                },
                                "weightInkg": data.result.product.primaryInsured.person.weight,
                                "name": {
                                    "title": data.result.product.primaryInsured.person.name.title,
                                    "nameInitials": data.result.product.primaryInsured.person.name.nameWithInitials,
                                    "firstName": data.result.product.primaryInsured.person.name.first,
                                    "lastName": data.result.product.primaryInsured.person.name.last
                                },
                                "adharCardNumber": data.result.product.primaryInsured.person.verificationDetails.adharCardNumber ,
                            },
                            "address": {
                                "country": data.result.product.primaryInsured.address[0].country,
                                "corrLine1": data.result.product.primaryInsured.address[0].line1,
                                "corrLine2": data.result.product.primaryInsured.address[0].line2,
                                "corrLine3": data.result.product.primaryInsured.address[0].line3,
                                "postalCode": data.result.product.primaryInsured.address[0].postalCode,
                                "postalPin": data.result.product.primaryInsured.address[0].postalPin,
                                "district": data.result.product.primaryInsured.address[0].district,
                                "permnentCity": data.result.product.primaryInsured.address[1].permanentCity,
                                "permnentDistrict": data.result.product.primaryInsured.address[1].permanentDistrict
                            },
                            "phone": {
                                "mobileNumber": parseInt(data.result.product.primaryInsured.person.mobile)
                            },
                            "corr": {
                                "homeNumber": 4343434343
                            },
                            "employment": {
                                "occupation": data.result.product.primaryInsured.person.occupationSummary.occupationCode,
                                "otherSourceOfIncome": data.result.product.primaryInsured.person.occupationSummary.otherSourceOfIncome,
                                "annualIncome": data.result.product.primaryInsured.person.occupationSummary.otherSourceOfIncome,
                                "natureOfBusiness": data.result.product.primaryInsured.person.occupationSummary.natureOfBusiness,
                                "employerName": "TEMP",
                                "periodOfEmployment": data.result.product.primaryInsured.person.occupationSummary.periodOfEmployment.years,
                                "businessRegNo": 1
                            },
                            "familyDetails": {
                                "health": {
                                    "Father": {
                                        "details": {
                                            "disease": "No"
                                        }
                                    },
                                    "Mother": {
                                        "details": {
                                            "disease": "No"
                                        }
                                    }
                                },
                                "familyInformation": {
                                    "Father": {
                                        "details": {
                                            "age": 45,
                                            "stateofhealth": "Alive"
                                        }
                                    },
                                    "Mother": {
                                        "details": {
                                            "age": 45,
                                            "stateofhealth": "Alive"
                                        }
                                    }
                                },

                            },
                            "previousPolicy": {
                                "details": [
                                    {
                                        "nameofinsurance": "No",
                                        "policyno": "No",
                                        "policyvalue": "No",
                                        "premium": "No"
                                    }
                                ],
                                "declined": {
                                    "details": [
                                        {
                                            "answer": "no",
                                            "reason": "no"
                                        }
                                    ]
                                }
                            },
                            "beneficiaries": {
                                "details": primaryBeneficiaries
                            },
                            "coverages": coveragesArraymlife,
                            "individualInterview": {
                                "answeredQuestions": [
                                    {
                                        "id": "2707",
                                        "category": "HEALTH",
                                        "answer": "Yes",
                                        "position": 3,
                                        "text": "Are you at present suffering from any of the following disorders/diseases or have you suffered from the following disorders/diseases during the last 10 years?",
                                        "disclosures": [
                                            {
                                                "id": "1901",
                                                "category": "HEALTH",
                                                "text": "Diabetes",
                                                "answer": "Yes",
                                                "type": "Text",
                                                "reflexiveQuestions": [
                                                    {
                                                        "answer": "Less than a year",
                                                        "position": 1,
                                                        "text": "What is the duration of diagnosis of Diabetes ?"
                                                    },
                                                    {
                                                        "answer": "No",
                                                        "position": 2,
                                                        "text": "Are you having control diet ?"
                                                    },
                                                    {
                                                        "answer": "NVNV",
                                                        "position": 3,
                                                        "text": "What is the name & address of your Doctor?"
                                                    },
                                                    {
                                                        "answer": "Oral medication",
                                                        "position": 5,
                                                        "text": "What type of medication does your Doctor prescribed?"
                                                    },
                                                    {
                                                        "answer": "Regularly",
                                                        "position": 4,
                                                        "text": "How frequent do you check your Blood sugar level?"
                                                    }
                                                ]
                                            },
                                            {
                                                "id": "1902",
                                                "category": "HEALTH",
                                                "text": "High Blood Pressure (Hypertension)",
                                                "answer": "Yes",
                                                "type": "Text",
                                                "reflexiveQuestions": [
                                                    {
                                                        "answer": "HFFH",
                                                        "position": 2,
                                                        "text": "What is the duration as high blood pressure?"
                                                    },
                                                    {
                                                        "answer": "NVNV",
                                                        "position": 1,
                                                        "text": "What is the name & address of your Doctor?"
                                                    },
                                                    {
                                                        "answer": "Yes",
                                                        "position": 3,
                                                        "text": "Do you monitor your blood pressure regularly?"
                                                    },
                                                    {
                                                        "answer": "Yes",
                                                        "position": 4,
                                                        "text": "Have you ever had an ECG, Lipid test, Echo cardiogram or any other investigation?"
                                                    },
                                                    {
                                                        "answer": "Yes",
                                                        "position": 5,
                                                        "text": "Have you ever noted any abnormality in those reports?"
                                                    }
                                                ]
                                            },
                                            {
                                                "id": "1903",
                                                "category": "HEALTH",
                                                "text": "Elevated Cholesterol",
                                                "answer": "Yes",
                                                "type": "Text",
                                                "reflexiveQuestions": [
                                                    {
                                                        "answer": "HFFH",
                                                        "position": 1,
                                                        "text": "When did you first diagnose high cholesterol level?"
                                                    },
                                                    {
                                                        "answer": "NVNV",
                                                        "position": 2,
                                                        "text": "What is the name & address of your Doctor?"
                                                    },
                                                    {
                                                        "answer": "Yes",
                                                        "position": 3,
                                                        "text": "Do you monitor your Cholesterol levels regularly?"
                                                    },
                                                    {
                                                        "answer": "Yes",
                                                        "position": 4,
                                                        "text": "Have you ever had an ECG, Lipid test, Echo cardiogram or any other investigation?"
                                                    },
                                                    {
                                                        "answer": "Yes",
                                                        "position": 5,
                                                        "text": "Have you ever noted any abnormality in those reports?"
                                                    }
                                                ]
                                            },
                                            {
                                                "id": "1904",
                                                "category": "HEALTH",
                                                "text": "Any disease of the Cardio Vascular System e.g. Heart disease, Shortness of breath, Chest pain, Hole in the heart (ASD, VSD), Rheumatic fever etc.",
                                                "answer": "Yes",
                                                "type": "Text",
                                                "reflexiveQuestions": [
                                                    {
                                                        "answer": "Heart disease",
                                                        "position": 1,
                                                        "text": "Please select the diagnosis as advised to you by your doctor."
                                                    },
                                                    {
                                                        "answer": "NVNV",
                                                        "position": 2,
                                                        "text": "When did you diagnose the disease?"
                                                    },
                                                    {
                                                        "answer": "Echo Cardiogram",
                                                        "position": 3,
                                                        "text": "What is the name & address of your Doctor?"
                                                    },
                                                    {
                                                        "answer": "Yes",
                                                        "position": 4,
                                                        "text": "Have you had any for the following investigations for the heart disease?"
                                                    },
                                                    {
                                                        "answer": "Yes",
                                                        "position": 5,
                                                        "text": "Are you awaiting any further investigations or treatment?"
                                                    },
                                                    {
                                                        "answer": "CBBC",
                                                        "position": 6,
                                                        "text": "Please advice what and when this is expected."
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        "id": "2001",
                                        "category": "HEALTH",
                                        "answer": "No",
                                        "position": 2,
                                        "text": " Does any Proposed Insured belong to or have they entered into a written agreement to become a member of the military or National Guard?",
                                        "disclosures": [
                                            {
                                                "id": "1001",
                                                "category": "HEALTH",
                                                "text": "Diabetes",
                                                "answer": "No",
                                                "type": "Text",
                                                "reflexiveQuestions": [
                                                    {
                                                        "answer": "Less than a year",
                                                        "position": 1,
                                                        "text": "What is the duration of diagnosis of Diabetes ?"
                                                    },
                                                    {
                                                        "answer": "Yes",
                                                        "position": 1,
                                                        "text": "oes any Proposed Insured belong ?"
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        "id": "2101",
                                        "category": "HEALTH",
                                        "answer": "Yes",
                                        "position": 4,
                                        "text": "Had any accident, injury or hospitalised for observation or surgery?"
                                    },
                                    {
                                        "id": "2201",
                                        "category": "HEALTH",
                                        "answer": "Yes",
                                        "position": 1,
                                        "text": "Undergone any medical investigation or surgery?"
                                    },
                                    {
                                        "id": "2301",
                                        "category": "GENERAL",
                                        "answer": "Yes",
                                        "position": 5,
                                        "text": "Have you had any intention of engaging in military services?",
                                        "disclosures": [
                                            {
                                                "id": "1301",
                                                "category": "GENERAL",
                                                "text": "Diabetes",
                                                "answer": "Yes",
                                                "type": "Text",
                                                "reflexiveQuestions": [
                                                    {
                                                        "answer": "Yes",
                                                        "position": 1,
                                                        "text": "What is the duration of diagnosis of Diabetes ?"
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        "id": "2401",
                                        "category": "GENERAL",
                                        "answer": "Yes",
                                        "position": 7,
                                        "text": "Do you engage in any sport/activity or have you had any intention of engaging in any sport/activity such as Motor Racing, Diving, Mountaineering etc"
                                    },
                                    {
                                        "id": "2501",
                                        "category": "GENERAL",
                                        "answer": "Yes",
                                        "position": 6,
                                        "text": "Have you been convicted of any criminal offence or illegal activity?"
                                    },
                                    {
                                        "id": "3401",
                                        "category": "GENERAL",
                                        "answer": "Yes",
                                        "position": 16,
                                        "text": "Are you a Politically Exposed Person (PEP*) or related to a PEP?"
                                    },
                                    {
                                        "id": "101",
                                        "category": "COVID",
                                        "answer": "Yes",
                                        "position": 16,
                                        "text": "Have you, or your family ever been serving a notice of quarantine in any form imposed by local health authorities or government or airport authority for possible exposure to novel coronavirus (SARS-CoV2/COVID-19)?"
                                    },
                                    {
                                        "id": "3501",
                                        "category": "GENERAL",
                                        "answer": "Yes",
                                        "position": 15,
                                        "text": "Was there any criminal case against you in a Court of Law or is there any case pending or under investigation against you?"
                                    }
                                ]
                            }


                        }
                    },
                    "payment": {
                        "paymentFrequency": "Monthly",
                        "paymentMode": "credit",
                        "accountNo": 621632786,
                        "bankName": "HDFC",
                        "branchName": "BAnner",
                        "relative": {
                            "name": {
                                "firstName": "ghdgfhjs"
                            },
                            "address": {
                                "phone": {
                                    "contactNo": 9898978766
                                }
                            }
                        }
                    },
                }

                if (data.result.product.secondaryInsured) {

                    let secondaryBeneficiaries = data.result.product.secondaryInsured.beneficiary.map((beneficiary) => ({
                        "name": beneficiary.name.first + ' ' + beneficiary.name.last,
                        "relationship": beneficiary.relationship,
                        "dob": beneficiary.dob,
                        "adharCardNumber": beneficiary.adharCardNumber,
                        "deathBenifit": parseInt(beneficiary.benefits.deathBenefit) || 0,
                        "familyDigasiri": parseInt(beneficiary.benefits.FamilyDigasiriBenefit) || 0,
                        "familyIncome": parseInt(beneficiary.benefits.familyIncomeBenefit) || 0
                    }));

                    const coveragesArrayslife = data.result.product.secondaryInsured.coverages.map((coverage) => {
                        // Create base structure for coverage item
                        let coverageItem = {
                            coverageLookup: "basic plan", //coverage.riderName<--uncomment this when rider data added,  
                            benefitAmount: {
                                "applicationValue": coverage.benefitAmount.riderPremium || 0,
                            },
                            benefitPeriod: {
                                "applicationValue": coverage.benefitPeriod.riderTerm || 0,
                            },
                        };

                        // Check for additional fields for "otherDetails"
                        if (coverage.otherDetails) {
                            coverageItem.otherDetails = {
                                "deductibleAmount": coverage.otherDetails.deductibleAmount || 0,
                                "coverType": coverage.otherDetails.coverType || "Individual",
                                "livesInsured": coverage.otherDetails.livesInsured || "Select",
                                "numberOfLives": coverage.otherDetails.numberOfLives || 0,
                            };
                        }

                        // Handle additional fields as needed
                        if (coverage.applicationType && coverage.productType) {
                            coverageItem = {
                                ...coverageItem,
                                "applicationType": "03",
                                "productType": "Life",//coverage.productType,
                                "productName": coverage.productName,
                                "productCode": coverage.productCode,
                                "residentialExtra": coverage.residentialExtra,
                                "paymentFrequency": coverage.paymentFrequency,
                            };
                        }

                        return coverageItem;
                    });

                    payload["product"]["spouseInsured"] = {
                        "person": {
                            "preferredLanguage": "English",
                            "dob": data.result.product.secondaryInsured.person.dob,
                            "age": data.result.product.secondaryInsured.person.anb,
                            "insurancePolicy": "ePolicy",
                            "educationalQualification": data.result.product.secondaryInsured.person.educationQualification,
                            "maritalStatus": data.result.product.secondaryInsured.person.maritalStatus,
                            "nationality": data.result.product.secondaryInsured.person.nationality,
                            "relationship": "Spouse",
                            "emailAddress": data.result.product.secondaryInsured.person.emailAddress,
                            "height": {
                                "centimeter": data.result.product.secondaryInsured.person.height.inches
                            },
                            "weightInkg": data.result.product.secondaryInsured.person.weight,
                            "name": {
                                "title": data.result.product.secondaryInsured.person.name.title,
                                "nameInitials": data.result.product.secondaryInsured.person.name.nameWithInitials,
                                "firstName": data.result.product.secondaryInsured.person.name.first,
                                "lastName": data.result.product.secondaryInsured.person.name.last
                            },
                            "adharCardNumber": data.result.product.secondaryInsured.person.verificationDetails.adharCardNumber
                        },
                        "address": {
                            "country": data.result.product.secondaryInsured.address[0].country,
                            "corrLine1": data.result.product.secondaryInsured.address[0].line1,
                            "corrLine2": data.result.product.secondaryInsured.address[0].line2,
                            "corrLine3": data.result.product.secondaryInsured.address[0].line3,
                            "postalCode": data.result.product.secondaryInsured.address[0].postalCode,
                            "postalPin": data.result.product.secondaryInsured.address[0].postalPin,
                            "district": data.result.product.secondaryInsured.address[0].district,
                            "permnentCity": data.result.product.secondaryInsured.address[1].permanentCity,
                            "permnentDistrict": data.result.product.secondaryInsured.address[1].permanentDistrict
                        },
                        "phone": {
                            "mobileNumber": parseInt(data.result.product.secondaryInsured.person.mobile)
                        },
                        "corr": {
                            "homeNumber": 4343434343
                        },
                        "employment": {
                            "occupation": data.result.product.secondaryInsured.person.occupationSummary.occupationCode,
                            "otherSourceOfIncome": data.result.product.secondaryInsured.person.occupationSummary.otherSourceOfIncome,
                            "annualIncome": data.result.product.secondaryInsured.person.occupationSummary.otherSourceOfIncome,
                            "natureOfBusiness": data.result.product.secondaryInsured.person.occupationSummary.natureOfBusiness,
                            "employerName": "TEMP",
                            "periodOfEmployment": data.result.product.secondaryInsured.person.occupationSummary.periodOfEmployment.years,
                            "businessRegNo": 1
                        },
                        "familyDetails": {
                            "health": {
                                "Father": {
                                    "details": {
                                        "disease": "No"
                                    }
                                },
                                "Mother": {
                                    "details": {
                                        "disease": "No"
                                    }
                                }
                            },
                            "familyInformation": {
                                "Father": {
                                    "details": {
                                        "age": 45,
                                        "stateofhealth": "Alive"
                                    }
                                },
                                "Mother": {
                                    "details": {
                                        "age": 45,
                                        "stateofhealth": "Alive"
                                    }
                                }
                            },

                        },
                        "previousPolicy": {
                            "details": [
                                {
                                    "nameofinsurance": "No",
                                    "policyno": "No",
                                    "policyvalue": "No",
                                    "premium": "No"
                                }
                            ],
                            "declined": {
                                "details": [
                                    {
                                        "answer": "no",
                                        "reason": "no"
                                    }
                                ]
                            }
                        },
                        "beneficiaries": {
                            "details": secondaryBeneficiaries
                        },
                        "coverages": coveragesArrayslife,
                        "individualInterview": {
                            "answeredQuestions": [
                                {
                                    "id": "2707",
                                    "category": "HEALTH",
                                    "answer": "Yes",
                                    "position": 3,
                                    "text": "Are you at present suffering from any of the following disorders/diseases or have you suffered from the following disorders/diseases during the last 10 years?",
                                    "disclosures": [
                                        {
                                            "id": "1901",
                                            "category": "HEALTH",
                                            "text": "Diabetes",
                                            "answer": "Yes",
                                            "type": "Text",
                                            "reflexiveQuestions": [
                                                {
                                                    "answer": "Less than a year",
                                                    "position": 1,
                                                    "text": "What is the duration of diagnosis of Diabetes ?"
                                                },
                                                {
                                                    "answer": "No",
                                                    "position": 2,
                                                    "text": "Are you having control diet ?"
                                                },
                                                {
                                                    "answer": "NVNV",
                                                    "position": 3,
                                                    "text": "What is the name & address of your Doctor?"
                                                },
                                                {
                                                    "answer": "Oral medication",
                                                    "position": 5,
                                                    "text": "What type of medication does your Doctor prescribed?"
                                                },
                                                {
                                                    "answer": "Regularly",
                                                    "position": 4,
                                                    "text": "How frequent do you check your Blood sugar level?"
                                                }
                                            ]
                                        },
                                        {
                                            "id": "1902",
                                            "category": "HEALTH",
                                            "text": "High Blood Pressure (Hypertension)",
                                            "answer": "Yes",
                                            "type": "Text",
                                            "reflexiveQuestions": [
                                                {
                                                    "answer": "HFFH",
                                                    "position": 2,
                                                    "text": "What is the duration as high blood pressure?"
                                                },
                                                {
                                                    "answer": "NVNV",
                                                    "position": 1,
                                                    "text": "What is the name & address of your Doctor?"
                                                },
                                                {
                                                    "answer": "Yes",
                                                    "position": 3,
                                                    "text": "Do you monitor your blood pressure regularly?"
                                                },
                                                {
                                                    "answer": "Yes",
                                                    "position": 4,
                                                    "text": "Have you ever had an ECG, Lipid test, Echo cardiogram or any other investigation?"
                                                },
                                                {
                                                    "answer": "Yes",
                                                    "position": 5,
                                                    "text": "Have you ever noted any abnormality in those reports?"
                                                }
                                            ]
                                        },
                                        {
                                            "id": "1903",
                                            "category": "HEALTH",
                                            "text": "Elevated Cholesterol",
                                            "answer": "Yes",
                                            "type": "Text",
                                            "reflexiveQuestions": [
                                                {
                                                    "answer": "HFFH",
                                                    "position": 1,
                                                    "text": "When did you first diagnose high cholesterol level?"
                                                },
                                                {
                                                    "answer": "NVNV",
                                                    "position": 2,
                                                    "text": "What is the name & address of your Doctor?"
                                                },
                                                {
                                                    "answer": "Yes",
                                                    "position": 3,
                                                    "text": "Do you monitor your Cholesterol levels regularly?"
                                                },
                                                {
                                                    "answer": "Yes",
                                                    "position": 4,
                                                    "text": "Have you ever had an ECG, Lipid test, Echo cardiogram or any other investigation?"
                                                },
                                                {
                                                    "answer": "Yes",
                                                    "position": 5,
                                                    "text": "Have you ever noted any abnormality in those reports?"
                                                }
                                            ]
                                        },
                                        {
                                            "id": "1904",
                                            "category": "HEALTH",
                                            "text": "Any disease of the Cardio Vascular System e.g. Heart disease, Shortness of breath, Chest pain, Hole in the heart (ASD, VSD), Rheumatic fever etc.",
                                            "answer": "Yes",
                                            "type": "Text",
                                            "reflexiveQuestions": [
                                                {
                                                    "answer": "Heart disease",
                                                    "position": 1,
                                                    "text": "Please select the diagnosis as advised to you by your doctor."
                                                },
                                                {
                                                    "answer": "NVNV",
                                                    "position": 2,
                                                    "text": "When did you diagnose the disease?"
                                                },
                                                {
                                                    "answer": "Echo Cardiogram",
                                                    "position": 3,
                                                    "text": "What is the name & address of your Doctor?"
                                                },
                                                {
                                                    "answer": "Yes",
                                                    "position": 4,
                                                    "text": "Have you had any for the following investigations for the heart disease?"
                                                },
                                                {
                                                    "answer": "Yes",
                                                    "position": 5,
                                                    "text": "Are you awaiting any further investigations or treatment?"
                                                },
                                                {
                                                    "answer": "CBBC",
                                                    "position": 6,
                                                    "text": "Please advice what and when this is expected."
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "id": "2001",
                                    "category": "HEALTH",
                                    "answer": "No",
                                    "position": 2,
                                    "text": " Does any Proposed Insured belong to or have they entered into a written agreement to become a member of the military or National Guard?",
                                    "disclosures": [
                                        {
                                            "id": "1001",
                                            "category": "HEALTH",
                                            "text": "Diabetes",
                                            "answer": "No",
                                            "type": "Text",
                                            "reflexiveQuestions": [
                                                {
                                                    "answer": "Less than a year",
                                                    "position": 1,
                                                    "text": "What is the duration of diagnosis of Diabetes ?"
                                                },
                                                {
                                                    "answer": "Yes",
                                                    "position": 1,
                                                    "text": "oes any Proposed Insured belong ?"
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "id": "2101",
                                    "category": "HEALTH",
                                    "answer": "Yes",
                                    "position": 4,
                                    "text": "Had any accident, injury or hospitalised for observation or surgery?"
                                },
                                {
                                    "id": "2201",
                                    "category": "HEALTH",
                                    "answer": "Yes",
                                    "position": 1,
                                    "text": "Undergone any medical investigation or surgery?"
                                },
                                {
                                    "id": "2301",
                                    "category": "GENERAL",
                                    "answer": "Yes",
                                    "position": 5,
                                    "text": "Have you had any intention of engaging in military services?",
                                    "disclosures": [
                                        {
                                            "id": "1301",
                                            "category": "GENERAL",
                                            "text": "Diabetes",
                                            "answer": "Yes",
                                            "type": "Text",
                                            "reflexiveQuestions": [
                                                {
                                                    "answer": "Yes",
                                                    "position": 1,
                                                    "text": "What is the duration of diagnosis of Diabetes ?"
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "id": "2401",
                                    "category": "GENERAL",
                                    "answer": "Yes",
                                    "position": 7,
                                    "text": "Do you engage in any sport/activity or have you had any intention of engaging in any sport/activity such as Motor Racing, Diving, Mountaineering etc"
                                },
                                {
                                    "id": "2501",
                                    "category": "GENERAL",
                                    "answer": "Yes",
                                    "position": 6,
                                    "text": "Have you been convicted of any criminal offence or illegal activity?"
                                },
                                {
                                    "id": "3401",
                                    "category": "GENERAL",
                                    "answer": "Yes",
                                    "position": 16,
                                    "text": "Are you a Politically Exposed Person (PEP*) or related to a PEP?"
                                },
                                {
                                    "id": "101",
                                    "category": "COVID",
                                    "answer": "Yes",
                                    "position": 16,
                                    "text": "Have you, or your family ever been serving a notice of quarantine in any form imposed by local health authorities or government or airport authority for possible exposure to novel coronavirus (SARS-CoV2/COVID-19)?"
                                },
                                {
                                    "id": "3501",
                                    "category": "GENERAL",
                                    "answer": "Yes",
                                    "position": 15,
                                    "text": "Was there any criminal case against you in a Court of Law or is there any case pending or under investigation against you?"
                                }
                            ]
                        },
                    }
                }

                console.log("Payload:::", JSON.stringify(payload))
                setapipayload(payload)
            } catch (e) {
                console.log("Error while fetching data:::", e)
            }
            try {
                // const apiCall = await fetch('http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com/output-processing-service/proposal', {
                const apiCall = await fetch('http://192.168.2.7:4004/outputProcessingService/proposal', {

                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const result = await apiCall.json();
                console.log('Package API Response:', result);

                // Assuming the base64 content is in `result[0].base64content`
                const base64content = result[0].base64content;

                // Remove base64 prefix if present
                const base64String = base64content.replace(/^data:application\/pdf;base64,/, "");

                // Decode base64 to binary data
                const binaryString = atob(base64String);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                // Create a Blob from the binary data
                const pdfBlob = new Blob([bytes], { type: 'application/pdf' });

                // Create a URL for the Blob and set it to state
                const pdfBlobUrl = URL.createObjectURL(pdfBlob);
                setPdfBlobUrl(pdfBlobUrl);  // Set URL after it is defined

            } catch (e) {
                console.log("Error while calling API:::", e);
            }


        }
        fetchData()
    }, [])

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
          document.body.classList.add("ios-safeareasubmission");
        } else {
          document.body.classList.remove("ios-safeareasubmission");
        }

    return (
        <>
        <div className="safearea safearea-top"></div>

        <div>
            <Template pdfBlobUrl={pdfBlobUrl} />
        </div>
            <div className="safearea safearea-top"></div>
            </>

    )
}

export default ProposalOutput
