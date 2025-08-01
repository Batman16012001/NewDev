import React from "react";
import "./BenefitSelection.css";
import { json, Link, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect,useParams,useContext } from 'react';
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Container, Row, Form } from "react-bootstrap";
import Table from 'react-bootstrap/Table';
import { PDFExport, savePDF } from "@progress/kendo-react-pdf";
// import { Encryption, Decryption } from '../../service/Encryption';
import Loader from "react-spinner-loader";
import Modal from 'react-bootstrap/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faSignOutAlt,faHouse ,faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';

import { fetchBenefitData, fetchPaymentMethods, fetchProducts,findRecordByIdServer, postCalculation } from "./BenefitSelectionService";
import { saveDetail,updateDetailById,findRecordById} from "../../db/indexedDB";

import SidebarLayout from '../../components/Dashboard/Template';


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

const BenefitSelection = (props) => {

  // const [formState, setFormState] = useState(true);

  const [calculate, setCalculate] = useState();
  const [products, setProducts] = useState([]);

  const [getPaymentMode, setPaymemtMode] = useState([]);

  const [personID, setPersonID] = useState('')
  const [planCode, setPlanCode] = useState('');

  // const [agentID, setAgentID] = useState('');
  const [getANB,setANB] = useState();
  const [getChildANB,setChildANB] = useState();

  const [paymentFrequencyValue, setPaymentFrequencyValue] = useState('')
  const navigate = useNavigate()
  const navigate1 = useNavigate()
  const gotoPersonalDetails = useNavigate()

  const [allData, setAllData] = useState([]);

  const [calculatedData, setCalculatedData] = useState([]);
  const [calculatedSpouseData, setSpouseCalculatedData] = useState([]);

  
  const [getSQSID, setSQSID] = useState();
  const [modalShow, setModalShow] = React.useState(false);
  const [proposalNumberIs, setProposalNumber] = useState('')
  const [isReadOnly, setIsReadOnly] = useState(false); 
  const pdfExportComponent = useRef(null);

  const [isValid, setValid] = useState(false);
  const [loader, setLoader] = useState();
  const gotolistdashboard = useNavigate()
  const [getClientID, setClientID] = useState();
  const [getSyncFlag, setSyncFlag] = useState();
  const [getAgentID,setAgentID] = useState();

  const [getQuoteFlag,setQuoteFlag] = useState();
  const [wasmModule, setWasmModule] = useState(null);
  const [magicNumber, setMagicNumber] = useState(null);

  const [selectedProductLabel, setSelectedProductLabel] = useState('');

    // State for each coverage and policy term
    const [coverageAccelterm, setCoverageAccelterm] = useState({});
    const [policyTermAccelterm, setPolicyTermAccelterm] = useState({});

    const [coverageAmounts, setCoverageAmounts] = useState({});
    const [policyTermAmounts, setPolicyTermAmounts] = useState({});

    const [generateIllustration,setGenerateIllustration] = useState(true)

    const [getRiderID,setRiderID] = useState()
    const [getExistedRiderID, setExistedRiderID] = useState()
    const [getExistedSQSID, setExistedSQSID] = useState()
    const [filteredPlans, setFilteredPlans] = useState([]);
    const [paymentFrequencies, setPaymentFrequencies] = useState([]);
    const [getApplicationState,setAplicationState] = useState()
    const [getGender, setGender] = useState()
    const [getSelectedPlanCode,setSelectedPlanCode] = useState()
    const [primaryInsured,setPrimaryInsured] = useState()
    
    const [allBenefitData, setAllBenefitData] = useState([]);
    const [allSpouseBenefitData,setSpouseBenefitData] = useState([])
    const [allChildBenefitData, setChildBenefitData] = useState([])

    const [selectedBenefit, setSelectedBenefit] = useState(null);
    const [showAccelterm, setShowAccelterm] = useState(false);

    const [checkedBenefits, setCheckedBenefits] = useState({});
    const [getPersonalDetails, setPersonalDetails] = useState({});
    const [getSpouseInsuredDetails,setSpouseInsuredDetails] = useState({});
    const [getChildInsuredDetails,setChildInsuredDetails] = useState({});

    const [totalPremiumData,setTotalPremiumData] = useState([])
    const [allTotalPremiumData,setAllTotalPremiumData] = useState([])
    // const [activeKey, setActiveKey] = useState("getApplicationState" === "Joint Life" ? "0" : "1");
    const [basicPlanAmount, setBasicPlanAmount] = useState(coverageAmounts['base'] || 100000);
    // const [basicPlanAmount, setBasicPlanAmount] = useState();

    const [getNoOfChild,setNoOfChild] = useState()
    const [getExistedSqsData,setExistedSqsData] = useState({})
    const [getJointCoverage, setJointCoverage] = useState({})
    const [getCalculationDone,setCalculationDone] = useState()

    const ApplicationType = sessionStorage.getItem('applicationType');
    
    // const [openItem, setOpenItem] = useState([]);
    const [openItem, setOpenItem] = useState(() => {
          
      // added by shweta
      if (ApplicationType === 'Joint Life') {
        return ['lifeA', 'lifeB']; // Both accordions open for Joint Life
      } else if (ApplicationType === 'Single Life') {
        return ['lifeA']; // Only Life A open for Single Life
      }
      return []; // Default case if ApplicationType is null or undefined
  }); 
  
    const isApplicationTypeValid = ApplicationType === 'Joint Life';
    const isApplicationTypeNullOrEmpty = ApplicationType === null || ApplicationType === ''; // true if null or empty

    const childInclusion = sessionStorage.getItem('setChildInclusion');
    const isChildInclusionEnabled = childInclusion === 'true'; 
    
        // const [openItem, setOpenItem] = useState([]);


        const handleAccordionClick = (item) => {
          setOpenItem((prevOpenItems) => {
              const updatedItems = [...prevOpenItems];
              if (updatedItems.includes(item)) {
                  return updatedItems.filter((openItem) => openItem !== item);
              } else {
                  return [...updatedItems, item];
              }
          });
      };

  function MyVerticallyCenteredModal(props) {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
  
        <Modal.Body>
          <p>
          {proposalNumberIs}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>Ok</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  function dashNav() {
    sessionStorage.setItem("agentID", getAgentID);   
    sessionStorage.setItem("fromScreen", "Product_Choice");
    sessionStorage.setItem("ClientID", getClientID);

    navigate('/sqs_personal_detail');

  }


function dashboardNav(){
  navigate('/dashboard');
}

function logOut(){
  navigate('/');
}

  
  const calculatePremium = async (formValues) => {
    console.log("formValues", formValues);
    const sessionPlanCode = sessionStorage.getItem('planCode');
    console.log("sessionPlanCode", sessionPlanCode);
    setGenerateIllustration(false)
  
    if (navigator.onLine) {
      setCalculate(true);
  
      // Primary Insured Coverages
      const coverages = allBenefitData
        .filter(
          (benefit) =>
            benefit.coverageLookup === "base" || checkedBenefits[benefit.coverageLookup]
        )
        .map((benefit) => ({
          coverageLookup: benefit.coverageLookup,
          benefitPeriod: {
            applicationValue: parseInt(
              policyTermAmounts[benefit.coverageLookup] ||
                benefit.options.benefitPeriod.minimum,
              10
            ),
          },
          benefitAmount: {
            applicationValue: parseInt(
              coverageAmounts[benefit.coverageLookup] ||
                benefit.benefitAmount.benefitAmountRange.minimum,
              10
            ),
          },
        }));

        // const coverages = allBenefitData
        //     .filter(
        //       (benefit) =>
        //         benefit.coverageLookup === "base" || checkedBenefits[benefit.coverageLookup]
        //     )
        //     .map((benefit) => ({
        //       coverageLookup: benefit.coverageLookup,
        //       benefitPeriod: {
        //         applicationValue: parseInt(
        //           policyTermAmounts[benefit.coverageLookup] ??
        //             benefit.options.benefitPeriod.minimum,
        //           10
        //         ),
        //       },
        //       benefitAmount: {
        //         applicationValue: parseInt(
        //           coverageAmounts[benefit.coverageLookup] ??
        //             benefit.benefitAmount.benefitAmountRange.minimum,
        //           10
        //         ),
        //       },
        //     }));

  
      // Spouse Insured Coverages
      const spouseCoverages = allSpouseBenefitData
        .filter((benefit) => checkedBenefits[benefit.coverageLookup])
        .map((benefit) => ({
          coverageLookup: benefit.coverageLookup,
          benefitPeriod: {
            applicationValue: parseInt(
              policyTermAmounts[benefit.coverageLookup] ||
                benefit.options.benefitPeriod.minimum,
              10
            ),
          },
          benefitAmount: {
            applicationValue: parseInt(
              coverageAmounts[benefit.coverageLookup] ||
                benefit.benefitAmount.benefitAmountRange.minimum,
              10
            ),
          },
        }));
  
      // Child Insured Coverages
      const childCoverages = Object.entries(allChildBenefitData)
      .map(([childKey, benefits], index) => {
        const label = `Child${index + 1}`;
        const childCheckedBenefits = checkedBenefits[childKey] || {};
    
        const coverages = benefits
          .filter((benefit) => {
            const isChecked = childCheckedBenefits[benefit.coverageLookup];
            if (!isChecked) {
              console.log(`Filtered out for ${childKey}:`, benefit.coverageLookup);
            }
            return isChecked;
          })
          .map((benefit) => ({
            coverageLookup: benefit.coverageLookup,
            benefitPeriod: {
              applicationValue: parseInt(
                policyTermAmounts[benefit.coverageLookup] || benefit.options.benefitPeriod.minimum,
                10
              ),
            },
            benefitAmount: {
              applicationValue: parseInt(
                coverageAmounts[benefit.coverageLookup] || benefit.benefitAmount.benefitAmountRange.minimum,
                10
              ),
            },
          }));
    
        return {
          label,
          coverages,
          person: getChildInsuredDetails,
        };
      })
      .filter((child) => child.coverages.length > 0); 
    
    console.log("Child Coverages:", childCoverages);
    
    const getLeadID = sessionStorage.getItem('setLeadID')
    console.log("setLeadID-->",getLeadID)

    const postData = {
      applicationType: getApplicationState,
      productType: formValues.productName,
      productName: formValues.planName, 
      productCode: sessionPlanCode,
      leadId: getLeadID,
      residentialExtra: "No",
      paymentFrequency: formValues.paymentFrequency,
      primaryInsured: {
        coverages,
        person: getPersonalDetails,
      },
      ...(spouseCoverages.length > 0 && getSpouseInsuredDetails
        ? {
            spouseInsured: {
              coverages: spouseCoverages,
              person: getSpouseInsuredDetails,
            },
          }
        : {}),
      ...childCoverages.reduce((acc, child, index) => {
        const childKey = `child${index + 1}`;
        acc[childKey] = {
          coverages: child.coverages,
          // person: child.person,
          person: child.person[index]
        };
        return acc;
      }, {}), 
    };
    
      console.log("postData are-->", postData);
  
      const postCalculationData = await postCalculation(postData);
      console.log("postCalculationData are-->", postCalculationData);
  
      if (postCalculationData && postCalculationData.QuoteResults) {

        // const coverages = [
        //   ...postCalculationData.QuoteResults[0].primaryInsured.CoveragePremiums,
        //   ...postCalculationData.QuoteResults[0].spouseInsured.CoveragePremiums,
        //   ...Object.keys(postCalculationData.QuoteResults[0])
        //     .filter((key) => key.startsWith("child"))
        //     .flatMap((childKey) =>
        //       postCalculationData.QuoteResults[0][childKey].CoveragePremiums
        //     ),
        // ];

        const coverages = [
          ...(postCalculationData?.QuoteResults[0]?.primaryInsured?.CoveragePremiums || []),
        
          ...(postCalculationData?.QuoteResults[0]?.spouseInsured?.CoveragePremiums || []),
        
          ...Object.keys(postCalculationData?.QuoteResults[0] || {})
            .filter((key) => key.startsWith("child"))
            .flatMap((childKey) =>
              postCalculationData?.QuoteResults[0]?.[childKey]?.CoveragePremiums || []
            ),
        ];
        
        
        const calculatedData = coverages.map((coverage) => ({
          coverageLookup: coverage.CoverageLookup,
          PremiumAmount: coverage.Premiums[0]?.PremiumAmount || 0,
        }));

        // const coveragePremiums =
        //   postCalculationData.QuoteResults[0]?.primaryInsured?.CoveragePremiums || [];
  
        // const calculatedData = coverages.map((benefit) => {
        //   const matchedCoverage = coveragePremiums.find(
        //     (coverage) => coverage.CoverageLookup === benefit.coverageLookup
        //   );
        //   return {
        //     coverageLookup: benefit.coverageLookup,
        //     PremiumAmount: matchedCoverage?.Premiums[0]?.PremiumAmount || 0,
        //   };
        // });

        console.log("before setCalculatedData ",calculatedData)
  
        setCalculatedData(calculatedData);
        setCalculationDone(false)

        // const coverageSpousePremiums = postCalculationData.QuoteResults[0]?.spouseInsured?.CoveragePremiums || [];
  
        const totalPremiums = postCalculationData.QuoteResults[1]?.Premiums || [];
  
        const selectedPremium = totalPremiums.find(
          (premium) =>
            premium.PaymentFrequency ===
            frequencyOptions[postData.paymentFrequency]
        );
  
        if (selectedPremium) {
          setTotalPremiumData([
            {
              paymentFrequency: selectedPremium.PaymentFrequency,
              PremiumAmount: Math.round(selectedPremium.PremiumAmount * 100) / 100,
            },
          ]);
        } else {
          setTotalPremiumData([]);
        }
  
        const allTotalPremiumData = totalPremiums.map((premium) => ({
          paymentFrequency: premium.PaymentFrequency,
          PremiumAmount: Math.round(premium.PremiumAmount * 100) / 100,
        }));
  
        setAllTotalPremiumData(allTotalPremiumData);
      }

    } else {
      setLoader(false);
      const alertIs = "Please connect internet";
      setProposalNumber(alertIs);
      setModalShow(true);
    }
  };
  
    function proceedToNextScreen (){
    console.log("generateIllustration 2", generateIllustration);

    // if (generateIllustration === false || generateIllustration === undefined || generateIllustration === "") {
    //   setLoader(false)
    //   var alertIs= "Please generate Illustration"
    //   setProposalNumber(alertIs)
    //   setModalShow(true)
    // } else {


    if (getCalculationDone === true) {
      navigate('/mysavedquotations')
    }else{
      setLoader(false)
      var alertIs= "Please generate Illustration"
      setProposalNumber(alertIs)
      setModalShow(true)
    }

        // navigate('/mysavedquotations')
  
        var currentdate = new Date();
  
        console.log("Inside submit ");
  
      // }
  }

  const formik = useFormik({
    initialValues: {
      productName:  '',
      planName:  '',
      paymentFrequency: '',
      planCode: '',
    },
    validationSchema: Yup.object({
      productName: Yup.string().required("Please select Product"),
      planName: Yup.string().required("Please select Plan Name"),
      paymentMode: Yup.string().required("Please select Payment Mode"),
      paymentFrequency: Yup.string().required("Please select Payment Frequency")
    }),

    onSubmit: async values => {

  //   if (generateIllustration === false || generateIllustration === undefined || generateIllustration === "") {
  //   setLoader(false)
  //   var alertIs= "Please generate Illustration"
  //   setProposalNumber(alertIs)
  //   setModalShow(true)
  // } else {
  //     navigate('/payordetails')

  //     var currentdate = new Date();

  //     console.log("Inside submit ");

  //       console.log(JSON.stringify(values, null, 2));
  //   }

      
    }
    
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const personID = sessionStorage.getItem("personID");
        setPersonID(personID)

        // const personData = await findRecordById('al_person_details', "PR1729230007802");
        const personData = await findRecordById('al_person_details', personID);
        console.log("fetch existed personData", JSON.stringify(personData));

        const clientId = sessionStorage.getItem("clientId");
        setClientID(clientId)

        const agentId = sessionStorage.getItem("agentId")
        console.log("agentId",agentId)
        setAgentID(agentId)

        const clientData = await findRecordById('al_client_details', clientId);
        console.log("fetch existed clientData", clientData);


          const primaryInsuredDetails = {
          name: {
            first: personData.result.primaryInsured.person.name.first || "",
            middle: "", 
            last:personData.result.primaryInsured.person.name.last || "",
            title: personData.result.primaryInsured.person.name.title || "",
          },
          age: personData.result.primaryInsured.person.age || 0,
          email: clientData.result.emailId,
          mobile: clientData.result.mobile, 
          source: "quote", 
          assignedAgentDetails: [
            {
                agentId: agentId
            }
        ],
          segmentation: {
            demographics: {
              DOB: personData.result.primaryInsured.person.dateOfBirth || "",
              gender: personData.result.primaryInsured.person.gender || "",
              income: personData.result.primaryInsured.person.annualIncome.toString() || "",
              maritalStatus: personData.result.primaryInsured.person.maritalStatus || "",
              occupation: personData.result.primaryInsured.person.occupation || "",
            },
            geographic: {
              state: "Maharashtra", 
              city: "Pune", 
              pinCode: "411038", 
            },
            productInterest: ["Quote"], 
          },
        };

        setPersonalDetails(primaryInsuredDetails);

        if (personData.result.secondaryInsured) {
            const spouseInsuredDetails = {
              name: {
                first: personData.result.secondaryInsured.person.name.first || "",
                middle: "", 
                last:personData.result.secondaryInsured.person.name.last || "",
                title: personData.result.secondaryInsured.person.name.title || "",
              },
              age: personData.result.secondaryInsured.person.age || 0,
              email: clientData.result.emailId,
              mobile: clientData.result.mobile, 
              source: "quote", 
              assignedAgentDetails: [
                {
                    agentId: agentId
                }
            ],
              segmentation: {
                demographics: {
                  DOB: personData.result.secondaryInsured.person.dateOfBirth || "",
                  gender: personData.result.secondaryInsured.person.gender || "",
                  income: personData.result.secondaryInsured.person.annualIncome.toString()|| "",
                  maritalStatus: personData.result.secondaryInsured.person.maritalStatus || "",
                  occupation: personData.result.secondaryInsured.person.occupation || "",
                },
                geographic: {
                  state: "Maharashtra", 
                  city: "Pune", 
                  pinCode: "411038", 
                },
                productInterest: ["Quote"], 
              },
            };
            setSpouseInsuredDetails(spouseInsuredDetails);
       }

       if (personData.result.Child && personData.result.Child.length > 0) {
        const childInsuredDetails = personData.result.Child.map((child) => ({
          name: {
            first: child.name.first || "",
            middle: "", 
            last: child.name.last || "",
            title: child.name.title || "",
          },
          age: child.age || 0,
          email: clientData.result.emailId,
          mobile: clientData.result.mobile, 
          source: "quote", 
          assignedAgentDetails: [
            {
              agentId: agentId
            }
          ],
          segmentation: {
            demographics: {
              DOB: child.dateOfBirth || "",
              gender: child.gender || "",
            },
            geographic: {
              state: "Maharashtra", 
              city: "Pune", 
              pinCode: "411038", 
            },
            productInterest: ["Quote"], 
          },
        }));
      
        setChildInsuredDetails(childInsuredDetails);
      }

        const appType = sessionStorage.getItem("applicationType");
  
        const anb =personData.result.primaryInsured.person.age
        const gender = personData.result.primaryInsured.person.gender;
        
        const applicationType = appType;

        // const applicationType = "Joint Life";
        const noOfchild = personData.result.Child ? personData.result.Child.length : 0;

        setANB(anb);
        setGender(gender);
        setAplicationState(applicationType);
        setNoOfChild(noOfchild);
  
        // Fetch and filter products based on ANB and Gender
        const allProductData = await fetchProducts();
        const filteredProducts = allProductData.products.filter(product => {
          const ageMin = parseInt(product.AgeMin, 10);
          const ageMax = parseInt(product.AgeMax, 10);
          return anb >= ageMin && anb <= ageMax;
        });
  
        const productList = filteredProducts.map(product => ({
          planName: product.PlanName,
          category: product.Category,
          planCode: product.PlanCode,
          premiumFrequency: Array.isArray(product.PremiumFrequency)
            ? product.PremiumFrequency.map(frequency => frequency.replace(/[\[\]]/g, '').trim())
            : product.PremiumFrequency?.split(',').map(frequency => frequency.replace(/[\[\]]/g, '').trim()),  
          applicationType: product.ApplicationType
            ? product.ApplicationType.replace(/[\[\]]/g, '').split(',').map(type => type.trim())
            : [], 
          gender: product.Gender || 'N/A'
        }));
  
        setProducts(productList); // Set the filtered product list for the dropdown
  
        // Fetch IndexedDB data for SQS and Rider details
        const sqsID = sessionStorage.getItem("sqsID");
        setSQSID(sqsID)

        const riderID = sessionStorage.getItem("riderID");
        setRiderID(riderID)

        setCheckedBenefits((prev) => ({
          ...prev,
          base: true,
        }));
  
        if (sqsID && riderID) {
          const sqsFetch = await findRecordById('al_sqs_details', sqsID);
          console.log("sqsFetch",sqsFetch)
          setExistedSQSID(sqsID) 

          const riderFetch = await findRecordById('al_rider_details', riderID);
          console.log("riderFetch",riderFetch)
          setExistedRiderID(riderID)
      
          const calculationDone = riderFetch.result.calculationDone
          console.log("calculationDone",calculationDone)
          setCalculationDone(calculationDone)

          const newCalculatedData = riderFetch.result.primaryInsured.coverages.map((coverage) => {
            const premiumEntry = Array.isArray(coverage.benefitAmount.riderPremium)
              ? coverage.benefitAmount.riderPremium.find(
                  premium => premium.coverageLookup === coverage.riderName
                )
              : null;
          
            return {
              coverageLookup: coverage.riderName,
              PremiumAmount: premiumEntry
                ? parseFloat(premiumEntry.PremiumAmount)
                : parseFloat(coverage.benefitAmount.riderPremium) || null
            };
          });
          

          const newSpouseCalculatedData = riderFetch.result.spouseInsured.coverages.map((coverage) => {
            const premiumEntry = coverage.benefitAmount.riderPremium.find(
              premium => premium.coverageLookup === coverage.riderName
            );
            return {
              coverageLookup: coverage.riderName,
              PremiumAmount: premiumEntry 
              ? parseFloat(premiumEntry.PremiumAmount) 
              : parseFloat(coverage.benefitAmount.riderPremium) || null
            };
          });

          const newChildCalculatedData = [];

          const childrenKeys = [
            'firstChildInsured',
            'secondChildInsured',
            'thirdChildInsured',
            'fourthChildInsured',
            'fifthChildInsured'
          ];

          for (let i = 0; i < noOfchild; i++) {
            const childOf = childrenKeys[i]; 
            const childData = riderFetch.result.childInsured.coverages[childOf]?.coverages;
            
            if (childData) {
              const calculatedData = childData.map((coverage) => {
                const premiumEntry = Array.isArray(coverage.benefitAmount.riderPremium)
                  ? coverage.benefitAmount.riderPremium.find(
                      (premium) => premium.coverageLookup === coverage.riderName
                    )
                  : { PremiumAmount: coverage.benefitAmount.riderPremium }; 
          
                return {
                  coverageLookup: coverage.riderName,
                  PremiumAmount: premiumEntry ? parseFloat(premiumEntry.PremiumAmount) : null,
                };
              });
              newChildCalculatedData.push(...calculatedData);
            }
          }

          // const newChildCalculatedData = riderFetch.result.childInsured.coverages.map((coverage) => {
          //   const premiumEntry = coverage.benefitAmount.riderPremium.find(
          //     premium => premium.coverageLookup === coverage.riderName
          //   );
          //   return {
          //     coverageLookup: coverage.riderName,
          //     PremiumAmount: premiumEntry 
          //       ? parseFloat(premiumEntry.PremiumAmount) 
          //       : parseFloat(coverage.benefitAmount.riderPremium) || null
          //   };
          // });
          

  
          // if (applicationType === "Joint Life") {
          //   setCalculatedData([...newCalculatedData, ...newSpouseCalculatedData]);
          // } else {
          //   setCalculatedData(newCalculatedData);
          // }

          if (applicationType === "Joint Life") {
            setCalculatedData([...newCalculatedData, ...newSpouseCalculatedData, ...newChildCalculatedData]);
          } else {
            setCalculatedData([...newCalculatedData, ...newChildCalculatedData]);
          }
          
  
          if (riderFetch?.result?.allTotalPremiumData) {
            setAllTotalPremiumData(riderFetch.result.allTotalPremiumData);

            setTotalPremiumData([{
              paymentFrequency: riderFetch.result.totalPremiumData[0].paymentFrequency,
              PremiumAmount: riderFetch.result.totalPremiumData[0].PremiumAmount,
            }])
          }

            try {

              const allBenefitData = await fetchBenefitData(sqsFetch.result.policyDetails.productCode, sqsFetch.result.payment.paymentFrequency); 
              console.log("allBenefitData onload-->", allBenefitData);

                  const checkCoverageMatch = (coverages, riderCoverages) => {
                    return coverages.map((coverage) => {
                      const match = riderCoverages.find((rider) => rider.riderName === coverage.coverageLookup);
                  
                      return {
                        ...coverage,
                        isChecked: !!match, 
                        riderValue: match ? match.benefitAmount.riderValue : undefined, 
                        riderTerm: match ? match.benefitPeriod.riderTerm : undefined 
                      };
                    });
                  };
                  
                  if (applicationType === "Single Life") {
                    const eligibleCoverages = (allBenefitData?.primaryInsured?.coverages || []).filter((coverage) => {
                      const { maximum, minimum } = coverage?.eligibleAgeRange || {};
                      return anb >= minimum && anb <= maximum;
                    });
                    
                    const updatedCoverages = checkCoverageMatch(eligibleCoverages, riderFetch?.result?.primaryInsured?.coverages || []);
                    setAllBenefitData(updatedCoverages);

                    const initialCheckedBenefits = updatedCoverages.reduce((acc, coverage) => {
                      acc[coverage.coverageLookup] = coverage.isChecked;
                      return acc;
                    }, {});

                    setCheckedBenefits(initialCheckedBenefits);

                  } 
                  else if (applicationType === "Joint Life") {
                    const eligiblePrimaryCoverages = (allBenefitData?.primaryInsured?.coverages || []).filter((coverage) => {
                      const { maximum, minimum } = coverage?.eligibleAgeRange || {};
                      return anb >= minimum && anb <= maximum;
                    });

                    const updatedPrimaryCoverages = checkCoverageMatch(eligiblePrimaryCoverages, riderFetch?.result?.primaryInsured?.coverages || []);
                    console.log("updatedPrimaryCoverages-->",updatedPrimaryCoverages)
                    setAllBenefitData(updatedPrimaryCoverages);

                    const initialCheckedBenefits = updatedPrimaryCoverages.reduce((acc, coverage) => {
                      acc[coverage.coverageLookup] = coverage.isChecked;
                      return acc;
                    }, {});

                    setCheckedBenefits(initialCheckedBenefits);

                    const spouseEligibleCoverages = (allBenefitData?.spouseInsured?.coverages || []).filter((coverage) => {
                      const { maximum, minimum } = coverage?.eligibleAgeRange || {};
                      return anb >= minimum && anb <= maximum;
                    });

                    // Compare and mark checkboxes for Spouse Insured
                    const updatedSpouseCoverages = checkCoverageMatch(spouseEligibleCoverages, riderFetch?.result?.spouseInsured?.coverages || []);
                    console.log("updatedSpouseCoverages-->",updatedSpouseCoverages)
                    setSpouseBenefitData(updatedSpouseCoverages);

                      const initialCheckedSpouseBenefits = updatedSpouseCoverages.reduce((acc, coverage) => {
                        acc[coverage.coverageLookup] = coverage.isChecked;
                        return acc;
                      }, {});
                  
                      setCheckedBenefits((prev) => ({ ...prev, ...initialCheckedSpouseBenefits }));
                  }

                  if (noOfchild !== "") {
                    let childBenefitData = {};
                    const childrenKeys = [
                      'firstChildInsured',
                      'secondChildInsured',
                      'thirdChildInsured',
                      'fourthChildInsured',
                      'fifthChildInsured'
                    ];
                    
                    let initialCheckedChildBenefits = {};
                  
                    // childrenKeys.forEach((childKey, index) => {
                    //   if (index < noOfchild) {
                    //     const eligibleChildCoverages = allBenefitData[childKey]?.coverages || [];
                        
                    //     const updatedChildCoverages = checkCoverageMatch(
                    //       eligibleChildCoverages,
                    //       riderFetch?.result?.childInsured?.coverages?.[childKey]?.coverages || []
                    //     );
                  
                    //     childBenefitData[childKey] = updatedChildCoverages;
                  
                    //     initialCheckedChildBenefits[childKey] = {};
                  
                    //     updatedChildCoverages.forEach((coverage) => {
                    //       if (coverage.isChecked) {
                    //         initialCheckedChildBenefits[childKey][coverage.coverageLookup] = true;
                    //       } else {
                    //         initialCheckedChildBenefits[childKey][coverage.coverageLookup] = false;
                    //       }
                    //     });
                    //   }
                    // });

                    childrenKeys.forEach((childKey, index) => {
                      if (index < noOfchild) {
                        const updatedChildCoverages = checkCoverageMatch(
                          allBenefitData?.[childKey]?.coverages || [],
                          riderFetch?.result?.childInsured?.coverages?.[childKey]?.coverages || []
                        );
          
                        childBenefitData[childKey] = updatedChildCoverages;
                        initialCheckedChildBenefits[childKey] = updatedChildCoverages.reduce((acc, coverage) => {
                          acc[coverage.coverageLookup] = coverage.isChecked;
                          return acc;
                        }, {});
                      }
                    });
                  
                    setCheckedBenefits((prev) => ({
                      ...prev,
                      ...initialCheckedChildBenefits,
                    }));
                  
                    setChildBenefitData(childBenefitData);
                    console.log("Updated childBenefitData:", childBenefitData);
                    console.log("Updated checkedBenefits:", initialCheckedChildBenefits);
                  }
                                  

            } catch (error) {
              console.error("Error fetching benefit data:", error);
            }
          
          if (sqsFetch.result) {
            const paymentFrequencies = Array.isArray(sqsFetch.result.payment.paymentFrequency)
            ? sqsFetch.result.payment.paymentFrequency
            : [sqsFetch.result.payment.paymentFrequency]; 
    
          setPaymentFrequencies(paymentFrequencies);
            formik.setValues({
              productName: sqsFetch.result.policyDetails.productType,
              planName: sqsFetch.result.policyDetails.productName,
              paymentFrequency: sqsFetch.result.payment.paymentFrequency,
            });
          }
  
        }
  
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);

  const uniqueProducts = products.reduce((acc, current) => {
    const x = acc.find(item => item.category === current.category);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);

  const handleProductChange = (e) => {
    const selectedCategory = e.target.value; 
    formik.setFieldValue('productName', selectedCategory); 
  
    const filteredPlans = products.filter(product => { 
      const applicationTypes = product.applicationType  
      const genderMatch = product.gender === "both" || product.gender.toLowerCase() === getGender.toLowerCase(); 
  
      const applicationTypeMatch = applicationTypes.includes(getApplicationState);
  
      return product.category === selectedCategory && applicationTypeMatch && genderMatch;
    });
  
    setFilteredPlans(filteredPlans); 
  };
  
  
  const handlePlanChange = async (e) => {
    const selectedPlanName = e.target.value;

    formik.setFieldValue('planName', selectedPlanName);

    const selectedPlan = products.find(product => product.planName === selectedPlanName);

    // formik.setFieldValue("planCode", selectedPlan ? selectedPlan.planCode : "");
     sessionStorage.setItem('planCode', selectedPlan.planCode);
    // console.log("selectedPlan.planCode",selectedPlan.planCode)

    if (selectedPlan) {
      setPaymentFrequencies(selectedPlan.premiumFrequency);
      setSelectedPlanCode(selectedPlan.planCode)
      formik.setFieldValue('paymentFrequency', '');
      }
    };

  const frequencyOptions = {
    S: "Single",
    A: "Annually",
    // H: "Half Yearly",
    H: "SemiAnnually",
    Q: "Quarterly",
    M: "Monthly",
  };

  const handleBenefitSelection = async (e) =>{
          const paymentFrequency = e.target.value;
          console.log("paymentFrequency-->", paymentFrequency)
          try {

            const allBenefitData = await fetchBenefitData(getSelectedPlanCode, paymentFrequency); 
            console.log("allBenefitData are-->", allBenefitData);

            const anb = getANB

            if (getApplicationState === "Single Life") {
              const eligibleCoverages = allBenefitData?.primaryInsured?.coverages?.filter((coverage) => {
                const { maximum, minimum } = coverage?.eligibleAgeRange || {};
                return anb >= minimum && anb <= maximum;
              }) || [];
              console.log("eligibleCoverages-->",eligibleCoverages)
              setAllBenefitData(eligibleCoverages);
            } 
            else if (getApplicationState === "Joint Life") {      
            
              const eligibleCoverages = allBenefitData?.primaryInsured?.coverages?.filter((coverage) => {
                const { maximum, minimum } = coverage?.eligibleAgeRange || {};
                return anb >= minimum && anb <= maximum;
              }) || [];
              setAllBenefitData(eligibleCoverages);
            
              const spouseEligibleCoverages = allBenefitData?.spouseInsured?.coverages?.filter((coverage) => {
                const { maximum, minimum } = coverage?.eligibleAgeRange || {};
                return anb >= minimum && anb <= maximum;
              }) || [];
              setSpouseBenefitData(spouseEligibleCoverages);
            }
            
            if (getNoOfChild !== "") {
              const eligibleCoverages = allBenefitData?.primaryInsured?.coverages?.filter((coverage) => {
                const { maximum, minimum } = coverage?.eligibleAgeRange || {};
                return anb >= minimum && anb <= maximum;
              }) || [];
              setAllBenefitData(eligibleCoverages);
            
              const spouseEligibleCoverages = allBenefitData?.spouseInsured?.coverages?.filter((coverage) => {
                const { maximum, minimum } = coverage?.eligibleAgeRange || {};
                return anb >= minimum && anb <= maximum;
              }) || [];
              setSpouseBenefitData(spouseEligibleCoverages);
            
              let childBenefitData = {};
              const childrenKeys = [
                'firstChildInsured',
                'secondChildInsured',
                'thirdChildInsured',
                'fourthChildInsured',
                'fifthChildInsured'
              ];
            
              for (let i = 0; i < getNoOfChild; i++) {
                const childKey = childrenKeys[i]; 
                // const currentChildCoverages = allBenefitData?.[childKey]?.coverages?.filter((coverage) => {
                //   const { maximum, minimum } = coverage?.eligibleAgeRange || {};
                //   return getChildANB >= minimum && getChildANB <= maximum;
                // }) || [];
                const currentChildCoverages = allBenefitData?.[childKey]?.coverages || []; 
            
                childBenefitData[childKey] = currentChildCoverages;
                // console.log("childBenefitData-->",JSON.stringify(childBenefitData))
              }
            
              setChildBenefitData(childBenefitData);
            }

          } catch (error) {
            console.error("Error fetching benefit data:", error);
          }
   } 

  const incrementCoverageAccelterm = (coverageLookup, increment, currentValue, maximum) => {
    const newCoverageAmount = Math.min(parseInt(currentValue) + increment, maximum);
  
    if (coverageLookup === "base") {
      setCoverageAmounts((prevState) => {
        const updatedState = {
          ...prevState,
          [coverageLookup]: newCoverageAmount, // update base coverage
        };
  
        allBenefitData.forEach((benefit) => {
          if (benefit.coverageLookup !== "base") {
            const newMinValue = evaluateExpression(
              benefit.benefitAmount.benefitAmountDependent.minimum,
              benefit.coverageLookup
            );
            const newMaxValue = evaluateExpression(
              benefit.benefitAmount.benefitAmountDependent.maximum,
              benefit.coverageLookup
            );
  
            updatedState[benefit.coverageLookup] = Math.min(
              newCoverageAmount * newMinValue, // recalculate based on dependent expression
              newMaxValue
            );
          }
        });

        console.log("updatedState for Base",updatedState)
        return updatedState;
      });
    } else {
      // Handle other coverage items directly if base isn't involved
      setCoverageAmounts((prevState) => ({
        ...prevState,
        [coverageLookup]: newCoverageAmount,
      }));
    }
  };

  const decrementCoverageAccelterm = (coverageLookup, incrementValue, currentCoverage, minValue) => {
      setCoverageAmounts((prevCoverageAmounts) => {
          const newCoverage = Math.max(currentCoverage - incrementValue, minValue);
          return { ...prevCoverageAmounts, [coverageLookup]: newCoverage };
      });
  };

  // const decrementCoverageAccelterm = (coverageLookup, decrement, currentValue, minimum) => {
  //   const newCoverageAmount = Math.max(parseInt(currentValue) - decrement, minimum);
  
  //   if (coverageLookup === "base") {
  //     setCoverageAmounts((prevState) => {
  //       const updatedState = {
  //         ...prevState,
  //         [coverageLookup]: newCoverageAmount, // update base coverage
  //       };
  
  //       // Update dependent benefits
  //       allBenefitData.forEach((benefit) => {
  //         if (benefit.coverageLookup !== "base") {
  //           const newMinValue = evaluateExpression(
  //             benefit.benefitAmount.benefitAmountDependent.minimum,
  //             benefit.coverageLookup
  //           );
  //           const newMaxValue = evaluateExpression(
  //             benefit.benefitAmount.benefitAmountDependent.maximum,
  //             benefit.coverageLookup
  //           );
  
  //           updatedState[benefit.coverageLookup] = Math.max(
  //             newCoverageAmount * newMinValue, // recalculate based on dependent expression
  //             newMaxValue
  //           );
  //         }
  //       });
  
  //       console.log("updatedState for Base (Decrement)", updatedState);
  //       return updatedState;
  //     });
  //   } else {
  //     setCoverageAmounts((prevState) => ({
  //       ...prevState,
  //       [coverageLookup]: newCoverageAmount,
  //     }));
  //   }
  // };
  
  const incrementPolicyTermAccelterm = (baseCoverageLookup, incrementValue, currentPolicyTerm, maxValue) => {
    setPolicyTermAmounts((prevPolicyTermAmounts) => {
      
      const newBaseTerm = Math.min(parseInt(currentPolicyTerm) + incrementValue, maxValue); 
  
      const updatedTerms = allBenefitData.reduce((lookhupAccumulator, benefit) => {
        const maxTerm = benefit.options.benefitPeriod.maximum;
        const currentTerm = prevPolicyTermAmounts[benefit.coverageLookup] || benefit.options.benefitPeriod.minimum;
  
        lookhupAccumulator[benefit.coverageLookup] = Math.min(newBaseTerm, maxTerm);
        return lookhupAccumulator;
      }, {});
  
      return { ...prevPolicyTermAmounts, ...updatedTerms };
    });
  };
  
  const decrementPolicyTermAccelterm = (baseCoverageLookup, decrementValue, currentPolicyTerm, minValue) => {
    setPolicyTermAmounts((prevPolicyTermAmounts) => {
      const newBaseTerm = Math.max(currentPolicyTerm - decrementValue, minValue); 
  
      const updatedTerms = allBenefitData.reduce((lookhupAccumulator, benefit) => {
        const maxTerm = benefit.options.benefitPeriod.maximum;
        const minTerm = benefit.options.benefitPeriod.minimum;
        const currentTerm = prevPolicyTermAmounts[benefit.coverageLookup] || minTerm;
  
        if (newBaseTerm < maxTerm) {
          lookhupAccumulator[benefit.coverageLookup] = Math.max(newBaseTerm, minTerm);
        } else {
          lookhupAccumulator[benefit.coverageLookup] = maxTerm;
        }
  
        return lookhupAccumulator;
      }, {});
  
      return { ...prevPolicyTermAmounts, ...updatedTerms };
    });
  };

  const handleAcceltermChange = (e, benefit, childKey) => {
    const { checked, value } = e.target;

    // setCheckedBenefits((prev) => ({
    //   ...prev,
    //   [name]: checked,
    // }));
  
    const childMapping = {
       child1 : "firstChildInsured",
       child2: "secondChildInsured",
       child3: "thirdChildInsured",
       child4: "fourthChildInsured",
       child5: "fifthChildInsured"
    };
  
    setCheckedBenefits((prevCheckedBenefits) => {
      let updatedCheckedBenefits = { ...prevCheckedBenefits };
  
      if (childKey) {
        updatedCheckedBenefits[childKey] = {
          ...updatedCheckedBenefits[childKey],
          [value]: checked,
        };
  
        if (benefit.compulsoryCoverageLookup?.length > 0) {
          benefit.compulsoryCoverageLookup.forEach((compulsoryCoverage) => {
            const [childKeyPart, coveragePart] = compulsoryCoverage.split('_');
            const mappedChildKey = childMapping[childKeyPart] || childKeyPart; // Map if present, fallback to original
            if (mappedChildKey && coveragePart) {
              updatedCheckedBenefits[mappedChildKey] = {
                ...updatedCheckedBenefits[mappedChildKey],
                [coveragePart]: checked,
              };
            }
          });
        }
      } else {
        updatedCheckedBenefits = {
          ...prevCheckedBenefits,
          [value]: checked,
        };
  
        if (benefit.compulsoryCoverageLookup?.length > 0) {
          benefit.compulsoryCoverageLookup.forEach((compulsoryCoverage) => {
            const [childKeyPart, coveragePart] = compulsoryCoverage.split('_');
            const mappedChildKey = childMapping[childKeyPart] || childKeyPart; // Map if present, fallback to original
            if (checked && mappedChildKey && coveragePart) {
              updatedCheckedBenefits[mappedChildKey] = {
                ...updatedCheckedBenefits[mappedChildKey],
                [coveragePart]: true,
              };
            }
            if (!checked && mappedChildKey && coveragePart) {
              updatedCheckedBenefits[mappedChildKey] = {
                ...updatedCheckedBenefits[mappedChildKey],
                [coveragePart]: false,
              };
            }
          });
        }
      }
  
      return updatedCheckedBenefits;
    });
  
    // Optional: Clear coverage values if not checked
    // if (!checked) {
    //   clearCoverageValues(benefit.coverageLookup);
    // }
  };
  
  
  const clearCoverageValues = (coverageLookup) => {
    setCoverageAmounts((prevCoverageAmounts) => {
      const newCoverageAmounts = { ...prevCoverageAmounts };
      delete newCoverageAmounts[coverageLookup]; 
      return newCoverageAmounts;
    });
  
    setPolicyTermAmounts((prevPolicyTermAmounts) => {
      const newPolicyTermAmounts = { ...prevPolicyTermAmounts };
      delete newPolicyTermAmounts[coverageLookup];
      return newPolicyTermAmounts;
    });
  
    setCalculatedData((prevCalculatedData) => prevCalculatedData.filter((item) => item.coverageLookup !== coverageLookup));
  };

  const variables = {
    base: 'basic_plan',
    ider: 'ider',
    fpur: 'fpur',
    fdcr: 'fdcr',
  };

const evaluateExpression = (expression, lookupValue) => {
  try {
    let evalString = expression.replace(/base/g, coverageAmounts['base'] || basicPlanAmount || 0);
    Object.keys(coverageAmounts).forEach(key => {
        evalString = evalString.replace(new RegExp(key, 'g'), coverageAmounts[key] || 0);
    });
    return eval(evalString);
  } catch (error) {
      console.error("Error evaluating expression: ", expression, error);
      return lookupValue || 0; 
  }
};
  
  const generateIllustrationHandle = async (values) =>{
    console.log("BenefitValues-->",values)

      // setLoader(true)
    // setFormState(values);
    console.log("setCalculate ", calculate);
    console.log("generateIllustration 1", generateIllustration);


    if (calculate === false || calculate === undefined || calculate === "") {
      setLoader(false)
      var alertIs= "Please calculate premium "
      setProposalNumber(alertIs)
      setModalShow(true)
    } else {
       const  setGenerateIllustrationFlag = true

      setGenerateIllustration(setGenerateIllustrationFlag)

      const sessionPlanCode = sessionStorage.getItem('planCode');
      console.log("sessionPlanCode", sessionPlanCode);


          if (!getExistedSQSID && !getExistedRiderID){
            var currentdate = new Date();
            var sqsID = "SQS" + currentdate.getDate() + "" + (currentdate.getMonth() + 1) + currentdate.getFullYear() + currentdate.getHours() + "" + currentdate.getMinutes() + currentdate.getSeconds() + currentdate.getMilliseconds();
            console.log("SQS is :::" + sqsID);
            setSQSID(sqsID)
            sessionStorage.setItem("sqsID", sqsID);
            
            var riderID = "RI" + currentdate.getDate() + "" + (currentdate.getMonth() + 1) + currentdate.getFullYear() + currentdate.getHours() + "" + currentdate.getMinutes() + currentdate.getSeconds() + currentdate.getMilliseconds();
            console.log("Rider is :::" + riderID);
            setRiderID(riderID)
            sessionStorage.setItem("riderID", riderID);

            var revisedMonth = "";
            var revisedDate = "";
            var revisedHrs = "";
            var revisedMinutes = "";
            var revisedSec = "";

            var month = currentdate.getMonth();
            month = month + 1;
            var dayofMonth = currentdate.getDate();
            var year = currentdate.getFullYear();
            revisedMonth = (month < 10) ? revisedMonth = "0" + month : (revisedMonth += month);
            revisedDate = (dayofMonth < 10) ? revisedDate = "0" + dayofMonth : (revisedDate += dayofMonth);

            var currentHrs = currentdate.getHours();
            revisedHrs = (currentHrs < 10) ? revisedHrs = "0" + currentHrs : (revisedHrs += currentHrs);
            var currentMinutes = currentdate.getMinutes();
            revisedMinutes = (currentMinutes < 10) ? revisedMinutes = "0" + currentMinutes : (revisedMinutes += currentMinutes);

            var currentSec = currentdate.getSeconds();
            revisedSec = (currentSec < 10) ? revisedSec = "0" + currentSec : (revisedSec += currentSec);

            var calculatedTime = revisedMonth + "-" + revisedDate + "-" + year + " " + revisedHrs + ":" + revisedMinutes + ":" + revisedSec;
            console.log("shubham is in calculatedTime is -->" + calculatedTime);

            
            var ProductChoiceData = {
              "sqs_id": sqsID,
              "client_id": getClientID,
              "quoteGeneration": true,
              // "premium":totalPremiumIs.premiumAmount,
              // "creationDate":calculatedTime
              "payment": {
                "paymentFrequency": values.paymentFrequency,
                "paymentMode": values.paymentMode,
                "paymentTerm": values.paymentTerm
              },
              "policyDetails": {
                "productName": values.planName, 
                "productType": values.productName,
                "productCode": sessionPlanCode,
                "premium": "Number",
                "sumAssured": coverageAccelterm,
                "accountBalance": "String",
                "applicationType": "String"
              }
          }  

            // const selectedCoverages = allBenefitData.map(benefit => {
            //   if (checkedBenefits[benefit.coverageLookup]) {
            //     const isBase = checkedBenefits[benefit.coverageLookup] === "base";

            //     return {
            //       bri: "B"+ riderID + Math.floor(Math.random() * 10),
            //       benefitAmount: {
            //         // riderValue: evaluateExpression(benefit.benefitAmount.benefitAmountDependent.minimum, benefit.coverageLookup),
            //         riderValue: isBase 
            //         ? (coverageAmounts[benefit.coverageLookup] || benefit.benefitAmount.benefitAmountDependent.minimum || benefit.benefitAmount.benefitAmountRange.minimum)
            //         : evaluateExpression(benefit.benefitAmount.benefitAmountDependent.minimum, benefit.coverageLookup),
            //         riderPremium: calculatedData 
            //       },
            //       riderName: benefit.coverageLookup,
            //       benefitPeriod: {
            //         riderTerm: policyTermAmounts[benefit.coverageLookup] || benefit.options.benefitPeriod.minimum,
            //         riderExpiryAge: 65,
            //         ageToRetire: 60
            //       }
            //     };
            //   }
            //   return null;
            // }).filter(item => item !== null);

            const selectedCoverages = allBenefitData
              .map((benefit) => {
                console.log("Processing benefit:", benefit.coverageLookup);
                if (checkedBenefits[benefit.coverageLookup]) {
                  // const isBase = checkedBenefits[benefit.coverageLookup] === "base";
                  const isBase = benefit.coverageLookup === "base";

                  console.log("Is base:", isBase);

                  const riderValue = isBase
                    ? (coverageAmounts[benefit.coverageLookup] ||
                        benefit.benefitAmount.benefitAmountDependent.minimum ||
                        benefit.benefitAmount.benefitAmountRange.minimum)
                    : evaluateExpression(benefit.benefitAmount.benefitAmountDependent.minimum, benefit.coverageLookup);

                  console.log("Rider Value:", riderValue);

                  return {
                    bri: "B" + riderID + Math.floor(Math.random() * 10),
                    benefitAmount: {
                      riderValue,
                      riderPremium: calculatedData, 
                    },
                    riderName: benefit.coverageLookup,
                    benefitPeriod: {
                      riderTerm: policyTermAmounts[benefit.coverageLookup] || benefit.options.benefitPeriod.minimum,
                      riderExpiryAge: 65,
                      ageToRetire: 60,
                    },
                  };
                }
                return null;
              })
              .filter((item) => item !== null);

            console.log("Selected Coverages:", selectedCoverages);


            
            const selectedSpouseCoverages = allSpouseBenefitData.map(benefit => {
              if (checkedBenefits[benefit.coverageLookup]) {
                return {
                  bri: "B"+ riderID + Math.floor(Math.random() * 10),
                  benefitAmount: {
                    riderValue: coverageAmounts[benefit.coverageLookup] || benefit.benefitAmount.benefitAmountRange.minimum,
                    riderPremium: calculatedData 
                  },
                  riderName: benefit.coverageLookup,
                  benefitPeriod: {
                    riderTerm: policyTermAmounts[benefit.coverageLookup] || benefit.options.benefitPeriod.minimum,
                    riderExpiryAge: 65,  
                    ageToRetire: 60 
                  }
                };
              }
              return null;
            }).filter(item => item !== null);

            const childrenKeys = [
              'firstChildInsured',
              'secondChildInsured',
              'thirdChildInsured',
              'fourthChildInsured',
              'fifthChildInsured'
            ];
            
            const selectedChildCoverages = Object.keys(allChildBenefitData).reduce((acc, childKey, index) => {
              const childBenefits = allChildBenefitData[childKey];
              
              const childInsuredData = childBenefits.map((benefit) => {
                if (checkedBenefits[childKey]?.[benefit.coverageLookup]) {
                  return {
                    bri: "C" + riderID + Math.floor(Math.random() * 10), 
                    benefitAmount: {
                      riderValue: evaluateExpression(
                        benefit.benefitAmount.benefitAmountDependent.minimum, 
                        benefit.coverageLookup
                      ),
                      riderPremium: calculatedData 
                    },
                    riderName: benefit.coverageLookup,
                    benefitPeriod: {
                      riderTerm: policyTermAmounts[benefit.coverageLookup] || benefit.options.benefitPeriod.minimum,
                      riderExpiryAge: 65,
                      ageToRetire: 60
                    }
                  };
                }
                return null;
              }).filter(item => item !== null); 
            
              acc[childrenKeys[index]] = {
                insuredName: childKey, 
                coverages: childInsuredData 
              };
              
              return acc;
            }, {});

            console.log("allTotalPremiumData",allTotalPremiumData)     
            console.log("totalPremiumData",totalPremiumData)   
            
            const BenefitSelectionData = {
              rider_id: riderID,
              sqs_id: sqsID,
              client_id: getClientID,
              calculationDone: true,
              primaryInsured: {
                coverages: selectedCoverages
              },
              spouseInsured: {
                coverages: selectedSpouseCoverages
              },
              childInsured: {
                coverages: selectedChildCoverages
              },
              totalPremiumData: totalPremiumData, 
              allTotalPremiumData: allTotalPremiumData 
            };

            console.log("BenefitSelectionData-->", BenefitSelectionData)
              
                await saveDetail('al_sqs_details', ProductChoiceData);
                console.log("ProductChoiceData saved successfully");
          
                await saveDetail('al_rider_details', BenefitSelectionData);
                console.log("BenefitSelectionData saved successfully")
                setCalculationDone(true)

                navigate('/quotationoutput')
                
            // if (navigator.onLine) {    
              //     try {
              //         await saveToBackend(ProductChoiceData, BenefitSelectionData);
              //         console.log("Data sent to backend successfully");
              //     } catch (error) {
              //         console.error("Failed to send data to backend:", error);
              //     }
              // } else {
              //     console.log("Data will be synced when online.");
              // }
          //  }

              }
              else{

                ///nrew
                var ProductChoiceData = {
                  "sqs_id": getExistedSQSID,
                  "client_id": getClientID,
                  "quoteGeneration": true,
                  // "premium":totalPremiumIs.premiumAmount,
                  // "creationDate":calculatedTime
                  "payment": {
                    "paymentFrequency": values.paymentFrequency,
                    "paymentMode": values.paymentMode,
                    "paymentTerm": "Number"
                  },
                  "policyDetails": {
                    "productName": values.planName, 
                    "productType": values.productName,
                    "productCode": sessionPlanCode,
                    "premium": "Number",
                    "sumAssured": coverageAccelterm,
                    "accountBalance": "String",
                    "applicationType": "String"
                  }
              }  
    
                // const selectedCoverages = allBenefitData.map(benefit => {
                //   if (checkedBenefits[benefit.coverageLookup]) {
                //     const isBase = checkedBenefits[benefit.coverageLookup] === "base";
    
                //     return {
                //       bri: "B"+ riderID + Math.floor(Math.random() * 10),
                //       benefitAmount: {
                //         // riderValue: evaluateExpression(benefit.benefitAmount.benefitAmountDependent.minimum, benefit.coverageLookup),
                //         riderValue: isBase 
                //         ? (coverageAmounts[benefit.coverageLookup] || benefit.benefitAmount.benefitAmountDependent.minimum || benefit.benefitAmount.benefitAmountRange.minimum)
                //         : evaluateExpression(benefit.benefitAmount.benefitAmountDependent.minimum, benefit.coverageLookup),
                //         riderPremium: calculatedData 
                //       },
                //       riderName: benefit.coverageLookup,
                //       benefitPeriod: {
                //         riderTerm: policyTermAmounts[benefit.coverageLookup] || benefit.options.benefitPeriod.minimum,
                //         riderExpiryAge: 65,
                //         ageToRetire: 60
                //       }
                //     };
                //   }
                //   return null;
                // }).filter(item => item !== null);

                const riderID = sessionStorage.getItem('riderID')
                console.log("riderID-->",riderID)

              const updatedCheckedBenefits = {
                ...checkedBenefits,
                base: true, // Add `base` as checked by default
              };

              // Filter and map selected coverages
              // const selectedCoverages = allBenefitData
              //   .filter(benefit => updatedCheckedBenefits[benefit.coverageLookup])
              //   .map(benefit => {
              //     const riderValue = 
                  
              //       coverageAmounts[benefit.coverageLookup] !== null 
              //         ? coverageAmounts[benefit.coverageLookup] 
              //         : benefit.benefitAmount.benefitAmountDependent?.minimum || 
              //           benefit.benefitAmount.benefitAmountRange?.minimum; 

              //     return {
              //       bri: "B" + riderID + Math.floor(Math.random() * 10), 
              //       benefitAmount: {
              //         riderValue, // Assign the calculated riderValue
              //         riderPremium: calculatedData.find(item => item.coverageLookup === benefit.coverageLookup)?.PremiumAmount || 0
              //       },
              //       riderName: benefit.coverageLookup, // Name of the rider
              //       benefitPeriod: {
              //         riderTerm: policyTermAmounts[benefit.coverageLookup] || benefit.options.benefitPeriod.minimum,
              //         riderExpiryAge: 65, // Default expiry age
              //         ageToRetire: 60 // Default retirement age
              //       }
              //     };
              //   });

                const selectedCoverages = allBenefitData
                .filter(benefit => updatedCheckedBenefits[benefit.coverageLookup])
                .map(benefit => {
                  // Calculate riderValue
                  const riderValue = 
                    coverageAmounts[benefit.coverageLookup] !== undefined 
                      ? coverageAmounts[benefit.coverageLookup] 
                      : benefit.riderValue || 
                        benefit.benefitAmount.benefitAmountDependent?.minimum || 
                        benefit.benefitAmount.benefitAmountRange?.minimum;
              
                  // Calculate riderTerm
                  const riderTerm = 
                    policyTermAmounts[benefit.coverageLookup] !== undefined 
                      ? policyTermAmounts[benefit.coverageLookup] 
                      : benefit.riderTerm || 
                        benefit.options.benefitPeriod?.minimum;
              
                  return {
                    bri: "B" + riderID + Math.floor(Math.random() * 10), 
                    benefitAmount: {
                      riderValue, // Assign the calculated riderValue
                      riderPremium: calculatedData.find(item => item.coverageLookup === benefit.coverageLookup)?.PremiumAmount || 0
                    },
                    riderName: benefit.coverageLookup, // Name of the rider
                    benefitPeriod: {
                      riderTerm, // Assign the calculated riderTerm
                      riderExpiryAge: 65, // Default expiry age
                      ageToRetire: 60 // Default retirement age
                    }
                  };
                });
              


                const selectedSpouseCoverages = allSpouseBenefitData.map(benefit => {
                  if (checkedBenefits[benefit.coverageLookup]) {
                    return {
                      bri: "B"+ riderID + Math.floor(Math.random() * 10),
                      benefitAmount: {
                        riderValue: coverageAmounts[benefit.coverageLookup] || benefit.benefitAmount.benefitAmountRange.minimum,
                        riderPremium: calculatedData 
                      },
                      riderName: benefit.coverageLookup,
                      benefitPeriod: {
                        riderTerm: policyTermAmounts[benefit.coverageLookup] || benefit.options.benefitPeriod.minimum,
                        riderExpiryAge: 65,  
                        ageToRetire: 60 
                      }
                    };
                  }
                  return null;
                }).filter(item => item !== null);
    
                const childrenKeys = [
                  'firstChildInsured',
                  'secondChildInsured',
                  'thirdChildInsured',
                  'fourthChildInsured',
                  'fifthChildInsured'
                ];
                
                const selectedChildCoverages = Object.keys(allChildBenefitData).reduce((acc, childKey, index) => {
                  const childBenefits = allChildBenefitData[childKey];
                  
                  const childInsuredData = childBenefits.map((benefit) => {
                    if (checkedBenefits[childKey]?.[benefit.coverageLookup]) {
                      return {
                        bri: "C" + riderID + Math.floor(Math.random() * 10), 
                        benefitAmount: {
                          riderValue: evaluateExpression(
                            benefit.benefitAmount.benefitAmountDependent.minimum, 
                            benefit.coverageLookup
                          ),
                          riderPremium: calculatedData 
                        },
                        riderName: benefit.coverageLookup,
                        benefitPeriod: {
                          riderTerm: policyTermAmounts[benefit.coverageLookup] || benefit.options.benefitPeriod.minimum,
                          riderExpiryAge: 65,
                          ageToRetire: 60
                        }
                      };
                    }
                    return null;
                  }).filter(item => item !== null); 
                
                  acc[childrenKeys[index]] = {
                    insuredName: childKey, 
                    coverages: childInsuredData 
                  };
                  
                  return acc;
                }, {});
    
                console.log("allTotalPremiumData",allTotalPremiumData)     
                console.log("totalPremiumData",totalPremiumData)  

                const BenefitSelectionData = {
                  rider_id: getExistedRiderID,
                  sqs_id: getExistedSQSID,
                  client_id: getClientID,
                  calculationDone: true,
                  primaryInsured: {
                    coverages: selectedCoverages
                  },
                  spouseInsured: {
                    coverages: selectedSpouseCoverages
                  },
                  childInsured: {
                    coverages: selectedChildCoverages
                  },
                  totalPremiumData: totalPremiumData, 
                  allTotalPremiumData: allTotalPremiumData 
                };

                await updateDetailById('al_sqs_details', getExistedSQSID, ProductChoiceData);
                console.log("ProductChoiceData updated successfully");
                
                console.log("BenefitSelectionData-->",BenefitSelectionData)
                await updateDetailById('al_rider_details', getExistedRiderID, BenefitSelectionData);
                console.log("BenefitSelectionData updated successfully");
                setCalculationDone(true)

                navigate('/quotationoutput')

              } 
         }         
  } 

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
        document.body.classList.add("ios-safearea");
      } else {
        document.body.classList.remove("ios-safearea");
      }
  
  return (
    <SidebarLayout>
      <div className="benefit-container px-0 px-sm-4">
             <div className="main-background-image-container"></div>
             <div className="benefitform">
                <Form onSubmit={formik.handleSubmit} className="main-form-container">

                <div className="row">
                    <div className="col-sm-3">
                      {/* <h5 className="headerFont">Product Choice</h5> */}
                    </div>
                  </div>
                  <div className="form-group px-3 px-sm-5">
                      <div className="row">
                        <div className="col-12 col-sm-4 pt-3">
                            <Form.Group controlId="productName"> 
                              <div style={{ textAlign: "left" }}>
                                <Form.Label>Products <span className="text-danger"> *</span></Form.Label>
                              </div>
                              <Form.Control
                              as="select"
                                name="productName"
                                onChange={handleProductChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.productName}
                              >
                                <option value="">Please Select</option>
                                {uniqueProducts.map((product, index) => (
                                  <option key={index} value={product.category}>
                                    {product.category}
                                  </option>
                                ))}
                              </Form.Control>
                              <Form.Text className="text-danger">
                                {formik.touched.productName && formik.errors.productName ? (
                                  <div className="text-danger">{formik.errors.productName}</div>
                                ) : null}
                              </Form.Text>
                            </Form.Group>
                        </div>

                        <div className="col-12 col-sm-4 pt-3">
                            <Form.Group controlId="planName">
                            <div style={{ textAlign: "left" }}>
                              <Form.Label>Plan Name<span className="text-danger"> *</span></Form.Label>
                            </div>
                            <Form.Control
                              name="planName"
                              as="select"
                              onChange={handlePlanChange}
                              onBlur={formik.handleBlur}
                              value={formik.values.planName}
                            >
                              <option value="">Please Select</option>
                              {getSQSID
                                ?
                                products.filter((product) => product.category === formik.values.productName)
                                .map((product, index) => (
                                  <option key={index} value={product.planName}>
                                    {product.planName} (PlanCode: {product.planCode})
                                  </option>
                                ))
                                : filteredPlans.map((plan, index) => (
                                    <option key={index} value={plan.planName}>
                                      {plan.planName} (PlanCode: {plan.planCode})
                                    </option>
                                  ))
                                }
                            </Form.Control>
                            <Form.Text className="text-danger">
                              {formik.touched.planName && formik.errors.planName ? (
                                <div className="text-danger">{formik.errors.planName}</div>
                              ) : null}
                            </Form.Text>
                          </Form.Group>
                        </div>

                        <div className="col-12 col-sm-4 pt-3">
                          <Form.Group controlId="paymentFrequency">
                          <div style={{ textAlign:"left" }}>
                            <Form.Label>Payment Frequency <span className="text-danger"> *</span></Form.Label>
                          </div>
                          <Form.Control
                            name="paymentFrequency"
                            as="select"
                            onChange={e => {
                              formik.handleChange(e); 
                              setCalculate(false); 
                              setPaymentFrequencyValue(e.target.value); 
                              handleBenefitSelection(e); 
                            }}
                            value={formik.values.paymentFrequency}
                            onBlur={formik.handleBlur} 
                          >
                            <option value="">Please Select</option>
                            {paymentFrequencies.map((frequency, index) => (
                              <option key={index} value={frequency}>
                                {frequencyOptions[frequency] || frequency}
                              </option>
                            ))}
                          </Form.Control>
                          <Form.Text className="text-danger">
                            {formik.touched.paymentFrequency && formik.errors.paymentFrequency ? (
                              <div className="text-danger">{formik.errors.paymentFrequency}</div>
                            ) : null}
                          </Form.Text>
                        </Form.Group>
                        </div>

                        <div className="col-12 col-sm-3 pt-3">
                        </div>
                      </div>
                      <hr />

                    {/*  <div className="row">
                        <div className="col-sm-4">
                          <h3 className="headerFont">Benefit Selection</h3>
                        </div>
                      </div>
                      <hr/> */}


                    <div className="accordion">
                      <AccordionItem
                            title="Life A: Proposed Insured Details" 
                            isOpen={openItem.includes('lifeA')}
                            onClick={() => handleAccordionClick('lifeA')}
                            disabled={isApplicationTypeNullOrEmpty}
                              >
                              {/* <h3>Single Life</h3>         */}       
                  { Array.isArray(allBenefitData) && allBenefitData.length > 0 ? (
                    allBenefitData.map((benefit, index) => (
                      benefit.Visibility !== 'N' && (
                      <div key={index} className="col-12 col-sm-12 pt-4">
                        <Form.Group controlId={`benefitCheckbox_${index}`}>
                          <Form.Check
                            type="checkbox"
                            id={`benefitCheckbox_${index}`}
                            name={benefit.coverageLookup}
                            label={benefit.coverageLookup}
                            value={benefit.coverageLookup}
                            onChange={(e) => handleAcceltermChange(e, benefit)}
                            // checked={checkedBenefits[benefit.coverageLookup] || false}
                            checked={benefit.coverageLookup === "base" ? true : (checkedBenefits[benefit.coverageLookup] || false)}
                            disabled={benefit.coverageLookup === "base"} 
                          />
                        </Form.Group>

                        {/* {(checkedBenefits[benefit.coverageLookup] || benefit.compulsoryCoverageLookup?.some(cov => checkedBenefits[cov])) && ( */}

                        {(benefit.coverageLookup === "base" || checkedBenefits[benefit.coverageLookup])&& (
                          <div className="row" key={`acceltermUI_${index}`}>
                            <div className="col-12 col-sm-4 pt-4">
                              <Form.Group controlId={`coverageAccelterm_${index}`}>
                                <div style={{ textAlign: 'left' }}>
                                  <Form.Label className="prodSelect">Coverage for {benefit.coverageLookup}</Form.Label>
                                </div>                              
                                <div className="d-flex align-items-center">
                                  {benefit.coverageLookup === "base" ? (
                                    <>
                                      <Button
                                        variant="secondary"
                                        className="col-2 col-sm-2"
                                        onClick={() =>
                                          decrementCoverageAccelterm(
                                            // benefit.coverageLookup,
                                            // benefit.benefitAmount.benefitAmountRange.increment,
                                            // coverageAmounts[benefit.coverageLookup] || benefit.benefitAmount.benefitAmountRange.minimum,
                                            // benefit.benefitAmount.benefitAmountRange.minimum

                                            benefit.coverageLookup,
                                            benefit.benefitAmount.benefitAmountRange.increment,
                                            coverageAmounts[benefit.coverageLookup] ??
                                            benefit.riderValue ??
                                            benefit.benefitAmount.benefitAmountRange.minimum,
                                            benefit.benefitAmount.benefitAmountRange.minimum
                                          )
                                        }
                                      >
                                        -
                                      </Button>
                                      <Form.Control
                                        type="text"
                                        className="col-8 col-sm-8"
                                        // value={coverageAmounts[benefit.coverageLookup] || benefit.benefitAmount.benefitAmountDependent.minimum || benefit.benefitAmount.benefitAmountRange.minimum }
                                        value={
                                          // benefit.riderValue ||
                                          // coverageAmounts[benefit.coverageLookup] ||
                                          // benefit.benefitAmount.benefitAmountDependent.minimum ||
                                          // benefit.benefitAmount.benefitAmountRange.minimum

                                          coverageAmounts[benefit?.coverageLookup] || 
                                          benefit.riderValue || 
                                          benefit.benefitAmount.benefitAmountDependent.minimum ||
                                          benefit.benefitAmount.benefitAmountRange.minimum
                                        }
                                        
                                        // onChange={(e) => setCoverageAmounts((prev) => ({
                                        //   ...prev,
                                        //   [benefit.coverageLookup]: e.target.value
                                        // }))}
                                        readOnly
                                        style={{ width: '170px', textAlign: 'center', backgroundColor: "#fff"}}
                                      />
                                      <Button
                                        variant="secondary"
                                        className="col-2 col-sm-2"
                                        onClick={() =>
                                          incrementCoverageAccelterm(
                                            // benefit.coverageLookup,
                                            // benefit.benefitAmount.benefitAmountRange.increment,
                                            // coverageAmounts[benefit.coverageLookup] || 
                                            // benefit.riderValue ||
                                            // benefit.benefitAmount.benefitAmountRange.minimum,
                                            // benefit.benefitAmount.benefitAmountRange.maximum

                                            benefit.coverageLookup,
                                            benefit.benefitAmount.benefitAmountRange.increment,
                                            coverageAmounts[benefit.coverageLookup] ??
                                            benefit.riderValue ??
                                            benefit.benefitAmount.benefitAmountRange.minimum,
                                            benefit.benefitAmount.benefitAmountRange.maximum
                                          )
                                        }
                                      >
                                        +
                                      </Button>
                                    </>
                                  ) : (
                                    <Form.Control
                                      type="text"
                                      className="col-12 col-sm-8"
                                      // value={evaluateExpression(benefit.benefitAmount.benefitAmountDependent.minimum, benefit.coverageLookup )}
                                      value={
                                        // benefit.riderValue ||
                                        // evaluateExpression(
                                        //   benefit.benefitAmount.benefitAmountDependent.minimum,
                                        //   benefit.coverageLookup
                                        // )

                                        coverageAmounts[benefit.coverageLookup] ||
                                        benefit.riderValue ||
                                        evaluateExpression(
                                          benefit.benefitAmount.benefitAmountDependent.minimum,
                                          benefit.coverageLookup
                                        )
                                      }
                                      readOnly
                                      style={{ width: '170px', textAlign: 'center', backgroundColor: "#fff"}}
                                    />

                                  )}
                                </div>

                              </Form.Group>
                            </div>

                            <div className="col-12 col-sm-4 pt-4">
                              <Form.Label className="prodSelect">Policy Term for {benefit.coverageLookup}</Form.Label>
                              <div className="d-flex align-items-center">
                                {benefit.coverageLookup === 'base' && (
                                  <>
                                    <Button
                                      variant="secondary"
                                      className="col-2 col-sm-2"
                                      onClick={() =>
                                        decrementPolicyTermAccelterm(
                                          benefit.coverageLookup,
                                          1,
                                          policyTermAmounts[benefit.coverageLookup] || benefit.options.benefitPeriod.minimum,
                                          benefit.options.benefitPeriod.minimum
                                        )
                                      }
                                    >
                                      -
                                    </Button>
                                    <Form.Control
                                      type="text"
                                      className="col-8 col-sm-8"
                                      // value={(policyTermAmounts[benefit.coverageLookup] || benefit.options.benefitPeriod.minimum).toLocaleString()}
                                      value={
                                        policyTermAmounts[benefit.coverageLookup] ??
                                        benefit.riderTerm ?? 
                                        benefit.options.benefitPeriod.minimum
                                      }
                                      readOnly
                                      style={{ width: '170px', textAlign: 'center', backgroundColor: "#fff"}}
                                    />
                                    <Button
                                      variant="secondary"
                                      className="col-2 col-sm-2"
                                      onClick={() =>
                                        incrementPolicyTermAccelterm(
                                          // benefit.coverageLookup,
                                          // 1, 
                                          // policyTermAmounts[benefit.coverageLookup] || benefit.options.benefitPeriod.minimum,
                                          // benefit.options.benefitPeriod.maximum

                                          benefit.coverageLookup,
                                          1, 
                                          policyTermAmounts[benefit.coverageLookup] ??
                                          benefit.riderTerm ??
                                          benefit.options.benefitPeriod.minimum,
                                          benefit.options.benefitPeriod.maximum
                                        )
                                        
                                      }
                                    >
                                      +
                                    </Button>
                                  </>
                                )}
                                {benefit.coverageLookup !== 'base' && (
                                  <Form.Control
                                    type="text"
                                    className="col-12 col-sm-8"
                                    // value={(policyTermAmounts[benefit.coverageLookup] || benefit.options.benefitPeriod.minimum).toLocaleString()}
                                    value={
                                      policyTermAmounts[benefit.coverageLookup] ?? 
                                      benefit.riderTerm ?? 
                                      benefit.options.benefitPeriod.minimum
                                    }
                                    readOnly
                                    style={{ width: '170px', textAlign: 'center', backgroundColor: "#fff"}}
                                  />
                                )}
                              </div>
                            </div>

                            <div className="col-12 col-sm-4 pt-4">
                              <Form.Label className="prodSelect">Premium for {benefit.coverageLookup}</Form.Label>
                              <Table bordered hover className="mobilewidth">
                                <tbody>
                                  {calculatedData.length > 0 ? (
                                  <tr style={{ fontSize:'15px'}}>
                                    <td>
                                      {/* {Math.round(
                                        (calculatedData.find(
                                          item => item.coverageLookup === benefit.coverageLookup
                                        )?.premiumAmount || 0) * 100) / 100} */}
                                     Rs. {Math.round(
                                        (calculatedData.find(
                                          item => item.coverageLookup === benefit.coverageLookup
                                        )?.PremiumAmount || 0) * 100
                                      ) / 100}
                                    </td> 
                                  </tr>
                                ) : (
                                  <tr>
                                    <td colSpan="1" className="notFoudProd">Rs. Premium </td>
                                  </tr>
                                )}
                                </tbody>
                              </Table>
                            </div>

                            <div className="col-12">
                              <hr />
                            </div>
                          </div>
                        )}
                        
                      </div>
                      )
                    ))
                ) : (
                  <p>No Primary benefit data available</p> 
                )}
                    </AccordionItem>

                      <AccordionItem
                                            title="Life B: Proposed Insured Details"
                                            isOpen={openItem.includes('lifeB')}
                                            onClick={() => handleAccordionClick('lifeB')}
                                            disabled={isApplicationTypeNullOrEmpty || ApplicationType === 'Single Life'}
                                              >
                              {getApplicationState === "Joint Life" && (
                                  <div>
                                  {/* <hr></hr> */}
                                          {/* <h3>Joint Life</h3> */}
                                    {Array.isArray(allSpouseBenefitData) && allSpouseBenefitData.length > 0 ? (
                                      allSpouseBenefitData.map((benefit, index) =>
                                        benefit.Visibility !== 'N' && (
                                          <div key={index} className="col-12 col-sm-12 pt-4">
                                            <Form.Group controlId={`benefitSpouseCheckbox_${index}`}>
                                              <Form.Check
                                                type="checkbox"
                                                id={`benefitSpouseCheckbox_${index}`}
                                                name={benefit.coverageLookup}
                                                label={benefit.coverageLookup}
                                                value={benefit.coverageLookup}
                                                onChange={(e) => handleAcceltermChange(e, benefit)}
                                                // checked={benefit.isChecked !== undefined ? benefit.isChecked : undefined}
                                                checked={checkedBenefits[benefit.coverageLookup] || false}
                                              />
                                            </Form.Group>

                                            {checkedBenefits[benefit.coverageLookup] && (
                                              <div className="row" key={`acceltermUI_${index}`}>
                                                <div className="col-12 col-sm-4 pt-4">
                                                  <Form.Group controlId={`coverageAccelterm_${index}`}>
                                                    <div style={{ textAlign: 'left' }}>
                                                      <Form.Label className="prodSelect">
                                                        Coverage for {benefit.coverageLookup}
                                                      </Form.Label>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                      {benefit.coverageLookup === "base" ? (
                                                        <>
                                                          <Button
                                                            variant="secondary"
                                                            className="col-2 col-sm-2"
                                                            onClick={() =>
                                                              decrementCoverageAccelterm(
                                                                benefit.coverageLookup,
                                                                benefit.benefitAmount.benefitAmountRange.increment,
                                                                coverageAmounts[benefit.coverageLookup] ||
                                                                  benefit.benefitAmount.benefitAmountRange.minimum,
                                                                benefit.benefitAmount.benefitAmountRange.minimum
                                                              )
                                                            }
                                                          >
                                                            -
                                                          </Button>
                                                          <Form.Control
                                                            type="text"
                                                            className="col-8 col-sm-8"
                                                            value={coverageAmounts[benefit.coverageLookup] || benefit.benefitAmount.benefitAmountDependent.minimum || benefit.benefitAmount.benefitAmountRange.minimum}
                                                            readOnly
                                                            style={{ width: '170px', textAlign: 'center', backgroundColor: "#fff"}}
                                                          />
                                                          <Button
                                                            variant="secondary"
                                                            className="col-2 col-sm-2"
                                                            onClick={() =>
                                                              incrementCoverageAccelterm(
                                                                benefit.coverageLookup,
                                                                benefit.benefitAmount.benefitAmountRange.increment,
                                                                coverageAmounts[benefit.coverageLookup] ||
                                                                  benefit.benefitAmount.benefitAmountRange.minimum,
                                                                benefit.benefitAmount.benefitAmountRange.maximum
                                                              )
                                                            }
                                                          >
                                                            +
                                                          </Button>
                                                        </>
                                                      ) : (
                                                        <Form.Control
                                                          type="text"
                                                          className="col-12 col-sm-8"
                                                          // value={evaluateExpression(coverageAmounts[benefit.coverageLookup] || benefit.riderValue || benefit.benefitAmount.benefitAmountRange.minimum)}
                                                          value={
                                                            coverageAmounts[benefit.coverageLookup] ??
                                                            benefit.riderValue ??
                                                            evaluateExpression(
                                                              benefit.benefitAmount.benefitAmountDependent.minimum,
                                                              benefit.coverageLookup
                                                            )
                                                          }
                                                          readOnly
                                                          style={{ width: '170px', textAlign: 'center', backgroundColor: "#fff"}}
                                                        />
                                                      )}
                                                    </div>
                                                  </Form.Group>
                                                </div>

                                                <div className="col-12 col-sm-4 pt-4">
                                                  <Form.Label className="prodSelect">
                                                    Policy Term for {benefit.coverageLookup}
                                                  </Form.Label>
                                                  <div className="d-flex align-items-center">
                                                    <Form.Control
                                                      type="text"
                                                      className="col-12 col-sm-8"
                                                      value={(policyTermAmounts[benefit.coverageLookup] || benefit.options.benefitPeriod.minimum).toLocaleString()}
                                                      readOnly
                                                      style={{ width: '170px', textAlign: 'center', backgroundColor: "#fff"}}
                                                    />
                                                  </div>
                                                </div>

                                                <div className="col-12 col-sm-4 pt-4">
                                                  <Form.Label className="prodSelect">
                                                    Premium for {benefit.coverageLookup}
                                                  </Form.Label>
                                                  <Table bordered hover className="mobilewidth">
                                                    <tbody>
                                                      {calculatedData.length > 0 ? (
                                                        <tr  style={{fontSize:'15px'}}>
                                                          <td>
                                                            Rs. {(
                                                              Math.round(
                                                                (calculatedData.find(
                                                                  (item) =>
                                                                    item.coverageLookup ===
                                                                    benefit.coverageLookup
                                                                )?.PremiumAmount || 0) * 100
                                                              ) / 100
                                                            ).toLocaleString()}
                                                          </td>
                                                        </tr>
                                                      ) : (
                                                        <tr>
                                                          <td colSpan="1" className="notFoudProd">
                                                            Rs. Premium 
                                                          </td>
                                                        </tr>
                                                      )}
                                                    </tbody>
                                                  </Table>
                                                </div>

                                                <div className="col-12">
                                                  <hr />
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )
                                      )
                                    ) : (
                                      <p>No Spouse Data available</p>
                                    )}
                                  </div>
                                )}
                  </AccordionItem>

                    <AccordionItem
                                                title="Child/Children Inclusion"
                                                isOpen={openItem.includes('Child')}
                                                onClick={() => handleAccordionClick('Child')}
                                                disabled={!isChildInclusionEnabled} 
                                            >
                                {getNoOfChild !== "" && (
                                  <div>
                                    {/* <hr />
                                                  <h3>Child Life Coverage</h3> */}
                                    {Object.keys(allChildBenefitData).length > 0 ? (
                                    Object.keys(allChildBenefitData).map((childKey, index) => {
                                      const childBenefits = allChildBenefitData[childKey];

                                      return (
                                        <div key={childKey}>
                                          <h4>{childKey.replace(/([A-Z])/g, ' $1').trim()} Benefits</h4>

                                          {Array.isArray(childBenefits) && childBenefits.length > 0 ? (
                                            childBenefits.map((benefit, benefitIndex) =>
                                              benefit.Visibility !== "N" && (
                                                <div key={benefitIndex} className="col-12 col-sm-12 pt-4">
                                                  <Form.Group controlId={`benefitChildCheckbox_${childKey}_${benefitIndex}`}>
                                                    <Form.Check
                                                      type="checkbox"
                                                      id={`benefitChildCheckbox_${childKey}_${benefitIndex}`}
                                                      name={benefit.coverageLookup}
                                                      label={benefit.coverageLookup}
                                                      value={benefit.coverageLookup}
                                                      onChange={(e) => handleAcceltermChange(e, benefit, childKey)}  
                                                      // checked={checkedBenefits[benefit.coverageLookup] || false}
                                                      checked={checkedBenefits[childKey]?.[benefit.coverageLookup] || false}
                                                    />
                                                  </Form.Group>

                                                  {/* {['secondChildInsured.zier','thirdChildInsured.zier','fourthChildInsured.zier','fifthChildInsured.zier']?.some(cov => checkedBenefits[cov]) && ( */}

                                                  {checkedBenefits[childKey]?.[benefit.coverageLookup] && (  
                                                    <div className="row" key={`acceltermUI_${childKey}_${benefitIndex}`}>
                                                      <div className="col-12 col-sm-4 pt-4">
                                                        <Form.Group controlId={`coverageAccelterm_${childKey}_${benefitIndex}`}>
                                                          <div style={{ textAlign: "left" }}>
                                                            <Form.Label className="prodSelect">
                                                              Coverage for {benefit.coverageLookup}
                                                            </Form.Label>
                                                          </div>
                                                          <div className="d-flex align-items-center">
                                                            <Button
                                                              variant="secondary"
                                                              className="col-2 col-sm-2"
                                                              onClick={() =>
                                                                decrementCoverageAccelterm(
                                                                  benefit.coverageLookup,
                                                                  benefit.benefitAmount.benefitAmountRange.increment,
                                                                  coverageAmounts[benefit.coverageLookup] ||
                                                                    benefit.benefitAmount.benefitAmountRange.minimum,
                                                                  benefit.benefitAmount.benefitAmountRange.minimum
                                                                )
                                                              }
                                                            >
                                                              -
                                                            </Button>
                                                            <Form.Control
                                                              type="text"
                                                              className="col-8 col-sm-8"
                                                              value={(
                                                                coverageAmounts[benefit.coverageLookup] ||
                                                                benefit.benefitAmount.benefitAmountRange.minimum
                                                              ).toLocaleString()}
                                                              readOnly
                                                              style={{ width: '170px', textAlign: 'center', backgroundColor: "#fff"}}
                                                            />
                                                            <Button
                                                              variant="secondary"
                                                              className="col-2 col-sm-2"
                                                              onClick={() =>
                                                                incrementCoverageAccelterm(
                                                                  benefit.coverageLookup,
                                                                  benefit.benefitAmount.benefitAmountRange.increment,
                                                                  coverageAmounts[benefit.coverageLookup] ||
                                                                    benefit.benefitAmount.benefitAmountRange.minimum,
                                                                  benefit.benefitAmount.benefitAmountRange.maximum
                                                                )
                                                              }
                                                            >
                                                              +
                                                            </Button>
                                                          </div>
                                                        </Form.Group>
                                                      </div>

                                                      <div className="col-12 col-sm-4 pt-4">
                                                        <Form.Label className="prodSelect">
                                                          Policy Term for {benefit.coverageLookup}
                                                        </Form.Label>
                                                        <div className="d-flex align-items-center">
                                                          <Form.Control
                                                            type="text"
                                                            className="col-12 col-sm-8"
                                                            value={(
                                                              policyTermAmounts[benefit.coverageLookup] ||
                                                              benefit.options.benefitPeriod.minimum
                                                            ).toLocaleString()}
                                                            readOnly
                                                            style={{ width: '170px', textAlign: 'center', backgroundColor: "#fff"}}
                                                          />
                                                        </div>
                                                      </div>

                                                      <div className="col-12 col-sm-4 pt-4">
                                                        <Form.Label className="prodSelect">
                                                          Premium for {benefit.coverageLookup}
                                                        </Form.Label>
                                                        <Table bordered hover className="mobilewidth">
                                                          <tbody>
                                                            {calculatedData.length > 0 ? (
                                                              <tr style={{ fontSize:'15px'}}>
                                                                <td>
                                                                  Rs. {(
                                                                    Math.round(
                                                                      (calculatedData.find(
                                                                        (item) =>
                                                                          item.coverageLookup ===
                                                                          benefit.coverageLookup
                                                                      )?.PremiumAmount || 0) * 100
                                                                    ) / 100
                                                                  ).toLocaleString()}
                                                                </td>
                                                              </tr>
                                                            ) : (
                                                              <tr>
                                                                <td colSpan="1" className="notFoundProd">
                                                                 Rs. Premium 
                                                                </td>
                                                              </tr>
                                                            )}
                                                            
                                                          </tbody>
                                                        </Table>
                                                      </div>

                                                      <div className="col-12">
                                                        <hr />
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              )
                                            )
                                          ) : (
                                            <p>No Benefits Data available for {childKey}</p>
                                          )}
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <p>No Child Benefit Data available</p>
                                  )} 
                                  </div>
                                )}
                    </AccordionItem>
                  </div>

                    <div className="row mt-5">
                      
                      <div className="col-12 col-sm-4 pt-4">
                        <Button variant="danger" onClick={ () => calculatePremium(formik.values)}
                        //  disabled={formState}
                        >
                          Calculate
                        </Button>
                      </div>

                      <div className="col-12 col-sm-4">
                      <div style={{ textAlign: "center" }}>
                          <Form.Label className="prodSelect">Monthly Premium</Form.Label>
                        </div>
                        <Table bordered hover className="mobilewidth">
                          <thead></thead>
                          <tbody>
                            {totalPremiumData.length > 0 ? (
                              totalPremiumData.map((item, index) => (
                                <tr key={index} style={{  fontSize:'15px'}}>
                                  <td>{item.paymentFrequency}</td>
                                  <td>{item.PremiumAmount}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="2" className="notFoudProd">Premium </td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </div>

                          <div className="col-12 col-sm-4">
                              <div style={{ textAlign:"center"}}>
                                  <Form.Label className="prodSelect">Total Premium</Form.Label>
                              </div>
                              <Table bordered hover className="mobilewidth">
                                  <thead>

                                  </thead>

                                  <tbody>
                                  {allTotalPremiumData.length > 0 ? (
                                    allTotalPremiumData.map((item, index) => (
                                      <tr key={index} style={{ fontSize:'15px'}}>
                                        <td>{item.paymentFrequency}</td>
                                        <td>Rs. {item.PremiumAmount}</td>
                                      </tr>
                                    ))
                                  )
                                  : (
                                    <tr>
                                      <td colSpan='4' className='notFoudProd'>Rs. Premium  </td>
                                      </tr>
                                  )}
                                  </tbody>
                              </Table>
                          </div>
                      </div>
                        {/* <button onClick={loadWasm}>Call Wasm</button> */}
                        {/* <buton onClick={callJavaClass}></buton> */}
                        {/* {magicNumber && <p>Magic number: {magicNumber}</p>} */}


                      {/* <div className="row pt-4">
                          <div className="col-6 ">
                          <Button variant="primary" 
                            onClick={e => generateIllustrationHandle(formik.values)}
                          >
                              Generate Illustration
                          </Button>
                          </div>
                          <div className="col-6 ">
                          </div>
                      </div> */}


                      {/* <div className="main-footer">
                        <Button
                          variant="primary"
                          // type="submit"
                          onClick={proceedToNextScreen}
                          id="productChoiceButton">Save & Proceed</Button>
                      </div> */}

                  </div>
                  <Loader show={loader} />

                  <MyVerticallyCenteredModal
                          show={modalShow}
                          onHide={() => setModalShow(false)}
                        />

                </Form>
            </div>
            <div className="iosfixednextprevbutton">
              <div className="fixednextprevbutton d-flex justify-content-between">
              <button 
                                    type="button" 
                                    className="btn btnprev" 
                                    onClick={dashNav}
                                > Prev </button>
                        <button className="btn btn-saveillustration"
                          onClick={e => generateIllustrationHandle(formik.values)}
                        > Generate Illustration </button>
                        <button className="btn btnnext"  id="productChoiceButton" onClick={proceedToNextScreen}>
                          Next </button>
              </div>
            </div>

    </div>
    </SidebarLayout>

  )

}

export default BenefitSelection
