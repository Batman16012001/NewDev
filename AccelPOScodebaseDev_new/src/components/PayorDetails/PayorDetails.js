import React from "react";
import "./PayorDetails.css";
import { Link, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from 'react';
// import { environment } from '../../config/environment';
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Container, Row, Form } from "react-bootstrap";
import Loader from "react-spinner-loader";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faSignOutAlt,faHouse } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { saveDetail,updateDetailById,findRecordById} from "../../db/indexedDB";
import { fetchRelatioships,fetchCountries,fetchOccupations, fetchNatureOfBusiness,handleCountryChange } from "./PayorDetailsService";


const PayorDetails = (props) => {

  const [formState, setFormState] = useState(true);
  const [getRelationship, setRelationship] = useState([]);

  // const [agentID, setAgentID] = useState('');
  const [personID, setPersonID] = useState();

  const data = props.images
  const navigate = useNavigate()
  const navigate1 = useNavigate()
  const gotoPersonalDetails = useNavigate()

  const [indexedDBData, setIndexedDBData] = useState([]);

  const [allData, setAllData] = useState([]);

  const [getSQSID, setSQSID] = useState();
  const [isReadOnly, setIsReadOnly] = useState(false); // Initially, screens are not readonly

  const [isValid, setValid] = useState(false);
  const [loader, setLoader] = useState();
  const gotolistdashboard = useNavigate()
  const [getClientID, setClientID] = useState();
  const [getSyncFlag, setSyncFlag] = useState();
  const [getAgentID,setAgentID] = useState();

  const [selectedRelationshipLabel, setSelectedRelationshipLabel] = useState('');

    // State for each coverage and policy term
    const [getExistedPayorID, setExistedPayorID] = useState()
    const [nationality, setNationality] = useState([])
    const [occupation, setOccupation] = useState([])
    const [natureOfBusiness, setNatureOfBusiness] = useState([])
    const [permanentStates, setPermanentStates] = useState([]);
    const [getCountry,setCountry] = useState([])

  var agentID = getAgentID


  function dashNav() {
    sessionStorage.setItem("agentID", getAgentID);   
    sessionStorage.setItem("fromScreen", "Payor_Details");
    sessionStorage.setItem("ClientID", getClientID);

    navigate('/benefitselection');

  }


function dashboardNav(){
  navigate('/dashboard');
}

function logOut(){
  navigate('/');
}



  useEffect(() => {

    const fetchData = async () => {

        try {
            const nationalityList = await fetchCountries();
            console.log("nationalityList", nationalityList);
            setNationality(nationalityList);
        } catch (error) {
            console.error('Error fetching countries:', error);
        }

        try {
            const countryList = await fetchCountries();
            console.log("countryList", countryList);
            setCountry(countryList);
        } catch (error) {
            console.error('Error fetching countries:', error);
        }

      try {
        const relationshipData = await fetchRelatioships();
        console.log("relationshipData are-->",relationshipData)
        setRelationship(relationshipData);
      } catch (error) {
        console.error('Error loading getRelationship:', error);
      }

      try {
        const occupationData = await fetchOccupations();
        console.log("occupationData are-->",occupationData)
        setOccupation(occupationData);
      } catch (error) {
        console.error('Error loading occupationData:', error);
      }

      try {
        const natureOfBusinessData = await fetchNatureOfBusiness();
        console.log("natureOfBusinessData are-->",natureOfBusinessData)
        setNatureOfBusiness(natureOfBusinessData);
      } catch (error) {
        console.error('Error loading natureOfBusinessData:', error);
      }
      
     const payorID = sessionStorage.getItem("payorID")
      console.log("Offline payorID",payorID)

      var agentID = sessionStorage.getItem("agentID");
      console.log("Offline agentID",agentID)
      setAgentID(agentID)
      
      // var fromDashbaord = location.state.fromDashbaord
      // console.log ("fromDashbaord  ",location.state.fromDashbaord);

    //   var dataSync = "";
    
    //   var clientID =  sessionStorage.getItem("ClientID");
    //   console.log("Offline clientID",clientID)
    //   setClientID(clientID);

    //   dataSync = sessionStorage.getItem("dataSync")
    //   console.log("Offline dataSync",dataSync)
    //   setSyncFlag(dataSync);

    //   var caseStatus = sessionStorage.getItem("caseStatus");
    //   console.log("Offline caseStatus::",caseStatus)

    //   if (caseStatus == "Submitted"){
    //     setIsReadOnly(true)
    //   }

      if (payorID !==""){
        const payorFetch = await findRecordById('al_payor_details',payorID);
        console.log("fetch existed sqs data",payorFetch);

        const existingPayorID = payorFetch.result.payor_id
        setExistedPayorID(existingPayorID)
      }

      try {

        // Check if formState is true before navigating
      if (formState) {
        gotolistdashboard('/payordetails');
      }
    } catch (error) {
      console.error('Error fetching data from IndexedDB:', error);
    }


    };
  
    fetchData();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: allData.name || "",
      birthday: allData.birthday || "",
      relationshipToOwner: allData.relationshipToOwner || "",
      newNRIC: allData.newNRIC || "",
      nationality: allData.nationality || "",
      occupation: allData.occupation || "",
      nameOfEmployer:allData.nameOfEmployer || "",
      natureOfBusiness:allData.natureOfBusiness || "",
      houseNo: allData.houseNo || "",
      city: allData.city || "",
      street: allData.street || "",
      state: allData.state || "",
      country: allData.country || "",
      postCode: allData.postCode || "",
      sendPremium: allData.sendPremium || ""
    },
    validationSchema: Yup.object({

      name: Yup.string().when("quePremiumPaid", {
        is: "Yes",
        then: () => Yup.string().required("Please enter Name"),
      }),
      
      birthday: Yup.string().when("quePremiumPaid", {
        is: "Yes",
        then: () => Yup.string().required("Please select date of birth")}),

      relationshipToOwner: Yup.string().when("quePremiumPaid", {
        is: "Yes",
        then: () => Yup.string().required("Please select date of relationship to owner")}),

      newNRIC: Yup.string().when("quePremiumPaid", {
        is: "Yes",
        then: () => Yup.string().required("Please enter new NRIC number")}),

      nationality: Yup.string().when("quePremiumPaid", {
        is: "Yes",
        then: () => Yup.string().required("Please select nationality")}),

      occupation: Yup.string().when("quePremiumPaid", {
        is: "Yes",
        then: () => Yup.string().required("Please select occupation")}),

      nameOfEmployer: Yup.string().when("quePremiumPaid", {
        is: "Yes",
        then: () => Yup.string().required("Please enter Name of Employer")}),

      natureOfBusiness: Yup.string().when("quePremiumPaid", {
        is: "Yes",
        then: () => Yup.string().required("Please select Nature Of Business")}),

      houseNo: Yup.string().when("quePremiumPaid", {
        is: "Yes",
        then: () => Yup.string().required("Please enter house No  ")}),
        
      city: Yup.string().when("quePremiumPaid", {
        is: "Yes",
        then: () => Yup.string().required("Please enter city  ")}),
        
      street: Yup.string().when("quePremiumPaid", {
        is: "Yes",
        then: () => Yup.string().required("Please enter Street  ")}),

      state: Yup.string().when("quePremiumPaid", {
        is: "Yes",
        then: () => Yup.string().required("Please enter State  ")}),
        
       country: Yup.string().when("quePremiumPaid", {
        is: "Yes",
        then: () => Yup.string().required("Please enter Country  ")}),

       postCode: Yup.string().when("quePremiumPaid", {
        is: "Yes",
        then: () => Yup.string().required("Please enter Post Code  ")}),

        quePremiumPaid: Yup.string().required("Please answer the question"),
        
        sendPremium: Yup.string().required("Please select Send premium notices to")

    }),

    onSubmit: async values => {

      var currentdate = new Date();

      console.log("Inside submit ");
      // setLoader(true)
      // setFormState(values);

        console.log(JSON.stringify(values, null, 2));
        if (!getExistedPayorID){
        var currentdate = new Date();
        var payorID = "PY" + currentdate.getDate() + "" + (currentdate.getMonth() + 1) + currentdate.getFullYear() + currentdate.getHours() + "" + currentdate.getMinutes() + currentdate.getSeconds() + currentdate.getMilliseconds();
        console.log("payorID is :::" + payorID);
        setSQSID(payorID)
        sessionStorage.setItem("payorID", payorID);

        var payorDetailsData ;

        if (values.quePremiumPaid == 'Yes') {
                var payorDetailsData = {
                "payor_id": payorID,
                "client_id": getClientID,
                "name":values.name,
                "birthday": values.birthday,
                "relationshipToOwner": values.relationshipToOwner,
                "newNRIC": values.newNRIC,
                "nationality": values.nationality,
                "occupation": values.occupation,
                "nameOfEmployer": values.nameOfEmployer,
                "natureOfBusiness": values.natureOfBusiness,
                "sendPremium":values.sendPremium

            }  

            await saveDetail('al_payor_details',payorDetailsData)
            console.log("payorDetailsData updated successfully");

         // if (navigator.onLine) {    
        //     try {
        //         await saveToBackend(payorDetailsData);
        //         console.log("Data sent to backend successfully");
        //     } catch (error) {
        //         console.error("Failed to send data to backend:", error);
        //     }
        // } else {
        //     console.log("Data will be synced when online.");
        // }
    //  }

        } else if (values.quePremiumPaid == 'No') {
                var payorDetailsData = {
                "payor_id": getExistedPayorID,
                "client_id": getClientID,
                "sendPremium":values.sendPremium
            } 
        }   

            await updateDetailById('al_payor_details', getExistedPayorID, payorDetailsData);
            console.log("payorDetailsData updated successfully");

          } 
    

      
    }
  });


  const handleRelationshipChange = (e) => {

    const selectedRelationship = getRelationship.find(relationship => relationship.value === e.target.value);
    setSelectedRelationshipLabel(selectedRelationship ? selectedRelationship.label : '');
    formik.handleChange(e);
  };

const toCamelCase = (str) => {
    return str
      .toLowerCase()
      .replace(/(?:^|\s)\w/g, (match) => match.toUpperCase());
  };

//   const handleCountryChange = async (event, setStateCall, stateField) => {
//     const selectedCountry = event.target.value;
//     formik.handleChange(event);

//     const tokenRes = await axios.get(
//       `https://www.universal-tutorial.com/api/getaccesstoken`,
//       {
//         headers: {
//           "Accept": "application/json",
//           "api-token": "ZIhNrrVFSMK3hH99iTS1UvoPfi_CDeW5-eSnpZ4EjTKRHLb6NbExFbmH11r_pvnN32E",
//           "user-email": "onkar.swami@acceltree.com"
//         }
//       }
//     );

//     const auth_token = tokenRes.data.auth_token;

//     if (selectedCountry) {
//       const statesRes = await axios.get(`https://www.universal-tutorial.com/api/states/${selectedCountry}`, {
//         headers: {
//           "Authorization": `Bearer ${auth_token}`,
//           "Accept": "application/json"
//         }
//       });

//       const stateList = statesRes.data;
//       setStateCall(stateList);
//       formik.setFieldValue(stateField, '');
//     }
//   };


  return (
    <div className="px-0 px-sm-4">
             <div className="main-background-image-container"></div>
             <div className="main-header">

    {/* <div style={{backgroundColor:'#32d0b8'}}> */}
    <div className="row row d-flex align-items-center">
      <div className="col-3">
      <div className="backArrow pt-2" onClick={dashNav} >
          {/* <FontAwesomeIcon icon={faChevronLeft} /> */}
          <FontAwesomeIcon icon={faArrowLeft} className="backPointer"/>
        </div>
      </div>
      <div className="col-6 ">
        <img className="logoLIC" src={process.env.PUBLIC_URL + "AccelLogo.png"} />
      </div>
      <div className="col-3">
        <FontAwesomeIcon icon={faHouse} className="backArrow" onClick={dashboardNav}/>
        <FontAwesomeIcon icon={faSignOutAlt} className="backArrow pl-2 pl-sm-5" onClick={logOut}/>
      </div>
    </div>


    <div className="pt-3 pb-2 ">
      <marquee direction="left" className="marqueeBasicDetails">
      </marquee>
    </div>
    </div>

    <Form onSubmit={formik.handleSubmit} className="main-form-container">

      <div className="row">
          <div className="col-3 col-sm-3">
            <h3 className="headerFont">Payor Details</h3>
          </div>
          <div className="col-9 col-sm-9" style={{textAlign:"right"}}>
            <h5 className="headerFont">E-Reference No.:</h5>
          </div>
        </div>
        <hr></hr>

        <div className="form-group px-3 px-sm-5">
            
        <div className="row">
            <div className="col-sm-6" style={{ textAlign: 'left' }}>
                <Form.Label className="prodSelect">Is the premium paid by someone other than Proposed Insured/ Owner/ Joint Parent?</Form.Label>
            </div>
            <div className="col-sm-3">

                <Form.Group controlId="quePremiumPaid">
                <div style={{ textAlign:"left"}}>
                </div>
                    <div className="row pl-5">
                        <div className="col-6 col-sm-6 form-check">
                            <Form.Control className="form-check-input" type="radio" name="quePremiumPaid" value="Yes" 
                            onChange={formik.handleChange} checked={formik.values.quePremiumPaid === "Yes"}
                            />
                                <div style={{ textAlign:"left"}}>
                                <label className="form-check-label"> Yes</label>
                            </div>
                        </div>
                        <div className="col-6 col-sm-6 form-check">
                            <Form.Control className="form-check-input" type="radio" name="quePremiumPaid" value="No" 
                            onChange={formik.handleChange} checked={formik.values.quePremiumPaid === "No"}
                            />
                                <div style={{ textAlign:"left"}}>
                                <label className="form-check-label"> No</label>
                        </div>
                        </div>
                    </div>
                    <Form.Text className="text-danger">
                        {formik.touched.quePremiumPaid && formik.errors.quePremiumPaid ? (
                            <div className="text-danger">{formik.errors.quePremiumPaid}</div>
                        ) : null}
                    </Form.Text>
                </Form.Group>

            </div>
        </div>

        <div style={formik.values.quePremiumPaid == 'Yes' ? { display: 'block' } : { display: 'none' }}>

            <div className="row">
                <div className="col-12 col-sm-6 pt-3">
                    <Form.Group controlId="name">
                    <div style={{ textAlign:"left"}}>
                    <Form.Label >Name <span className="text-danger"> *</span></Form.Label>
                    </div>
                        <Form.Control
                            name="name"
                            type="text"
                            onChange={(e) => {
                                const camelCaseValue = toCamelCase(e.target.value);
                                formik.setFieldValue('name', camelCaseValue);
                                }}                                    
                                onBlur={formik.handleBlur}
                            value={formik.values.name}
                            
                        />
                        
                        <Form.Text className="text-danger">
                            {formik.touched.name && formik.errors.name ? (
                                <div className="text-danger">{formik.errors.name}</div>
                            ) : null}
                        </Form.Text>
                    </Form.Group>
                </div>

                <div className="col-12 col-sm-6 pt-3">
                <Form.Group controlId="birthday">
                    <div style={{ textAlign:"left"}}>
                    <Form.Label>Date Of Birth<span className="text-danger"> *</span></Form.Label>
                    </div>
                        <Form.Control
                            name="birthday"
                            type="date"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.birthday}
                            
                        />
                        <Form.Text className="text-danger">
                            {formik.touched.birthday && formik.errors.birthday ? (
                                <div className="text-danger">{formik.errors.birthday}</div>
                            ) : null}
                        </Form.Text>
                    </Form.Group>
                </div>
            </div> 

            <div className="row">
            <div className="col-12 col-sm-6 pt-3">
                    <Form.Group controlId="relationshipToOwner">
                        <div style={{ textAlign:"left"}}>
                        <Form.Label>Relationship to Owner <span className="text-danger"> *</span></Form.Label>
                        </div>
                        <Form.Select
                        name="relationshipToOwner"
                        onChange={handleRelationshipChange} 
                        onBlur={formik.handleBlur}
                        value={formik.values.relationshipToOwner}
                        >
                        <option value="">Please Select</option>
                        {getRelationship.map(relationship => (
                            <option key={relationship.value} value={relationship.value}>
                            {relationship.label}
                            </option>
                        ))}
                        </Form.Select>
                        <Form.Text className="text-danger">
                        {formik.touched.relationshipToOwner && formik.errors.relationshipToOwner ? (
                            <div className="text-danger">{formik.errors.relationshipToOwner}</div>
                        ) : null}
                        </Form.Text>
                    </Form.Group>
                </div>

                <div className="col-12 col-sm-6 pt-3">
                    <Form.Group controlId=" newNRIC">
                    <div style={{textAlign:"left"}}>
                    <Form.Label>New NRIC Number  <span className="text-danger"> *</span></Form.Label>
                        </div>
                        <Form.Control
                        name="newNRIC"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.newNRIC}
                        />
                        <Form.Text className="text-danger">
                        {formik.touched.newNRIC && formik.errors.newNRIC ? (
                            <div className="text-danger">{formik.errors.newNRIC}</div>
                        ) : null}
                        </Form.Text>
                    </Form.Group>
                </div>  
            </div>

            <div className="row">
                <div className="col-12 col-sm-6 pt-3">
                        <Form.Group controlId="nationality">
                        <div style={{ textAlign:"left"}}>
                        <Form.Label>Nationality <span className="text-danger"> *</span></Form.Label>
                        </div>
                            <Form.Select
                                name="nationality"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.nationality}
                            >
                                <option value="">Select</option>
                                {nationality.map(nationality => (
                                <option key={nationality.country_name} value={nationality.country_name}>
                                    {nationality.country_name}
                                </option>
                                ))}
                            </Form.Select>
                            <Form.Text className="text-danger">
                                {formik.touched.nationality && formik.errors.nationality ? (
                                    <div className="text-danger">{formik.errors.nationality}</div>
                                ) : null}
                            </Form.Text>
                        </Form.Group>
                </div>

                <div className="col-12 col-sm-6 pt-3">
                <Form.Group controlId="occupation">
                        <div style={{ textAlign:"left"}}>
                        <Form.Label>Occupation<span className="text-danger"> *</span></Form.Label>
                        </div>
                            <Form.Select
                                name="occupation"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.occupation}
                            >
                                <option value="">Select</option>
                                {occupation.map(occupation => (
                                <option key={occupation.value} value={occupation.value}>
                                    {occupation.label}
                                </option>
                                ))}
                            </Form.Select>
                            <Form.Text className="text-danger">
                                {formik.touched.occupation && formik.errors.occupation ? (
                                    <div className="text-danger">{formik.errors.occupation}</div>
                                ) : null}
                            </Form.Text>
                </Form.Group>
                </div>

            </div>

            <div className="row">
                <div className="col-12 col-sm-6 pt-3">
                    <Form.Group controlId="nameOfEmployer">
                    <div style={{ textAlign:"left"}}>
                    <Form.Label>Name of Employer<span className="text-danger"> *</span></Form.Label>
                    </div>
                        <Form.Control
                            name="nameOfEmployer"
                            type="text"
                            onChange={(e) => {
                                const camelCaseValue = toCamelCase(e.target.value);
                                formik.setFieldValue('nameOfEmployer', camelCaseValue);
                                }}                                    
                                onBlur={formik.handleBlur}
                            value={formik.values.nameOfEmployer}
                            
                        />
                        
                        <Form.Text className="text-danger">
                            {formik.touched.nameOfEmployer && formik.errors.nameOfEmployer ? (
                                <div className="text-danger">{formik.errors.nameOfEmployer}</div>
                            ) : null}
                        </Form.Text>
                    </Form.Group>
                </div>

                <div className="col-12 col-sm-6 pt-3">
                    <Form.Group controlId="natureOfBusiness">
                        <div style={{ textAlign:"left"}}>
                        <Form.Label>Nature of Business<span className="text-danger"> *</span></Form.Label>
                        </div>
                            <Form.Select
                                name="natureOfBusiness"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.natureOfBusiness}
                            >
                                <option value="">Select</option>
                                {natureOfBusiness.map(natureOfBusiness => (
                                <option key={natureOfBusiness.value} value={natureOfBusiness.value}>
                                    {natureOfBusiness.label}
                                </option>
                                ))}
                            </Form.Select>
                            <Form.Text className="text-danger">
                                {formik.touched.natureOfBusiness && formik.errors.natureOfBusiness ? (
                                    <div className="text-danger">{formik.errors.natureOfBusiness}</div>
                                ) : null}
                            </Form.Text>
                    </Form.Group>
                </div>
            </div> 

            <hr></hr>

            <div className="row">
            <div className="col-3 col-sm-3 pt-3">
                <h3 className="headerFont">Address</h3>
            </div>
            </div>

            <div className="row">
                <div className="col-12 col-sm-6">
                    <Form.Group controlId="houseNo">
                    <div style={{ textAlign:"left"}}>
                    <Form.Label>Apartment No.<span className="text-danger"> *</span></Form.Label>
                    </div>

                        <Form.Control
                            name="houseNo"
                            type="text"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.houseNo}
                        />
                        <Form.Text className="text-danger">
                            {formik.touched.houseNo && formik.errors.houseNo ? (
                                <div className="text-danger">{formik.errors.houseNo}</div>
                            ) : null}
                        </Form.Text>
                    </Form.Group>
                </div>
                <div className="col-12 col-sm-6">
                    <Form.Group controlId="street">
                    <div style={{ textAlign:"left"}}>
                    <Form.Label>Street<span className="text-danger"> *</span></Form.Label>
                    </div>

                        <Form.Control
                            name="street"
                            type="text"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.street}
                        />
                        <Form.Text className="text-danger">
                            {formik.touched.street && formik.errors.street ? (
                                <div className="text-danger">{formik.errors.street}</div>
                            ) : null}
                        </Form.Text>
                    </Form.Group>
                </div>
            </div>

            <div className="row">
                <div className="col-12 col-sm-6">
                        <Form.Group controlId="city">
                        <div style={{ textAlign:"left"}}>
                        <Form.Label>City <span className="text-danger"> *</span></Form.Label>
                        </div>
                            <Form.Control
                                name="city"
                                type="text"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.city}
                            />
                            <Form.Text className="text-danger">
                                {formik.touched.city && formik.errors.city ? (
                                    <div className="text-danger">{formik.errors.city}</div>
                                ) : null}
                            </Form.Text>
                        </Form.Group>
                </div>

                <div className="col-12 col-sm-6">
                        <Form.Group controlId="country">
                        <div style={{ textAlign:"left"}}>
                        <Form.Label>Country <span className="text-danger"> *</span></Form.Label>
                        </div>
                            <Form.Select
                                name="country"
                                // onChange={(e) => handleCountryChange(e, setPermanentStates, 'state')}
                                onChange={(e) => handleCountryChange(e, setPermanentStates, 'state', formik)}

                                onBlur={formik.handleBlur}
                                value={formik.values.country}
                            >
                                <option value="">Select</option>
                                {getCountry.map(country => (
                                <option key={country.country_name} value={country.country_name}>
                                    {country.country_name}
                                </option>
                                ))}
                            </Form.Select>
                            <Form.Text className="text-danger">
                                {formik.touched.country && formik.errors.country ? (
                                    <div className="text-danger">{formik.errors.country}</div>
                                ) : null}
                            </Form.Text>
                        </Form.Group>
                </div>
            </div>    

            <div className="row">
                <div className="col-12 col-sm-6">
                    <Form.Group controlId="state">
                    <div style={{ textAlign:"left"}}>
                    <Form.Label>State <span className="text-danger"> *</span></Form.Label>
                    </div>
                        <Form.Select
                            name="state"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.state}
                        >
                            <option value="">Select</option>
                            {permanentStates.map(state => (
                            <option key={state.state_name} value={state.state_name}>
                                {state.state_name}
                            </option>
                            ))}
                        </Form.Select>
                    <Form.Text className="text-danger">
                        {formik.touched.state && formik.errors.state ? (
                        <div className="text-danger">{formik.errors.state}</div>
                        ) : null}
                    </Form.Text>
                    </Form.Group>
                </div>

                <div className="col-12 col-sm-6">
                    <Form.Group controlId="postCode">
                    <div style={{ textAlign:"left"}}>
                    <Form.Label>Post Code <span className="text-danger"> *</span></Form.Label>
                    </div>
                        <Form.Control
                            name="postCode"
                            type="text"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.postCode}
                        />
                        <Form.Text className="text-danger">
                            {formik.touched.postCode && formik.errors.postCode ? (
                                <div className="text-danger">{formik.errors.postCode}</div>
                            ) : null}
                        </Form.Text>
                    </Form.Group>
                </div>
            </div>

        </div> 

         <div className="row pt-3">
            <div className="col-12 col-sm-12">
                <Form.Group controlId="sendPremium">
                    <Form.Label>Send premium notices to</Form.Label>
                    <Form.Select
                    name="sendPremium"
                    as="select"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.sendPremium}
                    >
                    <option >Select</option>
                    <option value="Insured">Insured</option>
                    <option value="Proposer">Proposer</option>
                    <option value="Other">Other</option>
                    </Form.Select>
                    <Form.Text className="text-danger">
                    {formik.touched.sendPremium && formik.errors.sendPremium ? (
                        <div className="text-danger">{formik.errors.sendPremium}</div>
                    ) : null}
                    </Form.Text>
                </Form.Group>
            </div>
        </div> 

            <div className="main-footer">
              <Button
                variant="primary"
                type="submit"
                onClick={(values) => setFormState(values)}
                id="productChoiceButton">Save & Proceed</Button>
            </div>


        </div>
        <Loader show={loader} />

      </Form>

    </div>
  )

}

export default PayorDetails
