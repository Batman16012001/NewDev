import React, { useState, useEffect } from "react";
import SidebarLayout from "../../components/Dashboard/Template";
import { useNavigate, useLocation } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  findRecordById,
  saveDetail,
  updateDetailById,
} from "../../db/indexedDB";

const calculateAge = (birthDateString) => {
  if (!birthDateString) return "";

  let birthDate;

  // Check if the format is YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(birthDateString)) {
    birthDate = new Date(birthDateString);
  }
  // Handle DD-MM-YYYY or D-M-YYYY format
  else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(birthDateString)) {
    const [day, month, year] = birthDateString
      .split("-")
      .map((num) => parseInt(num, 10));
    birthDate = new Date(year, month - 1, day); // JS months are 0-based
  } else {
    console.error("Invalid DOB format:", birthDateString);
    return "";
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  // Adjust if the birthday hasn't occurred yet this year
  if (
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

const FNA_PersonalDetails = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const navigate = useNavigate();
  const storedClientId = sessionStorage.getItem("clientId");
  const [customerMaritalStatus, setCustomerMaritalStatus] = useState("");
  const fnaId = sessionStorage.getItem("fnaId");
  const isNewCustomer = sessionStorage.getItem("isNewCustomer");
  const [initialFormValues, setInitialFormValues] = useState(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      let customerData = null;

      if (storedClientId) {
        console.log(" Trying to fetch data using clientId:", storedClientId);
        const result = await findRecordById(
          "al_client_details",
          storedClientId
        );
        if (result?.result) {
          customerData = result.result;
        }
      }

      // If no customer data by clientId, try using leadId
      if (!customerData) {
        const leadId = sessionStorage.getItem("setLeadID");
        if (leadId) {
          console.log(" clientId data not found. Trying leadId:", leadId);

          // Option 1: If you stored multiple clients, loop and match by leadId
          const allClients = await findRecordById("al_client_details"); // Assuming you have a way to list all
          const matched = Object.values(allClients || {}).find(
            (record) => record?.result?.leadId === leadId
          );
          if (matched?.result) {
            customerData = matched.result;
          }
        }
      }

      if (customerData) {
        console.log(" Customer data found:", customerData);

        setCustomerMaritalStatus(customerData.maritalStatus);

        formik.setValues((prevValues) => ({
          ...prevValues,
          title: customerData.title || prevValues.title,
          firstName: customerData.firstName || prevValues.firstName,
          lastName: customerData.lastName || prevValues.lastName,
          gender: customerData.gender || prevValues.gender,
          dateOfBirth:
            formatDateToYMD(customerData.dateOfBirth) || prevValues.dateOfBirth,
          maritalStatus: customerData.maritalStatus || prevValues.maritalStatus,
          nameWithInitials:
            customerData.nameWithInitials || prevValues.nameWithInitials,
          emailId: customerData.emailId || prevValues.emailId,
          mobile: customerData.mobile || prevValues.mobile,
          age: calculateAge(customerData.dateOfBirth) || prevValues.age,
          source: customerData.source || prevValues.source,
        }));
      } else {
        console.warn(" No customer data found with either clientId or leadId.");
      }

      if (fnaId) {
        const fnaData = await findRecordById("al_fna_persons", fnaId);
        const spouseName = fnaData?.result?.fnaPersons.spouseName;

        if (fnaData) {
          formik.setValues((prevValues) => ({
            ...prevValues,
            spouseName: spouseName || prevValues.spouseName,
            desiredRetirementAge:
              fnaData.result.fnaPersons.desiredRetirementAge ||
              prevValues.desiredRetirementAge,
            lifeExpectancy:
              fnaData.result.fnaPersons.lifeExpectancy ||
              prevValues.lifeExpectancy,
          }));
        }
      }
    };

    fetchCustomerData();
  }, [storedClientId, fnaId]);

  const formatDateToYMD = (dateString) => {
    // Check if the date string is in a valid format (e.g., 'dd-mm-yyyy')
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const [day, month, year] = parts; // Destructure parts for clarity

      // Validate day, month, year format and range
      if (
        !isNaN(day) &&
        !isNaN(month) &&
        !isNaN(year) &&
        +day > 0 &&
        +day <= 31 &&
        +month > 0 &&
        +month <= 12 &&
        +year.length === 4
      ) {
        return `${year}-${month}-${day}`; // Return as yyyy-MM-dd
      }
    }

    // If validation fails, return original or a default date
    console.warn("Invalid date format:", dateString);
    return dateString; // Or return a default date like 'yyyy-MM-dd'
  };

  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),

    nameWithInitials: Yup.string()
      .required("Name with initials is required")
      .matches(
        /^([a-zA-Z]+\s)*([a-zA-Z]+)$/,
        "Name with Initials must only contain letters"
      )
      .max(30, "Name with Initials cannot exceed 30 characters"),

    firstName: Yup.string()
      .max(30, "First Name cannot be longer than 30 characters")
      .matches(
        /^([a-zA-Z]+\s)*([a-zA-Z]+)$/,
        "First Name must only contain letters"
      )
      .required("First Name is required"),

    lastName: Yup.string()
      .max(30, "Last Name cannot be longer than 30 characters")
      .matches(
        /^([a-zA-Z]+\s)*([a-zA-Z]+)$/,
        "Last Name must only contain letters"
      )
      .required("Last Name is required"),

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
      .required("Date of Birth is required")
      .max(new Date(), "Date of Birth cannot be in the future!")
      .test("dob", "You must be between 18 to 80 years old!", function (value) {
        const today = new Date();
        const minDate = new Date(
          today.getFullYear() - 80,
          today.getMonth(),
          today.getDate()
        );
        const maxDate = new Date(
          today.getFullYear() - 18,
          today.getMonth(),
          today.getDate()
        );
        return value <= maxDate && value >= minDate;
      }),

    gender: Yup.string().required("Gender is required"),

    maritalStatus: Yup.string().required("Marital status is required"),

    // spouseName: Yup.string()
    //   .matches(/^([a-zA-Z]+\s)*([a-zA-Z]+)$/, "Spouse Name must only contain letters")
    //   .required("Spouse Name is required"),

    spouseName: Yup.string().when("maritalStatus", {
      is: (val) => val === "married" || val === "widowed",
      then: (schema) =>
        schema
          .required("Spouse Name is required")
          .matches(
            /^([a-zA-Z]+\s)*([a-zA-Z]+)$/,
            "Spouse Name must only contain letters"
          ),
      otherwise: (schema) => schema.notRequired(),
    }),

    desiredRetirementAge: Yup.string()
      .required("Desired Retirement Age is required")
      .matches(/^\d+$/, "Desired Retirement Age must contain only numbers"),

    lifeExpectancy: Yup.string()
      .matches(/^\d+$/, "Life Expectancy must only contain letters")
      .required("Life Expectancy is required"),
  });

  // const saveToBackend = async () => {

  // }

  const formik = useFormik({
    initialValues: {
      title: "",
      nameWithInitials: "",
      firstName: "",
      lastName: "",
      mobile: "",
      emailId: "",
      dateOfBirth: "",
      gender: "",
      maritalStatus: "",
      age: "",
      spouseName: "",
      desiredRetirementAge: "55",
      lifeExpectancy: "75",
    },
    validationSchema,
    // ...existing code...
    onSubmit: async (values) => {
      console.log(values);

      // Only proceed if the form is dirty (i.e., values have changed)
      if (!formik.dirty) {
        navigate("/fnagoaldetails");
        return;
      }

      let storedFnaId = fnaId || `FNA${Date.now()}`;
      const agentId = sessionStorage.getItem("agentId");
      const clientId = sessionStorage.getItem("clientId");
      const personId = `PER${agentId}${Date.now()}`; 
       sessionStorage.setItem("person_id", personId);

      if (!fnaId) {
        sessionStorage.setItem("fnaId", storedFnaId);
      }

      let existingFNADetails = await findRecordById(
        "al_fna_persons",
        storedFnaId
      ).catch(() => null);
      let existingFNAMain = await findRecordById(
        "al_fna_main",
        storedFnaId
      ).catch(() => null);

      const fnaDetails = {
        fna_id: storedFnaId,
        agentId,
        clientId,
        personId,
        fnaPersons: {
          title: values.title || "",
          nameWithInitials: values.nameWithInitials || "",
          firstName: values.firstName || "",
          lastName: values.lastName || "",
          gender: values.gender || "",
          dob: values.dateOfBirth || "",
          mobileNo: values.mobile || "",
          emailId: values.emailId || "",
          desiredRetirementAge: values.desiredRetirementAge || "55",
          lifeExpectancy: values.lifeExpectancy || "75",
          relationship: "Self",
          financiallyDependent: "No",
          spouseName: values.spouseName || "",
          lifeStage: values.lifeStage || "",
          maritalStatus: values.maritalStatus || "",
          anb: values.age || "", 
        },
      };

      // Save to IndexedDB
      if (existingFNADetails) {
        await updateDetailById("al_fna_persons", storedFnaId, fnaDetails);
      } else {
        await saveDetail("al_fna_persons", fnaDetails);
      }

      if (existingFNAMain) {
        await updateDetailById("al_fna_main", storedFnaId, fnaDetails);
      } else {
        await saveDetail("al_fna_main", fnaDetails);
      }

   try {
        const response = await fetch(
          "http://192.168.2.7:4001/fnaService/saveFNAData",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fnaMainId: storedFnaId,
              agentId,
              clientId,
              personId,
              fnaPersons: fnaDetails.fnaPersons,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to save FNA data to backend.");
        }

        const result = await response.json();
        console.log("FNA data saved to API:", result);
      } catch (error) {
        console.error("API call failed:", error);
      }
      

      navigate("/fnagoaldetails");
    },
    // ...existing code...
  });

  const handleDateOfBirthChange = (e) => {
    const dob = e.target.value;
    formik.setFieldValue("dateOfBirth", dob);
    const age = calculateAge(dob);
    formik.setFieldValue("age", age);

    if (age > 80) {
      formik.setFieldError("age", "Age cannot be more than 80 years old");
    } else if (age < 18) {
      formik.setFieldError("age", "Age must be at least 18 years old");
    } else {
      formik.setFieldError("age", "");
    }
  };

  const navigate_to_summary = () => {
    navigate("/fnasummary");
  };

  return (
    <SidebarLayout>
      <div className="customer-container d-flex flex-column">
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
                    if (selectedTitle === "mr" || selectedTitle === "dr") {
                      formik.setFieldValue("gender", "male");
                    } else if (
                      ["mrs", "miss", "ms", "drmiss", "drmrs"].includes(
                        selectedTitle
                      )
                    ) {
                      formik.setFieldValue("gender", "female");
                    } else {
                      formik.setFieldValue("gender", ""); // Clear gender if 'dr' or none selected
                    }
                  }}
                  onBlur={formik.handleBlur}
                  value={formik.values.title}
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
                {formik.touched.title && formik.errors.title ? (
                  <div className="text-danger">{formik.errors.title}</div>
                ) : null}
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="nameWithInitials">
                  Name with Initials<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="nameWithInitials"
                  name="nameWithInitials"
                  className="form-control"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.nameWithInitials}
                  readOnly
                />
                {formik.touched.nameWithInitials &&
                formik.errors.nameWithInitials ? (
                  <div className="text-danger">
                    {formik.errors.nameWithInitials}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label htmlFor="firstName">
                  First Name<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="form-control"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.firstName}
                  readOnly
                />
                {formik.touched.firstName && formik.errors.firstName ? (
                  <div className="text-danger">{formik.errors.firstName}</div>
                ) : null}
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="lastName">
                  Last Name<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="form-control"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.lastName}
                  readOnly
                />
                {formik.touched.lastName && formik.errors.lastName ? (
                  <div className="text-danger">{formik.errors.lastName}</div>
                ) : null}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label>
                  Email<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="emailId"
                  name="emailId"
                  className="form-control"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.emailId}
                  readOnly
                />
                {formik.touched.emailId && formik.errors.emailId ? (
                  <div className="text-danger">{formik.errors.emailId}</div>
                ) : null}
              </div>

              <div className="col-md-6 mb-3">
                <label>
                  Mobile No<span className="text-danger">*</span>
                </label>
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
                    e.target.value = e.target.value
                      .replace(/[^0-9]/g, "")
                      .slice(0, 10); // Removes non-numeric characters and limits to 10 digits
                  }}
                  readOnly
                />
                {formik.touched.mobile && formik.errors.mobile ? (
                  <div className="text-danger">{formik.errors.mobile}</div>
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
                  readOnly
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
                <label htmlFor="maritalStatus">
                  Marital Status<span className="text-danger">*</span>
                </label>
                <select
                  id="maritalStatus"
                  name="maritalStatus"
                  className="form-control"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.maritalStatus}
                  disabled
                >
                  <option value="">Select</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
                {formik.touched.maritalStatus && formik.errors.maritalStatus ? (
                  <div className="text-danger">
                    {formik.errors.maritalStatus}
                  </div>
                ) : null}
              </div>

              <div className="col-md-6 mb-3">
                <label>
                  Gender<span className="text-danger">*</span>
                </label>
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
                      checked={formik.values.gender === "male"}
                      disabled
                    />
                    <label htmlFor="male" className="form-check-label">
                      Male
                    </label>
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
                      checked={formik.values.gender === "female"}
                      disabled
                    />
                    <label htmlFor="female" className="form-check-label">
                      Female
                    </label>
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
                      checked={formik.values.gender === "other"}
                      disabled
                    />
                    <label htmlFor="other" className="form-check-label">
                      Other
                    </label>
                  </div>
                </div>
                {formik.touched.gender && formik.errors.gender ? (
                  <div className="text-danger">{formik.errors.gender}</div>
                ) : null}
              </div>
            </div>

            <div className="row mb-3">
              {(customerMaritalStatus === "married" ||
                customerMaritalStatus === "widowed") && (
                <div className="col-md-6 mb-3">
                  <label>
                    Spouse Name<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="spouseName"
                    name="spouseName"
                    className="form-control"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.spouseName}
                  />
                  {formik.touched.spouseName && formik.errors.spouseName ? (
                    <div className="text-danger">
                      {formik.errors.spouseName}
                    </div>
                  ) : null}
                </div>
              )}

              <div className="col-md-6 mb-3">
                <label>
                  Desired Retirement Age<span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  id="desiredRetirementAge"
                  name="desiredRetirementAge"
                  className="form-control"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.desiredRetirementAge}
                />
                {formik.touched.desiredRetirementAge &&
                formik.errors.desiredRetirementAge ? (
                  <div className="text-danger">
                    {formik.errors.desiredRetirementAge}
                  </div>
                ) : null}
              </div>

              <div className="col-md-6 mb-3">
                <label>
                  Life Expectancy<span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  id="lifeExpectancy"
                  name="lifeExpectancy"
                  className="form-control"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.lifeExpectancy}
                />
                {formik.touched.lifeExpectancy &&
                formik.errors.lifeExpectancy ? (
                  <div className="text-danger">
                    {formik.errors.lifeExpectancy}
                  </div>
                ) : null}
              </div>
            </div>
          </form>
        </div>

        {!isKeyboardVisible && (
          <div className="iosfixednextprevbutton">
            <div className="fixednextprevbutton d-flex justify-content-between">
              <button
                type="button"
                className="btn btnprev"
                onClick={navigate_to_summary}
              >
                Prev
              </button>
              <button
                type="submit"
                className="btn btnnext"
                onClick={formik.handleSubmit}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default FNA_PersonalDetails;
