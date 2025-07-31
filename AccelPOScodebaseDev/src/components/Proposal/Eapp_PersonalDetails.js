import React, { useState, useEffect } from 'react';
import './Eapp_personalDetails.css'
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { findRecordById, saveDetail, updateDetailById } from '../../db/indexedDB.js';
//import { quoteResponse, getAuthToken } from './SQS_personal_detailService';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';
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

const calculateAge = (birthDateString) => {
    const year = parseInt(birthDateString.slice(0, 4), 10);
    const month = parseInt(birthDateString.slice(5, 7), 10) - 1;
    const day = parseInt(birthDateString.slice(8, 10), 10);

    const birthDate = new Date(year, month, day);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

const EappPersonalDetail = () => {
    // const { applicationTypePersonalDetails } = useContext(ApplicationContext)
    // console.log("Got application type through context in address screen:::",applicationTypePersonalDetails)
    const [openItem, setOpenItem] = useState([]);
    const [fieldsDisabled, setFieldsDisabled] = useState(false)
    const [personidforsaving, setpersonidforsaving] = useState(sessionStorage.getItem("personId"))
    const [applicationType, setApplicationType] = useState('');
    const navigate = useNavigate();
    const [personaldata, setpersonaldata] = useState()
    //const [commmingfromproposalsummary , setcommingfromproposalsummary] = useState(false)

    const location = useLocation();
    const customerData = location.state || {};  // Access the passed customer data
    const [formData, setFormData] = useState(null);
    // const { personID } = useContext(PersonContext)
    // console.log("Got Person Id through context::",personID)
    const personID = sessionStorage.getItem("personID")
    const [kidsanswer, setkidsanswer] = useState();

    const [enableChildAccordion, setEnableChildAccordion] = useState(false); // Initial state for child accordion

    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    const erreferenceIdthroughProposalSummary = sessionStorage.getItem("eReferenceIdthroughproposalsummary");

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

    const formatDateTime = (date) => {
        const pad = (num) => num.toString().padStart(2, '0');
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const year = date.getFullYear();
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());

        return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
    };

    const navigate_to_addressdetails = () => {
        navigate('/eappaddress_details');
    };

    const lifeASchema = Yup.object({
        title: Yup.string().required('Title is required'),
        firstName: Yup.string()
            .max(36, 'firstName cannot be longer than 36 characters')
            .matches(/^([a-zA-Z]+\s)*([a-zA-Z]+)$/, 'firstName must only contain letters')
            .required('firstName is required'),
        lastName: Yup.string()
            .max(36, 'lastName cannot be longer than 36 characters')
            .matches(/^([a-zA-Z]+\s)*([a-zA-Z]+)$/, 'lastName must only contain letters')
            .required('Last Name is required'),
        Aadhaar: Yup.string()
            .required('Aadhaar Number is required'),

        Pan: Yup.string()
            .max(10, 'PAN must be of 10 characters')
            .required('Pan Number is required'),
        dateOfBirth: Yup.date()
            .required('Date of Birth is required!')
            .max(new Date(), 'Date of Birth cannot be in the future!')
            .test('dob', 'You must be between 18 to 80 years old!', function (value) {
                const today = new Date();
                const minDate = new Date(today.getFullYear() - 80, today.getMonth(), today.getDate());
                const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                return value <= maxDate && value >= minDate;
            }),
        age: Yup.number()
            .required('Age is required!')
            .min(18, 'You must be at least 18 years old!')
            .max(80, 'You must be under 80 years old!'),
        gender: Yup.string().required('Gender is required'),
        maritalStatus: Yup.string().required('Marital Status is required'),
        tobacco: Yup.string().required('Tobacco consumption status is required'),
        occupation: Yup.string().required('Occupation is required'),
        occupationClass: Yup.string().required('Occupation Class is required'),
        kids: Yup.string().required('Fill the details properly'),
        OtherSourceOfIncome: Yup.string()
            .required("Other Source of Income required")
            .matches(/^[a-zA-Z]+$/, "Other Source of Income must contain only letters without spaces or special characters"),
        annualIncome: Yup.string()
            .matches(/^[0-9\,]+$/, 'Annual Income must be a number with optional commas')
            .max(15, 'Annual Income cannot be longer than 15 characters')
            .required('Annual Income is required'),

        EducationalQualification: Yup.string()
            .required('Educational Qualification is required')
        //.matches(/^([a-zA-Z]+\s)*([a-zA-Z]+)$/,  'EducationalQualification must contain only letters')
    });

    const lifeBSchema = Yup.object({
        title: Yup.string().required('Title is required'),
        firstName: Yup.string()
            .max(36, 'firstName cannot be longer than 36 characters')
            .matches(/^([a-zA-Z]+\s)*([a-zA-Z]+)$/, 'firstName must only contain letters')
            .required('firstName is required'),
        lastName: Yup.string()
            .max(36, 'lastName cannot be longer than 36 characters')
            .matches(/^([a-zA-Z]+\s)*([a-zA-Z]+)$/, 'lastName must only contain letters')
            .required('Last Name is required'),
        Aadhaar: Yup.string()
            .required('Aadhaar Number is required'),

        Pan: Yup.string()
            .max(10, 'PAN must be of 10 characters')
            .required('Pan Number is required'),
        dateOfBirth: Yup.date()
            .required('Date of Birth is required!')
            .max(new Date(), 'Date of Birth cannot be in the future!')
            .test('dob', 'You must be between 18 to 80 years old!', function (value) {
                const today = new Date();
                const minDate = new Date(today.getFullYear() - 80, today.getMonth(), today.getDate());
                const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                return value <= maxDate && value >= minDate;
            }),
        age: Yup.number()
            .required('Age is required!')
            .min(18, 'You must be at least 18 years old!')
            .max(80, 'You must be under 80 years old!'),
        gender: Yup.string().required('Gender is required'),
        maritalStatus: Yup.string().required('Marital Status is required'),
        tobacco: Yup.string().required('Tobacco consumption status is required'),
        occupation: Yup.string().required('Occupation is required'),
        occupationClass: Yup.string().required('Occupation Class is required'),
        EducationalQualification: Yup.string().required('Educational Qualification is required'),
        OtherSourceOfIncome: Yup.string()
            .required("Other Source of Income required")
            .matches(/^[a-zA-Z]+$/, "Other Source of Income must contain only letters without spaces or special characters"),
        annualIncome: Yup.string()
            .matches(/^[0-9\,]+$/, 'Annual Income must be a number with optional commas')
            .max(15, 'Annual Income cannot be longer than 15 characters')
            .required('Annual Income is required'),
    });

    const ChildSchema = Yup.array().of(
        Yup.object().shape({
            title: Yup.string().required('Title is required'),
            firstName: Yup.string()
                .max(36, 'firstName cannot be longer than 36 characters')
                .matches(/^([a-zA-Z]+\s)*([a-zA-Z]+)$/, 'firstName must only contain letters')
                .required('First Name is required'),
            lastName: Yup.string()
                .max(36, 'Last Name cannot be longer than 36 characters')
                .matches(/^([a-zA-Z]+\s)*([a-zA-Z]+)$/, 'Last Name must only contain letters')
                .required('Last Name is required'),
            dateOfBirth: Yup.date()
                .required('Date of Birth is required!')
                .max(new Date(), 'Date of Birth cannot be in the future!')
                .test('dob', 'Age must be between 6 months to 17 years, 5 months and 29 days', function (value) {
                    const today = new Date();
                    const maxDate = new Date(today.getFullYear() - 0.5, today.getMonth(), today.getDate()); // 6 months
                    const minDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate()); // 17 years
                    return value <= maxDate && value >= minDate;
                }),
            age: Yup.number()
                .required('Age is required!')
                .min(1, 'You must be at least 6 months old!')
                .max(17, 'You must be under 17 years old!'),
            gender: Yup.string().required('Gender is required'),
        })
    );

    const validationSchema = Yup.object().shape({
        lifeA: lifeASchema,
        ...(applicationType === 'Joint Life' && { lifeB: lifeBSchema }),
        ...(kidsanswer === 'yes' && { Child: ChildSchema })
    });

    // const validationSchema = Yup.object({
    //     lifeA: lifeASchema, // Always validate Life A
    //     Child: ChildSchema, // Ensure ChildSchema is correctly defined (optional)

    //     // Conditionally validate lifeB based on the applicationType
    //     lifeB: Yup.object().when('applicationType', {
    //         is: 'Joint Life', // If applicationType is 'Joint Life'
    //         then: lifeBSchema, // Apply validation for lifeB
    //         otherwise: Yup.object().notRequired() // Skip validation for lifeB if not 'Joint Life'
    //     }),
    // });


    const formik = useFormik({
        initialValues: {
            lifeA: {
                title: '',
                firstName: '',
                lastName: '',
                Aadhaar: '',
                Pan: '',
                dateOfBirth: '',
                age: '',
                gender: '',
                maritalStatus: '',
                alcohol: '',
                tobacco: '',
                occupation: '',
                occupationClass: '',
                annualIncome: '',
                kids: '',
                EducationalQualification: '',
                OtherSourceOfIncome: ''
            },
            lifeB: {
                title: '',
                firstName: '',
                lastName: '',
                Aadhaar: '',
                Pan: '',
                dateOfBirth: '',
                age: '',
                gender: '',
                maritalStatus: '',
                alcohol: '',
                tobacco: '',
                occupation: '',
                occupationClass: '',
                annualIncome: '',
                EducationalQualification: '',
                OtherSourceOfIncome: ''

            },
            Child: [{
                title: '',
                firstName: '',
                lastName: '',
                dateOfBirth: '',
                age: '',
                gender: ''
            }]
        },
        validateOnChange: true,
        validateOnBlur: true,
        validationSchema: validationSchema,
        validateOnSubmit: true,
        onSubmit: async (values) => {
            // let personID = `PR${Date.now()}`;
            // sessionStorage.setItem('personId', personID);
            //console.log("personId", personID);
            console.log('Submitting form values:', values);
            console.log('Formik errors:', formik.errors);

            const creationDateTime = formatDateTime(new Date());
            sessionStorage.setItem('creationDateTime', creationDateTime);

            let personData = {};
            const storeName = "al_person_details";

            if (!erreferenceIdthroughProposalSummary) {
                if (applicationType === 'Single Life') {
                    personaldata.primaryInsured = {
                        person: {
                            creationDateTime: creationDateTime || personaldata.result.primaryInsured.person.creationDateTime,
                            person_id: personID,
                            client_id: values.lifeA.clientID || personaldata.result.primaryInsured.person.client_id || "",
                            dateOfBirth: values.lifeA.dateOfBirth || personaldata.result.primaryInsured.person.dateOfBirth || "",
                            Aadhaar: values.lifeA.Aadhaar || personaldata.result.primaryInsured.person.Aadhaar || "",
                            Pan: values.lifeA.Pan || personaldata.result.primaryInsured.person.Pan || "",
                            gender: values.lifeA.gender || personaldata.result.primaryInsured.person.gender || "",
                            height: values.lifeA.height || personaldata.result.primaryInsured.person.height || "",
                            weight: values.lifeA.weight || personaldata.result.primaryInsured.person.weight || "",
                            age: values.lifeA.age || personaldata.result.primaryInsured.person.age || "",
                            maritalStatus: values.lifeA.maritalStatus || personaldata.result.primaryInsured.person.maritalStatus || "",
                            annualIncome: values.lifeA.annualIncome || personaldata.result.primaryInsured.person.annualIncome || "",
                            kids: values.lifeA.kids || personaldata.result.primaryInsured.person.kids || "",
                            occupation: values.lifeA.occupation || personaldata.result.primaryInsured.person.occupation || "",
                            occupationClass: values.lifeA.occupationClass || personaldata.result.primaryInsured.person.occupationClass || "",
                            alcohol: values.lifeA.alcohol || personaldata.result.primaryInsured.person.alcohol || "",
                            tobacco: values.lifeA.tobacco || personaldata.result.primaryInsured.person.tobacco || "",
                            name: {
                                first: values.lifeA.firstName || personaldata.result.primaryInsured.person.name.first || "",
                                last: values.lifeA.lastName || personaldata.result.primaryInsured.person.name.last || "",
                                title: values.lifeA.title || personaldata.result.primaryInsured.person.name.title || ""
                            },
                            EducationalQualification: values.lifeA.EducationalQualification || " ",
                            OtherSourceOfIncome: values.lifeA.OtherSourceOfIncome || " ",
                        },
                        person_id: personID
                    };
                } else if (applicationType === 'Joint Life') {
                    personaldata.primaryInsured = {
                        person: {
                            creationDateTime: creationDateTime || personaldata.result.primaryInsured.person.creationDateTime,
                            person_id: personID,
                            client_id: values.lifeA.clientID || personaldata.result.primaryInsured.person.client_id || "",
                            dateOfBirth: values.lifeA.dateOfBirth || personaldata.result.primaryInsured.person.dateOfBirth || "",
                            Aadhaar: values.lifeA.Aadhaar || personaldata.result.primaryInsured.person.Aadhaar || "",
                            Pan: values.lifeA.Pan || personaldata.result.primaryInsured.person.Pan || "",
                            gender: values.lifeA.gender || personaldata.result.primaryInsured.person.gender || "",
                            height: values.lifeA.height || personaldata.result.primaryInsured.person.height || "",
                            weight: values.lifeA.weight || personaldata.result.primaryInsured.person.weight || "",
                            age: values.lifeA.age || personaldata.result.primaryInsured.person.age || "",
                            maritalStatus: values.lifeA.maritalStatus || personaldata.result.primaryInsured.person.maritalStatus || "",
                            annualIncome: values.lifeA.annualIncome || personaldata.result.primaryInsured.person.annualIncome || "",
                            kids: values.lifeA.kids || personaldata.result.primaryInsured.person.kids || "",
                            occupation: values.lifeA.occupation || personaldata.result.primaryInsured.person.occupation || "",
                            occupationClass: values.lifeA.occupationClass || personaldata.result.primaryInsured.person.occupationClass || "",
                            alcohol: values.lifeA.alcohol || personaldata.result.primaryInsured.person.alcohol || "",
                            tobacco: values.lifeA.tobacco || personaldata.result.primaryInsured.person.tobacco || "",
                            name: {
                                first: values.lifeA.firstName || personaldata.result.primaryInsured.person.name.first || "",
                                last: values.lifeA.lastName || personaldata.result.primaryInsured.person.name.last || "",
                                title: values.lifeA.title || personaldata.result.primaryInsured.person.name.title || ""
                            },
                            EducationalQualification: values.lifeA.EducationalQualification || " ",
                            OtherSourceOfIncome: values.lifeA.OtherSourceOfIncome || " ",
                        },
                        person_id: personID
                    };

                    personaldata.secondaryInsured = {
                        person: {
                            creationDateTime: creationDateTime || personaldata.result.secondaryInsured.person.creationDateTime,
                            person_id: values.lifeB.personID || `PR${Date.now()}`, // Generate a new ID if not available
                            client_id: values.lifeB.clientID || personaldata.result.secondaryInsured.person.client_id || "",
                            dateOfBirth: values.lifeB.dateOfBirth || personaldata.result.secondaryInsured.person.dateOfBirth || "",
                            Aadhaar: values.lifeB.Aadhaar || personaldata.result.secondaryInsured.person.Aadhaar || "",
                            Pan: values.lifeB.Pan || personaldata.result.secondaryInsured.person.Pan || "",
                            gender: values.lifeB.gender || personaldata.result.secondaryInsured.person.gender || "",
                            height: values.lifeB.height || personaldata.result.secondaryInsured.person.height || "",
                            weight: values.lifeB.weight || personaldata.result.secondaryInsured.person.weight || "",
                            age: values.lifeB.age || personaldata.result.secondaryInsured.person.age || "",
                            maritalStatus: values.lifeB.maritalStatus || personaldata.result.secondaryInsured.person.maritalStatus || "",
                            annualIncome: values.lifeB.annualIncome || personaldata.result.secondaryInsured.person.annualIncome || "",
                            occupation: values.lifeB.occupation || personaldata.result.secondaryInsured.person.occupation || "",
                            occupationClass: values.lifeB.occupationClass || personaldata.result.secondaryInsured.person.occupationClass || "",
                            alcohol: values.lifeB.alcohol || personaldata.result.secondaryInsured.person.alcohol || "",
                            tobacco: values.lifeB.tobacco || personaldata.result.secondaryInsured.person.tobacco || "",
                            EducationalQualification: values.lifeB.EducationalQualification || " ",
                            OtherSourceOfIncome: values.lifeB.OtherSourceOfIncome || " ",
                            name: {
                                first: values.lifeB.firstName || personaldata.result.secondaryInsured.person.name.first || "",
                                last: values.lifeB.lastName || personaldata.result.secondaryInsured.person.name.last || "",
                                title: values.lifeB.title || personaldata.result.secondaryInsured.person.name.title || ""
                            }
                        },
                        person_id: personID
                    };
                }


                // if (applicationType === 'Single Life') {
                //     personData = {
                //         mlife: {
                //             creationDateTime,
                //             person_id: personID,
                //             client_id: values.lifeA.clientID || "",
                //             dateOfBirth: values.lifeA.dateOfBirth || "",
                //             Aadhaar: values.lifeA.Aadhaar || "",
                //             Pan: values.lifeA.Pan || "",
                //             gender: values.lifeA.gender || "",
                //             height: values.lifeA.height || "",
                //             weight: values.lifeA.weight || "",
                //             age: values.lifeA.age || "",
                //             maritalStatus: values.lifeA.maritalStatus || "",
                //             annualIncome: values.lifeA.annualIncome || "",
                //             kids: values.lifeA.kids || "",
                //             occupation: values.lifeA.occupation || "",
                //             occupationClass: values.lifeA.occupationClass || "",
                //             alcohol: values.lifeA.alcohol || "",
                //             tobacco: values.lifeA.tobacco || "",
                //             EducationalQualification: values.lifeA.EducationalQualification || " ",
                //             OtherSourceOfIncome: values.lifeA.OtherSourceOfIncome || " ",
                //             name: {
                //                 first: values.lifeA.firstName || "",
                //                 last: values.lifeA.lastName || "",
                //                 title: values.lifeA.title || ""
                //             }
                //         }
                //     };
                // }

                console.log(`Submitting data for ${applicationType} in ${storeName}:`, personaldata);

                try {
                    await updateDetailById(storeName, personID, personaldata);
                    console.log(`Data saved under personID: ${personID}`, personaldata);
                } catch (error) {
                    console.error(`Failed to save data for ${applicationType}:`, error);
                }

                console.log("backendData:", personaldata);

            }
            navigate_to_addressdetails()
        }


    });

    const handleCombinedSubmit = async () => {
        try {
            await formik.submitForm();
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    // const handleAccordionClick = (item) => {
    //     if (openItem.includes(item)) {
    //         setOpenItem(openItem.filter(i => i !== item));
    //     } else {
    //         setOpenItem([...openItem, item]);
    //     }
    // }



    // Child Accordian Handling

    const handleAccordionClick = (item) => {
        setOpenItem((prevOpenItems) => {
            // Safety check to ensure openItems is always an array
            const updatedItems = Array.isArray(prevOpenItems) ? [...prevOpenItems] : [];

            if (updatedItems.includes(item)) {
                // If the item is already open, close it
                return updatedItems.filter((openItem) => openItem !== item);
            } else {
                // Otherwise, open the item
                return [...updatedItems, item];
            }
        });
    };

    const handleKidsInclusionChange = (event) => {
        const includeKids = event.target.value === 'yes';
        setEnableChildAccordion(includeKids); // Enable if "Yes" is selected

        // Automatically open the Child accordion if Yes is selected
        if (!includeKids) {
            formik.setFieldValue('Child', []);  // Clear all child fields
        }
        // if (includeKids) {
        //     setOpenItem((prevItems) => [...prevItems, 'Child']);
        // } else {
        //     // Close the child accordion if "No" is selected
        //     setOpenItem((prevItems) => prevItems.filter(item => item !== 'Child'));
        // }
    };

    // Function to add a new child
    const addNewChild = () => {
        if (formik.values.Child.length < 5) {  // Allow up to 5 children
            formik.setValues(prevValues => ({
                ...prevValues,
                Child: [...prevValues.Child, {
                    title: '',
                    firstName: '',
                    lastName: '',
                    Aadhaar: '',
                    dateOfBirth: '',
                    age: '',
                    gender: ''
                }]
            }));
        }
    };

    // Function to remove a child by index
    const removeChild = (index) => {
        formik.setValues(prevValues => ({
            ...prevValues,
            Child: prevValues.Child.filter((_, i) => i !== index)
        }));
    };

    const handleDateOfBirthChange = (e, formName) => {
        const dob = e.target.value;
        const age = calculateAge(dob);

        // Set the specific field for the corresponding form
        formik.setFieldValue(`${formName}.dateOfBirth`, dob);
        formik.setFieldValue(`${formName}.age`, age);

        // Validate age limits and set errors immediately
        if (age > 80) {
            formik.setFieldError(`${formName}.age`, 'Age cannot be more than 80 years old');
        } else if (age < 18) {
            formik.setFieldError(`${formName}.age`, 'Age must be at least 18 years old');
        } else {
            // Clear errors if the age is valid
            formik.setFieldError(`${formName}.age`, '');
        }

        // Trigger form validation immediately
        formik.validateField(`${formName}.dateOfBirth`);
    };

    const handleBack = () => {
        navigate('/agentdetails');
    };

    //const person_id = sessionStorage.getItem("personId")

    useEffect(() => {
        const fetchpersonaldata = async () => {
            try {
                const data = await findRecordById("al_person_details", personID);
                console.log("Prathamesh in eapp_personaldetails::", data);
                setpersonaldata(data)


                if (erreferenceIdthroughProposalSummary) {
                    //setcommingfromproposalsummary(true)
                    try {
                        const applicationdata = await findRecordById("al_application_main", erreferenceIdthroughProposalSummary);
                        console.log("Application data when coming from ProposalSummary:::", applicationdata)

                        formik.setFieldValue('lifeA.title', applicationdata.result.product.primaryInsured.person.name.title || '')
                        formik.setFieldValue('lifeA.firstName', applicationdata.result.product.primaryInsured.person.name.first || '');
                        formik.setFieldValue('lifeA.lastName', applicationdata.result.product.primaryInsured.person.name.last || '');
                        formik.setFieldValue('lifeA.dateOfBirth', applicationdata.result.product.primaryInsured.person.dateOfBirth || '');
                        formik.setFieldValue('lifeA.age', applicationdata.result.product.primaryInsured.person.anb || '');
                        formik.setFieldValue('lifeA.height', applicationdata.result.product.primaryInsured.person.height.feet || '');
                        formik.setFieldValue('lifeA.weight', applicationdata.result.product.primaryInsured.person.weight || '');
                        formik.setFieldValue('lifeA.gender', applicationdata.result.product.primaryInsured.person.gender || '');
                        formik.setFieldValue('lifeA.maritalStatus', applicationdata.result.product.primaryInsured.person.maritalStatus || '');
                        formik.setFieldValue('lifeA.tobacco', applicationdata.result.product.primaryInsured.person.tobacco || '');
                        formik.setFieldValue('lifeA.alcohol', applicationdata.result.product.primaryInsured.person.alcohol || '');
                        formik.setFieldValue('lifeA.occupation', applicationdata.result.product.primaryInsured.person.occupationSummary.occupation || '');
                        formik.setFieldValue('lifeA.occupationClass', applicationdata.result.product.primaryInsured.person.occupationSummary.natureOfBusiness || '');
                        formik.setFieldValue('lifeA.Aadhaar', applicationdata.result.product.primaryInsured.person.verificationDetails.passportNumber || '');
                        formik.setFieldValue('lifeA.kids', applicationdata.result.product.primaryInsured.person.Kids || '');
                        formik.setFieldValue('lifeA.annualIncome', applicationdata.result.product.primaryInsured.person.occupationSummary.annualIncome || '');
                        formik.setFieldValue('lifeA.Pan', applicationdata.result.product.primaryInsured.person.verificationDetails.marriageCertificate || '')
                        formik.setFieldValue('lifeA.EducationalQualification', applicationdata.result.product.primaryInsured.person.educationQualification || '');
                        formik.setFieldValue('lifeA.OtherSourceOfIncome', applicationdata.result.product.primaryInsured.person.occupationSummary.otherSourceOfIncome || '')

                        if(applicationdata.result.product.primaryInsured.person.Kids === 'yes'){
                            setEnableChildAccordion(true);
                        } else {
                            setEnableChildAccordion(false);
                        }  

                        if (data.result.Child) {
                            data.result.Child.forEach((child, index) => {
                                formik.setFieldValue(`Child[${index}].title`, child.name.title || '');
                                formik.setFieldValue(`Child[${index}].firstName`, child.name.first || '');
                                formik.setFieldValue(`Child[${index}].lastName`, child.name.last || '');
                                formik.setFieldValue(`Child[${index}].dateOfBirth`, child.dateOfBirth || '');
                                formik.setFieldValue(`Child[${index}].age`, child.age || '');
                                formik.setFieldValue(`Child[${index}].gender`, child.gender || '');
                                formik.setFieldValue(`Child[${index}].Aadhaar`, child.Aadhaar || '');
                            });
                        }
                        


                        if (applicationdata.result.product.secondaryInsured) {
                            formik.setFieldValue('lifeB.title', applicationdata.result.product.secondaryInsured.person.name.title || '');
                            formik.setFieldValue('lifeB.firstName', applicationdata.result.product.secondaryInsured.person.name.first || '');
                            formik.setFieldValue('lifeB.lastName', applicationdata.result.product.secondaryInsured.person.name.last || '');
                            formik.setFieldValue('lifeB.dateOfBirth', applicationdata.result.product.secondaryInsured.person.dateOfBirth || '')
                            formik.setFieldValue('lifeB.age', applicationdata.result.product.secondaryInsured.person.anb || '');
                            formik.setFieldValue('lifeB.height', applicationdata.result.product.secondaryInsured.person.height.feet || '');
                            formik.setFieldValue('lifeB.weight', applicationdata.result.product.secondaryInsured.person.weight || '');
                            formik.setFieldValue('lifeB.gender', applicationdata.result.product.secondaryInsured.person.gender || '');
                            formik.setFieldValue('lifeB.maritalStatus', applicationdata.result.product.secondaryInsured.person.maritalStatus || '');
                            formik.setFieldValue('lifeB.tobacco', applicationdata.result.product.secondaryInsured.person.tobacco || '');
                            formik.setFieldValue('lifeB.alcohol', applicationdata.result.product.secondaryInsured.person.alcohol || '');
                            formik.setFieldValue('lifeB.occupation', applicationdata.result.product.secondaryInsured.person.occupationSummary.occupation || '');
                            formik.setFieldValue('lifeB.occupationClass', applicationdata.result.product.secondaryInsured.person.occupationSummary.natureOfBusiness || '');
                            formik.setFieldValue('lifeB.Aadhaar', applicationdata.result.product.secondaryInsured.person.verificationDetails.passportNumber || '');
                            //formik.setFieldValue('lifeA.kids', applicationdata.result.product.primaryInsured.person.Kids || '');
                            formik.setFieldValue('lifeB.annualIncome', applicationdata.result.product.secondaryInsured.person.occupationSummary.annualIncome || '');
                            formik.setFieldValue('lifeB.Pan', applicationdata.result.product.secondaryInsured.person.verificationDetails.marriageCertificate || '')
                            formik.setFieldValue('lifeB.EducationalQualification', applicationdata.result.product.secondaryInsured.person.educationQualification || '');
                            formik.setFieldValue('lifeB.OtherSourceOfIncome', applicationdata.result.product.secondaryInsured.person.occupationSummary.otherSourceOfIncome || '')

                        }
                    } catch (e) {
                        console.log("Error while getting data", e)
                    }
                } else {
                    console.log("Not coming through Proposal Summary")
                   
                    //formik.setFieldValue('ApplicationType', data.result.applicationType || '')
                    // Update lifeA fields
                    formik.setFieldValue('lifeA.title', data.result.primaryInsured.person.name.title || '');
                    formik.setFieldValue('lifeA.firstName', data.result.primaryInsured.person.name.first || '');
                    formik.setFieldValue('lifeA.lastName', data.result.primaryInsured.person.name.last || '');
                    formik.setFieldValue('lifeA.dateOfBirth', data.result.primaryInsured.person.dateOfBirth || '');
                    formik.setFieldValue('lifeA.age', data.result.primaryInsured.person.age || '');
                    formik.setFieldValue('lifeA.height', data.result.primaryInsured.person.height || '');
                    formik.setFieldValue('lifeA.weight', data.result.primaryInsured.person.weight || '');
                    formik.setFieldValue('lifeA.gender', data.result.primaryInsured.person.gender || '');
                    formik.setFieldValue('lifeA.maritalStatus', data.result.primaryInsured.person.maritalStatus || '');
                    formik.setFieldValue('lifeA.tobacco', data.result.primaryInsured.person.tobacco || '');
                    formik.setFieldValue('lifeA.alcohol', data.result.primaryInsured.person.alcohol || '');
                    formik.setFieldValue('lifeA.occupation', data.result.primaryInsured.person.occupation || '');
                    formik.setFieldValue('lifeA.occupationClass', data.result.primaryInsured.person.occupationClass || '');
                    formik.setFieldValue('lifeA.Aadhaar', data.result.primaryInsured.person.Aadhaar || '');
                    formik.setFieldValue('lifeA.kids', data.result.primaryInsured.person.kids || '');
                    setkidsanswer(data.result.primaryInsured.person.kids)
                    formik.setFieldValue('lifeA.annualIncome', data.result.primaryInsured.person.annualIncome || '');
                    formik.setFieldValue('lifeA.Pan', data.result.primaryInsured.person.Pan || '');
                    if (data.result.primaryInsured.person.EducationalQualification && data.result.primaryInsured.person.OtherSourceOfIncome) {
                        formik.setFieldValue('lifeA.EducationalQualification', data.result.primaryInsured.person.EducationalQualification || '')
                        formik.setFieldValue('lifeA.OtherSourceOfIncome', data.result.primaryInsured.person.OtherSourceOfIncome || '')
                        //setFieldsDisabled(true)
                    }

                    // if (data.result.mlife) {
                    //     
                    //     
                    // }

                    //values.lifeA.EducationalQualification

                    // Update lifeB fields (if exists for Joint Life)
                    if (data.result.secondaryInsured) {
                        formik.setFieldValue('lifeB.title', data.result.secondaryInsured.person.name.title || '');
                        formik.setFieldValue('lifeB.firstName', data.result.secondaryInsured.person.name.first || '');
                        formik.setFieldValue('lifeB.lastName', data.result.secondaryInsured.person.name.last || '');
                        formik.setFieldValue('lifeB.dateOfBirth', data.result.secondaryInsured.person.dateOfBirth || '');
                        formik.setFieldValue('lifeB.age', data.result.secondaryInsured.person.age || '');
                        formik.setFieldValue('lifeB.height', data.result.secondaryInsured.person.height || '');
                        formik.setFieldValue('lifeB.weight', data.result.secondaryInsured.person.weight || '');
                        formik.setFieldValue('lifeB.gender', data.result.secondaryInsured.person.gender || '');
                        formik.setFieldValue('lifeB.maritalStatus', data.result.secondaryInsured.person.maritalStatus || '');
                        formik.setFieldValue('lifeB.tobacco', data.result.secondaryInsured.person.tobacco || '');
                        formik.setFieldValue('lifeB.alcohol', data.result.secondaryInsured.person.alcohol || '');
                        formik.setFieldValue('lifeB.occupation', data.result.secondaryInsured.person.occupation || '');
                        formik.setFieldValue('lifeB.occupationClass', data.result.secondaryInsured.person.occupationClass || '');
                        formik.setFieldValue('lifeB.Aadhaar', data.result.secondaryInsured.person.Aadhaar || '');
                        formik.setFieldValue('lifeB.Pan', data.result.secondaryInsured.person.Pan || '');
                        formik.setFieldValue('lifeB.annualIncome', data.result.secondaryInsured.person.annualIncome || '');

                        if (data.result.secondaryInsured.person.OtherSourceOfIncome && data.result.secondaryInsured.person.EducationalQualification) {
                            formik.setFieldValue('lifeB.EducationalQualification', data.result.secondaryInsured.person.EducationalQualification || '');
                            formik.setFieldValue('lifeB.OtherSourceOfIncome', data.result.secondaryInsured.person.OtherSourceOfIncome || '');
                            //setFieldsDisabled(true)

                        }


                    }

                    if (data.result.primaryInsured.person.kids === 'yes') {
                        setEnableChildAccordion(true);
                    } else {
                        setEnableChildAccordion(false);
                    }

                    if (data.result.Child) {
                        data.result.Child.forEach((child, index) => {
                            formik.setFieldValue(`Child[${index}].title`, child.name.title || '');
                            formik.setFieldValue(`Child[${index}].firstName`, child.name.first || '');
                            formik.setFieldValue(`Child[${index}].lastName`, child.name.last || '');
                            formik.setFieldValue(`Child[${index}].dateOfBirth`, child.dateOfBirth || '');
                            formik.setFieldValue(`Child[${index}].age`, child.age || '');
                            formik.setFieldValue(`Child[${index}].gender`, child.gender || '');
                            formik.setFieldValue(`Child[${index}].Aadhaar`, child.Aadhaar || '');
                        });
                    }

                }






            } catch (err) {
                console.log("Error while fetching:", err);
            }
        };

        fetchpersonaldata();
    }, []);

    useEffect(() => {
        const applicationTypeforaccordian = sessionStorage.getItem("applicationType")

        // Set applicationType in Formik and control accordions based on the value
        if (applicationTypeforaccordian) {
            formik.setFieldValue('ApplicationType', applicationTypeforaccordian); // Set in Formik state
            setApplicationType(applicationTypeforaccordian); // Set in local state

            console.log("Application type:::")

            // Control accordion based on the application type
            if (applicationTypeforaccordian === 'Single Life') {
                setOpenItem(['lifeA']); // Open Life A accordion only
            } else if (applicationTypeforaccordian === 'Joint Life' || applicationTypeforaccordian === 'lifeofanother') {
                setOpenItem(['lifeA', 'lifeB']); // Open both Life A and Life B
            } else {
                setOpenItem([]); // Close all sections if no valid application type is selected
            }
        }
    }, []);

    const handleApplicationTypeChange = (event) => {
        const selectedType = event.target.value
        setApplicationType(selectedType);

        // Open the appropriate accordions based on the application type
        if (selectedType === 'Single Life') {
            setOpenItem(['lifeA']);
        } else if (selectedType === 'Joint Life' || selectedType === 'lifeofAnother') {
            setOpenItem([]);
        } else {
            setOpenItem([]); // Close all sections if no valid application type is selected
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
            <div className="personal-detail-container">
                {/* <div className="personal-navbar bg-white mb-4 p-3 shadow-sm">
                    <div className="backArrow pt-2" onClick={handleBack}>
                        <FontAwesomeIcon icon={faArrowLeft} className="backPointer red-text" />
                        <span className="ms-2 red-text ml-2">Personal Details</span>
                    </div>
                    <div className="border-bottom mt-2"></div>
                </div> */}

                <div className='personalForm'>
                    <div className="col-md-6 lifedropdown mb-4">
                        <label >Proposal Type<span className="text-danger">*</span></label>
                        <select
                            id="ApplicationType"
                            name="ApplicationType"
                            className="form-control"
                            value={applicationType}
                            disabled // Set value from Formik
                            //onChange={handleApplicationTypeChange} // Formik's onChange handler
                            onBlur={formik.handleBlur} // Formik's onBlur for validation
                        >
                            <option value="">Select</option>
                            <option value="Single Life">Single Life</option>
                            <option value="Joint Life">Joint Life</option>
                            <option value="lifeofanother">Life of Another</option>
                        </select>
                        {formik.touched.ApplicationType && formik.errors.ApplicationType ? (
                            <div className="error">{formik.errors.ApplicationType}</div>
                        ) : null}
                    </div>
                    <div className="accordion">
                        <AccordionItem title="Life A: Proposed Insured Details"
                            isOpen={Array.isArray(openItem) && openItem.includes('lifeA')}
                            onClick={() => handleAccordionClick('lifeA')}
                            disabled={applicationType === ''}
                        >
                            <form onSubmit={formik.handleSubmit} className="eappform">
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeA.title">Title<span className="text-danger">*</span></label>
                                        <select
                                            id="lifeA.title"
                                            name="lifeA.title"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.title}
                                            disabled
                                        >
                                            <option value="">Select</option>
                                            <option value="mr">Mr.</option>
                                            <option value="mrs">Mrs.</option>
                                            <option value="miss">Miss</option>
                                            <option value="ms">Ms.</option>
                                            <option value="drmiss">Dr.Miss</option>
                                            <option value="dr">Dr.</option>
                                            <option value="drmrs">Dr.Mrs</option>
                                        </select>
                                        {formik.touched.lifeA?.title && formik.errors.lifeA?.title ? (
                                            <div className="text-danger">{formik.errors.lifeA.title}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeA.firstName">First Name<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeA.firstName"
                                            name="lifeA.firstName"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.firstName}
                                            readOnly
                                        />
                                        {formik.touched.lifeA?.firstName && formik.errors.lifeA?.firstName ? (
                                            <div className="text-danger">{formik.errors.lifeA.firstName}</div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeA.lastName">Last Name<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeA.lastName"
                                            name="lifeA.lastName"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.lastName}
                                            readOnly
                                        />
                                        {formik.touched.lifeA?.lastName && formik.errors.lifeA?.lastName ? (
                                            <div className="text-danger">{formik.errors.lifeA.lastName}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeA.Aadhaar">Aadhar Number<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeA.Aadhaar"
                                            name="lifeA.Aadhaar"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.Aadhaar}
                                            maxLength="15"
                                            readOnly
                                        />
                                        {formik.touched.lifeA?.Aadhaar && formik.errors.lifeA?.Aadhaar ? (
                                            <div className="text-danger">{formik.errors.lifeA.Aadhaar}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeA.Pan">Pan Number<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeA.Pan"
                                            name="lifeA.Pan"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.Pan}
                                            maxLength="11"
                                            readOnly
                                        />
                                        {formik.touched.lifeA?.Pan && formik.errors.lifeA?.Pan ? (
                                            <div className="text-danger">{formik.errors.lifeA.Pan}</div>
                                        ) : null}
                                    </div>

                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeA.dateOfBirth">Date of Birth<span className="text-danger">*</span></label>
                                        <input
                                            type="date"
                                            id="lifeA.dateOfBirth"
                                            name="lifeA.dateOfBirth"
                                            className="form-control"
                                            onChange={(e) => handleDateOfBirthChange(e, 'lifeA')}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.dateOfBirth}
                                            readOnly
                                        />
                                        {formik.touched.lifeA?.dateOfBirth && formik.errors.lifeA?.dateOfBirth ? (
                                            <div className="text-danger">{formik.errors.lifeA.dateOfBirth}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeA.age">Age<span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            id="lifeA.age"
                                            name="lifeA.age"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.age}
                                            readOnly
                                        />
                                        {formik.touched.lifeA?.age && formik.errors.lifeA?.age ? (
                                            <div className="text-danger">{formik.errors.lifeA.age}</div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeA.height">Height(CM)</label>
                                        <input
                                            type="number"
                                            id="lifeA.height"
                                            name="lifeA.height"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            value={formik.values.lifeA.height}
                                            readOnly
                                        />
                                        {formik.errors.lifeA?.height && formik.touched.lifeA?.height ? (
                                            <div className="text-danger">{formik.errors.lifeA.height}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeA.weight">Weight(KG)</label>
                                        <input
                                            type="number"
                                            id="lifeA.weight"
                                            name="lifeA.weight"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            value={formik.values.lifeA.weight}
                                            readOnly
                                        />
                                        {formik.errors.lifeA?.weight && formik.touched.lifeA?.weight ? (
                                            <div className="text-danger">{formik.errors.lifeA.weight}</div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeA.maritalStatus">Marital Status<span className="text-danger">*</span></label>
                                        <select
                                            id="lifeA.maritalStatus"
                                            name="lifeA.maritalStatus"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.maritalStatus}
                                            disabled
                                        >
                                            <option value="">Select</option>
                                            <option value="single">Single</option>
                                            <option value="married">Married</option>
                                            <option value="divorced">Divorced</option>
                                            <option value="widowed">Widowed</option>
                                        </select>
                                        {formik.touched.lifeA?.maritalStatus && formik.errors.lifeA?.maritalStatus ? (
                                            <div className="text-danger">{formik.errors.lifeA.maritalStatus}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label>Gender<span className="text-danger">*</span></label>
                                        <div className="d-flex justify-content-between">
                                            <div className="form-check">
                                                <input
                                                    type="radio"
                                                    id="lifeA.male"
                                                    name="lifeA.gender"
                                                    value="male"
                                                    className="form-check-input"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    checked={formik.values.lifeA.gender === 'male'}
                                                    disabled
                                                />
                                                <label htmlFor="lifeA.male" className="form-check-label">Male</label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    type="radio"
                                                    id="lifeA.female"
                                                    name="lifeA.gender"
                                                    value="female"
                                                    className="form-check-input"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    checked={formik.values.lifeA.gender === 'female'}
                                                    disabled
                                                />
                                                <label htmlFor="lifeA.female" className="form-check-label">Female</label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    type="radio"
                                                    id="lifeA.other"
                                                    name="lifeA.gender"
                                                    value="other"
                                                    className="form-check-input"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    checked={formik.values.lifeA.gender === 'other'}
                                                    disabled
                                                />
                                                <label htmlFor="lifeA.other" className="form-check-label">Other</label>
                                            </div>
                                        </div>
                                        {formik.touched.lifeA?.gender && formik.errors.lifeA?.gender ? (
                                            <div className="text-danger">{formik.errors.lifeA.gender}</div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeA.alcohol">Do you consume alcohol?</label>
                                        <div className='d-flex'>
                                            <div className="form-check">
                                                <input type="radio" id="lifeA.alcohol-yes" name="lifeA.alcohol" value="yes" className="form-check-input" onChange={formik.handleChange} checked={formik.values.lifeA.alcohol === 'yes'} disabled />
                                                <label htmlFor="lifeA.alcohol-yes" className="form-check-label">Yes</label>
                                            </div>
                                            <div className="form-check">
                                                <input type="radio" id="lifeA.alcohol-no" name="lifeA.alcohol" value="no" className="form-check-input" onChange={formik.handleChange} checked={formik.values.lifeA.alcohol === 'no'} disabled />
                                                <label htmlFor="lifeA.alcohol-no" className="form-check-label">No</label>
                                            </div>
                                        </div>
                                        {formik.errors.lifeA?.alcohol && formik.touched.lifeA?.alcohol ? (
                                            <div className="text-danger">{formik.errors.lifeA.alcohol}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeA.tobacco">Do you consume tobacco?<span className="text-danger">*</span></label>
                                        <div className="d-flex">
                                            <div className="form-check">
                                                <input
                                                    type="radio"
                                                    id="lifeA.tobacco-yes"
                                                    name="lifeA.tobacco"
                                                    value="yes"
                                                    className="form-check-input"
                                                    onChange={formik.handleChange}
                                                    checked={formik.values.lifeA.tobacco === 'yes'}
                                                    disabled
                                                />
                                                <label htmlFor="lifeA.tobacco-yes" className="form-check-label">Yes</label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    type="radio"
                                                    id="lifeA.tobacco-no"
                                                    name="lifeA.tobacco"
                                                    value="no"
                                                    className="form-check-input"
                                                    onChange={formik.handleChange}
                                                    checked={formik.values.lifeA.tobacco === 'no'}
                                                    disabled
                                                />
                                                <label htmlFor="lifeA.tobacco-no" className="form-check-label">No</label>
                                            </div>
                                        </div>
                                        {formik.touched.lifeA?.tobacco && formik.errors.lifeA?.tobacco ? (
                                            <div className="text-danger">{formik.errors.lifeA.tobacco}</div>
                                        ) : null}
                                    </div>
                                </div>

                                <h4>Occupation Details</h4>
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeA.occupation">Occupation<span className="text-danger">*</span></label>
                                        <select
                                            id="lifeA.occupation"
                                            name="lifeA.occupation"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.occupation}
                                            disabled
                                        >
                                            <option value="">Select</option>
                                            <option value="Homemaker-2">Homemaker-2</option>
                                            <option value="Retiree-2">Retiree-2</option>
                                            <option value="pensioner-2">Pensioner-2</option>
                                            <option value="Student-2">Student-2</option>
                                            <option value="Child-2">Child-2</option>
                                            <option value="Unemployed">Unemployed</option>
                                            <option value="Business Owner-1">Business Owner-1</option>
                                            <option value="Housewife-3">Housewife-3</option>
                                            <option value="Retired-3">Retired-3</option>
                                            <option value="Salaried-4">Salaried-4</option>
                                            <option value="Self Employed/professonal-5">Self Employed/professonal-5</option>
                                            <option value="Others-5">Others-5</option>
                                        </select>
                                        {formik.touched.lifeA?.occupation && formik.errors.lifeA?.occupation ? (
                                            <div className="text-danger">{formik.errors.lifeA.occupation}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeA.occupationClass">Occupation Class<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeA.occupationClass"
                                            name="lifeA.occupationClass"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.occupationClass}
                                            readOnly
                                        />
                                        {formik.touched.lifeA?.occupationClass && formik.errors.lifeA?.occupationClass ? (
                                            <div className="text-danger">{formik.errors.lifeA.occupationClass}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeA.annualIncome">Annual Income<span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            id="lifeA.annualIncome"
                                            name="lifeA.annualIncome"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.annualIncome}
                                            disabled
                                        />
                                        {formik.touched.lifeA?.annualIncome && formik.errors.lifeA?.annualIncome ? (
                                            <div className="text-danger">{formik.errors.lifeA.annualIncome}</div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeA.kids">Would you like to include kids?</label>
                                        <div className="d-flex">
                                            <div className="form-check">
                                                <input
                                                    type="radio"
                                                    id="lifeA.kids-yes"
                                                    name="lifeA.kids"
                                                    value="yes"
                                                    className="form-check-input"
                                                    onChange={(e) => {
                                                        formik.handleChange(e);
                                                        handleKidsInclusionChange(e);
                                                    }}
                                                    onBlur={formik.handleBlur}
                                                    checked={formik.values.lifeA.kids === 'yes'}
                                                    disabled={formik.values.lifeA.kids !== ''}
                                                />
                                                <label htmlFor="lifeA.kids-yes" className="form-check-label">Yes</label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    type="radio"
                                                    id="lifeA.kids-no"
                                                    name="lifeA.kids"
                                                    value="no"
                                                    className="form-check-input"
                                                    onChange={(e) => {
                                                        formik.handleChange(e);
                                                        handleKidsInclusionChange(e);
                                                    }}
                                                    onBlur={formik.handleBlur}
                                                    checked={formik.values.lifeA.kids === 'no'}
                                                    disabled={formik.values.lifeA.kids !== ''}
                                                />
                                                <label htmlFor="lifeA.kids-no" className="form-check-label">No</label>
                                            </div>
                                        </div>
                                        {formik.errors.lifeA?.kids && formik.touched.lifeA?.kids ? (
                                            <div className="text-danger">{formik.errors.lifeA.kids}</div>
                                        ) : null}
                                    </div>

                                </div>

                                <div className='row mb-3'>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeA.EducationalQualification">Educational Qualification<span className="text-danger">*</span></label>
                                        <select
                                            id="lifeA.EducationalQualification"
                                            name="lifeA.EducationalQualification"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.EducationalQualification}
                                            disabled={fieldsDisabled}

                                        >
                                            <option value="">Select</option>
                                            <option value="Graduate/Professional">Graduate/Professional</option>
                                            <option value="A/L Completed">A/L Completed</option>
                                            <option value="O/L Completed">O/L Completed</option>
                                            <option value="O/L Not Completed">O/L Not Completed</option>
                                        </select>
                                        {formik.touched.lifeA?.EducationalQualification && formik.errors.lifeA?.EducationalQualification ? (
                                            <div className="text-danger">{formik.errors.lifeA.EducationalQualification}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeA.OtherSourceOfIncome">Other Source of Income<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeA.OtherSourceOfIncome"
                                            name="lifeA.OtherSourceOfIncome"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeA.OtherSourceOfIncome}
                                            disabled={fieldsDisabled}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                            }}

                                        />
                                        {formik.touched.lifeA?.OtherSourceOfIncome && formik.errors.lifeA?.OtherSourceOfIncome ? (
                                            <div className="text-danger">{formik.errors.lifeA.OtherSourceOfIncome}</div>
                                        ) : null}
                                    </div>
                                </div>


                            </form>
                        </AccordionItem>

                        <AccordionItem
                            title="Life B: Spouse Details"
                            isOpen={Array.isArray(openItem) && openItem.includes('lifeB')}
                            onClick={() => handleAccordionClick('lifeB')}
                            disabled={applicationType === '' || applicationType === 'Single Life'}
                        >
                            <form onSubmit={formik.handleSubmit} className="eappform">
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeB.title">Title<span className="text-danger">*</span></label>
                                        <select
                                            id="lifeB.title"
                                            name="lifeB.title"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.title}
                                            disabled
                                        >
                                            <option value="">Select</option>
                                            <option value="mr">Mr.</option>
                                            <option value="mrs">Mrs.</option>
                                            <option value="miss">Miss</option>
                                            <option value="ms">Ms.</option>
                                            <option value="dr">Dr.</option>
                                        </select>
                                        {formik.touched.lifeB?.title && formik.errors.lifeB?.title ? (
                                            <div className="text-danger">{formik.errors.lifeB.title}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeB.firstName">First Name<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeB.firstName"
                                            name="lifeB.firstName"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.firstName}
                                            readOnly
                                        />
                                        {formik.touched.lifeB?.firstName && formik.errors.lifeB?.firstName ? (
                                            <div className="text-danger">{formik.errors.lifeB.firstName}</div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeB.lastName">Last Name<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeB.lastName"
                                            name="lifeB.lastName"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.lastName}
                                            readOnly
                                        />
                                        {formik.touched.lifeB?.lastName && formik.errors.lifeB?.lastName ? (
                                            <div className="text-danger">{formik.errors.lifeB.lastName}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeB.Aadhaar">Aadhaar Number<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeB.Aadhaar"
                                            name="lifeB.Aadhaar"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.Aadhaar}
                                            maxLength="12"
                                            readOnly
                                        />
                                        {formik.touched.lifeB?.Aadhaar && formik.errors.lifeB?.Aadhaar ? (
                                            <div className="text-danger">{formik.errors.lifeB.Aadhaar}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeB.Pan">Pan Number<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeB.Pan"
                                            name="lifeB.Pan"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.Pan}
                                            maxLength="11"
                                            readOnly
                                        />
                                        {formik.touched.lifeB?.Pan && formik.errors.lifeB?.Pan ? (
                                            <div className="text-danger">{formik.errors.lifeB.Pan}</div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeB.dateOfBirth">Date of Birth<span className="text-danger">*</span></label>
                                        <input
                                            type="date"
                                            id="lifeB.dateOfBirth"
                                            name="lifeB.dateOfBirth"
                                            className="form-control"
                                            onChange={(e) => handleDateOfBirthChange(e, 'lifeB')}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.dateOfBirth}
                                            readOnly
                                        />
                                        {formik.touched.lifeB?.dateOfBirth && formik.errors.lifeB?.dateOfBirth ? (
                                            <div className="text-danger">{formik.errors.lifeB.dateOfBirth}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeB.age">Age<span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            id="lifeB.age"
                                            name="lifeB.age"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.age}
                                            readOnly
                                        />
                                        {formik.touched.lifeB?.age && formik.errors.lifeB?.age ? (
                                            <div className="text-danger">{formik.errors.lifeB.age}</div>
                                        ) : null}
                                    </div>
                                </div>


                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeB.height">Height(CM)</label>
                                        <input
                                            type="number"
                                            id="lifeB.height"
                                            name="lifeB.height"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            value={formik.values.lifeB.height}
                                            readOnly
                                        />
                                        {formik.touched.lifeB?.height && formik.errors.lifeB?.height ? (
                                            <div className="text-danger">{formik.errors.lifeB.height}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeB.weight">Weight(KG)</label>
                                        <input
                                            type="number"
                                            id="lifeB.weight"
                                            name="lifeB.weight"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            value={formik.values.lifeB.weight}
                                            readOnly
                                        />
                                        {formik.touched.lifeB?.weight && formik.errors.lifeB?.weight ? (
                                            <div className="text-danger">{formik.errors.lifeB.weight}</div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeB.maritalStatus">Marital Status<span className="text-danger">*</span></label>
                                        <select
                                            id="lifeB.maritalStatus"
                                            name="lifeB.maritalStatus"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.maritalStatus}
                                            disabled
                                        >
                                            <option value="">Select</option>
                                            <option value="single">Single</option>
                                            <option value="married">Married</option>
                                            <option value="divorced">Divorced</option>
                                            <option value="widowed">Widowed</option>
                                        </select>
                                        {formik.touched.lifeB?.maritalStatus && formik.errors.lifeB?.maritalStatus ? (
                                            <div className="text-danger">{formik.errors.lifeB.maritalStatus}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label>Gender<span className="text-danger">*</span></label>
                                        <div className="d-flex justify-content-between">
                                            <div className="form-check">
                                                <input
                                                    type="radio"
                                                    id="lifeB.male"
                                                    name="lifeB.gender"
                                                    value="male"
                                                    className="form-check-input"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    checked={formik.values.lifeB.gender === 'male'}
                                                    disabled
                                                />
                                                <label htmlFor="lifeB.male" className="form-check-label">Male</label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    type="radio"
                                                    id="lifeB.female"
                                                    name="lifeB.gender"
                                                    value="female"
                                                    className="form-check-input"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    checked={formik.values.lifeB.gender === 'female'}
                                                    disabled
                                                />
                                                <label htmlFor="lifeB.female" className="form-check-label">Female</label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    type="radio"
                                                    id="lifeB.other"
                                                    name="lifeB.gender"
                                                    value="other"
                                                    className="form-check-input"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    checked={formik.values.lifeB.gender === 'other'}
                                                    disabled
                                                />
                                                <label htmlFor="lifeB.other" className="form-check-label">Other</label>
                                            </div>
                                        </div>
                                        {formik.touched.lifeB?.gender && formik.errors.lifeB?.gender ? (
                                            <div className="text-danger">{formik.errors.lifeB.gender}</div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label>Do you consume alcohol?</label>
                                        <div className="d-flex">
                                            <div className="form-check">
                                                <input
                                                    type="radio"
                                                    id="lifeB.alcohol-yes"
                                                    name="lifeB.alcohol"
                                                    value="yes"
                                                    className="form-check-input"
                                                    onChange={formik.handleChange}
                                                    checked={formik.values.lifeB.alcohol === 'yes'}
                                                    disabled
                                                />
                                                <label htmlFor="lifeB.alcohol-yes" className="form-check-label">Yes</label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    type="radio"
                                                    id="lifeB.alcohol-no"
                                                    name="lifeB.alcohol"
                                                    value="no"
                                                    className="form-check-input"
                                                    onChange={formik.handleChange}
                                                    checked={formik.values.lifeB.alcohol === 'no'}
                                                    disabled
                                                />
                                                <label htmlFor="lifeB.alcohol-no" className="form-check-label">No</label>
                                            </div>
                                        </div>
                                        {formik.touched.lifeB?.alcohol && formik.errors.lifeB?.alcohol ? (
                                            <div className="text-danger">{formik.errors.lifeB.alcohol}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeB.tobacco">Do you consume tobacco?<span className="text-danger">*</span></label>
                                        <div className="d-flex">
                                            <div className="form-check">
                                                <input
                                                    type="radio"
                                                    id="lifeB.tobacco-yes"
                                                    name="lifeB.tobacco"
                                                    value="yes"
                                                    className="form-check-input"
                                                    onChange={formik.handleChange}
                                                    checked={formik.values.lifeB.tobacco === 'yes'}
                                                    disabled
                                                />
                                                <label htmlFor="lifeB.tobacco-yes" className="form-check-label">Yes</label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    type="radio"
                                                    id="lifeB.tobacco-no"
                                                    name="lifeB.tobacco"
                                                    value="no"
                                                    className="form-check-input"
                                                    onChange={formik.handleChange}
                                                    checked={formik.values.lifeB.tobacco === 'no'}
                                                    disabled
                                                />
                                                <label htmlFor="lifeB.tobacco-no" className="form-check-label">No</label>
                                            </div>
                                        </div>
                                        {formik.touched.lifeB?.tobacco && formik.errors.lifeB?.tobacco ? (
                                            <div className="text-danger">{formik.errors.lifeB.tobacco}</div>
                                        ) : null}
                                    </div>
                                </div>

                                <h4>Occupation Details</h4>
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeB.occupation">Occupation<span className="text-danger">*</span></label>
                                        <select
                                            id="lifeB.occupation"
                                            name="lifeB.occupation"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.occupation}
                                            disabled
                                        >
                                            <option value="">Select</option>
                                            <option value="Homemaker-2">Homemaker-2</option>
                                            <option value="Retiree-2">Retiree-2</option>
                                            <option value="pensioner-2">Pensioner-2</option>
                                            <option value="Student-2">Student-2</option>
                                            <option value="Child-2">Child-2</option>
                                            <option value="Unemployed">Unemployed</option>
                                            <option value="Business Owner-1">Business Owner-1</option>
                                            <option value="Housewife-3">Housewife-3</option>
                                            <option value="Retired-3">Retired-3</option>
                                            <option value="Salaried-4">Salaried-4</option>
                                            <option value="Self Employed/professonal-5">Self Employed/professonal-5</option>
                                            <option value="Others-5">Others-5</option>
                                        </select>
                                        {formik.touched.lifeB?.occupation && formik.errors.lifeB?.occupation ? (
                                            <div className="text-danger">{formik.errors.lifeB.occupation}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeB.occupationClass">Occupation Class<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeB.occupationClass"
                                            name="lifeB.occupationClass"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.occupationClass}
                                            readOnly
                                        />
                                        {formik.touched.lifeB?.occupationClass && formik.errors.lifeB?.occupationClass ? (
                                            <div className="text-danger">{formik.errors.lifeB.occupationClass}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeB.annualIncome">Annual Income<span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            id="lifeB.annualIncome"
                                            name="lifeB.annualIncome"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.annualIncome}
                                            disabled
                                        />
                                        {formik.touched.lifeB?.annualIncome && formik.errors.lifeB?.annualIncome ? (
                                            <div className="text-danger">{formik.errors.lifeB.annualIncome}</div>
                                        ) : null}
                                    </div>
                                </div>
                                <div className='row mb-3'>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeB.EducationalQualification">Educational Qualification<span className="text-danger">*</span></label>
                                        <select
                                            id="lifeB.EducationalQualification"
                                            name="lifeB.EducationalQualification"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.EducationalQualification}
                                            disabled={fieldsDisabled}


                                        >
                                            <option value="">Select</option>
                                            <option value="Graduate/Professional">Graduate/Professional</option>
                                            <option value="A/L Completed">A/L Completed</option>
                                            <option value="O/L Completed">O/L Completed</option>
                                            <option value="O/L Not Completed">O/L Not Completed</option>
                                        </select>
                                        {formik.touched.lifeB?.EducationalQualification && formik.errors.lifeB?.EducationalQualification ? (
                                            <div className="text-danger">{formik.errors.lifeB.EducationalQualification}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lifeB.OtherSourceOfIncome">Other Source of Income<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="lifeB.OtherSourceOfIncome"
                                            name="lifeB.OtherSourceOfIncome"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.lifeB.OtherSourceOfIncome}
                                            disabled={fieldsDisabled}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, ""); // Removes spaces and special characters
                                            }}

                                        />
                                        {formik.touched.lifeB?.OtherSourceOfIncome && formik.errors.lifeB?.OtherSourceOfIncome ? (
                                            <div className="text-danger">{formik.errors.lifeB.OtherSourceOfIncome}</div>
                                        ) : null}
                                    </div>
                                </div>
                            </form>
                        </AccordionItem>

                        <AccordionItem
                            title="Child/Children Inclusion"
                            isOpen={openItem.includes('Child')}
                            onClick={() => handleAccordionClick('Child')}
                            disabled={!enableChildAccordion}
                        >
                            <p>Child 1</p>
                            <form onSubmit={formik.handleSubmit} className="eappform">
                                {/* Static Child 1 Form */}
                                {/* title & firstname */}
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="Child.title">Title<span className="text-danger">*</span></label>
                                        <select
                                            id="Child.title"
                                            name="Child[0].title"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.Child[0]?.title || ""}
                                            disabled
                                        >
                                            <option value="">Select</option>
                                            <option value="mr">Mr.</option>
                                            <option value="master">Master</option>
                                            <option value="miss">Miss</option>
                                        </select>
                                        {formik.touched.Child?.[0]?.title && formik.errors.Child?.[0]?.title ? (
                                            <div className="text-danger">{formik.errors.Child[0].title}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="Child.firstName">First Name<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="Child.firstName"
                                            name="Child[0].firstName"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.Child[0]?.firstName || ""}
                                            disabled
                                        />
                                        {formik.touched.Child?.[0]?.firstName && formik.errors.Child?.[0]?.firstName ? (
                                            <div className="text-danger">{formik.errors.Child[0].firstName}</div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* lastname & Aadhar */}
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="Child.lastName">Last Name<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="Child.lastName"
                                            name="Child[0].lastName"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.Child[0]?.lastName || ""}
                                            disabled
                                        />
                                        {formik.touched.Child?.[0]?.lastName && formik.errors.Child?.[0]?.lastName ? (
                                            <div className="text-danger">{formik.errors.Child[0].lastName}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="Child.Aadhaar">Aadhaar</label>
                                        <input
                                            type="text"
                                            id="Child.Aadhaar"
                                            name="Child[0].Aadhaar"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.Child[0]?.Aadhaar || ""}
                                            disabled
                                        />
                                        {formik.touched.Child?.[0]?.Aadhaar && formik.errors.Child?.[0]?.Aadhaar ? (
                                            <div className="text-danger">{formik.errors.Child[0].Aadhaar}</div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* dob & age */}
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="Child.dateOfBirth">dateOfBirth<span className="text-danger">*</span></label>
                                        <input
                                            type="date"
                                            id="Child.dateOfBirth"
                                            name="Child[0].dateOfBirth"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.Child[0]?.dateOfBirth || ""}
                                            disabled
                                        />
                                        {formik.touched.Child?.[0]?.dateOfBirth && formik.errors.Child?.[0]?.dateOfBirth ? (
                                            <div className="text-danger">{formik.errors.Child[0].dateOfBirth}</div>
                                        ) : null}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="Child.age">Age<span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            id="Child.age"
                                            name="Child[0].age"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.Child[0]?.age || ""}
                                            disabled
                                        />
                                        {formik.touched.Child?.[0]?.age && formik.errors.Child?.[0]?.age ? (
                                            <div className="text-danger">{formik.errors.Child[0].age}</div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* gender */}
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <label>Gender<span className="text-danger">*</span></label>
                                        <div className="d-flex justify-content-between">
                                            <div className="form-check">
                                                <input
                                                    type="radio"
                                                    id="Child.male"
                                                    name="Child[0].gender"
                                                    value="male"
                                                    className="form-check-input"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    checked={formik.values.Child[0]?.gender === 'male'}
                                                    disabled


                                                />
                                                <label htmlFor="Child.male" className="form-check-label">Male</label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    type="radio"
                                                    id="Child.female"
                                                    name="Child[0].gender"
                                                    value="female"
                                                    className="form-check-input"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    checked={formik.values.Child[0]?.gender === 'female'}
                                                    disabled

                                                />
                                                <label htmlFor="Child.female" className="form-check-label">Female</label>
                                            </div>
                                        </div>
                                        {formik.touched.Child?.[0]?.gender && formik.errors.Child?.[0]?.gender ? (
                                            <div className="text-danger">{formik.errors.Child[0].gender}</div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* Dynamic Child 2 to Child 5 */}
                                {formik.values.Child.slice(1).map((child, index) => (
                                    <div key={index + 1}>
                                        <p>Child {index + 2}</p>

                                        <div className="row mb-3">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor={`Child[${index + 1}].title`}>Title<span className="text-danger">*</span></label>
                                                <select
                                                    id={`Child[${index + 1}].title`}
                                                    name={`Child[${index + 1}].title`}
                                                    className="form-control"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.Child[index + 1]?.title || ""}
                                                    disabled
                                                >
                                                    <option value="">Select</option>
                                                    <option value="mr">Mr.</option>
                                                    <option value="master">Master</option>
                                                    <option value="miss">Miss</option>
                                                </select>
                                                {formik.touched.Child?.[index + 1]?.title && formik.errors.Child?.[index + 1]?.title ? (
                                                    <div className="text-danger">{formik.errors.Child[index + 1].title}</div>
                                                ) : null}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label htmlFor={`Child[${index + 1}].firstName`}>First Name<span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    id={`Child[${index + 1}].firstName`}
                                                    name={`Child[${index + 1}].firstName`}
                                                    className="form-control"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.Child[index + 1]?.firstName || ""}
                                                    disabled
                                                />
                                                {formik.touched.Child?.[index + 1]?.firstName && formik.errors.Child?.[index + 1]?.firstName ? (
                                                    <div className="text-danger">{formik.errors.Child[index + 1].firstName}</div>
                                                ) : null}
                                            </div>
                                        </div>

                                        {/* Last name & Aadhaar */}
                                        <div className="row mb-3">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor={`Child[${index + 1}].lastName`}>Last Name<span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    id={`Child[${index + 1}].lastName`}
                                                    name={`Child[${index + 1}].lastName`}
                                                    className="form-control"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.Child[index + 1]?.lastName || ""}
                                                    disabled
                                                />
                                                {formik.touched.Child?.[index + 1]?.lastName && formik.errors.Child?.[index + 1]?.lastName ? (
                                                    <div className="text-danger">{formik.errors.Child[index + 1].lastName}</div>
                                                ) : null}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label htmlFor={`Child[${index + 1}].Aadhaar`}>Aadhaar</label>
                                                <input
                                                    type="text"
                                                    id={`Child[${index + 1}].Aadhaar`}
                                                    name={`Child[${index + 1}].Aadhaar`}
                                                    className="form-control"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.Child[index + 1]?.Aadhaar || ""}
                                                    disabled
                                                />
                                                {formik.touched.Child?.[index + 1]?.Aadhaar && formik.errors.Child?.[index + 1]?.Aadhaar ? (
                                                    <div className="text-danger">{formik.errors.Child[index + 1].Aadhaar}</div>
                                                ) : null}
                                            </div>
                                        </div>

                                        {/* DOB & Age */}
                                        <div className="row mb-3">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor={`Child[${index + 1}].dateOfBirth`}>Date of Birth<span className="text-danger">*</span></label>
                                                <input
                                                    type="date"
                                                    id={`Child[${index + 1}].dateOfBirth`}
                                                    name={`Child[${index + 1}].dateOfBirth`}
                                                    className="form-control"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.Child[index + 1]?.dateOfBirth || ""}
                                                    disabled
                                                />
                                                {formik.touched.Child?.[index + 1]?.dateOfBirth && formik.errors.Child?.[index + 1]?.dateOfBirth ? (
                                                    <div className="text-danger">{formik.errors.Child[index + 1].dateOfBirth}</div>
                                                ) : null}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label htmlFor={`Child[${index + 1}].age`}>Age<span className="text-danger">*</span></label>
                                                <input
                                                    type="number"
                                                    id={`Child[${index + 1}].age`}
                                                    name={`Child[${index + 1}].age`}
                                                    className="form-control"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.Child[index + 1]?.age || ""}
                                                    disabled
                                                />
                                                {formik.touched.Child?.[index + 1]?.age && formik.errors.Child?.[index + 1]?.age ? (
                                                    <div className="text-danger">{formik.errors.Child[index + 1].age}</div>
                                                ) : null}
                                            </div>
                                        </div>

                                        {/* Gender */}
                                        <div className="row mb-3">
                                            <div className="col-md-6 mb-3">
                                                <label>Gender<span className="text-danger">*</span></label>
                                                <div className="d-flex justify-content-between">
                                                    <div className="form-check">
                                                        <input
                                                            type="radio"
                                                            id={`Child[${index + 1}].gender.male`}
                                                            name={`Child[${index + 1}].gender`}
                                                            value="male"
                                                            className="form-check-input"
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            checked={formik.values.Child[index + 1]?.gender === 'male'}
                                                            disabled
                                                        />
                                                        <label htmlFor={`Child[${index + 1}].gender.male`} className="form-check-label">Male</label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            type="radio"
                                                            id={`Child[${index + 1}].gender.female`}
                                                            name={`Child[${index + 1}].gender`}
                                                            value="female"
                                                            className="form-check-input"
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            checked={formik.values.Child[index + 1]?.gender === 'female'}
                                                            disabled
                                                        />
                                                        <label htmlFor={`Child[${index + 1}].gender.female`} className="form-check-label">Female</label>
                                                    </div>
                                                </div>
                                                {formik.touched.Child?.[index + 1]?.gender && formik.errors.Child?.[index + 1]?.gender ? (
                                                    <div className="text-danger">{formik.errors.Child[index + 1].gender}</div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {(formik.values.Child.length > 1 || formik.values.Child.length < 6) && (
                                    <div className="row mb-3 d-flex justify-content-between">
                                        {formik.values.Child.length > 1 && (
                                            <div className="col-auto">
                                                <button type="button" onClick={() => removeChild(formik.values.Child.length - 1)} className="btn btn-danger" disabled>
                                                    Remove
                                                </button>
                                            </div>
                                        )}

                                        {formik.values.Child.length < 6 && (
                                            <div className="col-auto">
                                                <button type="button" onClick={addNewChild} className="btn btn-danger" disabled>Add New</button>
                                            </div>
                                        )}
                                    </div>
                                )}


                            </form>
                        </AccordionItem>

                        {!isKeyboardVisible && (
                             <div className='iosfixednextprevbutton'>
                            <div className="fixednextprevbutton d-flex justify-content-between">
                                <button
                                    type="button"
                                    className="btn btnprev"
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

export default EappPersonalDetail;
