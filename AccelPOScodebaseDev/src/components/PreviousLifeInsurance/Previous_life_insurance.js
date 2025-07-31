import { useNavigate } from "react-router-dom";
import './Previous_life_insurance.css'
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faTrash ,faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-bootstrap/Modal';
import { Button, Table } from "react-bootstrap";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { saveDetail, findRecordById,updateDetailById } from '../../db/indexedDB'; 
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

const PreviousLifeInsurance = () => {
    const navigate = useNavigate();
    const maxLimit = 12;
    const [prevData, setPrevData] = useState();
 
    const ApplicationType = sessionStorage.getItem('applicationType');
    //console.log("Received application type :", ApplicationType);
  
    const isApplicationTypeValid = ApplicationType === 'Joint Life';
    const isApplicationTypeNullOrEmpty = ApplicationType === null || ApplicationType === ''; // true if null or empty

    const childInclusion = sessionStorage.getItem('setChildInclusion');
    const isChildInclusionEnabled = childInclusion === 'true'; //
    // console.log("Received application type with childInclusion :", isChildInclusionEnabled);
     console.log("Received application type with childInclusion before submit :", childInclusion);

    const previousId = sessionStorage.getItem('InsuPrevId');
    //console.log("Fetched previous Id:", previousId);
    const erefid = sessionStorage.getItem("erefid")
   // console.log("Got erefid ", erefid)

    const CaseId = sessionStorage.getItem("CaseId");
    const [apipayload, setapipayload] = useState();

    // Accordian open and close
    const [openItem, setOpenItem] = useState(() => {
        if (ApplicationType === 'Joint Life') {
          return ['lifeA', 'lifeB']; // Both accordions open for Joint Life
        } else if (ApplicationType === 'Single Life') {
          return ['lifeA']; // Only Life A open for Single Life
        }
        return []; // Default case if ApplicationType is null or undefined
    });

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

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Fetch `al_application_main` data
                if (erefid) {
                    const appData = await findRecordById("al_application_main", erefid);
                    console.log("al application data in Previous Insurance screen :::", appData);
                    setPrevData(appData); 
                }
    
                // Fetch previous insurance data
                if (previousId) {
                    const previousInsuData = await findRecordById('al_previous_insu_details', previousId);
                    console.log("Fetched previous insurance data:", previousInsuData);
    
                    if (previousInsuData?.result) {
                        const { 
                            primaryInsured = { lifeInsurance: {}, lifeDeclined: {} },
                            secondaryInsured = { lifeInsurance: {}, lifeDeclined: {} } 
                        } = previousInsuData.result;
    
                        // Define child keys to map insurance and declined policies
                        const childKeys = [
                            'firstChildInsured', 'secondChildInsured', 'thirdChildInsured', 
                            'fourthChildInsured', 'fifthChildInsured'
                        ];
    
                        // Map child life policies
                        const childData = childKeys.map((key) => {
                            const childInsured = previousInsuData.result[key];
                            return childInsured ? {
                                hasChildLifePolicy: childInsured?.childInsurance?.hasLifePolicy || 'no',
                                insupolicies: (childInsured?.childInsurance?.insuPolicies || []).map(policy => ({
                                    questionType: "insu",
                                    childLifePolicyNo: policy.childLifePolicyNo,
                                })),
                            } : null;
                        }).filter(data => data !== null);  // Filter out null values if no data for some child
    
                        // Map declined child life policies
                        const childDeclinedData = childKeys.map((key) => {
                            const childInsured = previousInsuData.result[key];
                            return childInsured ? {
                                hasChildLifeDeclPolicy: childInsured?.childDeclined?.hasDeclLifePolicy || 'no',
                                insupolicies: (childInsured?.childDeclined?.insuPolicies || []).map(policy => ({
                                    questionType: "decl",
                                    childLifeDeclDetails: policy.childLifeDeclDetails,
                                })),
                            } : null;
                        }).filter(data => data !== null);  // Filter out null values if no data for some child
                        
                        const childDatatable = childKeys.map((key) => {
                            const childInsured = previousInsuData.result[key];
                            return childInsured?.childInsurance?.insuPolicies?.length > 0
                                ? childInsured.childInsurance.insuPolicies.map(policy => ({
                                      childLifePolicyNo: policy.childLifePolicyNo,
                                  }))
                                : []; // Return an empty array if no policies exist
                        });
                        
                        const childDeclinedDataTable = childKeys.map((key) => {
                            const childInsured = previousInsuData.result[key];
                            return childInsured?.childDeclined?.insuPolicies?.length > 0
                                ? childInsured.childDeclined.insuPolicies.map(policy => ({
                                      childLifeDeclDetails: policy.childLifeDeclDetails,
                                  }))
                                : []; // Return an empty array if no declined policies exist
                        });

                        // setChildPolicyData(childDatatable);
                        // setDeclinedChildPolicyData(childDeclinedDataTable);
    
                        // Set data for primary, secondary insured policies, and children
                        setPolicyDataB(secondaryInsured.lifeInsurance?.insuPolicies || []);
                        setDeclinedPolicyDataB(secondaryInsured.lifeDeclined?.insuPolicies || []);
                        setPolicyData(primaryInsured.lifeInsurance?.insuPolicies || []);
                        setDeclinedPolicyData(primaryInsured.lifeDeclined?.insuPolicies || []);
                        setChildPolicyData(childData);  // Set child insurance data
                        setDeclinedChildPolicyData(childDeclinedData);  // Set declined child insurance data
                        setChildPolicyData(childDatatable);  // Set child insurance data
                        setDeclinedChildPolicyData(childDeclinedDataTable);
                        setShowForm(false);
                        setShowAdditionalFields2(false);
                        SetDeclinedShowFormB(false);
                        setShowFormB(false);
                         setChildForm(false);
                         setChildDeclinedShowForm(false);
    
                        // Prepare Formik initial values
                        const newValues = {
                            lifeAInsu: {
                                hasLifePolicy: primaryInsured.lifeInsurance?.hasLifePolicy || '',
                                insupolicies: primaryInsured.lifeInsurance?.insuPolicies || [],
                            },
                            lifeADecl: {
                                hasDeclLifePolicy: primaryInsured.lifeDeclined?.hasDeclLifePolicy || '',
                                insupolicies: primaryInsured.lifeDeclined?.insuPolicies || [],
                            },
                            lifeBInsu: {
                                hasLifePolicyB: secondaryInsured.lifeInsurance?.hasLifePolicy || '',
                                insupolicies: secondaryInsured.lifeInsurance?.insuPolicies || [],
                            },
                            lifeBDeclInsu: {
                                hasDeclLifePolicyB: secondaryInsured.lifeDeclined?.hasDeclLifePolicy || '',
                                insupolicies: secondaryInsured.lifeDeclined?.insuPolicies || [],
                            },
                            ChildInsu: childData, // Set child insurance data
                            ChildDeclInsu: childDeclinedData, // Set declined child insurance data
                        };
    
                        // Reset Formik form with new values
                        formik.resetForm({ values: JSON.parse(JSON.stringify(newValues)) });
                    } else {
                        console.error("No previous insurance data found for the specified ID:", previousId);
                    }
                }
    
                // Fetch child data from IndexedDB
                const personID = sessionStorage.getItem('personID');
                console.log("Person Id from session:", personID);
    
                if (personID) {
                    const personData = await findRecordById('al_person_details', personID);
                    if (personData && personData.result && personData.result.Child) {
                        console.log('Fetched child data:', personData.result.Child);
                        setChildData(personData.result.Child);
                    } else {
                        console.log('No child data found');
                    }
                } else {
                    console.error('No person_id found in session storage');
                }
    
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
    
        fetchAllData();
    }, [erefid, previousId]);
    
    const newPersonId=sessionStorage.getItem('personID');
    console.log("Person Id from session",newPersonId);
    const [childData, setChildData] = useState([]);

    useEffect(() => {
        // Update childShowForm whenever childData changes
        setChildShowForm(Array(childData.length).fill(false)); // Initialize based on the length of childData
    }, [childData]); 

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

    //------------LifeA starts-----------------//
    // Question 1 details (Policies)
    const [hasLifePolicy, setHasLifePolicy] = useState(''); 
    const [companyName, setCompanyName] = useState(''); 
    const [policyNo, setPolicyNo] = useState('');
    const [lifeCover, setLifeCover] = useState(''); 
    const [premium, setPremium] = useState(''); 
    const [showAdditionalFields, setShowAdditionalFields] = useState(false); 
    const [policyData, setPolicyData] = useState([]); 
    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const [policyCount, setPolicyCount] = useState(0); 
    const [showForm, setShowForm] = useState(true);
    
    const handleSave = async (e) => {
        e.preventDefault();
        console.log("Attempting to save..."); 
        // Validate only lifeAInsu fields manually
        await formik.validateField('lifeAInsu.companyName');
        await formik.validateField('lifeAInsu.policyNo');
        await formik.validateField('lifeAInsu.lifeCover');
        await formik.validateField('lifeAInsu.premium');
    
        // Log validation errors (if any)
        console.log("Validation errors after validateForm:", formik.errors);
        
    
        // Check if there are any errors in lifeAInsu
        if (!formik.errors.lifeAInsu) {
            const newPolicy = {
                companyName: formik.values.lifeAInsu.companyName,
                policyNo: formik.values.lifeAInsu.policyNo,
                lifeCover: formik.values.lifeAInsu.lifeCover,
                premium: formik.values.lifeAInsu.premium,
            };
    
            // Ensure values are not empty
            if (newPolicy.companyName && newPolicy.policyNo && newPolicy.lifeCover && newPolicy.premium) {
                // Save the new policy into the state
                setPolicyData((prevData) => {
                    // Ensure prevData is always an array, even if it wasn't initialized correctly
                    const updatedData = Array.isArray(prevData) ? prevData : [];
                    return [...updatedData, newPolicy];
                });
    
                // Log successful save
                console.log("Form successfully saved. Policy data:", newPolicy);
    
            } else {
                console.log("Some fields are still empty after validation.");
            }
            setShowForm(false);
        } else {
            // Set touched for all fields in lifeAInsu to trigger validation errors
            formik.setTouched({
                ...formik.touched,
                lifeAInsu: {
                    companyName: true,
                    policyNo: true,
                    lifeCover: true,
                    premium: true,
                },
            });
            console.log("Form has validation errors, cannot proceed with saving:", formik.errors.lifeAInsu);
        }
    };
    
    const handleCancel = () => {
        setShowForm(false);
        // Check if policyData has records
        if (policyData.length > 0) {
            formik.setFieldValue('lifeAInsu.hasLifePolicy', 'yes'); 
        } else {
            formik.setFieldValue('lifeAInsu.hasLifePolicy', 'no'); 
        }
        //formik.setFieldValue('lifeAInsu.hasLifePolicy', 'no'); 
        //formik.resetForm(); 
    };
    
    const handleRadioChange = (e) => {
        const { value } = e.target;
        if (value === 'yes') {
            // Reset the fields to initial values when toggling to "Yes"
            formik.setFieldValue('lifeAInsu', {
                ...formik.initialValues.lifeAInsu,
                hasLifePolicy: value, // Keep the current radio button value
            });
        } else {
            // Set only the radio button value for "No"
            setPolicyData(false)
            formik.setFieldValue('lifeAInsu.hasLifePolicy', value);
        }
        setShowForm(value === 'yes'); 
    };

    const handleDelete = (indexToDelete) => {
        setPolicyData((prevData) => prevData.filter((_, index) => index !== indexToDelete));
    
        // If all policies are deleted, set `hasDeclLifePolicyB` to 'no'
        if (policyData.length === 1) { // Because one item will be removed
            formik.setFieldValue('lifeAInsu.hasLifePolicy', 'no');
        }
    
        // Decrease the declined policy count
        setPolicyCount((prevCount) => prevCount - 1);
    };

    const handleAddMore = () => {
        if (policyCount < maxLimit) {
            // Reset only the fields in lifeAInsu
            formik.setFieldValue('lifeAInsu.companyName', '');
            formik.setFieldValue('lifeAInsu.policyNo', '');
            formik.setFieldValue('lifeAInsu.lifeCover', '');
            formik.setFieldValue('lifeAInsu.premium', '');
    
            // Mark fields as untouched for a fresh form experience
            formik.setTouched({
                lifeAInsu: {
                    hasLifePolicy: formik.values.lifeAInsu.hasLifePolicy, // Keep radio button state
                    companyName: false,
                    policyNo: false,
                    lifeCover: false,
                    premium: false,
                },
            });
    
            setShowForm(true);
        } else {
            // Handle the case where the max limit is reached
            console.log("Max limit reached for policy entries.");
            setShowPolicyModal(true); // Uncomment this if you have a modal to show
        }
    };

    const [hasDeclLifePolicy, setHasDeclLifePolicy] = useState('');
    const [declinedCompanyName, setDeclinedCompanyName] = useState('');
    const [declinedPolicy, setDeclinedPolicy] = useState('');
    const [declinedReason, setDeclinedReason] = useState('');
    const [declinedPolicyData, setDeclinedPolicyData] = useState([]);
    const [showAdditionalFields2, setShowAdditionalFields2] = useState(true);
    const [showDeclinedPolicyModal, setShowDeclinedPolicyModal] = useState(false);
    const [declinedPolicyCount, setDeclinedPolicyCount] = useState(0);

    const handleSaveDeclinedPolicy = async (e) => {
        e.preventDefault();
        // Validate only lifeADecl fields manually
        await formik.validateField('lifeADecl.declCompanyName');
        await formik.validateField('lifeADecl.declPolicy');
        await formik.validateField('lifeADecl.declReason');
    
        // Log validation errors (if any)
        console.log("Validation errors after validateForm:", formik.errors);
    
        // Check if there are any errors in lifeADecl
        if (!formik.errors.lifeADecl) {
            const declinedPolicy = {
                declCompanyName: formik.values.lifeADecl.declCompanyName,
                declPolicy: formik.values.lifeADecl.declPolicy,
                declReason: formik.values.lifeADecl.declReason,
            };
    
            // Ensure values are not empty
            if (declinedPolicy.declCompanyName && declinedPolicy.declPolicy && declinedPolicy.declReason) {
                // Update the declined policy data state
                setDeclinedPolicyData((prevData) => {
                    // Ensure prevData is always an array, even if it wasn't initialized correctly
                    const updatedData = Array.isArray(prevData) ? prevData : [];
                    return [...updatedData, declinedPolicy];
                });
                console.log("Form successfully saved. Declined Policy data:", declinedPolicy);
               
            } else {
                console.log("Some fields are still empty after validation.");
            }
            setShowAdditionalFields2(false);
        } else {
            // Set touched for all fields in lifeADecl
            formik.setTouched({
                ...formik.touched,
                lifeADecl: {
                    declCompanyName: true,
                    declPolicy: true,
                    declReason: true,
                },
            });
            console.log("Form has validation errors, cannot proceed with saving:", formik.errors.lifeADecl);
        }
    };
    
    const handleDeclCancel = () => {
        setShowAdditionalFields2(false); 
        if (declinedPolicyData.length > 0) {
            formik.setFieldValue('lifeADecl.hasDeclLifePolicy', 'yes'); 
        } else {
            formik.setFieldValue('lifeADecl.hasDeclLifePolicy', 'no');
        }
        //formik.setFieldValue('lifeADecl.hasDeclLifePolicy', 'no'); 
        //formik.resetForm(); 
        //setDeclinedPolicyData(false); 
    };

    const handleDeclRadioChange = (e) => {
        const { value } = e.target;
        if (value === 'yes') {
            // Reset the fields to initial values when toggling to "Yes"
            formik.setFieldValue('lifeADecl', {
                ...formik.initialValues.lifeADecl,
                hasDeclLifePolicy: value, // Keep the current radio button value
            });
        } else {
            // Set only the radio button value for "No"
            setDeclinedPolicyData(false);
            formik.setFieldValue('lifeADecl.hasDeclLifePolicy', value);
        }
        setShowAdditionalFields2(value === 'yes'); 
    };

    const handleDeleteDeclinedPolicy = (indexToDelete) => {
        setDeclinedPolicyData((prevData) => prevData.filter((_, index) => index !== indexToDelete));
    
        // If all policies are deleted, set `hasDeclLifePolicyB` to 'no'
        if (declinedPolicyData.length === 1) { // Because one item will be removed
            formik.setFieldValue('lifeADecl.hasDeclLifePolicy', 'no');
        }
    
        // Decrease the declined policy count
        setDeclinedPolicyCount((prevCount) => prevCount - 1);
    };

    const handleAddMoreDeclinedPolicy = () => {
        if (policyCount < maxLimit) {

            formik.setFieldValue('lifeADecl.declCompanyName', '');
            formik.setFieldValue('lifeADecl.declPolicy', '');
            formik.setFieldValue('lifeADecl.declReason', '');
    
            formik.setTouched({
                lifeADecl: {
                    hasDeclLifePolicy: formik.values.lifeADecl.hasDeclLifePolicy,
                    declCompanyName: false,
                    declPolicy: false,
                    declReason:false,
                },
            }); // Reset the touched state
            setShowAdditionalFields2(true);  // Show the form again when "Add More" is clicked
        } else {
            setShowDeclinedPolicyModal(true); 
        }
    };
     // ends here
    //---------------------------------------------LifeA ends here----------------////

    //---------------------------------------------LifeB starts here------------------//
    // Policies
    const [hasLifePolicyB, setHasLifePolicyB] = useState('');
    const [companyNameB, setCompanyNameB] = useState('');
    const [policyNoB, setPolicyNoB] = useState('');
    const [lifeCoverB, setLifeCoverB] = useState('');
    const [premiumB, setPremiumB] = useState('');
    const [showAdditionalFieldsB, setShowAdditionalFieldsB] = useState(false);
    const [policyDataB, setPolicyDataB] = useState([]);
    const [showPolicyModalB, setShowPolicyModalB] = useState(false);
    const [policyCountB, setPolicyCountB] = useState(0); // Added state for policy count
    const [showFormB, setShowFormB] = useState(true);

    const handleSaveB = async (e) => {
        e.preventDefault();
    
        // Validate only lifeBInsu fields manually
        await formik.validateField('lifeBInsu.companyNameB');
        await formik.validateField('lifeBInsu.policyNoB');
        await formik.validateField('lifeBInsu.lifeCoverB');
        await formik.validateField('lifeBInsu.premiumB');
    
        // Log validation errors (if any)
        console.log("Validation errors after validateForm:", formik.errors);
    
        // Check if there are any errors in lifeBInsu
        if (!formik.errors.lifeBInsu) {
            const InsuPolicyB = {
                companyNameB: formik.values.lifeBInsu.companyNameB,
                policyNoB: formik.values.lifeBInsu.policyNoB,
                lifeCoverB: formik.values.lifeBInsu.lifeCoverB,
                premiumB:formik.values.lifeBInsu.premiumB,
            };
    
            // Ensure values are not empty
            if (InsuPolicyB.companyNameB && InsuPolicyB.policyNoB && InsuPolicyB.lifeCoverB && InsuPolicyB.premiumB){
                // Update the declined policy data state
                // setPolicyDataB((prevData) => [...prevData, InsuPolicyB]);
    
                setPolicyDataB((prevData) => {
                    const updatedData = Array.isArray(prevData) ? prevData : [];
                    return [...updatedData, InsuPolicyB];
                });
    
                console.log("Form successfully saved. Declined Policy data:", InsuPolicyB);
    
                setShowFormB(false);
            } else {
                console.log("Some fields are still empty after validation.");
            }
        } else {
            // Set touched for all fields in lifeADecl
            formik.setTouched({
                ...formik.touched,
                lifeBInsu: {
                    companyNameB: true,
                    policyNoB: true,
                    lifeCoverB: true,
                    premiumB: true,
                },
            });
            console.log("Form has validation errors, cannot proceed with saving:", formik.errors.lifeBInsu);
        }
    };

    const handleCancelB = () => {
        setShowFormB(false); 
        if (policyDataB.length > 0) {
            formik.setFieldValue('lifeBInsu.hasLifePolicyB', 'yes'); 
        } else {
            formik.setFieldValue('lifeBInsu.hasLifePolicyB', 'no');
        }
        //formik.resetForm(); 
        //setPolicyDataB(false);
    };

    const handleRadioChangeB = (e) => {
        const { value } = e.target;
        if (value === 'yes') {
            // Reset the fields to initial values when toggling to "Yes"
            formik.setFieldValue('lifeBInsu', {
                ...formik.initialValues.lifeBInsu,
                hasLifePolicyB: value, // Keep the current radio button value
            });
        } else {
            // Set only the radio button value for "No"
            setPolicyDataB(false);
            formik.setFieldValue('lifeBInsu.hasLifePolicyB', value);
        }
        setShowFormB(value === 'yes'); 
    };

    const handleDeleteB = (indexToDelete) => {
        setPolicyDataB((prevData) => prevData.filter((_, index) => index !== indexToDelete));
    
        // If all policies are deleted, set `hasDeclLifePolicyB` to 'no'
        if (policyDataB.length === 1) { // Because one item will be removed
            formik.setFieldValue('lifeBInsu.hasLifePolicyB', 'no');
        }
    
        // Decrease the declined policy count
        setPolicyCountB((prevCount) => prevCount - 1);
    };

    const handleAddMoreB = () => {
        
        if (policyCount < maxLimit) {

        formik.setFieldValue('lifeBInsu.companyNameB', '');
        formik.setFieldValue('lifeBInsu.policyNoB', '');
        formik.setFieldValue('lifeBInsu.lifeCoverB', '');
        formik.setFieldValue('lifeBInsu.premiumB', '');

            formik.setTouched({
                lifeBInsu: {
                    hasLifePolicyB:  formik.values.lifeBInsu.hasLifePolicyB, 
                    companyNameB: false,
                    policyNoB: false,
                    lifeCoverB: false,
                    premiumB: false,
                },
            });
            setShowFormB(true);  
        } else {
            setShowPolicyModalB(true); 
        }
    };

    // Question2 Declined Policies
    const [hasDeclLifePolicyB, setHasDeclLifePolicyB] = useState('');
    const [declinedCompanyNameB, setDeclinedCompanyNameB] = useState('');
    const [declinedPolicyB, setDeclinedPolicyB] = useState('');
    const [declinedReasonB, setDeclinedReasonB] = useState('');
    const [showAdditionalFieldsDeclinedB, setShowAdditionalFieldsDeclinedB] = useState(false);
    const [declinedPolicyDataB, setDeclinedPolicyDataB] = useState([]); // Renamed state for declined policies
    const [showDeclPolicyModalB, setShowDeclPolicyModalB] = useState(false);
    const [policyDeclinedCountB, setPolicyDeclinedCountB] = useState(0); // Added state for policy count
    const [declinedShowFormB, SetDeclinedShowFormB] = useState(true);

    const handleSaveDeclinedPolicyB = async (e) => {
        e.preventDefault();
    
        // Validate only lifeADecl fields manually
        await formik.validateField('lifeBDeclInsu.declinedCompanyNameB');
        await formik.validateField('lifeBDeclInsu.declinedPolicyB');
        await formik.validateField('lifeBDeclInsu.declinedReasonB');
    
        // Log validation errors (if any)
        console.log("Validation errors after validateForm:", formik.errors);
    
        // Check if there are any errors in lifeADecl
        if (!formik.errors.lifeBDeclInsu) {
            const declPolicyB = {
                declinedCompanyNameB: formik.values.lifeBDeclInsu.declinedCompanyNameB,
                declinedPolicyB: formik.values.lifeBDeclInsu.declinedPolicyB,
                declinedReasonB: formik.values.lifeBDeclInsu.declinedReasonB,
            };
    
            // Ensure values are not empty
            if (declPolicyB.declinedCompanyNameB && declPolicyB.declinedPolicyB && declPolicyB.declinedReasonB) {
                // Update the declined policy data state
                // setDeclinedPolicyDataB((prevData) => [...prevData, declinedPolicy]);
                setDeclinedPolicyDataB((prevData) => {
                    const updatedData = Array.isArray(prevData) ? prevData : [];
                    return [...updatedData, declPolicyB];
                });
                
    
                console.log("Form successfully saved. Declined Policy data:", declPolicyB);
    
               
            } else {
                console.log("Some fields are still empty after validation.");
            }
            SetDeclinedShowFormB(false);
        } else {
            // Set touched for all fields in lifeADecl
            formik.setTouched({
                ...formik.touched,
                lifeBDeclInsu: {
                    declinedCompanyNameB: true,
                    declinedPolicyB: true,
                    declinedReasonB: true,
                },
            });
            console.log("Form has validation errors, cannot proceed with saving:", formik.errors.lifeBDeclInsu);
        }
    };
    
    const handleDeclCancelB = () => {
        SetDeclinedShowFormB(false);  
        if (declinedPolicyDataB.length > 0) {
            formik.setFieldValue('lifeBDeclInsu.hasDeclLifePolicyB', 'yes'); 
        } else {
            formik.setFieldValue('lifeBDeclInsu.hasDeclLifePolicyB', 'no');
        }
        //formik.setFieldValue('lifeBDeclInsu.hasDeclLifePolicyB', 'no'); 
       // formik.resetForm(); 
        //setDeclinedPolicyDataB(false);
    };

    const handleDeclRadioChangeB = (e) => {
        const { value } = e.target;
        if (value === 'yes') {
            // Reset the fields to initial values when toggling to "Yes"
            formik.setFieldValue('lifeBDeclInsu', {
                ...formik.initialValues.lifeBDeclInsu,
                hasDeclLifePolicyB: value, // Keep the current radio button value
            });
        } else {
            // Set only the radio button value for "No"
            setDeclinedPolicyDataB(false);
            formik.setFieldValue('lifeBDeclInsu.hasDeclLifePolicyB', value);
        }
        SetDeclinedShowFormB(value === 'yes'); 
    };

    const handleDeleteDeclinedB = (indexToDelete) => {
        setDeclinedPolicyDataB((prevData) => prevData.filter((_, index) => index !== indexToDelete));
    
        // If all policies are deleted, set `hasDeclLifePolicyB` to 'no'
        if (declinedPolicyDataB.length === 1) { // Because one item will be removed
            formik.setFieldValue('lifeBDeclInsu.hasDeclLifePolicyB', 'no');
        }
    
        // Decrease the declined policy count
        setPolicyDeclinedCountB((prevCount) => prevCount - 1);
    };

    const handleDeclAddMoreB = () => {
        if (policyCount < maxLimit) {

            formik.setFieldValue('lifeBInsu.declinedCompanyNameB', '');
            formik.setFieldValue('lifeBInsu.declinedPolicyB', '');
            formik.setFieldValue('lifeBInsu.declinedReasonB', '');
    
    
            formik.setTouched({
                lifeBDeclInsu: {
                    hasDeclLifePolicyB:formik.values.lifeBDeclInsu.hasDeclLifePolicyB,
                    declinedCompanyNameB: false,
                    declinedPolicyB: false,
                    declinedReasonB:false,
                },
            }); // Reset the touched state
            SetDeclinedShowFormB(true);  // Show the form again when "Add More" is clicked
        } else {
            setShowDeclPolicyModalB(true); 
        }
    };
    //ends here
    //---------------------------------------------LifeB ends here----------------////

    // Child life policy states
    const [hasChildLifePolicy, setHasChildLifePolicy] = useState('');
    const [showAdditionalFieldsForChildLifePolicy, setShowAdditionalFieldsForChildLifePolicy] = useState(false);
    const [childLifePolicyNo, setChildLifePolicyNo] = useState('');
    const [childPolicyData, setChildPolicyData] = useState([]);
    const [childPolicyCount, setChildPolicyCount] = useState(0);
    const [showChildPolicyModal, setShowChildPolicyModal] = useState(false);
    const [childShowForm, setChildShowForm] = useState([]);
    const [childForm, setChildForm] = useState([]);

    console.log("Child Form Visibility State:", childShowForm);

    const handleChildLifeSave = async (index, e) => {
        e.preventDefault(); // Prevent form submission (if required)
      
        // Validate the specific child's policy number field
        await formik.validateField(`ChildInsu.[${index}].childLifePolicyNo`);
        console.log("Validation errors after validateForm:", formik.errors);
      
        // If there are no errors in the validation for this child
        if (
          !formik.errors.ChildInsu ||
          !formik.errors.ChildInsu[index] ||
          !formik.errors.ChildInsu[index].childLifePolicyNo
        ) {
          const ChildPolicy = {
            childLifePolicyNo: formik.values.ChildInsu[index].childLifePolicyNo,
          };
      
          // Ensure the field is not empty before saving
          if (ChildPolicy.childLifePolicyNo) {
            // Save the child policy data for the specific child
            setChildPolicyData((prevData) => {
              const updatedData = [...prevData];
              if (!updatedData[index]) {
                updatedData[index] = []; // Initialize array for this child if not present
              }
              updatedData[index] = [...updatedData[index], ChildPolicy]; // Append the new policy
              return updatedData;
            });
      
            // Hide the form after successful save
            setChildForm((prev) => {
              const updatedShowForm = [...prev];
              updatedShowForm[index] = false; // Hide fields for this index
              return updatedShowForm;
            });
      
            console.log("Form successfully saved. Child Policy data:", ChildPolicy);
          } else {
            console.log("Some fields are still empty after validation.");
          }
        } else {
          // If there are validation errors, mark the field as touched for this child
          formik.setTouched({
            ...formik.touched,
            ChildInsu: {
              ...formik.touched.ChildInsu,
              [index]: {
                childLifePolicyNo: true, // Set touched for the specific child
              },
            },
          });
          console.log("Form has validation errors, cannot proceed with saving:", formik.errors.ChildInsu);
        }
    };
    

    const handleChildLifeCancel = (index) => {
    // Hide the form for this specific child
    setChildForm((prev) => {
        const updatedShowForm = [...prev];
        updatedShowForm[index] = false; // Hide fields for this index
        return updatedShowForm;
    });
    
    // Check if policy data exists for this child
    setChildPolicyData((prev) => {
        const updatedPolicyData = [...prev];
    
        if (updatedPolicyData[index] && updatedPolicyData[index].length > 0) {
        // If there are records in the policy table, set the radio button to "yes"
        formik.setFieldValue(`ChildInsu.${index}.hasChildLifePolicy`, 'yes');
        } else {
        // If no records, set the radio button to "no" and clear the input field
        formik.setFieldValue(`ChildInsu.${index}.childLifePolicyNo`, ''); // Clear input field
        formik.setFieldValue(`ChildInsu.${index}.hasChildLifePolicy`, 'no');
        }
    
        // Optionally, if you need to clear the policy data for this child:
        // updatedPolicyData[index] = []; // Uncomment if policy data should be cleared on cancel
        return updatedPolicyData;
    });
    };
    
    // const handleRadioChangeForChildLifePolicy = (index) => (e) => {
    //     const { value } = e.target;
    
    //     // Update the specific child's show form state
    //     setChildForm((prevState) => {
    //         const newShowForm = [...prevState];
    //         newShowForm[index] = value === 'yes'; // Show form only if 'yes' is selected
    //         return newShowForm;
    //     });

    //     if (value === 'no') {
    //         setChildPolicyData((prevState) => {
    //             const newData = [...prevState];
    //             newData[index] = []; // Reset the data for this index
    //             return newData;
    //         });
    //         formik.setFieldValue(`ChildInsu.${index}.childLifePolicyNo`, "");
    //     }
    //     formik.setFieldValue(`ChildInsu.${index}.hasChildLifePolicy`, value);

    //     console.log(`Radio changed for child at index ${index}: ${value}`);
    // };
     

    const handleRadioChangeForChildLifePolicy = (index) => (e) => {
        const { value } = e.target;
    
        // Update the specific child's show form state
        setChildForm((prevState) => {
            const newShowForm = Array.isArray(prevState) ? [...prevState] : [];
            newShowForm[index] = value === 'yes'; // Show form only if 'yes' is selected
            return newShowForm;
        });
    
        if (value === 'no') {
            setChildPolicyData((prevState) => {
                const newData = Array.isArray(prevState) ? [...prevState] : [];
                newData[index] = {}; // Reset the data for this index to an empty object
                return newData;
            });
            
            formik.setFieldValue(`ChildInsu.${index}.childLifePolicyNo`, "");
        }
    
        formik.setFieldValue(`ChildInsu.${index}.hasChildLifePolicy`, value);
    
        console.log(`Radio changed for child at index ${index}: ${value}`);
    };
    
    const handleChildLifeDelete = (parentIndex, policyIndexToDelete) => {
        setChildPolicyData((prevData) => {
            const updatedData = [...prevData];
            updatedData[parentIndex] = updatedData[parentIndex].filter((_, index) => index !== policyIndexToDelete);
    
            // If no policies are left for this child, set `hasChildLifeDeclPolicy` to 'no'
            if (updatedData[parentIndex].length === 0) {
                formik.setFieldValue(`ChildInsu[${parentIndex}].hasChildLifePolicy`, 'no');
            }
    
            return updatedData;
        });
    
        // Decrease the declined policy count
        setChildPolicyCount((prevCount) => prevCount - 1);
    };

    const handleChildLifeAddMore = (index) => {
        if (childPolicyCount < maxLimit) {
            // Reset the values for the new child policy
            formik.setFieldValue(`ChildInsu[${index}].childLifePolicyNo`, '');
            formik.setFieldValue(`ChildInsu[${index}].hasChildLifePolicy`, 'yes'); // Default to 'yes'
    
            // Reset the touched state for the new child policy
            formik.setTouched({
                ...formik.touched,
                ChildInsu: {
                    ...(formik.touched?.ChildInsu || {}),
                    [index]: {
                        childLifePolicyNo: true,
                    },
                },
            });
    
            // Update childShowForm to show the fields for this index
            setChildForm((prev) => {
                const updatedShowForm = Array.isArray(prev) ? [...prev] : [];
                updatedShowForm[index] = true; // Show fields for this index
                return updatedShowForm;
            });
        } else {
            setShowChildPolicyModal(true); 
        }
    };
    
    // Child declined policy states
    const [hasChildLifeDeclPolicy, setHasChildLifeDeclPolicy] = useState('');
    const [showAdditionalFieldsForChildLifeDeclPolicy, setShowAdditionalFieldsForChildLifeDeclPolicy] = useState(false);
    const [childLifeDeclDetails, setChildLifeDeclDetails] = useState('');
    const [declinedChildPolicyData, setDeclinedChildPolicyData] = useState([]);
    const [declinedChildLifePolicyCount, setDeclinedChildLifePolicyCount] = useState(0);
    const [showDeclChildLifePolicyModal, setShowDeclChildLifePolicyModal] = useState(false);
    const [childDeclinedShowForm, setChildDeclinedShowForm] = useState([]);   

    const handleSaveChildLifeDeclinedPolicy = async (index, e) => {
        e.preventDefault(); // Prevent form submission
      
        // Validate the specific field for the declined child policy
        await formik.validateField(`ChildDeclInsu.[${index}].childLifeDeclDetails`);
        console.log("Validation errors after validateForm:", formik.errors);
      
        if (
          !formik.errors.ChildDeclInsu ||
          !formik.errors.ChildDeclInsu[index]?.childLifeDeclDetails
        ) {
          const ChildDeclPolicy = {
            childLifeDeclDetails: formik.values.ChildDeclInsu[index].childLifeDeclDetails,
          };
      
          if (ChildDeclPolicy.childLifeDeclDetails) {
            // Update the declined policy data for the specific child
            setDeclinedChildPolicyData((prevData) => {
              const updatedData = [...prevData];
              if (!updatedData[index]) {
                updatedData[index] = []; // Initialize if it doesn't exist
              }
              updatedData[index] = [...updatedData[index], ChildDeclPolicy]; // Add new policy for the child
              return updatedData;
            });
      
            // Hide the form after successful save
            setChildDeclinedShowForm((prev) => {
              const updatedShowForm = [...prev];
              updatedShowForm[index] = false; // Hide fields for this index
              return updatedShowForm;
            });
      
            console.log("Form successfully saved. Declined Policy data:", ChildDeclPolicy);
          } else {
            console.log("Some fields are still empty after validation.");
          }
        } else {
          // Set the touched state to show validation errors
          formik.setTouched({
            ...formik.touched,
            ChildDeclInsu: {
              ...formik.touched.ChildDeclInsu,
              [index]: {
                childLifeDeclDetails: true,
              },
            },
          });
          console.log(
            "Form has validation errors, cannot proceed with saving:",
            formik.errors.ChildDeclInsu
          );
        }
    };
      
    const handleDeclinedChildLifePolicyCancel = (index) => {
        // Hide the additional fields for this index
        setChildDeclinedShowForm((prev) => {
            const updatedShowForm = [...prev];
            updatedShowForm[index] = false; // Hide fields for this index
            return updatedShowForm;
        });
        setDeclinedChildPolicyData((prev) => {
            const updatedDeclinedPolicyData = [...prev];
        
            if (updatedDeclinedPolicyData[index] && updatedDeclinedPolicyData[index].length > 0) {
              // If there are records in the policy table, set the radio button to "yes"
              formik.setFieldValue(`ChildDeclInsu.${index}.hasChildLifeDeclPolicy`, 'yes');
            } else {
              // If no records, set the radio button to "no" and clear the input field
              formik.setFieldValue(`ChildDeclInsu.${index}.childLifeDeclDetails`, ''); // Clear the input field
              formik.setFieldValue(`ChildDeclInsu.${index}.hasChildLifeDeclPolicy`, 'no'); // Set to 'no'
            }
        
            // Optionally, if you need to clear the policy data for this child:
            // updatedPolicyData[index] = []; // Uncomment if policy data should be cleared on cancel
            return updatedDeclinedPolicyData;
          });
        
    };
    
    // const handleRadioChangeForChildLifeDeclPolicy = (index) => (e) => {
    //     const { value } = e.target;
    
    //     // Update the specific child's show form state
    //     setChildDeclinedShowForm((prevState) => {
    //         const newDeclShowForm = [...prevState];
    //         newDeclShowForm[index] = value === 'yes'; 
    //         return newDeclShowForm;
    //     });
    
    //     // Hide the table and reset childPolicyData if "No" is selected
    //     if (value === 'no') {
    //         setDeclinedChildPolicyData((prevState) => {
    //             const newData = [...prevState];
    //             newData[index] = []; // Reset the data for this index
    //             return newData;
    //         });
    //         formik.setFieldValue(`ChildDeclInsu.${index}.childLifeDeclDetails`, "");
    //     }
    //     formik.setFieldValue(`ChildDeclInsu.${index}.hasChildLifeDeclPolicy`, value);
    
    //     console.log(`Radio changed for child at index ${index}: ${value}`);
    // };
    
    const handleRadioChangeForChildLifeDeclPolicy = (index) => (e) => {
        const { value } = e.target;
    
        // Update the specific child's show form state
        setChildDeclinedShowForm((prevState) => {
            const newDeclShowForm = Array.isArray(prevState) ? [...prevState] : [];
            newDeclShowForm[index] = value === 'yes'; 
            return newDeclShowForm;
        });
    
        // Hide the table and reset declined child policy data if "No" is selected
        if (value === 'no') {
            setDeclinedChildPolicyData((prevState) => {
                const newData = Array.isArray(prevState) ? [...prevState] : [];
                newData[index] = {}; // Reset the data for this index to an empty object
                return newData;
            });
            
            formik.setFieldValue(`ChildDeclInsu.${index}.childLifeDeclDetails`, "");
        }
    
        // Set the selected radio button value in Formik
        formik.setFieldValue(`ChildDeclInsu.${index}.hasChildLifeDeclPolicy`, value);
    
        console.log(`Radio changed for child at index ${index}: ${value}`);
    };
    
    const handleChildLifeDeclDelete = (parentIndex, policyIndexToDelete) => {
        setDeclinedChildPolicyData((prevData) => {
            const updatedData = [...prevData];
            updatedData[parentIndex] = updatedData[parentIndex].filter((_, index) => index !== policyIndexToDelete);
    
            // If no policies are left for this child, set `hasChildLifeDeclPolicy` to 'no'
            if (updatedData[parentIndex].length === 0) {
                formik.setFieldValue(`ChildDeclInsu[${parentIndex}].hasChildLifeDeclPolicy`, 'no');
            }
    
            return updatedData;
        });
    
        // Decrease the declined policy count
        setDeclinedChildLifePolicyCount((prevCount) => prevCount - 1);
    };

    const handleChildLifeDeclAddMore = (index) => {
        if (declinedChildLifePolicyCount < maxLimit) {
            // Reset the values for the new declined child life policy
            formik.setFieldValue(`ChildDeclInsu[${index}].childLifeDeclDetails`, ''); // Default value
            formik.setFieldValue(`ChildDeclInsu[${index}].hasChildLifeDeclPolicy`, 'yes'); // Default value
    
            // Reset the touched state for the new declined policy
            formik.setTouched({
                ...formik.touched,
                ChildDeclInsu: {
                    ...(formik.touched?.ChildDeclInsu || {}),
                    [index]: {
                        hasChildLifeDeclPolicy: true, // Marked as touched
                        childLifeDeclDetails: false, // Initially not touched
                    },
                },
            });
    
            // Update childDeclinedShowForm to show the fields for this index
            setChildDeclinedShowForm((prev) => {
                const updatedShowForm = Array.isArray(prev) ? [...prev] : [];
                updatedShowForm[index] = true; // Show fields for this index
                return updatedShowForm;
            });
        } else {
            setShowDeclChildLifePolicyModal(true);
        }
    };
    
    
    const getValidationSchema = (ApplicationType, childInclusion, childDataLength) => {
        console.log("application type ",ApplicationType);
        const baseSchema = {
            lifeAInsu: Yup.object().shape({
                hasLifePolicy: Yup.string().required('Please select if you already have any Life Policy'),
                companyName: Yup.string(),
                policyNo: Yup.string().max(100, "Maximun 100 charachters are allowed for PolicyNo"),
                lifeCover: Yup.string().max(10, "Maximun 10 numbers are allowed for LifeCover").matches(/^\d+$/, "Life Cover must be a positive number"),
                premium: Yup.string().max(10, "Maximun 10 numbers are allowed for Premium").matches(/^\d+$/, "Premium must be a positive number"),
            }).test('conditional-validation', 'All fields are required if you have a life policy', function (value) {
                const { hasLifePolicy, companyName, policyNo, lifeCover, premium } = value || {};
                console.log('Validation check:', { hasLifePolicy, companyName, policyNo, lifeCover, premium });
        
                // If the user has a life policy
                if (hasLifePolicy === 'yes') {
                    // Create an array to hold errors
                    const errors = {};
        
                    // Validate each required field
                    if (!companyName) errors.companyName = 'Please select a company';
                    if (!policyNo) errors.policyNo = 'Please enter a Policy/Proposal Number';
                    if (!lifeCover) errors.lifeCover = 'Please enter a life cover amount';
                    if (!premium) errors.premium = 'Please enter a Premium amount';
        
                    // If there are any errors, return them
                    if (Object.keys(errors).length > 0) {
                        // Instead of creating a generic error, we return the specific errors
                        return this.createError({ path: '', message: errors });
                    }
                }
                return true; // No validation errors
            }),
        
            lifeADecl: Yup.object().shape({
                hasDeclLifePolicy: Yup.string().required('Please select if you already have Declined Life Policy'),
                declCompanyName: Yup.string(),
                declPolicy: Yup.string(),
                declReason: Yup.string().max(300, "Maximun 300 charachters are allowed"),
            }).test('conditional-validation-declined', 'All fields are required if you have a declined life policy', function (value) {
                const { hasDeclLifePolicy, declCompanyName, declPolicy, declReason } = value || {};
                console.log('Validation check for declined:', { hasDeclLifePolicy, declCompanyName, declPolicy, declReason });
        
                // If the user has a declined life policy
                if (hasDeclLifePolicy === 'yes') {
                    const errors = {};
        
                    if (!declCompanyName) errors.declCompanyName = 'Please select a company';
                    if (!declPolicy) errors.declPolicy = 'Please enter a Policy/Proposal Number';
                    if (!declReason) errors.declReason = 'Please provide a reason';
        
                    if (Object.keys(errors).length > 0) {
                        return this.createError({ path: '', message: errors });
                    }
                }
                return true; // No validation errors
            }),
        };
        console.log('Validation check:', { hasLifePolicy, companyName, policyNo, lifeCover, premium,hasDeclLifePolicy });

        if (ApplicationType === 'Joint Life' || ApplicationType === 'lifeofanother') {
            baseSchema.lifeBInsu = Yup.object().shape({
                hasLifePolicyB: Yup.string().required('Please select if you already have any Life Policy'),
                companyNameB: Yup.string(), 
                policyNoB: Yup.string().max(100, "Maximum 100 charachters are allowed for PolicyNo"),
                lifeCoverB: Yup.string().max(10, "Maximum 10 numbers are allowed for LifeCover").matches(/^\d+$/, "lifecover must be a positive number"),
                premiumB: Yup.string().max(10, "Maximum 10 numbers are allowed for Premium").matches(/^\d+$/, "Premium must be a positive number"),
            }).test('conditional-validation-b', 'All fields are required if you have a life policy', function (value) {
                const { hasLifePolicyB, companyNameB, policyNoB, lifeCoverB, premiumB } = value || {};
                console.log('Validation check for lifeBInsu:', { hasLifePolicyB, companyNameB, policyNoB, lifeCoverB, premiumB });
    
                if (hasLifePolicyB === 'yes') {
                    const errors = {};
                    if (!companyNameB) errors.companyNameB = 'Please select a company';
                    if (!policyNoB) errors.policyNoB = 'Please enter a Policy/Proposal Number';
                    if (!lifeCoverB) errors.lifeCoverB = 'Please enter a life cover amount';
                    if (!premiumB) errors.premiumB = 'Please enter a Premium amount';
    
                    if (Object.keys(errors).length > 0) {
                        return this.createError({ path: '', message: errors });
                    }
                }
                return true; // No validation errors
            });
            baseSchema.lifeBDeclInsu = Yup.object().shape({
                hasDeclLifePolicyB: Yup.string().required('Please select if you already have Declined Life Policy'),
                declinedCompanyNameB: Yup.string(), 
                declinedPolicyB: Yup.string(),
                declinedReasonB: Yup.string().max(300, "Maximum 300 charachters are allowed"),
            }).test('conditional-validation-declined-b', 'All fields are required if you have a declined life policy', function (value) {
                const { hasDeclLifePolicyB, declinedCompanyNameB, declinedPolicyB, declinedReasonB } = value || {};
                console.log('Validation check for lifeBDecl:', { hasDeclLifePolicyB, declinedCompanyNameB, declinedPolicyB, declinedReasonB });
    
                if (hasDeclLifePolicyB === 'yes') {
                    const errors = {};
                    if (!declinedCompanyNameB) errors.declinedCompanyNameB = 'Please select a company';
                    if (!declinedPolicyB) errors.declinedPolicyB = 'Please enter a Policy No/Proposal No';
                    if (!declinedReasonB) errors.declinedReasonB = 'Please provide a reason';
    
                    if (Object.keys(errors).length > 0) {
                        return this.createError({ path: '', message: errors });
                    }
                }
                return true; // No validation errors
            });
        }
        if (childInclusion && childDataLength > 0) {
            baseSchema.ChildInsu = Yup.array().of(
                Yup.object().shape({
                    hasChildLifePolicy: Yup.string().required('Please specify if there is a Child Life Policy'),
                    childLifePolicyNo: Yup.string(),  
                }).test('conditional-validation-child', 'All fields are required if you have a child life policy', function (value) {
                    const { hasChildLifePolicy, childLifePolicyNo } = value || {};
                    console.log('Validation check for ChildInsu:', { hasChildLifePolicy, childLifePolicyNo });
        
                    if (hasChildLifePolicy === 'yes') {
                        const errors = {};
                        if (!childLifePolicyNo) errors.childLifePolicyNo = 'Please enter Child Life Policy Number';
        
                        if (Object.keys(errors).length > 0) {
                            return this.createError({ path: '', message: errors });
                        }
                    }
                    return true; // No validation errors
                })
            );
            baseSchema.ChildDeclInsu = Yup.array().of(
                Yup.object().shape({
                    hasChildLifeDeclPolicy: Yup.string().required('Please specify if there is a Declined Child Life Policy'),
                    childLifeDeclDetails: Yup.string(),
                }).test('conditional-validation-declined-child', 'All fields are required if you have a declined child life policy', function (value) {
                    const { hasChildLifeDeclPolicy, childLifeDeclDetails } = value || {};
                    console.log('Validation check for ChildDeclInsu:', { hasChildLifeDeclPolicy, childLifeDeclDetails });
        
                    if (hasChildLifeDeclPolicy === 'yes') {
                        const errors = {};
                        if (!childLifeDeclDetails) errors.childLifeDeclDetails = 'Please provide Declined Child Policy Details';
        
                        if (Object.keys(errors).length > 0) {
                            return this.createError({ path: '', message: errors });
                        }
                    }
                    return true; // No validation errors
                })
            );
        }
        return Yup.object().shape(baseSchema);
    };
    
    const formik = useFormik({
        initialValues: {
            lifeAInsu: {
                hasLifePolicy: '', 
                companyName: '',
                policyNo: '',
                lifeCover: '', 
                premium: '',
            },
            lifeADecl: {
                hasDeclLifePolicy: '', 
                declCompanyName: '',
                declPolicy: '',
                declReason: '',
            },
            lifeBInsu: {
                hasLifePolicyB: '', 
                companyNameB: '',
                policyNoB: '',
                lifeCoverB: '', 
                premiumB: '',
            },
            lifeBDeclInsu: {
                hasDeclLifePolicyB: '', 
                declinedCompanyNameB: '',
                declinedPolicyB: '',
                declinedReasonB: '',
            },
            // ChildInsu: childData.length > 0 ? childData.map(() => ({
            //     hasChildLifePolicy: '',
            //     childLifePolicyNo: '',
            // })) : [],
            ChildInsu:childInclusion && childData.length > 0 
            ? childData.map(() => ({ hasChildLifePolicy: '', childLifePolicyNo: '' }))
            : [],
            ChildDeclInsu:childInclusion &&  childData.length > 0 
                ? childData.map(() => ({ hasChildLifeDeclPolicy: '', childLifeDeclDetails: '' }))
                : [],
                // ChildDeclInsu: childData.length > 0 ? childData.map(() => ({
                //     hasChildLifeDeclPolicy: '',
                //     childLifeDeclDetails: '',
                // })) : [],
                
        },
        validationSchema: getValidationSchema(ApplicationType, childInclusion,childData.length),
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: false,
        onSubmit: async (values) => {

            console.log('childInclusion value:', childInclusion);

           
        },        
    });
    
    const navigate_to_family_info = () => {
        // navigate('/clientsdeclaration');
        navigate('/proposedInsuranceDetails');
    };

    const handleModalClose = () => {
        setShowPolicyModal(false);
        setShowDeclinedPolicyModal(false);
        setShowPolicyModalB(false);
        setShowDeclPolicyModalB(false);
        setShowChildPolicyModal(false);
        setShowDeclChildLifePolicyModal(false);
    }

    const handleCombinedSubmit = async (e) => {
        e.preventDefault();
        formik.handleSubmit();
        const values=formik.values;

        if (childInclusion && childData.length > 0) {
            const isAnyChildSelected = formik.values.ChildInsu.some(child => child.hasChildLifePolicy);
            const isAnyChildSelectedB = formik.values.ChildDeclInsu.some(child => child.hasChildLifeDeclPolicy);
            
        
            if (!isAnyChildSelected && !isAnyChildSelectedB) {
                alert('Please Select the Insu and Declined Child Policy');
                return;
            }
        
        }
        
            const InsuPrevId = previousId || `Q${Date.now()}`;
            sessionStorage.setItem('InsuPrevId', InsuPrevId);

            const prevInsuDetails = {
                primaryInsured: {
                    lifeInsurance: {
                        hasLifePolicy: values.lifeAInsu.hasLifePolicy,
                        insuPolicies: Array.isArray(policyData)
                            ? policyData.map(policy => ({
                                questionType: "insu",
                                companyName: policy.companyName,
                                policyNo: policy.policyNo,
                                lifeCover: policy.lifeCover,
                                premium: policy.premium,
                            }))
                            : [],
                    },
                    lifeDeclined: {
                        hasDeclLifePolicy: values.lifeADecl.hasDeclLifePolicy,
                        insuPolicies: Array.isArray(declinedPolicyData)
                            ? declinedPolicyData.map(policy => ({
                                questionType: "decl",
                                declCompanyName: policy.declCompanyName,
                                declPolicy: policy.declPolicy,
                                declReason: policy.declReason,
                            }))
                            : [],
                    },
                },
                secondaryInsured: {
                    lifeInsurance: {
                        hasLifePolicy: values.lifeBInsu.hasLifePolicyB,
                        insuPolicies: Array.isArray(policyDataB)
                            ? policyDataB.map(policy => ({
                                questionType: "insu",
                                companyNameB: policy.companyNameB,
                                policyNoB: policy.policyNoB,
                                lifeCoverB: policy.lifeCoverB,
                                premiumB: policy.premiumB,
                            }))
                            : [],
                    },
                    lifeDeclined: {
                        hasDeclLifePolicy: values.lifeBDeclInsu.hasDeclLifePolicyB,
                        insuPolicies: Array.isArray(declinedPolicyDataB)
                            ? declinedPolicyDataB.map(policy => ({
                                questionType: "decl",
                                declinedCompanyNameB: policy.declinedCompanyNameB,
                                declinedPolicyB: policy.declinedPolicyB,
                                declinedReasonB: policy.declinedReasonB,
                            }))
                            : [],
                    },
                },
                // Dynamic child Json
                ...values.ChildInsu.reduce((acc, child, index) => {
                    const childKey = `${['first', 'second', 'third', 'fourth', 'fifth'][index]}ChildInsured`;
                    
                    acc[childKey] = {
                        childInsurance: {
                            hasLifePolicy: child.hasChildLifePolicy,
                            insuPolicies: child.hasChildLifePolicy === 'yes' 
                                ? (Array.isArray(childPolicyData[index])
                                    ? childPolicyData[index].map(policy => ({
                                        questionType: "insu",
                                        childLifePolicyNo: policy.childLifePolicyNo,
                                    }))
                                    : [])
                                : [],
                        },
                        childDeclined: {
                            hasDeclLifePolicy: values.ChildDeclInsu[index]?.hasChildLifeDeclPolicy || 'no',
                            insuPolicies: values.ChildDeclInsu[index]?.hasChildLifeDeclPolicy === 'yes' 
                                ? (Array.isArray(declinedChildPolicyData[index])
                                    ? declinedChildPolicyData[index].map(policy => ({
                                        questionType: "decl",
                                        childLifeDeclDetails: policy.childLifeDeclDetails,
                                    }))
                                    : [])
                                : [],
                        },
                    };
                    return acc;
                }, {}),
                prev_insu_id: InsuPrevId,
            };
            
            console.log("Child Insured data in expected format:", prevInsuDetails);
            console.log("PrevInsuDetails before save:", prevInsuDetails);
            
            // data saving in indexedDb and Updating in al_application_main
            try {
                const saveData = {
                    primaryInsured: prevInsuDetails.primaryInsured,
                    prev_insu_id: InsuPrevId,
                };
                
                if (ApplicationType === 'Joint Life') {
                    saveData.secondaryInsured = prevInsuDetails.secondaryInsured;
                }
            
                // Define keys for all potential children
                const childKeys = ['firstChildInsured', 'secondChildInsured', 'thirdChildInsured', 'fourthChildInsured', 'fifthChildInsured'];
            
                // Only add defined child insured data
                childKeys.forEach((key) => {
                    if (childInclusion && prevInsuDetails[key]) {  // Check if child data is defined and selected
                        saveData[key] = prevInsuDetails[key];
                        console.log(`${key} data saved under PreviousID:`, prevInsuDetails[key]);
                    }
                });
            
                // Save data in the al_previous_insu_details table
                await saveDetail("al_previous_insu_details", saveData);
                console.log("Data saved under PreviousID:", saveData);
            
                // Update the al_application_main table with filtered child insured data
                const updatedPrevData = { ...prevData.result };
            
                // Ensure primary and secondary insured objects are initialized
                updatedPrevData.product.primaryInsured = updatedPrevData.product.primaryInsured || {};
                if (ApplicationType === 'Joint Life' || ApplicationType === 'lifeofanother') {
                    updatedPrevData.product.secondaryInsured = updatedPrevData.product.secondaryInsured || {};
                }
            
                // Set primary and secondary insurance details based on ApplicationType
                updatedPrevData.product.primaryInsured.prevInsurance = prevInsuDetails.primaryInsured;
                if (ApplicationType === 'Joint Life' || ApplicationType === 'lifeofanother') {
                    updatedPrevData.product.secondaryInsured.prevInsurance = prevInsuDetails.secondaryInsured;
                }
            
               // Ensure the updatedPrevData object is initialized
                if (!updatedPrevData.product) {
                    updatedPrevData.product = {};
                }

                childKeys.forEach((key) => {
                    if (childInclusion && prevInsuDetails[key]) {
                        // Initialize the child object if not already present
                        if (!updatedPrevData.product[key]) {
                            updatedPrevData.product[key] = {};
                        }
                        // Update prevInsurance for the child
                        updatedPrevData.product[key].prevInsurance = {
                            childDeclined: prevInsuDetails[key]?.childDeclined || {},
                            childInsurance: prevInsuDetails[key]?.childInsurance || {}
                        };
                    }
                });
            
                console.log("Updated product structure with only selected child insured:", updatedPrevData.product);
            
                // Update the al_application_main table with filtered data
                await updateDetailById("al_application_main", erefid, updatedPrevData);
                console.log("Data updated in al_application_main with selected children:", updatedPrevData);
            
            } catch (error) {
                console.error("Error during submission:", error);
            }

            // Auto sync Updation API call
            try {
                const payload = await findRecordById("al_application_main", erefid);
                console.log(
                  "Payload on Previous screen:::",
                  JSON.stringify(payload)
                );
        
                console.log(
                  "Payload after deleting sqsid and erefid:::",
                  JSON.stringify(payload.result)
                );
                setapipayload(payload.result);
        
                try {
                  const apicall = await fetch(
                    "http://192.168.2.7:4008/proposalManagementService/updateCaseData/" +
                      CaseId,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(payload.result),
                    }
                  );
                  const result = await apicall.json();
                  console.log("API Response on Previous screen:", result);
                } catch (error) {
                  console.log("Error while calling the API::::", error);
                }
        
                //navigate_to_clients();
            } catch (error) {
            console.log("Error while fetching:::", error);
            }
            
            navigate_to_family_info();
        
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
          document.body.classList.add("ios-safearea");
        } else {
          document.body.classList.remove("ios-safearea");
        }

    return (
         <SidebarLayout>
            <div className="previous-detail-container">
                <div className='previousForm'>
                    <div className="accordion">
                        <AccordionItem 
                            title="Life A: Proposed Insured Details" 
                            isOpen={openItem.includes('lifeA')}
                            onClick={() => handleAccordionClick('lifeA')}
                            disabled={isApplicationTypeNullOrEmpty}
                        >
                            {/* Question 1 - LifeA Insu Policy */}
                            <form onSubmit={formik.handleSubmit} className="eappprev">
                                <div className="form-group">
                                    <label htmlFor="lifeAInsu.hasLifePolicy">1.Do you already have any Life Policy/Proposals with Ceylinco Life or any other Insurance company?</label>
                                    <div className="row ml-3">
                                        <div className="form-check form-check-inline">
                                            <input
                                            type="radio"
                                            name="lifeAInsu.hasLifePolicy"
                                            value="yes"
                                            checked={formik.values.lifeAInsu.hasLifePolicy === 'yes'}
                                            onChange={handleRadioChange}
                                            className="form-check-input"
                                            id="lifeAInsu.policyYes"
                                            />
                                            <label htmlFor="lifeAInsu.policyYes" className="form-check-label">Yes</label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                                <input
                                                type="radio"
                                                name="lifeAInsu.hasLifePolicy"
                                                value="no"
                                                checked={formik.values.lifeAInsu.hasLifePolicy === 'no'}
                                                onChange={handleRadioChange}
                                                className="form-check-input"
                                                id="lifeAInsu.policyNo"
                                            />
                                                <label htmlFor="lifeAInsu.policyNo" className="form-check-label">No</label>
                                        </div>
                                    </div>
                                    {(formik.touched.lifeAInsu?.hasLifePolicy && formik.errors.lifeAInsu?.hasLifePolicy) && (
                                                    <div className="text-danger">{formik.errors.lifeAInsu.hasLifePolicy}</div>
                                                )}
                                                
                                </div>

                                {showForm && formik.values.lifeAInsu.hasLifePolicy === 'yes' && (
                                <div className="additional-fields mt-3">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <label htmlFor="lifeAInsu.companyName">Company Name<span className="text-danger">*</span></label>
                                            <select
                                                className="form-control"
                                                name="lifeAInsu.companyName"
                                                id="lifeAInsu.companyName"
                                                value={formik.values.lifeAInsu.companyName}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            >
                                                <option value="">Select Company</option>
                                                <option value="ceylinco">AIA Insurance Lanka PLC</option>
                                                <option value="allianz life insurance">Allianz Life Insurance Lanka Ltd.</option>
                                                <option value="aman takaful life">Aman takaful Life PLC</option>
                                                <option value="arpico insurance">Arpico Insurance PLC </option>
                                                <option value="softlogic life insurance">Softlogic Life Insurance PLC</option>
                                                <option value="ceylinco life insurance">Ceylinco Life Insurance Limited</option>
                                                <option value="cooplife insurance">Cooplife Insurance Limited</option>
                                                <option value="HNB">HNB Assurance PLC</option>
                                                <option value="janashakthi insurance">Janashakthi Insurance PLC</option>
                                                <option value="life insurance corporation">Life Insurance Corporation(Lanka)Ltd Insurance</option>
                                                <option value="LOLC">LOLC Life Assurance Limited</option>
                                                <option value="alNational insurancelianz">National Insurance Trust Fund</option>
                                                <option value="seemasahitha sanasa rakshna samagama">Seemasahitha Sanasa Rakshna Samagama</option>
                                                <option value="sri lanka insurance corporation">Sri Lanka Insurance Corporation Ltd</option>
                                                <option value="union assurance">Union Assurance PLC</option>
                                            </select>
                                            {formik.touched.lifeAInsu?.companyName && formik.errors.lifeAInsu?.companyName ? (
                                                <div className="text-danger">{formik.errors.lifeAInsu.companyName}</div>
                                            ) : null}
                                        </div>
                                        

                                        <div className="col-md-6">
                                            <label htmlFor="lifeAInsu.policyNo">Policy No/Proposal No<span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                name="lifeAInsu.policyNo"
                                                id="lifeAInsu.policyNo"
                                                className="form-control"
                                                value={formik.values.lifeAInsu.policyNo}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="Policy No/Proposal No"
                                            />
                                            {formik.touched.lifeAInsu?.policyNo && formik.errors.lifeAInsu?.policyNo ? (
                                                <div className="text-danger">{formik.errors.lifeAInsu.policyNo}</div>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <label htmlFor="lifeAInsu.lifeCover">Total Life Cover<span className="text-danger">*</span></label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="lifeAInsu.lifeCover"
                                                id="lifeAInsu.lifeCover"
                                                value={formik.values.lifeAInsu.lifeCover}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="Total Life Cover"
                                            />
                                            {formik.touched.lifeAInsu?.lifeCover && formik.errors.lifeAInsu?.lifeCover ? (
                                                <div className="text-danger">{formik.errors.lifeAInsu.lifeCover}</div>
                                            ) : null}
                                        </div>

                                        <div className="col-md-6">
                                            <label htmlFor="lifeAInsu.premium">Premium<span className="text-danger">*</span></label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="lifeAInsu.premium"
                                                id="lifeAInsu.premium"
                                                value={formik.values.lifeAInsu.premium}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="Premium"
                                            />
                                            {formik.touched.lifeAInsu?.premium && formik.errors.lifeAInsu?.premium ? (
                                                <div className="text-danger">{formik.errors.lifeAInsu.premium}</div>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="mt-3 d-flex justify-content-end">
                                        <button className="btn btn-danger mr-2" onClick={handleCancel}>
                                            Cancel
                                        </button>
                                        <button className="btn btn-danger" onClick={handleSave}>
                                            Save
                                        </button>
                                    </div>
                                </div>
                                )}

                                {/* Render Table for Policies */}
                                {policyData.length > 0 && (
                                    <div className="mt-3">
                                        <div className="table-responsive">
                                            <Table striped bordered hover>
                                                <thead className="heading">
                                                    <tr>
                                                        <th>Company Name</th>
                                                        <th>Policy No/Proposal No</th>
                                                        <th>Total Life Cover</th>
                                                        <th>Premium</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {policyData.map((policy, index) => (
                                                        <tr key={index}>
                                                            <td>{policy.companyName}</td>
                                                            <td>{policy.policyNo}</td>
                                                            <td>{policy.lifeCover}</td>
                                                            <td>{policy.premium}</td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm"
                                                                    onClick={() => handleDelete(index)}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                        <button className="btn btn-danger mt-3" onClick={handleAddMore}>Add More</button>
                                    </div>
                                )}

                                <div className="form-group mt-5">
                                    <label htmlFor="lifeADecl.hasDeclLifePolicy">
                                    2.Has any company ever declined your application for a life assurance or personal accident insurance or reinstatement or postponed or charged an extra premium or issued with a clause, 
                                    offered with reduced sum assured or accepted on some other plan than one applied for?
                                    </label>
                                    <div className="row ml-3">
                                        <div className="form-check form-check-inline">
                                            <input
                                                type="radio"
                                                name="lifeADecl.hasDeclLifePolicy"
                                                value="yes"
                                                checked={formik.values.lifeADecl.hasDeclLifePolicy === 'yes'}
                                                onChange={handleDeclRadioChange}
                                                className="form-check-input"
                                                id="lifeADecl.declineYes"
                                            />
                                            <label htmlFor="lifeADecl.declineYes" className="form-check-label">Yes</label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input
                                                type="radio"
                                                name="lifeADecl.hasDeclLifePolicy"
                                                value="no"
                                                checked={formik.values.lifeADecl.hasDeclLifePolicy === 'no'}
                                                onChange={handleDeclRadioChange}
                                                className="form-check-input"
                                                id="lifeADecl.declineNo"
                                            />
                                            <label htmlFor="lifeADecl.declineNo" className="form-check-label">No</label>
                                        </div>
                                    </div>
                                    {(formik.touched.lifeADecl?.hasDeclLifePolicy && formik.errors.lifeADecl?.hasDeclLifePolicy) && (
                                                    <div className="text-danger">{formik.errors.lifeADecl.hasDeclLifePolicy}</div>
                                                )}
                                </div>
                                
                                {showAdditionalFields2 && formik.values.lifeADecl.hasDeclLifePolicy === 'yes' && (
                                    <div className="additional-fields mt-3">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <label htmlFor="lifeADecl.declCompanyName">Company Name<span className="text-danger">*</span></label>
                                                <select
                                                    className="form-control"
                                                    name="lifeADecl.declCompanyName"
                                                    id="lifeADecl.declCompanyName"
                                                    value={formik.values.lifeADecl.declCompanyName}
                                                    onChange={formik.handleChange}
                                                >
                                                    <option value="">Select Company</option>
                                                    <option value="ceylinco">AIA Insurance Lanka PLC</option>
                                                    <option value="allianz life insurance">Allianz Life Insurance Lanka Ltd.</option>
                                                    <option value="aman takaful life">Aman takaful Life PLC</option>
                                                    <option value="arpico insurance">Arpico Insurance PLC </option>
                                                    <option value="softlogic life insurance">Softlogic Life Insurance PLC</option>
                                                    <option value="ceylinco life insurance">Ceylinco Life Insurance Limited</option>
                                                    <option value="cooplife insurance">Cooplife Insurance Limited</option>
                                                    <option value="HNB">HNB Assurance PLC</option>
                                                    <option value="janashakthi insurance">Janashakthi Insurance PLC</option>
                                                    <option value="life insurance corporation">Life Insurance Corporation(Lanka)Ltd Insurance</option>
                                                    <option value="LOLC">LOLC Life Assurance Limited</option>
                                                    <option value="alNational insurancelianz">National Insurance Trust Fund</option>
                                                    <option value="seemasahitha sanasa rakshna samagama">Seemasahitha Sanasa Rakshna Samagama</option>
                                                    <option value="sri lanka insurance corporation">Sri Lanka Insurance Corporation Ltd</option>
                                                    <option value="union assurance">Union Assurance PLC</option>
                                                </select>
                                                {formik.touched.lifeADecl?.declCompanyName && formik.errors.lifeADecl?.declCompanyName ? (
                                                    <div className="text-danger">{formik.errors.lifeADecl.declCompanyName}</div>
                                                ) : null}
                                            </div>

                                            <div className="col-md-6">
                                                <label htmlFor="lifeADecl.declPolicy">Policy No/Proposal No<span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="lifeADecl.declPolicy"
                                                    id="lifeADecl.declPolicy"
                                                    value={formik.values.lifeADecl.declPolicy}
                                                    onChange={formik.handleChange}
                                                    placeholder="Policy No/Proposal No"
                                                />
                                                {formik.touched.lifeADecl?.declPolicy && formik.errors.lifeADecl?.declPolicy ? (
                                                    <div className="text-danger">{formik.errors.lifeADecl.declPolicy}</div>
                                                ) : null}
                                            </div>

                                            <div className="col-md-6">
                                                <label htmlFor="lifeADecl.declReason">Reason(maximum 300 characters)<span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="lifeADecl.declReason"
                                                    id="lifeADecl.declReason"
                                                    value={formik.values.lifeADecl.declReason}
                                                    onChange={formik.handleChange}
                                                    placeholder="Reason for Decline"
                                                />
                                                {formik.touched.lifeADecl?.declReason && formik.errors.lifeADecl?.declReason ? (
                                                    <div className="text-danger">{formik.errors.lifeADecl.declReason}</div>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="mt-3 d-flex justify-content-end">
                                            <button type="button" className="btn btn-danger mr-2" onClick={handleDeclCancel}>
                                                Cancel
                                            </button>
                                            <button className="btn btn-danger" onClick={handleSaveDeclinedPolicy}>
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                {declinedPolicyData.length > 0 && (
                                    <div className="mt-3">
                                        <div className="table-responsive"> 
                                            <Table striped bordered hover>
                                                <thead className="heading">
                                                    <tr>
                                                        <th>Company Name</th>
                                                        <th>Policy No/Proposal No</th>
                                                        <th>Reason for Decline</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {declinedPolicyData.map((policy, index) => (
                                                        <tr key={index}>
                                                            <td>{policy.declCompanyName}</td>
                                                            <td>{policy.declPolicy}</td>
                                                            <td>{policy.declReason}</td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm"
                                                                    onClick={() => handleDeleteDeclinedPolicy(index)}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                        <button className="btn btn-danger mt-3" onClick={handleAddMoreDeclinedPolicy}>Add More</button>
                                    </div>
                                )}
                            </form>
                        </AccordionItem>

                        {/* Life B accordion, can be conditionally disabled based on the application type */}
                        <AccordionItem
                                title="Life B: Proposed Insured Details"
                                isOpen={openItem.includes('lifeB')}
                                onClick={() => handleAccordionClick('lifeB')}
                                disabled={isApplicationTypeNullOrEmpty || ApplicationType === 'Single Life'}
                            >
                                {/* Question 1 - Life B Policy */}
                                <form onSubmit={formik.handleSubmit} className="eappprev">
                                <div className="form-group">
                                    <label htmlFor="lifeBInsu.hasLifePolicyB">1.Do you already have any Life Policy/Proposals with Ceylinco Life or any other Insurance company?</label>
                                    <div className="row ml-3">
                                        <div className="form-check form-check-inline">
                                            <input
                                                type="radio"
                                                name="lifeBInsu.hasLifePolicyB"
                                                value="yes"
                                                checked={formik.values.lifeBInsu.hasLifePolicyB === 'yes'}
                                                onChange={handleRadioChangeB}
                                                className="form-check-input"
                                                id="lifeBInsu.policyYesB"
                                            
                                            />
                                            <label htmlFor="lifeBInsu.policyYesB" className="form-check-label">Yes</label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input
                                                type="radio"
                                                name="lifeBInsu.hasLifePolicyB"
                                                value="no"
                                                checked={formik.values.lifeBInsu.hasLifePolicyB === 'no'}
                                                onChange={handleRadioChangeB}
                                                className="form-check-input"
                                                id="lifeBInsu.policyNoB"
                                            />
                                            <label htmlFor="lifeBInsu.policyNoB" className="form-check-label">No</label>
                                        </div>
                                    </div>
                                    {formik.touched.lifeBInsu?.hasLifePolicyB && formik.errors.lifeBInsu?.hasLifePolicyB ? (
                                    <div className="text-danger">{formik.errors.lifeBInsu.hasLifePolicyB}</div>
                                ) : null}
                                </div>

                                {showFormB && formik.values.lifeBInsu.hasLifePolicyB === 'yes' && (
                                    <div className="additional-fields mt-3">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <label htmlFor="lifeBInsu.companyNameB">Company Name<span className="text-danger">*</span></label>
                                                <select
                                                    className="form-control"
                                                    name="lifeBInsu.companyNameB"
                                                    id="lifeBInsu.companyNameB"
                                                    value={formik.values.lifeBInsu.companyNameB}
                                                    onChange={formik.handleChange}
                                                >
                                                <option value="">Select Company</option>
                                                    <option value="ceylinco">AIA Insurance Lanka PLC</option>
                                                    <option value="allianz life insurance">Allianz Life Insurance Lanka Ltd.</option>
                                                    <option value="aman takaful life">Aman takaful Life PLC</option>
                                                    <option value="arpico insurance">Arpico Insurance PLC </option>
                                                    <option value="softlogic life insurance">Softlogic Life Insurance PLC</option>
                                                    <option value="ceylinco life insurance">Ceylinco Life Insurance Limited</option>
                                                    <option value="cooplife insurance">Cooplife Insurance Limited</option>
                                                    <option value="HNB">HNB Assurance PLC</option>
                                                    <option value="janashakthi insurance">Janashakthi Insurance PLC</option>
                                                    <option value="life insurance corporation">Life Insurance Corporation(Lanka)Ltd Insurance</option>
                                                    <option value="LOLC">LOLC Life Assurance Limited</option>
                                                    <option value="alNational insurancelianz">National Insurance Trust Fund</option>
                                                    <option value="seemasahitha sanasa rakshna samagama">Seemasahitha Sanasa Rakshna Samagama</option>
                                                    <option value="sri lanka insurance corporation">Sri Lanka Insurance Corporation Ltd</option>
                                                    <option value="union assurance">Union Assurance PLC</option>
                                                </select>
                                                {formik.touched.lifeBInsu?.companyNameB && formik.errors.lifeBInsu?.companyNameB ? (
                                                <div className="text-danger">{formik.errors.lifeBInsu.companyNameB}</div>
                                            ) : null}
                                            </div>

                                            <div className="col-md-6">
                                                <label htmlFor="lifeBInsu.policyNoB">Policy No/Proposal No<span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    name="lifeBInsu.policyNoB"
                                                    id="lifeBInsu.policyNoB"
                                                    className="form-control"
                                                    value={formik.values.lifeBInsu.policyNoB}
                                                    onChange={formik.handleChange}
                                                    placeholder="Policy No/Proposal No"
                                                />
                                                {formik.touched.lifeBInsu?.policyNoB && formik.errors.lifeBInsu?.policyNoB ? (
                                                <div className="text-danger">{formik.errors.lifeBInsu.policyNoB}</div>
                                            ) : null}
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6">
                                                <label htmlFor="lifeBInsu.lifeCoverB">Total Life Cover<span className="text-danger">*</span></label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="lifeBInsu.lifeCoverB"
                                                    id="lifeBInsu.lifeCoverB"
                                                    value={formik.values.lifeBInsu.lifeCoverB}
                                                    onChange={formik.handleChange}
                                                    placeholder="Total Life Cover"
                                                />
                                                {formik.touched.lifeBInsu?.lifeCoverB && formik.errors.lifeBInsu?.lifeCoverB ? (
                                                <div className="text-danger">{formik.errors.lifeBInsu.lifeCoverB}</div>
                                            ) : null}
                                            </div>

                                            <div className="col-md-6">
                                                <label htmlFor="lifeBInsu.premiumB">Premium<span className="text-danger">*</span></label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="lifeBInsu.premiumB"
                                                    id="lifeBInsu.premiumB"
                                                    value={formik.values.lifeBInsu.premiumB}
                                                    onChange={formik.handleChange}
                                                    placeholder="Premium"
                                                />
                                                {formik.touched.lifeBInsu?.premiumB && formik.errors.lifeBInsu?.premiumB ? (
                                                <div className="text-danger">{formik.errors.lifeBInsu.premiumB}</div>
                                            ) : null}
                                            </div>
                                        </div>

                                        <div className="mt-3 d-flex justify-content-end">
                                            <button className="btn btn-danger mr-2" onClick={handleCancelB}>
                                                Cancel
                                            </button>
                                            <button className="btn btn-danger" onClick={handleSaveB}>
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Render Table for Life B Policies */}
                                {policyDataB.length > 0 && (
                                    <div className="mt-3">
                                        <div className="table-responsive">
                                            <Table striped bordered hover>
                                                <thead className="heading">
                                                    <tr>
                                                        <th>Company Name</th>
                                                        <th>Policy No/Proposal No</th>
                                                        <th>Total Life Cover</th>
                                                        <th>Premium</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {policyDataB.map((policy, index) => (
                                                        <tr key={index}>
                                                            <td>{policy.companyNameB}</td>
                                                            <td>{policy.policyNoB}</td>
                                                            <td>{policy.lifeCoverB}</td>
                                                            <td>{policy.premiumB}</td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm"
                                                                    onClick={() => handleDeleteB(index)}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                        {/* Add More Button Logic */}
                                        <button className="btn btn-danger mt-3" onClick={handleAddMoreB}>Add More</button>
                                    </div>
                                )}

                                {/* Question 2 - Life B Declined Policy */}
                                <div className="form-group mt-5">
                                    <label htmlFor="lifeBDeclInsu.hasDeclLifePolicyB"> 2.Has any company ever declined your application for a life assurance or personal accident insurance or reinstatement or postponed or charged an extra premium or issued with a clause, 
                                    offered with reduced sum assured or accepted on some other plan than one applied for?</label>
                                    <div className="row ml-3">
                                        <div className="form-check form-check-inline">
                                            <input
                                                type="radio"
                                                name="lifeBDeclInsu.hasDeclLifePolicyB"
                                                value="yes"
                                                checked={formik.values.lifeBDeclInsu.hasDeclLifePolicyB === 'yes'}
                                                onChange={handleDeclRadioChangeB}
                                                className="form-check-input"
                                                id="lifeBDeclInsu.declineYesB"
                                            />
                                            <label htmlFor="lifeBDeclInsu.declineYesB" className="form-check-label">Yes</label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input
                                                type="radio"
                                                name="lifeBDeclInsu.hasDeclLifePolicyB"
                                                value="no"
                                                checked={formik.values.lifeBDeclInsu.hasDeclLifePolicyB === 'no'}
                                                onChange={handleDeclRadioChangeB}
                                                className="form-check-input"
                                                id="lifeBDeclInsu.declineNoB"
                                            />
                                            <label htmlFor="lifeBDeclInsu.declineNoB" className="form-check-label">No</label>
                                        </div>
                                    </div>
                                    {formik.touched.lifeBDeclInsu?.hasDeclLifePolicyB && formik.errors.lifeBDeclInsu?.hasDeclLifePolicyB ? (
                                            <div className="text-danger">{formik.errors.lifeBDeclInsu.hasDeclLifePolicyB}</div>
                                        ) : null}
                                </div>

                                {declinedShowFormB && formik.values.lifeBDeclInsu.hasDeclLifePolicyB === 'yes' && (
                                    <div className="additional-fields mt-3">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <label>Company Name<span className="text-danger">*</span></label>
                                                <select
                                                    className="form-control"
                                                    name="lifeBDeclInsu.declinedCompanyNameB"
                                                    id="lifeBDeclInsu.declinedCompanyNameB"
                                                    value={formik.values.lifeBDeclInsu.declinedCompanyNameB}
                                                    onChange={formik.handleChange}
                                                >
                                                    <option value="">Select Company</option>
                                                    <option value="ceylinco">AIA Insurance Lanka PLC</option>
                                                    <option value="allianz life insurance">Allianz Life Insurance Lanka Ltd.</option>
                                                    <option value="aman takaful life">Aman takaful Life PLC</option>
                                                    <option value="arpico insurance">Arpico Insurance PLC </option>
                                                    <option value="softlogic life insurance">Softlogic Life Insurance PLC</option>
                                                    <option value="ceylinco life insurance">Ceylinco Life Insurance Limited</option>
                                                    <option value="cooplife insurance">Cooplife Insurance Limited</option>
                                                    <option value="HNB">HNB Assurance PLC</option>
                                                    <option value="janashakthi insurance">Janashakthi Insurance PLC</option>
                                                    <option value="life insurance corporation">Life Insurance Corporation(Lanka)Ltd Insurance</option>
                                                    <option value="LOLC">LOLC Life Assurance Limited</option>
                                                    <option value="alNational insurancelianz">National Insurance Trust Fund</option>
                                                    <option value="seemasahitha sanasa rakshna samagama">Seemasahitha Sanasa Rakshna Samagama</option>
                                                    <option value="sri lanka insurance corporation">Sri Lanka Insurance Corporation Ltd</option>
                                                    <option value="union assurance">Union Assurance PLC</option>
                                                </select>
                                                {formik.touched.lifeBDeclInsu?.declinedCompanyNameB && formik.errors.lifeBDeclInsu?.declinedCompanyNameB ? (
                                                <div className="text-danger">{formik.errors.lifeBDeclInsu.declinedCompanyNameB}</div>
                                            ) : null}
                                            </div>

                                            <div className="col-md-6">
                                                <label>Policy No/Proposal No<span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="lifeBDeclInsu.declinedPolicyB"
                                                    id="lifeBDeclInsu.declinedPolicyB"
                                                    value={formik.values.lifeBDeclInsu.declinedPolicyB}
                                                    onChange={formik.handleChange}
                                                    placeholder="Policy No/Proposal No"
                                                />
                                                {formik.touched.lifeBDeclInsu?.declinedPolicyB && formik.errors.lifeBDeclInsu?.declinedPolicyB ? (
                                                <div className="text-danger">{formik.errors.lifeBDeclInsu.declinedPolicyB}</div>
                                            ) : null}
                                            </div>

                                            <div className="col-md-6">
                                                <label>Reason(maximum 300 characters)<span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="lifeBDeclInsu.declinedReasonB"
                                                    id="lifeBDeclInsu.declinedReasonB"
                                                    value={formik.values.lifeBDeclInsu.declinedReasonB}
                                                    onChange={formik.handleChange}
                                                    placeholder="Reason for Decline"
                                                />
                                                {formik.touched.lifeBDeclInsu?.declinedReasonB && formik.errors.lifeBDeclInsu?.declinedReasonB ? (
                                                <div className="text-danger">{formik.errors.lifeBDeclInsu.declinedReasonB}</div>
                                            ) : null}
                                            </div>
                                        </div>

                                        <div className="mt-3 d-flex justify-content-end">
                                            <button className="btn btn-danger mr-2" onClick={handleDeclCancelB}>
                                                Cancel
                                            </button>
                                            <button className="btn btn-danger" onClick={handleSaveDeclinedPolicyB}>
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Render Table for Declined Policies for Life B */}
                                {declinedPolicyDataB.length > 0 && (
                                    <div className="mt-3">
                                        <div className="table-responsive">
                                            <Table striped bordered hover>
                                                <thead className="heading">
                                                    <tr>
                                                        <th>Company Name</th>
                                                        <th>Policy No/Proposal No</th>
                                                        <th>Reason for Decline</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {declinedPolicyDataB.map((policy, index) => (
                                                        <tr key={index}>
                                                            <td>{policy.declinedCompanyNameB}</td>
                                                            <td>{policy.declinedPolicyB}</td>
                                                            <td>{policy.declinedReasonB}</td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm"
                                                                    onClick={() => handleDeleteDeclinedB(index)}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                        <button className="btn btn-danger mt-3" onClick={handleDeclAddMoreB}>Add More</button>
                                    </div>
                                )}
                                </form>
                        </AccordionItem>

                        {/* Child Inclusion: Enabled based on logic */}
                        <AccordionItem
                            title="Child/Children Inclusion"
                            isOpen={openItem.includes('Child')}
                            onClick={() => handleAccordionClick('Child')}
                            disabled={!isChildInclusionEnabled} 
                        >
                            <form onSubmit={formik.handleSubmit} className="eappprev">
                            {childData.length > 0 ? (
                                childData.map((child, index) => (
                                    <div key={index}>
                                        <p>Child {index + 1}</p>

                                        {/* Question 1: Has Life Policy */}
                                        <div className="form-group">
                                            <label htmlFor={`ChildInsu.${index}.hasChildLifePolicy`}>
                                                1. Has your child received any Ceylinco Life insurance policy that included Ceylinco Life hospital Cash benefit or 
                                                Ceylinco Life Major Surgery benefit or Ceylinco Life Digasiri benfit or Ceylinco Life Health support?
                                            </label>
                                            <div className="row ml-3">
                                                <div className="form-check form-check-inline">
                                                    <input
                                                        type="radio"
                                                        name={`ChildInsu[${index}].hasChildLifePolicy`}
                                                        value="yes"
                                                        checked={formik.values.ChildInsu[index]?.hasChildLifePolicy === 'yes'}
                                                        
                                                        onChange={(e) => {
                                                            formik.setFieldValue(`ChildInsu[${index}].hasChildLifePolicy`, 'yes');
                                                            handleRadioChangeForChildLifePolicy(index)(e);
                                                        }}
                                                        className="form-check-input"
                                                        onBlur={formik.handleBlur}
                                                        id={`ChildInsu.policyYes.${index}`}
                                                    />
                                                    <label htmlFor={`ChildInsu.policyYes.${index}`} className="form-check-label">Yes</label>
                                                </div>
                                                <div className="form-check form-check-inline">
                                                    <input
                                                        type="radio"
                                                        name={`ChildInsu[${index}].hasChildLifePolicy`}
                                                        value="no"
                                                        checked={formik.values.ChildInsu[index]?.hasChildLifePolicy === 'no'}
                                                        onChange={(e) => {
                                                            formik.setFieldValue(`ChildInsu[${index}].hasChildLifePolicy`, 'no');
                                                            handleRadioChangeForChildLifePolicy(index)(e);
                                                        }}
                                                        className="form-check-input"
                                                        onBlur={formik.handleBlur}
                                                        id={`ChildInsu.policyNo.${index}`}
                                                    />
                                                    <label htmlFor={`ChildInsu.policyNo.${index}`} className="form-check-label">No</label>
                                                </div>
                                            </div>
                                            {(formik.touched.ChildInsu?.[index]?.hasChildLifePolicy && 
                                                formik.errors.ChildInsu?.[index]?.hasChildLifePolicy) && (
                                                    <div className="text-danger">{formik.errors.ChildInsu[index].hasChildLifePolicy}</div>
                                                )}
                                        </div>

                                        {formik.values.ChildInsu[index]?.hasChildLifePolicy === 'yes' && childForm[index] && (
                                        <div className="additional-fields mt-3">
                                            <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor={`ChildInsu.${index}.childLifePolicyNo`}>
                                                Policy No/Proposal No<span className="text-danger">*</span>
                                                </label>
                                                <input
                                                type="text"
                                                name={`ChildInsu.${index}.childLifePolicyNo`}
                                                className="form-control"
                                                value={formik.values.ChildInsu[index]?.childLifePolicyNo || ''}
                                                onChange={formik.handleChange}
                                                id={`ChildInsu.${index}.childLifePolicyNo`}
                                                placeholder="Policy No/Proposal No"
                                                disabled={!childForm[index]} 
                                                />
                                            </div>
                                            </div>
                                            {formik.touched.ChildInsu?.[index]?.childLifePolicyNo &&
                                            formik.errors.ChildInsu?.[index]?.childLifePolicyNo && (
                                                <div className="text-danger">
                                                {formik.errors.ChildInsu[index].childLifePolicyNo}
                                                </div>
                                            )}
                                            

                                            <div className="mt-3 d-flex justify-content-end">
                                            <button
                                                className="btn btn-danger mr-2"
                                                onClick={() => handleChildLifeCancel(index)}
                                                disabled={!childForm[index]} // Disable Cancel if form is hidden
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                onClick={(e) => handleChildLifeSave(index, e)}
                                                disabled={!childForm[index]} // Disable Save if form is hidden
                                            >
                                                Save
                                            </button>
                                            </div>
                                        </div>
                                        )}


                                        {/* Display Policies Table */}
                                        {childPolicyData[index]?.length > 0 && (
                                            <div className="mt-3">
                                                <div className="table-responsive">
                                                    <Table striped bordered hover>
                                                        <thead className="heading">
                                                            <tr>
                                                                <th>Policy No/Proposal No</th>
                                                                <th></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {childPolicyData[index].map((policy, policyIndex) => (
                                                                <tr key={policyIndex}>
                                                                    <td>{policy.childLifePolicyNo}</td>
                                                                    <td>
                                                                        <button
                                                                            className="btn btn-sm"
                                                                            onClick={() => handleChildLifeDelete(index, policyIndex)}
                                                                        >
                                                                            <FontAwesomeIcon icon={faTrash} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                </div>
                                                <button className="btn btn-danger mt-3" onClick={() => handleChildLifeAddMore(index)}>Add More</button>
                                            </div>
                                        )}

                                        {/* Question 2: Has Declined Life Policy */}
                                        <div className="form-group mt-3">
                                            <label htmlFor={`ChildDeclInsu.${index}.hasChildLifeDeclPolicy`}>
                                                2. Has any proposal for child protection or critical illness cover ever been declined or postponed or been accepted with an extra premium with regard to you child's insurance?
                                            </label>
                                            <div className="row ml-3">
                                                <div className="form-check form-check-inline">
                                                    <input
                                                        type="radio"
                                                        name={`ChildDeclInsu[${index}].hasChildLifeDeclPolicy`}
                                                        value="yes"
                                                        checked={formik.values.ChildDeclInsu[index]?.hasChildLifeDeclPolicy === 'yes'}
                                                        onChange={(e) => {
                                                            formik.setFieldValue(`ChildDeclInsu[${index}].hasChildLifeDeclPolicy`, 'yes');
                                                            handleRadioChangeForChildLifeDeclPolicy(index)(e);
                                                        }}
                                                        className="form-check-input"
                                                        onBlur={formik.handleBlur}
                                                        id={`ChildDeclInsu.policyYes.${index}`}
                                                    />
                                                    <label htmlFor={`ChildDeclInsu.policyYes.${index}`} className="form-check-label">Yes</label>
                                                </div>
                                                <div className="form-check form-check-inline">
                                                    <input
                                                        type="radio"
                                                        name={`ChildDeclInsu[${index}].hasChildLifeDeclPolicy`}
                                                        value="no"
                                                        checked={formik.values.ChildDeclInsu[index]?.hasChildLifeDeclPolicy === 'no'}
                                                        onChange={(e) => {
                                                            formik.setFieldValue(`ChildDeclInsu[${index}].hasChildLifeDeclPolicy`, 'no');
                                                            handleRadioChangeForChildLifeDeclPolicy(index)(e);
                                                        }}
                                                        className="form-check-input"
                                                        onBlur={formik.handleBlur}
                                                        id={`ChildDeclInsu.policyNo.${index}`}
                                                    />
                                                    <label htmlFor={`ChildDeclInsu.policyNo.${index}`} className="form-check-label">No</label>
                                                </div>
                                            </div>
                                            {(formik.touched.ChildDeclInsu?.[index]?.hasChildLifeDeclPolicy && formik.errors.ChildDeclInsu?.[index]?.hasChildLifeDeclPolicy) && (
                                                        <div className="text-danger">{formik.errors.ChildDeclInsu[index].hasChildLifeDeclPolicy}</div>
                                                    )}
                                        </div>

                                        {formik.values.ChildDeclInsu[index]?.hasChildLifeDeclPolicy === 'yes' &&
                                            childDeclinedShowForm[index] && ( // Check the visibility state
                                                <div className="additional-fields mt-3">
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                    <label htmlFor={`ChildDeclInsu.${index}.childLifeDeclDetails`}>
                                                        Details (maximum 300 characters)<span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name={`ChildDeclInsu.${index}.childLifeDeclDetails`}
                                                        className="form-control"
                                                        value={formik.values.ChildDeclInsu[index]?.childLifeDeclDetails || ''}
                                                        onChange={formik.handleChange}
                                                        id={`ChildDeclInsu.${index}.childLifeDeclDetails`}
                                                        placeholder="Details of Decline"
                                                        disabled={!childDeclinedShowForm[index]} // Disable input if form is hidden
                                                    />
                                                    </div>
                                                </div>
                                                {formik.touched.ChildDeclInsu?.[index]?.childLifeDeclDetails &&
                                                    formik.errors.ChildDeclInsu?.[index]?.childLifeDeclDetails && (
                                                    <div className="text-danger">
                                                        {formik.errors.ChildDeclInsu[index].childLifeDeclDetails}
                                                    </div>
                                                    )}
                                                <div className="mt-3 d-flex justify-content-end">
                                                    <button
                                                    className="btn btn-danger mr-2"
                                                    onClick={() => handleDeclinedChildLifePolicyCancel(index)}
                                                    disabled={!childDeclinedShowForm[index]} // Disable Cancel if form is hidden
                                                    >
                                                    Cancel
                                                    </button>
                                                    <button
                                                    className="btn btn-danger"
                                                    onClick={(e) => handleSaveChildLifeDeclinedPolicy(index, e)}
                                                    disabled={!childDeclinedShowForm[index]} // Disable Save if form is hidden
                                                    >
                                                    Save
                                                    </button>
                                                </div>
                                                </div>
                                        )}


                                        {declinedChildPolicyData[index]?.length > 0 && (
                                            <div className="mt-3">
                                                <div className="table-responsive">
                                                    <Table striped bordered hover>
                                                        <thead className="heading">
                                                            <tr>
                                                                <th>Details</th>
                                                                <th></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {declinedChildPolicyData[index].map((declinedPolicy, declinedPolicyIndex) => (
                                                                <tr key={declinedPolicyIndex}>
                                                                    <td>{declinedPolicy.childLifeDeclDetails}</td>
                                                                    <td>
                                                                        <button
                                                                            className="btn btn-sm"
                                                                            onClick={() => handleChildLifeDeclDelete(index, declinedPolicyIndex)}
                                                                        >
                                                                            <FontAwesomeIcon icon={faTrash} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                </div>
                                                <button className="btn btn-danger mt-3" onClick={() => handleChildLifeDeclAddMore(index)}>Add More</button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>No children data available</p>
                            )}
                        </form>
                        </AccordionItem>

                        {/* Combined Submit Button */}
                        {!isKeyboardVisible && (
                            <div className="iosfixednextprevbutton">
                            <div className="fixednextprevbutton d-flex justify-content-between">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary btnprev" 
                                    onClick={() => navigate('/benefiecierydetails')}
                                > Prev </button>
                                <button type="submit" className="btn btnnext" onClick={(e) => {
                                console.log("formik error", formik.errors );
                                handleCombinedSubmit(e);
                                }}
                                >
                                Next
                                </button>
                            </div>
                            </div>
                        )}
                    </div>
                </div>
                

                    {/* Policy Modal */}
                    <Modal show={showPolicyModal} onHide={handleModalClose}>
                        <Modal.Header>
                            <Modal.Title>Limit Reached</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>You have reached the maximum number of Life Policies/Proposals.</Modal.Body>
                        <Modal.Footer>
                            <Button variant="danger" onClick={handleModalClose}>Close</Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Declined Policy Modal */}
                    <Modal show={showDeclinedPolicyModal} onHide={handleModalClose}>
                            <Modal.Header>
                                <Modal.Title>Limit Reached</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>You have reached the maximum number of Declined Life Policies/Proposals.</Modal.Body>
                            <Modal.Footer>
                                <Button variant="danger" onClick={handleModalClose}>Close</Button>
                            </Modal.Footer>
                    </Modal>

                    {/* Policy Modal lifeB */}
                    <Modal show={showPolicyModalB} onHide={handleModalClose}>
                            <Modal.Header>
                                <Modal.Title>Limit Reached</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>You have reached the maximum number of Life Policies/Proposals.</Modal.Body>
                            <Modal.Footer>
                                <Button variant="danger" onClick={handleModalClose}>Close</Button>
                            </Modal.Footer>
                    </Modal>

                        {/* Declined Policy Modal */}
                    <Modal show={showDeclPolicyModalB} onHide={handleModalClose}>
                        <Modal.Header>
                            <Modal.Title>Limit Reached</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>You have reached the maximum number of Declined Life Policies/Proposals.</Modal.Body>
                        <Modal.Footer>
                            <Button variant="danger" onClick={handleModalClose}>Close</Button>
                        </Modal.Footer>
                    </Modal>

                        {/* Child Policy Modal */}
                    <Modal show={showChildPolicyModal} onHide={handleModalClose}>
                        <Modal.Header>
                            <Modal.Title>Limit Reached</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>You have reached the maximum number of Life Policies/Proposals.</Modal.Body>
                        <Modal.Footer>
                            <Button variant="danger" onClick={handleModalClose}>Close</Button>
                        </Modal.Footer>
                    </Modal>

                        {/* Child Declined Policy Modal*/}
                    <Modal show={showDeclChildLifePolicyModal} onHide={handleModalClose}>
                        <Modal.Header>
                            <Modal.Title>Limit Reached</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>You have reached the maximum number of Declined Life Policies/Proposals.</Modal.Body>
                        <Modal.Footer>
                            <Button variant="danger" onClick={handleModalClose}>Close</Button>
                        </Modal.Footer>
                    </Modal> 
            </div>
         </SidebarLayout>
    );
};

export default PreviousLifeInsurance;