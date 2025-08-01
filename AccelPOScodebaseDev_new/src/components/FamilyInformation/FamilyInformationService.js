import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import './FamilyInformation.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faTrash,faAngleUp, faAngleDown 
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-bootstrap/Modal";
import { Button, Table } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  saveDetail,
  findRecordById,
  updateDetailById,
} from "../../db/indexedDB";
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

const ValidationModal = ({ show, onHide, message }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={onHide}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const FamilyInformation = () => {
  
  const [showForm, setShowForm] = useState(true);
  const navigate = useNavigate();
  const [familyData, setFamilyData] = useState([]);
  const [familyInformation, setFamilyInformation] = useState([]);
  const [isTouched, setIsTouched] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showModal, setShowModal] = useState(false);
  //const [deleteIndex, setDeleteIndex] = useState(null);
  const [setFamilyInfoId] = useState();
  //const [modalMessage, setModalMessage] = useState("");
  const [showRelationshipFields, setShowRelationshipFields] = useState(false);
  const [showFormB, setShowFormB] = useState(true);
  const [familyDataB, setFamilyDataB] = useState([]);
  const [familyInformationB, setFamilyInformationB] = useState([]);
  const [showCancelB, setShowCancelB] = useState(false);
  const [deleteIndexB, setDeleteIndexB] = useState(null);
  const [showRelationshipFieldsB, setShowRelationshipFieldsB] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // For delete confirmation
  const [showDuplicateModal, setShowDuplicateModal] = useState(false); // For duplicate entry
  const [modalMessage, setModalMessage] = useState(""); // Message for the duplicate modal
  const [deleteIndex, setDeleteIndex] = useState(null); // Index of the record to delete
  const [deleteDataType, setDeleteDataType] = useState("");
  const [showCancelA1, setShowCancelA1] = useState(false);
  const [showCancelB2, setShowCancelB2] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [missingDetails, setMissingDetails] = useState(""); // Store the missing details message
  const [isAlive, setIsAlive] = useState(""); 
  const [isAliveB, setIsAliveB] = useState(""); 
  const CaseId = sessionStorage.getItem("CaseId");
  const [apipayload, setapipayload] = useState();
  const ApplicationType = sessionStorage.getItem("applicationType");
  const isApplicationTypeNullOrEmpty =
  ApplicationType === null || ApplicationType === "";
  const familyInfoId = sessionStorage.getItem("currentFamilyInfoId");
  const erefid = sessionStorage.getItem("erefid");
  const [lifeARelationshipOptions, setLifeARelationshipOptions] = useState([]);
  const [lifeBRelationshipOptions, setLifeBRelationshipOptions] = useState([]);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [validationErrors, setValidationErrors] = useState();

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
    //   const fetchAllData = async () => {
    //     try {
    //       let mappedPrimaryInformation = [];
    //       let mappedSecondaryInformation = [];
    
    //       if (erefid) {
    //         const appData = await findRecordById("al_application_main", erefid);
    //         console.log("al_application_main data in Previous Insurance screen:", appData);
    //         if (appData?.result) {
    //           console.log("Existing product details:", appData.result.product);
    //         }
    //       }
    
    //       if (familyInfoId) {
    //         const famData = await findRecordById("al_family_details", familyInfoId);
    //         console.log("al_family_details data:", famData);
    
    //         if (famData?.result) {
    //           const { primaryInsured = { familyDetails: [], familyInformation: {} }, secondaryInsured } = famData.result;
    
    //           // Define familyInformation variables
    //           const primaryFamilyInformation = primaryInsured?.familyInformation;
    //           const secondaryFamilyInformation = secondaryInsured?.familyInformationB;
    
    //           // Extract Primary `familyInformation`
    //           const hasDiseasePrimary = primaryFamilyInformation?.haveDisease === "yes";
    //           const primaryNewEntry = primaryFamilyInformation?.newEntry || [];
    
    //           // Map Primary Illnesses
    //           if (hasDiseasePrimary) {
    //             mappedPrimaryInformation = primaryNewEntry.map((entry) => ({
    //               relationship: entry.relationship,
    //               illnesses: Object.entries(entry.illnesses || {})
    //                 .filter(([, value]) => value)
    //                 .map(([key]) => key),
    //             }));
    //           }
    //           console.log("Mapped Primary Family Information:", mappedPrimaryInformation);
    
    //           // Extract Secondary `familyInformation`
    //           const hasDiseaseSecondary = secondaryFamilyInformation?.haveDisease === "yes";
    //           const secondaryNewEntry = secondaryFamilyInformation?.newEntry || [];
    
    //           // Map Secondary Illnesses
    //           if (secondaryInsured && hasDiseaseSecondary) {
    //             mappedSecondaryInformation = secondaryNewEntry.map((entry) => ({
    //               relationship: entry.relationship,
    //               illnesses: Object.entries(entry.illnesses || {})
    //                 .filter(([, value]) => value)
    //                 .map(([key]) => key),
    //             }));
    //           }
    //           console.log("Mapped Secondary Family Information:", mappedSecondaryInformation);
    
    //           setShowForm(false);
    //           setShowFormB(false);
    
    //           // Update State
    //           setFamilyData(primaryInsured.familyDetails || []);
    //           setFamilyInformation(mappedPrimaryInformation);
    //           setFamilyDataB(secondaryInsured?.familyDetailsB || []);
    //           setFamilyInformationB(mappedSecondaryInformation);
    
             
    
    //           const newValues = {
    //             familyDetails: primaryInsured.familyDetails
    //             ? JSON.parse(primaryInsured.familyDetails)
    //             : [],
    //            // familyDetails: primaryInsured.familyDetails || [],
    //             familyInformation: {
    //               ...primaryFamilyInformation,
    //               hasDisease: primaryFamilyInformation?.haveDisease || "",
    //               newEntry: mappedPrimaryInformation,
    //             },
    //             familyDetailsB: secondaryInsured?.familyDetailsB
    //           ? JSON.parse(secondaryInsured.familyDetailsB)
    //           : [],
    //            // familyDetailsB: secondaryInsured?.familyDetailsB || [],
    //             familyInformationB: {
    //               ...secondaryFamilyInformation,
    //               hasDiseaseB: secondaryFamilyInformation?.haveDisease || "",
    //               newEntry: mappedSecondaryInformation,
    //             },
    //           };
    
    //           // Reset Formik form with initialized values
    //           console.log({ values: newValues });
    //           formik.resetForm({ values: newValues });
    //         }
    //       }
    
    //       const personID = sessionStorage.getItem("personID");
    //       console.log("Person Id from session:", personID);
    //     } catch (error) {
    //       console.error("Error fetching data:", error);
    //     }
    //   };
    
    //   fetchAllData();
    // }, [erefid, familyInfoId]);
    

     useEffect(() => {
        const fetchAllData = async () => {
          try {
            let primaryIllnesses = [];
            let secondaryIllnesses = [];
            let mappedPrimaryInformation = [];
            let mappedSecondaryInformation = [];
      
            if (erefid) {
              const appData = await findRecordById("al_application_main", erefid);
              console.log(
                "al_application_main data in Previous Insurance screen:",
                appData
              );
      
              if (appData?.result) {
                console.log("Existing product details:", appData.result.product);
              }
            }
      
            if (familyInfoId) {
              const famData = await findRecordById("al_family_details", familyInfoId);
              console.log("al_family_details data:", famData);
      
              if (famData?.result) {
                const {
                  primaryInsured = { familyDetails: [], familyInformation: {} },
                  secondaryInsured,
                } = famData.result;
      
                // Define familyInformation variables
                const primaryFamilyInformation = primaryInsured?.familyInformation;
                const secondaryFamilyInformation = secondaryInsured?.familyInformationB;
      
                // Extract Primary `familyInformation`
                const hasDiseasePrimary = primaryFamilyInformation?.haveDisease === "yes";
                const primaryNewEntry = primaryFamilyInformation?.newEntry || [];
      
                // Map Primary Illnesses
                if (hasDiseasePrimary) {
                  mappedPrimaryInformation = primaryNewEntry.map((entry) => ({
                    relationship: entry.relationship,
                    illnesses: Object.entries(entry.illnesses || {})
                      .filter(([, value]) => value)
                      .map(([key]) => key),
                  }));
                }
                console.log("Mapped Primary Family Information:", mappedPrimaryInformation);
      
                // Extract Secondary `familyInformation`
                const hasDiseaseSecondary = secondaryFamilyInformation?.haveDisease === "yes";
                const secondaryNewEntry = secondaryFamilyInformation?.newEntry || [];
      
                // Map Secondary Illnesses
                if (secondaryInsured && hasDiseaseSecondary) {
                  mappedSecondaryInformation = secondaryNewEntry.map((entry) => ({
                    relationship: entry.relationship,
                    illnesses: Object.entries(entry.illnesses || {})
                      .filter(([, value]) => value)
                      .map(([key]) => key),
                  }));
                }
                console.log(
                  "Mapped Secondary Family Information:",
                  mappedSecondaryInformation
                );
      
                setShowForm(false);
                setShowFormB(false);
      
                // Update State
                setFamilyData(primaryInsured.familyDetails || []);
                setFamilyInformation(mappedPrimaryInformation);
                setFamilyDataB(secondaryInsured?.familyDetailsB || []);
                setFamilyInformationB(mappedSecondaryInformation);
      
                const safeParse = (value, fallback) => {
                  try {
                    return JSON.parse(value);
                  } catch {
                    return fallback;
                  }
                };
                // Update Formik Values
                const newValues = {
                  familyDetails: primaryInsured.familyDetails
                    ? safeParse(primaryInsured.familyDetails)
                    : [],
                  familyInformation: {
                    ...primaryFamilyInformation,
                    hasDisease: primaryInsured.familyInformation?.haveDisease || "",
                    newEntry: mappedPrimaryInformation,
                  },
                  familyDetailsB: secondaryInsured?.familyDetailsB
                  ? safeParse(secondaryInsured.familyDetailsB)
                  : [],
                  familyInformationB: secondaryFamilyInformation
                    ? {
                        ...secondaryFamilyInformation,
                        hasDiseaseB:
                        secondaryInsured.familyInformationB?.haveDisease || "",
                        newEntry: mappedSecondaryInformation,
                      }
                    : {},
                };
                console.log({ values: newValues });
                  formik.resetForm({ values: newValues });
              }
            }
      
            const personID = sessionStorage.getItem("personID");
            console.log("Person Id from session:", personID);
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        };
      
        fetchAllData();
      }, [erefid, familyInfoId]);

  useEffect(() => {
    const fetchPersonDetails = async () => {
      const personID = sessionStorage.getItem("personID");
      if (personID) {
        const personData = await findRecordById("al_person_details", personID);
        if (personData && personData.result) {
          const primaryInsured = personData.result.primaryInsured?.person || {};
          const secondaryInsured = personData.result.secondaryInsured?.person || {};
  
          const primaryInsuredTitle = primaryInsured?.name?.title?.toLowerCase() || "";
          const primaryMaritalStatus = primaryInsured?.maritalStatus?.toLowerCase() || "single";
  
          const secondaryInsuredTitle = secondaryInsured?.name?.title?.toLowerCase() || "";
          const secondaryMaritalStatus = secondaryInsured?.maritalStatus?.toLowerCase() || "single";
  
          // Determine LifeA relationship
          let lifeARelationship = "";
          if (primaryInsuredTitle === "mr" || primaryInsuredTitle === "dr") {
            lifeARelationship = primaryMaritalStatus === "married" ? "Wife" : "";
          } else if (
            ["mrs", "miss", "drmrs", "drmiss"].includes(primaryInsuredTitle)
          ) {
            lifeARelationship = primaryMaritalStatus === "married" ? "Husband" : "";
          }
  
          // Determine LifeB relationship
          let lifeBRelationship = "";
          if (secondaryInsuredTitle === "mr" || secondaryInsuredTitle === "dr") {
            lifeBRelationship = secondaryMaritalStatus === "married" ? "Wife" : "";
          } else if (
            ["mrs", "miss", "drmrs", "drmiss"].includes(secondaryInsuredTitle)
          ) {
            lifeBRelationship = secondaryMaritalStatus === "married" ? "Husband" : "";
          }
  
          console.log("LifeA relationship:", lifeARelationship);
          console.log("LifeB relationship:", lifeBRelationship);
  
          // Set relationship options
          setLifeARelationshipOptions(
            lifeARelationship ? [lifeARelationship] : []
          );
          setLifeBRelationshipOptions(
            lifeBRelationship ? [lifeBRelationship] : []
          );
        } else {
          console.log("Person details not found for ID:", personID);
        }
      }
    };
  
    fetchPersonDetails();
  }, []);
  
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
        document.body.classList.add("ios-safearea");
      } else {
        document.body.classList.remove("ios-safearea");
      }
  
  const getValidationSchema = (ApplicationType) => {
    //console.log("application type ", ApplicationType);

    // base schema for Single Life
    const baseSchema = {
      familyDetails: Yup.object().shape({
        relationship: Yup.string().required("Relationship is required"),
        alive_deceased: Yup.string().required("Alive/Deceased is required"),
        currentage: Yup.number()
          .when('alive_deceased', {
            is: "Alive",
            then: (schema) =>
              schema
                .typeError("Age must be a number")
                .positive("Age must be a positive number")
                .integer("Age must be a whole number")
                .required("Age is required"),
            otherwise: (schema) => schema.notRequired(),
          }),

        healthstatus: Yup.string()
          .when('alive_deceased', {
            is: "Alive",
            then: (schema) =>
              schema
                .max(300, "Maximum 300 characters are allowed")
                .matches(
                  /^([a-zA-Z]+\s)*([a-zA-Z]+)$/,
                  "Health Status must only contain letters"
                )
                .required("Health status is required"),
            otherwise: (schema) => schema
            .matches(
              /^[a-zA-Z\s-]*$/,
              "Health Status must only contain letters, spaces, or hyphens"
            ) 
            .max(300, "Maximum 300 characters are allowed")
            .notRequired(),
          }),

        ageatdeath: Yup.number()
          .when('alive_deceased', {
            is: "Deceased",
            then: (schema) =>
              schema
                .typeError("Age must be a number")
                .positive("Age must be a positive number")
                .integer("Age must be a whole number")
                .required("Age at death is required"),
            otherwise: (schema) => schema.notRequired(),
          }),

        causeofdeath: Yup.string()
          .when('alive_deceased', {
            is: "Deceased",
            then: (schema) =>
              schema
                .max(300, "Maximum 300 characters are allowed")
                .matches(
                  /^([a-zA-Z]+\s)*([a-zA-Z]+)$/,
                  "Cause of Death must only contain letters"
                )
                .required("Cause of death is required"),
            otherwise: (schema) => schema.matches(
              /^[a-zA-Z\s-]*$/,
              "Cause of Death must only contain letters, spaces, or hyphens"
            ) 
            .max(300, "Maximum 300 characters are allowed")
            .notRequired(),
          }),
      }),
      
      familyInformation: Yup.object().shape({
        hasDisease: Yup.string().required(
          "Please Select if you have any disease"
        ),
        relationship: Yup.string().when("hasDisease", {
          is: "yes",
          then: (schema) => schema.required("Relationship is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
        illnesses: Yup.array().when("hasDisease", {
          is: "yes",
          then: (schema) => schema.min(1, "Select at least one illness"),
          otherwise: (schema) => schema.notRequired(),
        }),
      }),
    };

    // schema for Joint Life if applicable
    if (ApplicationType === "Joint Life") {
      return Yup.object().shape({
        ...baseSchema,
        familyDetailsB: Yup.object().shape({
          relationship: Yup.string().required("Relationship is required"),
          alive_deceased: Yup.string().required("Alive/Deceased is required"),
          currentage: Yup.number()
            .when('alive_deceased', {
              is: "Alive",
              then: (schema) =>
                schema
                  .typeError("Age must be a number")
                  .positive("Age must be a positive number")
                  .integer("Age must be a whole number")
                  .required("Age is required"),
              otherwise: (schema) => schema.notRequired(),
            }),
  
          healthstatus: Yup.string()
            .when('alive_deceased', {
              is: "Alive",
              then: (schema) =>
                schema
                  .max(300, "Maximum 300 characters are allowed")
                  .matches(
                    /^([a-zA-Z]+\s)*([a-zA-Z]+)$/,
                    "Health Status must only contain letters"
                  )
                  .required("Health status is required"),
              otherwise: (schema) => schema
              .matches(
                /^[a-zA-Z\s-]*$/,
                "Health Status must only contain letters, spaces, or hyphens"
              ) 
              .max(300, "Maximum 300 characters are allowed")
              .notRequired(),
            }),
  
          ageatdeath: Yup.number()
            .when('alive_deceased', {
              is: "Deceased",
              then: (schema) =>
                schema
                  .typeError("Age must be a number")
                  .positive("Age must be a positive number")
                  .integer("Age must be a whole number")
                  .required("Age at death is required"),
              otherwise: (schema) => schema.notRequired(),
            }),
  
          causeofdeath: Yup.string()
            .when('alive_deceased', {
              is: "Deceased",
              then: (schema) =>
                schema
                  .max(300, "Maximum 300 characters are allowed")
                  .matches(
                    /^([a-zA-Z]+\s)*([a-zA-Z]+)$/,
                    "Cause of Death must only contain letters"
                  )
                  .required("Cause of death is required"),
              otherwise: (schema) => schema.matches(
                /^[a-zA-Z\s-]*$/,
                "Cause of Death must only contain letters, spaces, or hyphens"
              ) 
              .max(300, "Maximum 300 characters are allowed")
              .notRequired(),
            }),
        }),
        familyInformationB: Yup.object().shape({
          hasDiseaseB: Yup.string().required(
            "Please Select if you have any disease"
          ),
          relationship: Yup.string().when("hasDiseaseB", {
            is: "yes",
            then: (schema) => schema.required("Relationship is required"),
            otherwise: (schema) => schema.notRequired(),
          }),
          illnesses: Yup.array().when("hasDiseaseB", {
            is: "yes",
            then: (schema) => schema.min(1, "Select at least one illness"),
            otherwise: (schema) => schema.notRequired(),
          }),
        }),
      });
    }
    // Return schema for Single Life
    return Yup.object().shape(baseSchema);
  };

  const formik = useFormik({
    initialValues: {
      familyDetails: 
       {
          relationship: "",
          currentage: "",
          ageatdeath:"",
          causeofdeath:"",
          healthstatus: "",
          alive_deceased: "",
        },
      
      familyInformation: {
        hasDisease: "",
        relationship: "",
        illnesses: [],
      },
      familyDetailsB: 
        {
          relationship: "",
          currentage: "",
          ageatdeath: "",
          causeofdeath: "",
          healthstatus: "",
          alive_deceased: "",
        },
      
      familyInformationB: {
        hasDiseaseB: "",
        relationship: "",
        illnesses: [],
      },
    },
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: false,
    validationSchema: getValidationSchema(ApplicationType),
    onSubmit: async (values) => {
      console.log( "Generated Validation Schema:", getValidationSchema(ApplicationType) );

      console.log("Form Values submitted:", values);

      // this is for mandatory relationships based on tyitle and marital status selection//
      const personID = sessionStorage.getItem("personID");
      const personData = await findRecordById("al_person_details", personID);

      const title = personData?.result?.primaryInsured?.person?.name?.title?.toLowerCase() || "";
      const maritalStatus = personData?.result?.primaryInsured?.person?.maritalStatus?.toLowerCase() || "single";

      const titleB = personData?.result?.secondaryInsured?.person?.name?.title?.toLowerCase() || "";
      const maritalStatusB = personData?.result?.secondaryInsured?.person?.maritalStatus?.toLowerCase() || "single";

      console.log("Title of LifeA:", title);
      console.log("Marital Status of LifeA:", maritalStatus);
      console.log("Title of LifeB:", titleB);
      console.log("Marital Status of LifeB:", maritalStatusB);
      
      const mandatoryRelationships = ["father", "mother"];
      const spouseRelationships = ["husband", "wife"];

      const validateMandatoryRelationships = (familyData, title, maritalStatus) => {
        const relationships = familyData.map((family) => family.relationship.toLowerCase());

        // Ensure all mandatory relationships are present
        const hasMandatory = mandatoryRelationships.every((relationship) =>
          relationships.includes(relationship)
        );

        // Logic to skip spouse validation based on title and marital status
        const shouldValidateSpouse = !(
          // Skip spouse validation for these conditions
          ((title === "miss" || title === "drmiss") && maritalStatus === "single") || // Single Miss or Dr. Miss
          ((title === "mr" || title === "dr") && maritalStatus === "single") || // Single Mr. or Dr.
          ((title === "mrs" || title === "drmrs") && maritalStatus === "single") // Single Mrs. or Dr. Mrs.
        );

        const hasSpouse = shouldValidateSpouse
          ? spouseRelationships.some((relationship) => relationships.includes(relationship))
          : true;

        // Validation passes only if both mandatory and spouse conditions are met
        return hasMandatory && hasSpouse;
      };

      const isLifeAValid = validateMandatoryRelationships(
        familyData,
        title,
        maritalStatus
      );
      let isLifeBValid = true;
      if (ApplicationType === "Joint Life") {
        isLifeBValid = validateMandatoryRelationships(
          familyDataB,
          titleB,
          maritalStatusB
        );
      }

      if (!isLifeAValid || !isLifeBValid) {
        const missingForLifeA = !isLifeAValid ? "LifeA" : "";
        const missingForLifeB = !isLifeBValid ? "LifeB" : "";
        const missingDetailsMessage = [missingForLifeA, missingForLifeB]
          .filter(Boolean)
          .join(" and ");
        setMissingDetails(
          `Please provide the mandatory parent/spouse details for ${missingDetailsMessage}.`
        );
        setIsModalOpen(true);
        return;
      }
      //ends here

      setIsModalOpen(false);

      const currentFamilyInfoId = familyInfoId || `FI${Date.now()}`;
      sessionStorage.setItem("currentFamilyInfoId", currentFamilyInfoId);

      if (!currentFamilyInfoId) {
        setFamilyInfoId(currentFamilyInfoId);
        console.log("Generated new Family Info Id:", currentFamilyInfoId);
      } else {
        console.log(
          "Using existing Family Info Id from context:",
          currentFamilyInfoId
        );
      }

      let family_Data = {};

      if (ApplicationType === "Single Life") {
        family_Data = {
          primaryInsured: {
            familyDetails: familyData.map((family) => ({
              relationship: family.relationship,
              alive_deceased: family.alive_deceased,
              ...(family.alive_deceased === "Alive"
                ? {
                    currentage: family.currentage,
                    healthstatus: family.healthstatus,
                  }
                : {
                    ageatdeath: family.ageatdeath,
                    causeofdeath: family.causeofdeath,
                  }),
            })),
            familyInformation: {
              haveDisease: values.familyInformation.hasDisease,
              newEntry: familyInformation.map((entry) => ({
                relationship: entry.relationship,
                illnesses: {
                  Diabetes: entry.illnesses?.includes("Diabetes") || false,
                  Hypertension: entry.illnesses?.includes("Hypertension") || false,
                  Heart_Disease: entry.illnesses?.includes("Heart Disease") || false,
                  Cancer: entry.illnesses?.includes("Cancer") || false,
                },
              })),
            },
          },
          family_info_id: currentFamilyInfoId,
        };
        console.log("Submitting with family details:", family_Data);
      }

      if ( ApplicationType === "Joint Life" || ApplicationType === "lifeofanother"
      ) {
        family_Data = {
          primaryInsured: {
            familyDetails: familyData.map((family) => ({
              relationship: family.relationship,
              alive_deceased: family.alive_deceased,
              ...(family.alive_deceased === "Alive"
                ? {
                    currentage: family.currentage,
                    healthstatus: family.healthstatus,
                  }
                : {
                    ageatdeath: family.ageatdeath,
                    causeofdeath: family.causeofdeath,
                  }),
            })),
            familyInformation: {
              haveDisease: values.familyInformation.hasDisease,
              newEntry: familyInformation.map((entry) => ({
                relationship: entry.relationship,
                illnesses: {
                  Diabetes: entry.illnesses?.includes("Diabetes") || false,
                  Hypertension: entry.illnesses?.includes("Hypertension") || false,
                  Heart_Disease: entry.illnesses?.includes("Heart Disease") || false,
                  Cancer: entry.illnesses?.includes("Cancer") || false,
                },
              })),
            },
          },
          secondaryInsured: {
            familyDetailsB: familyDataB.map((family) => ({
              relationship: family.relationship,
              alive_deceased: family.alive_deceased,
              ...(family.alive_deceased === "Alive"
                ? {
                    currentage: family.currentage,
                    healthstatus: family.healthstatus,
                  }
                : {
                    ageatdeath: family.ageatdeath,
                    causeofdeath: family.causeofdeath,
                  }),
            })),
            familyInformationB: {
              haveDisease: values.familyInformationB.hasDiseaseB,
              newEntry: familyInformationB.map((entry) => ({
              relationship: entry.relationship,
              illnesses: {
                diabetes:entry.illnesses?.includes("Diabetes") || false,
                Hypertension: entry.illnesses?.includes("Hypertension") || false,
                Heart_Disease: entry.illnesses?.includes("Heart Disease") || false,
                Cancer: entry.illnesses?.includes("Cancer") || false,
              },
            })),
            },
          },
          family_info_id: currentFamilyInfoId,
        };
        console.log("Submitting with family details:", family_Data);
      }

      //saving in indexedDB and updating in al_application_main table
      try {
        await saveDetail("al_family_details", family_Data);
        console.log("Family data saved:", family_Data);

        // Update `al_application_main` with new family details
        if (erefid) {
          const appData = await findRecordById("al_application_main", erefid);
          if (appData && appData.result) {
            const updatedProduct = {
              ...appData.result,
            };

            updatedProduct.product.primaryInsured =
              updatedProduct.product.primaryInsured || {};
            if (ApplicationType === "Joint Life") {
              updatedProduct.product.secondaryInsured =
                updatedProduct.product.secondaryInsured || {};
            }

            updatedProduct.product.primaryInsured.familyHistory =
              family_Data.primaryInsured;
            if (ApplicationType === "Joint Life") {
              updatedProduct.product.primaryInsured.familyHistory =
                family_Data.primaryInsured;
              updatedProduct.product.secondaryInsured.familyHistory =
                family_Data.secondaryInsured;
            }

            await updateDetailById(
              "al_application_main",
              erefid,
              updatedProduct
            );
            console.log(
              "Updated al_application_main with family details:",
              updatedProduct
            );
          }
        }
      } catch (error) {
        console.error("Error during save and update:", error);
      }

      //AutoSync API call
      try {
        const payload = await findRecordById("al_application_main", erefid);
        console.log(
          "Payload on Family Information screen:::",
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
          console.log("API Response on Family Information screen:", result);
        } catch (error) {
          console.log("Error while calling the API::::", error);
        }

        navigate_to_clients();
      } catch (error) {
        console.log("Error while fetching:::", error);
      }
    },
  });

  const navigate_to_clients = () => {
    navigate("/clientsdeclaration");
  };

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

  const [openItem, setOpenItem] = useState(() => {
          if (ApplicationType === 'Joint Life') {
            return ['lifeA', 'lifeB']; // Both accordions open for Joint Life
          } else if (ApplicationType === 'Single Life') {
            return ['lifeA']; // Only Life A open for Single Life
          }
          return []; // Default case if ApplicationType is null or undefined
  });

  const handleCancel = () => {
    setShowForm(false);
    setShowCancel(false);
    // setFamilyData(false);
  };

  const handleCancelB = () => {
    setShowFormB(false);
    setShowCancelB(false);
    //formik.resetForm();
  };

  const handleCancelA1 = () => {
    setShowRelationshipFields(false);
    setShowCancelA1(false);
  };

  const handleCancelB2 = () => {
    setShowRelationshipFieldsB(false);
    setShowCancelB2(false);
  };
  
  const handleConfirmDelete = () => {
    formik.setErrors({});
    formik.setTouched({});
  
    if (deleteDataType === "familyData") {
      const updatedFamilyData = familyData.filter((_, idx) => idx !== deleteIndex);
      const relationshipToDelete = familyData[deleteIndex]?.relationship;
  
      // Delete from familyInformation
      const updatedFamilyInformation = familyInformation.filter(
        (entry) => entry.relationship !== relationshipToDelete
      );
  
      setFamilyData(updatedFamilyData);
      setFamilyInformation(updatedFamilyInformation);
  
      if (updatedFamilyData.length === 0) {
        setShowForm(true);
        formik.setFieldValue("familyDetails.relationship", "");
        formik.setFieldValue("familyDetails.alive_deceased", "");
        formik.setFieldValue("familyDetails.currentage", "");
        formik.setFieldValue("familyDetails.healthstatus", "");
        setShowRelationshipFields(true);
        formik.setFieldValue("familyInformation.illnesses", []);
      } else {
        setShowForm(false);
      }
    } else if (deleteDataType === "familyInformation") {
      console.log("Before Deletion:", familyInformation);
      console.log("Deleting Index:", deleteIndex);
  
      const updatedFamilyInformation = familyInformation.filter((_, idx) => idx !== deleteIndex);
      console.log("Updating familyInformation:", updatedFamilyInformation);
  
      setFamilyInformation(updatedFamilyInformation);
  
      if (updatedFamilyInformation.length === 0) {
        formik.setFieldValue("familyInformation.hasDisease", "no");
        formik.setFieldValue("familyInformation.relationship", "");
        formik.setFieldValue("familyInformation.illnesses", []);
        setShowRelationshipFields(false);
      } else {
        formik.setFieldValue("familyInformation.hasDisease", "yes");
      }
    } else if (deleteDataType === "familyDataB") {
      const updatedFamilyData = familyDataB.filter((_, idx) => idx !== deleteIndex);
      const relationshipToDelete = familyDataB[deleteIndex]?.relationship;
  
      // Delete from familyInformationB
      const updatedFamilyInformation = familyInformationB.filter(
        (entry) => entry.relationship !== relationshipToDelete
      );
  
      setFamilyDataB(updatedFamilyData);
      setFamilyInformationB(updatedFamilyInformation);
  
      if (updatedFamilyData.length === 0) {
        setShowFormB(true);
        formik.setFieldValue("familyDetailsB.relationship", "");
        formik.setFieldValue("familyDetailsB.alive_deceased", "");
        formik.setFieldValue("familyDetailsB.currentage", "");
        formik.setFieldValue("familyDetailsB.healthstatus", "");
        formik.setFieldValue("familyInformationB.illnesses", []);
        setShowRelationshipFieldsB(true);
      } else {
        setShowFormB(false);
      }
    } else if (deleteDataType === "familyInformationB") {
      console.log("Before Deletion (B):", familyInformationB);
      console.log("Deleting Index (B):", deleteIndex);
  
      const updatedFamilyInformationB = familyInformationB.filter((_, idx) => idx !== deleteIndex);
      console.log("Updating familyInformationB:", updatedFamilyInformationB);
  
      setFamilyInformationB(updatedFamilyInformationB);
  
      if (updatedFamilyInformationB.length === 0) {
        formik.setFieldValue("familyInformationB.hasDiseaseB", "no");
        formik.setFieldValue("familyInformationB.relationship", "");
        formik.setFieldValue("familyInformationB.illnesses", []);
        setShowRelationshipFieldsB(false);
      } else {
        formik.setFieldValue("familyInformationB.hasDiseaseB", "yes");
      }
    }
  
    setShowDeleteModal(false); // Close the delete modal
  };
  
  const handleDuplicateEntry = (message) => {
    setModalMessage(message); // Set the duplicate entry message
    setShowDuplicateModal(true); // Show the duplicate modal
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false); // Close delete modal
    setDeleteIndex(null); // Clear the selected index
  };
  
  const handleCloseDuplicateModal = () => {
    setShowDuplicateModal(false); // Close duplicate modal
  };

  const handleDeleteClick = (index) => {
    console.log("Deleting Index:", index);
    setDeleteIndex(index);
    setShowDeleteModal(true);
    setDeleteDataType("familyData");
  };

  const handleDeleteClickB = (index) => {

    console.log("Deleting Index:", index);

    setDeleteIndex(index);
    setShowDeleteModal(true);
    setDeleteDataType("familyDataB"); // Store which data type to delete from
   
  };

  const handleDeleteClickinformation = (index) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
    setDeleteDataType("familyInformation");
  };
    
  const handleDeleteClickBHealth = (index) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
     setDeleteDataType("familyInformationB");
    
  };

  const handleCombinedSubmit = async (e) => {
    e.preventDefault();
  
    // Proceed with Formik submission
    await formik.handleSubmit();
  
  };

  {validationErrors && (
    <div className="alert alert-danger" role="alert">
      {validationErrors}
    </div>
  )}
  
  
    
  const handleDelete = () => {
    // Delete the family member from the array
    setFamilyData(familyData.filter((_, index) => index !== deleteIndex));
    setShowModal(false); // Close the modal
    setDeleteIndex(null); // Reset delete index
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    const currentIllnesses = formik.values.familyInformation.illnesses || [];

    if (checked) {
      // Add the selected illness to the array
      formik.setFieldValue("familyInformation.illnesses", [
        ...currentIllnesses,
        value,
      ]);
    } else {
      // Remove the deselected illness from the array
      formik.setFieldValue(
        "familyInformation.illnesses",
        currentIllnesses.filter((illness) => illness !== value)
      );
    }
  };

  const handleCheckboxChangeB = (e) => {
    const { value, checked } = e.target;
    const currentIllnesses = formik.values.familyInformationB.illnesses || [];

    if (checked) {
      // Add the selected illness to the array
      formik.setFieldValue("familyInformationB.illnesses", [
        ...currentIllnesses,
        value,
      ]);
    } else {
      // Remove the deselected illness from the array
      formik.setFieldValue(
        "familyInformationB.illnesses",
        currentIllnesses.filter((illness) => illness !== value)
      );
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const validationErrors = await formik.validateForm();
    if (
      Object.keys(validationErrors).length === 0 ||
      !validationErrors.familyDetails
    ) {
      let { relationship } = formik.values.familyDetails;

      // Restricted and multi-entry relationship rules
      const restrictedRelations = ["Father", "Mother", "Husband", "Wife"];
      const multiEntryRelations = ["Brother", "Sister", "Child"];

      // Check if the relationship violates any rules
      if (restrictedRelations.includes(relationship)) {
        const existingEntry = familyData.some(
          (member) => member.relationship === relationship
        );
        if (existingEntry) {
          setModalMessage(`Already you have an entry for ${relationship}`);
          setShowDuplicateModal(true);
          return; // Prevent save
        }
      } else if (multiEntryRelations.includes(relationship)) {
        const similarEntries = familyData.filter((member) =>
          member.relationship.startsWith(relationship)
        ).length;

        if (similarEntries >= 5) {
          setModalMessage(
            `You can only have up to 5 entries for ${relationship}`
          );
          setShowDuplicateModal(true);
          return; // Prevent save
        }

        // Update relationship if multi-entry allowed
        relationship = similarEntries
          ? `${relationship}${similarEntries + 1}`
          : `${relationship}1`;
      }

      const newFamilyMember = { ...formik.values.familyDetails };
     

      if (deleteIndex !== null) {
        const updatedFamilyData = [...familyData];
        updatedFamilyData[deleteIndex] = newFamilyMember;
        setFamilyData(updatedFamilyData);
        setDeleteIndex(null);
      } else {
         setFamilyData((prev) => [...prev, newFamilyMember]);
      }

      console.log("Updated familyData:", familyData);
      setShowForm(false);
      formik.setTouched({
        ...formik.touched, // Preserve touched status of other fields
        familyDetails: {
          relationship: true,
          alive_deceased: true,
          currentage: true,
          ageatdeath: true,
          causeofdeath: true,
          healthstatus: true,
        },
      });
    } else {
      formik.setTouched({
        ...formik.touched, // Preserve touched status of other fields
        familyDetails: {
          relationship: true,
          alive_deceased: true,
          currentage: true,
          ageatdeath: true,
          causeofdeath: true,
          healthstatus: true,
        },
      });
      console.log("Form is invalid, errors:", validationErrors);
    }
  };

  const handleDiseaseSave = async (e) => {
    e.preventDefault();

    // Validate the form
    const validationErrors = await formik.validateForm();
    console.log("Validation errors:", validationErrors);

    // Check if no errors exist for `familyInformation`
    if (
      Object.keys(validationErrors).length === 0 ||
      !validationErrors.familyInformation
    ) {
      const newEntry = {
        relationship: formik.values.familyInformation.relationship,
        illnesses: formik.values.familyInformation.illnesses,
      };

      // Check if the relationship already exists in the familyInformation array
      const isDuplicate = familyInformation.some(
        (member) =>
          member.relationship.toLowerCase() ===
          newEntry.relationship.toLowerCase()
      );

      if (isDuplicate) {
        // Show an alert or modal for duplicate entry
        setModalMessage(
          `You already have an entry for ${newEntry.relationship}`
        );
        setShowDuplicateModal(true);
        return; // Prevent saving if duplicate found
      }

      // Update the state with the new entry
      setFamilyInformation([...familyInformation, newEntry]);
      

      // Clear the form fields for `familyInformation`
      // formik.setFieldValue("familyInformation.relationship", "");
      // formik.setFieldValue("familyInformation.illnesses", []);

      // Hide the form and reset touched state
      setShowRelationshipFields(false);
      formik.setTouched({
        ...formik.touched,
        familyInformation: {
          relationship: true,
          illnesses: true,
          hasDisease: true, // Keep `hasDisease` touched
        },
      });

      console.log("Updated familyData with disease info:", familyInformation);
    } else {
      // Show validation errors for `familyInformation`
      formik.setTouched({
        ...formik.touched,
        familyInformation: {
          hasDisease: true,
          relationship: true,
          illnesses: true,
        },
      });
      console.log("Form is invalid, errors:", validationErrors);
    }
  };

  const handleSaveB = async (e) => {
    e.preventDefault();
    const validationErrors = await formik.validateForm();
    if (
      Object.keys(validationErrors).length === 0 ||
      !validationErrors.familyDetailsB
    ) {
      let { relationship } = formik.values.familyDetailsB;

      // Restricted and multi-entry relationship rules
      const restrictedRelations = ["Father", "Mother", "Husband", "Wife"];
      const multiEntryRelations = ["Brother", "Sister", "Child"];

      // Check if the relationship violates any rules
      if (restrictedRelations.includes(relationship)) {
        const existingEntry = familyDataB.some(
          (member) => member.relationship === relationship
        );
        if (existingEntry) {
          setModalMessage(`Already you have an entry for ${relationship}`);
          setShowDuplicateModal(true);
          return; // Prevent save
        }
      } else if (multiEntryRelations.includes(relationship)) {
        const similarEntries = familyDataB.filter((member) =>
          member.relationship.startsWith(relationship)
        ).length;

        if (similarEntries >= 5) {
          setModalMessage(
            `You can only have up to 5 entries for ${relationship}`
          );
          setShowDuplicateModal(true);
          return; // Prevent save
        }

        // Update relationship if multi-entry allowed
        relationship = similarEntries
          ? `${relationship}${similarEntries + 1}`
          : `${relationship}1`;
      }

      const newFamilyMember = {
        relationship,
        alive_deceased: formik.values.familyDetailsB.alive_deceased,
        currentage: formik.values.familyDetailsB.currentage,
        healthstatus: formik.values.familyDetailsB.healthstatus,
        ageatdeath: formik.values.familyDetailsB.ageatdeath,
        causeofdeath: formik.values.familyDetailsB.causeofdeath,
      };

      if (deleteIndex !== null) {
        const updatedFamilyData = [...familyDataB];
        updatedFamilyData[deleteIndex] = newFamilyMember;
        setFamilyDataB(updatedFamilyData);
        setDeleteIndexB(null);
      } else {
        setFamilyDataB([...familyDataB, newFamilyMember]);
      }

      console.log("Updated familyData:", familyDataB);
      setShowFormB(false);
      formik.setTouched({
        ...formik.touched, // Preserve touched status of other fields
        familyDetailsB: {
          relationship: true,
          alive_deceased: true,
          currentage: true,
          ageatdeath: true,
          causeofdeath: true,
          healthstatus: true,
        },
      });
    } else {
      formik.setTouched({
        ...formik.touched, // Preserve touched status of other fields
        familyDetailsB: {
          relationship: true,
          alive_deceased: true,
          currentage: true,
          ageatdeath: true,
          causeofdeath: true,
          healthstatus: true,
        },
      });
      console.log("Form is invalid, errors:", validationErrors);
    }
  };

  const handleDiseaseSaveB = async (e) => {
    e.preventDefault();

    // Validate the form
    const validationErrors = await formik.validateForm();
    console.log("Validation errors:", validationErrors);

    // Check if no errors exist for `familyInformationB`
    if (
      Object.keys(validationErrors).length === 0 ||
      !validationErrors.familyInformationB
    ) {
      const newEntry = {
        relationship: formik.values.familyInformationB.relationship,
        illnesses: formik.values.familyInformationB.illnesses,
      };

      // Check if the relationship already exists in the familyInformation array
      const isDuplicate = familyInformationB.some(
        (member) =>
          member.relationship.toLowerCase() ===
          newEntry.relationship.toLowerCase()
      );

      if (isDuplicate) {
        // Show an alert or modal for duplicate entry
        setModalMessage(
          `You already have an entry for ${newEntry.relationship}`
        );
        setShowDuplicateModal(true);
        return; // Prevent saving if duplicate found
      }

      // Update the state with the new entry
      setFamilyInformationB([...familyInformationB, newEntry]);

      // Clear the form fields for `familyInformationB`
      // formik.setFieldValue("familyInformationB.relationship", "");
      // formik.setFieldValue("familyInformationB.illnesses", []);

      // Hide the form and reset touched state
      setShowRelationshipFieldsB(false);
      formik.setTouched({
        ...formik.touched,
        familyInformationB: {
          relationship: true,
          illnesses: true,
          hasDiseaseB: true, // Keep `hasDisease` touched
        },
      });

      console.log("Updated familyData with disease info:", familyInformationB);
    } else {
      // Show validation errors for `familyInformationB`
      formik.setTouched({
        ...formik.touched,
        familyInformationB: {
          hasDiseaseB: true,
          relationship: true,
          illnesses: true,
        },
      });
      console.log("Form is invalid, errors:", validationErrors);
    }
  };

  const handleAddMore = () => {
    // formik.resetForm(); // Reset the form values to initial state
    formik.setValues({
      ...formik.values,
      familyDetails: {
        relationship: "",
        alive_deceased: "",
        currentage: "",
        healthstatus: "",
        ageatdeath: "",
        causeofdeath: "",
      },
    });

    // Reset touched state for familyDetails only
    formik.setTouched({
      familyDetails: {
        relationship: false,
        alive_deceased: false,
        currentage: false,
        healthstatus: false,
        ageatdeath: false,
        causeofdeath: false,
      },
    });
    setShowForm(true); // Show the form
    setShowCancel(true);
  };

  const handleAddMoreB = () => {
    formik.setValues({
      ...formik.values,
      familyDetailsB: {
        relationship: "",
        alive_deceased: "",
        currentage: "",
        healthstatus: "",
        ageatdeath: "",
        causeofdeath: "",
      },
    });

    formik.setTouched({
      familyDetailsB: {
        relationship: false,
        alive_deceased: false,
        currentage: false,
        healthstatus: false,
        ageatdeath: false,
        causeofdeath: false,
      },
    });
    setShowFormB(true);
    setShowCancelB(true);
  };

  const handleDiseaseAddMore = () => {
    // Reset relevant fields to initial state
    formik.setFieldValue("familyInformation.hasDisease", "yes");
    formik.setFieldValue("familyInformation.relationship", "");
    formik.setFieldValue("familyInformation.illnesses", []);

    // Mark relevant fields as untouched for validation purposes
    formik.setTouched({
      ...formik.touched,
      familyInformation: {
        hasDisease: true, // Retain the "hasDisease" touched state
        relationship: false,
        illnesses: false,
      },
    });

    // Show the form section again
    setShowRelationshipFields(true);
    setShowCancelA1(true);
  };

  const handleDiseaseAddMoreB = () => {
    // Reset relevant fields to initial state
    formik.setFieldValue("familyInformationB.hasDiseaseB", "yes");
    formik.setFieldValue("familyInformationB.relationship", "");
    formik.setFieldValue("familyInformationB.illnesses", []);

    // Mark relevant fields as untouched for validation purposes
    formik.setTouched({
      ...formik.touched,
      familyInformationB: {
        hasDiseaseB: true, // Retain the "hasDisease" touched state
        relationship: false,
        illnesses: false,
      },
    });

    // Show the form section again
    setShowRelationshipFieldsB(true);
    setShowCancelB2(true);
  };

  const handleRelationshipChange = (e) => {
    const { value } = e.target;
    formik.handleChange(e);

    // Check for duplicate relationship when a new selection is made
    const restrictedRelations = ["Father", "Mother", "Husband", "Wife"];
    const multiEntryRelations = ["Brother", "Sister", "Child"];

    // Allow up to 5 entries for certain relationships
    if (multiEntryRelations.includes(value)) {
      const countEntries = familyData.filter((member) =>
        member.relationship.startsWith(value)
      ).length;

      if (countEntries >= 5) {
        setModalMessage(`You can only have up to 5 entries for ${value}`);
        setShowDuplicateModal(true);
      }
    } else if (restrictedRelations.includes(value)) {
      const existingEntry = familyData.some(
        (member) => member.relationship === value
      );

      if (existingEntry) {
        setModalMessage(`Already you have an entry for ${value}`);
        setShowDuplicateModal(true);
      }
    }
  };

  const handleRelationshipChangeB = (e) => {
    const { value } = e.target;
    formik.handleChange(e);

    // Check for duplicate relationship when a new selection is made
    const restrictedRelations = ["Father", "Mother", "Husband", "Wife"];
    const multiEntryRelations = ["Brother", "Sister", "Child"];

    // Allow up to 5 entries for certain relationships
    if (multiEntryRelations.includes(value)) {
      const countEntries = familyDataB.filter((member) =>
        member.relationship.startsWith(value)
      ).length;

      if (countEntries >= 5) {
        setModalMessage(`You can only have up to 5 entries for ${value}`);
        setShowDuplicateModal(true);
      }
    } else if (restrictedRelations.includes(value)) {
      const existingEntry = familyDataB.some(
        (member) => member.relationship === value
      );

      if (existingEntry) {
        setModalMessage(`Already you have an entry for ${value}`);
        setShowDuplicateModal(true);
      }
    }
  };

  const handleDiseaseRelationshipChangeA = (e) => {
    const selectedRelationship = e.target.value;

    // Check for duplicate relationship
    const isDuplicate = familyInformation.some(
      (entry) => entry.relationship === selectedRelationship
    );

    if (isDuplicate) {
      setModalMessage(`You already have an entry for ${selectedRelationship}.`);
      setShowDuplicateModal(true);
      formik.setFieldValue("familyInformation.relationship", false);
    } else {
      // Update the Formik value if valid
      formik.handleChange(e);
    }
  };

  const handleDiseaseRelationshipChangeB = (e) => {
    const selectedRelationship = e.target.value;

    // Check for duplicate relationship
    const isDuplicate = familyInformationB.some(
      (entry) => entry.relationship === selectedRelationship
    );

    if (isDuplicate) {
      setModalMessage(`You already have an entry for ${selectedRelationship}.`);
      setShowDuplicateModal(true);
      formik.setFieldValue("familyInformation.relationship", false);
    } else {
      // Update the Formik value if valid
      formik.handleChange(e);
    }
  };

  const handleAliveDeceasedChange = (e) => {
    const { value } = e.target;
    setIsAlive(value); // Track if Life A is Alive or Deceased
    formik.setFieldValue("familyDetails.alive_deceased", value);
  
    // Clear or reset dependent fields based on the selection
    if (value === "Alive") {
      formik.setFieldValue("familyDetails.currentage", "");
      formik.setFieldValue("familyDetails.healthstatus", "");
    } else if (value === "Deceased") {
      formik.setFieldValue("familyDetails.ageatdeath", "");
      formik.setFieldValue("familyDetails.causeofdeath", "");
    }
  };
  
  const handleAliveDeceasedChangeB = (e) => {
    const { value } = e.target;
    setIsAliveB(value); // Track if Life B is Alive or Deceased
    formik.setFieldValue("familyDetailsB.alive_deceased", value);
  
    // Clear or reset dependent fields based on the selection
    if (value === "Alive") {
      formik.setFieldValue("familyDetailsB.currentage", "");
      formik.setFieldValue("familyDetailsB.healthstatus", "");
    } else if (value === "Deceased") {
      formik.setFieldValue("familyDetailsB.ageatdeath", "");
      formik.setFieldValue("familyDetailsB.causeofdeath", "");
    }
  };

  return (
     <SidebarLayout>
        <div className="family-detail-container">
          <div className='familyForm'>
            <div className="accordion">
              <AccordionItem
                title="Life A: Proposed Insured Details"
                isOpen={openItem.includes("lifeA")}
                onClick={() => handleAccordionClick("lifeA")}
                disabled={isApplicationTypeNullOrEmpty}
              >
                <p>Family Member Details</p>
                <form onSubmit={formik.handleSubmit} className="eappfamily">
                  {showForm && (
                    <div>
                      <div className="row mb-3">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="familyDetails.relationship">
                            Relationship<span className="text-danger">*</span>
                          </label>
                          <select
                            id="familyDetails.relationship"
                            name="familyDetails.relationship"
                            className="form-control"
                            onChange={(e) => {
                              handleRelationshipChange(e);
                              formik.handleChange(e);
                            }}
                            onBlur={formik.handleBlur}
                            value={formik.values.familyDetails?.relationship || ""} // Default to empty
                          >
                            <option value="">Select</option> {/* Default "Select" option */}
                            {lifeARelationshipOptions.map((relationship) => (
                              <option key={relationship} value={relationship}>
                                {relationship}
                              </option>
                            ))}
                            {/* Fallback options */}
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Brother">Brother</option>
                            <option value="Sister">Sister</option>
                            <option value="Child">Child</option>
                          </select>
                          {formik.touched.familyDetails?.relationship &&
                          formik.errors.familyDetails?.relationship ? (
                            <div className="text-danger">
                              {formik.errors.familyDetails.relationship}
                            </div>
                          ) : null}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="familyDetails.alive_deceased">
                            Alive/Deceased<span className="text-danger">*</span>
                          </label>
                          <select
                            id="familyDetails.alive_deceased"
                            name="familyDetails.alive_deceased"
                            className="form-control"
                            onChange={handleAliveDeceasedChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.familyDetails.alive_deceased}
                          >
                            <option value="">Select</option>
                            <option value="Alive">Alive</option>
                            <option value="Deceased">Deceased</option>
                          </select>
                          {formik.touched.familyDetails?.alive_deceased &&
                          formik.errors.familyDetails?.alive_deceased ? (
                            <div className="text-danger">
                              {formik.errors.familyDetails.alive_deceased}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="row mb-3">
                          <div className="col-md-6 mb-3">
                          <label htmlFor="familyDetails.currentage">
                            {isAlive === "Alive" ? "Current Age" : isAlive === "Deceased" ? "Age at Death" : "Current Age/Age at Death"}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            id={isAlive === "Alive" || isAlive === "" ? "familyDetails.currentage" : "familyDetails.ageatdeath"}
                            name={isAlive === "Alive" || isAlive === "" ? "familyDetails.currentage" : "familyDetails.ageatdeath"}
                            type="number"
                            className="form-control"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={isAlive === "Alive" || isAlive === "" ? formik.values.familyDetails.currentage : formik.values.familyDetails.ageatdeath}
                          />
                          {formik.touched.familyDetails?.currentage &&
                          formik.errors.familyDetails?.currentage &&
                          isAlive === "Alive" ? (
                            <div className="text-danger">
                              {formik.errors.familyDetails.currentage}
                            </div>
                          ) : null}
                          {formik.touched.familyDetails?.ageatdeath &&
                          formik.errors.familyDetails?.ageatdeath &&
                          isAlive === "Deceased" ? (
                            <div className="text-danger">
                              {formik.errors.familyDetails.ageatdeath}
                            </div>
                          ) : null}
                          </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="familyDetails.healthstatus">
                            {isAlive === ""
                              ? "Health Status/Cause of Death"
                              : isAlive === "Alive"
                              ? "Health Status"
                              : "Cause of Death"}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            id={
                              isAlive === "Alive" || isAlive === ""
                                ? "familyDetails.healthstatus"
                                : "familyDetails.causeofdeath"
                            }
                            name={
                              isAlive === "Alive" || isAlive === ""
                                ? "familyDetails.healthstatus"
                                : "familyDetails.causeofdeath"
                            }
                            type="text"
                            className="form-control"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={
                              isAlive === "Alive" || isAlive === ""
                                ? formik.values.familyDetails.healthstatus
                                : formik.values.familyDetails.causeofdeath
                            }
                          />
                          {formik.touched.familyDetails?.healthstatus &&
                          formik.errors.familyDetails?.healthstatus &&
                          isAlive === "Alive" ? (
                            <div className="text-danger">
                              {formik.errors.familyDetails.healthstatus}
                            </div>
                          ) : null}
                          {formik.touched.familyDetails?.causeofdeath &&
                          formik.errors.familyDetails?.causeofdeath &&
                          isAlive === "Deceased" ? (
                            <div className="text-danger">
                              {formik.errors.familyDetails.causeofdeath}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="d-flex justify-content-end">
                        {showCancel && (
                          <button
                            type="button"
                            className="btn btn-danger mx-2"
                            onClick={handleCancel}
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-danger mx-2"
                          onClick={handleSave}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  {familyData.length > 0 && (
                    <div className="mt-3">
                      <h4>Family Details</h4>
                      <div className="table-responsive">
                        <Table striped bordered hover>
                          <thead className="heading">
                            <tr>
                              <th>Relationship</th>
                              <th>Alive/Deceased</th>
                              <th>Current Age/Age At Death</th>
                              <th>Health Status/Cause of Death</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {familyData.map((member, index) => (
                              <tr key={index}>
                                <td>{member.relationship}</td>
                                <td>{member.alive_deceased}</td>
                                <td>
                                  {member.alive_deceased === "Alive"
                                    ? member.currentage
                                    : member.ageatdeath}
                                </td>
                                <td style={{ wordBreak: "break-word" }}>
                                  {member.alive_deceased === "Alive"
                                    ? member.healthstatus
                                    : member.causeofdeath}
                                </td>
                                <td>
                                  <button
                                    className="btn btn-sm"
                                    onClick={() => handleDeleteClick(index)}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                      <button
                        type="button"
                        className="btn btn-danger mt-3"
                        onClick={handleAddMore}
                      >
                        Add More
                      </button>
                    </div>
                  )}

                  <div className="row mt-4">
                    <label className="form-label col-12">
                      Do or have any of the above members suffer/ed from Diabetes, Hypertension, Heart Disease or Cancer?
                      <span className="text-danger">*</span>
                    </label>
                    <div className="col-12 mt-2"> 
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="diseaseYes"
                          name="familyInformation.hasDisease"
                          value="yes"
                          className="form-check-input"
                          onChange={(e) => {
                            formik.handleChange(e);
                            setShowRelationshipFields(e.target.value === "yes"); // Show fields if 'Yes' is selected
                          }}
                          onBlur={formik.handleBlur}
                          checked={formik.values.familyInformation.hasDisease === "yes"}
                        />
                        <label htmlFor="diseaseYes" className="form-check-label">
                          Yes
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="diseaseNo"
                          name="familyInformation.hasDisease"
                          value="no"
                          className="form-check-input"
                          onChange={(e) => {
                            formik.handleChange(e);
                            setShowRelationshipFields(false); // Hide fields
                            setFamilyInformation([]); // Clear saved family information
                            formik.setFieldValue("familyInformation.relationship", ""); // Reset relationship
                            formik.setFieldValue("familyInformation.illnesses", []); // Reset illnesses
                          }}
                          onBlur={formik.handleBlur}
                          checked={formik.values.familyInformation.hasDisease === "no"}
                        />
                        <label htmlFor="diseaseNo" className="form-check-label">
                          No
                        </label>
                      </div>
                    </div>
                    {formik.touched.familyInformation?.hasDisease &&
                    formik.errors.familyInformation?.hasDisease ? (
                      <div className="text-danger ml-3">
                        {formik.errors.familyInformation.hasDisease}
                      </div>
                    ) : null}
                  </div>

                  {/* Conditionally render relationship fields and checkboxes when 'Yes' is selected */}
                  {showRelationshipFields && (
                    <div className="col-md-6 mt-4">
                      <label htmlFor="familyInformation.relationship">
                        Relationship<span className="text-danger">*</span>
                      </label>
                      <select
                        id="familyInformation.relationship"
                        name="familyInformation.relationship"
                        className="form-control"
                        onChange={(e) => {
                          handleDiseaseRelationshipChangeA(e);
                          formik.handleChange(e);
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values.familyInformation.relationship}
                      >
                        <option value="">Select</option>
                        {/* Dynamically generate options based on unique relationships in familyData */}
                        {familyData.length > 0 ? (
                          familyData.map((member, index) => (
                            <option key={index} value={member.relationship}>
                              {member.relationship}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            Please selct the relationship
                          </option>
                        )}
                      </select>
                      {formik.touched.familyInformation?.relationship &&
                      formik.errors.familyInformation?.relationship ? (
                        <div className="text-danger">
                          {formik.errors.familyInformation.relationship}
                        </div>
                      ) : null}

                      <div className="mt-3">
                        <label className="form-label">
                          Select any relevant illnesses:
                        </label>
                        <div className="d-flex flex-wrap gap-3">
                          {["Diabetes", "Cancer", "Heart Disease", "Hypertension"].map(
                            (illness) => (
                              <div className="form-check form-check-inline" key={illness}>
                                <input
                                  type="checkbox"
                                  id={illness}
                                  name="familyInformation.illnesses"
                                  value={illness}
                                  className="form-check-input"
                                  onChange={handleCheckboxChange}
                                  checked={formik.values.familyInformation?.illnesses?.includes(
                                    illness
                                  )}
                                />
                                <label htmlFor={illness} className="form-check-label">
                                  {illness.charAt(0).toUpperCase() + illness.slice(1)}
                                </label>
                              </div>
                            )
                          )}
                        </div>
                        {formik.touched.familyInformation?.illnesses &&
                        formik.errors.familyInformation?.illnesses ? (
                          <div className="text-danger">
                            {formik.errors.familyInformation.illnesses}
                          </div>
                        ) : null}
                      </div>


                      <div className="d-flex">
                        {showCancelA1 && (
                          <button
                            type="button"
                            className="btn btn-danger mx-2"
                            onClick={handleCancelA1}
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-danger mx-2"
                          onClick={handleDiseaseSave}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  {familyInformation.length > 0 && (
                    <div className="mt-4">
                      <h4>Family Health Details</h4>
                      <div className="table-responsive">
                        <Table striped bordered hover>
                          <thead className="heading">
                            <tr>
                              <th>Relationship</th>
                              <th>Illness/Disease</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {familyInformation.map((entry, index) => (
                              <tr key={index}>
                                <td>{entry.relationship}</td>
                                <td>
                                  {entry.illnesses && entry.illnesses.length > 0
                                    ? entry.illnesses.join(", ")
                                    : "No illnesses listed"}
                                </td>
                                <td>
                                  <button
                                    className="btn btn-sm"
                                    onClick={() =>
                                      handleDeleteClickinformation(index)
                                    }
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>

                      <button
                        type="button"
                        className="btn btn-danger mt-3"
                        onClick={handleDiseaseAddMore}
                      >
                        Add More
                      </button>
                    </div>
                  )}
                </form>
              </AccordionItem>

              <AccordionItem
                title="Life B: Spouse Details"
                isOpen={openItem.includes("lifeB")}
                onClick={() => handleAccordionClick("lifeB")}
                disabled={
                  isApplicationTypeNullOrEmpty || ApplicationType === "Single Life"
                }
              >
                <p>Family Member Details</p>
                <form onSubmit={formik.handleSubmit} className="eappfamily">
                  {showFormB && (
                    <div>
                      <div className="row mb-3">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="familyDetailsB.relationship">
                            Relationship<span className="text-danger">*</span>
                          </label>
                          <select
                            id="familyDetailsB.relationship"
                            name="familyDetailsB.relationship"
                            className="form-control"
                            onChange={(e) => {
                              handleRelationshipChangeB(e);
                              formik.handleChange(e);
                            }}
                            onBlur={formik.handleBlur}
                            value={formik.values.familyDetailsB.relationship}
                          >
                            <option value="">Select</option> {/* Default option */}
                            {lifeBRelationshipOptions.map((relationship) => (
                              <option key={relationship} value={relationship}>
                                {relationship}
                              </option>
                            ))}
                            {/* Include fallback options, even if lifeBRelationshipOptions has values */}
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Brother">Brother</option>
                            <option value="Sister">Sister</option>
                            <option value="Child">Child</option>
                          </select>
                          {formik.touched.familyDetailsB?.relationship &&
                          formik.errors.familyDetailsB?.relationship ? (
                            <div className="text-danger">
                              {formik.errors.familyDetailsB.relationship}
                            </div>
                          ) : null}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="familyDetailsB.alive_deceased">
                            Alive/Deceased<span className="text-danger">*</span>
                          </label>
                          <select
                            id="familyDetailsB.alive_deceased"
                            name="familyDetailsB.alive_deceased"
                            className="form-control"
                            onChange={handleAliveDeceasedChangeB}
                            onBlur={formik.handleBlur}
                            value={formik.values.familyDetailsB.alive_deceased}
                          >
                            <option value="">Select</option>
                            <option value="Alive">Alive</option>
                            <option value="Deceased">Deceased</option>
                          </select>
                          {formik.touched.familyDetailsB?.alive_deceased &&
                          formik.errors.familyDetailsB?.alive_deceased ? (
                            <div className="text-danger">
                              {formik.errors.familyDetailsB.alive_deceased}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="row mb-3">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="familyDetailsB.currentage">
                          {isAliveB === "Alive" ? "Current Age" : isAliveB === "Deceased" ? "Age at Death" : "Current Age/Age at Death"}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          id={isAliveB === "Alive" || isAliveB === "" ? "familyDetailsB.currentage" : "familyDetailsB.ageatdeath"}
                          name={isAliveB === "Alive" || isAliveB === "" ? "familyDetailsB.currentage" : "familyDetailsB.ageatdeath"}
                          type="number"
                          className="form-control"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={isAliveB === "Alive" || isAliveB === "" ? formik.values.familyDetailsB.currentage : formik.values.familyDetailsB.ageatdeath}
                        />
                        {formik.touched.familyDetailsB?.currentage &&
                        formik.errors.familyDetailsB?.currentage &&
                        isAliveB === "Alive" ? (
                          <div className="text-danger">
                            {formik.errors.familyDetailsB.currentage}
                          </div>
                        ) : null}
                        {formik.touched.familyDetailsB?.ageatdeath &&
                        formik.errors.familyDetailsB?.ageatdeath &&
                        isAliveB === "Deceased" ? (
                          <div className="text-danger">
                            {formik.errors.familyDetailsB.ageatdeath}
                          </div>
                        ) : null}
                      </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="familyDetailsB.healthstatus">
                            {isAliveB === ""
                              ? "Health Status/Cause of Death"
                              : isAliveB === "Alive"
                              ? "Health Status"
                              : "Cause of Death"}<span className="text-danger">*</span>
                          </label>
                          <input
                            id={
                              isAliveB === "Alive" || isAliveB === ""
                                ? "familyDetailsB.healthstatus"
                                : "familyDetailsB.causeofdeath"
                            }
                            name={
                              isAliveB === "Alive" || isAliveB === ""
                                ? "familyDetailsB.healthstatus"
                                : "familyDetailsB.causeofdeath"
                            }
                            type="text"
                            className="form-control"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={
                              isAliveB === "Alive" || isAliveB === ""
                                ? formik.values.familyDetailsB.healthstatus
                                : formik.values.familyDetailsB.causeofdeath
                            }
                          />
                          {formik.touched.familyDetailsB?.healthstatus &&
                          formik.errors.familyDetailsB?.healthstatus &&
                          isAliveB === "Alive" ?(
                            <div className="text-danger">
                              {formik.errors.familyDetailsB.healthstatus}
                            </div>
                          ) : null}
                          {formik.touched.familyDetailsB?.causeofdeath &&
                          formik.errors.familyDetailsB?.causeofdeath &&
                          isAliveB === "Deceased" ? (
                            <div className="text-danger">
                              {formik.errors.familyDetailsB.causeofdeath}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="d-flex justify-content-end">
                        {showCancelB && (
                          <button
                            type="button"
                            className="btn btn-danger mx-2"
                            onClick={handleCancelB}
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-danger mx-2"
                          onClick={handleSaveB}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  {familyDataB.length > 0 && (
                    <div className="mt-3">
                      <h4>Family Details</h4>
                      <div className="table-responsive">
                        <Table striped bordered hover>
                          <thead className="heading">
                            <tr>
                              <th>Relationship</th>
                              <th>Alive/Deceased</th>
                              <th>Current Age/Age At Death</th>
                              <th>Health Status/Cause of Death</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {familyDataB.map((member, index) => (
                              <tr key={index}>
                                <td>{member.relationship}</td>
                                <td>{member.alive_deceased}</td>
                                <td>
                                  {member.alive_deceased === "Alive"
                                    ? member.currentage
                                    : member.ageatdeath}
                                </td>
                                <td style={{ wordBreak: "break-word" }}>
                                  {member.alive_deceased === "Alive"
                                    ? member.healthstatus
                                    : member.causeofdeath}
                                </td>
                                <td>
                                  <button
                                    className="btn btn-sm"
                                    onClick={() => handleDeleteClickB(index)}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                      <button
                        type="button"
                        className="btn btn-danger mt-3"
                        onClick={handleAddMoreB}
                      >
                        Add More
                      </button>
                    </div>
                  )}

                  <div className="row mt-4">
                    <label className="form-label col-12">
                      Do or have any of the above members suffer/ed from Diabetes,
                      Hypertension, Heart Disease or Cancer?
                      <span className="text-danger">*</span>
                    </label>
                    <div className="col-12 mt-2"> 
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="diseaseYesB"
                          name="familyInformationB.hasDiseaseB"
                          value="yes"
                          className="form-check-input"
                          onChange={(e) => {
                            formik.handleChange(e);
                            setShowRelationshipFieldsB(e.target.value === "yes"); // Show fields if 'Yes' is selected
                          }}
                          onBlur={formik.handleBlur}
                          checked={
                            formik.values.familyInformationB.hasDiseaseB === "yes"
                          }
                        />
                        <label htmlFor="diseaseYesB" className="form-check-label">
                          Yes
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="diseaseNoB"
                          name="familyInformationB.hasDiseaseB" // Updated to be under lifeA
                          value="no"
                          className="form-check-input"
                          onChange={(e) => {
                            formik.handleChange(e); // Handle formik change
                            setShowRelationshipFieldsB(false); // Hide fields
                            setFamilyInformationB([]); // Clear saved family information
                            formik.setFieldValue(
                              "familyInformationB.relationship","" ); // Reset relationship
                            formik.setFieldValue("familyInformationB.illnesses", []); // Reset illnesses
                          }}
                          onBlur={formik.handleBlur}
                          checked={
                            formik.values.familyInformationB.hasDiseaseB === "no"
                          }
                        />
                        <label htmlFor="diseaseNoB" className="form-check-label">
                          No
                        </label>
                      </div>
                    </div>
                    {formik.touched.familyInformationB?.hasDiseaseB &&
                    formik.errors.familyInformationB?.hasDiseaseB ? (
                      <div className="text-danger ml-3">
                        {formik.errors.familyInformationB.hasDiseaseB}
                      </div>
                    ) : null}
                  </div>

                  {/* Conditionally render relationship fields and checkboxes when 'Yes' is selected */}
                  {showRelationshipFieldsB && (
                    <div className="col-md-6 mt-4">
                      <label htmlFor="familyInformationB.relationship">
                        Relationship<span className="text-danger">*</span>
                      </label>
                      <select
                        id="familyInformationB.relationship"
                        name="familyInformationB.relationship"
                        className="form-control"
                        onChange={(e) => {
                          handleDiseaseRelationshipChangeB(e);
                          formik.handleChange(e);
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values.familyInformationB.relationship}
                      >
                        <option value="">Select</option>
                        {/* Dynamically generate options based on unique relationships in familyData */}
                        {familyDataB.length > 0 ? (
                          familyDataB.map((member, index) => (
                            <option key={index} value={member.relationship}>
                              {member.relationship}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            Please selct the relationship
                          </option>
                        )}
                      </select>
                      {formik.touched.familyInformationB?.relationship &&
                      formik.errors.familyInformationB?.relationship ? (
                        <div className="text-danger">
                          {formik.errors.familyInformationB.relationship}
                        </div>
                      ) : null}

                      <div className="mt-3">
                        <label className="form-label">
                          Select any relevant illnesses:
                        </label>
                        <div className="d-flex flex-wrap gap-3">
                          {["Diabetes", "Cancer", "Heart Disease", "Hypertension"].map(
                            (illness) => (
                              <div className="form-check form-check-inline" key={illness}>
                                <input
                                  type="checkbox"
                                  id={illness}
                                  name="familyInformationB.illnesses"
                                  value={illness}
                                  className="form-check-input"
                                  onChange={handleCheckboxChangeB}
                                  checked={formik.values.familyInformationB?.illnesses?.includes(
                                    illness
                                  )}
                                />
                                <label htmlFor={illness} className="form-check-label">
                                  {illness.charAt(0).toUpperCase() + illness.slice(1)}
                                </label>
                              </div>
                            )
                          )}
                        </div>
                        {formik.touched.familyInformationB?.illnesses &&
                        formik.errors.familyInformationB?.illnesses ? (
                          <div className="text-danger">
                            {formik.errors.familyInformationB.illnesses}
                          </div>
                        ) : null}
                      </div>

                      <div className="d-flex">
                        {showCancelB2 && (
                          <button
                            type="button"
                            className="btn btn-danger mx-2"
                            onClick={handleCancelB2}
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-danger mx-2"
                          onClick={handleDiseaseSaveB}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  {familyInformationB.length > 0 && (
                    <div className="mt-4">
                      <h4>Family Health Details</h4>
                      <div className="table-responsive">
                        <Table striped bordered hover>
                          <thead className="heading">
                            <tr>
                              <th>Relationship</th>
                              <th>Illness/Disease</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {familyInformationB.map((entry, index) => (
                              <tr key={index}>
                                <td>{entry.relationship}</td>
                                <td>
                                  {entry.illnesses && entry.illnesses.length > 0
                                    ? entry.illnesses.join(", ")
                                    : "No illnesses listed"}
                                </td>
                                <td>
                                  <button
                                    className="btn btn-sm"
                                    onClick={() => handleDeleteClickBHealth(index)}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                      <button
                        type="button"
                        className="btn btn-danger mt-3"
                        onClick={handleDiseaseAddMoreB}
                      >
                        Add More
                      </button>
                    </div>
                  )}
                </form>
              </AccordionItem>

              {!isKeyboardVisible && (
                <div className="fixednextprevbutton d-flex justify-content-between">
                          <button 
                              type="button" 
                              className="btn btn-secondary btnprev" 
                              onClick={() => navigate('/generalquestionnaire')}
                          > Prev </button>
                              <button type="submit" className="btn btnnext" onClick={(e) => {
                                console.log("formik error", formik.errors );
                                handleCombinedSubmit(e);
                                }}>
                              Next
                              </button>
                  </div>
              )}
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
            <Modal.Body>
              Are you sure you want to delete this family member?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="danger" onClick={handleCloseDeleteModal}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Ok
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Duplicate Entry Modal */}
          <Modal show={showDuplicateModal} onHide={handleCloseDuplicateModal} centered>
            <Modal.Body>{modalMessage}</Modal.Body>
            <Modal.Footer>
            <Button variant="danger" onClick={handleCloseDuplicateModal}>
                OK
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} centered>
            <Modal.Body>
              <p>{missingDetails}</p>
            </Modal.Body>
            <Modal.Footer>
            <Button variant="danger" onClick={() => setIsModalOpen(false)}>
              OK
            </Button>
            </Modal.Footer>
          </Modal>


          <ValidationModal
            show={isModalOpen}
            onHide={() => setIsModalOpen(false)}
            message={missingDetails}
          />
        </div>
     </SidebarLayout>

  );
};

export default FamilyInformation;
