import React from 'react';
import './Eapp_addressDetails.css'
import { useFormik } from 'formik';
import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { findRecordById, saveDetail, updateDetailById } from '../../db/indexedDB.js';
import SidebarLayout from '../../components/Dashboard/Template';

// Accordion component
const AccordionItem = ({ title, children, isOpen, onClick, disabled }) => {
    return (
        <div className="accordion-item mt-2">
            <button
                className={`accordion-title ${disabled ? 'disabled' : 'enabled'}`}
                onClick={!disabled ? onClick : null}
                disabled={disabled}
            >
                {title}
                <FontAwesomeIcon
                    icon={isOpen ? faAngleUp : faAngleDown}
                    className="accordion-icon"
                />
            </button>
            {isOpen && <div className="accordion-content">{children}</div>}
        </div>
    );
};

// Schema for Life A fields validation
// Separate schema for lifeA
const lifeASchema = Yup.object({
    emailId: Yup.string().email('Invalid email address').required('Email is required'),
    countrycallingcode: Yup.string().required('Country Calling Code is required'),
    mobilenumber: Yup.string()
        .matches(/^\d{10}$/, 'Mobile number must be 10 digits')
        .required('Mobile number is required'),
    HomeNumber: Yup.string()
        .matches(/^\d{10}$/, 'Home number must be 10 digits')
        .required('Home number is required'),
    Faxno: Yup.string()
        .matches(/^\d{11}$/, 'Fax number must be 11 digits')
        .required('Fax number is required'),
    Line1: Yup.string().required('Line 1 is required'),
    Line2: Yup.string().required('Line 2 is required'),
    Line3: Yup.string().required('Line 3 is required'),
    postalcode: Yup.string().matches(/^\d+$/, 'Postal code must be digits').required('Postal code is required'),
});

// Separate schema for lifeB
const lifeBSchema = Yup.object({
    Line1: Yup.string().required('Line 1 is required'),
    Line2: Yup.string().required('Line 2 is required'),
    Line3: Yup.string().required('Line 3 is required'),
    postalcity: Yup.string().required('Postal city is required'),
    postalcode: Yup.string().matches(/^\d+$/, 'Postal code must be digits').required('Postal code is required'),
    district: Yup.string().required('District is required'),
    city: Yup.string().required('City is required'),
});



// Main Component
const Eapp_addressDetails = () => {

    const [onchangeradiodisable, setonchangeradiodisable] = useState(false)
    const [permanentDisabled, setPermanentDisabled] = useState(false);

   

    const handleCorrespondenceChange = (e) => {
        const value = e.target.value;
        formik.setFieldValue('lifeB.correspondenceAddress', value);
        setonchangeradiodisable(value === 'Yes'); // Disable fields if 'Yes' is selected

        if (value === 'No') {
            formik.setFieldValue('lifeB.Line1', '');
            formik.setFieldValue('lifeB.Line2', '');
            formik.setFieldValue('lifeB.Line3', '');
            formik.setFieldValue('lifeB.Country', '');
            formik.setFieldValue('lifeB.postalcity', '');
            formik.setFieldValue('lifeB.postalcode', '');
            formik.setFieldValue('lifeB.district', '');
            formik.setFieldValue('lifeB.city', '');
        }
    };

    const handlePermanentChange = (e) => {
        const value = e.target.value;
        formik.setFieldValue('lifeB.permanentAddress', value);
        setPermanentDisabled(value === 'Yes'); // Disable fields if 'Yes' is selected

        if (value === "No") {
            formik.setFieldValue('lifeB.permdistrict', '');
            formik.setFieldValue('lifeB.permcity', '');
        }
    };
    const navigatetobeneficierydetails = useNavigate();
    // const { addressidcontext, setaddressidcontext } = useContext(AuthContext)
    // console.log("Got addressid through context::::", addressidcontext)

    // const { setCaseId } = useContext(AuthContext)
    const applicationType = sessionStorage.getItem('applicationType')
    const [clientdata, setClientData] = useState()
    //const [fieldsDisabled, setFieldsDisabled] = useState(false);
    // const { applicationType } = useContext(ApplicationContext)
    // console.log("Got application type through context in address screen:::", applicationType)
    const agentId = sessionStorage.getItem('agentId');
    console.log("AgentID on shweta pc:::", agentId);
    // const { agentId } = useContext(AuthContext);
    // console.log("Got Agent Id through context:::", agentId)

    // const { seterefid } = useContext(AuthContext);
    //console.log("Got erefid through context::::",erefid)
    const sqsidcontext = sessionStorage.getItem("sqsID");
    //const { sqsidcontext } = useContext(AuthContext);
    console.log("Got sqsid through context::::", sqsidcontext)

    const rideridcontext = sessionStorage.getItem("riderID")

    //const { rideridcontext } = useContext(AuthContext);
    console.log("Got riderid through context::::", rideridcontext)
    const personID = sessionStorage.getItem("personID");
    //const { personID } = useContext(PersonContext);
    console.log("Got personID through context::::", personID)
    const [ErefId, seterefid] = useState()
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const viewportHeight = window.visualViewport.height;
            const screenHeight = window.screen.height;

            // If viewport height is significantly less than screen height, keyboard is likely open
            setIsKeyboardVisible(viewportHeight < screenHeight * 0.85);
        };

        window.visualViewport.addEventListener("resize", handleResize);
        return () => {
            window.visualViewport.removeEventListener("resize", handleResize);
        };
    }, []);


    // useEffect(() => {
    //     console.log("Page is getting loaded")
    //     //setaddressidcontext(addressID)
    // }, [])



    const validationSchema = Yup.object().shape({
        lifeA: Yup.object().shape({
            emailId: Yup.string().email('Invalid email address').required('Email is required'),
            countrycallingcode: Yup.string().required('Country Calling Code is required'),
            mobilenumber: Yup.string()
                .matches(/^\d{10}$/, 'Mobile number must be 10 digits')
                .required('Mobile number is required'),
            HomeNumber: Yup.string()
                .matches(/^\d{10}$/, 'Home number must be 10 digits')
                .required('Home number is required'),
            Line1: Yup.string().required('Line 1 is required'),
            Line2: Yup.string().required('Line 2 is required'),
            Line3: Yup.string().required('Line 3 is required'),
            postalcode: Yup.string().matches(/^\d+$/, 'Postal code must be digits').required('Postal code is required'),
            Country: Yup.string().required("Country is required"),
            district: Yup.string().required('District is required'),
            city: Yup.string().required('City is required'),
            postalcity: Yup.string().required("PostalCity is required"),
            permdistrict: Yup.string().required("Permanent District is requied"),
            permcity: Yup.string().required("Permanent City is required")


        }),
        // Apply lifeB schema only if the application type isn't "Single Life"
        lifeB: applicationType !== 'Single Life' ? Yup.object().shape({
            emailId: Yup.string().email('Invalid email address').required('Email is required'),
            countrycallingcode: Yup.string().required('Country Calling Code is required'),
            mobilenumber: Yup.string()
                .matches(/^\d{10}$/, 'Mobile number must be 10 digits')
                .required('Mobile number is required'),
            HomeNumber: Yup.string()
                .matches(/^\d{10}$/, 'Home number must be 10 digits')
                .required('Home number is required'),
            Line1: Yup.string().required('Line 1 is required'),
            Line2: Yup.string().required('Line 2 is required'),
            Line3: Yup.string().required('Line 3 is required'),
            postalcity: Yup.string().required('Postal city is required'),
            postalcode: Yup.string().matches(/^\d+$/, 'Postal code must be digits').required('Postal code is required'),
            district: Yup.string().required('District is required'),
            city: Yup.string().required('City is required'),
            permdistrict: Yup.string().required("Permanent District is requied"),
            permcity: Yup.string().required("Permanent City is required")
        }) : Yup.object().shape({}) // No validation for lifeB when it's "Single Life"
    });

    const formik = useFormik({
        initialValues: {
            lifeA: {
                emailId: '',
                countrycallingcode: '',
                mobilenumber: '',
                HomeNumber: '',
                Line1: '',
                Line2: '',
                Line3: '',
                Country: '',
                postalcity: '',
                postalcode: '',
                district: '',
                city: '',
                permdistrict: '',
                permcity: ''

            },
            lifeB: {
                Line1: '',
                Line2: '',
                Line3: '',
                postalcity: '',
                postalcode: '',
                district: '',
                city: '',
                permdistrict: '', // Add this field
                permcity: '',     // Add this field
                correspondenceAddress: '', // New field
                permanentAddress: ''       // New field
            }
        },

        validationSchema,
        //validateOnSubmit: true,
        onSubmit: async values => {
            console.log('Form data', values);
            // correspondenceAddress: values.lifeB.correspondenceAddress,
            // permanentAddress: values.lifeB.permanentAddress
            //setFieldsDisabled(true)

            const commmingfromproposalsummary = sessionStorage.getItem("eReferenceIdthroughproposalsummary");
            console.log("commmingfromproposalsummary on :::", commmingfromproposalsummary);

            if (!commmingfromproposalsummary) {
                sessionStorage.setItem('fieldsDisabled', 'true');
                let addressID = `AD${Date.now()}`;
                sessionStorage.setItem('addressID', addressID);
                console.log("addressID", addressID);


                let addressData = {};
                const storeName = "al_address_detail";

                if (applicationType === 'Single Life') {
                    addressData = {
                        mlife: {
                            address_id: addressID,
                            Country: values.lifeA.Country || "",
                            Faxno: values.lifeA.Faxno || "",
                            HomeNumber: values.lifeA.HomeNumber || "",
                            Line1: values.lifeA.Line1 || "",
                            Line2: values.lifeA.Line2 || "",
                            Line3: values.lifeA.Line3 || "",
                            city: values.lifeA.city || "",
                            countrycallingcode: values.lifeA.countrycallingcode || "",
                            district: values.lifeA.district || "",
                            emailId: values.lifeA.emailId || "",
                            mobilenumber: values.lifeA.mobilenumber || "",
                            PermanentCity: values.lifeA.permcity || "",
                            PermanentDistrict: values.lifeA.permdistrict || "",
                            Postalcity: values.lifeA.postalcity || "",
                            PostalCode: values.lifeA.postalcode || ""
                        },
                        address_id: addressID
                    }
                } else if (applicationType === 'Joint Life' || applicationType === 'lifeofanother') {
                    const slifeaddressID = `AD${Date.now() + 1}`;
                    addressData = {
                        mlife: {
                            address_id: addressID,
                            Country: values.lifeA.Country || "",
                            Faxno: values.lifeA.Faxno || "",
                            HomeNumber: values.lifeA.HomeNumber || "",
                            Line1: values.lifeA.Line1 || "",
                            Line2: values.lifeA.Line2 || "",
                            Line3: values.lifeA.Line3 || "",
                            city: values.lifeA.city || "",
                            countrycallingcode: values.lifeA.countrycallingcode || "",
                            district: values.lifeA.district || "",
                            emailId: values.lifeA.emailId || "",
                            mobilenumber: values.lifeA.mobilenumber || "",
                            PermanentCity: values.lifeA.permcity || "",
                            PermanentDistrict: values.lifeA.permdistrict || "",
                            Postalcity: values.lifeA.postalcity || "",
                            PostalCode: values.lifeA.postalcode || ""
                        },
                        slife: {
                            address_id: slifeaddressID,
                            Country: values.lifeB.Country || "",
                            Faxno: values.lifeB.Faxno || "",
                            HomeNumber: values.lifeB.HomeNumber || "",
                            Line1: values.lifeB.Line1 || "",
                            Line2: values.lifeB.Line2 || "",
                            Line3: values.lifeB.Line3 || "",
                            city: values.lifeB.city || "",
                            countrycallingcode: values.lifeB.countrycallingcode || "",
                            district: values.lifeB.district || "",
                            emailId: values.lifeB.emailId || "",
                            mobilenumber: values.lifeB.mobilenumber || "",
                            PermanentCity: values.lifeB.permcity || "",
                            PermanentDistrict: values.lifeB.permdistrict || "",
                            Postalcity: values.lifeB.postalcity || "",
                            PostalCode: values.lifeB.postalcode || "",
                            CorrespondenceAddressSameAsLifeA: values.lifeB.correspondenceAddress || "",
                            PermanentAddressSameAsLifeA: values.lifeB.permanentAddress || ""


                        },
                        address_id: addressID
                    }
                }

                try {
                    // Save address details
                    await saveDetail(storeName, addressData);
                    console.log(`Data saved under addressID: ${addressID}`, addressData);

                    // Now fetch data needed for API payload
                    const agentdata = await findRecordById("al_agent_details", agentId);
                    console.log("Agent data for API:::", agentdata)


                    const sqsdata = await findRecordById("al_sqs_details", sqsidcontext);
                    console.log("SQS data for API ::: ", sqsdata)

                    const commmingfromproposalsummary = sessionStorage.getItem("eReferenceIdthroughproposalsummary");
                    console.log("commmingfromproposalsummary on :::", commmingfromproposalsummary);


        
                    const e_reference_id = `ER${Date.now() + 1}`
                    sessionStorage.setItem("erefid", e_reference_id);
                    seterefid(e_reference_id)

                    const addressidforapi = sessionStorage.getItem('addressID');
                    const addressdata = await findRecordById("al_address_detail", addressidforapi);
                    console.log("Address data for API:::", addressdata)

                    const riderdataforapi = await findRecordById("al_rider_details", rideridcontext);
                    console.log("Rider data for API:::", riderdataforapi)

                    const personaldataforapi = await findRecordById("al_person_details", personID);
                    console.log("Personal data for API:::", personaldataforapi)

                    const coveragesArraymlife = riderdataforapi.result.primaryInsured.coverages.map((coverage) => {
                        return {
                            "benefitAmount": {
                                "riderValue": Number(coverage.benefitAmount.riderValue),  // Adjust these field names based on the structure of riderdataforapi
                                "riderPremium": 8989 //need to umcomment this because it is giving array coverage.benefitAmount.map(e => Number(e.premiumAmount))
                            },
                            "riderName": coverage.riderName,//remove the double quotes when original value comes for now it is true or false
                            "benefitPeriod": {
                                "riderTerm": Number(coverage.benefitPeriod.riderTerm), //need to uncomment when changed to number coverage.benefitPeriod.Number(riderTerm),
                                "riderExpiryAge": coverage.benefitPeriod.riderExpiryAge,
                                "ageToRetire": coverage.benefitPeriod.ageToRetire
                            }
                        };
                    });

                    const secondaryCoveragesArray = riderdataforapi.result.spouseInsured ? riderdataforapi.result.spouseInsured.coverages.map((coverage) => {
                        return {
                            "benefitAmount": {
                                "riderValue": Number(coverage.benefitAmount.riderValue),
                                "riderPremium": 8989//Number(coverage.benefitAmount.riderPremium)
                            },
                            "riderName": coverage.riderName,
                            "benefitPeriod": {
                                "riderTerm": Number(coverage.benefitPeriod.riderTerm),
                                "riderExpiryAge": coverage.benefitPeriod.riderExpiryAge,
                                "ageToRetire": coverage.benefitPeriod.ageToRetire
                            }
                        };
                    }) : [];

                    console.log("AgentID on shweta pc before payload:::", agentId);
                    const payload = {
                        "primaryInsuranceAgent": {
                            "identifier": agentdata.result.id,
                            "agentName": agentdata.result.name,
                            "email": agentdata.result.emailId,
                            "branchCode": "DW1"

                        },
                        "product": {
                            "policyDetails": {
                                "productName": sqsdata.result.policyDetails.productName,
                                "productType": sqsdata.result.policyDetails.productType,
                                "productCode": sqsdata.result.policyDetails.productCode,
                                "premium": 1234,
                                "proposalStatus": "Draft",
                                "sumAssured": 85858,//sqsdata.result.policyDetails.sumAssured,
                                "accountBalance": "",
                                "applicationType": "03",
                            },
                            "primaryInsured": {
                                "address": [
                                    {
                                        "addressType": "corr",
                                        "HomeNumber" : addressdata.result.mlife.HomeNumber,
                                        "FaxNo" : addressdata.result.mlife.Faxno,
                                        "line1": addressdata.result.mlife.Line1,
                                        "line2": addressdata.result.mlife.Line2,
                                        "line3": addressdata.result.mlife.Line3,
                                        "city": addressdata.result.mlife.city,
                                        "district": addressdata.result.mlife.district,
                                        "state": "MH",
                                        "postalCode": String(addressdata.result.mlife.PostalCode),
                                        "postalPin": 80506,
                                        "country": "IND",
                                        "countryCallingCode": addressdata.result.mlife.countrycallingcode

                                    },
                                    {
                                        "addressType": "Perm",
                                        "line1": addressdata.result.mlife.Line1,
                                        "line2": addressdata.result.mlife.Line2,
                                        "line3": addressdata.result.mlife.Line3,
                                        "city": addressdata.result.mlife.city,
                                        "district": addressdata.result.mlife.district,
                                        "state": "MH",
                                        "postalCode": String(addressdata.result.mlife.PostalCode),
                                        "postalPin": 80506,
                                        "country": "IND",
                                        "countryCallingCode": addressdata.result.mlife.countrycallingcode,
                                        "permanentCity": addressdata.result.mlife.PermanentCity,
                                        "permanentDistrict": addressdata.result.mlife.PermanentDistrict

                                    }
                                ],
                                "coverages": coveragesArraymlife,
                                "person": {
                                    "personId": personID,
                                    "clientId": "CL892023122052371",
                                    "nationality": "SL",
                                    "dob": personaldataforapi.result.primaryInsured.person.dateOfBirth,
                                    "email": "abc@gmail.com",
                                    "mobile": "8569362514",
                                    "gender": personaldataforapi.result.primaryInsured.person.gender,
                                    "alcohol": personaldataforapi.result.primaryInsured.person.alcohol,
                                    "tobacco": personaldataforapi.result.primaryInsured.person.tobacco,
                                    "height": {
                                        "feet": personaldataforapi.result.primaryInsured.person.height,
                                        "inches": 11
                                    },
                                    "weight": 75,
                                    "age": personaldataforapi.result.primaryInsured.person.age,
                                    "Kids": personaldataforapi.result.primaryInsured.person.kids,
                                    "maritalStatus": personaldataforapi.result.primaryInsured.person.maritalStatus,
                                    "educationQualification": personaldataforapi.result.primaryInsured.person.EducationalQualification,
                                    "name": {
                                        "first": personaldataforapi.result.primaryInsured.person.name.first,
                                        "middle": "",
                                        "last": personaldataforapi.result.primaryInsured.person.name.last,
                                        "title": personaldataforapi.result.primaryInsured.person.name.title,
                                        "nameWithInitials": "R.D."
                                    },
                                    "verificationDetails": {
                                        "NICNumber": "474744744",
                                        "birthCertificateNumber": "",
                                        "adharCardNumber": personaldataforapi.result.primaryInsured.person.Aadhaar,
                                        "marriageCertificate": personaldataforapi.result.primaryInsured.person.Pan,
                                        "passportNumber" : "986523659856"
                                    },
                                    "occupationSummary": {
                                        "occupationCode": "OCC",
                                        "annualIncome": Number(personaldataforapi.result.primaryInsured.person.annualIncome),
                                        "natureOfBusiness": personaldataforapi.result.primaryInsured.person.occupationClass,
                                        "occupation": personaldataforapi.result.primaryInsured.person.occupation,
                                        "otherSourceOfIncome": personaldataforapi.result.primaryInsured.person.OtherSourceOfIncome,
                                        "periodOfEmployment": {
                                            "years": 3,
                                            "months": 5
                                        }
                                    }

                                }
                            }
                        },
                        // "proposalStatus": "Draft",
                        "e_referenceId": e_reference_id,
                        "sqsId": sqsidcontext
                    };
                    if (addressdata.result.slife) {
                        payload["product"]["secondaryInsured"] = {
                            "address": [
                                {
                                    "addressType": "corr",
                                    "HomeNumber" : addressdata.result.slife.HomeNumber,
                                    "FaxNo" : addressdata.result.slife.Faxno,
                                    "CorrespondenceAddressSameAsLifeA" : addressdata.result.slife.CorrespondenceAddressSameAsLifeA,
                                    "line1": addressdata.result.slife.Line1,
                                    "line2": addressdata.result.slife.Line2,
                                    "line3": addressdata.result.slife.Line3,
                                    "city": addressdata.result.slife.city,
                                    "district": addressdata.result.slife.district,
                                    "state": "MH", // Adjust the state as per your requirement
                                    "postalCode": String(addressdata.result.slife.PostalCode),
                                    "postalPin": 80506, // Adjust the postal pin if needed
                                    "country": "IND", // Modify based on your requirements
                                    "countryCallingCode": addressdata.result.slife.countrycallingcode
                                },
                                {
                                    "addressType": "Perm",
                                    "PermanentAddressSameAsLifeA" : addressdata.result.slife.PermanentAddressSameAsLifeA,
                                    "line1": addressdata.result.slife.Line1,
                                    "line2": addressdata.result.slife.Line2,
                                    "line3": addressdata.result.slife.Line3,
                                    "city": addressdata.result.slife.city,
                                    "district": addressdata.result.slife.district,
                                    "state": "MH",
                                    "postalCode": String(addressdata.result.slife.PostalCode),
                                    "postalPin": 80506,
                                    "country": "IND",
                                    "countryCallingCode": addressdata.result.slife.countrycallingcode,
                                    "permanentCity": addressdata.result.slife.PermanentCity,
                                    "permanentDistrict": addressdata.result.slife.PermanentDistrict

                                }
                            ],
                            "coverages": secondaryCoveragesArray,      //need to add when slife data is added 
                            "person": {
                                "personID": personID,
                                "clientID": "CL892023122052371",
                                "nationality": "SL",
                                "dob": personaldataforapi.result.secondaryInsured.person.dateOfBirth,
                                "emailAddress": "abc@gmail.com",
                                "mobileNumber": "8569362514",
                                "gender": personaldataforapi.result.secondaryInsured.person.gender,
                                "alcohol": personaldataforapi.result.secondaryInsured.person.alcohol,
                                "tobacco": personaldataforapi.result.secondaryInsured.person.tobacco,
                                "height": {
                                    "feet": personaldataforapi.result.secondaryInsured.person.height,
                                    "inches": 11
                                },
                                "weight": 75,
                                "anb": personaldataforapi.result.secondaryInsured.person.age,
                                "maritalStatus": personaldataforapi.result.secondaryInsured.person.maritalStatus,
                                "educationQualification": personaldataforapi.result.secondaryInsured.person.EducationalQualification,
                                "name": {
                                    "first": personaldataforapi.result.secondaryInsured.person.name.first,
                                    "middle": "",
                                    "last": personaldataforapi.result.secondaryInsured.person.name.last,
                                    "title": personaldataforapi.result.secondaryInsured.person.name.title,
                                    "nameWithInitials": "R.D."
                                },
                                "verificationDetails": {
                                    "NICNumber": "474744744",
                                    "birthCertificateNumber": "",
                                    "passportNumber": personaldataforapi.result.secondaryInsured.person.Aadhaar,
                                    "marriageCertificate": personaldataforapi.result.secondaryInsured.person.Pan
                                },
                                "occupationSummary": {
                                    "occupationCode": "OCC",
                                    "annualIncome": Number(personaldataforapi.result.secondaryInsured.person.annualIncome),
                                    "natureOfBusiness": personaldataforapi.result.secondaryInsured.person.occupationClass,
                                    "occupation": personaldataforapi.result.secondaryInsured.person.occupation,
                                    "otherSourceOfIncome": personaldataforapi.result.secondaryInsured.person.OtherSourceOfIncome,
                                    "periodOfEmployment": {
                                        "years": 3,
                                        "months": 5
                                    }
                                }

                            }
                        };


                    }

                    console.log("Payload for API:::", payload);


                    try {
                        // Save the payload under the key 'E-referenceId'
                        await saveDetail("al_application_main", payload)
                        console.log("Data saved in al_application_main under" + e_reference_id + "and data" + payload);
                    } catch (error) {
                        console.error("Error saving data:", error);
                    }



                    try {
                        console.log("AgentID on shweta pc:::", agentId);
                        const apicall = await fetch(
                            // "http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com/proposal-management-service/generateCaseID", {
                                `http://192.168.2.7:4008/proposalManagementService/generateCaseID`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(payload)
                        });
                        const result = await apicall.json();
                        console.log('API Response:', result);

                        const caseid = result.caseId;
                        //setCaseId(caseid)

                        if (caseid) {
                            sessionStorage.setItem("CaseId", caseid);
                            //Need to uncomment afterwards
                            const updatedPayload = { ...payload, caseid };


                            await updateDetailById("al_application_main", e_reference_id, { caseid });
                            console.log(
                                "Updated al_application_main with caseID under " +
                                e_reference_id +
                                " and data: " +
                                JSON.stringify(updatedPayload)
                            );
                        } else {
                            console.error("No caseID found in the API response.");
                        }


                    } catch (error) {
                        console.log("Error while calling the API::::", error)
                    }


                } catch (error) {
                    console.error(`Error during form submission:`, error);
                }
            }



            navigatetobeneficierydetails('/benefiecierydetails');




        },
    });

    const navigate = useNavigate();
    const handleBack = () => {
        navigate('/eapp_personaldetails');
    };

    const [openItem, setOpenItem] = useState(() => {
        if (applicationType === 'Joint Life') {
            return ['lifeA', 'lifeB']; // Both accordions open for Joint Life
        } else if (applicationType === 'Single Life') {
            return ['lifeA']; // Only Life A open for Single Life
        }
        return []; // Default case if ApplicationType is null or undefined
    });




    // const handleAccordionClick = (item) => {
    //     setOpenItem((prevOpenItems) => {
    //         const updatedItems = [...prevOpenItems];
    //         if (updatedItems.includes(item)) {
    //             return updatedItems.filter((openItem) => openItem !== item);
    //         } else {
    //             return [...updatedItems, item];
    //         }
    //     });
    // };


    const handleAccordionClick = (item) => {
        setOpenItem((prevOpenItems) => {
            const updatedItems = [...prevOpenItems];
            if (updatedItems.includes(item)) {
                return updatedItems.filter((openItem) => openItem !== item); // Close accordion
            } else {
                return [...updatedItems, item]; // Open accordion
            }
        });
    };

    const handleCombinedSubmit = async () => {
        await formik.handleSubmit();
    };
    // Mapping for Correspondence Address
    useEffect(() => {
        if (formik.values.lifeB.correspondenceAddress === 'Yes') {
            formik.setFieldValue('lifeB.Line1', formik.values.lifeA.Line1);
            formik.setFieldValue('lifeB.Line2', formik.values.lifeA.Line2);
            formik.setFieldValue('lifeB.Line3', formik.values.lifeA.Line3);
            formik.setFieldValue('lifeB.Country', formik.values.lifeA.Country);
            formik.setFieldValue('lifeB.postalcity', formik.values.lifeA.postalcity);
            formik.setFieldValue('lifeB.postalcode', formik.values.lifeA.postalcode);
            formik.setFieldValue('lifeB.district', formik.values.lifeA.district);
            formik.setFieldValue('lifeB.city', formik.values.lifeA.city);
        }
        // } else if (formik.values.lifeB.correspondenceAddress === 'No') {
        //     formik.setFieldValue('lifeB.Line1', '');
        //     formik.setFieldValue('lifeB.Line2', '');
        //     formik.setFieldValue('lifeB.Line3', '');
        //     formik.setFieldValue('lifeB.Country', '');
        //     formik.setFieldValue('lifeB.postalcity', '');
        //     formik.setFieldValue('lifeB.postalcode', '');
        //     formik.setFieldValue('lifeB.district', '');
        //     formik.setFieldValue('lifeB.city', '');
        // }
    }, [formik.values.lifeB.correspondenceAddress]);

    // Separate UseEffect for Permanent Address Mapping
    useEffect(() => {
        if (formik.values.lifeB.permanentAddress === 'Yes') {
            formik.setFieldValue('lifeB.permdistrict', formik.values.lifeA.permdistrict);
            formik.setFieldValue('lifeB.permcity', formik.values.lifeA.permcity);
        }
        //  else if (formik.values.lifeB.permanentAddress === 'No') {
        //     formik.setFieldValue('lifeB.permdistrict', '');
        //     formik.setFieldValue('lifeB.permcity', '');
        // }
    }, [formik.values.lifeB.permanentAddress]);


    useEffect(() => {
        const fetchData = async () => {
            const commmingfromproposalsummary = sessionStorage.getItem("erefid");
            console.log("commmingfromproposalsummary on :::", commmingfromproposalsummary);
            // setcommingformproposal(commmingfromproposalsummary)
            
            const addressid = sessionStorage.getItem("addressID");
            const agentEmail = sessionStorage.getItem("ClientEmailId")
            const agentMobile = sessionStorage.getItem('ClientMobileNo')
            const agentcity = sessionStorage.getItem("ClientCity")
            const agentPostalCode = sessionStorage.getItem("Clientpincode")
            const isDisabled = sessionStorage.getItem('fieldsDisabled') === 'true';
            setFieldsDisabled(isDisabled);
            formik.setFieldValue('lifeA.emailId', agentEmail);
            formik.setFieldValue('lifeA.mobilenumber', agentMobile)
            formik.setFieldValue('lifeA.postalcity', agentcity)
            formik.setFieldValue('lifeA.postalcode', agentPostalCode)
            // const clientId = sessionStorage.getItem('clientId');
            console.log("Addressid on getting:::", addressid)

            if (commmingfromproposalsummary) {
                try {
                    const applicationdata = await findRecordById("al_application_main", commmingfromproposalsummary);
                    console.log("Application data when coming from ProposalSummary:::", applicationdata);

                    // const primaryInsured = applicationdata.result.product.primaryInsured;
                    // const correspondenceAddress = primaryInsured.address.find(a => a.addressType === "corr");
                    // const permanentAddress = primaryInsured.address.find(a => a.addressType === "Perm");


                    // Set values for `lifeA`
                    formik.setFieldValue('lifeA.countrycallingcode', applicationdata.result.product.primaryInsured.address[0].countryCallingCode);
                    //formik.setFieldValue('lifeA.mobilenumber', applicationdata.result.product.primaryInsured.address[0].countryCallingCode);
                    formik.setFieldValue('lifeA.HomeNumber',applicationdata.result.product.primaryInsured.address[0].HomeNumber); // Add HomeNumber if available
                    formik.setFieldValue('lifeA.Faxno', applicationdata.result.product.primaryInsured.address[0].FaxNo); // Add Faxno if available
                    formik.setFieldValue('lifeA.permcity', applicationdata.result.product.primaryInsured.address[1].permanentCity);
                    formik.setFieldValue('lifeA.permdistrict', applicationdata.result.product.primaryInsured.address[1].permanentDistrict);
                    formik.setFieldValue('lifeA.Line1',applicationdata.result.product.primaryInsured.address[0].line1);
                    formik.setFieldValue('lifeA.Line2', applicationdata.result.product.primaryInsured.address[0].line2);
                    formik.setFieldValue('lifeA.Line3', applicationdata.result.product.primaryInsured.address[0].line3);
                    formik.setFieldValue('lifeA.Country', applicationdata.result.product.primaryInsured.address[0].country);
                    formik.setFieldValue('lifeA.postalcity', applicationdata.result.product.primaryInsured.address[0].city);
                    formik.setFieldValue('lifeA.postalcode', applicationdata.result.product.primaryInsured.address[0].postalCode);
                    formik.setFieldValue('lifeA.district', applicationdata.result.product.primaryInsured.address[0].district);
                    formik.setFieldValue('lifeA.city', applicationdata.result.product.primaryInsured.address[0].city);

                   

                    if (applicationdata.result.product.secondaryInsured) {
                        
                        formik.setFieldValue('lifeB.emailId', applicationdata.result.product.secondaryInsured.person.emailAddress );
                        formik.setFieldValue('lifeB.countrycallingcode', applicationdata.result.product.secondaryInsured.address[0].countryCallingCode);
                        formik.setFieldValue('lifeB.mobilenumber', applicationdata.result.product.secondaryInsured.person.mobileNumber);
                        formik.setFieldValue('lifeB.HomeNumber', applicationdata.result.product.secondaryInsured.address[0].HomeNumber); // Add HomeNumber if available
                        formik.setFieldValue('lifeB.Faxno', applicationdata.result.product.secondaryInsured.address[0].FaxNo); // Add Faxno if available
                        formik.setFieldValue('lifeB.Line1', applicationdata.result.product.secondaryInsured.address[0].line1);
                        formik.setFieldValue('lifeB.Line2', applicationdata.result.product.secondaryInsured.address[0].line2);
                        formik.setFieldValue('lifeB.Line3', applicationdata.result.product.secondaryInsured.address[0].line3);
                        formik.setFieldValue('lifeB.Country', applicationdata.result.product.secondaryInsured.address[0].country);
                        formik.setFieldValue('lifeB.postalcity',applicationdata.result.product.secondaryInsured.address[0].city);
                        formik.setFieldValue('lifeB.postalcode', applicationdata.result.product.secondaryInsured.address[0].postalCode);
                        formik.setFieldValue('lifeB.district', applicationdata.result.product.secondaryInsured.address[0].district);
                        formik.setFieldValue('lifeB.city', applicationdata.result.product.secondaryInsured.address[0].city);
                        formik.setFieldValue('lifeB.permcity' ,  applicationdata.result.product.secondaryInsured.address[1].permanentCity)
                        formik.setFieldValue('lifeB.permdistrict',  applicationdata.result.product.secondaryInsured.address[1].permanentDistrict);
                        formik.setFieldValue('lifeB.correspondenceAddress', applicationdata.result.product.secondaryInsured.address[0].CorrespondenceAddressSameAsLifeA);
                        formik.setFieldValue('lifeB.permanentAddress' , applicationdata.result.product.secondaryInsured.address[1].PermanentAddressSameAsLifeA)
                        //if(applicationdata.result.product.secondaryInsured.address[1].CorrespondenceAddressSameAsLifeA === 'No')
                    
                        // Check if PermanentAddressSameAsLifeA exists
                        // const permanentAddressSameAsLifeA = person?.PermanentAddressSameAsLifeA || '';
                        // formik.setFieldValue('lifeB.permanentAddress', permanentAddressSameAsLifeA);
                    
                        // if (permanentAddressSameAsLifeA === "No") {
                        //     formik.setFieldValue('lifeB.permdistrict', permanentAddress?.permanentDistrict || '');
                        //     formik.setFieldValue('lifeB.permcity', permanentAddress?.permanentCity || '');
                        // }
                    
                        // // Set correspondenceAddressSameAsLifeA
                        //formik.setFieldValue('lifeB.correspondenceAddress', person?.CorrespondenceAddressSameAsLifeA || '');
                    
                    }

                } catch (e) {
                    console.log("Error::", e)
                }
            }
            //  else {
            //     try {
            //         const data = await findRecordById("al_address_detail", addressid);
            //         console.log("al address data :::", data);

            //         if (data !== undefined) {
            //             formik.setFieldValue('lifeA.countrycallingcode', data.result.mlife.countrycallingcode);
            //             //formik.setFieldValue('lifeA.mobilenumber', data.result.mlife.mobilenumber);
            //             formik.setFieldValue('lifeA.HomeNumber', data.result.mlife.HomeNumber);
            //             formik.setFieldValue('lifeA.Faxno', data.result.mlife.Faxno);
            //             formik.setFieldValue('lifeA.permcity', data.result.mlife.PermanentCity);
            //             formik.setFieldValue('lifeA.permdistrict', data.result.mlife.PermanentDistrict);
            //             formik.setFieldValue('lifeA.Line1', data.result.mlife.Line1);
            //             formik.setFieldValue('lifeA.Line2', data.result.mlife.Line2);
            //             formik.setFieldValue('lifeA.Line3', data.result.mlife.Line3);
            //             formik.setFieldValue('lifeA.Country', data.result.mlife.Country);
            //             formik.setFieldValue('lifeA.postalcity', data.result.mlife.Postalcity);
            //             formik.setFieldValue('lifeA.postalcode', data.result.mlife.PostalCode);
            //             formik.setFieldValue('lifeA.district', data.result.mlife.district);
            //             formik.setFieldValue('lifeA.city', data.result.mlife.city);
            //             if (data.result.mlife.PermanentAddressSameAsLifeA === "No") {
            //                 formik.setFieldValue('lifeA.permdistrict', data.result.mlife.PermanentDistrict);
            //                 formik.setFieldValue('lifeA.permcity', data.result.mlife.PermanentCity);
            //             }

            //             if (data.result.slife) {
            //                 formik.setFieldValue('lifeB.emailId', data.result.slife.emailId);
            //                 formik.setFieldValue('lifeB.countrycallingcode', data.result.slife.countrycallingcode);
            //                 formik.setFieldValue('lifeB.mobilenumber', data.result.slife.mobilenumber);
            //                 formik.setFieldValue('lifeB.HomeNumber', data.result.slife.HomeNumber);
            //                 formik.setFieldValue('lifeB.Faxno', data.result.slife.Faxno);
            //                 formik.setFieldValue('lifeB.permcity', data.result.slife.PermanentCity);
            //                 formik.setFieldValue('lifeB.permdistrict', data.result.slife.PermanentDistrict);
            //                 formik.setFieldValue('lifeB.Line1', data.result.slife.Line1);
            //                 formik.setFieldValue('lifeB.Line2', data.result.slife.Line2);
            //                 formik.setFieldValue('lifeB.Line3', data.result.slife.Line3);
            //                 formik.setFieldValue('lifeB.Country', data.result.slife.Country);
            //                 formik.setFieldValue('lifeB.postalcity', data.result.slife.Postalcity);
            //                 formik.setFieldValue('lifeB.postalcode', data.result.slife.PostalCode);
            //                 formik.setFieldValue('lifeB.district', data.result.slife.district);
            //                 formik.setFieldValue('lifeB.city', data.result.slife.city);
            //                 formik.setFieldValue('lifeB.permanentAddress', data.result.slife.PermanentAddressSameAsLifeA || '');
            //                 if (data.result.slife.PermanentAddressSameAsLifeA === "No") {
            //                     formik.setFieldValue('lifeB.permdistrict', data.result.slife.PermanentDistrict);
            //                     formik.setFieldValue('lifeB.permcity', data.result.slife.PermanentCity);
            //                 }

            //                 formik.setFieldValue('lifeB.correspondenceAddress', data.result.slife.CorrespondenceAddressSameAsLifeA || '');


            //             }
            //         }
            //     } catch (e) {
            //         console.log("Error while fetching:::", e)
            //     }
            // }

        };

        fetchData();


    }, [])

    // useEffect(() => {

    // }, []);

    // useEffect(() => {
    //     const selectedType = applicationType
    //     //setApplicationType(selectedType);

    //     // Update formik value and open relevant accordions
    //     // formik.setFieldValue('applicationType', selectedType);
    //     if (selectedType === 'Single Life') {
    //         setOpenItem(['lifeA']);
    //         //formik.setFieldValue('applicationType', selectedType);
    //     } else if (selectedType === 'Joint Life' || selectedType === 'lifeofanother') {
    //         setOpenItem([]);
    //     } else {
    //         setOpenItem([]);
    //     }
    // }, [applicationType])


    useEffect(() => {
        if (applicationType === 'Single Life') {
            setOpenItem(['lifeA']); // Open only Life A accordion
        } else if (applicationType === 'Joint Life') {
            setOpenItem(['lifeA', 'lifeB']); // Open both Life A and Life B accordions
        } else {
            setOpenItem([]); // Close all accordions if applicationType is empty or undefined
        }
    }, [applicationType]); // Dependency to re-run when applicationType changes

    const [agentdataforapi, setagentdataforapi] = useState();
    const [fieldsDisabled, setFieldsDisabled] = useState(false)

    const [sqsdataforapi, setsqsdataforapi] = useState();

    // useEffect(() => {
    //     const fetchdetailsforapi = async () => {
    //         const agentdata = await findRecordById("al_agent_details", agentId)
    //         console.log("Agent data for API::::", agentdata)
    //         setagentdataforapi(agentdata)

    //         const sqsdata = await findRecordById("al_sqs_details", sqsidcontext)
    //         console.log("SQS data for API::::", sqsdata)

    //         const addressidforapi = sessionStorage.getItem('addressID');
    //             //console.log("")
    //             const addressdata = await findRecordById("al_address_detail", addressidforapi)
    //             console.log("Address data for API :::", addressdata)

    //             var payload = {
    //                 "primaryInsuranceAgent":{
    //                     "identifier":agentdataforapi.agent_id,
    //                     "agentName" : agentdataforapi.first_name,
    //                     "emailAddress" : agentdataforapi.email,
    //                     "branchCode": "DW1" 
    //                 }
    //             }

    //             console.log("Payload for API:::",payload)

    //     }
    //     fetchdetailsforapi()
    // }, [])
    // useEffect(() => {
    //     const fetchdetailsforapi = async () => {
    //         try {
    //             // Fetch agent data
    //             const agentdata = await findRecordById("al_agent_details", agentId);
    //             if (!agentdata) {
    //                 console.error("Agent data not found");
    //                 return; // Exit early if no data is found
    //             }
    //             console.log("Agent data for API::::", agentdata);
    //             setagentdataforapi(agentdata);

    //         } catch (error) {
    //             console.error("Error fetching agent data:", error);
    //         }
    //     };

    //     fetchdetailsforapi();
    // }, [agentId]);



    return (
        <SidebarLayout>
            <div className="address-detail-container">
                {/* <div className="address-navbar bg-white mb-4 p-3 shadow-sm">
                    <div className="backArrow pt-2" onClick={handleBack}>
                        <FontAwesomeIcon icon={faArrowLeft} className="backPointer red-text" />
                        <span className="ms-2 red-text ml-2">Address Details</span>
                    </div>
                    <div className="border-bottom mt-2"></div>
                </div> */}

                <div className='addressForm'>
                    <div className="accordion">
                        <AccordionItem
                            title="Life A: Proposed Insured Details"
                            isOpen={Array.isArray(openItem) && openItem.includes('lifeA')}
                            onClick={() => handleAccordionClick('lifeA')}
                            disabled={applicationType === ''}
                        //disabled={applicationType === ''}
                        >
                            <form onSubmit={formik.handleSubmit} className="eappaddress">
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label>Email ID<span className="text-danger">*</span></label>
                                        <input
                                            type="email"
                                            id="lifeA.emailId"
                                            name="lifeA.emailId"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.emailId}
                                            disabled
                                        // onInput={(e) => {
                                        //     e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                        // }}
                                        />
                                        {formik.touched.lifeA?.emailId && formik.errors.lifeA?.emailId ? (
                                            <div className="text-danger">{formik.errors.lifeA.emailId}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label>Country Calling Code<span className="text-danger">*</span></label>
                                        <select
                                            id="lifeA.countrycallingcode"
                                            name="lifeA.countrycallingcode"
                                            onChange={formik.handleChange}
                                            value={formik.values.lifeA.countrycallingcode}
                                            className="form-control"
                                        //disabled={fieldsDisabled}
                                        // onInput={(e) => {
                                        //     e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                        // }}
                                        >
                                            <option value="">Select</option>
                                            <option value="+91">+91</option>
                                            <option value="+94">+94</option>
                                            <option value="+92">+92</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Mobile Number */}
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label>Mobile Number<span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            id="lifeA.mobilenumber"
                                            name="lifeA.mobilenumber"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.mobilenumber}
                                            maxLength={10}
                                            disabled
                                            //disabled={fieldsDisabled}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10); // Removes non-numeric characters and limits to 10 digits
                                            }}
                                        />
                                        {formik.touched.lifeA?.mobilenumber && formik.errors.lifeA?.mobilenumber ? (
                                            <div className="text-danger">{formik.errors.lifeA.mobilenumber}</div>
                                        ) : null}
                                    </div>

                                    {/* Home Number */}
                                    <div className="col-md-6 mb-3">
                                        <label>Home Number<span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            id="lifeA.HomeNumber"
                                            name="lifeA.HomeNumber"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.HomeNumber}
                                            maxLength={10}
                                            //disabled={fieldsDisabled}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10); // Removes non-numeric characters and limits to 10 digits
                                            }}
                                        />
                                        {formik.touched.lifeA?.HomeNumber && formik.errors.lifeA?.HomeNumber ? (
                                            <div className="text-danger">{formik.errors.lifeA.HomeNumber}</div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* Fax Number */}
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label>Fax Number<span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            id="lifeA.Faxno"
                                            name="lifeA.Faxno"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.Faxno}
                                            maxLength={11}
                                            //disabled={fieldsDisabled}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 11); // Removes non-numeric characters and limits to 10 digits
                                            }}
                                        />
                                        {formik.touched.lifeA?.Faxno && formik.errors.lifeA?.Faxno ? (
                                            <div className="text-danger">{formik.errors.lifeA.Faxno}</div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* Correspondence Address */}
                                <h5>Correspondence Address</h5>
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label>Line 1<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeA.Line1"
                                            name="lifeA.Line1"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.Line1}
                                            //disabled={fieldsDisabled}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                            }}
                                        />
                                        {formik.touched.lifeA?.Line1 && formik.errors.lifeA?.Line1 ? (
                                            <div className="text-danger">{formik.errors.lifeA.Line1}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label>Line 2<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeA.Line2"
                                            name="lifeA.Line2"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.Line2}
                                            //disabled={fieldsDisabled}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                            }}
                                        />
                                        {formik.touched.lifeA?.Line2 && formik.errors.lifeA?.Line2 ? (
                                            <div className="text-danger">{formik.errors.lifeA.Line2}</div>
                                        ) : null}
                                    </div>


                                </div>


                                <div className='row mb-3'>
                                    <div className="col-md-6 mb-3">
                                        <label>Line 3<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeA.Line3"
                                            name="lifeA.Line3"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.Line3}
                                            //disabled={fieldsDisabled}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                            }}
                                        />
                                        {formik.touched.lifeA?.Line3 && formik.errors.lifeA?.Line3 ? (
                                            <div className="text-danger">{formik.errors.lifeA.Line3}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label>Country<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeA.Country"
                                            name="lifeA.Country"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.Country}
                                            //disabled={fieldsDisabled}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                            }}
                                        />
                                        {formik.touched.lifeA?.Country && formik.errors.lifeA?.Country ? (
                                            <div className="text-danger">{formik.errors.lifeA.Country}</div>
                                        ) : null}
                                    </div>
                                </div>


                                {/* Postal Code and City */}
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label>Postal City<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeA.postalcity"
                                            name="lifeA.postalcity"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.postalcity}
                                            //disabled={fieldsDisabled}
                                            disabled
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                            }}
                                        />
                                        {formik.touched.lifeA?.postalcity && formik.errors.lifeA?.postalcity ? (
                                            <div className="text-danger">{formik.errors.lifeA.postalcity}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label>Postal Code<span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            id="lifeA.postalcode"
                                            name="lifeA.postalcode"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.postalcode}
                                            //disabled={fieldsDisabled}
                                            disabled
                                            maxLength={6}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6); // Removes non-numeric characters and limits to 10 digits
                                            }}
                                        />
                                        {formik.touched.lifeA?.postalcode && formik.errors.lifeA?.postalcode ? (
                                            <div className="text-danger">{formik.errors.lifeA.postalcode}</div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* City and District */}
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label>District<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeA.district"
                                            name="lifeA.district"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.district}
                                            //disabled={fieldsDisabled}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                            }}
                                        />
                                        {formik.touched.lifeA?.district && formik.errors.lifeA?.district ? (
                                            <div className="text-danger">{formik.errors.lifeA.district}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label>City<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeA.city"
                                            name="lifeA.city"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.city}
                                            // disabled={fieldsDisabled}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                            }}
                                        />
                                        {formik.touched.lifeA?.city && formik.errors.lifeA?.city ? (
                                            <div className="text-danger">{formik.errors.lifeA.city}</div>
                                        ) : null}
                                    </div>
                                </div>
                                <h5>Permanent Address</h5>
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label>District<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeA.permdistrict"
                                            name="lifeA.permdistrict"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.permdistrict}
                                            //disabled={fieldsDisabled}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                            }}
                                        />
                                        {formik.touched.lifeA?.permdistrict && formik.errors.lifeA?.permdistrict ? (
                                            <div className="text-danger">{formik.errors.lifeA.permdistrict}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label>City<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeA.permcity"
                                            name="lifeA.permcity"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.permcity}
                                            //disabled={fieldsDisabled}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                            }}
                                        />
                                        {formik.touched.lifeA?.permcity && formik.errors.lifeA?.permcity ? (
                                            <div className="text-danger">{formik.errors.lifeA.permcity}</div>
                                        ) : null}
                                    </div>
                                </div>
                                {/* <div className="form-action-buttons d-flex justify-content-end mt-3">
                                    <button
                                        type="button"
                                        className="btn btn-primary me-2"
                                        onClick={handleCombinedSubmit}
                                    >
                                        Submit
                                    </button>
                                </div> */}
                            </form>
                        </AccordionItem>

                        <AccordionItem
                            title="Life B: Life to be Assured/Spouse"
                            isOpen={Array.isArray(openItem) && openItem.includes('lifeB')}
                            onClick={() => handleAccordionClick('lifeB')}
                            disabled={applicationType === '' || applicationType === 'Single Life'}
                        //disabled={applicationType === '' || applicationType === 'Single Life'}
                        >
                            <form onSubmit={formik.handleSubmit} className="eappaddress">
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label>Email ID<span className="text-danger">*</span></label>
                                        <input
                                            type="email"
                                            id="lifeB.emailId"
                                            name="lifeB.emailId"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.emailId}
                                        //disabled={fieldsDisabled}
                                        // onInput={(e) => {
                                        //     e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                        // }}
                                        />
                                        {formik.touched.lifeB?.emailId && formik.errors.lifeB?.emailId ? (
                                            <div className="text-danger">{formik.errors.lifeB.emailId}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label>Country Calling Code<span className="text-danger">*</span></label>
                                        <select
                                            id="lifeB.countrycallingcode"
                                            name="lifeB.countrycallingcode"
                                            onChange={formik.handleChange}
                                            value={formik.values.lifeB.countrycallingcode}
                                            className="form-control"
                                        //disabled={fieldsDisabled}
                                        // onInput={(e) => {
                                        //     e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                        // }}
                                        >
                                            <option value="">Select</option>
                                            <option value="+91">+91</option>
                                            <option value="+94">+94</option>
                                            <option value="+92">+92</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Mobile Number */}
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label>Mobile Number<span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            id="lifeB.mobilenumber"
                                            name="lifeB.mobilenumber"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.mobilenumber}
                                            maxLength={10}
                                            //disabled={fieldsDisabled}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10); // Removes non-numeric characters and limits to 10 digits
                                            }}
                                        />
                                        {formik.touched.lifeB?.mobilenumber && formik.errors.lifeB?.mobilenumber ? (
                                            <div className="text-danger">{formik.errors.lifeB.mobilenumber}</div>
                                        ) : null}
                                    </div>

                                    {/* Home Number */}
                                    <div className="col-md-6 mb-3">
                                        <label>Home Number<span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            id="lifeB.HomeNumber"
                                            name="lifeB.HomeNumber"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.HomeNumber}
                                            maxLength={10}
                                            //disabled={fieldsDisabled}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10); // Removes non-numeric characters and limits to 10 digits
                                            }}
                                        />
                                        {formik.touched.lifeB?.HomeNumber && formik.errors.lifeB?.HomeNumber ? (
                                            <div className="text-danger">{formik.errors.lifeB.HomeNumber}</div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* Fax Number */}
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label>Fax Number<span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            id="lifeB.Faxno"
                                            name="lifeB.Faxno"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.Faxno}
                                            maxLength={11}
                                            //disabled={fieldsDisabled}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 11); // Removes non-numeric characters and limits to 10 digits
                                            }}
                                        />
                                        {formik.touched.lifeB?.Faxno && formik.errors.lifeB?.Faxno ? (
                                            <div className="text-danger">{formik.errors.lifeB.Faxno}</div>
                                        ) : null}
                                    </div>
                                </div>

                                <label>Is Correspondence Address of Life 2 same as Life 1?<span className="text-danger">*</span></label>
                                <div className="d-flex justify-content-start">
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            id="lifeB.correspondenceYes"
                                            name="lifeB.correspondenceAddress"
                                            value="Yes"
                                            className="form-check-input"
                                            onChange={handleCorrespondenceChange}
                                            onBlur={formik.handleBlur}
                                            checked={formik.values.lifeB?.correspondenceAddress === 'Yes'}
                                        //disabled={fieldsDisabled}
                                        />
                                        <label htmlFor="lifeB.correspondenceYes" className="form-check-label">Yes</label>
                                    </div>
                                    <div className="form-check ml-2">
                                        <input
                                            type="radio"
                                            id="lifeB.correspondenceNo"
                                            name="lifeB.correspondenceAddress"
                                            value="No"
                                            className="form-check-input"
                                            onChange={handleCorrespondenceChange}
                                            onBlur={formik.handleBlur}
                                            checked={formik.values.lifeB?.correspondenceAddress === 'No'}
                                        //disabled={fieldsDisabled}
                                        />
                                        <label htmlFor="lifeB.correspondenceNo" className="form-check-label">No</label>
                                    </div>
                                    {formik.touched.lifeB?.correspondenceAddress && formik.errors.lifeB?.correspondenceAddress ? (
                                        <div className="text-danger">{formik.errors.lifeB.correspondenceAddress}</div>
                                    ) : null}
                                </div>




                                {/* Correspondence Address */}
                                <h5>Correspondence Address</h5>
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label>Line 1<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeB.Line1"
                                            name="lifeB.Line1"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.Line1}
                                            disabled={onchangeradiodisable}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                            }}
                                        />
                                        {formik.touched.lifeB?.Line1 && formik.errors.lifeB?.Line1 ? (
                                            <div className="text-danger">{formik.errors.lifeB.Line1}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label>Line 2<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeB.Line2"
                                            name="lifeB.Line2"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.Line2}
                                            disabled={onchangeradiodisable}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                            }}
                                        />
                                        {formik.touched.lifeB?.Line2 && formik.errors.lifeB?.Line2 ? (
                                            <div className="text-danger">{formik.errors.lifeB.Line2}</div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className='row mb-3'>
                                    <div className="col-md-6 mb-3">
                                        <label>Line 3<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeB.Line3"
                                            name="lifeB.Line3"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.Line3}
                                            disabled={onchangeradiodisable}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                            }}
                                        />
                                        {formik.touched.lifeB?.Line3 && formik.errors.lifeB?.Line3 ? (
                                            <div className="text-danger">{formik.errors.lifeB.Line3}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label>Country<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeB.Country"
                                            name="lifeB.Country"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.Country}
                                            disabled={onchangeradiodisable}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                            }}
                                        />
                                        {formik.touched.lifeA?.Country && formik.errors.lifeB?.Country ? (
                                            <div className="text-danger">{formik.errors.lifeB.Country}</div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* Postal Code and City */}
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label>Postal City<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeB.postalcity"
                                            name="lifeB.postalcity"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.postalcity}
                                            disabled={onchangeradiodisable}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                            }}
                                        />
                                        {formik.touched.lifeB?.postalcity && formik.errors.lifeB?.postalcity ? (
                                            <div className="text-danger">{formik.errors.lifeB.postalcity}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label>Postal Code<span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            id="lifeB.postalcode"
                                            name="lifeB.postalcode"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.postalcode}
                                            disabled={onchangeradiodisable}
                                            maxLength={6}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6); // Removes non-numeric characters and limits to 10 digits
                                            }}
                                        />
                                        {formik.touched.lifeB?.postalcode && formik.errors.lifeB?.postalcode ? (
                                            <div className="text-danger">{formik.errors.lifeB.postalcode}</div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* City and District */}
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label>District<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeB.district"
                                            name="lifeB.district"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.district}
                                            disabled={onchangeradiodisable}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                            }}
                                        />
                                        {formik.touched.lifeB?.district && formik.errors.lifeB?.district ? (
                                            <div className="text-danger">{formik.errors.lifeB.district}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label>City<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeB.city"
                                            name="lifeB.city"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.city}
                                            disabled={onchangeradiodisable}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                            }}
                                        />
                                        {formik.touched.lifeB?.city && formik.errors.lifeB?.city ? (
                                            <div className="text-danger">{formik.errors.lifeB.city}</div>
                                        ) : null}
                                    </div>
                                </div>


                                <label>Is Permanent Address of Life 2 same as Life 1?<span className="text-danger">*</span></label>
                                <div className="d-flex justify-content-start">
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            id="lifeB.permanentYes"
                                            name="lifeB.permanentAddress"
                                            value="Yes"
                                            className="form-check-input"
                                            onChange={handlePermanentChange}
                                            onBlur={formik.handleBlur}
                                            checked={formik.values.lifeB?.permanentAddress === 'Yes'}
                                        //disabled={fieldsDisabled}

                                        />
                                        <label htmlFor="lifeB.permanentYes" className="form-check-label">Yes</label>
                                    </div>
                                    <div className="form-check ml-2">
                                        <input
                                            type="radio"
                                            id="lifeB.permanentNo"
                                            name="lifeB.permanentAddress"
                                            value="No"
                                            className="form-check-input"
                                            onChange={handlePermanentChange}
                                            onBlur={formik.handleBlur}
                                            checked={formik.values.lifeB?.permanentAddress === 'No'}
                                        //disabled={fieldsDisabled}
                                        />
                                        <label htmlFor="lifeB.permanentNo" className="form-check-label">No</label>
                                    </div>
                                    {formik.touched.lifeB?.permanentAddress && formik.errors.lifeB?.permanentAddress ? (
                                        <div className="text-danger">{formik.errors.lifeB.permanentAddress}</div>
                                    ) : null}
                                </div>

                                <h5>Permanent Address</h5>
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label>District<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeB.permdistrict"
                                            name="lifeB.permdistrict"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.permdistrict}
                                            disabled={permanentDisabled}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                            }}
                                        />
                                        {formik.touched.lifeB?.permdistrict && formik.errors.lifeB?.permdistrict ? (
                                            <div className="text-danger">{formik.errors.lifeB.permdistrict}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label>City<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeB.permcity"
                                            name="lifeB.permcity"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.permcity}
                                            disabled={permanentDisabled}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                            }}
                                        />
                                        {formik.touched.lifeB?.permcity && formik.errors.lifeB?.permcity ? (
                                            <div className="text-danger">{formik.errors.lifeB.permcity}</div>
                                        ) : null}
                                    </div>
                                </div>


                            </form>
                        </AccordionItem>

                        {!isKeyboardVisible && (
                             <div className='iosfixednextprevbutton'>
                            <div className="fixednextprevbutton d-flex justify-content-between">
                                <button
                                    type="button"
                                    className="btn btn-secondary btnprev"
                                    onClick={handleBack}
                                > Prev </button>
                                <button type="submit" className="btn btnnext" onClick={handleCombinedSubmit}>
                                    Next
                                </button>
                            </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
};

export default Eapp_addressDetails;