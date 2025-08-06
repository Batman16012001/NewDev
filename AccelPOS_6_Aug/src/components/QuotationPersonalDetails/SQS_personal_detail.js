import React, { useState, useEffect } from "react";
import "./SQS_personal_detail.css";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  findRecordById,
  saveDetail,
  updateDetailById,
} from "../../db/indexedDB";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faAngleUp,
  faAngleDown,
} from "@fortawesome/free-solid-svg-icons";
import SidebarLayout from "../../components/Dashboard/Template";
import { Modal, Button } from "react-bootstrap";
import { height } from "@fortawesome/free-solid-svg-icons/fa0";
const AccordionItem = ({ title, children, isOpen, onClick, disabled }) => {
  return (
    <div className="accordion-item mt-2">
      <button
        className={`accordion-title ${disabled ? "disabled" : "enabled"}`}
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

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

const SqsPersonalDetail = () => {
  const [openItem, setOpenItem] = useState([]);
  const navigate = useNavigate();
  const [getPersonId, setPersonId] = useState();
  const [formErrors, setFormErrors] = useState({ lifeA: "", lifeB: "" });
  const [getClientID, setClientData] = useState({}); // To store fetched client data
  const [isReadOnly, setIsReadOnly] = useState(false); // Initially, screens are not readonly
  const [getSyncFlag, setSyncFlag] = useState();
  const location = useLocation();
  const customerData = location.state || {}; // Access the passed customer data

  const [enableChildAccordion, setEnableChildAccordion] = useState(false); // Initial state for child accordion
  const [childCount, setChildCount] = useState(1);

  const { applicationType, setApplicationType } = useState();
  const [isLifeAEnabled, setIsLifeAEnabled] = useState(false);
  const [isLifeBEnabled, setIsLifeBEnabled] = useState(false);
  const { setChildInclusion } = useState();
  // const personID = sessionStorage.getItem("personID");
  // const clientId = sessionStorage.getItem("clientId");

  const storedApplicationType = sessionStorage.getItem("applicationType");

  const [showModal, setShowModal] = useState(false);
  const closeModal = () => setShowModal(false);
  const [showCardModal, setShowCardModal] = React.useState(false);

  const [modalMessage, setModalMessage] = React.useState("");

  const handleClose = () => setShowCardModal(false);

  const isNewCustomer = sessionStorage.getItem("isNewCustomer") === "true";

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
    const storedPersonID = sessionStorage.getItem("personID");
    const storedClientId = sessionStorage.getItem("clientId");
    setPersonId(storedPersonID);

    console.log("Screen loaded. Fetching and mapping data from IndexedDB...");

    const backswipe = sessionStorage.getItem("Submitted");
    console.log("Case submitted, coming from backswipe:", backswipe);

    console.log("ClientID:", storedClientId, "PersonID:", storedPersonID);

    const fetchCustomerData = async (clientId) => {
      console.log(`Fetching customer data for clientId: ${clientId}`);
      const customerData = await findRecordById("al_client_details", clientId);

      if (customerData?.result && customerData.result.status === "Customer") {
        console.log("Client status is Customer, mapping data to Formik...");
        formik.setValues((prevValues) => ({
          ...prevValues,
          lifeA: {
            ...prevValues.lifeA,
            ...customerData.result,
            annualIncome:
              customerData.result.income || prevValues.lifeA.annualIncome,
            occupation:
              customerData.result.occupation || prevValues.lifeA.occupation,
          },
        }));
        console.log("Formik values updated with client data:", formik.values);
        await formik.validateForm();
      }
    };

    const fetchPersonDataIfClientIdMatches = async (
      personId,
      storedClientId
    ) => {
      console.log(`Fetching personal data for personID: ${personId}`);
      const personData = await findRecordById("al_person_details", personId);

      if (personData?.result) {
        const { primaryInsured, secondaryInsured, Child, applicationType } =
          personData.result;
        const personClientId = primaryInsured?.person?.client_id;

        console.log("Fetched person data:", personData.result);
        console.log(
          "Comparing clientId in person data:",
          personClientId,
          "with stored clientId:",
          storedClientId
        );

        if (personClientId !== storedClientId) {
          console.warn("ClientID mismatch! Fetching customer data instead...");
          fetchCustomerData(storedClientId);
          return;
        }

        console.log("ClientID matches! Mapping person data to Formik...");
        formik.setValues({
          applicationType: applicationType || "",
          lifeA: {
            title: primaryInsured?.person?.name?.title || "",
            firstName: primaryInsured?.person?.name?.first || "",
            lastName: primaryInsured?.person?.name?.last || "",
            Aadhaar: primaryInsured?.person?.Aadhaar || "",
            Pan: primaryInsured?.person?.Pan || "",
            dateOfBirth: primaryInsured?.person?.dateOfBirth || "",
            age: primaryInsured?.person?.age || "",
            gender: primaryInsured?.person?.gender || "",
            maritalStatus: primaryInsured?.person?.maritalStatus || "",
            alcohol: primaryInsured?.person?.alcohol || "",
            tobacco: primaryInsured?.person?.tobacco || "",
            occupation: primaryInsured?.person?.occupation || "",
            occupationClass: primaryInsured?.person?.occupationClass || "",
            annualIncome: primaryInsured?.person?.annualIncome || "",
            height: primaryInsured?.person?.height || "",
            weight: primaryInsured?.person?.weight || "",
            kids: primaryInsured?.person?.kids || "",
          },
          lifeB: secondaryInsured
            ? {
                title: secondaryInsured?.person?.name?.title || "",
                firstName: secondaryInsured?.person?.name?.first || "",
                lastName: secondaryInsured?.person?.name?.last || "",
                Aadhaar: secondaryInsured?.person?.Aadhaar || "",
                Pan: secondaryInsured?.person?.Pan || "",
                dateOfBirth: secondaryInsured?.person?.dateOfBirth || "",
                age: secondaryInsured?.person?.age || "",
                gender: secondaryInsured?.person?.gender || "",
                maritalStatus: secondaryInsured?.person?.maritalStatus || "",
                alcohol: secondaryInsured?.person?.alcohol || "",
                tobacco: secondaryInsured?.person?.tobacco || "",
                occupation: secondaryInsured?.person?.occupation || "",
                occupationClass:
                  secondaryInsured?.person?.occupationClass || "",
                annualIncome: secondaryInsured?.person?.annualIncome || "",
                height: secondaryInsured?.person?.height || "",
                weight: secondaryInsured?.person?.weight || "",
              }
            : formik.initialValues.lifeB,
          Child: Array.isArray(Child)
            ? Child.map((child) => ({
                title: child?.name?.title || "",
                firstName: child?.name?.first || "",
                lastName: child?.name?.last || "",
                Aadhaar: child?.Aadhaar || "",
                dateOfBirth: child?.dateOfBirth || "",
                age: child?.age || "",
                gender: child?.gender || "",
              }))
            : formik.initialValues.Child,
        });

        console.log("Formik values updated:", formik.values);

        setEnableChildAccordion(primaryInsured?.person?.kids === "yes");
        if (applicationType === "Single Life") {
          setOpenItem(["lifeA"]);
          setIsLifeAEnabled(true);
          setIsLifeBEnabled(false);
        } else if (
          applicationType === "Joint Life" ||
          applicationType === "lifeofanother"
        ) {
          setOpenItem(["lifeA", "lifeB"]);
          setIsLifeAEnabled(true);
          setIsLifeBEnabled(true);
        } else {
          setOpenItem([]);
          setIsLifeAEnabled(false);
          setIsLifeBEnabled(false);
        }

        await formik.validateForm();
      } else {
        console.error(`No data found for personID: ${personId}`);
        fetchCustomerData(storedClientId);
      }
    };

    /** Fix: Ensure backswiping retains `personID` instead of treating as new customer **/
    if (backswipe === "true") {
      console.log("Backswiping detected. Fetching person details...");
      if (storedPersonID) {
        fetchPersonDataIfClientIdMatches(storedPersonID, storedClientId);
      } else {
        console.warn(
          "No storedPersonID found, falling back to clientId data..."
        );
        fetchCustomerData(storedClientId);
      }
    } else {
      if (!isNewCustomer) {
        if (storedPersonID) {
          console.log("Existing person detected, mapping person data...");
          fetchPersonDataIfClientIdMatches(storedPersonID, storedClientId);
        } else {
          console.warn("No personID found, fetching customer data instead...");
          fetchCustomerData(storedClientId);
        }
      } else {
        console.log("New customer detected, mapping only client data...");
        fetchCustomerData(storedClientId);


      }
    }
  }, []);

  const handleDateOfBirthChange = (e, formName) => {
    const dob = e.target.value;
    // Calculate the age based on the entered DOB
    const age = calculateAge(dob);
    formik.setFieldValue(`${formName}.dateOfBirth`, dob);
    if (formName === "lifeA" || formName === "lifeB") {
      const today = new Date();
      const minDate = new Date(
        today.getFullYear() - 80,
        today.getMonth(),
        today.getDate()
      ); // 80 years
      const maxDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      ); // 18 years

      // Validate DOB
      if (
        dob > maxDate.toISOString().split("T")[0] ||
        dob < minDate.toISOString().split("T")[0]
      ) {
        formik.setFieldError(
          `${formName}.dateOfBirth`,
          "You must be between 18 to 80 years old!"
        );
        formik.setFieldValue(`${formName}.age`, ""); // Clear age if invalid
      } else {
        // Clear errors if the DOB is valid
        formik.setFieldError(`${formName}.dateOfBirth`, "");
        formik.setFieldValue(`${formName}.age`, age); // Set the calculated age
      }
    }

    // Updated path for the child array
    formik.setFieldValue(`${formName}[0].dateOfBirth`, dob);
    // For child, validate the age and set it
    if (formName === "Child") {
      const today = new Date();
      const minDate = new Date(
        today.getFullYear() - 17,
        today.getMonth(),
        today.getDate()
      ); // 17 years
      const maxDate = new Date(
        today.getFullYear() - 0.5,
        today.getMonth(),
        today.getDate()
      ); // 6 months

      // Validate DOB
      if (dob > maxDate || dob < minDate) {
        formik.setFieldError(
          `${formName}[0].dateOfBirth`,
          "Age must be between 6 months to 17 years, 5 months, and 29 days"
        );
        formik.setFieldValue(`${formName}[0].age`, ""); // Clear age if invalid
      } else {
        // Clear errors if the DOB is valid
        formik.setFieldError(`${formName}[0].dateOfBirth`, "");
        formik.setFieldValue(`${formName}[0].age`, age); // Set the calculated age
      }
    }
  };

  const handleChildDateOfBirthChange = (e, childField) => {
    const dob = e.target.value;
    formik.setFieldValue(`${childField}.dateOfBirth`, dob); // Set the date of birth

    // Calculate the age based on the entered DOB
    const age = calculateAge(dob);

    // Validate and set the age
    const today = new Date();
    const minDate = new Date(
      today.getFullYear() - 17,
      today.getMonth(),
      today.getDate()
    ); // 17 years
    const maxDate = new Date(
      today.getFullYear() - 0.5,
      today.getMonth(),
      today.getDate()
    ); // 6 months

    // Validate DOB
    if (dob > maxDate || dob < minDate) {
      formik.setFieldError(
        `${childField}.dateOfBirth`,
        "Age must be between 6 months to 17 years, 5 months, and 29 days"
      );
      formik.setFieldValue(`${childField}.age`, ""); // Clear age if invalid
    } else {
      // Clear errors if the DOB is valid
      formik.setFieldError(`${childField}.dateOfBirth`, "");
      formik.setFieldValue(`${childField}.age`, age); // Set the calculated age
    }
  };

  const formatDateTime = (date) => {
    const pad = (num) => num.toString().padStart(2, "0");
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const formatAadhaar = (value) => {
    return value
      .replace(/\s+/g, "")
      .replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3")
      .trim();
  };

  const handleAccordionClick = (item) => {
    setOpenItem((prevOpenItems) => {
      // Safety check to ensure openItems is always an array
      const updatedItems = Array.isArray(prevOpenItems)
        ? [...prevOpenItems]
        : [];

      if (updatedItems.includes(item)) {
        // If the item is already open, close it
        return updatedItems.filter((openItem) => openItem !== item);
      } else {
        // Otherwise, open the item
        return [...updatedItems, item];
      }
    });
  };

  const handleApplicationTypeChange = (event) => {
    const selectedType = event.target.value;

    console.log("Selected application type:", selectedType);

    sessionStorage.setItem("applicationType", selectedType);
    console.log("applicationType:", selectedType);

    formik.setFieldValue("applicationType", selectedType);

    // Conditional logic to manage LifeA and LifeB accordions
    if (selectedType === "Single Life") {
      setOpenItem(["lifeA"]); // Open LifeA
      setIsLifeAEnabled(true); // Enable LifeA
      setIsLifeBEnabled(false); // Disable LifeB
    } else if (
      selectedType === "Joint Life" ||
      selectedType === "lifeofanother"
    ) {
      setOpenItem(["lifeA", "lifeB"]);
      setIsLifeAEnabled(true); // Enable LifeA
      setIsLifeBEnabled(true); // Enable LifeB
      // setOpenItem([]);  // Clear open items (both can be opened by user)
    } else {
      setOpenItem([]); // Close all if no valid type is selected
      setIsLifeAEnabled(false); // Disable LifeA
      setIsLifeBEnabled(false); // Disable LifeB
    }
  };

  const lifeASchema = Yup.object({
    title: Yup.string().required("Title is required"),

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

    Aadhaar: Yup.string()
      .max(14, "Aadhaar cannot be longer than 12 characters")
      .matches(/^[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}$/, "Aadhaar is invalid")
      .required("Aadhaar is required"),

    Pan: Yup.string()
      .transform((value) => value.toUpperCase()) // Convert to uppercase
      .max(10, "PAN cannot be longer than 10 characters")
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "PAN number is invalid")
      .required("PAN Number is required"),

    dateOfBirth: Yup.date()
      .required("Date of Birth is required")
      .max(new Date(), "Date of Birth cannot be in the future")
      .test(
        "dob",
        "Date of Birth must be between 18 to 80 years old",
        function (value) {
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
        }
      ),

    gender: Yup.string().required("Gender is required"),

    maritalStatus: Yup.string().required("Marital Status is required"),

    tobacco: Yup.string().required("Tobacco consumption status is required"),

    occupation: Yup.string().required("Occupation is required"),

    height: Yup.number()
      .required("Height is required")
      .min(50, "Height must be at least 50 cm") // Minimum height in cm
      .max(250, "Height must be less than or equal to 250 cm"), // Maximum height in cm

    weight: Yup.number()
      .required("Weight is required")
      .min(10, "Weight must be at least 10 kg") // Minimum weight in kg
      .max(300, "Weight must be less than or equal to 300 kg"), // Maximum weight in kg

    occupationClass: Yup.string()
      .matches(
        /^([a-zA-Z0-9]+\s)*[a-zA-Z0-9]+$/,
        "Occupation Class must contain only letters"
      )
      .required("Occupation Class is required"),

    annualIncome: Yup.string()
      .matches(
        /^[0-9\,]+$/,
        "Annual Income must be a number with optional commas"
      )
      .max(15, "Annual Income cannot be longer than 15 characters")
      .required("Annual Income is required"),

    kids: Yup.string().required("Child Inclusion is required"),
  });

  const lifeBSchema = Yup.object({
    title: Yup.string().required("Title is required"),

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

    Aadhaar: Yup.string()
      .max(14, "Aadhaar cannot be longer than 12 characters")
      .matches(
        /^[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}$/,
        "Aadhaar number is invalid"
      )
      .required("Aadhaar number is required"),

    Pan: Yup.string()
      .transform((value) => value.toUpperCase()) // Convert to uppercase
      .max(10, "PAN cannot be longer than 10 characters")
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "PAN number is invalid")
      .required("PAN Number is required"),

    dateOfBirth: Yup.date()
      .required("Date of Birth is required")
      .max(new Date(), "Date of Birth cannot be in the future")
      .test(
        "dob",
        "Date of Birth must be between 18 to 80 years old",
        function (value) {
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
        }
      ),

    gender: Yup.string().required("Gender is required"),

    maritalStatus: Yup.string().required("Marital Status is required"),

    tobacco: Yup.string().required("Tobacco consumption status is required"),

    occupation: Yup.string().required("Occupation is required"),

    occupationClass: Yup.string().required("Occupation Class is required"),

    height: Yup.number()
      .required("Height is required")
      .min(50, "Height must be at least 50 cm") // Minimum height in cm
      .max(250, "Height must be less than or equal to 250 cm"), // Maximum height in cm

    weight: Yup.number()
      .required("Weight is required")
      .min(10, "Weight must be at least 10 kg") // Minimum weight in kg
      .max(300, "Weight must be less than or equal to 300 kg"), // Maximum weight in kg

    annualIncome: Yup.string()
      .matches(
        /^[0-9\,]+$/,
        "Annual Income must be a number with optional commas"
      )
      .max(15, "Annual Income cannot be longer than 15 characters")
      .required("Annual Income is required"),
  });

  const ChildSchema = Yup.array().of(
    Yup.object().shape({
      title: Yup.string().required("Title is required"),

      firstName: Yup.string()
        .max(36, "First Name cannot be longer than 36 characters")
        .matches(
          /^([a-zA-Z]+\s)*([a-zA-Z]+)$/,
          "First Name must only contain letters"
        )
        .required("First Name is required"),

      lastName: Yup.string()
        .max(36, "Last Name cannot be longer than 36 characters")
        .matches(
          /^([a-zA-Z]+\s)*([a-zA-Z]+)$/,
          "Last Name must only contain letters"
        )
        .required("Last Name is required"),

      dateOfBirth: Yup.date()
        .required("Date of Birth is required")
        .max(new Date(), "Date of Birth cannot be in the future")
        .test(
          "dob",
          "Date of Birth must be between 6 months to 17 years, 5 months and 29 days",
          function (value) {
            const today = new Date();
            const maxDate = new Date(
              today.getFullYear() - 0.5,
              today.getMonth(),
              today.getDate()
            ); // 6 months
            const minDate = new Date(
              today.getFullYear() - 17,
              today.getMonth(),
              today.getDate()
            ); // 17 years
            return value <= maxDate && value >= minDate;
          }
        ),
      gender: Yup.string().required("Gender is required"),
    })
  );

  const validationSchema = Yup.object({
    lifeA: lifeASchema,
    Child: ChildSchema,
    // lifeB: lifeBSchema
    ...(storedApplicationType === "Joint Life" && {
      lifeB: lifeBSchema,
      Child: ChildSchema,
    }),
  });

  const formik = useFormik({
    initialValues: {
      lifeA: {
        title: "",
        firstName: "",
        lastName: "",
        Aadhaar: "",
        Pan: "",
        dateOfBirth: "",
        age: "",
        gender: "",
        maritalStatus: "",
        alcohol: "",
        tobacco: "",
        occupation: "",
        occupationClass: "",
        annualIncome: "",
        kids: "",
        height: "",
        weight: "",
      },
      lifeB: {
        title: "",
        firstName: "",
        lastName: "",
        Aadhaar: "",
        Pan: "",
        dateOfBirth: "",
        age: "",
        gender: "",
        maritalStatus: "",
        alcohol: "",
        tobacco: "",
        occupation: "",
        occupationClass: "",
        annualIncome: "",
        height: "",
        weight: "",
      },
      Child: [
        {
          title: "",
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          age: "",
          gender: "",
          Aadhaar: "",
        },
      ],
    },
    //enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    validationSchema: validationSchema,
    validateOnSubmit: true,
    onSubmit: async (values) => {
      const storedApplicationType = sessionStorage.getItem("applicationType");
      const applicationType = values.applicationType || storedApplicationType;
      const clientId = sessionStorage.getItem("clientId");

      if (!applicationType) {
        console.error(
          "Application Type is undefined. Ensure it's set correctly before submission."
        );
        return;
      }

      // validating duplicate aadhar and pan numbers
      const duplicateFields = [];
      if (values.lifeA.Aadhaar === values.lifeB.Aadhaar) {
        duplicateFields.push("Aadhaar");
      }
      if (values.lifeA.Pan === values.lifeB.Pan) {
        duplicateFields.push("PAN");
      }

      if (duplicateFields.length > 0) {
        setModalMessage(
          `Duplicate value found for ${duplicateFields.join(" and ")}.`
        );
        setShowCardModal(true);
        return;
      }

      const currentPersonID = getPersonId;
      sessionStorage.setItem("personID", currentPersonID);

      console.log("Using personID:", currentPersonID);

      if (!currentPersonID) {
        console.log("Generated new client_id:", currentPersonID);

        const newPersonID = `PR${Date.now()}`;
        sessionStorage.setItem("personID", newPersonID);

        // added shubham for Benefit selection screen
        sessionStorage.removeItem("sqsID");
        sessionStorage.removeItem("riderID");

        sessionStorage.removeItem("eReferenceIdthroughproposalsummary");
        sessionStorage.removeItem("erefid");

        // added shubham for questionnaire screen
        sessionStorage.removeItem("disabledSections");

        console.log("Setting new personID:", newPersonID);
        setPersonId(newPersonID);
      } else {
        console.log("Using existing client_id from context:", currentPersonID);
      }

      let personData = {};
      const storeName = "al_person_details";
      const creationDateTime = formatDateTime(new Date());

      try {
        // Try to find existing client details in IndexedDB
        let existingPersonalDetails;
        try {
          existingPersonalDetails = await findRecordById(
            storeName,
            currentPersonID
          );
        } catch (error) {
          console.warn(
            "No existing record found, proceeding to save new client details."
          );
          existingPersonalDetails = null;
        }

        const freshPersonID = sessionStorage.getItem("personID");
        console.log("freshPersonID:", freshPersonID);

        if (applicationType === "Single Life") {
          personData = {
            applicationType,
            primaryInsured: {
              person: {
                creationDateTime,
                person_id: freshPersonID || currentPersonID,
                client_id: clientId || "",
                dateOfBirth: values.lifeA.dateOfBirth || "",
                Aadhaar: values.lifeA.Aadhaar || "",
                Pan: values.lifeA.Pan || "",
                gender: values.lifeA.gender || "",
                height: values.lifeA.height || "",
                weight: values.lifeA.weight || "",
                age: values.lifeA.age || "",
                maritalStatus: values.lifeA.maritalStatus || "",
                annualIncome: values.lifeA.annualIncome || "",
                occupation: values.lifeA.occupation || "",
                occupationClass: values.lifeA.occupationClass || "",
                alcohol: values.lifeA.alcohol || "",
                tobacco: values.lifeA.tobacco || "",
                kids: values.lifeA.kids || "",
                name: {
                  first: values.lifeA.firstName || "",
                  last: values.lifeA.lastName || "",
                  title: values.lifeA.title || "",
                },
              },
            },
            Child: values.Child.map((child, index) => ({
              creationDateTime,
              person_id: `PR${Date.now() + index + 1}`, // Use 'index' to create unique child ID
              name: {
                first: child.firstName || "",
                last: child.lastName || "",
                title: child.title || "",
              },
              dateOfBirth: child.dateOfBirth || "",
              age: child.age || "",
              gender: child.gender || "",
              Aadhaar: child.Aadhaar || "",
            })),
            person_id: currentPersonID,
          };
        }

        if (
          applicationType === "Joint Life" ||
          applicationType === "lifeofanother"
        ) {
          const slifePersonID = `PR${Date.now() + 1}`;
          personData = {
            applicationType,
            primaryInsured: {
              person: {
                creationDateTime,
                person_id: freshPersonID || currentPersonID,
                client_id: clientId || "",
                dateOfBirth: values.lifeA.dateOfBirth || "",
                Aadhaar: values.lifeA.Aadhaar || "",
                Pan: values.lifeA.Pan || "",
                gender: values.lifeA.gender || "",
                height: values.lifeA.height || "",
                weight: values.lifeA.weight || "",
                age: values.lifeA.age || "",
                maritalStatus: values.lifeA.maritalStatus || "",
                annualIncome: values.lifeA.annualIncome || "",
                occupation: values.lifeA.occupation || "",
                occupationClass: values.lifeA.occupationClass || "",
                alcohol: values.lifeA.alcohol || "",
                tobacco: values.lifeA.tobacco || "",
                kids: values.lifeA.kids || "",
                name: {
                  first: values.lifeA.firstName || "",
                  last: values.lifeA.lastName || "",
                  title: values.lifeA.title || "",
                },
              },
            },
            secondaryInsured: {
              person: {
                creationDateTime,
                person_id: slifePersonID,
                client_id: clientId || "",
                dateOfBirth: values.lifeB.dateOfBirth || "",
                Aadhaar: values.lifeB.Aadhaar || "",
                Pan: values.lifeB.Pan || "",
                gender: values.lifeB.gender || "",
                height: values.lifeB.height || "",
                weight: values.lifeB.weight || "",
                age: values.lifeB.age || "",
                maritalStatus: values.lifeB.maritalStatus || "",
                annualIncome: values.lifeB.annualIncome || "",
                occupation: values.lifeB.occupation || "",
                occupationClass: values.lifeB.occupationClass || "",
                alcohol: values.lifeB.alcohol || "",
                tobacco: values.lifeB.tobacco || "",
                name: {
                  first: values.lifeB.firstName || "",
                  last: values.lifeB.lastName || "",
                  title: values.lifeB.title || "",
                },
              },
            },
            Child: values.Child.map((child, index) => ({
              creationDateTime,
              person_id: `PR${Date.now() + index + 1}`, // Use 'index' to create unique child ID
              name: {
                first: child.firstName || "",
                last: child.lastName || "",
                title: child.title || "",
              },
              dateOfBirth: child.dateOfBirth || "",
              age: child.age || "",
              gender: child.gender || "",
              Aadhaar: child.Aadhaar || "",
            })),
            person_id: currentPersonID,
          };
        }

        console.log(
          `Submitting data for ${applicationType} in ${storeName}:`,
          personData
        );

        if (existingPersonalDetails) {
          console.log(
            "Existing record found. Updating client details in IndexedDB..."
          );

          // Update the existing record in IndexedDB
          await updateDetailById(storeName, currentPersonID, personData);
          console.log(
            "Personal details updated successfully in IndexedDB!",
            personData
          );
        } else {
          console.log("No existing record found. Saving new client details...");

          // Save new client details in IndexedDB
          await saveDetail(storeName, personData);
          console.log(
            `Data saved under personID: ${freshPersonID || currentPersonID}`,
            personData
          );
        }
      } catch (error) {
        console.error(`Failed to save data for ${applicationType}:`, error);
      }

      sessionStorage.setItem("Submitted", true);

      navigate_to_benefitselection();
    },
  });

  const handleCombinedSubmit = async () => {
    await formik.handleSubmit();
  };

  const handleKidsInclusionChange = (event) => {
    const includeKids = event.target.value === "yes";
    setEnableChildAccordion(includeKids); // Enable accordion if "Yes" is selected
    sessionStorage.setItem("setChildInclusion", includeKids);
    console.log("Got the ChildInclusion from session", includeKids);

    if (!includeKids) {
      // Clear all child fields and close the accordion if "No" is selected
      formik.setFieldValue("Child", []);
      setOpenItem((prevItems) => prevItems.filter((item) => item !== "Child"));
    } else {
      // Open the accordion and ensure the first child exists
      formik.setFieldValue("Child", [
        {
          title: "",
          firstName: "",
          lastName: "",
          Aadhaar: "",
          dateOfBirth: "",
          age: "",
          gender: "",
        },
      ]);
      setOpenItem((prevItems) => [...prevItems, "Child"]);
    }
  };

  // Add a new child
  const addNewChild = () => {
    if (formik.values.Child.length < 5) {
      formik.setFieldValue("Child", [
        ...formik.values.Child,
        {
          title: "",
          firstName: "",
          lastName: "",
          Aadhaar: "",
          dateOfBirth: "",
          age: "",
          gender: "",
        },
      ]);
    }
  };

  // Remove a child by index
  const removeChild = (index) => {
    const updatedChildren = formik.values.Child.filter((_, i) => i !== index);
    formik.setFieldValue("Child", updatedChildren);
  };

  const handleBack = () => {
    navigate("/customer");
  };

  const navigate_to_benefitselection = () => {
    navigate("/benefitselection");
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
        document.body.classList.add("ios-safearea");
      } else {
        document.body.classList.remove("ios-safearea");
      }
      

      
  return (
    <SidebarLayout>
      <div className="sqs-personal-detail-container">
        <div className="quotationForm">
          <div className="col-md-6 lifedropdown mb-4">
            <label>
              Proposal Type<span className="text-danger">*</span>
            </label>
            <select
              id="ApplicationType"
              name="ApplicationType"
              onChange={handleApplicationTypeChange}
              value={formik.values.applicationType}
              className="form-control"
            >
              <option value="">Select</option>
              <option value="Single Life">Single Life</option>
              <option value="Joint Life">Joint Life</option>
              <option value="lifeofanother">Life of Another</option>
            </select>
          </div>

          <div className="accordion">
            <AccordionItem
              title="Life A: Proposed Insured Details"
              isOpen={Array.isArray(openItem) && openItem.includes("lifeA")}
              onClick={() => handleAccordionClick("lifeA")}
              disabled={!isLifeAEnabled}
            >
              <form onSubmit={formik.handleSubmit} className="quoteform">
                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeA.title">
                      Title<span className="text-danger">*</span>
                    </label>
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
                      <option value="drmiss">Dr.miss</option>
                      <option value="dr">Dr.</option>
                      <option value="drmrs">Dr.mrs</option>
                    </select>
                    {formik.touched.lifeA?.title &&
                    formik.errors.lifeA?.title ? (
                      <div className="text-danger">
                        {formik.errors.lifeA.title}
                      </div>
                    ) : null}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeA.firstName">
                      First Name<span className="text-danger">*</span>
                    </label>
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
                    {formik.touched.lifeA?.firstName &&
                    formik.errors.lifeA?.firstName ? (
                      <div className="text-danger">
                        {formik.errors.lifeA.firstName}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeA.lastName">
                      Last Name<span className="text-danger">*</span>
                    </label>
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
                    {formik.touched.lifeA?.lastName &&
                    formik.errors.lifeA?.lastName ? (
                      <div className="text-danger">
                        {formik.errors.lifeA.lastName}
                      </div>
                    ) : null}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeA.Aadhaar">
                      Aadhar Number<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="lifeA.Aadhaar"
                      name="lifeA.Aadhaar"
                      className="form-control"
                      onChange={(e) => {
                        formik.handleChange(e);
                        formik.setFieldValue(
                          "lifeA.Aadhaar",
                          formatAadhaar(e.target.value)
                        );
                      }}
                      onBlur={formik.handleBlur}
                      value={formik.values.lifeA.Aadhaar}
                      maxLength="14"
                    />

                    {formik.touched.lifeA?.Aadhaar &&
                    formik.errors.lifeA?.Aadhaar ? (
                      <div className="text-danger">
                        {formik.errors.lifeA.Aadhaar}
                      </div>
                    ) : null}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeA.Pan">
                      Pan Number<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="lifeA.Pan"
                      name="lifeA.Pan"
                      className="form-control"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.lifeA.Pan}
                      maxLength="11"
                    />
                    {formik.touched.lifeA?.Pan && formik.errors.lifeA?.Pan ? (
                      <div className="text-danger">
                        {formik.errors.lifeA.Pan}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeA.dateOfBirth">
                      Date of Birth<span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      id="lifeA.dateOfBirth"
                      name="lifeA.dateOfBirth"
                      className="form-control"
                      onChange={(e) => handleDateOfBirthChange(e, "lifeA")}
                      onBlur={formik.handleBlur}
                      value={formik.values.lifeA.dateOfBirth}
                      readOnly
                    />
                    {formik.touched.lifeA?.dateOfBirth &&
                    formik.errors.lifeA?.dateOfBirth ? (
                      <div className="text-danger">
                        {formik.errors.lifeA.dateOfBirth}
                      </div>
                    ) : null}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeA.age">
                      Age<span className="text-danger">*</span>
                    </label>
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
                      <div className="text-danger">
                        {formik.errors.lifeA.age}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeA.height">
                      Height(CM)<span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      id="lifeA.height"
                      name="lifeA.height"
                      className="form-control"
                      onChange={formik.handleChange}
                      value={formik.values.lifeA.height}
                    />
                    {formik.touched.lifeA?.height &&
                    formik.errors.lifeA?.height ? (
                      <div className="text-danger">
                        {formik.errors.lifeA.height}
                      </div>
                    ) : null}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeA.weight">
                      Weight(KG)<span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      id="lifeA.weight"
                      name="lifeA.weight"
                      className="form-control"
                      onChange={formik.handleChange}
                      value={formik.values.lifeA.weight}
                    />
                    {formik.touched.lifeA?.weight &&
                    formik.errors.lifeA?.weight ? (
                      <div className="text-danger">
                        {formik.errors.lifeA.weight}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeA.maritalStatus">
                      Marital Status<span className="text-danger">*</span>
                    </label>
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
                    {formik.touched.lifeA?.maritalStatus &&
                    formik.errors.lifeA?.maritalStatus ? (
                      <div className="text-danger">
                        {formik.errors.lifeA.maritalStatus}
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
                          id="lifeA.male"
                          name="lifeA.gender"
                          value="male"
                          className="form-check-input"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          checked={formik.values.lifeA.gender === "male"}
                          disabled
                        />
                        <label
                          htmlFor="lifeA.male"
                          className="form-check-label"
                        >
                          Male
                        </label>
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
                          checked={formik.values.lifeA.gender === "female"}
                          disabled
                        />
                        <label
                          htmlFor="lifeA.female"
                          className="form-check-label"
                        >
                          Female
                        </label>
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
                          checked={formik.values.lifeA.gender === "other"}
                          disabled
                        />
                        <label
                          htmlFor="lifeA.other"
                          className="form-check-label"
                        >
                          Other
                        </label>
                      </div>
                    </div>
                    {formik.touched.lifeA?.gender &&
                    formik.errors.lifeA?.gender ? (
                      <div className="text-danger">
                        {formik.errors.lifeA.gender}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeA.alcohol">
                      Do you consume alcohol?
                    </label>
                    <div className="d-flex">
                      <div className="form-check">
                        <input
                          type="radio"
                          id="lifeA.alcohol-yes"
                          name="lifeA.alcohol"
                          value="yes"
                          className="form-check-input"
                          onChange={formik.handleChange}
                          checked={formik.values.lifeA.alcohol === "yes"}
                        />
                        <label
                          htmlFor="lifeA.alcohol-yes"
                          className="form-check-label"
                        >
                          Yes
                        </label>
                      </div>
                      <div className="form-check ml-2">
                        <input
                          type="radio"
                          id="lifeA.alcohol-no"
                          name="lifeA.alcohol"
                          value="no"
                          className="form-check-input"
                          onChange={formik.handleChange}
                          checked={formik.values.lifeA.alcohol === "no"}
                        />
                        <label
                          htmlFor="lifeA.alcohol-no"
                          className="form-check-label"
                        >
                          No
                        </label>
                      </div>
                    </div>
                    {formik.errors.lifeA?.alcohol &&
                    formik.touched.lifeA?.alcohol ? (
                      <div className="text-danger">
                        {formik.errors.lifeA.alcohol}
                      </div>
                    ) : null}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeA.tobacco">
                      Do you consume tobacco?
                      <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex">
                      <div className="form-check">
                        <input
                          type="radio"
                          id="lifeA.tobacco-yes"
                          name="lifeA.tobacco"
                          value="yes"
                          className="form-check-input"
                          onChange={formik.handleChange}
                          checked={formik.values.lifeA.tobacco === "yes"}
                        />
                        <label
                          htmlFor="lifeA.tobacco-yes"
                          className="form-check-label"
                        >
                          Yes
                        </label>
                      </div>
                      <div className="form-check ml-2">
                        <input
                          type="radio"
                          id="lifeA.tobacco-no"
                          name="lifeA.tobacco"
                          value="no"
                          className="form-check-input"
                          onChange={formik.handleChange}
                          checked={formik.values.lifeA.tobacco === "no"}
                        />
                        <label
                          htmlFor="lifeA.tobacco-no"
                          className="form-check-label"
                        >
                          No
                        </label>
                      </div>
                    </div>
                    {formik.touched.lifeA?.tobacco &&
                    formik.errors.lifeA?.tobacco ? (
                      <div className="text-danger">
                        {formik.errors.lifeA.tobacco}
                      </div>
                    ) : null}
                  </div>
                </div>

                <h4>Occupation Details</h4>
                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeA.occupation">
                      Occupation<span className="text-danger">*</span>
                    </label>
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
                      <option value="Self Employed/professonal-5">
                        Self Employed/professonal-5
                      </option>
                      <option value="Others-5">Others-5</option>
                    </select>
                    {formik.touched.lifeA?.occupation &&
                    formik.errors.lifeA?.occupation ? (
                      <div className="text-danger">
                        {formik.errors.lifeA.occupation}
                      </div>
                    ) : null}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeA.occupationClass">
                      Occupation Class<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="lifeA.occupationClass"
                      name="lifeA.occupationClass"
                      className="form-control"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.lifeA.occupationClass}
                    />
                    {formik.touched.lifeA?.occupationClass &&
                    formik.errors.lifeA?.occupationClass ? (
                      <div className="text-danger">
                        {formik.errors.lifeA.occupationClass}
                      </div>
                    ) : null}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeA.annualIncome">
                      Annual Income<span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      id="lifeA.annualIncome"
                      name="lifeA.annualIncome"
                      className="form-control"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.lifeA.annualIncome}
                      readOnly
                    />
                    {formik.touched.lifeA?.annualIncome &&
                    formik.errors.lifeA?.annualIncome ? (
                      <div className="text-danger">
                        {formik.errors.lifeA.annualIncome}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeA.kids">
                      Would you like to include kids?
                      <span className="text-danger">*</span>
                    </label>
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
                          checked={formik.values.lifeA.kids === "yes"}
                        />
                        <label
                          htmlFor="lifeA.kids-yes"
                          className="form-check-label"
                        >
                          Yes
                        </label>
                      </div>
                      <div className="form-check ml-2">
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
                          checked={formik.values.lifeA.kids === "no"}
                        />
                        <label
                          htmlFor="lifeA.kids-no"
                          className="form-check-label"
                        >
                          No
                        </label>
                      </div>
                    </div>
                    {formik.errors.lifeA?.kids && formik.touched.lifeA?.kids ? (
                      <div className="text-danger">
                        {formik.errors.lifeA.kids}
                      </div>
                    ) : null}
                  </div>
                </div>
              </form>
            </AccordionItem>

            <AccordionItem
              title="Life B: Spouse Details"
              isOpen={Array.isArray(openItem) && openItem.includes("lifeB")}
              onClick={() => handleAccordionClick("lifeB")}
              disabled={!isLifeBEnabled}
            >
              <form onSubmit={formik.handleSubmit} className="quoteform">
                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeB.title">
                      Title<span className="text-danger">*</span>
                    </label>
                    <select
                      id="lifeB.title"
                      name="lifeB.title"
                      className="form-control"
                      onChange={(e) => {
                        const selectedTitle = e.target.value;
                        const lifeAGender = formik.values.lifeA.gender;
                        const lifeBGender = formik.values.lifeB.gender;

                        // Map gender based on title
                        let mappedGender = "";
                        if (selectedTitle === "mr" || selectedTitle === "dr") {
                          mappedGender = "male";
                        } else if (
                          ["mrs", "miss", "ms", "drmiss", "drmrs"].includes(
                            selectedTitle
                          )
                        ) {
                          mappedGender = "female";
                        }

                        // Check for conflicts: same title or same gender
                        if (
                          selectedTitle === formik.values.lifeA.title || // Same title conflict
                          (mappedGender && mappedGender === lifeAGender) // Same gender conflict
                        ) {
                          setShowModal(true); // Show the modal alert
                        } else {
                          formik.setFieldValue("lifeB.title", selectedTitle); // Update title
                          formik.setFieldValue(
                            "lifeB.gender",
                            mappedGender || ""
                          ); // Update gender if applicable
                        }
                      }}
                      onBlur={formik.handleBlur}
                      value={formik.values.lifeB.title}
                    >
                      <option value="">Select</option>
                      <option value="mr">Mr.</option>
                      <option value="mrs">Mrs.</option>
                      <option value="miss">Miss</option>
                      <option value="ms">Ms.</option>
                      <option value="drmiss">Dr.miss</option>
                      <option value="dr">Dr.</option>
                      <option value="drmrs">Dr.mrs</option>
                    </select>
                    {formik.touched.lifeB?.title &&
                    formik.errors.lifeB?.title ? (
                      <div className="text-danger">
                        {formik.errors.lifeB.title}
                      </div>
                    ) : null}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeB.firstName">
                      First Name<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="lifeB.firstName"
                      name="lifeB.firstName"
                      className="form-control"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.lifeB.firstName}
                    />
                    {formik.touched.lifeB?.firstName &&
                    formik.errors.lifeB?.firstName ? (
                      <div className="text-danger">
                        {formik.errors.lifeB.firstName}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeB.lastName">
                      Last Name<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="lifeB.lastName"
                      name="lifeB.lastName"
                      className="form-control"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.lifeB.lastName}
                    />
                    {formik.touched.lifeB?.lastName &&
                    formik.errors.lifeB?.lastName ? (
                      <div className="text-danger">
                        {formik.errors.lifeB.lastName}
                      </div>
                    ) : null}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeB.Aadhaar">
                      Aadhaar Number<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="lifeB.Aadhaar"
                      name="lifeB.Aadhaar"
                      className="form-control"
                      onChange={(e) => {
                        formik.handleChange(e);
                        formik.setFieldValue(
                          "lifeB.Aadhaar",
                          formatAadhaar(e.target.value)
                        );
                      }}
                      onBlur={formik.handleBlur}
                      value={formik.values.lifeB.Aadhaar}
                      maxLength="14"
                    />
                    {formik.touched.lifeB?.Aadhaar &&
                    formik.errors.lifeB?.Aadhaar ? (
                      <div className="text-danger">
                        {formik.errors.lifeB.Aadhaar}
                      </div>
                    ) : null}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeB.Pan">
                      Pan Number<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="lifeB.Pan"
                      name="lifeB.Pan"
                      className="form-control"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.lifeB.Pan}
                      maxLength="11"
                    />
                    {formik.touched.lifeB?.Pan && formik.errors.lifeB?.Pan ? (
                      <div className="text-danger">
                        {formik.errors.lifeB.Pan}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeB.dateOfBirth">
                      Date of Birth<span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      id="lifeB.dateOfBirth"
                      name="lifeB.dateOfBirth"
                      className="form-control"
                      onChange={(e) => handleDateOfBirthChange(e, "lifeB")}
                      onBlur={formik.handleBlur}
                      value={formik.values.lifeB.dateOfBirth}
                    />
                    {formik.touched.lifeB?.dateOfBirth &&
                    formik.errors.lifeB?.dateOfBirth ? (
                      <div className="text-danger">
                        {formik.errors.lifeB.dateOfBirth}
                      </div>
                    ) : null}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeB.age">
                      Age<span className="text-danger">*</span>
                    </label>
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
                      <div className="text-danger">
                        {formik.errors.lifeB.age}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeB.height">
                      Height(CM)<span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      id="lifeB.height"
                      name="lifeB.height"
                      className="form-control"
                      onChange={formik.handleChange}
                      value={formik.values.lifeB.height}
                    />
                    {formik.touched.lifeB?.height &&
                    formik.errors.lifeB?.height ? (
                      <div className="text-danger">
                        {formik.errors.lifeB.height}
                      </div>
                    ) : null}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeB.weight">
                      Weight(KG)<span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      id="lifeB.weight"
                      name="lifeB.weight"
                      className="form-control"
                      onChange={formik.handleChange}
                      value={formik.values.lifeB.weight}
                    />
                    {formik.touched.lifeB?.weight &&
                    formik.errors.lifeB?.weight ? (
                      <div className="text-danger">
                        {formik.errors.lifeB.weight}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeB.maritalStatus">
                      Marital Status<span className="text-danger">*</span>
                    </label>
                    <select
                      id="lifeB.maritalStatus"
                      name="lifeB.maritalStatus"
                      className="form-control"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.lifeB.maritalStatus}
                    >
                      <option value="">Select</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                    {formik.touched.lifeB?.maritalStatus &&
                    formik.errors.lifeB?.maritalStatus ? (
                      <div className="text-danger">
                        {formik.errors.lifeB.maritalStatus}
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
                          id="lifeB.male"
                          name="lifeB.gender"
                          value="male"
                          className="form-check-input"
                          onChange={(e) => {
                            if (e.target.value === formik.values.lifeA.gender) {
                              setShowModal(true); // Show conflict modal
                            } else {
                              formik.handleChange(e); // Update gender
                            }
                          }}
                          onBlur={formik.handleBlur}
                          checked={formik.values.lifeB.gender === "male"}
                          disabled
                        />
                        <label
                          htmlFor="lifeB.male"
                          className="form-check-label"
                        >
                          Male
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="radio"
                          id="lifeB.female"
                          name="lifeB.gender"
                          value="female"
                          className="form-check-input"
                          onChange={(e) => {
                            if (e.target.value === formik.values.lifeA.gender) {
                              setShowModal(true); // Show conflict modal
                            } else {
                              formik.handleChange(e); // Update gender
                            }
                          }}
                          onBlur={formik.handleBlur}
                          checked={formik.values.lifeB.gender === "female"}
                          disabled
                        />
                        <label
                          htmlFor="lifeB.female"
                          className="form-check-label"
                        >
                          Female
                        </label>
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
                          checked={formik.values.lifeB.gender === "other"}
                          disabled
                        />
                        <label
                          htmlFor="lifeB.other"
                          className="form-check-label"
                        >
                          Other
                        </label>
                      </div>
                    </div>
                    {formik.touched.lifeB?.gender &&
                    formik.errors.lifeB?.gender ? (
                      <div className="text-danger">
                        {formik.errors.lifeB.gender}
                      </div>
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
                          checked={formik.values.lifeB.alcohol === "yes"}
                        />
                        <label
                          htmlFor="lifeB.alcohol-yes"
                          className="form-check-label"
                        >
                          Yes
                        </label>
                      </div>
                      <div className="form-check ml-2">
                        <input
                          type="radio"
                          id="lifeB.alcohol-no"
                          name="lifeB.alcohol"
                          value="no"
                          className="form-check-input"
                          onChange={formik.handleChange}
                          checked={formik.values.lifeB.alcohol === "no"}
                        />
                        <label
                          htmlFor="lifeB.alcohol-no"
                          className="form-check-label"
                        >
                          No
                        </label>
                      </div>
                    </div>
                    {formik.touched.lifeB?.alcohol &&
                    formik.errors.lifeB?.alcohol ? (
                      <div className="text-danger">
                        {formik.errors.lifeB.alcohol}
                      </div>
                    ) : null}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeB.tobacco">
                      Do you consume tobacco?
                      <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex">
                      <div className="form-check">
                        <input
                          type="radio"
                          id="lifeB.tobacco-yes"
                          name="lifeB.tobacco"
                          value="yes"
                          className="form-check-input"
                          onChange={formik.handleChange}
                          checked={formik.values.lifeB.tobacco === "yes"}
                        />
                        <label
                          htmlFor="lifeB.tobacco-yes"
                          className="form-check-label"
                        >
                          Yes
                        </label>
                      </div>
                      <div className="form-check ml-2">
                        <input
                          type="radio"
                          id="lifeB.tobacco-no"
                          name="lifeB.tobacco"
                          value="no"
                          className="form-check-input"
                          onChange={formik.handleChange}
                          checked={formik.values.lifeB.tobacco === "no"}
                        />
                        <label
                          htmlFor="lifeB.tobacco-no"
                          className="form-check-label"
                        >
                          No
                        </label>
                      </div>
                    </div>
                    {formik.touched.lifeB?.tobacco &&
                    formik.errors.lifeB?.tobacco ? (
                      <div className="text-danger">
                        {formik.errors.lifeB.tobacco}
                      </div>
                    ) : null}
                  </div>
                </div>

                <h4>Occupation Details</h4>
                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeB.occupation">
                      Occupation<span className="text-danger">*</span>
                    </label>
                    <select
                      id="lifeB.occupation"
                      name="lifeB.occupation"
                      className="form-control"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.lifeB.occupation}
                    >
                      <option value="">Select</option>
                      <option value="Homemaker-2">Homemaker-2</option>
                      <option value="Retiree-2">Retiree-2</option>
                      <option value="Pensioner-2">Pensioner-2</option>
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
                    {formik.touched.lifeB?.occupation &&
                    formik.errors.lifeB?.occupation ? (
                      <div className="text-danger">
                        {formik.errors.lifeB.occupation}
                      </div>
                    ) : null}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeB.occupationClass">
                      Occupation Class<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="lifeB.occupationClass"
                      name="lifeB.occupationClass"
                      className="form-control"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.lifeB.occupationClass}
                    />
                    {formik.touched.lifeB?.occupationClass &&
                    formik.errors.lifeB?.occupationClass ? (
                      <div className="text-danger">
                        {formik.errors.lifeB.occupationClass}
                      </div>
                    ) : null}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="lifeB.annualIncome">
                      Annual Income<span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      id="lifeB.annualIncome"
                      name="lifeB.annualIncome"
                      className="form-control"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.lifeB.annualIncome}
                    />
                    {formik.touched.lifeB?.annualIncome &&
                    formik.errors.lifeB?.annualIncome ? (
                      <div className="text-danger">
                        {formik.errors.lifeB.annualIncome}
                      </div>
                    ) : null}
                  </div>
                </div>
              </form>
            </AccordionItem>

            <AccordionItem
              title="Child/Children Inclusion"
              isOpen={openItem.includes("Child")}
              onClick={() => handleAccordionClick("Child")}
              disabled={!enableChildAccordion}
            >
              {/* Show first child initially when kids are included */}
              <form onSubmit={formik.handleSubmit} className="quoteform">
                {formik.values.Child.map((child, index) => (
                  <div key={index} className="child-form">
                    <h5>Child {index + 1}</h5>

                    <div className="row mb-3">
                      {/* Title Field */}
                      <div className="col-md-6 mb-3">
                        <label htmlFor={`Child[${index}].title`}>
                          Title<span className="text-danger">*</span>
                        </label>
                        <select
                          id={`Child[${index}].title`}
                          name={`Child[${index}].title`}
                          className="form-control"
                          onChange={(e) => {
                            const selectedTitle = e.target.value;
                            formik.handleChange(e);

                            // Set gender based on title
                            if (
                              selectedTitle === "mr" ||
                              selectedTitle === "master"
                            ) {
                              formik.setFieldValue(
                                `Child[${index}].gender`,
                                "male"
                              );
                            } else if (selectedTitle === "miss") {
                              formik.setFieldValue(
                                `Child[${index}].gender`,
                                "female"
                              );
                            } else {
                              formik.setFieldValue(
                                `Child[${index}].gender`,
                                ""
                              );
                            }
                          }}
                          onBlur={formik.handleBlur}
                          value={formik.values.Child[index]?.title || ""}
                        >
                          <option value="">Select</option>
                          <option value="mr">Mr.</option>
                          <option value="master">Master</option>
                          <option value="miss">Miss</option>
                        </select>
                        {formik.touched.Child?.[index]?.title &&
                          formik.errors.Child?.[index]?.title && (
                            <div className="text-danger">
                              {formik.errors.Child[index].title}
                            </div>
                          )}
                      </div>

                      {/* First Name Field */}
                      <div className="col-md-6 mb-3">
                        <label htmlFor={`Child[${index}].firstName`}>
                          First Name<span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          id={`Child[${index}].firstName`}
                          name={`Child[${index}].firstName`}
                          className="form-control"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.Child[index]?.firstName || ""}
                        />
                        {formik.touched.Child?.[index]?.firstName &&
                          formik.errors.Child?.[index]?.firstName && (
                            <div className="text-danger">
                              {formik.errors.Child[index].firstName}
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="row mb-3">
                      {/* Last Name Field */}
                      <div className="col-md-6 mb-3">
                        <label htmlFor={`Child[${index}].lastName`}>
                          Last Name<span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          id={`Child[${index}].lastName`}
                          name={`Child[${index}].lastName`}
                          className="form-control"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.Child[index]?.lastName || ""}
                        />
                        {formik.touched.Child?.[index]?.lastName &&
                          formik.errors.Child?.[index]?.lastName && (
                            <div className="text-danger">
                              {formik.errors.Child[index].lastName}
                            </div>
                          )}
                      </div>

                      {/* Aadhaar Field */}
                      <div className="col-md-6 mb-3">
                        <label htmlFor={`Child[${index}].Aadhaar`}>
                          Aadhaar
                        </label>
                        <input
                          type="text"
                          id={`Child[${index}].Aadhaar`}
                          name={`Child[${index}].Aadhaar`}
                          className="form-control"
                          onChange={(e) => {
                            formik.handleChange(e);
                            formik.setFieldValue(
                              `Child[${index}].Aadhaar`,
                              formatAadhaar(e.target.value) // Optional Aadhaar formatting function
                            );
                          }}
                          onBlur={formik.handleBlur}
                          value={formik.values.Child[index]?.Aadhaar || ""}
                          maxLength="14"
                        />
                        {formik.touched.Child?.[index]?.Aadhaar &&
                          formik.errors.Child?.[index]?.Aadhaar && (
                            <div className="text-danger">
                              {formik.errors.Child[index].Aadhaar}
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="row mb-3">
                      {/* Date of Birth Field */}
                      <div className="col-md-6 mb-3">
                        <label htmlFor={`Child[${index}].dateOfBirth`}>
                          Date of Birth<span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          id={`Child[${index}].dateOfBirth`}
                          name={`Child[${index}].dateOfBirth`}
                          className="form-control"
                          onChange={(e) => {
                            handleChildDateOfBirthChange(e, `Child[${index}]`); // Call the custom handler for calculating age
                          }}
                          onBlur={formik.handleBlur}
                          value={formik.values.Child[index]?.dateOfBirth || ""}
                        />
                        {formik.touched.Child?.[index]?.dateOfBirth &&
                          formik.errors.Child?.[index]?.dateOfBirth && (
                            <div className="text-danger">
                              {formik.errors.Child[index].dateOfBirth}
                            </div>
                          )}
                      </div>

                      {/* Age Field */}
                      <div className="col-md-6 mb-3">
                        <label htmlFor={`Child[${index}].age`}>
                          Age<span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          id={`Child[${index}].age`}
                          name={`Child[${index}].age`}
                          className="form-control"
                          value={formik.values.Child[index]?.age || ""}
                          readOnly // Read-only since age is calculated
                        />
                        {formik.touched.Child?.[index]?.age &&
                          formik.errors.Child?.[index]?.age && (
                            <div className="text-danger">
                              {formik.errors.Child[index].age}
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="row mb-3">
                      {/* Gender Field */}
                      <div className="col-md-6 mb-3">
                        <label>
                          Gender<span className="text-danger">*</span>
                        </label>
                        <div className="d-flex justify-content-between">
                          <div className="form-check">
                            <input
                              type="radio"
                              id={`Child[${index}].gender.male`}
                              name={`Child[${index}].gender`}
                              value="male"
                              className="form-check-input"
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              checked={
                                formik.values.Child[index]?.gender === "male"
                              }
                              disabled // Optional: Disable as gender is auto-set by title
                            />
                            <label
                              htmlFor={`Child[${index}].gender.male`}
                              className="form-check-label"
                            >
                              Male
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              type="radio"
                              id={`Child[${index}].gender.female`}
                              name={`Child[${index}].gender`}
                              value="female"
                              className="form-check-input"
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              checked={
                                formik.values.Child[index]?.gender === "female"
                              }
                              disabled // Optional: Disable as gender is auto-set by title
                            />
                            <label
                              htmlFor={`Child[${index}].gender.female`}
                              className="form-check-label"
                            >
                              Female
                            </label>
                          </div>
                        </div>
                        {formik.touched.Child?.[index]?.gender &&
                          formik.errors.Child?.[index]?.gender && (
                            <div className="text-danger">
                              {formik.errors.Child[index].gender}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add and Remove Buttons */}
                <div className="row mb-3 d-flex justify-content-between">
                  {formik.values.Child.length < 5 && (
                    <div className="col-auto">
                      <button
                        type="button"
                        onClick={addNewChild}
                        className="btn btn-danger"
                      >
                        Add New
                      </button>
                    </div>
                  )}
                  {formik.values.Child.length > 1 && (
                    <div className="col-auto">
                      <button
                        type="button"
                        onClick={() =>
                          removeChild(formik.values.Child.length - 1)
                        }
                        className="btn btn-danger"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </AccordionItem>

            {showModal && (
              <div
                className="modal fade show"
                style={{ display: "block" }}
                tabIndex="-1"
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-body">
                      <p>Gender cannot be the same for Life A and Life B.</p>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => setShowModal(false)}
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Modal show={showCardModal} onHide={handleClose} centered>
              <Modal.Body>{modalMessage}</Modal.Body>
              <Modal.Footer>
                <Button variant="danger" onClick={handleClose}>
                  Ok
                </Button>
              </Modal.Footer>
            </Modal>


            {!isKeyboardVisible && (
               <div className='iosfixednextprevbutton'>
                <div className="fixednextprevbutton d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary btnprev"
                    onClick={handleBack}
                  >
                    Prev
                  </button>
                  <button
                    type="submit"
                    className="btn btnnext"
                    onClick={handleCombinedSubmit}
                  >
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

export default SqsPersonalDetail;
