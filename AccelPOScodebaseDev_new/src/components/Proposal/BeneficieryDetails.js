import React, { useState, useRef, useEffect } from 'react';
import './BeneficieryDetails.css'
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Accordion } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { findRecordById, saveDetail, updateDetailById } from '../../db/indexedDB.js';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/Dashboard/Template';
import ValidationErrorModal from './ValidationErrorModal.js';
//import 'bootstrap/dist/css/bootstrap.min.css';


// const validationSchema = Yup.object({
//     title: Yup.string().required('Required'),
//     nameWithInitials: Yup.string().required('Required'),
//     firstName: Yup.string().required('Required'),
//     lastName: Yup.string().required('Required'),
//     dob: Yup.date().required('Required').nullable(),
//     age: Yup.number().required('Required').positive().integer(),
//     aadharCardNo: Yup.string()
//         .required('Required')
//         .length(12, 'Aadhaar Card No must be exactly 12 characters'),
//     relationship: Yup.string().required('Required'),
//     gender: Yup.string().required('Required'),
//     maritalStatus: Yup.string().required('Required'),
// });


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

const BeneficieryDetails = () => {

    const applicationType = sessionStorage.getItem('applicationType')
    // const { applicationType } = useContext(ApplicationContext)
    // console.log("Got application type through context in beneficiary screen:::", applicationType)
    const [isAllocateDisabled, setIsAllocateDisabled] = useState(true);
    // State to track if 'Add New' button has been clicked
    const [isAddNewClicked, setIsAddNewClicked] = useState(false);


    const [isAllocateDisabledcontigent, setIsAllocateDisabledcontigent] = useState(true);
    // State to track if 'Add New' button has been clicked
    const [isAddNewClickedcontigent, setIsAddNewClickedcontigent] = useState(false);


    // State to track if 'Allocate Share' button should be disabled
    const [isAllocateDisabledspouse, setIsAllocateDisabledspouse] = useState(true);
    // State to track if 'Add New' button has been clicked
    const [isAddNewClickedspouse, setIsAddNewClickedspouse] = useState(false);


    // State to track if 'Allocate Share' button should be disabled
    const [isAllocateDisabledspousecontigent, setIsAllocateDisabledspousecontigent] = useState(true);
    // State to track if 'Add New' button has been clicked
    const [isAddNewClickedspousecontigent, setIsAddNewClickedspousecontigent] = useState(false);

    const personID = sessionStorage.getItem("personID")
    const childKeys = ["firstChildInsured", "secondChildInsured", "thirdChildInsured", "fourthChildInsured", "fifthChildInsured"];
    const erefid = sessionStorage.getItem("erefid")
    //const { erefid } = useContext(AuthContext);
    console.log("Got erefid ", erefid)

    // const { CaseId } = useContext(AuthContext);
    // console.log("Got caseId in Beneficiery screen:::", CaseId);
    const CaseId = sessionStorage.getItem("CaseId");

    const formRefs = useRef([]);
    const contingentFormRefs = useRef([]);
    const spouseFormRefs = useRef([]);
    const contingentSpouseFormRefs = useRef([]);
    const [apidata, setapidata] = useState();
    const [apipayload, setapipayload] = useState()

    const [modalMessage, setModalMessage] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [isGenderDisabled, setIsGenderDisabled] = useState(true);
    const [contigentgenderdisable, setcontigentgenderdisable] = useState(true)
    const [spousegenderdisable, setspousegenderdisable] = useState(true);
    const [spousecontigentgenderdisable, setspousecontigentgenderdisable] = useState(true)

    const [age, setAge] = useState('');
    const [openItem, setOpenItem] = useState([]);
    const [disableshareallocate, setdisableshareallocate] = useState(true);
    const [forms, setForms] = useState([{}]);
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [shareAllocations, setShareAllocations] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [isAllocateClicked, setIsAllocateClicked] = useState(false);
    const [personaldata, setpersonaldata] = useState()
    const commmingfromproposalsummary = sessionStorage.getItem("eReferenceIdthroughproposalsummary");

    const navigate = useNavigate();
    const navigate_to_addressdetails = useNavigate();
    const [contingentForms, setcontigentForms] = useState([{}]);
    const [contingentBeneficiaries, setcontigentBeneficiaries] = useState([]);
    const [isContingentAllocateClicked, setIsContingentAllocateClicked] = useState(false)
    const [contingentShareAllocations, setcontigentShareAllocations] = useState([]);
    const [showcontigenttable, setcontigentshowtable] = useState(false);
    //const [isContingentAllocateClicked , setIsContingentAllocateClicked]


    const [spouseForms, setSpouseForms] = useState([{}]); // Initial form for spouse
    const [spouseBeneficiaries, setSpouseBeneficiaries] = useState([]); // Beneficiaries array for spouse
    const [spouseshareallocation, setspouseshareallocation] = useState([]);
    const [showSpouseTable, setShowSpouseTable] = useState(false);
    const [spouseisAllocateClicked, setspouseIsAllocateClicked] = useState(false);
    const [spousedisableshareallocate, setspousedisableshareallocate] = useState(true);


    const [contigentspouseForms, setcontigentspouseForms] = useState([{}]);
    const [contigentspouseBeneficiary, setcontigentspouseBeneficiary] = useState([]);
    const [contigentspouseshareallocation, setcontigentspouseshareallocation] = useState([]);
    const [showcontigentspouseTable, setshowcontigentspousetable] = useState(false);
    const [contigentspouseisallocatedclicked, setcontigentspouseisallocatedclicked] = useState(false);

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
    //     if (applicationType === 'Single Life') {
    //         setOpenItem(['lifeA']); // Open only Life A accordion
    //     } else if (applicationType === 'Joint Life') {
    //         setOpenItem(['lifeA', 'lifeB']); // Open both Life A and Life B accordions
    //     } else {
    //         setOpenItem([]); // Close all accordions if applicationType is empty or undefined
    //     }
    // }, [applicationType]); // Dependency to re-run when applicationType changes

    const childcoveragesarray = [
        {
            benefitAmount: {
                riderValue: 10000,
                riderPremium: 20000
            },
            riderName: "coverage.riderName",
            benefitPeriod: {
                riderTerm: 10,
                riderExpiryAge: 50,
                ageToRetire: 40
            }
        },
    ]

    const validationSchema = Yup.object({
        title: Yup.string().required('Required'),
        nameWithInitials: Yup.string().required('Required'),
        firstName: Yup.string().required('Required'),
        lastName: Yup.string().required('Required'),
        dob: Yup.date().required('Required').nullable(),
        age: Yup.number().required('Required').positive().integer(),
        aadharCardNo: Yup.string()
            .required('Required')
            .length(14, 'Aadhaar Card No must be exactly 12 characters'),
        relationship: Yup.string().required('Required'),
        gender: Yup.string().required('Required'),
        maritalStatus: Yup.string().required('Required'),
    });

    useEffect(() => {
        const fetchData = async () => {

            // if (applicationType === 'Single Life') {
            //     setOpenItem(['lifeA']); // Open only Life A accordion
            // } else if (applicationType === 'Joint Life') {
            //     setOpenItem(['lifeA', 'lifeB']); // Open both Life A and Life B accordions
            // } else {
            //     setOpenItem([]); // Close all accordions if applicationType is empty or undefined
            // }

            const savedBeneficiaries = sessionStorage.getItem("beneficiaries");
            const savedShareAllocations = sessionStorage.getItem("shareAllocations");
            const savedShowTable = sessionStorage.getItem("showTable");

            if (savedBeneficiaries) {
                setBeneficiaries(JSON.parse(savedBeneficiaries));
            }
            if (savedShareAllocations) {
                setShareAllocations(JSON.parse(savedShareAllocations));
            }
            if (savedShowTable === "true") {
                setShowTable(true);
            }

            const savedSpouseBeneficiaries = sessionStorage.getItem("spouseBeneficiaries");
            const savedSpouseShareAllocations = sessionStorage.getItem("spouseShareAllocations");
            const savedShowSpouseTable = sessionStorage.getItem("showSpouseTable");

            if (savedSpouseBeneficiaries) {
                setSpouseBeneficiaries(JSON.parse(savedSpouseBeneficiaries));
            }
            if (savedSpouseShareAllocations) {
                setspouseshareallocation(JSON.parse(savedSpouseShareAllocations));
            }
            if (savedShowSpouseTable === "true") {
                setShowSpouseTable(true);
            }
            try {
                const data = await findRecordById("al_application_main", erefid);
                console.log("al application data in beneficiary screen :::", data);
                setapidata(data);  // Update state with the fetched data
            } catch (error) {
                console.error("Error fetching data:", error);
            }

            try {
                const personaldata = await findRecordById("al_person_details", personID)
                console.log("Personal data in beneficiary screen:::", personaldata)
                setpersonaldata(personaldata)
            } catch (e) {
                console.log("Error while fetching:::", e)
            }

            try {
                const beneficiaryid = sessionStorage.getItem("beneficiaryID");
                if (beneficiaryid) {
                    const b_data = await findRecordById("al_beneficiary_details", beneficiaryid);
                    console.log("Data on backswipe for beneficiary:::", b_data);

                    if (b_data.result.primaryInsuredBeneficiaries.length > 0) {
                        const transformedData = b_data.result.primaryInsuredBeneficiaries.map((beneficiary) => ({
                            title: beneficiary.name.title || "",
                            nameWithInitials: beneficiary.name.nameWithInitials || "",
                            firstName: beneficiary.name.first || "",
                            lastName: beneficiary.name.last || "",
                            dob: beneficiary.dateOfBirth || "",
                            age: beneficiary.anb || "",
                            aadharCardNo: beneficiary.NICNumber || "",
                            relationship: beneficiary.relationship || "",
                            gender: beneficiary.gender || "",
                            maritalStatus: beneficiary.maritalStatus || "",
                        }));
                        setForms(transformedData); // Update state with transformed data
                        setShowTable(true)
                        //handleAllocateshare()
                        //setShareAllocations(new Array(transformedData.length).fill(0));
                    } if (b_data.result.secondaryInsuredBeneficiaries.length > 0) {
                        const slifetransformedData = b_data.result.secondaryInsuredBeneficiaries.map((b) => ({
                            title: b.name.title || "",
                            nameWithInitials: b.name.nameWithInitials || "",
                            firstName: b.name.first || "",
                            lastName: b.name.last || "",
                            dob: b.dateOfBirth || "",
                            age: b.anb || "",
                            aadharCardNo: b.NICNumber || "",
                            relationship: b.relationship || "",
                            gender: b.gender || "",
                            maritalStatus: b.maritalStatus || "",
                        }))
                        setSpouseForms(slifetransformedData);
                        setShowTable(true)
                        setShowSpouseTable(true);
                        //handleAllocateshare()
                        //handleSpouseAllocateShare()

                    }
                }
            } catch (error) {
                console.log("Error fetching data:::", error);
            }

            try {
                if (applicationType === 'Single Life') {
                    setOpenItem(['lifeA']); // Open only Life A accordion
                } else if (applicationType === 'Joint Life') {
                    setOpenItem(['lifeA', 'lifeB']); // Open both Life A and Life B accordions
                } else {
                    setOpenItem([]); // Close all accordions if applicationType is empty or undefined
                }
            } catch (e) {
                console.log("Error in Accordian Opening:::", e)
            }

        };

        fetchData();  // Call the function

    }, [erefid]);  // Add erefid as a dependency if it's used in the async function


    // const handleAccordionClick = (item) => {
    //     setOpenItem((prevOpenItems) => {
    //         // Safety check to ensure openItems is always an array
    //         const updatedItems = Array.isArray(prevOpenItems) ? [...prevOpenItems] : [];

    //         if (updatedItems.includes(item)) {
    //             // If the item is already open, close it
    //             return updatedItems.filter((openItem) => openItem !== item);
    //         } else {
    //             // Otherwise, open the item
    //             return [...updatedItems, item];
    //         }
    //     });
    // }
    // const handleAccordionClick = (item) => {
    //     setOpenItem((prev) =>
    //         prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    //     );
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


    const handleAddNewForm = () => {
        setForms([...forms, {}]); // Add an empty object to forms array
        setShowTable(false);
        setIsAllocateDisabled(false);
        // Set 'Add New' button state
        setIsAddNewClicked(true);
    };

    const handleAddNewContingentForm = () => {
        setcontigentForms([...contingentForms, {}]);
        setcontigentshowtable(false);
        setIsAllocateDisabledcontigent(false);
        // Set 'Add New' button state
        setIsAddNewClickedcontigent(true);
    }

    const handleSpouseAddNewForm = () => {
        //const newForm = { id: Date.now(), deathBenefit: 0 }; // New form with unique id and default deathBenefit
        setSpouseForms([...spouseForms, {}]);
        setShowSpouseTable(false)
        setIsAllocateDisabled(false);
        // Set 'Add New' button state
        setIsAddNewClicked(true);
    };

    const handleAddNewSpouseContigentForm = () => {
        setcontigentspouseForms([...contigentspouseForms, {}]);
        setshowcontigentspousetable(false);
        setIsAllocateDisabled(false);
        // Set 'Add New' button state
        setIsAddNewClicked(true);
    }



    const handleModalClose = () => setIsModalVisible(false);




    const handleRemoveForm = (index) => {
        const updatedForms = [...forms];
        updatedForms.splice(index, 1); // Remove the form at index
        setForms(updatedForms);

        // Also remove the corresponding beneficiary and share allocation
        const updatedBeneficiaries = [...beneficiaries];
        updatedBeneficiaries.splice(index, 1);
        setBeneficiaries(updatedBeneficiaries);

        const updatedShareAllocations = [...shareAllocations];
        updatedShareAllocations.splice(index, 1);
        setShareAllocations(updatedShareAllocations);
    };


    const handleRemoveContingentForm = (index) => {
        const updatedForms = [...contingentForms];
        updatedForms.splice(index, 1);
        setcontigentForms(updatedForms);

        const updatedBeneficiaries = [...contingentBeneficiaries];
        updatedBeneficiaries.splice(index, 1);
        setcontigentBeneficiaries(updatedBeneficiaries);

        const updatedShareAllocations = [...contingentShareAllocations];
        updatedShareAllocations.splice(index, 1);
        setcontigentShareAllocations(updatedShareAllocations);
    }

    const handleSpouseRemoveForm = (index) => {
        // const updatedForms = spouseForms.filter(form => form.id !== id); // Remove form by id
        // setSpouseForms(updatedForms);



        const updatedForms = [...spouseForms];
        updatedForms.splice(index, 1); // Remove the form at index
        setSpouseForms(updatedForms);

        // Also remove the corresponding beneficiary and share allocation
        const updatedBeneficiaries = [...spouseBeneficiaries];
        updatedBeneficiaries.splice(index, 1);
        setBeneficiaries(updatedBeneficiaries);

        const updatedShareAllocations = [...spouseshareallocation];
        updatedShareAllocations.splice(index, 1);
        setspouseshareallocation(updatedShareAllocations);
    };

    const handleSpouseContigentRemoveForm = (index) => {
        const updatedForms = [...contigentspouseForms];
        updatedForms.splice(index, 1);
        setcontigentspouseForms(updatedForms);

        const updatedBeneficiaries = [...contigentspouseBeneficiary];
        updatedBeneficiaries.splice(index, 1);
        setcontigentspouseBeneficiary(updatedBeneficiaries);

        const updatedShareAllocations = [...contigentspouseshareallocation];
        updatedShareAllocations.splice(index, 1);
        setcontigentspouseshareallocation(updatedShareAllocations);
    }




    // const handleAllocateshare = (values) => {
    //     setBeneficiaries([...beneficiaries, values]); // Add the beneficiary details to the list
    //     const totalBeneficiaries = beneficiaries.length + 1;
    //     const percentage = Math.floor(100 / totalBeneficiaries); // Evenly distribute shares

    //     // Recalculate shares
    //     const updatedShareAllocations = Array(totalBeneficiaries).fill(percentage);
    //     setShareAllocations(updatedShareAllocations);
    //     setShowTable(true); // Show the table
    // };

    const handleAllocateshare = (values) => {
        const updatedBeneficiaries = [...beneficiaries, values]; // Add the new beneficiary
        const totalBeneficiaries = updatedBeneficiaries.length;
        const percentage = Math.floor(100 / totalBeneficiaries); // Evenly distribute shares

        // Recalculate shares
        const updatedShareAllocations = Array(totalBeneficiaries).fill(percentage);

        // Update state
        setBeneficiaries(updatedBeneficiaries);
        setShareAllocations(updatedShareAllocations);
        setShowTable(true);

        // Save to sessionStorage
        sessionStorage.setItem("beneficiaries", JSON.stringify(updatedBeneficiaries));
        sessionStorage.setItem("shareAllocations", JSON.stringify(updatedShareAllocations));
        sessionStorage.setItem("showTable", "true");

        setIsAllocateDisabled(true);
        // Reset 'Add New' button state
        setIsAddNewClicked(false);
    }

    const handleContingentAllocateShare = (values) => {
        setcontigentBeneficiaries([...contingentBeneficiaries, values]);
        const totalBeneficiaries = contingentBeneficiaries.length + 1;
        const percentage = Math.floor(100 / totalBeneficiaries);

        const updatedShareAllocations = Array(totalBeneficiaries).fill(percentage);
        setcontigentShareAllocations(updatedShareAllocations);
        setcontigentshowtable(true);

        setIsAllocateDisabledcontigent(true);
        // Reset 'Add New' button state
        setIsAddNewClickedcontigent(false);


    }

    // const handleSpouseAllocateShare = (values) => {
    //     // Handle the allocation logic for spouse beneficiaries
    //     // console.log('Spouse Form Values:', values);
    //     // setSpouseBeneficiaries([...spouseBeneficiaries, values]);
    //     // setShowSpouseTable(true);


    //     setSpouseBeneficiaries([...spouseBeneficiaries, values]); // Add the beneficiary details to the list
    //     const totalBeneficiaries = spouseBeneficiaries.length + 1;
    //     const percentage = Math.floor(100 / totalBeneficiaries); // Evenly distribute shares

    //     // Recalculate shares
    //     const updatedShareAllocations = Array(totalBeneficiaries).fill(percentage);
    //     setspouseshareallocation(updatedShareAllocations);
    //     setShowSpouseTable(true); // Show the table
    // };

    const handleSpouseAllocateShare = (values) => {
        const updatedSpouseBeneficiaries = [...spouseBeneficiaries, values]; // Add the new spouse beneficiary
        const totalBeneficiaries = updatedSpouseBeneficiaries.length;
        const percentage = Math.floor(100 / totalBeneficiaries); // Evenly distribute shares

        // Recalculate shares
        const updatedShareAllocations = Array(totalBeneficiaries).fill(percentage);

        // Update state
        setSpouseBeneficiaries(updatedSpouseBeneficiaries);
        setspouseshareallocation(updatedShareAllocations);
        setShowSpouseTable(true);

        // Save to sessionStorage
        sessionStorage.setItem("spouseBeneficiaries", JSON.stringify(updatedSpouseBeneficiaries));
        sessionStorage.setItem("spouseShareAllocations", JSON.stringify(updatedShareAllocations));
        sessionStorage.setItem("showSpouseTable", "true");

        setIsAllocateDisabledspouse(true);
        // Reset 'Add New' button state
        setIsAddNewClickedspouse(false);
    };

    const handleSpouseContigentAllocateShare = (values) => {
        setcontigentspouseBeneficiary([...contigentspouseBeneficiary, values]); // Add the beneficiary details to the list
        const totalBeneficiaries = contigentspouseBeneficiary.length + 1;
        const percentage = Math.floor(100 / totalBeneficiaries); // Evenly distribute shares

        // Recalculate shares
        const updatedShareAllocations = Array(totalBeneficiaries).fill(percentage);
        setcontigentspouseshareallocation(updatedShareAllocations);
        setshowcontigentspousetable(true); // Show the table

        setIsAllocateDisabled(true);
        // Reset 'Add New' button state
        setIsAddNewClicked(false);
    }

    // const handleInputChange = (idx, value) => {
    //     const updatedAllocations = [...shareAllocations];
    //     updatedAllocations[idx] = value;

    //     // Calculate the total percentage
    //     const total = updatedAllocations.reduce((a, b) => parseInt(a) + parseInt(b), 0);

    //     // If the total is greater than 100, show an alert
    //     if (total > 100) {
    //         alert("Total percentage cannot exceed 100!");
    //         return; // Stop further execution if total exceeds 100
    //     }

    //     setShareAllocations(updatedAllocations);
    // };

    const handleInputChange = (idx, value) => {
        // Ensure the value is a valid integer
        const parsedValue = parseInt(value);

        // If parsedValue is NaN or less than 0, reset the input to 0
        if (isNaN(parsedValue) || parsedValue < 0) {
            return; // Stop if invalid input
        }

        const updatedAllocations = [...shareAllocations];
        updatedAllocations[idx] = parsedValue; // Store the valid integer

        // Calculate the total percentage
        const total = updatedAllocations.reduce((a, b) => parseInt(a) + parseInt(b), 0);

        // If the total is greater than 100, show an alert and don't allow the change
        if (total > 100) {
            alert("Total percentage cannot exceed 100!");
            return;
        }

        setShareAllocations(updatedAllocations);
    };

    const handleContingentInputChange = (idx, value) => {
        const parsedValue = parseInt(value);
        if (isNaN(parsedValue) || parsedValue < 0) {
            return; // Stop if invalid input
        }

        const updatedAllocations = [...contingentShareAllocations];
        updatedAllocations[idx] = parsedValue; // Store the valid integer


        const total = updatedAllocations.reduce((a, b) => parseInt(a) + parseInt(b), 0);


        // If the total is greater than 100, show an alert and don't allow the change
        if (total > 100) {
            alert("Total percentage cannot exceed 100!");
            return;
        }

        setcontigentShareAllocations(updatedAllocations);
    }

    const handleSpouseInputChange = (value, idx) => {
        //setspousedeathbenefit(e.target.value);
        const updatedAllocations = [...spouseshareallocation];
        updatedAllocations[idx] = value;

        // Calculate the total percentage
        const total = updatedAllocations.reduce((a, b) => parseInt(a) + parseInt(b), 0);

        // If the total is greater than 100, show an alert
        if (total > 100) {
            alert("Total percentage cannot exceed 100!");
            return; // Stop further execution if total exceeds 100
        }

        setspouseshareallocation(updatedAllocations);
    };

    const handleContigentSpouseInputChange = (idx, value) => {
        //setspousedeathbenefit(e.target.value);
        const updatedAllocations = [...contigentspouseshareallocation];
        updatedAllocations[idx] = value;

        // Calculate the total percentage
        const total = updatedAllocations.reduce((a, b) => parseInt(a) + parseInt(b), 0);

        // If the total is greater than 100, show an alert
        if (total > 100) {
            alert("Total percentage cannot exceed 100!");
            return; // Stop further execution if total exceeds 100
        }

        setcontigentspouseshareallocation(updatedAllocations);
    }


    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleBack = () => {
        //navigate('/dashboard');
        navigate_to_addressdetails("/eappaddress_details")
        //console.log("jk")
    };

    const validateSaveDetails = (details) => {
        const validationResults = details.map((beneficiary, index) => {
            const errors = validateBeneficiary(beneficiary);
            return { index, errors };
        });

        // Filter out items without errors
        return validationResults.filter(result => Object.keys(result.errors).length > 0);
    };


    const validateBeneficiary = (beneficiary) => {
        const errors = {};
        if (beneficiary.length !== 0) {
            for (let i = 0; i < beneficiary.length; i++) {
                if (!beneficiary[i].title) {
                    errors.title = "Title is required";
                }

                if (!beneficiary[i].nameWithInitials) {
                    errors.nameWithInitials = "Name with initials is required";
                }

                if (!beneficiary[i].firstName) {
                    errors.firstName = "First name is required";
                }

                if (!beneficiary[i].lastName) {
                    errors.lastName = "Last name is required";
                }

                if (!beneficiary[i].dob) {
                    errors.dob = "Date of birth is required";
                }


                if (!beneficiary[i].age) {
                    errors.age = "Valid age is required";
                }

                if (!beneficiary[i].aadharCardNo || beneficiary[i].aadharCardNo.length !== 14) {
                    errors.aadharCardNo = "Aadhar Card Number must be 12 digits";
                }

                if (!beneficiary[i].relationship) {
                    errors.relationship = "Relationship is required";
                }

                if (!beneficiary[i].gender) {
                    errors.gender = "Gender is required";
                }

                if (!beneficiary[i].maritalStatus) {
                    errors.maritalStatus = "Marital status is required";
                }

                return errors;
            }

        } else {
            setModalMessage('Please fill All the details');
            setIsModalVisible(true);
        }

    };

    // const handleCombinedSubmit = async () => {

    //     try {
    //         //Validate all forms before submission
    //         const validateForms = async (formRefs) => {
    //             if (!formRefs || formRefs.length === 0) return [];
    //             const errors = await Promise.all(
    //                 formRefs.filter(ref => ref !== null && ref !== undefined).map(ref => ref.validateForm())
    //             );
    //             return errors.filter(error => Object.keys(error).length > 0);  // Filter out empty errors
    //         };

    //         let primaryErrors = [];
    //         let spouseErrors = [];

    //         // Conditionally validate based on applicationType
    //         if (applicationType === "Single Life") {
    //             // Validate only the primary insured form
    //             primaryErrors = await validateForms(formRefs.current);
    //         } else if (applicationType === "Joint Life") {
    //             // Validate both primary insured and spouse forms
    //             primaryErrors = await validateForms(formRefs.current);
    //             spouseErrors = await validateForms(spouseFormRefs.current);
    //         }

    //         // If any validation errors exist, log them and halt the submission
    //         if ((applicationType === "Single Life" && primaryErrors.length > 0) ||
    //             (applicationType === "Joint Life" && (primaryErrors.length > 0 || spouseErrors.length > 0))) {
    //             console.error("Validation Errors:", { primaryErrors, spouseErrors });
    //             alert("Please fix the errors in the forms before submitting.");
    //             return; // Stop the submission
    //         }

    //         // Continue with form submission if validation passed
    //         const SAVE_DETAILS = {
    //             beneficiaries,
    //             contingentBeneficiaries,
    //             spouseBeneficiaries,
    //             contigentspouseBeneficiary,
    //             shareAllocations,
    //             contingentShareAllocations,
    //             spouseshareallocation,
    //             contigentspouseshareallocation,
    //         };

    //         console.log("Save Details::::", SAVE_DETAILS)

    //         const beneficiaryErrors = validateBeneficiary(SAVE_DETAILS.beneficiaries);

    //         if (applicationType == "Joint Life") {
    //             var spouseErrorsSave = validateBeneficiary(SAVE_DETAILS.spouseBeneficiaries);
    //             if (Object.keys(spouseErrorsSave).length > 0) {
    //                 console.error("Validation failed:", spouseErrorsSave)
    //                 alert("Please fill all details!");
    //                 return; // Stop submission if validation failed
    //             }
    //         }


    //         // If validation fails for beneficiaries or spouse
    //         if (Object.keys(beneficiaryErrors).length > 0) {
    //             console.error("Validation failed:", beneficiaryErrors);
    //             alert("Please fill all details!");
    //             return; // Stop submission if validation failed
    //         }




    //         // Generate unique beneficiary IDs for tracking
    //         let beneficiaryID = `BI${Date.now() + 2}`;
    //         sessionStorage.setItem('beneficiaryID', beneficiaryID);

    //         let slife_beneficiaryID = `BI${Date.now() + 3}`;

    //         // Check application type and set beneficiary data accordingly
    //         let beneficiarydata = {};
    //         const storeName = "al_beneficiary_details";

    //         if (applicationType === 'Single Life') {
    //             let primaryBeneficiaries = beneficiaries.map((beneficiary) => ({
    //                 "beneficiaryID": beneficiaryID,
    //                 "name": {
    //                     "first": beneficiary.firstName || "",
    //                     "middle": "",
    //                     "last": beneficiary.lastName || "",
    //                     "title": beneficiary.title || "",
    //                     "nameWithInitials": beneficiary.nameWithInitials || ""
    //                 },
    //                 "dateOfBirth": beneficiary.dob || "",
    //                 "anb": String(beneficiary.age) || "",
    //                 "gender": beneficiary.gender || "",
    //                 "maritalStatus": beneficiary.maritalStatus || "",
    //                 "relationship": beneficiary.relationship || "",
    //                 "NICNumber": beneficiary.aadharCardNo || "",
    //                 "benefits": {
    //                     "deathBenefit": "30000",
    //                     "familyIncomeBenefit": "15000",
    //                     "sipsethaBenefit": "5000",
    //                     "FamilyDigasiriBenefit": "2000"
    //                 }
    //             }));

    //             beneficiarydata = {
    //                 "primaryInsuredBeneficiaries": primaryBeneficiaries,
    //                 "beneficiaryID": beneficiaryID
    //             };

    //             try {
    //                 await saveDetail(storeName, beneficiarydata);
    //                 console.log("Data saved in ", storeName);

    //                 let updatedData = apidata.result;
    //                 updatedData["product"]["primaryInsured"]["beneficiary"] = primaryBeneficiaries;

    //                 await updateDetailById("al_application_main", erefid, updatedData);
    //                 console.log("Data updated", updatedData);

    //             } catch (e) {
    //                 console.log("Error while saving:::", e);
    //             }

    //             if (personaldata.result.primaryInsured.person.kids === "yes") {
    //                 let childupdateddata = apidata.result;
    //                 personaldata.result.Child.forEach((child, index) => {
    //                     const childKey = childKeys[index];
    //                     if (childKey) {
    //                         childupdateddata.product[childKey] = {
    //                             coverages: childcoveragesarray,
    //                             person: {
    //                                 personID: personID,
    //                                 clientID: "CL892023122052371",
    //                                 nationality: "SL",
    //                                 dateOfBirth: child.dateOfBirth,
    //                                 emailAddress: "abc@gmail.com",
    //                                 mobileNumber: "8569362514",
    //                                 gender: child.gender,
    //                                 height: { feet: 5, inches: 11 },
    //                                 weight: 75,
    //                                 anb: child.age,
    //                                 maritalStatus: "Single",
    //                                 educationQualification: "gfdg",
    //                                 name: {
    //                                     first: child.name.first,
    //                                     middle: "ds",
    //                                     last: child.name.last,
    //                                     title: child.name.title,
    //                                     nameWithInitials: "R.D."
    //                                 },
    //                                 verificationDetails: {
    //                                     NICNumber: "474744744",
    //                                     birthCertificateNumber: "",
    //                                     passportNumber: "888888888888",
    //                                     marriageCertificate: "MIHJU4545N"
    //                                 },
    //                                 occupationSummary: {
    //                                     occupationCode: "OCC",
    //                                     annualIncome: 78945,
    //                                     natureOfBusiness: "dfs",
    //                                     otherSourceOfIncome: "fdsf",
    //                                     periodOfEmployment: { years: 3, months: 5 }
    //                                 }
    //                             }
    //                         };
    //                     }
    //                 });

    //                 try {
    //                     await updateDetailById("al_application_main", erefid, childupdateddata);
    //                     console.log("Data updated", childupdateddata);
    //                 } catch (e) {
    //                     console.log("Error while updating child data:::", e)
    //                 }
    //             }

    //         }
    //         else if (applicationType === 'Joint Life') {
    //             console.log("JointLife");

    //             // Primary insured beneficiaries (for primary life)
    //             let primaryBeneficiaries = beneficiaries.map((beneficiary) => ({
    //                 "beneficiaryID": beneficiaryID,  // Assuming beneficiaryID is a constant for primary beneficiaries
    //                 "name": {
    //                     "first": beneficiary.firstName || "",
    //                     "middle": "",  // Middle name field added as per the example format
    //                     "last": beneficiary.lastName || "",
    //                     "title": beneficiary.title || "",
    //                     "nameWithInitials": beneficiary.nameWithInitials || ""
    //                 },
    //                 "dateOfBirth": beneficiary.dob || "",
    //                 "anb": String(beneficiary.age) || "",
    //                 "gender": beneficiary.gender || "",
    //                 "maritalStatus": beneficiary.maritalStatus || "",
    //                 "relationship": beneficiary.relationship || "",
    //                 "NICNumber": beneficiary.aadharCardNo || "",
    //                 "benefits": {
    //                     "deathBenefit": "30000",  // Updated benefit values
    //                     "familyIncomeBenefit": "15000",
    //                     "sipsethaBenefit": "5000",
    //                     "FamilyDigasiriBenefit": "2000"
    //                 }
    //             }));

    //             // Spouse beneficiaries (for secondary life)
    //             let spouseBeneficiariesList = spouseBeneficiaries.map((spousebeneficiary) => ({
    //                 "beneficiaryID": slife_beneficiaryID,  // Assuming slife_beneficiaryID for spouse beneficiaries
    //                 "name": {
    //                     "first": spousebeneficiary.firstName || "",
    //                     "middle": "",  // Middle name field added as per the example format
    //                     "last": spousebeneficiary.lastName || "",
    //                     "title": spousebeneficiary.title || "",
    //                     "nameWithInitials": spousebeneficiary.nameWithInitials || ""
    //                 },
    //                 "dateOfBirth": spousebeneficiary.dob || "",
    //                 "anb": String(spousebeneficiary.age) || "",
    //                 "gender": spousebeneficiary.gender || "",
    //                 "maritalStatus": spousebeneficiary.maritalStatus || "",
    //                 "relationship": spousebeneficiary.relationship || "",
    //                 "NICNumber": spousebeneficiary.aadharCardNo || "",
    //                 "benefits": {
    //                     "deathBenefit": "30000",  // Updated benefit values
    //                     "familyIncomeBenefit": "15000",
    //                     "sipsethaBenefit": "5000",
    //                     "FamilyDigasiriBenefit": "2000"
    //                 }
    //             }));

    //             // Combine the primary and secondary insured (spouse) beneficiaries into their respective objects
    //             let beneficiarydata = {
    //                 "primaryInsuredBeneficiaries": primaryBeneficiaries,
    //                 "secondaryInsuredBeneficiaries": spouseBeneficiariesList,
    //                 "beneficiaryID": beneficiaryID
    //             };

    //             try {
    //                 await saveDetail(storeName, beneficiarydata);
    //                 console.log("Data saved in", storeName);

    //                 let updatedData = apidata.result;

    //                 // Structure the beneficiaries correctly under primaryInsured and secondaryInsured
    //                 updatedData["product"]["primaryInsured"]["beneficiary"] = beneficiarydata.primaryInsuredBeneficiaries;
    //                 updatedData["product"]["secondaryInsured"]["beneficiary"] = beneficiarydata.secondaryInsuredBeneficiaries;

    //                 await updateDetailById("al_application_main", erefid, updatedData);
    //                 console.log("Data updated", updatedData);

    //             } catch (e) {
    //                 console.log("Error while saving:::", e);
    //             }
    //             if (personaldata.result.primaryInsured.person.kids === "yes") {
    //                 let childupdateddata = apidata.result;
    //                 console.log("Child updated data:::", childupdateddata)
    //                 personaldata.result.Child.forEach((child, index) => {
    //                     const childKey = childKeys[index];  // Get the corresponding childKey for each child based on index
    //                     if (childKey) { // Ensure we don't exceed the available keys in childKeys array
    //                         childupdateddata.product[childKey] = {
    //                             coverages: childcoveragesarray,
    //                             person: {
    //                                 personID: personID,
    //                                 clientID: "CL892023122052371",
    //                                 nationality: "SL",
    //                                 dateOfBirth: child.dateOfBirth,
    //                                 emailAddress: "abc@gmail.com",
    //                                 mobileNumber: "8569362514",
    //                                 gender: child.gender,
    //                                 height: {
    //                                     feet: 5,
    //                                     inches: 11
    //                                 },
    //                                 weight: 75,
    //                                 anb: child.age,
    //                                 maritalStatus: "Single",
    //                                 educationQualification: "gfdg",
    //                                 name: {
    //                                     first: child.name.first,
    //                                     middle: "ds",
    //                                     last: child.name.last,
    //                                     title: child.name.title,
    //                                     nameWithInitials: "R.D."
    //                                 },
    //                                 verificationDetails: {
    //                                     NICNumber: "474744744",
    //                                     birthCertificateNumber: "",
    //                                     passportNumber: "888888888888",
    //                                     marriageCertificate: "MIHJU4545N"
    //                                 },
    //                                 occupationSummary: {
    //                                     occupationCode: "OCC",
    //                                     annualIncome: 78945,
    //                                     natureOfBusiness: "dfs",
    //                                     otherSourceOfIncome: "fdsf",
    //                                     periodOfEmployment: {
    //                                         years: 3,
    //                                         months: 5
    //                                     }
    //                                 }
    //                             }
    //                         };
    //                     }
    //                 });

    //                 try {
    //                     await updateDetailById("al_application_main", erefid, childupdateddata);
    //                     console.log("Data updated", childupdateddata);
    //                 } catch (e) {
    //                     console.log("Error while updating child data:::", e)
    //                 }
    //             }
    //         }
    //         // else if (applicationType === 'Single Life' || applicationType === "Joint Life") && personaldata.result.primaryInsured.person.kids === "yes" {
    //         // Code block


    //         try {
    //             const payload = await findRecordById("al_application_main", erefid)
    //             console.log("Payload on Benefeciary screen:::", JSON.stringify(payload))

    //             // delete payload.result.SQSId;
    //             // delete payload.result.e_referenceId;


    //             console.log("Payload after deleting sqsid and erefid:::", JSON.stringify(payload.result))
    //             setapipayload(payload.result)

    //             try {

    //                 //const apicall = await fetch("http://192.168.2.188:3008/v1/proposal-management-service/updateCaseData/" + CaseId, {
    //                 const apicall = await fetch("http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com/proposal-management-service/updateCaseData/" + CaseId, {
    //                     method: 'PUT',
    //                     headers: {
    //                         'Content-Type': 'application/json'
    //                     },
    //                     body: JSON.stringify(payload.result)
    //                 });
    //                 const result = await apicall.json();
    //                 console.log('API Response on Beneficiery screen:', result);

    //                 navigate('/previousinsurance');

    //             } catch (error) {
    //                 console.log("Error while calling the API::::", error)
    //             }




    //         } catch (error) {
    //             console.log("Error while fetching:::", error)
    //         }

    //     } catch (e) {
    //         console.log("Problem in combine submit", e)
    //     }

    //     //navigate('/proposedInsuranceDetails')



    // }
    const handleCombinedSubmit = async () => {
        try {
            // Validate all forms before submission
            const validateForms = async (formRefs) => {
                if (!formRefs || formRefs.length === 0) return [];
                const errors = await Promise.all(
                    formRefs.filter(ref => ref !== null && ref !== undefined).map(ref => ref.validateForm())
                );
                return errors.filter(error => Object.keys(error).length > 0); // Filter out empty errors
            };

            let primaryErrors = [];
            let spouseErrors = [];

            // Conditionally validate based on applicationType
            if (applicationType === "Single Life") {
                // Validate only the primary insured form
                primaryErrors = await validateForms(formRefs.current);
            } else if (applicationType === "Joint Life") {
                // Validate both primary insured and spouse forms
                primaryErrors = await validateForms(formRefs.current);
                spouseErrors = await validateForms(spouseFormRefs.current);
            }

            // If any validation errors exist, log them and halt the submission
            if (
                (applicationType === "Single Life" && primaryErrors.length > 0) ||
                (applicationType === "Joint Life" && (primaryErrors.length > 0 || spouseErrors.length > 0))
            ) {
                console.error("Validation Errors:", { primaryErrors, spouseErrors });
                alert("Please fix the errors in the forms before submitting.");
                return; // Stop the submission
            }

            // Continue with form submission if validation passed
            const SAVE_DETAILS = {
                beneficiaries,
                contingentBeneficiaries,
                spouseBeneficiaries,
                contigentspouseBeneficiary,
                shareAllocations,
                contingentShareAllocations,
                spouseshareallocation,
                contigentspouseshareallocation,
            };

            console.log("Save Details::::", SAVE_DETAILS);

            const beneficiaryErrors = validateBeneficiary(SAVE_DETAILS.beneficiaries);

            if (applicationType === "Joint Life") {
                const spouseErrorsSave = validateBeneficiary(SAVE_DETAILS.spouseBeneficiaries);
                if (Object.keys(spouseErrorsSave).length > 0) {
                    console.error("Validation failed:", spouseErrorsSave);
                    alert("Please fill all details!");
                    return; // Stop submission if validation failed
                }
            }

            // If validation fails for beneficiaries or spouse
            if (Object.keys(beneficiaryErrors).length > 0) {
                console.error("Validation failed:", beneficiaryErrors);
                alert("Please fill all details!");
                return; // Stop submission if validation failed
            }

            if (!commmingfromproposalsummary) {
                // Generate unique beneficiary IDs for tracking
                const beneficiaryID = `BI${Date.now() + 2}`;
                sessionStorage.setItem("beneficiaryID", beneficiaryID);

                const slife_beneficiaryID = `BI${Date.now() + 3}`;

                // Check application type and set beneficiary data accordingly
                let beneficiarydata = {};
                const storeName = "al_beneficiary_details";

                if (applicationType === "Single Life") {
                    const primaryBeneficiaries = beneficiaries.map((beneficiary) => ({
                        beneficiaryID,
                        name: {
                            first: beneficiary.firstName || "",
                            middle: "",
                            last: beneficiary.lastName || "",
                            title: beneficiary.title || "",
                            nameWithInitials: beneficiary.nameWithInitials || "",
                        },
                        dob: beneficiary.dob || "",
                        age: String(beneficiary.age) || "",
                        gender: beneficiary.gender || "",
                        maritalStatus: beneficiary.maritalStatus || "",
                        relationship: beneficiary.relationship || "",
                        adharCardNumber: beneficiary.aadharCardNo || "",
                        benefits: {
                            deathBenefit: "30000",
                            familyIncomeBenefit: "15000",
                            sipsethaBenefit: "5000",
                            FamilyDigasiriBenefit: "2000",
                        },
                    }));

                    beneficiarydata = {
                        primaryInsuredBeneficiaries: primaryBeneficiaries,
                        beneficiaryID,
                    };

                    try {
                        await saveDetail(storeName, beneficiarydata);
                        console.log("Data saved in", storeName);

                        const updatedData = apidata.result;
                        updatedData.product.primaryInsured.beneficiary = primaryBeneficiaries;

                        await updateDetailById("al_application_main", erefid, updatedData);
                        console.log("Data updated", updatedData);
                    } catch (e) {
                        console.log("Error while saving:::", e);
                    }

                    if (personaldata.result.primaryInsured.person.kids === "yes") {
                        const childupdateddata = apidata.result;
                        personaldata.result.Child.forEach((child, index) => {
                            const childKey = childKeys[index];
                            if (childKey) {
                                childupdateddata.product[childKey] = {
                                    coverages: childcoveragesarray,
                                    person: {
                                        personID,
                                        clientID: "CL892023122052371",
                                        nationality: "SL",
                                        dob: child.dateOfBirth,
                                        emailAddress: "abc@gmail.com",
                                        mobileNumber: "8569362514",
                                        gender: child.gender,
                                        height: { feet: 5, inches: 11 },
                                        weight: 75,
                                        anb: child.age,
                                        maritalStatus: "Single",
                                        educationQualification: "gfdg",
                                        name: {
                                            first: child.name.first,
                                            middle: "ds",
                                            last: child.name.last,
                                            title: child.name.title,
                                            nameWithInitials: "R.D.",
                                        },
                                        verificationDetails: {
                                            NICNumber: "474744744",
                                            birthCertificateNumber: "",
                                            passportNumber: "888888888888",
                                            marriageCertificate: "MIHJU4545N",
                                        },
                                        occupationSummary: {
                                            occupationCode: "OCC",
                                            annualIncome: 78945,
                                            natureOfBusiness: "dfs",
                                            otherSourceOfIncome: "fdsf",
                                            periodOfEmployment: { years: 3, months: 5 },
                                        },
                                    },
                                };
                            }
                        });

                        try {
                            await updateDetailById("al_application_main", erefid, childupdateddata);
                            console.log("Data updated", childupdateddata);
                        } catch (e) {
                            console.log("Error while updating child data:::", e);
                        }
                    }
                } else if (applicationType === "Joint Life") {
                    console.log("JointLife");

                    const primaryBeneficiaries = beneficiaries.map((beneficiary) => ({
                        beneficiaryID,
                        name: {
                            first: beneficiary.firstName || "",
                            middle: "",
                            last: beneficiary.lastName || "",
                            title: beneficiary.title || "",
                            nameWithInitials: beneficiary.nameWithInitials || "",
                        },
                        dob: beneficiary.dob || "",
                        anb: String(beneficiary.age) || "",
                        gender: beneficiary.gender || "",
                        maritalStatus: beneficiary.maritalStatus || "",
                        relationship: beneficiary.relationship || "",
                        NICNumber: beneficiary.aadharCardNo || "",
                        benefits: {
                            deathBenefit: "30000",
                            familyIncomeBenefit: "15000",
                            sipsethaBenefit: "5000",
                            FamilyDigasiriBenefit: "2000",
                        },
                    }));

                    const spouseBeneficiariesList = spouseBeneficiaries.map((spousebeneficiary) => ({
                        beneficiaryID: slife_beneficiaryID,
                        name: {
                            first: spousebeneficiary.firstName || "",
                            middle: "",
                            last: spousebeneficiary.lastName || "",
                            title: spousebeneficiary.title || "",
                            nameWithInitials: spousebeneficiary.nameWithInitials || "",
                        },
                        dob: spousebeneficiary.dob || "",
                        anb: String(spousebeneficiary.age) || "",
                        gender: spousebeneficiary.gender || "",
                        maritalStatus: spousebeneficiary.maritalStatus || "",
                        relationship: spousebeneficiary.relationship || "",
                        NICNumber: spousebeneficiary.aadharCardNo || "",
                        benefits: {
                            deathBenefit: "30000",
                            familyIncomeBenefit: "15000",
                            sipsethaBenefit: "5000",
                            FamilyDigasiriBenefit: "2000",
                        },
                    }));

                    beneficiarydata = {
                        primaryInsuredBeneficiaries: primaryBeneficiaries,
                        secondaryInsuredBeneficiaries: spouseBeneficiariesList,
                        beneficiaryID,
                    };

                    try {
                        await saveDetail(storeName, beneficiarydata);
                        console.log("Data saved in", storeName);

                        const updatedData = apidata.result;

                        updatedData.product.primaryInsured.beneficiary = beneficiarydata.primaryInsuredBeneficiaries;
                        updatedData.product.secondaryInsured.beneficiary = beneficiarydata.secondaryInsuredBeneficiaries;

                        await updateDetailById("al_application_main", erefid, updatedData);
                        console.log("Data updated", updatedData);
                    } catch (e) {
                        console.log("Error while saving:::", e);
                    }

                    if (personaldata.result.primaryInsured.person.kids === "yes") {
                        const childupdateddata = apidata.result;
                        personaldata.result.Child.forEach((child, index) => {
                            const childKey = childKeys[index];
                            if (childKey) {
                                childupdateddata.product[childKey] = {
                                    coverages: childcoveragesarray,
                                    person: {
                                        personID,
                                        clientID: "CL892023122052371",
                                        nationality: "SL",
                                        dob: child.dateOfBirth,
                                        emailAddress: "abc@gmail.com",
                                        mobileNumber: "8569362514",
                                        gender: child.gender,
                                        height: { feet: 5, inches: 11 },
                                        weight: 75,
                                        anb: child.age,
                                        maritalStatus: "Single",
                                        educationQualification: "gfdg",
                                        name: {
                                            first: child.name.first,
                                            middle: "ds",
                                            last: child.name.last,
                                            title: child.name.title,
                                            nameWithInitials: "R.D.",
                                        },
                                        verificationDetails: {
                                            NICNumber: "474744744",
                                            birthCertificateNumber: "",
                                            passportNumber: "888888888888",
                                            marriageCertificate: "MIHJU4545N",
                                        },
                                        occupationSummary: {
                                            occupationCode: "OCC",
                                            annualIncome: 78945,
                                            natureOfBusiness: "dfs",
                                            otherSourceOfIncome: "fdsf",
                                            periodOfEmployment: { years: 3, months: 5 },
                                        },
                                    },
                                };
                            }
                        });

                        try {
                            await updateDetailById("al_application_main", erefid, childupdateddata);
                            console.log("Data updated", childupdateddata);
                        } catch (e) {
                            console.log("Error while updating child data:::", e);
                        }
                    }
                }

                try {
                    const payload = await findRecordById("al_application_main", erefid);
                    console.log("Payload on Beneficiary screen:::", JSON.stringify(payload));

                    console.log("Payload after deleting sqsid and erefid:::", JSON.stringify(payload.result));
                    setapipayload(payload.result);

                    try {
                        const apicall = await fetch(
                            //`http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com/proposal-management-service/updateCaseData/${CaseId}`,
                            `http://192.168.2.7:4008/proposalManagementService/updateCaseData/${CaseId}`,
                            {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(payload.result),
                            }
                        );
                        const result = await apicall.json();
                        console.log("API Response on Beneficiary screen:", result);

                       
                    } catch (error) {
                        console.log("Error while calling the API::::", error);
                    }
                } catch (error) {
                    console.log("Error while fetching:::", error);
                }
            }
            sessionStorage.removeItem("Submitted Previoaus Data");
            navigate("/previousinsurance");
        } catch (e) {
            console.log("Problem in combine submit", e);
        }
    };

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
          document.body.classList.add("ios-safearea");
        } else {
          document.body.classList.remove("ios-safearea");
        }

    return (
        <SidebarLayout>
            <div className="beneficiary-detail-container">
                {/* <div className="beneficiary-navbar bg-white mb-4 p-3 shadow-sm">
                    <div className="backArrow pt-2"  onClick={handleBack}>
                        <FontAwesomeIcon icon={faArrowLeft} className="backPointer red-text" />
                        <span className="ms-2 red-text ml-2">Benefeciary Details</span>
                    </div>
                    <div className="border-bottom mt-2"></div>
                </div> */}
                <div className='BeneficiaryForm'>
                    <AccordionItem
                        title="Life A: Proposed Insured Details"
                        isOpen={Array.isArray(openItem) && openItem.includes('lifeA')}
                        onClick={() => handleAccordionClick('lifeA')}
                        disabled={applicationType === ''}
                    //disabled={applicationType === ''}
                    >
                        {forms.map((form, index) => (
                            <Formik
                                key={index}

                                initialValues={form}
                                validationSchema={validationSchema}
                                validateOnBlur={false} // Disables validation on blur
                                validateOnChange={false} // Disables validation on change
                                onSubmit={(values) => {
                                    console.log('Submitted Values:', values); // Logs filled form values
                                    handleAllocateshare(values); // Pass the values to allocation handler
                                    setIsAllocateClicked(true); // Prevent duplicate allocation clicks
                                }}

                            >

                                {({ isValid, dirty, setFieldValue, values }) => (
                                    <Form className='beneficiaryForm'
                                        innerRef={(el) => {
                                            if (el) {
                                                formRefs.current[index] = el; // Add the reference
                                            } else {
                                                formRefs.current[index] = null; // Clear unmounted refs
                                            }
                                        }}>

                                        {/* onSubmit={(e) => {
                                        e.preventDefault(); // Prevent default browser submission
                                        handleSubmit(); // Trigger Formik's submit handler
                                    }} */}
                                        {/* Title */}
                                        <div className="mb-3 row">
                                            <div className="col-sm-6">
                                                <label htmlFor="title">Title<span className="text-danger">*</span></label>
                                                <Field
                                                    as="select"
                                                    className="form-control"
                                                    id="title"
                                                    name="title"
                                                    onChange={(e) => {
                                                        const selectedTitle = e.target.value;
                                                        setFieldValue('title', selectedTitle);

                                                        // Map title to gender
                                                        if (selectedTitle === 'Mr') {
                                                            setFieldValue('gender', 'Male');
                                                            setIsGenderDisabled(true); // Disable radio buttons
                                                        } else if (selectedTitle === 'Mrs' || selectedTitle === 'Miss') {
                                                            setFieldValue('gender', 'Female');
                                                            setIsGenderDisabled(true); // Disable radio buttons
                                                        } else if (selectedTitle === 'Dr') {
                                                            setFieldValue('gender', ''); // Clear gender for Dr
                                                            setIsGenderDisabled(false); // Enable radio buttons
                                                        } else {
                                                            setFieldValue('gender', ''); // Clear gender if no valid title is selected
                                                            setIsGenderDisabled(true); // Disable radio buttons
                                                        }
                                                    }}
                                                >
                                                    <option value="" label="Select Title" />
                                                    <option value="Mr" label="Mr" />
                                                    <option value="Mrs" label="Mrs" />
                                                    <option value="Miss" label="Miss" />
                                                    <option value="Dr" label="Dr" />
                                                </Field>
                                                <ErrorMessage name="title" component="div" className="text-danger" />
                                            </div>

                                            <div className="col-sm-6">
                                                <label htmlFor="nameWithInitials">Name with Initials<span className="text-danger">*</span></label>
                                                <Field type="text" className="form-control" id="nameWithInitials" name="nameWithInitials" placeholder="Enter name with initials"
                                                    onChange={(e) => {

                                                        setFieldValue("nameWithInitials", e.target.value)
                                                    }}
                                                    onInput={(e) => {
                                                        e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                                    }}
                                                />
                                                <ErrorMessage name="nameWithInitials" component="div" className="text-danger" />
                                            </div>

                                        </div>

                                        {/* First Name */}
                                        <div className="mb-3 row">
                                            <div className="col-sm-6">
                                                <label htmlFor="firstName">First Name<span className="text-danger">*</span></label>
                                                <Field type="text" className="form-control" id="firstName" name="firstName" placeholder="Enter first name"
                                                    onChange={(e) => {

                                                        setFieldValue("firstName", e.target.value)
                                                    }}
                                                    onInput={(e) => {
                                                        e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                                    }} />
                                                <ErrorMessage name="firstName" component="div" className="text-danger" />
                                            </div>
                                            <div className="col-sm-6">
                                                <label htmlFor="lastName">Last Name<span className="text-danger">*</span></label>
                                                <Field type="text" className="form-control" id="lastName" name="lastName" placeholder="Enter last name"
                                                    onChange={(e) => {

                                                        setFieldValue("lastName", e.target.value)
                                                    }}
                                                    onInput={(e) => {
                                                        e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                                    }}
                                                />
                                                <ErrorMessage name="lastName" component="div" className="text-danger" />
                                            </div>
                                        </div>

                                        {/* Date of Birth */}
                                        <div className="mb-3 row">
                                            <div className="col-sm-6">
                                                <label htmlFor="dob">Date of Birth<span className="text-danger">*</span></label>
                                                <Field
                                                    type="date"
                                                    className="form-control"
                                                    id="dob"
                                                    name="dob"
                                                    max={new Date().toISOString().split('T')[0]}
                                                    onChange={(e) => {
                                                        const selectedDate = e.target.value;
                                                        const today = new Date().toISOString().split('T')[0];

                                                        if (selectedDate > today) {
                                                            alert("Date of Birth cannot be in the future!");
                                                            return;
                                                        }

                                                        setFieldValue('dob', selectedDate);

                                                        const calculatedAge = calculateAge(selectedDate);
                                                        setAge(calculatedAge);
                                                        setFieldValue('age', calculatedAge); // Set age in Formik form state
                                                    }}
                                                />
                                                <ErrorMessage name="dob" component="div" className="text-danger" />
                                            </div>

                                            <div className="col-sm-6">
                                                <label htmlFor="age">Age</label>
                                                <Field type="number" className="form-control" id="age" name="age" placeholder="Age" value={age} readOnly

                                                />
                                                <ErrorMessage name="age" component="div" className="text-danger" />
                                            </div>
                                        </div>

                                        {/* Aadhaar Card No */}
                                        <div className="mb-3 row">
                                            <div className="col-sm-6">
                                                <label htmlFor="aadharCardNo">Aadhaar Card No<span className="text-danger">*</span></label>
                                                <Field type="text" className="form-control" id="aadharCardNo" name="aadharCardNo" maxLength={14} placeholder="Enter Aadhaar card number"
                                                    onChange={(e) => {
                                                        const input = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
                                                        const formatted = input
                                                            .match(/.{1,4}/g) // Split into groups of 4 digits
                                                            ?.join(" ") // Join with spaces
                                                            .substr(0, 14) || ""; // Ensure max length of 14
                                                        setFieldValue("aadharCardNo", formatted);
                                                    }}

                                                />
                                                <ErrorMessage name="aadharCardNo" component="div" className="text-danger" />
                                            </div>

                                            <div className="col-sm-6">
                                                <label htmlFor="relationship">Relationship<span className="text-danger">*</span></label>
                                                <Field as="select" className="form-control" id="relationship" name="relationship">
                                                    <option value="" label="Select Relationship" />
                                                    <option value="Brother" label="Brother" />
                                                    <option value="Sister" label="Sister" />
                                                    <option value="Father" label="Father" />
                                                    <option value="Mother" label="Mother" />
                                                    <option value="Husband" label="Husband" />
                                                    <option value="Wife" label="Wife" />
                                                    {/* onChange={(e) => {

                                                        setFieldValue("aadharCardNo", e.target.value)
                                                    }} */}
                                                </Field>
                                                <ErrorMessage name="relationship" component="div" className="text-danger" />
                                            </div>
                                        </div>

                                        {/* Gender */}
                                        <div className="mb-3 row">
                                            <div className="col-sm-6">
                                                <label>Gender<span className="text-danger">*</span></label>
                                                <div className="d-flex justify-content-between">
                                                    <div className="form-check">
                                                        <Field type="radio" className="form-check-input" name="gender" value="Male" checked={values.gender === 'Male'} disabled={isGenderDisabled} />
                                                        <label className="form-check-label">Male</label>
                                                    </div>
                                                    <div className="form-check">
                                                        <Field type="radio" className="form-check-input" name="gender" value="Female" checked={values.gender === 'Female'} disabled={isGenderDisabled} />
                                                        <label className="form-check-label">Female</label>
                                                    </div>
                                                    <ErrorMessage name="gender" component="div" className="text-danger" />
                                                </div>
                                            </div>

                                            <div className="col-sm-6">
                                                <label htmlFor="maritalStatus">Marital Status<span className="text-danger">*</span></label>
                                                <Field as="select" className="form-control" id="maritalStatus" name="maritalStatus"
                                                    onChange={(e) => {
                                                        const selectedValue = e.target.value;
                                                        setFieldValue('maritalStatus', selectedValue);
                                                        setIsAllocateDisabled(selectedValue === '');
                                                    }}>
                                                    <option value="" label="Select Marital Status" />
                                                    <option value="Single" label="Single" />
                                                    <option value="Married" label="Married" />
                                                    <option value="Widowed" label="Widowed" />
                                                    <option value="Divorced" label="Divorced" />
                                                </Field>
                                                <ErrorMessage name="maritalStatus" component="div" className="text-danger" />
                                            </div>
                                        </div>

                                        <div className="mb-3 row">
                                            <div className="col-12 d-flex justify-content-between">
                                                <button type="button" className="btn btn-danger" /*disabled={disableshareallocate}*/ disabled={isAllocateDisabled} onClick={() => handleAllocateshare(values)}>Allocate Share</button>
                                                <button type="button" className="btn btn-danger" onClick={() => {
                                                    handleAddNewForm(); // Allow adding new form
                                                    setIsAllocateClicked(false); // Reset the isAllocateClicked when Add New is clicked
                                                }} disabled={!(isValid && dirty)}>
                                                    Add New
                                                </button>
                                                {forms.length > 1 && (
                                                    <button type="button" className="btn btn-danger" onClick={() => handleRemoveForm(form.id)}>
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                    </Form>
                                )}

                            </Formik>
                        ))}
                        {showTable && beneficiaries.length > 0 && (
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Beneficiary Name</th>
                                        <th scope="col">Death Benefit / Immediate Cash Benefit</th>
                                        <th scope="col">Family Income Benefit</th>
                                        <th scope="col">Family Digasiri Benefit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {beneficiaries.map((beneficiary, idx) => (
                                        <tr key={idx}>
                                            <td>{beneficiary.nameWithInitials}</td>
                                            <td>
                                                {/* Editable input field for each beneficiary */}
                                                <input
                                                    type="number"
                                                    value={shareAllocations[idx]}
                                                    onChange={(e) => handleInputChange(idx, e.target.value)}
                                                    className="form-control"
                                                />
                                            </td>
                                            <td><input type="radio" name='default-checked' value="100" checked />100</td>
                                            <td>
                                                <input type="radio" name={`familyBenefit${idx}`} value="100" checked /> 100
                                            </td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <th scope="row">Total Percentage </th>
                                        <td><label className="form-check-label">100</label>
                                        </td>

                                    </tr>
                                </tbody>
                            </table>
                        )}



                        <h4>Contingent Beneficiary Details</h4>
                        {contingentForms.map((form, index) => (
                            <Formik
                                key={index}

                                initialValues={{
                                    title: '',
                                    nameWithInitials: '',
                                    firstName: '',
                                    lastName: '',
                                    dob: '',
                                    age: '',
                                    aadharCardNo: '',
                                    relationship: '',
                                    gender: '',
                                    maritalStatus: '',
                                }}
                                validationSchema={validationSchema}
                                onSubmit={(values) => {
                                    handleContingentAllocateShare(values); // Separate handler for contingent beneficiaries

                                    console.log(values);
                                    setIsContingentAllocateClicked(true);
                                }}

                            >

                                {({ values, setFieldValue, isValid, dirty }) => (
                                    <Form className='beneficiaryForm'
                                        innerRef={(el) => {
                                            contingentFormRefs.current[index] = el;  // Assigning the form reference to the index
                                        }}
                                    >
                                        {/* Title */}
                                        <div className="mb-3 row">

                                            <div className="col-sm-6">
                                                <label htmlFor="title">Title</label>
                                                <Field
                                                    as="select"
                                                    className="form-control"
                                                    id="title"
                                                    name="title"
                                                    onChange={(e) => {
                                                        const selectedTitle = e.target.value;
                                                        setFieldValue('title', selectedTitle);

                                                        // Map title to gender
                                                        if (selectedTitle === 'Mr') {
                                                            setFieldValue('gender', 'Male');
                                                            setcontigentgenderdisable(true); // Disable radio buttons
                                                        } else if (selectedTitle === 'Mrs' || selectedTitle === 'Miss') {
                                                            setFieldValue('gender', 'Female');
                                                            setcontigentgenderdisable(true); // Disable radio buttons
                                                        } else if (selectedTitle === 'Dr') {
                                                            setFieldValue('gender', ''); // Clear gender for Dr
                                                            setcontigentgenderdisable(false); // Enable radio buttons
                                                        } else {
                                                            setFieldValue('gender', ''); // Clear gender if no valid title is selected
                                                            setcontigentgenderdisable(true); // Disable radio buttons
                                                        }
                                                    }}
                                                >
                                                    <option value="" label="Select Title" />
                                                    <option value="Mr" label="Mr" />
                                                    <option value="Mrs" label="Mrs" />
                                                    <option value="Miss" label="Miss" />
                                                    <option value="Dr" label="Dr" />
                                                </Field>
                                                <ErrorMessage name="title" component="div" className="text-danger" />
                                            </div>

                                            <div className="col-sm-6">
                                                <label htmlFor="nameWithInitials" >Name with Initials</label>
                                                <Field type="text" className="form-control" id="nameWithInitials" name="nameWithInitials" placeholder="Enter name with initials"
                                                    onInput={(e) => {
                                                        e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                                    }} />
                                                <ErrorMessage name="nameWithInitials" component="div" className="text-danger" />
                                            </div>
                                        </div>

                                        {/* First Name */}
                                        <div className="mb-3 row">
                                            <div className="col-sm-6">
                                                <label htmlFor="firstName">First Name</label>
                                                <Field type="text" className="form-control" id="firstName" name="firstName" placeholder="Enter first name"
                                                    onInput={(e) => {
                                                        e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                                    }} />
                                                <ErrorMessage name="firstName" component="div" className="text-danger" />
                                            </div>

                                            <div className="col-sm-6">
                                                <label htmlFor="lastName">Last Name</label>
                                                <Field type="text" className="form-control" id="lastName" name="lastName" placeholder="Enter last name"
                                                    onInput={(e) => {
                                                        e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                                    }}
                                                />
                                                <ErrorMessage name="lastName" component="div" className="text-danger" />
                                            </div>
                                        </div>


                                        {/* Date of Birth */}
                                        <div className="mb-3 row">
                                            <div className="col-sm-6">
                                                <label htmlFor="dob">Date of Birth</label>
                                                <Field
                                                    type="date"
                                                    className="form-control"
                                                    id="dob"
                                                    name="dob"
                                                    max={new Date().toISOString().split('T')[0]}
                                                    onChange={(e) => {
                                                        const selectedDate = e.target.value;
                                                        const today = new Date().toISOString().split('T')[0];

                                                        if (selectedDate > today) {
                                                            alert("Date of Birth cannot be in the future!");
                                                            return;
                                                        }

                                                        setFieldValue('dob', selectedDate);

                                                        const calculatedAge = calculateAge(selectedDate);
                                                        setAge(calculatedAge);
                                                        setFieldValue('age', calculatedAge); // Set age in Formik form state
                                                    }}
                                                />
                                                <ErrorMessage name="dob" component="div" className="text-danger" />
                                            </div>

                                            <div className="col-sm-6">
                                                <label htmlFor="age">Age</label>
                                                <Field type="number" className="form-control" id="age" name="age" placeholder="Age" readOnly />
                                                <ErrorMessage name="age" component="div" className="text-danger" />
                                            </div>
                                        </div>

                                        {/* Aadhaar Card No */}
                                        <div className="mb-3 row">
                                            <div className="col-sm-6">
                                                <label htmlFor="aadharCardNo" >Aadhaar Card No</label>
                                                <Field type="text" className="form-control" id="aadharCardNo" name="aadharCardNo" maxLength={14} placeholder="Enter Aadhaar card number"
                                                    onChange={(e) => {
                                                        const input = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
                                                        const formatted = input
                                                            .match(/.{1,4}/g) // Split into groups of 4 digits
                                                            ?.join(" ") // Join with spaces
                                                            .substr(0, 14) || ""; // Ensure max length of 14
                                                        setFieldValue("aadharCardNo", formatted);
                                                    }}
                                                />
                                                <ErrorMessage name="aadharCardNo" component="div" className="text-danger" />
                                            </div>

                                            <div className="col-sm-6">
                                                <label htmlFor="relationship">Relationship</label>
                                                <Field as="select" className="form-control" id="relationship" name="relationship">
                                                    <option value="" label="Select Relationship" />
                                                    <option value="Brother" label="Brother" />
                                                    <option value="Sister" label="Sister" />
                                                    <option value="Father" label="Father" />
                                                    <option value="Mother" label="Mother" />
                                                    <option value="Husband" label="Husband" />
                                                    <option value="Wife" label="Wife" />
                                                </Field>
                                                <ErrorMessage name="relationship" component="div" className="text-danger" />
                                            </div>
                                        </div>

                                        {/* Gender */}
                                        <div className="mb-3 row">
                                            <div className="col-sm-6">
                                                <label>Gender</label>
                                                <div className="d-flex justify-content-between">
                                                    <div className="form-check">
                                                        <Field type="radio" className="form-check-input" name="gender" value="Male" checked={values.gender === 'Male'} disabled={contigentgenderdisable} />
                                                        <label className="form-check-label">Male</label>
                                                    </div>
                                                    <div className="form-check">
                                                        <Field type="radio" className="form-check-input" name="gender" value="Female" checked={values.gender === 'Female'} disabled={contigentgenderdisable} />
                                                        <label className="form-check-label">Female</label>
                                                    </div>
                                                    <ErrorMessage name="gender" component="div" className="text-danger" />
                                                </div>
                                            </div>

                                            <div className="col-sm-6">
                                                <label htmlFor="maritalStatus" >Marital Status</label>
                                                <Field as="select" className="form-control" id="maritalStatus" name="maritalStatus"
                                                    onChange={(e) => {
                                                        const selectedValue = e.target.value;
                                                        setFieldValue('maritalStatus', selectedValue);
                                                        setIsAllocateDisabledcontigent(selectedValue === '');
                                                    }}>
                                                    <option value="" label="Select Marital Status" />
                                                    <option value="Single" label="Single" />
                                                    <option value="Married" label="Married" />
                                                    <option value="Widowed" label="Widowed" />
                                                    <option value="Divorced" label="Divorced" />
                                                </Field>
                                                <ErrorMessage name="maritalStatus" component="div" className="text-danger" />
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="mb-3 row">
                                            <div className="col-12 d-flex justify-content-between">
                                                <button type="submit" className="btn btn-danger" disabled={isAllocateDisabledcontigent}>Allocate Share</button>
                                                <button type="button" className="btn btn-danger" onClick={() => {
                                                    handleAddNewContingentForm(); // Add new contingent form
                                                    setIsContingentAllocateClicked(false);
                                                }} disabled={!(isValid && dirty)}>
                                                    Add New
                                                </button>
                                                {contingentForms.length > 1 && (
                                                    <button type="button" className="btn btn-danger" onClick={() => handleRemoveContingentForm(form.id)}>
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                    </Form>
                                )}
                            </Formik>
                        ))}

                        {showcontigenttable && (
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Contingent Beneficiary Name</th>
                                        <th scope="col">Death Benefit / Immediate Cash Benefit</th>
                                        <th scope="col">Family Income Benefit</th>
                                        <th scope="col">Family Digasiri Benefit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contingentBeneficiaries.map((beneficiary, idx) => (
                                        <tr key={idx}>
                                            <td>{beneficiary.nameWithInitials}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={contingentShareAllocations[idx]}
                                                    onChange={(e) => handleContingentInputChange(idx, e.target.value)}
                                                    className="form-control"
                                                />
                                            </td>
                                            <td><input type="radio" name='default-checked' value="100" checked />100</td>
                                            <td>
                                                <input type="radio" name={`contingentFamilyBenefit${idx}`} value="100" checked /> 100
                                            </td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <th scope="row">Total Percentage </th>
                                        <td><label className="form-check-label">100</label></td>
                                    </tr>
                                </tbody>
                            </table>
                        )}



                    </AccordionItem>

                    <AccordionItem
                        title="Life B: Spouse Insured Details"
                        isOpen={Array.isArray(openItem) && openItem.includes('lifeB')}
                        onClick={() => handleAccordionClick('lifeB')}
                        disabled={applicationType === 'Single Life'}
                    >
                        <h4>Beneficiary Details</h4>
                        {spouseForms.map((form, index) => (
                            <Formik
                                key={index}

                                initialValues={form}
                                validationSchema={validationSchema}
                                onSubmit={(values) => {
                                    handleSpouseAllocateShare(values);
                                    setspouseIsAllocateClicked(true); // Separate function for spouse share
                                    console.log(values);
                                }}

                            >
                                {({ values, setFieldValue, isValid, dirty }) => (
                                    <Form className='beneficiaryForm'
                                        innerRef={(el) => {
                                            spouseFormRefs.current[index] = el;  // Assigning the form reference to the index
                                        }}
                                    >
                                        {/* Title */}
                                        <div className="mb-3 row">

                                            <div className="col-sm-6">
                                                <label htmlFor="title">Title<span className="text-danger">*</span></label>
                                                <Field
                                                    as="select"
                                                    className="form-control"
                                                    id="title"
                                                    name="title"
                                                    onChange={(e) => {
                                                        const selectedTitle = e.target.value;
                                                        setFieldValue('title', selectedTitle);

                                                        // Map title to gender
                                                        if (selectedTitle === 'Mr') {
                                                            setFieldValue('gender', 'Male');
                                                            setspousegenderdisable(true); // Disable radio buttons
                                                        } else if (selectedTitle === 'Mrs' || selectedTitle === 'Miss') {
                                                            setFieldValue('gender', 'Female');
                                                            setspousegenderdisable(true); // Disable radio buttons
                                                        } else if (selectedTitle === 'Dr') {
                                                            setFieldValue('gender', ''); // Clear gender for Dr
                                                            setspousegenderdisable(false); // Enable radio buttons
                                                        } else {
                                                            setFieldValue('gender', ''); // Clear gender if no valid title is selected
                                                            setspousegenderdisable(true); // Disable radio buttons
                                                        }
                                                    }}
                                                >
                                                    <option value="" label="Select Title" />
                                                    <option value="Mr" label="Mr" />
                                                    <option value="Mrs" label="Mrs" />
                                                    <option value="Miss" label="Miss" />
                                                    <option value="Dr" label="Dr" />
                                                </Field>
                                                <ErrorMessage name="title" component="div" className="text-danger" />
                                            </div>

                                            <div className="col-sm-6">
                                                <label htmlFor="nameWithInitials">Name with Initials<span className="text-danger">*</span></label>
                                                <Field type="text" className="form-control" id="nameWithInitials" name="nameWithInitials" placeholder="Enter name with initials"
                                                    onInput={(e) => {
                                                        e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                                    }} />
                                                <ErrorMessage name="nameWithInitials" component="div" className="text-danger" />
                                            </div>
                                        </div>

                                        {/* First Name */}
                                        <div className="mb-3 row">
                                            <div className="col-sm-6">
                                                <label htmlFor="firstName" >First Name<span className="text-danger">*</span></label>
                                                <Field type="text" className="form-control" id="firstName" name="firstName" placeholder="Enter first name"
                                                    onInput={(e) => {
                                                        e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                                    }} />
                                                <ErrorMessage name="firstName" component="div" className="text-danger" />
                                            </div>

                                            <div className="col-sm-6">
                                                <label htmlFor="lastName">Last Name<span className="text-danger">*</span></label>
                                                <Field type="text" className="form-control" id="lastName" name="lastName" placeholder="Enter last name"
                                                    onInput={(e) => {
                                                        e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                                    }} />
                                                <ErrorMessage name="lastName" component="div" className="text-danger" />
                                            </div>
                                        </div>

                                        {/* Date of Birth */}
                                        <div className="mb-3 row">
                                            <div className="col-sm-6">
                                                <label htmlFor="dob">Date of Birth<span className="text-danger">*</span></label>
                                                <Field
                                                    type="date"
                                                    className="form-control"
                                                    id="dob"
                                                    name="dob"
                                                    max={new Date().toISOString().split('T')[0]}
                                                    onChange={(e) => {
                                                        const selectedDate = e.target.value;
                                                        const today = new Date().toISOString().split('T')[0];

                                                        if (selectedDate > today) {
                                                            alert("Date of Birth cannot be in the future!");
                                                            return;
                                                        }

                                                        setFieldValue('dob', selectedDate);

                                                        const calculatedAge = calculateAge(selectedDate);
                                                        setAge(calculatedAge);
                                                        setFieldValue('age', calculatedAge); // Set age in Formik form state
                                                    }}
                                                />
                                                <ErrorMessage name="dob" component="div" className="text-danger" />
                                            </div>
                                            <div className="col-sm-6">
                                                <label htmlFor="age">Age</label>
                                                <Field type="number" className="form-control" id="age" name="age" placeholder="Age" value={age} readOnly />
                                                <ErrorMessage name="age" component="div" className="text-danger" />
                                            </div>
                                        </div>

                                        {/* Aadhaar Card No */}
                                        <div className="mb-3 row">
                                            <div className="col-sm-6">
                                                <label htmlFor="aadharCardNo">Aadhaar Card No<span className="text-danger">*</span></label>
                                                <Field type="text" className="form-control" id="aadharCardNo" name="aadharCardNo" placeholder="Enter Aadhaar card number" maxLength={14}
                                                    onChange={(e) => {
                                                        const input = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
                                                        const formatted = input
                                                            .match(/.{1,4}/g) // Split into groups of 4 digits
                                                            ?.join(" ") // Join with spaces
                                                            .substr(0, 14) || ""; // Ensure max length of 14
                                                        setFieldValue("aadharCardNo", formatted);
                                                    }}
                                                />
                                                <ErrorMessage name="aadharCardNo" component="div" className="text-danger" />
                                            </div>

                                            <div className="col-sm-6">
                                                <label htmlFor="relationship">Relationship<span className="text-danger">*</span></label>
                                                <Field as="select" className="form-control" id="relationship" name="relationship">
                                                    <option value="" label="Select Relationship" />
                                                    <option value="Brother" label="Brother" />
                                                    <option value="Sister" label="Sister" />
                                                    <option value="Father" label="Father" />
                                                    <option value="Mother" label="Mother" />
                                                    <option value="Husband" label="Husband" />
                                                    <option value="Wife" label="Wife" />
                                                </Field>
                                                <ErrorMessage name="relationship" component="div" className="text-danger" />
                                            </div>
                                        </div>

                                        {/* Gender */}
                                        <div className="mb-3 row">
                                            <div className="col-sm-6">
                                                <label>Gender<span className="text-danger">*</span></label>
                                                <div className="d-flex justify-content-between">
                                                    <div className="form-check">
                                                        <Field type="radio" className="form-check-input" name="gender" value="Male" checked={values.gender === 'Male'} disabled={spousegenderdisable} />
                                                        <label className="form-check-label">Male</label>
                                                    </div>
                                                    <div className="form-check">
                                                        <Field type="radio" className="form-check-input" name="gender" value="Female" checked={values.gender === 'Female'} disabled={spousegenderdisable} />
                                                        <label className="form-check-label">Female</label>
                                                    </div>
                                                    <ErrorMessage name="gender" component="div" className="text-danger" />
                                                </div>
                                            </div>

                                            <div className="col-sm-6">
                                                <label htmlFor="maritalStatus" >Marital Status<span className="text-danger">*</span></label>
                                                <Field as="select" className="form-control" id="maritalStatus" name="maritalStatus"
                                                    onChange={(e) => {
                                                        const selectedvalue = e.target.value;
                                                        setFieldValue('maritalStatus', selectedvalue);
                                                        setIsAllocateDisabledspouse(selectedvalue === '');
                                                    }}>
                                                    <option value="" label="Select Marital Status" />
                                                    <option value="Single" label="Single" />
                                                    <option value="Married" label="Married" />
                                                    <option value="Widowed" label="Widowed" />
                                                    <option value="Divorced" label="Divorced" />
                                                </Field>
                                                <ErrorMessage name="maritalStatus" component="div" className="text-danger" />
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="mb-3 row">
                                            <div className="col-12 d-flex justify-content-between">
                                                <button type="submit" className="btn btn-danger" /*disabled={spousedisableshareallocate}*/ disabled={spouseisAllocateClicked}>Allocate Share</button>
                                                <button type="button" className="btn btn-danger" onClick={() => {
                                                    handleSpouseAddNewForm()
                                                    setspouseIsAllocateClicked(false)
                                                }} disabled={!(isValid && dirty)}>
                                                    Add New
                                                </button>
                                                {spouseForms.length > 1 && (
                                                    <button type="button" className="btn btn-danger" onClick={() => handleSpouseRemoveForm(form.id)}>
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </Form>
                                )}
                            </Formik>

                        ))}
                        {showSpouseTable && (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Beneficiary Name</th>
                                        <th scope="col">Death Benefit / Immediate Cash Benefit</th>
                                        <th scope="col">Family Income Benefit</th>
                                        <th scope="col">Family Digasiri Benefit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {spouseBeneficiaries.map((beneficiary, idx) => (
                                        <tr key={idx}>
                                            <td>{beneficiary.nameWithInitials}</td>
                                            <td>
                                                {/* Editable input field for each beneficiary */}
                                                <input
                                                    type="number"
                                                    value={spouseshareallocation[idx]}
                                                    onChange={(e) => handleSpouseInputChange(e.target.value, idx)}
                                                    className="form-control"
                                                />
                                            </td>
                                            <td><input type="radio" name="spousedefaultcheck" value="100" checked /> 100</td>
                                            <td>
                                                <input type="radio" name={`familyBenefit${idx}`} value="100" checked /> 100
                                            </td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <th scope="row">Total Percentage</th>
                                        <td><label className="form-check-label">100</label></td>
                                    </tr>
                                </tbody>
                            </table>
                        )}


                        <h4>Contingent Beneficiary Details</h4>
                        {contigentspouseForms.map((form, index) => (
                            <Formik
                                key={index}

                                initialValues={{
                                    title: '',
                                    nameWithInitials: '',
                                    firstName: '',
                                    lastName: '',
                                    dob: '',
                                    age: '',
                                    aadharCardNo: '',
                                    relationship: '',
                                    gender: '',
                                    maritalStatus: '',
                                }}
                                validationSchema={validationSchema}
                                onSubmit={(values) => {
                                    handleSpouseContigentAllocateShare(values); // Separate handler for contingent beneficiaries

                                    console.log(values);
                                    setspouseIsAllocateClicked(true);
                                }}

                            >

                                {({ values, setFieldValue, isValid, dirty }) => (
                                    <Form className='beneficiaryForm'
                                        innerRef={(el) => {
                                            contingentSpouseFormRefs.current[index] = el;  // Assigning the form reference to the index
                                        }}
                                    >
                                        {/* Title */}
                                        <div className="mb-3 row">
                                            <div className="col-sm-6">
                                                <label htmlFor="title">Title</label>
                                                <Field
                                                    as="select"
                                                    className="form-control"
                                                    id="title"
                                                    name="title"
                                                    onChange={(e) => {
                                                        const selectedTitle = e.target.value;
                                                        setFieldValue('title', selectedTitle);

                                                        // Map title to gender
                                                        if (selectedTitle === 'Mr') {
                                                            setFieldValue('gender', 'Male');
                                                            setspousecontigentgenderdisable(true); // Disable radio buttons
                                                        } else if (selectedTitle === 'Mrs' || selectedTitle === 'Miss') {
                                                            setFieldValue('gender', 'Female');
                                                            setspousecontigentgenderdisable(true); // Disable radio buttons
                                                        } else if (selectedTitle === 'Dr') {
                                                            setFieldValue('gender', ''); // Clear gender for Dr
                                                            setspousecontigentgenderdisable(false); // Enable radio buttons
                                                        } else {
                                                            setFieldValue('gender', ''); // Clear gender if no valid title is selected
                                                            setspousecontigentgenderdisable(true); // Disable radio buttons
                                                        }
                                                    }}
                                                >
                                                    <option value="" label="Select Title" />
                                                    <option value="Mr" label="Mr" />
                                                    <option value="Mrs" label="Mrs" />
                                                    <option value="Miss" label="Miss" />
                                                    <option value="Dr" label="Dr" />
                                                </Field>
                                                <ErrorMessage name="title" component="div" className="text-danger" />
                                            </div>

                                            <div className="col-sm-6">
                                                <label htmlFor="nameWithInitials" >Name with Initials</label>
                                                <Field type="text" className="form-control" id="nameWithInitials" name="nameWithInitials" placeholder="Enter name with initials"
                                                    onInput={(e) => {
                                                        e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                                    }}
                                                />
                                                <ErrorMessage name="nameWithInitials" component="div" className="text-danger" />
                                            </div>
                                        </div>

                                        {/* First Name */}
                                        <div className="mb-3 row">
                                            <div className="col-sm-6">
                                                <label htmlFor="firstName">First Name</label>
                                                <Field type="text" className="form-control" id="firstName" name="firstName" placeholder="Enter first name"
                                                    onInput={(e) => {
                                                        e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                                    }}
                                                />
                                                <ErrorMessage name="firstName" component="div" className="text-danger" />
                                            </div>

                                            <div className="col-sm-6">
                                                <label htmlFor="lastName">Last Name</label>
                                                <Field type="text" className="form-control" id="lastName" name="lastName" placeholder="Enter last name"
                                                    onInput={(e) => {
                                                        e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                                    }}
                                                />
                                                <ErrorMessage name="lastName" component="div" className="text-danger" />
                                            </div>
                                        </div>

                                        {/* Date of Birth */}
                                        <div className="mb-3 row">
                                            <div className="col-sm-6">
                                                <label htmlFor="dob">Date of Birth</label>
                                                <Field
                                                    type="date"
                                                    className="form-control"
                                                    id="dob"
                                                    name="dob"
                                                    max={new Date().toISOString().split('T')[0]}
                                                    onChange={(e) => {
                                                        const selectedDate = e.target.value;
                                                        const today = new Date().toISOString().split('T')[0];

                                                        if (selectedDate > today) {
                                                            alert("Date of Birth cannot be in the future!");
                                                            return;
                                                        }

                                                        setFieldValue('dob', selectedDate);

                                                        const calculatedAge = calculateAge(selectedDate);
                                                        setAge(calculatedAge);
                                                        setFieldValue('age', calculatedAge); // Set age in Formik form state
                                                    }}
                                                />
                                                <ErrorMessage name="dob" component="div" className="text-danger" />
                                            </div>

                                            <div className="col-sm-6">
                                                <label htmlFor="age" >Age</label>
                                                <Field type="number" className="form-control" id="age" name="age" placeholder="Age" readOnly />
                                                <ErrorMessage name="age" component="div" className="text-danger" />
                                            </div>
                                        </div>

                                        {/* Aadhaar Card No */}
                                        <div className="mb-3 row">
                                            <div className="col-sm-6">
                                                <label htmlFor="aadharCardNo">Aadhaar Card No</label>
                                                <Field type="text" className="form-control" id="aadharCardNo" name="aadharCardNo" placeholder="Enter Aadhaar card number" maxLength={14}
                                                    onChange={(e) => {
                                                        const input = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
                                                        const formatted = input
                                                            .match(/.{1,4}/g) // Split into groups of 4 digits
                                                            ?.join(" ") // Join with spaces
                                                            .substr(0, 14) || ""; // Ensure max length of 14
                                                        setFieldValue("aadharCardNo", formatted);
                                                    }}
                                                />
                                                <ErrorMessage name="aadharCardNo" component="div" className="text-danger" />
                                            </div>

                                            <div className="col-sm-6">
                                                <label htmlFor="relationship" >Relationship</label>
                                                <Field as="select" className="form-control" id="relationship" name="relationship">
                                                    <option value="" label="Select Relationship" />
                                                    <option value="Brother" label="Brother" />
                                                    <option value="Sister" label="Sister" />
                                                    <option value="Father" label="Father" />
                                                    <option value="Mother" label="Mother" />
                                                    <option value="Husband" label="Husband" />
                                                    <option value="Wife" label="Wife" />
                                                </Field>
                                                <ErrorMessage name="relationship" component="div" className="text-danger" />
                                            </div>
                                        </div>

                                        {/* Gender */}
                                        <div className="mb-3 row">
                                            <div className="col-sm-6">
                                                <label>Gender</label>
                                                <div className="d-flex justify-content-between">
                                                    <div className="form-check">
                                                        <Field type="radio" className="form-check-input" name="gender" value="Male" checked={values.gender === 'Male'} disabled={spousecontigentgenderdisable} />
                                                        <label className="form-check-label">Male</label>
                                                    </div>
                                                    <div className="form-check">
                                                        <Field type="radio" className="form-check-input" name="gender" value="Female" checked={values.gender === 'Female'} disabled={spousecontigentgenderdisable} />
                                                        <label className="form-check-label">Female</label>
                                                    </div>
                                                    <ErrorMessage name="gender" component="div" className="text-danger" />
                                                </div>
                                            </div>

                                            <div className="col-sm-6">
                                                <label htmlFor="maritalStatus" >Marital Status</label>
                                                <Field as="select" className="form-control" id="maritalStatus" name="maritalStatus"
                                                    onChange={(e) => {
                                                        const selectedvalue = e.target.value;
                                                        setFieldValue('maritalStatus', selectedvalue);
                                                        setIsAllocateDisabledspousecontigent(selectedvalue === '');
                                                    }}>
                                                    <option value="" label="Select Marital Status" />
                                                    <option value="Single" label="Single" />
                                                    <option value="Married" label="Married" />
                                                    <option value="Widowed" label="Widowed" />
                                                    <option value="Divorced" label="Divorced" />
                                                </Field>
                                                <ErrorMessage name="maritalStatus" component="div" className="text-danger" />
                                            </div>
                                        </div>

                                        {/* Table for Contingent Beneficiary Allocations */}
                                        {showcontigentspouseTable && (
                                            <table class="table">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">Contingent Beneficiary Name</th>
                                                        <th scope="col">Death Benefit / Immediate Cash Benefit</th>
                                                        <th scope="col">Family Income Benefit</th>
                                                        <th scope="col">Family Digasiri Benefit</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {contigentspouseBeneficiary.map((beneficiary, idx) => (
                                                        <tr key={idx}>
                                                            <td>{beneficiary.nameWithInitials}</td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    value={contigentspouseshareallocation[idx]}
                                                                    onChange={(e) => handleContigentSpouseInputChange(idx, e.target.value)}
                                                                    className="form-control"
                                                                />
                                                            </td>
                                                            <td><input type="radio" name='default-checked' value="100" checked />100</td>
                                                            <td>
                                                                <input type="radio" name={`contingentFamilyBenefit${idx}`} value="100" checked /> 100
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr>
                                                        <th scope="row">Total Percentage </th>
                                                        <td><label className="form-check-label">100</label></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        )}

                                        {/* Submit Button */}
                                        <div className="mb-3 row">
                                            <div className="col-12 d-flex justify-content-between">
                                                <button type="submit" className="btn btn-danger" disabled={isAllocateDisabledspousecontigent}>Allocate Share</button>
                                                <button type="button" className="btn btn-danger" onClick={() => {
                                                    handleAddNewSpouseContigentForm() // Add new contingent form
                                                    setcontigentspouseisallocatedclicked(false);
                                                }} disabled={!(isValid && dirty)}>
                                                    Add New
                                                </button>
                                                {contigentspouseForms.length > 1 && (
                                                    <button type="button" className="btn btn-danger" onClick={() => handleSpouseContigentRemoveForm(form.id)}>
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                    </Form>
                                )}
                            </Formik>
                        ))}
                        {/* {showcontigentspouseTable && (
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Contingent Beneficiary Name</th>
                                        <th scope="col">Death Benefit / Immediate Cash Benefit</th>
                                        <th scope="col">Family Income Benefit</th>
                                        <th scope="col">Family Digasiri Benefit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contigentspouseBeneficiary.map((beneficiary, idx) => (
                                        <tr key={idx}>
                                            <td>{beneficiary.nameWithInitials}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={contigentspouseshareallocation[idx]}
                                                    onChange={(e) => handleContigentSpouseInputChange(idx, e.target.value)}
                                                    className="form-control"
                                                />
                                            </td>
                                            <td><input type="radio" name='default-checked' value="100" checked />100</td>
                                            <td>
                                                <input type="radio" name={`contingentFamilyBenefit${idx}`} value="100" checked /> 100
                                            </td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <th scope="row">Total Percentage </th>
                                        <td><label className="form-check-label">100</label></td>
                                    </tr>
                                </tbody>
                            </table>
                        )} */}
                    </AccordionItem>
                    {!isKeyboardVisible && (
                        <div className="iosfixednextprevbutton">
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

                    <ValidationErrorModal
                        show={isModalVisible}
                        onClose={handleModalClose}
                        message={modalMessage}
                    />

                </div>
            </div>
        </SidebarLayout>


    );
};

export default BeneficieryDetails;