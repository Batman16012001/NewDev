import React, { useEffect, useState } from "react";
import { useNavigate,useLocation } from 'react-router-dom';
import axios from 'axios';
import { sendDataToBackend, getAuthToken} from './SignUPService';
import './SignUPDetails.css';
import { saveDetail } from '../../db/indexedDB';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const SignUPDetails = () => {
  const navigate = useNavigate();
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const location = useLocation();
  const agentID = location.state?.agentId || sessionStorage.getItem('agentId');

    console.log('agentID:', agentID);

    useEffect(() => {
      fetch('https://restcountries.com/v3.1/all')
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          const countryNames = data.map((country) => country.name.common).sort();
          setCountries(countryNames);
        })
        .catch((error) => {
          console.error('Error fetching countries:', error);
        });
    }, []);

  const formik = useFormik({
    initialValues: {
      title: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      gender: "",
      date_of_birth: "",
      email: "",
      phone: "",
      national_id: "",
      national_id_type: "",
      profile_picture: '',
      address: "",
      city: "",
      state: "",
      country: "",
      zipcode: "",
      license_number: "",
      specialization: "",
      start_date: "",
      end_date: "",
      branch_assigned: "",
      working_channel: ""
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      first_name: Yup.string().required('First Name is required'),
      last_name: Yup.string().required('Last Name is required'),
      gender: Yup.string().required('Gender is required'),
      date_of_birth: Yup.date()
      .required('Date of Birth is required!')
      .max(new Date(), 'Date of Birth cannot be in the future!') // Prevent future date
      .test(
        'dob',
        'You must be between 18 to 80 years old!',
        function (value) {
          const today = new Date();
          const minDate = new Date(today.getFullYear() - 80, today.getMonth(), today.getDate());
          const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
          return value <= maxDate && value >= minDate; // Check if DOB is within the allowed range
        }
      ),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      phone: Yup.string().matches(/^\d+$/, "Phone number is not valid").required('Phone is required'),
      address: Yup.string().required('Address is required'),
      city: Yup.string().required('City is required'),
      state: Yup.string().required('State is required'),
      country: Yup.string().required('Country is required'),
      zipcode: Yup.string().matches(/^\d{5}$/, "Zipcode must be 5 digits").required('Zipcode is required'),
      start_date: Yup.date().required('Start Date is required'),
      specialization: Yup.string().required('Specialization is required'),
      license_number: Yup.string().required('License number is required'),
      end_date: Yup.string(),
      branch_assigned: Yup.string(),
      working_channel: Yup.string()
    }),
    onSubmit: async (values) => {
      
      try {
        const signUPDetail = {
          id: agentID,
          ...values
        };
        // Save data to IndexedDB
        await saveDetail('al_agent_details', signUPDetail);
        console.log("Data saved successfully to IndexedDB!", signUPDetail);

        // Ensure all required fields are included in the backendData object
        const backendData = {
          title: values.title,
          first_name: values.first_name,
          middle_name: values.middle_name,
          last_name: values.last_name,
          gender: values.gender,
          date_of_birth: values.date_of_birth,
          email: values.email,
          phone: values.phone,
          national_id: values.national_id,
          national_id_type: values.national_id_type,
          profile_picture: values.profile_picture,
          address: values.address,
          city: values.city,
          state: values.state,
          country: values.country,
          zipcode: values.zipcode,
          license_number: values.license_number,
          specialization: values.specialization.split(",").map((item) => item.trim()), // Split into an array
          start_date: values.start_date,
          end_date: values.end_date,
          branch_assigned: values.branch_assigned,
          working_channel: values.working_channel
        };
  
        console.log("backendData:", backendData);
  
        const tokenData = await getAuthToken();
        const { access_token: token, token_type } = tokenData;
  
        const apiResponse = await sendDataToBackend(token, token_type, backendData);
        console.log("Backend response:", apiResponse);
  
      } catch (error) {
        console.error("Failed to send data:", error);
      }
    }
  });
  
  const formattedSpecialization = formik.values.specialization; 

  const handleSpecializationChange = (e) => {
    const value = e.target.value;
    const specializationArray = value.split(',').map(item => item.trim());
    formik.setFieldValue("specialization", specializationArray.join(", "));
  };

  const handleChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1];
      formik.setFieldValue("profile_picture", base64String);
    };
    reader.readAsDataURL(file);
  }
};

  const handleBack = () => {
    navigate('/'); //navigate('/login'); 
  };

  const handleDateOfBirthChange = (e) => {
    const dob = e.target.value;
    const today = new Date();
    
    const dobDate = new Date(dob);
  
    if (dobDate > today) {
      //alert("Date of Birth cannot be in the future!");
      return;
    }
    formik.setFieldValue('date_of_birth', dob);
  };
  
  return (
    <div className="container mt-4">
        <h1>SignUp form</h1>
        <div className="d-flex justify-content-between">
              <div className="backArrow pt-2" onClick={handleBack} >
                <FontAwesomeIcon icon={faArrowLeft} className="backPointer"/>
              </div>
        </div>
      <form onSubmit={formik.handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <label>Title<span className="text-danger">*</span></label>
              <select 
                className="form-control" 
                name="title" 
                value={formik.values.title} 
                onChange={formik.handleChange} 
                onBlur={formik.handleBlur}
              >
                <option value="">Select</option>
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Ms">Ms</option>
                <option value="Miss">Miss</option>
              </select>
              {formik.touched.title && formik.errors.title ? <div className="text-danger">{formik.errors.title}</div> : null}
            </div>

            <div className="col-md-6">
              <label>First Name<span className="text-danger">*</span></label>
              <input 
                type="text" 
                className="form-control" 
                name="first_name" 
                value={formik.values.first_name} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.first_name && formik.errors.first_name ? <div className="text-danger">{formik.errors.first_name}</div> : null}
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <label>Middle Name</label>
              <input 
                type="text" 
                className="form-control" 
                name="middle_name" 
                value={formik.values.middle_name} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            <div className="col-md-6">
              <label>Last Name<span className="text-danger">*</span></label>
              <input 
                type="text" 
                className="form-control" 
                name="last_name" 
                value={formik.values.last_name} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.last_name && formik.errors.last_name ? <div className="text-danger">{formik.errors.last_name}</div> : null}
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <label>Gender<span className="text-danger">*</span></label>
              <select 
                className="form-control" 
                name="gender" 
                value={formik.values.gender} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {formik.touched.gender && formik.errors.gender ? <div className="text-danger">{formik.errors.gender}</div> : null}
            </div>

            <div className="col-md-6">
              <label>Date of Birth<span className="text-danger">*</span></label>
              <input
                type="date"
                className="form-control"
                name="date_of_birth"
                value={formik.values.date_of_birth}
                onChange={handleDateOfBirthChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.date_of_birth && formik.errors.date_of_birth ? (
                <div className="text-danger">{formik.errors.date_of_birth}</div>
              ) : null}
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <label>Email<span className="text-danger">*</span></label>
              <input 
                type="email" 
                className="form-control" 
                name="email" 
                value={formik.values.email} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email ? <div className="text-danger">{formik.errors.email}</div> : null}
            </div>

            <div className="col-md-6">
              <label>Phone<span className="text-danger">*</span></label>
              <input 
                type="text" 
                className="form-control" 
                name="phone" 
                value={formik.values.phone} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.phone && formik.errors.phone ? <div className="text-danger">{formik.errors.phone}</div> : null}
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <label>National Id:</label>
              <input 
                type="text" 
                className="form-control" 
                name="national_id" 
                value={formik.values.national_id} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.national_id && formik.errors.national_id ? <div className="text-danger">{formik.errors.national_id}</div> : null}
            </div>

            <div className="col-md-6">
              <label>National Id Type:</label>
              <input 
                type="text" 
                className="form-control" 
                name="national_id_type" 
                value={formik.values.national_id_type} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.national_id_type && formik.errors.national_id_type ? <div className="text-danger">{formik.errors.national_id_type}</div> : null}
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <label>Profile Picture</label>
              <input 
                type="file" 
                className="form-control" 
                accept="image/*" 
                capture="environment"
                onChange={handleChange} // Use your custom handleChange
                onBlur={formik.handleBlur}
              />
              {formik.touched.profile_picture && formik.errors.profile_picture ? (
                <div className="text-danger">{formik.errors.profile_picture}</div>
              ) : null}
           </div>

            <div className="col-md-6">
              <label>Address<span className="text-danger">*</span></label>
              <input 
                type="text" 
                className="form-control" 
                name="address" 
                value={formik.values.address} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.address && formik.errors.address ? <div className="text-danger">{formik.errors.address}</div> : null}
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <label>City<span className="text-danger">*</span></label>
              <input 
                type="text" 
                className="form-control" 
                name="city" 
                value={formik.values.city} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.city && formik.errors.city ? <div className="text-danger">{formik.errors.city}</div> : null}
            </div>

            <div className="col-md-6">
              <label>Country<span className="text-danger">*</span></label>
              <select 
                className="form-control" 
                name="country" 
                value={formik.values.country} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="" disabled>Select a country</option>
                {countries.map((country, index) => (
                  <option key={index} value={country}>{country}</option>
                ))}
              </select>
              {formik.touched.country && formik.errors.country ? (
                <div className="text-danger">{formik.errors.country}</div>
              ) : null}
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <label>State<span className="text-danger">*</span></label>
              <input 
                type="text" 
                className="form-control" 
                name="state" 
                value={formik.values.state} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.state && formik.errors.state ? <div className="text-danger">{formik.errors.state}</div> : null}
            </div>

            <div className="col-md-6">
              <label>Zipcode<span className="text-danger">*</span></label>
              <input 
                type="text" 
                className="form-control" 
                name="zipcode" 
                value={formik.values.zipcode} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.zipcode && formik.errors.zipcode ? <div className="text-danger">{formik.errors.zipcode}</div> : null}
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <label>License Number<span className="text-danger">*</span></label>
              <input 
                type="text" 
                className="form-control" 
                name="license_number" 
                value={formik.values.license_number} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.license_number && formik.errors.license_number ? <div className="text-danger">{formik.errors.license_number}</div> : null}
            </div>

            <div className="col-md-6">
              <label>Specialization<span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                name="specialization"
                value={formattedSpecialization}
                onChange={handleSpecializationChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.specialization && formik.errors.specialization ? (
                <div className="text-danger">{formik.errors.specialization}</div>
              ) : null}
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <label>Start Date<span className="text-danger">*</span></label>
              <input 
                type="date" 
                className="form-control" 
                name="start_date" 
                value={formik.values.start_date} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.start_date && formik.errors.start_date ? <div className="text-danger">{formik.errors.start_date}</div> : null}
            </div>

            <div className="col-md-6">
              <label>End Date</label>
              <input 
                type="number" 
                className="form-control" 
                name="end_date" 
                value={formik.values.end_date} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.end_date && formik.errors.end_date ? <div className="text-danger">{formik.errors.end_date}</div> : null}
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <label>Branch Assigned</label>
              <input 
                type="text" 
                className="form-control" 
                name="branch_assigned" 
                value={formik.values.branch_assigned} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.branch_assigned && formik.errors.branch_assigned ? <div className="text-danger">{formik.errors.branch_assigned}</div> : null}
            </div>

            <div className="col-md-6">
              <label>Working Channel</label>
              <input 
                type="text" 
                className="form-control" 
                name="working_channel" 
                value={formik.values.working_channel} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.working_channel && formik.errors.working_channel ? <div className="text-danger">{formik.errors.working_channel}</div> : null}
            </div>
          </div>
     
      <div className="row mt-3">
              <div className="col-md-12 text-center mt-3 mb-3">
                  <button type="submit"  className="btn btn-primary">Submit</button>
              </div>
      </div>
      </form>
    </div>
  );
};

export default SignUPDetails;
