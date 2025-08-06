import React, { useState, useEffect, useLayoutEffect } from 'react';
import { saveDetail, updateDetailById, findRecordById } from '../../db/indexedDB';
import './Customerdetails.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { customerResponse, updateCustomerResponse } from './CustomerService';
import Loader from "react-spinner-loader";
import { Modal, Form, Button } from 'react-bootstrap';
import SidebarLayout from '../../components/Dashboard/Template';

const calculateAge = (birthDateString) => {
  if (!birthDateString) return '';

  let birthDate;

  // Check if the format is YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(birthDateString)) {
    birthDate = new Date(birthDateString);
  }
  // Handle DD-MM-YYYY or D-M-YYYY format
  else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(birthDateString)) {
    const [day, month, year] = birthDateString.split('-').map(num => parseInt(num, 10));
    birthDate = new Date(year, month - 1, day); // JS months are 0-based
  }
  else {
    console.error("Invalid DOB format:", birthDateString);
    return '';
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  // Adjust if the birthday hasn't occurred yet this year
  if (
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

const CustomerDetailsForm = () => {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [clientDetails, setClientDetails] = useState('');
  const location = useLocation();
  const { customerData, leadId, source } = location.state || {};

  // Get clientId and agentId from sessionStorage
  const clientId = sessionStorage.getItem('clientId');
  const agentId = sessionStorage.getItem('agentId');
  const isNewCustomer = sessionStorage.getItem('isNewCustomer');

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Add a ref to track post-submit navigation
  const [postSubmitNav, setPostSubmitNav] = useState(null);


  useEffect(() => {
    console.log('useEffect triggered with:', { clientId, leadId, isNewCustomer, source, customerData });

    if (isNewCustomer) {
      if (clientId) {
        const fetchData = async () => {
          try {
            const customerData = await findRecordById('al_client_details', clientId);
            if (customerData && customerData.result) {
              formik.resetForm({
                values: {
                  ...formik.initialValues,
                  ...customerData.result
                }
              });
            }
          } catch (error) {
            console.error('Error fetching data from IndexedDB:', error);
          }
        };
        fetchData();
      } else if (source === 'API' && leadId) {
        const nameWithInitials = `${customerData?.firstName || ''} ${customerData?.lastName || ''}`;
        const dob = customerData?.dob || '';
        const formattedDOB = formatDateToYMD(dob); // Format to YYYY-MM-DD
        const age = dob ? calculateAge(dob) : ''; // Calculate age

        formik.resetForm({
          values: {
            ...formik.initialValues,
            nameWithInitials: nameWithInitials,
            title: customerData?.title || '',
            firstName: customerData?.firstName || '',
            lastName: customerData?.lastName || '',
            emailId: customerData?.email || '',
            mobile: customerData?.mobile || '',
            // dateOfBirth: formatDateToYMD(customerData?.dob || ''),
            dateOfBirth: formattedDOB,
            age: age,  // Set calculated age
            gender: customerData?.gender || '',
            maritalStatus: customerData?.maritalStatus || '',
            occupation: customerData?.occupation || '',
            income: customerData?.income || '',
            state: customerData?.state || '',
            city: customerData?.city || '',
            pinCode: customerData?.pinCode || '',
            source: customerData?.source || '',
            productInterest: (customerData?.productInterest || []).join(', '),
          }
        });
      }
    } else {
      // Reset for new customer
      formik.resetForm({
        values: formik.initialValues
      });
    }

    const handleResize = () => {
      const viewportHeight = window.visualViewport.height;
      const screenHeight = window.screen.height;

      // If viewport height is significantly less than screen height, keyboard is likely open
      setIsKeyboardVisible(viewportHeight < screenHeight * 0.85);
    };

    handleResize();
    console.log('Formik errors:', formik.errors);
    window.visualViewport.addEventListener("resize", handleResize);
    return () => {
      window.visualViewport.removeEventListener("resize", handleResize);
    };
  }, [clientId, leadId, isNewCustomer, source, customerData]);

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),

    nameWithInitials: Yup.string()
      .required('Name with initials is required')
      .matches(/^([a-zA-Z]+\s)*([a-zA-Z]+)$/, 'Name with Initials must only contain letters')
      .max(30, 'Name with Initials cannot exceed 30 characters'),

    firstName: Yup.string()
      .max(30, 'First Name cannot be longer than 30 characters')
      .matches(/^([a-zA-Z]+\s)*([a-zA-Z]+)$/, 'First Name must only contain letters')
      .required('First Name is required'),

    lastName: Yup.string()
      .max(30, 'Last Name cannot be longer than 30 characters')
      .matches(/^([a-zA-Z]+\s)*([a-zA-Z]+)$/, 'Last Name must only contain letters')
      .required('Last Name is required'),

    mobile: Yup.string()
      .matches(/^\d{10}$/, "Mobile number must be exactly 10 digits")
      .required("Mobile No is required"),

    emailId: Yup.string()
      .matches(
        /^[^\s][a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid Email "
      )
      .required("Email is required"),

    dateOfBirth: Yup.date()
      .required('Date of Birth is required')
      .max(new Date(), 'Date of Birth cannot be in the future!')
      .test('dob', 'You must be between 18 to 80 years old!', function (value) {
        const today = new Date();
        const minDate = new Date(today.getFullYear() - 80, today.getMonth(), today.getDate());
        const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        return value <= maxDate && value >= minDate;
      }),

    occupation: Yup.string()
      // .matches(/^([a-zA-Z]+\s)*([a-zA-Z]+)$/,  'Occupation must contain only letters')
      .required('Occupation is required'),

    gender: Yup.string().required('Gender is required'),

    maritalStatus: Yup.string().required('Marital status is required'),

    state: Yup.string()
      .matches(/^([a-zA-Z]+\s)*([a-zA-Z]+)$/, 'State must only contain letters')
      .required('State is required'),

    city: Yup.string()
      .matches(/^([a-zA-Z]+\s)*([a-zA-Z]+)$/, 'City must only contain letters')
      .required('City is required'),

    pinCode: Yup.string()
      .required('PinCode is required')
      .matches(/^\d+$/, 'PinCode must contain only numbers'),

    income: Yup.string()
      .required('Annual Income is required')
      .matches(/^\d+$/, 'Annual Income must contain only numbers'),

    source: Yup.string()
      .matches(/^([a-zA-Z]+\s)*([a-zA-Z]+)$/, 'Source must only contain letters')
      .required('Source is required'),

    productInterest: Yup.string().required('Product Interest is required'),
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      nameWithInitials: '',
      firstName: '',
      lastName: '',
      mobile: '',
      emailId: '',
      dateOfBirth: '',
      gender: '',
      maritalStatus: '',
      age: '',
      occupation: '',
      income: '',
      state: '',
      city: '',
      pinCode: '',
      source: '',
      productInterest: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      sessionStorage.setItem("ClientEmailId", values.emailId)
      sessionStorage.setItem('ClientMobileNo', values.mobile)
      sessionStorage.setItem('ClientCity', values.city)
      sessionStorage.setItem('Clientpincode', values.pinCode)
      setLoader(true);  // Start the loader
      console.log('Form submitted with values:', values);

      // Check if required fields are filled
      const requiredFields = [
        'title', 'nameWithInitials', 'firstName', 'lastName', 'mobile',
        'emailId', 'dateOfBirth', 'gender', 'maritalStatus', 'age',
        'occupation', 'income', 'state', 'city', 'pinCode', 'source', 'productInterest'
      ];

      const emptyFields = requiredFields.filter(field => !values[field]);

      if (emptyFields.length > 0) {
        setLoader(false);  // Stop loader if fields are empty
        setClientDetails("Please fill all required fields");  // Error message
        setModalShow(true);  // Show modal
        return;
      }

      let newClientId = clientId || `CL${Date.now()}`;

      if (!clientId) {
        console.log("Generated new client_id:", newClientId);
        sessionStorage.setItem('clientId', newClientId);
      } else {
        console.log("Using existing client_id from context:", newClientId);
      }

      const backendData = {
        name: {
          first: values.firstName,
          last: values.lastName,
          title: values.title,
          middle: values.middle,
        },
        email: values.emailId,
        mobile: values.mobile,
        source: values.source,
        assignedAgentDetails: [
          {
            agentId: agentId,
          }
        ],
        segmentation: {
          demographics: {
            dob: values.dateOfBirth,
            gender: values.gender,
            income: values.income.toString(),
            maritalStatus: values.maritalStatus,
            occupation: values.occupation
          },
          geographic: {
            state: values.state,
            city: values.city,
            pinCode: values.pinCode
          },
          productInterest: values.productInterest.split(",").map((item) => item.trim()),
        }
      };

      try {
        // Try to find existing client details in IndexedDB
        let existingClientDetails;
        try {
          existingClientDetails = await findRecordById("al_client_details", newClientId);
        } catch (error) {
          console.warn("No existing record found, proceeding to save new client details.");
          existingClientDetails = null;
        }

        const clientDetails = {
          client_id: newClientId,
          agentId: agentId,
          leadId: existingClientDetails?.result?.leadId || "", // Preserve leadId if exists
          status: "Customer",
          ...values, // Add form values
        };

        if (existingClientDetails) {
          console.log("Existing record found. Updating client details in IndexedDB...");

          // Update the existing record in IndexedDB
          await updateDetailById("al_client_details", newClientId, clientDetails);
          console.log("Client details updated successfully in IndexedDB!", clientDetails);

          // Update the backend using the existing leadId
          if (clientDetails.leadId) {
            const updateResponse = await updateCustomerResponse(backendData, clientDetails.leadId);
            console.log("Lead updated successfully:", updateResponse);
          }
        } else {
          console.log("No existing record found. Saving new client details...");

          // Save new client details in IndexedDB
          await saveDetail("al_client_details", clientDetails);
          console.log("New client details saved successfully in IndexedDB!", clientDetails);

          // Create a new lead in the backend
          const apiResponse = await customerResponse(backendData);
          console.log("Backend response:", apiResponse);

          const leadId = apiResponse?.leadId || "";

          const setLeadID = sessionStorage.setItem('setLeadID', leadId)
          console.log("setLeadID-->", setLeadID)

          if (!leadId) {
            console.error("Lead ID not found in API response!");
            throw new Error("Failed to create lead ID");
          }

          // Update IndexedDB with the new leadId
          clientDetails.leadId = leadId;

          await updateDetailById("al_client_details", newClientId, clientDetails);
          console.log("Updated data with leadId saved successfully to IndexedDB!", clientDetails);
        }

        // Added for Quotation Personal details case submitted
        sessionStorage.removeItem("Submitted");
        sessionStorage.removeItem("personID");

        if (isNewCustomer) {
          sessionStorage.removeItem("fnaId");
          console.log("fnaId removed from sessionStorage for new customer.");
        }

        // Handle post-submit navigation
        if (postSubmitNav === 'needsCalculator') {
          setPostSubmitNav(null);
          navigate('/needs-calculator');
        } else if (postSubmitNav === 'fna') {
          setPostSubmitNav(null);
          navigate_to_FNA();
        } else {
          navigate_to_sqsdetails();
        }
      } catch (error) {
        console.error("Error processing customer details:", error.message);

        // Set an error message and show a modal
        setClientDetails("An error occurred. Please check the details and try again." || error.message);
        setModalShow(true);
      }
      finally {
        setLoader(false); // Stop the loader
      }
    }
  });

  const formatDateToYMD = (dateString) => {
    // Check if the date string is in a valid format (e.g., 'dd-mm-yyyy')
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [day, month, year] = parts; // Destructure parts for clarity

      // Validate day, month, year format and range
      if (
        !isNaN(day) && !isNaN(month) && !isNaN(year) &&
        +day > 0 && +day <= 31 &&
        +month > 0 && +month <= 12 &&
        +year.length === 4
      ) {
        return `${year}-${month}-${day}`; // Return as yyyy-MM-dd
      }
    }

    // If validation fails, return original or a default date
    console.warn('Invalid date format:', dateString);
    return dateString; // Or return a default date like 'yyyy-MM-dd'
  };

  const formattedProduct_interest = formik.values.productInterest;
  const handleProduct_interestChange = (e) => {
    const value = e.target.value;
    const productInterestArray = value.split(',').map(item => item.trim());
    formik.setFieldValue("productInterest", productInterestArray.join(", "));
  };

  const handleDateOfBirthChange = (e) => {
    const dob = e.target.value;
    formik.setFieldValue('dateOfBirth', dob);
    const age = calculateAge(dob);
    formik.setFieldValue('age', age);

    if (age > 80) {
      formik.setFieldError('age', 'Age cannot be more than 80 years old');
    } else if (age < 18) {
      formik.setFieldError('age', 'Age must be at least 18 years old');
    } else {
      formik.setFieldError('age', '');
    }
  };

  const navigate_to_summary = () => {
    navigate('/customer-summary');
  };

  const navigate_to_sqsdetails = () => {
    navigate('/sqs_personal_detail');
  };

  const navigate_to_FNA = () => {
    navigate('/fnapersonaldetails');
  };


  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
    document.body.classList.add("ios-safearea");
  } else {
    document.body.classList.remove("ios-safearea");
  }


  return (
    <SidebarLayout>
      <div className="customer-container d-flex flex-column" >
        {/* <h5>Personal Details</h5> */}
        <div className="customer-form flex-grow-1">
          <form onSubmit={formik.handleSubmit} className="customerform">
            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label htmlFor="title">
                  Title<span className="text-danger">*</span>
                </label>
                <select
                  id="title"
                  name="title"
                  className="form-control"
                  onChange={(e) => {
                    const selectedTitle = e.target.value;
                    formik.handleChange(e); // Update the title field
                    // Map gender based on title
                    if (selectedTitle === 'mr' || selectedTitle === 'dr') {
                      formik.setFieldValue('gender', 'male');
                    } else if (['mrs', 'miss', 'ms', 'drmiss', 'drmrs'].includes(selectedTitle)) {
                      formik.setFieldValue('gender', 'female');
                    } else {
                      formik.setFieldValue('gender', ''); // Clear gender if 'dr' or none selected
                    }
                  }}
                  onBlur={formik.handleBlur}
                  value={formik.values.title}
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
                {formik.touched.title && formik.errors.title ? (
                  <div className="text-danger">{formik.errors.title}</div>
                ) : null}
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="nameWithInitials">Name with Initials<span className="text-danger">*</span></label>
                <input
                  type="text"
                  id="nameWithInitials"
                  name="nameWithInitials"
                  className="form-control"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.nameWithInitials}
                />
                {formik.touched.nameWithInitials && formik.errors.nameWithInitials ? (
                  <div className="text-danger">{formik.errors.nameWithInitials}</div>
                ) : null}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label htmlFor="firstName">First Name<span className="text-danger">*</span></label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="form-control"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.firstName}
                />
                {formik.touched.firstName && formik.errors.firstName ? (
                  <div className="text-danger">{formik.errors.firstName}</div>
                ) : null}
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="lastName">Last Name<span className="text-danger">*</span></label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="form-control"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.lastName}
                />
                {formik.touched.lastName && formik.errors.lastName ? (
                  <div className="text-danger">{formik.errors.lastName}</div>
                ) : null}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label>Email<span className="text-danger">*</span></label>
                <input
                  type="text"
                  id="emailId"
                  name="emailId"
                  className="form-control"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.emailId}
                />
                {formik.touched.emailId && formik.errors.emailId ? (
                  <div className="text-danger">{formik.errors.emailId}</div>
                ) : null}
              </div>

              <div className="col-md-6 mb-3">
                <label>Mobile No<span className="text-danger">*</span></label>
                <input
                  type="number"
                  id="mobile"
                  name="mobile"
                  className="form-control"
                  onChange={(e) => {
                    const value = e.target.value;
                    formik.setFieldValue("mobile", value); // Store as string
                  }}
                  onBlur={formik.handleBlur}
                  value={formik.values.mobile}
                  maxLength={10}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10); // Removes non-numeric characters and limits to 10 digits
                  }}
                />
                {formik.touched.mobile && formik.errors.mobile ? (
                  <div className="text-danger">{formik.errors.mobile}</div>
                ) : null}
              </div>

              <div className="col-md-6 mb-3">
                <label>Source<span className="text-danger">*</span></label>
                <input
                  type="text"
                  id="source"
                  name="source"
                  className="form-control"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.source}
                />
                {formik.touched.source && formik.errors.source ? (
                  <div className="text-danger">{formik.errors.source}</div>
                ) : null}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label htmlFor="dateOfBirth">
                  Date of Birth<span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  className="form-control"
                  onBlur={formik.handleBlur}
                  onChange={handleDateOfBirthChange}
                  value={formik.values.dateOfBirth}
                />
                {formik.touched.dateOfBirth && formik.errors.dateOfBirth ? (
                  <div className="text-danger">{formik.errors.dateOfBirth}</div>
                ) : null}
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="age">
                  Age<span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  className="form-control"
                  onBlur={formik.handleBlur}
                  value={formik.values.age}
                  readOnly
                />
                {formik.touched.age && formik.errors.age ? (
                  <div className="text-danger">{formik.errors.age}</div>
                ) : null}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label htmlFor="maritalStatus">Marital Status<span className="text-danger">*</span></label>
                <select
                  id="maritalStatus"
                  name="maritalStatus"
                  className="form-control"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.maritalStatus}
                >
                  <option value="">Select</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
                {formik.touched.maritalStatus && formik.errors.maritalStatus ? (
                  <div className="text-danger">{formik.errors.maritalStatus}</div>
                ) : null}
              </div>

              <div className="col-md-6 mb-3">
                <label>Gender<span className="text-danger">*</span></label>
                <div className="d-flex justify-content-between">
                  <div className="form-check">
                    <input
                      type="radio"
                      id="male"
                      name="gender"
                      value="male"
                      className="form-check-input"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      checked={formik.values.gender === 'male'}
                      disabled
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
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      checked={formik.values.gender === 'female'}
                      disabled
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
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      checked={formik.values.gender === 'other'}
                      disabled
                    />
                    <label htmlFor="other" className="form-check-label">Other</label>
                  </div>
                </div>
                {formik.touched.gender && formik.errors.gender ? (
                  <div className="text-danger">{formik.errors.gender}</div>
                ) : null}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6  mb-3">
                <label htmlFor="occupation" >Occupation<span className="text-danger">*</span></label>
                <select
                  type="text"
                  className="form-control"
                  id="occupation"
                  name="occupation"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.occupation}
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
                  <option value="Self Employed/professonal-5">
                    Self Employed/professonal-5
                  </option>
                  <option value="Others-5">Others-5</option>
                </select>
                {formik.touched.occupation && formik.errors.occupation ? (
                  <div className="text-danger">{formik.errors.occupation}</div>
                ) : null}
              </div>

              <div className="col-md-6  mb-3">
                <label htmlFor="income" >Annual Income<span className="text-danger">*</span></label>
                <input
                  type="number"
                  className="form-control"
                  id="income"
                  name="income"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.income}
                />
                {formik.touched.income && formik.errors.income ? (
                  <div className="text-danger">{formik.errors.income}</div>
                ) : null}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6  mb-3">
                <label htmlFor="state" >State<span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  id="state"
                  name="state"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.state}
                />
                {formik.touched.state && formik.errors.
                  state ? (
                  <div className="text-danger">{formik.errors.state}</div>
                ) : null}
              </div>

              <div className="col-md-6  mb-3">
                <label htmlFor="city" >City<span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  id="city"
                  name="city"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.city}
                />
                {formik.touched.city && formik.errors.city ? (
                  <div className="text-danger">{formik.errors.city}</div>
                ) : null}
              </div>

            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label htmlFor="pinCode" >PinCode<span className="text-danger">*</span></label>
                <input
                  type="number"
                  className="form-control"
                  id="pinCode"
                  name="pinCode"
                  onChange={(e) => {
                    const value = e.target.value;
                    formik.setFieldValue("pinCode", value); // Store as string
                  }}
                  //onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.pinCode}
                />
                {formik.touched.pinCode && formik.errors.pinCode ? (
                  <div className="text-danger">{formik.errors.pinCode}</div>
                ) : null}
              </div>

              <div className="col-md-6  mb-3">
                <label>Product Interest<span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="productInterest"
                  value={formattedProduct_interest}
                  onChange={handleProduct_interestChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.productInterest && formik.errors.productInterest ? (
                  <div className="text-danger">{formik.errors.productInterest}</div>
                ) : null}
              </div>
            </div>
          </form>
        </div>

        {!isKeyboardVisible && (
          <div className='iosfixednextprevbutton'>
            <div className="fixednextprevbutton d-flex justify-content-between">
              <button
                type="button"
                className="btn btnprev"
                onClick={navigate_to_summary}
              >
                Prev
              </button>
              <button
                type="button"
                className="btn btnprev"
                onClick={() => {
                  setPostSubmitNav('needsCalculator');
                  formik.handleSubmit();
                }}
              >
                Go to Needs Calculator
              </button>
              <button
                className="btn btnprev"
                onClick={() => {
                  setPostSubmitNav('fna');
                  formik.handleSubmit();
                }}
              >
                Go to FNA
              </button>
              <button type="submit" className="btn btnnext" onClick={formik.handleSubmit}>
                Save
              </button>
            </div>
          </div>
        )}

        {/* Loader */}
        {loader && <Loader show={loader} />}

        {/* Modal for showing alert */}
        <Modal
          show={modalShow}
          onHide={() => setModalShow(false)}
        >
          <Modal.Body>{clientDetails}</Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={() => setModalShow(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </SidebarLayout>
  );
};

export default CustomerDetailsForm;
