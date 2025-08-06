import React, { useState, useEffect } from 'react';
import './Eapp_personalDetails.css';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const AccordionItem = ({ title, children, isOpen, onClick, disabled }) => {
    return (
        <div className="accordion-item">
            <button
                className={`accordion-title ${disabled ? 'disabled' : 'enabled'}`}
                onClick={!disabled ? onClick : null}
                disabled={disabled}
            >
                {title}
            </button>
            {isOpen && <div className="accordion-content">{children}</div>}
        </div>
    );
};

const EappPersonalDetail = () => {
    const [openItem, setOpenItem] = useState(null); 
    const [applicationType, setApplicationType] = useState('');
    const navigate = useNavigate();
    const [formErrors, setFormErrors] = useState({ lifeA: '', lifeB: '' });

    const handleAccordionClick = (item) => {
        if (
            applicationType === '' || 
            (applicationType === 'single life' && (item === 'lifeB' || item === 'lifeC')) || 
            (applicationType === 'joint life' && item === 'lifeC')
        ) {
            return; 
        }
        setOpenItem(openItem === item ? null : item); 
    };

    const handleApplicationTypeChange = (event) => {
        const selectedType = event.target.value;
        setApplicationType(selectedType);
        
        // Automatically open the relevant accordion section based on application type
        if (selectedType === 'single life') {
            setOpenItem('lifeA'); // Open 'Life A' section
        } else if (selectedType === 'joint life') {
            setOpenItem('lifeA'); // Open 'Life A' section by default
        } else {
            setOpenItem(null); // Close all sections if no valid application type is selected
        }
    };

    //validation for fields
    const validationSchema = Yup.object({
        title: Yup.string().required('Title is required'),
        firstName: Yup.string()
            .max(36, 'firstName cannot be longer than 36 characters')
            .matches(/^([a-zA-Z]+\s)*([a-zA-Z]+)$/, 'firstName must only contain letters')
            .required('firstName is required'),
        lastName: Yup.string()
            .max(36, 'lastName cannot be longer than 36 characters')
            .matches(/^([a-zA-Z]+\s)*([a-zA-Z]+)$/, 'lastName must only contain letters')
            .required('Last Name is required'),
        ssn: Yup.string()
            .matches(/^(?!666|000|9\d{2})\d{3}-(?!00)\d{2}-(?!0{4})\d{4}$/, 'must be a valid Social Security Number')
            .required('Social Security Number is required'),//123-45-6789
        dob: Yup.date().required('Date of Birth is required'),
        age: Yup.number().required('Age is required').positive().integer(),
        gender: Yup.string().required('Gender is required'),
        maritalStatus: Yup.string().required('Marital Status is required'),
        tobacco: Yup.string().required('Tobacco consumption status is required'),
        occupation: Yup.string().required('Occupation is required'),
        occupationClass: Yup.string().required('Occupation Class is required'),
        annualIncome: Yup.string()
            .matches(/^[0-9\,]+$/, 'Annual Income must be a number with optional commas')
            .max(15, 'Annual Income cannot be longer than 15 characters')
            .required('Annual Income is required'),
        citizen: Yup.string().required('Citizenship is required'),
        licensenumber: Yup.number().required('Drivers License Number is required'),
        stateofissue: Yup.number().required('Drivers License State of Issue is required'),
        stateidnumber: Yup.number().required('State Id Number License Number is required'),
        period: Yup.number().required('Period is required'),
        totalnetworth: Yup.number().required('Net Worth is required'),
    });

    const formikLifeA = useFormik({
        initialValues: {
            title: '',
            firstName: '',
            middleName: '',
            lastName: '',
            ssn: '',
            dob: '',
            age: '',
            height: '',
            weight: '',
            gender: '',
            maritalStatus: '',
            alcohol: '',
            tobacco: '',
            occupation: '',
            occupationClass: '',
            annualIncome: '',
            citizen: '',
            dateOfEntry: '',
            visaType: '',
            totalnetworth:'',
            period:'',
            stateidnumber:'',
            stateofissue:'',
            licensenumber:'',
            regnumber:'',
            empname:'',
            Business:'',
            objectiveofinsurance:'',
            prefferedcontactmode:'',
            preferredlang:'',
            religion:'',
            countryofResidence:'',
            countryofbirth:'',
            nationality:'',

        },
        validationSchema,
        onSubmit: (values) => {
            if (Object.keys(formikLifeA.errors).length > 0) {
                const missingFields = Object.keys(formikLifeA.errors).join(', ');
                alert(`Please fill the following mandatory fields: ${missingFields}`);
            } else {
                console.log('Form submitted successfully!', values);
            }
        },
    });

    const formikLifeB = useFormik({
        initialValues: {
            title: '',
            firstName: '',
            middleName: '',
            lastName: '',
            ssn: '',
            dob: '',
            age: '',
            height: '',
            weight: '',
            gender: '',
            maritalStatus: '',
            alcohol: '',
            tobacco: '',
            occupation: '',
            occupationClass: '',
            annualIncome: '',
            relationship: '',
            citizen: '',
            dateOfEntry: '',
            visaType: '',
            dateOfEntry: '',
            visaType: '',
            totalnetworth:'',
            period:'',
            stateidnumber:'',
            stateofissue:'',
            licensenumber:'',
            regnumber:'',
            empname:'',
            Business:'',
            objectiveofinsurance:'',
            prefferedcontactmode:'',
            preferredlang:'',
            religion:'',
            countryofResidence:'',
            countryofbirth:'',
            nationality:'',
        },
        validationSchema,
        onSubmit: (values) => {
            if (Object.keys(formikLifeB.errors).length > 0) {
                const missingFields = Object.keys(formikLifeB.errors).join(', ');
                alert(`Please fill the following mandatory fields: ${missingFields}`);
            } else {
                console.log('Form submitted successfully!', values);
            }
        },
    });

    const [isCitizenA, setIsCitizenA] = useState(formikLifeA.values.citizen);
    const [isCitizenB, setIsCitizenB] = useState(formikLifeB.values.citizen);

    const handleFormSubmit = async (values, lifeType, storeName) => {
       
        
    };

     //when enters dob age also updates here
     const handleDobChange = (e, formName) => {
        const dob = e.target.value;
        
        // Calculate the age based on the provided DOB
        const age = dob ? calculateAge(dob) : '';
        
        if (formName === 'lifeA') {
            formikLifeA.setFieldValue('dob', dob);
            formikLifeA.setFieldValue('age', age);
        } else if (formName === 'lifeB') {
            formikLifeB.setFieldValue('dob', dob);
            formikLifeB.setFieldValue('age', age);
        }
    };

     //when enters dob age also updates here
    const calculateAge = (dob) => {
        const dobDate = new Date(dob);
        const diffMs = Date.now() - dobDate.getTime();
        const ageDate = new Date(diffMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const handleBack = () => {
         navigate('/dashboard');
    };
 
     const handleNext = () => {
         navigate('/eapp_addressdetail'); 
    };

     const handleCitizenshipChangeA = (e) => {
        formikLifeA.handleChange(e);
        setIsCitizenA(e.target.value);  
    };

    const handleCitizenshipChangeB = (e) => {
        formikLifeB.handleChange(e);
        setIsCitizenB(e.target.value); 
    };

    const handleSSNChange = (e, formikInstance) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
        if (value.length > 3 && value.length <= 5) {
          value = value.slice(0, 3) + '-' + value.slice(3); // Add the first hyphen
        } else if (value.length > 5) {
          value = value.slice(0, 3) + '-' + value.slice(3, 5) + '-' + value.slice(5); // Add the second hyphen
        }
      
        formikInstance.setFieldValue('ssn', value); // Update the specific formik instance value
      };
      


    return (
        <div className="sqs-personal-detail-container container p-0">
            <div className="d-flex justify-content-between mt-4">
                <button onClick={handleBack} className="btn">
                    <i className="fas fa-arrow-left"></i>
                </button>
                <button onClick={handleNext} className="btn ">
                    <i className="fas fa-arrow-right"></i>
                </button>
            </div>
          <h3>Eapp Personal Details</h3>
    
            <p>Application Type<span className="text-danger">*</span></p>
            <div className="col-md-6 lifedropdown mb-4">
                <select id="ApplicationType" name="ApplicationType"  onChange={handleApplicationTypeChange} className="form-control">
                <option value="">Select</option>
                <option value="single life">Single Life</option>
                <option value="Joint life">Joint Life</option>
                </select>
            </div>
    
            <div className="accordion">
    
                <AccordionItem
                        title="Life A: Proposed Insured Details"
                        isOpen={openItem === 'lifeA'}
                        onClick={() => handleAccordionClick('lifeA')}
                        disabled={applicationType === ''}
                        >
                        <p>Personal Details</p>
                        <p>Life A as Owner:</p>
                        <form onSubmit={formikLifeA.handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="title">Title<span className="text-danger">*</span></label>
                                    <select
                                        id="title"
                                        name="title"
                                        className="form-control"
                                        onChange={formikLifeA.handleChange}
                                        onBlur={formikLifeA.handleBlur}
                                        value={formikLifeA.values.title}
                                    >
                                        <option value="">Select</option>
                                        <option value="mr">Mr.</option>
                                        <option value="mrs">Mrs.</option>
                                        <option value="miss">Miss</option>
                                        <option value="ms">Ms.</option>
                                        <option value="dr">Dr.</option>
                                    </select>
                                    {formikLifeA.touched.title && formikLifeA.errors.title ? (
                                        <div className="text-danger">{formikLifeA.errors.title}</div>
                                    ) : null}
                                </div>
    
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="firstName">First Name<span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        className="form-control"
                                        onChange={formikLifeA.handleChange}
                                        onBlur={formikLifeA.handleBlur}
                                        value={formikLifeA.values.firstName}
                                    />
                                    {formikLifeA.touched.firstName && formikLifeA.errors.firstName ? (
                                        <div className="text-danger">{formikLifeA.errors.firstName}</div>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="middleName">Middle Name</label>
                                    <input
                                        type="text"
                                        id="middleName"
                                        name="middleName"
                                        className="form-control"
                                        onChange={formikLifeA.handleChange}
                                        onBlur={formikLifeA.handleBlur}
                                        value={formikLifeA.values.middleName}
                                    />
                                    {formikLifeA.touched.middleName && formikLifeA.errors.middleName ? (
                                        <div className="text-danger">{formikLifeA.errors.middleName}</div>
                                    ) : null}
                                </div>
                                    
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="lastName">Last Name<span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        className="form-control"
                                        onChange={formikLifeA.handleChange}
                                        onBlur={formikLifeA.handleBlur}
                                        value={formikLifeA.values.lastName}
                                    />
                                    {formikLifeA.touched.lastName && formikLifeA.errors.lastName ? (
                                        <div className="text-danger">{formikLifeA.errors.lastName}</div>
                                    ) : null}
                                </div>
    
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="ssn">Social Security Number<span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        id="ssnA"
                                        name="ssn"
                                        className="form-control"
                                        onChange={(e) => handleSSNChange(e, formikLifeA)}
                                        onBlur={formikLifeA.handleBlur}
                                        value={formikLifeA.values.ssn}
                                        maxLength="11"
                                    />
                                    {formikLifeA.touched.ssn && formikLifeA.errors.ssn ? (
                                        <div className="text-danger">{formikLifeA.errors.ssn}</div>
                                    ) : null}
                                </div>

    
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="dob">Date of Birth<span className="text-danger">*</span></label>
                                    <input
                                        type="date"
                                        id="dob"
                                        name="dob"
                                        className="form-control"
                                        onChange={(e) => handleDobChange(e, 'lifeA')}
                                        onBlur={formikLifeA.handleBlur}
                                        value={formikLifeA.values.dob}
                                    />
                                    {formikLifeA.touched.dob && formikLifeA.errors.dob ? (
                                        <div className="text-danger">{formikLifeA.errors.dob}</div>
                                    ) : null}
                                </div>
    
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="age">Age<span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        id="age"
                                        name="age"
                                        className="form-control"
                                        onChange={formikLifeA.handleChange}
                                        onBlur={formikLifeA.handleBlur}
                                        value={formikLifeA.values.age}
                                    />
                                    {formikLifeA.touched.age && formikLifeA.errors.age ? (
                                        <div className="text-danger">{formikLifeA.errors.age}</div>
                                    ) : null}
                                </div>
    
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="height">Height(CM)<span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        id="height"
                                        name="height"
                                        className="form-control"
                                        onChange={formikLifeA.handleChange}
                                        value={formikLifeA.values.height}
                                    />
                                    {formikLifeA.errors.height && formikLifeA.touched.height ? (
                                        <div className="text-danger">{formikLifeA.errors.height}</div>
                                    ) : null}
                                </div>
    
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="weight">Weight(KG)<span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        id="weight"
                                        name="weight"
                                        className="form-control"
                                        onChange={formikLifeA.handleChange}
                                        value={formikLifeA.values.weight}
                                    />
                                    {formikLifeA.errors.weight && formikLifeA.touched.weight ? (
                                        <div className="text-danger">{formikLifeA.errors.weight}</div>
                                    ) : null}
                                </div>
                                
                                <div className="col-md-6 mb-3">
                                    <label>Gender<span className="text-danger">*</span></label>
                                    <div className='d-flex justify-content-between'>
                                        <div className="form-check">
                                            <input
                                                type="radio"
                                                id="male"
                                                name="gender"
                                                value="male"
                                                className="form-check-input"
                                                onChange={formikLifeA.handleChange}
                                                onBlur={formikLifeA.handleBlur}
                                                checked={formikLifeA.values.gender === 'male'}
                                            />
                                            <label htmlFor="male" className="form-check-label">Male</label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                type="radio"
                                                id="female"
                                                name="gender"
                                                value="female"
                                                className="form-check-input"
                                                onChange={formikLifeA.handleChange}
                                                onBlur={formikLifeA.handleBlur}
                                                checked={formikLifeA.values.gender === 'female'}
                                            />
                                            <label htmlFor="female" className="form-check-label">Female</label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                type="radio"
                                                id="other"
                                                name="gender"
                                                value="other"
                                                className="form-check-input"
                                                onChange={formikLifeA.handleChange}
                                                onBlur={formikLifeA.handleBlur}
                                                checked={formikLifeA.values.gender === 'other'}
                                            />
                                            <label htmlFor="other" className="form-check-label">Other</label>
                                        </div>
                                    </div>
                                    {formikLifeA.touched.gender && formikLifeA.errors.gender ? (
                                        <div className="text-danger">{formikLifeA.errors.gender}</div>
                                    ) : null}
                                </div>
    
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="maritalStatus">Marital Status<span className="text-danger">*</span></label>
                                    <select
                                        id="maritalStatus"
                                        name="maritalStatus"
                                        className="form-control"
                                        onChange={formikLifeA.handleChange}
                                        onBlur={formikLifeA.handleBlur}
                                        value={formikLifeA.values.maritalStatus}
                                    >
                                        <option value="">Select</option>
                                        <option value="single">Single</option>
                                        <option value="married">Married</option>
                                        <option value="divorced">Divorced</option>
                                        <option value="widowed">Widowed</option>
                                    </select>
                                    {formikLifeA.touched.maritalStatus && formikLifeA.errors.maritalStatus ? (
                                        <div className="text-danger">{formikLifeA.errors.maritalStatus}</div>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="nationality">Nationality</label>
                                    <select
                                        id="nationality"
                                        name="nationality"
                                        className="form-control"
                                        onChange={formikLifeA.handleChange}
                                        onBlur={formikLifeA.handleBlur}
                                        value={formikLifeA.values.nationality}
                                    >
                                        <option value="">Select</option>
                                        <option value="srilankan">Srilankan</option>
                                        <option value="afgan">Afgan</option>
                                        <option value="brazilian">Brazilian</option>
                                        <option value="cambodian">Cambodian</option>
                                        <option value="danish">Danish</option>
                                        <option value="indian">Indian</option>
                                        <option value="malaysian">Malaysian</option>
                                        <option value="thai">Thai</option>
                                        <option value="american">American</option>
                                    </select>
                                    {formikLifeA.touched.nationality && formikLifeA.errors.nationality ? (
                                        <div className="text-danger">{formikLifeA.errors.nationality}</div>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="countryofbirth">Country of Birth</label>
                                    <select
                                        id="countryofbirth"
                                        name="nationcountryofbirthality"
                                        className="form-control"
                                        onChange={formikLifeA.handleChange}
                                        onBlur={formikLifeA.handleBlur}
                                        value={formikLifeA.values.countryofbirth}
                                    >
                                        <option value="">Select</option>
                                        <option value="srilankan">Srilankan</option>
                                        <option value="afgan">Afgan</option>
                                        <option value="brazil">Brazil</option>
                                        <option value="cambodian">Cambodian</option>
                                        <option value="denmark">Denmark</option>
                                        <option value="indian">Indian</option>
                                        <option value="malaysian">Malaysian</option>
                                        <option value="thailand">Thailand</option>
                                        <option value="us">US</option>
                                    </select>
                                    {formikLifeA.touched.countryofbirth && formikLifeA.errors.countryofbirth ? (
                                        <div className="text-danger">{formikLifeA.errors.countryofbirth}</div>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="countryofResidence">Country of Residence</label>
                                    <select
                                        id="countryofResidence"
                                        name="countryofResidence"
                                        className="form-control"
                                        onChange={formikLifeA.handleChange}
                                        onBlur={formikLifeA.handleBlur}
                                        value={formikLifeA.values.countryofResidence}
                                    >
                                        <option value="">Select</option>
                                        <option value="srilanka">Srilankan</option>
                                        <option value="afgan">Afgan</option>
                                        <option value="brazil">Brazil</option>
                                        <option value="cambodian">Cambodian</option>
                                        <option value="denmark">Denmark</option>
                                        <option value="india">Indian</option>
                                        <option value="malya">Malaysian</option>
                                        <option value="thai">Thailand</option>
                                        <option value="us">US</option>
                                    </select>
                                    {formikLifeA.touched.countryofResidence && formikLifeA.errors.countryofResidence ? (
                                        <div className="text-danger">{formikLifeA.errors.countryofResidence}</div>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="religion">Religion</label>
                                    <select
                                        id="religion"
                                        name="religion"
                                        className="form-control"
                                        onChange={formikLifeA.handleChange}
                                        onBlur={formikLifeA.handleBlur}
                                        value={formikLifeA.values.religion}
                                    >
                                        <option value="">Select</option>
                                        <option value="hindu">Hindu</option>
                                        <option value="muslim">Muslim</option>
                                        <option value="sikh">Sikh</option>
                                        <option value="christian">Christian</option>
                                    </select>
                                    {formikLifeA.touched.religion && formikLifeA.errors.religion ? (
                                        <div className="text-danger">{formikLifeA.errors.religion}</div>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="preferredlang">Preferred language</label>
                                    <select
                                        id="preferredlang"
                                        name="preferredlang"
                                        className="form-control"
                                        onChange={formikLifeA.handleChange}
                                        onBlur={formikLifeA.handleBlur}
                                        value={formikLifeA.values.preferredlang}
                                    >
                                        <option value="">Select</option>
                                        <option value="english">English</option>
                                        <option value="spanish">Spanish</option>
                                        <option value="chinese">Chinese</option>
                                    </select>
                                    {formikLifeA.touched.preferredlang && formikLifeA.errors.preferredlang ? (
                                        <div className="text-danger">{formikLifeA.errors.preferredlang}</div>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="prefferedcontactmode">Preferred Contact Mode</label>
                                    <select
                                        id="prefferedcontactmode"
                                        name="prefferedcontactmode"
                                        className="form-control"
                                        onChange={formikLifeA.handleChange}
                                        onBlur={formikLifeA.handleBlur}
                                        value={formikLifeA.values.prefferedcontactmode}
                                    >
                                        <option value="">Select</option>
                                        <option value="post">Postal</option>
                                        <option value="mail">Email</option>
                                        <option value="tele">Telephone</option>
                                        <option value="sms">SMS</option>
                                    </select>
                                    {formikLifeA.touched.prefferedcontactmode && formikLifeA.errors.prefferedcontactmode ? (
                                        <div className="text-danger">{formikLifeA.errors.prefferedcontactmode}</div>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="objectiveofinsurance">Objective of Insurance</label>
                                    <select
                                        id="objectiveofinsurance"
                                        name="objectiveofinsurance"
                                        className="form-control"
                                        onChange={formikLifeA.handleChange}
                                        onBlur={formikLifeA.handleBlur}
                                        value={formikLifeA.values.objectiveofinsurance}
                                    >
                                        <option value="">Select</option>
                                        <option value="plan">Protection Plan</option>
                                        <option value="savings">Savings</option>
                                        <option value="education">Education</option>
                                        <option value="annuity">Annuity</option>
                                        <option value="pension">Pension</option>
                                        <option value="loan">Loan</option>
                                        <option value="asssignment">Assignment</option>
                                        <option value="mortgage">Mortgage</option>
                                    </select>
                                    {formikLifeA.touched.objectiveofinsurance && formikLifeA.errors.objectiveofinsurance ? (
                                        <div className="text-danger">{formikLifeA.errors.objectiveofinsurance}</div>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="alcohol">Do you consume alcohol?</label>
                                    <div className='d-flex'>
                                        <div className="form-check">
                                            <input type="radio" id="alcohol-yes" name="alcohol" value="yes" className="form-check-input" onChange={formikLifeA.handleChange} checked={formikLifeA.values.alcohol === 'yes'} />
                                            <label htmlFor="alcohol-yes" className="form-check-label">Yes</label>
                                        </div>
                                        <div className="form-check">
                                            <input type="radio" id="alcohol-no" name="alcohol" value="no" className="form-check-input" onChange={formikLifeA.handleChange} checked={formikLifeA.values.alcohol === 'no'} />
                                            <label htmlFor="alcohol-no" className="form-check-label">No</label>
                                        </div>
                                    </div>
                                    {formikLifeA.errors.alcohol && formikLifeA.touched.alcohol ? (
                                        <div className="text-danger">{formikLifeA.errors.alcohol}</div>
                                    ) : null}
                                </div>
    
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="tobacco">Do you consume tobacco?<span className="text-danger">*</span></label>
                                    <div className='d-flex'>
                                        <div className="form-check">
                                            <input type="radio" id="tobacco-yes" name="tobacco" value="yes" className="form-check-input" onChange={formikLifeA.handleChange} checked={formikLifeA.values.tobacco === 'yes'} />
                                            <label htmlFor="tobacco-yes" className="form-check-label">Yes</label>
                                        </div>
                                        <div className="form-check">
                                            <input type="radio" id="tobacco-no" name="tobacco" value="no" className="form-check-input" onChange={formikLifeA.handleChange} checked={formikLifeA.values.tobacco === 'no'} />
                                            <label htmlFor="tobacco-no" className="form-check-label">No</label>
                                        </div>
                                    </div>
                                    {formikLifeA.touched.tobacco && formikLifeA.errors.tobacco ? (
                                        <div className="text-danger">{formikLifeA.errors.tobacco}</div>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                        <label htmlFor="licensenumber">Drivers's License Number<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="licensenumber"
                                            name="licensenumber"
                                            className="form-control"
                                            onChange={formikLifeA.handleChange}
                                            onBlur={formikLifeA.handleBlur}
                                            value={formikLifeA.values.licensenumber}
                                        />
                                        {formikLifeA.touched.licensenumber && formikLifeA.errors.licensenumber ? (
                                            <div className="text-danger">{formikLifeA.errors.licensenumber}</div>
                                        ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="stateofissue">Drivers's License State of Issue<span className="text-danger">*</span></label>
                                    <select
                                    id="stateofissue"
                                    name="stateofissue"
                                    className="form-control"
                                    onChange={formikLifeA.handleChange}
                                    onBlur={formikLifeA.handleBlur}
                                    value={formikLifeA.values.stateofissue}
                                >
                                    <option value="">Select</option>
                                    <option value="srilanka">Srilankan</option>
                                    <option value="afgan">Afgan</option>
                                    <option value="brazil">Brazil</option>
                                    <option value="cambodian">Cambodian</option>
                                    <option value="denmark">Denmark</option>
                                    <option value="india">Indian</option>
                                    <option value="malya">Malaysian</option>
                                    <option value="thai">Thailand</option>
                                    <option value="us">US</option>
                                </select>
                                    {formikLifeA.touched.stateofissue && formikLifeA.errors.stateofissue ? (
                                        <div className="text-danger">{formikLifeA.errors.stateofissue}</div>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="stateidnumber">State ID Number<span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        id="stateidnumber"
                                        name="stateidnumber"
                                        className="form-control"
                                        onChange={formikLifeA.handleChange}
                                        onBlur={formikLifeA.handleBlur}
                                        value={formikLifeA.values.stateidnumber}
                                    />
                                    {formikLifeA.touched.stateidnumber && formikLifeA.errors.stateidnumber ? (
                                        <div className="text-danger">{formikLifeA.errors.stateidnumber}</div>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="citizen">Are you a citizen of USA?<span className="text-danger">*</span></label>
                                    <div className="d-flex">
                                        <div className="form-check">
                                            <input
                                                type="radio"
                                                id="citizen-yes"
                                                name="citizen"
                                                value="yes"
                                                className="form-check-input"
                                                onChange={handleCitizenshipChangeA}
                                                checked={formikLifeA.values.citizen === 'yes'}
                                            />
                                            <label htmlFor="citizen-yes" className="form-check-label">Yes</label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                type="radio"
                                                id="citizen-no"
                                                name="citizen"
                                                value="no"
                                                className="form-check-input"
                                                onChange={handleCitizenshipChangeA}
                                                checked={formikLifeA.values.citizen === 'no'}
                                            />
                                            <label htmlFor="citizen-no" className="form-check-label">No</label>
                                        </div>
                                    </div>
                                    {formikLifeA.touched.citizen && formikLifeA.errors.citizen ? (
                                        <div className="text-danger">{formikLifeA.errors.citizen}</div>
                                    ) : null}

                                    {isCitizenA === 'no' && (
                                        <div className="mt-3">
                                            <label htmlFor="dateOfEntry">Date of Entry in USA<span className="text-danger">*</span></label>
                                            <input
                                                type="date"
                                                id="dateOfEntry"
                                                name="dateOfEntry"
                                                className="form-control"
                                                onChange={formikLifeA.handleChange}
                                                value={formikLifeA.values.dateOfEntry}
                                            />
                                            {formikLifeA.touched.dateOfEntry && formikLifeA.errors.dateOfEntry ? (
                                                <div className="text-danger">{formikLifeA.errors.dateOfEntry}</div>
                                            ) : null}

                                            <label htmlFor="visaType" className="mt-3">Visa Type<span className="text-danger">*</span></label>
                                            <select
                                                id="visaType"
                                                name="visaType"
                                                className="form-control"
                                                onChange={formikLifeA.handleChange}
                                                value={formikLifeA.values.visaType}
                                            >
                                                <option value="">Select Visa Type</option>
                                                <option value="B1">B1</option>
                                                <option value="P">P</option>
                                                <option value="H1B1">H1B1</option>
                                                <option value="D">D</option>
                                                <option value="A">A</option>
                                            </select>
                                            {formikLifeA.touched.visaType && formikLifeA.errors.visaType ? (
                                                <div className="text-danger">{formikLifeA.errors.visaType}</div>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
    
                                <p>Occupation Details</p>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="occupation">Occupation<span className="text-danger">*</span></label>
                                        <select
                                        id="occupation"
                                        name="occupation"
                                        className="form-control"
                                        onChange={formikLifeA.handleChange}
                                        onBlur={formikLifeA.handleBlur}
                                        value={formikLifeA.values.occupation}
                                    >
                                        <option value="">Select</option>
                                        <option value="srilanka">Homeaker-2</option>
                                        <option value="afgan">Retiree-2</option>
                                        <option value="brazil">Pensioner-2</option>
                                        <option value="cambodian">Student-2</option>
                                        <option value="denmark">Child-2</option>
                                        <option value="india">Unemployed</option>
                                        <option value="malya">Business Owner-1</option>
                                        <option value="thai">Housewife-3</option>
                                        <option value="us">Retired-3</option>
                                        <option value="malya">Salaried-4</option>
                                        <option value="thai">Self Employed/professonal-5</option>
                                        <option value="us">Others-5</option>
                                    </select>
                                        {formikLifeA.touched.occupation && formikLifeA.errors.occupation ? (
                                            <div className="text-danger">{formikLifeA.errors.occupation}</div>
                                        ) : null}
                                    </div>
    
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="occupationClass">Occupation Class<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="occupationClass"
                                            name="occupationClass"
                                            className="form-control"
                                            onChange={formikLifeA.handleChange}
                                            onBlur={formikLifeA.handleBlur}
                                            value={formikLifeA.values.occupationClass}
                                        />
                                        {formikLifeA.touched.occupationClass && formikLifeA.errors.occupationClass ? (
                                            <div className="text-danger">{formikLifeA.errors.occupationClass}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="Business">Nature of Business</label>
                                        <select
                                        id="Business"
                                        name="Business"
                                        className="form-control"
                                        onChange={formikLifeA.handleChange}
                                        onBlur={formikLifeA.handleBlur}
                                        value={formikLifeA.values.Business}
                                    >
                                        <option value="">Select</option>
                                        <option value="srilanka">Agriculture</option>
                                        <option value="afgan">Developer</option>
                                        <option value="brazil">Driver</option>
                                        <option value="cambodian">Contractor</option>
                                        <option value="denmark">Desk-job</option>
                                        <option value="india">Unemployed</option>
                                        <option value="malya">Business Owner-1</option>
                                        <option value="thai">Homemaker</option>
                                        <option value="us">Retired-3</option>
                                        <option value="malya">Salaried-4</option>
                                        <option value="thai">Self Employed/professonal-5</option>
                                        <option value="us">Others-5</option>
                                    </select>
                                        {formikLifeA.touched.Business && formikLifeA.errors.Business ? (
                                            <div className="text-danger">{formikLifeA.errors.Business}</div>
                                        ) : null}
                                    </div>
    
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="annualIncome">Annual Income<span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            id="annualIncome"
                                            name="annualIncome"
                                            className="form-control"
                                            onChange={formikLifeA.handleChange}
                                            onBlur={formikLifeA.handleBlur}
                                            value={formikLifeA.values.annualIncome}
                                        />
                                        {formikLifeA.touched.annualIncome && formikLifeA.errors.annualIncome ? (
                                            <div className="text-danger">{formikLifeA.errors.annualIncome}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="empname">Employer Name</label>
                                        <input
                                            type="text"
                                            id="empname"
                                            name="empname"
                                            className="form-control"
                                            onChange={formikLifeA.handleChange}
                                            onBlur={formikLifeA.handleBlur}
                                            value={formikLifeA.values.empname}
                                        />
                                        {formikLifeA.touched.empname && formikLifeA.errors.empname ? (
                                            <div className="text-danger">{formikLifeA.errors.empname}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="regnumber">Business Registration Number</label>
                                        <input
                                            type="number"
                                            id="regnumber"
                                            name="regnumber"
                                            className="form-control"
                                            onChange={formikLifeA.handleChange}
                                            onBlur={formikLifeA.handleBlur}
                                            value={formikLifeA.values.empname}
                                        />
                                        {formikLifeA.touched.empname && formikLifeA.errors.empname ? (
                                            <div className="text-danger">{formikLifeA.errors.empname}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="period">Period of Employment/Business<span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            id="period"
                                            name="period"
                                            className="form-control"
                                            onChange={formikLifeA.handleChange}
                                            onBlur={formikLifeA.handleBlur}
                                            value={formikLifeA.values.period}
                                        />
                                        {formikLifeA.touched.period && formikLifeA.errors.period ? (
                                            <div className="text-danger">{formikLifeA.errors.period}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="totalnetworth">Total Net Worth<span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            id="totalnetworth"
                                            name="totalnetworth"
                                            className="form-control"
                                            onChange={formikLifeA.handleChange}
                                            onBlur={formikLifeA.handleBlur}
                                            value={formikLifeA.values.totalnetworth}
                                        />
                                        {formikLifeA.touched.totalnetworth && formikLifeA.errors.totalnetworth ? (
                                            <div className="text-danger">{formikLifeA.errors.totalnetworth}</div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </form>
                </AccordionItem>
    
                <AccordionItem
                        title="Life B: Spouse Details"
                        isOpen={openItem === 'lifeB'}
                        onClick={() => handleAccordionClick('lifeB')}
                        disabled={applicationType === '' || applicationType === 'single life'}
                        >
                        <p>Personal Details</p>
                        <p>Life B as Owner:</p>
                        <form onSubmit={formikLifeB.handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="relationship">Relationship to proposed Insured<span className="text-danger">*</span></label>
                                    <select id="relationship"  type="text" name="relationship" className="form-control" 
                                    onBlur={formikLifeB.handleBlur} 
                                    onChange={formikLifeB.handleChange}
                                    >
                                        <option value="">Select</option>
                                        <option value="Husband">Husband</option>
                                        <option value="Wife">Wife</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {formikLifeB.touched.relationship && formikLifeB.errors.relationship ? (
                                        <div className="text-danger">{formikLifeB.errors.relationship}</div>
                                    ) : null}
                                </div>
                                
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="title">Title<span className="text-danger">*</span></label>
                                    <select
                                        id="title"
                                        name="title"
                                        className="form-control"
                                        onChange={formikLifeB.handleChange}
                                        onBlur={formikLifeB.handleBlur}
                                        value={formikLifeB.values.title}
                                    >
                                        <option value="">Select</option>
                                        <option value="mr">Mr.</option>
                                        <option value="mrs">Mrs.</option>
                                        <option value="miss">Miss</option>
                                        <option value="ms">Ms.</option>
                                        <option value="dr">Dr.</option>
                                    </select>
                                    {formikLifeB.touched.title && formikLifeB.errors.title ? (
                                        <div className="text-danger">{formikLifeB.errors.title}</div>
                                    ) : null}
                                </div>
    
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="firstName">First Name<span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        className="form-control"
                                        onChange={formikLifeB.handleChange}
                                        onBlur={formikLifeB.handleBlur}
                                        value={formikLifeB.values.firstName}
                                    />
                                    {formikLifeB.touched.firstName && formikLifeB.errors.firstName ? (
                                        <div className="text-danger">{formikLifeB.errors.firstName}</div>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="middleName">Middle Name:</label>
                                    <input
                                        type="text"
                                        id="middleName"
                                        name="middleName"
                                        className="form-control"
                                        onChange={formikLifeB.handleChange}
                                        onBlur={formikLifeB.handleBlur}
                                        value={formikLifeB.values.middleName}
                                    />
                                    {formikLifeB.touched.middleName && formikLifeB.errors.middleName ? (
                                        <div className="text-danger">{formikLifeB.errors.middleName}</div>
                                    ) : null}
                                </div>
                                    
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="lastName">Last Name<span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        className="form-control"
                                        onChange={formikLifeB.handleChange}
                                        onBlur={formikLifeB.handleBlur}
                                        value={formikLifeB.values.lastName}
                                    />
                                    {formikLifeB.touched.lastName && formikLifeB.errors.lastName ? (
                                        <div className="text-danger">{formikLifeB.errors.lastName}</div>
                                    ) : null}
                                </div>
    
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="ssn">Social Security Number<span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        id="ssnB"
                                        name="ssn"
                                        className="form-control"
                                        onChange={(e) => handleSSNChange(e, formikLifeB)}
                                        onBlur={formikLifeB.handleBlur}
                                        value={formikLifeB.values.ssn}
                                        maxLength="11"
                                    />
                                    {formikLifeB.touched.ssn && formikLifeB.errors.ssn ? (
                                        <div className="text-danger">{formikLifeB.errors.ssn}</div>
                                    ) : null}
                                </div>
    
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="dob">Date of Birth<span className="text-danger">*</span></label>
                                    <input
                                        type="date"
                                        id="dob"
                                        name="dob"
                                        className="form-control"
                                        onChange={(e) => handleDobChange(e, 'lifeB')}
                                        onBlur={formikLifeB.handleBlur}
                                        value={formikLifeB.values.dob}
                                    />
                                    {formikLifeB.touched.dob && formikLifeB.errors.dob ? (
                                        <div className="text-danger">{formikLifeB.errors.dob}</div>
                                    ) : null}
                                </div>
    
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="age">Age<span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        id="age"
                                        name="age"
                                        className="form-control"
                                        onChange={formikLifeB.handleChange}
                                        onBlur={formikLifeB.handleBlur}
                                        value={formikLifeB.values.age}
                                    />
                                    {formikLifeB.touched.age && formikLifeB.errors.age ? (
                                        <div className="text-danger">{formikLifeB.errors.age}</div>
                                    ) : null}
                                </div>
    
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="height">Height<span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        id="height"
                                        name="height"
                                        className="form-control"
                                        onChange={formikLifeB.handleChange}
                                        value={formikLifeB.values.height}
                                    />
                                    {formikLifeB.errors.height && formikLifeB.touched.height ? (
                                        <div className="text-danger">{formikLifeB.errors.height}</div>
                                    ) : null}
                                </div>
    
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="weight">Weight<span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        id="weight"
                                        name="weight"
                                        className="form-control"
                                        onChange={formikLifeB.handleChange}
                                        value={formikLifeB.values.weight}
                                    />
                                    {formikLifeB.errors.weight && formikLifeB.touched.weight ? (
                                        <div className="text-danger">{formikLifeB.errors.weight}</div>
                                    ) : null}
                                </div>
    
                                <div className="col-md-6 mb-3">
                                    <label>Gender<span className="text-danger">*</span></label>
                                    <div className='d-flex justify-content-between'>
                                        <div className="form-check">
                                            <input
                                                type="radio"
                                                id="male"
                                                name="gender"
                                                value="male"
                                                className="form-check-input"
                                                onChange={formikLifeB.handleChange}
                                                onBlur={formikLifeB.handleBlur}
                                                checked={formikLifeB.values.gender === 'male'}
                                            />
                                            <label htmlFor="male" className="form-check-label">Male</label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                type="radio"
                                                id="female"
                                                name="gender"
                                                value="female"
                                                className="form-check-input"
                                                onChange={formikLifeB.handleChange}
                                                onBlur={formikLifeB.handleBlur}
                                                checked={formikLifeB.values.gender === 'female'}
                                            />
                                            <label htmlFor="female" className="form-check-label">Female</label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                type="radio"
                                                id="other"
                                                name="gender"
                                                value="other"
                                                className="form-check-input"
                                                onChange={formikLifeB.handleChange}
                                                onBlur={formikLifeB.handleBlur}
                                                checked={formikLifeB.values.gender === 'other'}
                                            />
                                            <label htmlFor="other" className="form-check-label">Other</label>
                                        </div>
                                    </div>
                                    {formikLifeB.touched.gender && formikLifeB.errors.gender ? (
                                        <div className="text-danger">{formikLifeB.errors.gender}</div>
                                    ) : null}
                                </div>
    
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="maritalStatus">Marital Status<span className="text-danger">*</span></label>
                                    <select
                                        id="maritalStatus"
                                        name="maritalStatus"
                                        className="form-control"
                                        onChange={formikLifeB.handleChange}
                                        onBlur={formikLifeB.handleBlur}
                                        value={formikLifeB.values.maritalStatus}
                                    >
                                        <option value="">Select</option>
                                        <option value="single">Single</option>
                                        <option value="married">Married</option>
                                        <option value="divorced">Divorced</option>
                                        <option value="widowed">Widowed</option>
                                    </select>
                                    {formikLifeB.touched.maritalStatus && formikLifeB.errors.maritalStatus ? (
                                        <div className="text-danger">{formikLifeB.errors.maritalStatus}</div>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="nationality">Nationality</label>
                                    <select
                                        id="nationality"
                                        name="nationality"
                                        className="form-control"
                                        onChange={formikLifeB.handleChange}
                                        onBlur={formikLifeB.handleBlur}
                                        value={formikLifeB.values.nationality}
                                    >
                                        <option value="">Select</option>
                                        <option value="srilankan">Srilankan</option>
                                        <option value="afgan">Afgan</option>
                                        <option value="brazilian">Brazilian</option>
                                        <option value="cambodian">Cambodian</option>
                                        <option value="danish">Danish</option>
                                        <option value="indian">Indian</option>
                                        <option value="malaysian">Malaysian</option>
                                        <option value="thai">Thai</option>
                                        <option value="american">American</option>
                                    </select>
                                    {formikLifeB.touched.nationality && formikLifeB.errors.nationality ? (
                                        <div className="text-danger">{formikLifeB.errors.nationality}</div>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="countryofbirth">Country of Birth</label>
                                    <select
                                        id="countryofbirth"
                                        name="nationcountryofbirthality"
                                        className="form-control"
                                        onChange={formikLifeB.handleChange}
                                        onBlur={formikLifeB.handleBlur}
                                        value={formikLifeB.values.countryofbirth}
                                    >
                                        <option value="">Select</option>
                                        <option value="srilankan">Srilankan</option>
                                        <option value="afgan">Afgan</option>
                                        <option value="brazilian">Brazilian</option>
                                        <option value="cambodian">Cambodian</option>
                                        <option value="danish">Danish</option>
                                        <option value="indian">Indian</option>
                                        <option value="malaysian">Malaysian</option>
                                        <option value="thai">Thai</option>
                                        <option value="american">American</option>
                                    </select>
                                    {formikLifeB.touched.countryofbirth && formikLifeB.errors.countryofbirth ? (
                                        <div className="text-danger">{formikLifeB.errors.countryofbirth}</div>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="countryofResidence">Country of Residence</label>
                                    <select
                                        id="countryofResidence"
                                        name="countryofResidence"
                                        className="form-control"
                                        onChange={formikLifeB.handleChange}
                                        onBlur={formikLifeB.handleBlur}
                                        value={formikLifeB.values.countryofResidence}
                                    >
                                        <option value="">Select</option>
                                        <option value="srilanka">Srilankan</option>
                                        <option value="afgan">Afgan</option>
                                        <option value="brazil">Brazil</option>
                                        <option value="cambodian">Cambodian</option>
                                        <option value="denmark">Denmark</option>
                                        <option value="india">Indian</option>
                                        <option value="malya">Malaysian</option>
                                        <option value="thai">Thailand</option>
                                        <option value="us">US</option>
                                    </select>
                                    {formikLifeB.touched.countryofResidence && formikLifeB.errors.countryofResidence ? (
                                        <div className="text-danger">{formikLifeB.errors.countryofResidence}</div>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="religion">Religion</label>
                                    <select
                                        id="religion"
                                        name="religion"
                                        className="form-control"
                                        onChange={formikLifeB.handleChange}
                                        onBlur={formikLifeB.handleBlur}
                                        value={formikLifeB.values.religion}
                                    >
                                        <option value="">Select</option>
                                        <option value="hindu">Hindu</option>
                                        <option value="muslim">Muslim</option>
                                        <option value="sikh">Sikh</option>
                                        <option value="christian">Christian</option>
                                    </select>
                                    {formikLifeA.touched.religion && formikLifeA.errors.religion ? (
                                        <div className="text-danger">{formikLifeA.errors.religion}</div>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="preferredlang">Preferred language</label>
                                    <select
                                        id="preferredlang"
                                        name="preferredlang"
                                        className="form-control"
                                        onChange={formikLifeB.handleChange}
                                        onBlur={formikLifeB.handleBlur}
                                        value={formikLifeB.values.preferredlang}
                                    >
                                        <option value="">Select</option>
                                        <option value="english">English</option>
                                        <option value="spanish">Spanish</option>
                                        <option value="chinese">Chinese</option>
                                    </select>
                                    {formikLifeB.touched.preferredlang && formikLifeB.errors.preferredlang ? (
                                        <div className="text-danger">{formikLifeB.errors.preferredlang}</div>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="prefferedcontactmode">Preferred Contact Mode</label>
                                    <select
                                        id="prefferedcontactmode"
                                        name="prefferedcontactmode"
                                        className="form-control"
                                        onChange={formikLifeB.handleChange}
                                        onBlur={formikLifeB.handleBlur}
                                        value={formikLifeB.values.prefferedcontactmode}
                                    >
                                        <option value="">Select</option>
                                        <option value="post">Postal</option>
                                        <option value="mail">Email</option>
                                        <option value="tele">Telephone</option>
                                        <option value="sms">SMS</option>
                                    </select>
                                    {formikLifeB.touched.prefferedcontactmode && formikLifeB.errors.prefferedcontactmode ? (
                                        <div className="text-danger">{formikLifeB.errors.prefferedcontactmode}</div>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="objectiveofinsurance">Objective of Insurance</label>
                                    <select
                                        id="objectiveofinsurance"
                                        name="objectiveofinsurance"
                                        className="form-control"
                                        onChange={formikLifeB.handleChange}
                                        onBlur={formikLifeB.handleBlur}
                                        value={formikLifeB.values.objectiveofinsurance}
                                    >
                                        <option value="">Select</option>
                                        <option value="plan">Protection Plan</option>
                                        <option value="savings">Savings</option>
                                        <option value="education">Education</option>
                                        <option value="annuity">Annuity</option>
                                        <option value="pension">Pension</option>
                                        <option value="loan">Loan</option>
                                        <option value="asssignment">Assignment</option>
                                        <option value="mortgage">Mortgage</option>
                                    </select>
                                    {formikLifeB.touched.objectiveofinsurance && formikLifeB.errors.objectiveofinsurance ? (
                                        <div className="text-danger">{formikLifeB.errors.objectiveofinsurance}</div>
                                    ) : null}
                                </div>
    
                                <div className="col-md-6 mb-3">
                                    <label>Do you consume alcohol?</label>
                                    <div className='d-flex'>
                                        <div className="form-check">
                                            <input type="radio" id="alcohol-yes" name="alcohol" value="yes" className="form-check-input" onChange={formikLifeB.handleChange} checked={formikLifeB.values.alcohol === 'yes'} />
                                            <label htmlFor="alcohol-yes" className="form-check-label">Yes</label>
                                        </div>
                                        <div className="form-check">
                                            <input type="radio" id="alcohol-no" name="alcohol" value="no" className="form-check-input" onChange={formikLifeB.handleChange} checked={formikLifeB.values.alcohol === 'no'} />
                                            <label htmlFor="alcohol-no" className="form-check-label">No</label>
                                        </div>
                                    </div>
                                    {formikLifeB.errors.alcohol && formikLifeB.touched.alcohol ? <div className="text-danger">{formikLifeB.errors.alcohol}</div> : null}
                                </div>
    
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="tobacco">Do you consume tobacco?<span className="text-danger">*</span></label>
                                    <div className='d-flex'>
                                        <div className="form-check">
                                            <input type="radio" id="tobacco-yes" name="tobacco" value="yes" className="form-check-input" onChange={formikLifeB.handleChange} checked={formikLifeB.values.tobacco === 'yes'} />
                                            <label htmlFor="tobacco-yes" className="form-check-label">Yes</label>
                                        </div>
                                        <div className="form-check">
                                            <input type="radio" id="tobacco-no" name="tobacco" value="no" className="form-check-input" onChange={formikLifeB.handleChange} checked={formikLifeB.values.tobacco === 'no'} />
                                            <label htmlFor="tobacco-no" className="form-check-label">No</label>
                                        </div>
                                    </div>
                                    {formikLifeB.touched.tobacco && formikLifeB.errors.tobacco ? (
                                        <div className="text-danger">{formikLifeB.errors.tobacco}</div>
                                    ) : null}
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="citizen">Are you a citizen of USA?<span className="text-danger">*</span></label>
                                    <div className="d-flex">
                                        <div className="form-check">
                                            <input
                                                type="radio"
                                                id="citizen-yes"
                                                name="citizen"
                                                value="yes"
                                                className="form-check-input"
                                                onChange={handleCitizenshipChangeB}
                                                checked={formikLifeB.values.citizen === 'yes'}
                                            />
                                            <label htmlFor="citizen-yes" className="form-check-label">Yes</label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                type="radio"
                                                id="citizen-no"
                                                name="citizen"
                                                value="no"
                                                className="form-check-input"
                                                onChange={handleCitizenshipChangeB}
                                                checked={formikLifeB.values.citizen === 'no'}
                                            />
                                            <label htmlFor="citizen-no" className="form-check-label">No</label>
                                        </div>
                                    </div>
                                    {formikLifeB.touched.citizen && formikLifeB.errors.citizen ? (
                                        <div className="text-danger">{formikLifeB.errors.citizen}</div>
                                    ) : null}

                                    {isCitizenB === 'no' && (
                                        <div className="mt-3">
                                            <label htmlFor="dateOfEntry">Date of Entry in USA<span className="text-danger">*</span></label>
                                            <input
                                                type="date"
                                                id="dateOfEntry"
                                                name="dateOfEntry"
                                                className="form-control"
                                                onChange={formikLifeB.handleChange}
                                                value={formikLifeB.values.dateOfEntry}
                                            />
                                            {formikLifeB.touched.dateOfEntry && formikLifeB.errors.dateOfEntry ? (
                                                <div className="text-danger">{formikLifeB.errors.dateOfEntry}</div>
                                            ) : null}

                                            <label htmlFor="visaType" className="mt-3">Visa Type<span className="text-danger">*</span></label>
                                            <select
                                                id="visaType"
                                                name="visaType"
                                                className="form-control"
                                                onChange={formikLifeB.handleChange}
                                                value={formikLifeB.values.visaType}
                                            >
                                                <option value="">Select Visa Type</option>
                                                <option value="B1">B1</option>
                                                <option value="P">P</option>
                                                <option value="H1B1">H1B1</option>
                                                <option value="D">D</option>
                                                <option value="A">A</option>
                                            </select>
                                            {formikLifeB.touched.visaType && formikLifeB.errors.visaType ? (
                                                <div className="text-danger">{formikLifeB.errors.visaType}</div>
                                            ) : null}
                                        </div>
                                    )}
                                </div>

                                <p>Occupation Details</p>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="occupation">Occupation<span className="text-danger">*</span></label>
                                        <select
                                        id="occupation"
                                        name="occupation"
                                        className="form-control"
                                        onChange={formikLifeB.handleChange}
                                        onBlur={formikLifeB.handleBlur}
                                        value={formikLifeB.values.occupation}
                                    >
                                        <option value="">Select</option>
                                        <option value="srilanka">Agriculture</option>
                                        <option value="afgan">Developer</option>
                                        <option value="brazil">Driver</option>
                                        <option value="cambodian">Contractor</option>
                                        <option value="denmark">Desk-job</option>
                                        <option value="india">Unemployed</option>
                                        <option value="malya">Business Owner-1</option>
                                        <option value="thai">Homemaker</option>
                                        <option value="us">Retired-3</option>
                                        <option value="malya">Salaried-4</option>
                                        <option value="thai">Self Employed/professonal-5</option>
                                        <option value="us">Others-5</option>
                                    </select>
                                        {formikLifeB.touched.occupation && formikLifeB.errors.occupation ? (
                                            <div className="text-danger">{formikLifeB.errors.occupation}</div>
                                        ) : null}
                                    </div>
    
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="occupationClass">Occupation Class<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            id="occupationClass"
                                            name="occupationClass"
                                            className="form-control"
                                            onChange={formikLifeB.handleChange}
                                            onBlur={formikLifeB.handleBlur}
                                            value={formikLifeB.values.occupationClass}
                                        />
                                        {formikLifeB.touched.occupationClass && formikLifeB.errors.occupationClass ? (
                                            <div className="text-danger">{formikLifeB.errors.occupationClass}</div>
                                        ) : null}
                                    </div>
    
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="annualIncome">Annual Income<span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            id="annualIncome"
                                            name="annualIncome"
                                            className="form-control"
                                            onChange={formikLifeB.handleChange}
                                            onBlur={formikLifeB.handleBlur}
                                            value={formikLifeB.values.annualIncome}
                                        />
                                        {formikLifeB.touched.annualIncome && formikLifeB.errors.annualIncome ? (
                                            <div className="text-danger">{formikLifeB.errors.annualIncome}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="empname">Employer Name</label>
                                        <input
                                            type="text"
                                            id="empname"
                                            name="empname"
                                            className="form-control"
                                            onChange={formikLifeA.handleChange}
                                            onBlur={formikLifeA.handleBlur}
                                            value={formikLifeA.values.empname}
                                        />
                                        {formikLifeB.touched.empname && formikLifeB.errors.empname ? (
                                            <div className="text-danger">{formikLifeB.errors.empname}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="regnumber">Business Registration Number</label>
                                        <input
                                            type="number"
                                            id="regnumber"
                                            name="regnumber"
                                            className="form-control"
                                            onChange={formikLifeB.handleChange}
                                            onBlur={formikLifeB.handleBlur}
                                            value={formikLifeB.values.empname}
                                        />
                                        {formikLifeB.touched.empname && formikLifeB.errors.empname ? (
                                            <div className="text-danger">{formikLifeB.errors.empname}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="period">Period of Employment/Business<span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            id="period"
                                            name="period"
                                            className="form-control"
                                            onChange={formikLifeB.handleChange}
                                            onBlur={formikLifeB.handleBlur}
                                            value={formikLifeB.values.period}
                                        />
                                        {formikLifeB.touched.period && formikLifeB.errors.period ? (
                                            <div className="text-danger">{formikLifeB.errors.period}</div>
                                        ) : null}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="totalnetworth">Total Net Worth<span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            id="totalnetworth"
                                            name="totalnetworth"
                                            className="form-control"
                                            onChange={formikLifeB.handleChange}
                                            onBlur={formikLifeB.handleBlur}
                                            value={formikLifeB.values.totalnetworth}
                                        />
                                        {formikLifeB.touched.totalnetworth && formikLifeB.errors.totalnetworth ? (
                                            <div className="text-danger">{formikLifeB.errors.totalnetworth}</div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </form>
                </AccordionItem>
    
                <AccordionItem
                        title="Life C: N/A"
                        isOpen={openItem === 'lifeC'}
                        onClick={() => handleAccordionClick('lifeC')}
                        disabled={applicationType === '' || applicationType === 'single life'}
                        >
                        <p>No content for Life C at the moment.</p>
                </AccordionItem>
    
                <div className="col-md-12 text-center mt-3 mb-3">
                    <button type="submit"  className="btn btn-primary">Submit</button>
                </div>
    
                {formErrors.general && (
                    <div className="text-danger mt-3 mb-3">{formErrors.general}</div>
                )}
            </div>
            
        </div>
      );
    };
    
    export default EappPersonalDetail;