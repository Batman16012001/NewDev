import { useState, useEffect } from "react";
import "./DocumentUpload.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faFolderOpen,
  faCamera,
  faArrowLeft,
  faAngleUp,
  faAngleDown,
} from "@fortawesome/free-solid-svg-icons";
import {
  findRecordById,
  saveDetail,
  updateDetailById,
} from "../../../db/indexedDB";
import { openCamera } from "../../../native/nativeoperation";
import { Capacitor } from "@capacitor/core";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../../Dashboard/Template";

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

const DocumentUpload = () => {
  const [ApplicationType, setApplicationType] = useState();
  const [openItem, setOpenItem] = useState(() => {
    if (ApplicationType === "Joint Life") {
      return ["lifeA", "lifeB"]; // Both accordions open for Joint Life
    } else if (ApplicationType === "Single Life") {
      return ["lifeA"]; // Only Life A open for Single Life
    }
    return []; // Default case if ApplicationType is null or undefined
  });
  const [docIdgenerated, setdocIdgenerated] = useState();
  const [enableChildAccordion, setEnableChildAccordion] = useState(false);
  const [personalData, setpersonalData] = useState();
  const [kids, setkids] = useState();
  const navigate = useNavigate();
  const [apicalldata, setapicalldata] = useState();
  const [noofChildrens, setnoofchildrens] = useState(0);
  const uploadnavigate = useNavigate();
  const [savebuttonclicked, setsavebuttonclicked] = useState(false);
  const [previewUploadclicked, setPreviewUploadClicked] = useState(false);
  const [previewimage, setpreviewimage] = useState(false);
  const [previewdocs, setpreviewdocs] = useState(false);
  const [previewclicked, setpreviewclicked] = useState(false);
  const [initialValues, setInitialValues] = useState({
    bank: "",
    branch: "",
    accountNumber: "",
    relativeName: "",
    relativeContact: "",
    lifeADocuments: [],
    pancardDocuments: [],
    lifeBAadhaarDocuments: [],
    lifeBPancardDocuments: [],
    children: Array.from({ length: noofChildrens }, () => ({
      childAadhaarDocuments: [],
      childBirthCertificateDocuments: [],
    })),
  });

  const [childPreviews, setChildPreviews] = useState({});
  const [dataonbackswipe, setdataonbackswipe] = useState();
  const [lifeADocuments, setLifeADocuments] = useState([]); // State for Life A documents
  const [pancardDocuments, setPancardDocuments] = useState([]); // State for Pancard documents
  const [aadhaarPreview, setAadhaarPreview] = useState(null); // Preview for Aadhaar
  const [pancardPreview, setPancardPreview] = useState(null); // Preview for Pancard
  const [selectedNonMandatoryDocument, setSelectedNonMandatoryDocument] =
    useState("");
  const [nonMandatoryDocuments, setNonMandatoryDocuments] = useState({});
  const [saveClicked, setSaveClicked] = useState(false);

  const [previewdocclicked, setpreviewdocclicked] = useState(false);
  const navigate_to_preview = useNavigate();
  const [ChildData, setChildData] = useState();
  const navigate_to_submission = useNavigate();

  const [lifeBAadhaarDocuments, setLifeBAadhaarDocuments] = useState([]);
  const [lifeBPancardDocuments, setLifeBPancardDocuments] = useState([]);
  const [aadhaarBPreview, setAadhaarBPreview] = useState(null);
  const [pancardBPreview, setPancardBPreview] = useState(null);

  const [Persondata, setpersondata] = useState();

  const [lifeBNonMandatoryDocType, setLifeBNonMandatoryDocType] = useState("");
  const [lifeBNonMandatoryDocuments, setLifeBNonMandatoryDocuments] = useState(
    []
  );

  const personId = sessionStorage.getItem("personID");
  const agentID = sessionStorage.getItem("agentId");
  const caseId = sessionStorage.getItem("CaseId");
  const erefid = sessionStorage.getItem("erefid");

  const [birthCertificatePreview, setBirthCertificatePreview] = useState(null);
  const [aadharpreviewbackswipe, setaadharpreviewbackswipe] = useState();
  let aadharpreviewbackswipeboolean = false;

  const [savelifeADocuments, setsavelifeADocuments] = useState([]);
  const [savelifeAPanDocuments, setsavelifeAPanDocuments] = useState([]);
  const [savelifeBAadharDocuments, setsavelifeBAadharDocuments] = useState([]);
  const [savelifeBPanDocuments, setsavelifeBPanDocuments] = useState([]);
  const [savenonMandatoryDocuments, setsavenonMandatoryDocuments] = useState(
    []
  );
  const [savelifeBNonMandatoryDocuments, setsavelifeBNonMandatoryDocuments] =
    useState([]);
  const [saveChildAadhar, setsaveChildAadhar] = useState([]);
  const [saveChildBirth, setsaveChildBirth] = useState([]);

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
    if (ApplicationType === "Single Life") {
      setOpenItem(["lifeA"]); // Open only Life A accordion
    } else if (ApplicationType === "Joint Life") {
      setOpenItem(["lifeA", "lifeB"]); // Open both Life A and Life B accordions
    } else {
      setOpenItem([]); // Close all accordions if applicationType is empty or undefined
    }
  }, [ApplicationType]); // Dependency to re-run when applicationType changes

  const getOrdinalWord = (index) => {
    const words = ["first", "second", "third", "fourth", "fifth"];
    return words[index] || `${index + 1}th`; // Fallback for unexpected cases
  };

  const generatedocId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  // const handleCombinedSubmit = async () => {
  //     await formik.handleSubmit();
  // };
  const createDocumentDetails = (documents, documentType, documentId) => {
    console.log("documents in createDocumentDetails:::", documents);
    return {
      documentId: docIdgenerated || generatedocId(), // Function to generate random IDs
      documentType: documentType,
      documents: documents.map((doc) => ({
        // Determine the base64Content based on documentType
        base64Content:
          documentType === "DRIVINGLICENSE"
            ? doc.drivingLicence.preview
            : documentType === "PASSPORT"
            ? doc.passport.preview
            : doc.base64,

        // Determine the documentName based on platform and documentType
        documentName:
          Capacitor.getPlatform() === "android" ||
          Capacitor.getPlatform() === "ios"
            ? doc.name // Ensure doc[0]?.name exists safely
            : documentType === "DRIVINGLICENSE"
            ? doc.drivingLicence.file.name
            : documentType === "PASSPORT"
            ? doc.passport.file.name
            : doc.file.name,
      })),
    };
  };

  useEffect(() => {
    const fetchdata = async () => {
      const personData = await findRecordById("al_person_details", personId);
      const fromdocumenytpreview = sessionStorage.getItem(
        "navigatingfromdocupload"
      );

      const savedSaveButtonClicked =
        sessionStorage.getItem("savebuttonclicked") === "true";
      const savedPreviewUploadClicked =
        sessionStorage.getItem("previewUploadclicked") === "true";

      setsavebuttonclicked(savedSaveButtonClicked);
      setPreviewUploadClicked(savedPreviewUploadClicked);

      console.log("Personal Data in Doc upload::::", personData);
      setpersondata(personData);
      console.log("Personal Data Kids::", personData.result.Child);
      setnoofchildrens(personData.result.Child.length);
      //const numChildren = 2;
      console.log("Kids:::", personData.result.primaryInsured.person.kids);
      setpersonalData(personData);
      setChildData(personData.result.Child || []);
      setkids(personData.result.primaryInsured.person.kids);

      const applicationType = sessionStorage.getItem("applicationType");
      setApplicationType(applicationType);

      if (personData.result.primaryInsured.person.kids === "yes") {
        setEnableChildAccordion(true);
      }
      const docid_backswipe = sessionStorage.getItem("docId");

      const docuploaddata = await findRecordById(
        "al_document_details",
        docid_backswipe
      );
      console.log("Data on backswipe::::", docuploaddata);

      console.log("Previewclicked:::", previewclicked);

      const data = docuploaddata.result;
      setdataonbackswipe(data);

      const extractedData = extractInsuredData(data);
      console.log(
        "Document data saved successfully. Extracted Data:::",
        extractedData
      );

      if (extractedData.primaryInsured && data.preview_flag) {
        // Handle Aadhaar Card
        const aadhaarBase64 = extractedData.primaryInsured.find(
          (doc) => doc.documentType === "AADHARCARD"
        )?.documents[0]?.base64Content;

        if (aadhaarBase64) {
          // Ensure no double prefix
          const formattedAadhaarBase64 = aadhaarBase64.startsWith("data:image/")
            ? aadhaarBase64
            : `data:image/jpeg;base64,${aadhaarBase64}`;

          // Set Formik and preview state for Aadhaar
          formik.setFieldValue("lifeADocuments", [
            { base64: formattedAadhaarBase64 },
          ]);
          setAadhaarPreview(formattedAadhaarBase64);
        }

        // Handle PAN Card
        const panBase64 = extractedData.primaryInsured.find(
          (doc) => doc.documentType === "PAN"
        )?.documents[0]?.base64Content;

        if (panBase64) {
          // Ensure no double prefix
          const formattedPanBase64 = panBase64.startsWith("data:image/")
            ? panBase64
            : `data:image/jpeg;base64,${panBase64}`;

          // Set Formik and preview state for PAN
          formik.setFieldValue("pancardDocuments", [
            { base64: formattedPanBase64 },
          ]);
          setPancardPreview(formattedPanBase64);
        }

        // Set other form fields
        formik.setFieldValue("bank", data.bank);
        formik.setFieldValue("branch", data.branch);
        formik.setFieldValue("accountNumber", data.accountNumber);
        formik.setFieldValue("relativeName", data.relativeName);
        formik.setFieldValue("relativeContact", data.relativeContact);
      }

      if (extractedData.secondaryInsured && data.preview_flag) {
        const aadhaarBase64 = extractedData.secondaryInsured.find(
          (doc) => doc.documentType === "AADHARCARD"
        )?.documents[0]?.base64Content;

        if (aadhaarBase64) {
          // Ensure no double prefix
          const formattedAadhaarBase64 = aadhaarBase64.startsWith("data:image/")
            ? aadhaarBase64
            : `data:image/jpeg;base64,${aadhaarBase64}`;

          // Set Formik and preview state for Aadhaar
          formik.setFieldValue("lifeBAadhaarDocuments", [
            { base64: formattedAadhaarBase64 },
          ]);
          setAadhaarBPreview(formattedAadhaarBase64);
        }

        // Handle PAN Card
        const panBase64 = extractedData.secondaryInsured.find(
          (doc) => doc.documentType === "PAN"
        )?.documents[0]?.base64Content;

        if (panBase64) {
          // Ensure no double prefix
          const formattedPanBase64 = panBase64.startsWith("data:image/")
            ? panBase64
            : `data:image/jpeg;base64,${panBase64}`;

          // Set Formik and preview state for PAN
          formik.setFieldValue("lifeBPancardDocuments", [
            { base64: formattedPanBase64 },
          ]);
          setPancardBPreview(formattedPanBase64);
        }
      }

      // if (kids === "yes" && data.preview_flag) {
      //     personData.result.Child.forEach((child, index) => {
      //         const childKey = `child${index + 1}Documents`;
      //         formik.setFieldValue(`${childKey}.childAadhaarDocuments`, extractedData[`firstChildInsured`]?.find(doc => doc.documentType === "AADHARCARD")?.documents || []);
      //         formik.setFieldValue(`${childKey}.childBirthCertificateDocuments`, extractedData[`firstChildInsured`]?.find(doc => doc.documentType === "BIRTHCERTIFICATE")?.documents || []);
      //     });
      // }

      if (
        personData.result.primaryInsured.person.kids === "yes" &&
        data.preview_flag
      ) {
        const ordinalPrefixes = ["first", "second", "third", "fourth", "fifth"];

        personData.result.Child.forEach((child, index) => {
          const childKey = `${ordinalPrefixes[index]}ChildInsured`;

          // Aadhaar for Child
          const childAadhaarBase64 = extractedData[childKey]?.find(
            (doc) => doc.documentType === "AADHARCARD"
          )?.documents[0]?.base64Content;

          if (childAadhaarBase64) {
            const formattedAadhaarBase64 = childAadhaarBase64.startsWith(
              "data:image/"
            )
              ? childAadhaarBase64
              : `data:image/jpeg;base64,${childAadhaarBase64}`;
            formik.setFieldValue(`children[${index}].childAadhaarDocuments`, [
              { base64: formattedAadhaarBase64 },
            ]);
          }

          // Birth Certificate for Child
          const childBirthCertBase64 = extractedData[childKey]?.find(
            (doc) => doc.documentType === "BIRTHCERTIFICATE"
          )?.documents[0]?.base64Content;

          if (childBirthCertBase64) {
            const formattedBirthCertBase64 = childBirthCertBase64.startsWith(
              "data:image/"
            )
              ? childBirthCertBase64
              : `data:image/jpeg;base64,${childBirthCertBase64}`;
            formik.setFieldValue(
              `children[${index}].childBirthCertificateDocuments`,
              [{ base64: formattedBirthCertBase64 }]
            );
          }
        });
      }

      if (data.preview_flag) {
        setsavebuttonclicked(true);
        setpreviewimage(true);
      }
      if (data.docpreviewed) {
        setpreviewdocs(true);
      }

      setInitialValues({
        bank: data.bank || "",
        branch: data.branch || "",
        accountNumber: data.accountNumber || "",
        relativeName: data.relativeName || "",
        relativeContact: data.relativeContact || "",
        lifeADocuments:
          extractedData.primaryInsured?.find(
            (doc) => doc.documentType === "AADHARCARD"
          )?.documents || [],
        pancardDocuments:
          extractedData.primaryInsured?.find(
            (doc) => doc.documentType === "PAN"
          )?.documents || [],
        lifeBAadhaarDocuments:
          extractedData.secondaryInsured?.find(
            (doc) => doc.documentType === "AADHARCARD"
          )?.documents || [],
        lifeBPancardDocuments:
          extractedData.secondaryInsured?.find(
            (doc) => doc.documentType === "PAN"
          )?.documents || [],
        children: personData.result.Child || [],
      });
    };
    fetchdata();
  }, []);

  // useEffect(() => {
  //   const savedOpenItems = JSON.parse(localStorage.getItem('openAccordionItems')) || [];
  //   setOpenItem(savedOpenItems);
  // }, []);

  // useEffect(()=>{
  //     {

  //     }
  // },[])
  const determineValidationSchema = () => {
    const basePrimarySchema = {
      bank: Yup.string().required("Bank is required"),
      branch: Yup.string().required("Branch is required"),
      accountNumber: Yup.string().required("Account Number is required"),
      relativeName: Yup.string().required("Relative name is required"),
      relativeContact: Yup.string().required("Relative contact is required"),
      lifeADocuments: Yup.array()
        .min(1, "Aadhaar document upload is required")
        .max(2, "You can upload a maximum of 2 Aadhaar documents"),
      pancardDocuments: Yup.array()
        .min(1, "Pancard document upload is required")
        .max(2, "You can upload a maximum of 2 Pancard documents"),
    };

    // const kidsSchema = {
    //     children: Yup.array().of(
    //         Yup.object().shape({
    //             childAadhaarDocuments: Yup.array()
    //                 .min(1, 'Child Aadhaar document upload is required')
    //                 .max(1, 'You can upload only one Aadhaar document'),
    //             childBirthCertificateDocuments: Yup.array()
    //                 .min(1, 'Child Birth Certificate upload is required')
    //                 .max(1, 'You can upload only one Birth Certificate document'),
    //         })
    //     ),
    // };

    const kidsSchema = {
      children: Yup.array()
        .min(1, "At least one child must be added") // Ensures the array is not empty
        .of(
          Yup.object().shape({
            childAadhaarDocuments: Yup.array()
              .min(1, "Child Aadhaar document upload is required")
              .max(1, "You can upload only one Aadhaar document"),
            childBirthCertificateDocuments: Yup.array()
              .min(1, "Child Birth Certificate upload is required")
              .max(1, "You can upload only one Birth Certificate document"),
          })
        ),
    };

    const secondarySchema = {
      lifeBAadhaarDocuments: Yup.array()
        .min(1, "Aadhaar document upload is required")
        .max(2, "You can upload a maximum of 2 Aadhaar documents"),
      lifeBPancardDocuments: Yup.array()
        .min(1, "Pancard document upload is required")
        .max(2, "You can upload a maximum of 2 Pancard documents"),
    };

    if (ApplicationType === "Single Life" && kids === "yes") {
      return Yup.object({ ...basePrimarySchema, ...kidsSchema });
    } else if (ApplicationType === "Single Life" && kids === "no") {
      return Yup.object(basePrimarySchema);
    } else if (ApplicationType === "Joint Life" && kids === "yes") {
      return Yup.object({
        ...basePrimarySchema,
        ...secondarySchema,
        ...kidsSchema,
      });
    } else if (ApplicationType === "Joint Life" && kids === "no") {
      return Yup.object({ ...basePrimarySchema, ...secondarySchema });
    }

    // Default to base schema
    //return Yup.object(basePrimarySchema);
  };

  const formik = useFormik({
    initialValues,
    validationSchema: determineValidationSchema(),
    //ssconsole.log('Validation Schema:', validationSchema);
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      console.log("On submitting Values:::", values);
      console.log("Formik Errors:", formik.errors);
      await formik.validateForm(); // Ensures validation is triggered after state update
      if (Object.keys(formik.errors).length > 0) {
        console.error("Form contains validation errors:", formik.errors);
        return;
      }
      let acr_id = `ACR${Date.now()}`;
      sessionStorage.setItem("acr_id", acr_id);
      console.log("Form submitted successfully!");
      navigate_to_submission("/submission");
    },
  });

  // const handleAccordionClick = (item) => {
  //   setOpenItem((prevOpenItems) => {
  //     if (prevOpenItems.includes(item)) {
  //       return prevOpenItems.filter(openItem => openItem !== item); // Close item
  //     } else {
  //       return [...prevOpenItems, item]; // Open item
  //     }
  //   });
  // };

  // const handleAccordionClick = (item, event) => {
  //   if (event) {
  //     event.preventDefault(); // Prevent default navigation behavior
  //   }

  //   setOpenItem((prevOpenItems) => {
  //     let updatedItems;
  //     if (prevOpenItems.includes(item)) {
  //       updatedItems = prevOpenItems.filter(openItem => openItem !== item); // Close item
  //     } else {
  //       updatedItems = [...prevOpenItems, item]; // Open item
  //     }
  //     localStorage.setItem('openAccordionItems', JSON.stringify(updatedItems));
  //     return updatedItems;
  //   });
  // };

  const handleAccordionClick = (item, event) => {
    if (event) {
      event.preventDefault(); // Prevent default navigation behavior
    }
    setOpenItem((prevOpenItems) => {
      const updatedItems = [...prevOpenItems];
      if (updatedItems.includes(item)) {
        return updatedItems.filter((openItem) => openItem !== item); // Close accordion
      } else {
        return [...updatedItems, item]; // Open accordion
      }
    });
  };

  // const handleChildFileUpload = (event, childIndex, docType) => {
  //     const file = event.target.files[0];
  //     if (file) {
  //         const reader = new FileReader();

  //         reader.onloadend = () => {
  //             const base64Data = reader.result;

  //             // Get current documents for the child and doc type
  //             const updatedDocuments = [...(formik.values.children[childIndex]?.[docType] || [])];

  //             if (updatedDocuments.length < 2) {
  //                 // Add new file and update Formik
  //                 updatedDocuments.push({ file, base64: base64Data });
  //                 formik.setFieldValue(`children[${childIndex}].${docType}`, updatedDocuments);

  //                 // Update preview for the specific child and document type
  //                 setChildPreviews((prev) => ({
  //                     ...prev,
  //                     [`${childIndex}-${docType}`]: base64Data,
  //                 }));
  //             } else {
  //                 alert(`You can upload a maximum of 2 documents for ${docType}.`);
  //             }
  //         };

  //         reader.readAsDataURL(file);
  //     }
  // };

  const handleChildFileUpload = (event, childIndex, documentType) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    // Validate file type
    const allowedFileTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedFileTypes.includes(file.type)) {
      alert("Invalid file type. Please upload JPEG or PNG images.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;

      // Get current documents for the child and document type
      const currentDocuments =
        formik.values.children[childIndex]?.[documentType] || [];

      // Limit the number of uploaded documents
      if (currentDocuments.length < 2) {
        // Add the new document
        const updatedDocuments = [...currentDocuments, { base64, file }];

        // Update Formik state
        formik.setFieldValue(
          `children[${childIndex}].${documentType}`,
          updatedDocuments
        );

        // Optionally, update preview state for dynamic rendering
        setChildPreviews((prev) => ({
          ...prev,
          [`${childIndex}-${documentType}`]: updatedDocuments[0].base64,
        }));
      } else {
        alert(`You can upload a maximum of 2 documents for ${documentType}.`);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleLifeAFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64Data = reader.result;

        // Update `lifeADocuments`
        const updatedDocuments = [...formik.values.lifeADocuments];
        if (updatedDocuments.length < 2) {
          updatedDocuments.push({ file, base64: base64Data });
          formik.setFieldValue("lifeADocuments", updatedDocuments);

          // Set preview for `lifeA`
          setAadhaarPreview(base64Data);
          setaadharpreviewbackswipe(base64Data);
          //aadharpreviewbackswipeboolean = true
        } else {
          alert("You can upload a maximum of 2 documents.");
        }
      };

      reader.readAsDataURL(file);
    }
  };

  // const handlePancardFileUpload = (event) => {
  //     const file = event.target.files[0];
  //     if (file && formik.values.pancardDocuments.length < 2) {
  //         // Update Formik state with the new file
  //         const updatedDocuments = [...formik.values.pancardDocuments, file];
  //         formik.setFieldValue('pancardDocuments', updatedDocuments);

  //         // Create a preview URL for image files
  //         if (file.type.startsWith('image/')) {
  //             const reader = new FileReader();
  //             reader.onloadend = () => {
  //                 setPancardPreview(reader.result);
  //             };
  //             reader.readAsDataURL(file);
  //         }
  //     } else if (formik.values.pancardDocuments.length >= 2) {
  //         alert("You can upload a maximum of 2 Pancard documents.");
  //     }
  // };

  const handlePancardFileUpload = (event) => {
    const file = event.target.files[0];

    if (file && formik.values.pancardDocuments.length < 2) {
      const reader = new FileReader();

      // Read the file as a base64 string
      reader.onloadend = () => {
        const base64Data = reader.result; // This contains the base64-encoded image

        // Update Formik state with the new file and base64 data
        const updatedDocuments = [
          ...formik.values.pancardDocuments,
          { file, base64: base64Data },
        ];

        formik.setFieldValue("pancardDocuments", updatedDocuments);

        // Set the preview for the latest uploaded file
        setPancardPreview(base64Data);
      };

      reader.readAsDataURL(file);
    } else if (formik.values.pancardDocuments.length >= 2) {
      alert("You can upload a maximum of 2 Pancard documents.");
    }
  };

  const handleNonMandatoryFileUpload = (event, docType) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNonMandatoryDocuments((prevDocs) => ({
          ...prevDocs,
          [docType]: { file, preview: reader.result },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // const handleLifeBAadhaarUpload = (event) => {
  //     const file = event.target.files[0];
  //     if (file && formik.values.lifeBAadhaarDocuments.length < 2) {
  //         // Update Formik state with the new file
  //         const updatedDocuments = [...formik.values.lifeBAadhaarDocuments, file];
  //         formik.setFieldValue('lifeBAadhaarDocuments', updatedDocuments);

  //         // Create a preview URL for image files
  //         if (file.type.startsWith('image/')) {
  //             const reader = new FileReader();
  //             reader.onloadend = () => {
  //                 setAadhaarBPreview(reader.result);
  //             };
  //             reader.readAsDataURL(file);
  //         }
  //     } else if (formik.values.lifeBAadhaarDocuments.length >= 2) {
  //         alert("You can upload a maximum of 2 documents.");
  //     }
  // };

  // Handle Life B Pancard file upload

  const handleLifeBAadhaarUpload = (event) => {
    const file = event.target.files[0];

    if (file && formik.values.lifeBAadhaarDocuments.length < 2) {
      const reader = new FileReader();

      // Read the file as a base64 string
      reader.onloadend = () => {
        const base64Data = reader.result; // This contains the base64-encoded image

        // Update Formik state with the new file and base64 data
        const updatedDocuments = [
          ...formik.values.lifeBAadhaarDocuments,
          { file, base64: base64Data },
        ];
        formik.setFieldValue("lifeBAadhaarDocuments", updatedDocuments);

        // Set the preview for the latest uploaded file
        setAadhaarBPreview(base64Data);
      };

      reader.readAsDataURL(file);
    } else if (formik.values.lifeBAadhaarDocuments.length >= 2) {
      alert("You can upload a maximum of 2 Aadhaar documents.");
    }
  };

  // const handleLifeBPancardUpload = (event) => {
  //     const file = event.target.files[0];
  //     if (file && formik.values.lifeBPancardDocuments.length < 2) {
  //         // Update Formik state with the new file
  //         const updatedDocuments = [...formik.values.lifeBPancardDocuments, file];
  //         formik.setFieldValue('lifeBPancardDocuments', updatedDocuments);

  //         // Create a preview URL for image files
  //         if (file.type.startsWith('image/')) {
  //             const reader = new FileReader();
  //             reader.onloadend = () => {
  //                 setPancardBPreview(reader.result);
  //             };
  //             reader.readAsDataURL(file);
  //         }
  //     } else if (formik.values.lifeBPancardDocuments.length >= 2) {
  //         alert("You can upload a maximum of 2 Pancard documents.");
  //     }
  // };

  const handleLifeBPancardUpload = (event) => {
    const file = event.target.files[0];

    if (file && formik.values.lifeBPancardDocuments.length < 2) {
      const reader = new FileReader();

      // Read the file as a base64 string
      reader.onloadend = () => {
        const base64Data = reader.result; // This contains the base64-encoded image

        // Update Formik state with the new file and base64 data
        const updatedDocuments = [
          ...formik.values.lifeBPancardDocuments,
          { file, base64: base64Data },
        ];
        formik.setFieldValue("lifeBPancardDocuments", updatedDocuments);

        // Set the preview for the latest uploaded file
        setPancardBPreview(base64Data);
      };

      reader.readAsDataURL(file);
    } else if (formik.values.lifeBPancardDocuments.length >= 2) {
      alert("You can upload a maximum of 2 Pancard documents.");
    }
  };

  const handleLifeBNonMandatoryFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && lifeBNonMandatoryDocuments.length < 2) {
      // Convert file to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1]; // Extract Base64 string
        setLifeBNonMandatoryDocuments((prevDocs) => [
          ...prevDocs,
          { name: file.name, base64: base64String },
        ]);
      };
      reader.readAsDataURL(file);
    } else if (lifeBNonMandatoryDocuments.length >= 2) {
      alert("You can upload a maximum of 2 non-mandatory documents.");
    }
  };

  // Handle deleting a file from Life A documents
  // const handleDeleteFile = (index, lifeType, docType) => {
  //     if (lifeType === 'lifeA') {
  //         if (docType === 'aadhaar') {
  //             const updatedDocuments = formik.values.lifeADocuments.filter((_, i) => i !== index);
  //             formik.setFieldValue('lifeADocuments', updatedDocuments);
  //             if (lifeADocuments.length === 1) setAadhaarPreview(null);
  //         } else if (docType === 'pancard') {
  //             setPancardDocuments((prevDocs) => prevDocs.filter((_, i) => i !== index));
  //             if (pancardDocuments.length === 1) setPancardPreview(null);
  //         }
  //     } else if (lifeType === 'lifeB') {
  //         if (docType === 'aadhaar') {
  //             setLifeBAadhaarDocuments((prevDocs) => prevDocs.filter((_, i) => i !== index));
  //             if (lifeBAadhaarDocuments.length === 1) setAadhaarBPreview(null);
  //         } else if (docType === 'pancard') {
  //             setLifeBPancardDocuments((prevDocs) => prevDocs.filter((_, i) => i !== index));
  //             if (lifeBPancardDocuments.length === 1) setPancardBPreview(null);
  //         }
  //     }
  // };

  // const handleDeleteFile = (index, lifeType, docType) => {
  //     if (lifeType === 'lifeA') {
  //         if (docType === 'aadhaar') {
  //             const updatedDocuments = formik.values.lifeADocuments.filter((_, i) => i !== index);
  //             formik.setFieldValue('lifeADocuments', updatedDocuments);

  //             // Reset preview if the last file is deleted
  //             if (updatedDocuments.length === 0) setAadhaarPreview(null);
  //         } else if (docType === 'pancard') {
  //             const updatedDocuments = formik.values.pancardDocuments.filter((_, i) => i !== index);
  //             formik.setFieldValue('pancardDocuments', updatedDocuments);

  //             // Reset preview if the last file is deleted
  //             if (updatedDocuments.length === 0) setPancardPreview(null);
  //         }
  //     } else if (lifeType === 'lifeB') {
  //         if (docType === 'aadhaar') {
  //             const updatedDocuments = formik.values.lifeBAadhaarDocuments.filter((_, i) => i !== index);
  //             formik.setFieldValue('lifeBAadhaarDocuments', updatedDocuments);

  //             // Reset preview if the last file is deleted
  //             if (updatedDocuments.length === 0) setAadhaarBPreview(null);
  //         } else if (docType === 'pancard') {
  //             const updatedDocuments = formik.values.lifeBPancardDocuments.filter((_, i) => i !== index);
  //             formik.setFieldValue('lifeBPancardDocuments', updatedDocuments);

  //             // Reset preview if the last file is deleted
  //             if (updatedDocuments.length === 0) setPancardBPreview(null);
  //         }
  //     }
  // };
  const handleDeleteChildFile = (index, childIndex, docType) => {
    const updatedDocuments = formik.values.children[childIndex][docType].filter(
      (_, i) => i !== index
    );
    formik.setFieldValue(
      `children[${childIndex}].${docType}`,
      updatedDocuments
    );

    // Reset preview if the last file is deleted
    if (updatedDocuments.length === 0) {
      if (docType === "childAadhaarDocuments") setAadhaarPreview(null);
      if (docType === "childBirthCertificateDocuments")
        setBirthCertificatePreview(null);
    }
  };

  const handleDeleteFile = (index, lifeType, docType) => {
    if (lifeType === "lifeA") {
      if (docType === "aadhaar") {
        const updatedDocuments = formik.values.lifeADocuments.filter(
          (_, i) => i !== index
        );
        formik.setFieldValue("lifeADocuments", updatedDocuments);

        // Reset preview if the last file is deleted
        if (updatedDocuments.length === 0) setAadhaarPreview(null);
      } else if (docType === "pancard") {
        const updatedDocuments = formik.values.pancardDocuments.filter(
          (_, i) => i !== index
        );
        formik.setFieldValue("pancardDocuments", updatedDocuments);

        // Reset preview if the last file is deleted
        if (updatedDocuments.length === 0) setPancardPreview(null);
      }
    } else if (lifeType === "lifeB") {
      if (docType === "aadhaar") {
        const updatedDocuments = formik.values.lifeBAadhaarDocuments.filter(
          (_, i) => i !== index
        );
        formik.setFieldValue("lifeBAadhaarDocuments", updatedDocuments);

        // Reset preview if the last file is deleted
        if (updatedDocuments.length === 0) setAadhaarBPreview(null);
      } else if (docType === "pancard") {
        const updatedDocuments = formik.values.lifeBPancardDocuments.filter(
          (_, i) => i !== index
        );
        formik.setFieldValue("lifeBPancardDocuments", updatedDocuments);

        // Reset preview if the last file is deleted
        if (updatedDocuments.length === 0) setPancardBPreview(null);
      }
    }
  };

  // const handleCaptureImage = async (fieldName) => {
  //   console.log("FieldName::", fieldName)
  //   const base64Image = await openCamera('', `${fieldName}.jpeg`);
  //   if (base64Image) {
  //     console.log('Captured Base64 Image:', base64Image);

  //     // Update Formik values
  //     formik.setFieldValue(`${fieldName}Documents`, [
  //       ...(formik.values[`${fieldName}Documents`] || []),
  //       { base64: base64Image, name: `${fieldName}.jpeg` },
  //     ]);
  //   }
  // };

  const handleCaptureImage = async (fieldName) => {
    console.log("FieldName::", fieldName);

    // Check if the user has already captured 2 images
    const existingDocuments = formik.values[`${fieldName}Documents`] || [];
    if (existingDocuments.length >= 2) {
      alert("You can capture a maximum of 2 images.");
      return; // Prevent further execution
    }

    const base64Image = await openCamera("", `${fieldName}.jpeg`);
    if (base64Image) {
      console.log("Captured Base64 Image:", base64Image);

      // Update Formik values
      formik.setFieldValue(`${fieldName}Documents`, [
        ...existingDocuments,
        { base64: base64Image, name: `${fieldName}_${Date.now()}.jpeg` }, // Use unique file name if needed
      ]);
    }
  };

  const handleDeleteNonMandatoryFile = (docType) => {
    setNonMandatoryDocuments((prevDocs) => {
      const updatedDocs = { ...prevDocs };
      delete updatedDocs[docType];
      return updatedDocs;
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handlePreview = async () => {
    //navigate(`/preview/${docId}`);

    setpreviewclicked(true);
    sessionStorage.setItem("previewUploadclicked", "true");
    //previewdocclicked(true)
    console.log("Preview:::", previewclicked);
    uploadnavigate(`/previewUpload`);
    const data = {
      preview_flag: true,
    };
    aadharpreviewbackswipeboolean = true;

    const update_flag = await updateDetailById(
      "al_document_details",
      docIdgenerated,
      data
    );
    console.log("Preview flag updated::", update_flag);
  };

  const extractInsuredData = (data) => {
    const result = {};

    const processInsured = (insuredKey, insuredData) => {
      if (insuredData && insuredData.documents) {
        result[insuredKey] = insuredData.documents.map((docDetail) => ({
          documentType: docDetail.documentType,
          documents: docDetail.documents.map((doc) => ({
            documentName: doc.documentName,
            base64Content: doc.base64Content,
          })),
        }));
      }
    };

    // Process primaryInsured
    if (data.primaryInsured) {
      processInsured("primaryInsured", data.primaryInsured);
    }

    // Process secondaryInsured
    if (data.secondaryInsured) {
      processInsured("secondaryInsured", data.secondaryInsured);
    }

    // Process childInsured (dynamic keys for firstChild, secondChild, etc.)
    Object.keys(data).forEach((key) => {
      if (key.includes("ChildInsured")) {
        processInsured(key, data[key]);
      }
    });

    return result;
  };

  const handledocpreview = () => {
    setPreviewUploadClicked(true);
    sessionStorage.setItem("navigatingfromdocupload", "navigatefromdocupload");
    navigate_to_preview("/proposaloutput");
  };

  const saveData = async () => {
    setsavebuttonclicked(true);
    sessionStorage.setItem("savebuttonclicked", "true");
    const values = formik.values;

    const findMissingFields = (obj) => {
      const missingFields = [];
      for (const [key, value] of Object.entries(obj)) {
        if (
          value === "" || // Check for empty strings
          value === null || // Check for null
          value === undefined || // Check for undefined
          (Array.isArray(value) && value.length === 0) // Check for empty arrays
        ) {
          missingFields.push(key);
        }
      }
      return missingFields;
    };

    // Common required fields
    const requiredFields = {
      Bank: values.bank,
      Branch: values.branch,
      "Account Number": values.accountNumber,
      "Relative Name": values.relativeName,
      "Relative Contact": values.relativeContact,
    };

    // Check common fields
    let missingFields = findMissingFields(requiredFields);

    // Validate based on application type
    if (ApplicationType === "Single Life") {
      const singleLifeFields = {
        "Life A Aadhaar Documents": values.lifeADocuments,
        "Life A Pancard Documents": values.pancardDocuments,
      };
      missingFields = missingFields.concat(findMissingFields(singleLifeFields));
    } else if (ApplicationType === "Joint Life") {
      const jointLifeFields = {
        "Life A Aadhaar Documents": values.lifeADocuments,
        "Life A Pancard Documents": values.pancardDocuments,
        "Life B Aadhaar Documents": values.lifeBAadhaarDocuments,
        "Life B Pancard Documents": values.lifeBPancardDocuments,
      };
      missingFields = missingFields.concat(findMissingFields(jointLifeFields));
    }

    // Check children details if applicable
    if (Persondata.result.Child.length > 0) {
      // Dynamically map children from Persondata.result.Child if values.children is empty
      if (values.children.length === 0) {
        values.children = Persondata.result.Child.map((child) => ({
          childAadhaarDocuments: [],
          childBirthCertificateDocuments: [],
          personId: child.person_id,
        }));
      }

      // Validate children details
      values.children.forEach((child, index) => {
        const childFields = {
          [`Child ${index + 1} Aadhaar Documents`]: child.childAadhaarDocuments,
          [`Child ${index + 1} Birth Certificate Documents`]:
            child.childBirthCertificateDocuments,
        };
        missingFields = missingFields.concat(findMissingFields(childFields));
      });
    }

    // If any fields are missing, show an alert and stop saving
    if (missingFields.length > 0) {
      alert(
        `Please fill all required fields:\n- ${missingFields.join("\n- ")}`
      );
      setsavebuttonclicked(false);
      return; // Exit saveData function if validation fails
    }

    console.log("Submitted values:", values);
    console.log("Uploaded Life A Documents:", values.lifeADocuments);
    setsavelifeADocuments(values.lifeADocuments);
    console.log(
      "Uploaded Pancard Documents for lifeA:",
      values.pancardDocuments
    );
    setsavelifeAPanDocuments(values.pancardDocuments);
    console.log("Uploaded documents LifeB:::", values.lifeBAadhaarDocuments);
    setsavelifeBAadharDocuments(values.lifeBAadhaarDocuments);
    console.log(
      "Uploaded Pancard documents for lifeb:::",
      values.lifeBPancardDocuments
    );
    setsavelifeBPanDocuments(values.lifeBPancardDocuments);
    console.log("Non-Mandatory Documents for LifeA:", nonMandatoryDocuments);
    setsavenonMandatoryDocuments(nonMandatoryDocuments);
    console.log(
      "Non-Mandatory Documents for Life B:",
      lifeBNonMandatoryDocuments
    );
    setsavelifeBNonMandatoryDocuments(lifeBNonMandatoryDocuments);
    values.children.forEach((child, index) => {
      console.log(`Child ${index + 1}:`);
      console.log("  Aadhaar Documents:", child.childAadhaarDocuments);
      setsaveChildAadhar(child.childAadhaarDocuments);
      console.log(
        "  Birth Certificate Documents:",
        child.childBirthCertificateDocuments
      );
      setsaveChildBirth(child.childBirthCertificateDocuments);
    });
    const docId = generatedocId();
    setdocIdgenerated(docId);
    sessionStorage.setItem("docId", docId);

    let data = {};

    data = {
      primaryInsured: {
        personId: personId,
        documents: [
          createDocumentDetails(
            values.lifeADocuments,
            "AADHARCARD",
            docIdgenerated
          ),
          createDocumentDetails(values.pancardDocuments, "PAN", docIdgenerated),
          nonMandatoryDocuments.drivingLicence
            ? createDocumentDetails(
                [nonMandatoryDocuments],
                "DRIVINGLICENSE",
                docIdgenerated
              )
            : null,
          nonMandatoryDocuments.passport
            ? createDocumentDetails(
                [nonMandatoryDocuments],
                "PASSPORT",
                docIdgenerated
              )
            : null,
        ].filter(Boolean), // Filter out null entries for non-mandatory document
      },
      documentId: docId,
      proposalId: erefid,
      agentId: agentID,
      status: "",
      caseId: caseId,
      createdAt: new Date(),
      updatedAt: "",
      bank: values.bank,
      branch: values.branch,
      accountNumber: values.accountNumber,
      relativeName: values.relativeName,
      relativeContact: values.relativeContact,
    };

    if (ApplicationType === "Joint Life") {
      data["secondaryInsured"] = {
        personId: personId,
        documents: [
          createDocumentDetails(
            values.lifeBAadhaarDocuments,
            "AADHARCARD",
            docId
          ),
          createDocumentDetails(values.lifeBPancardDocuments, "PAN", docId),
          lifeBNonMandatoryDocuments?.drivingLicence
            ? createDocumentDetails(
                [lifeBNonMandatoryDocuments.drivingLicence],
                "DRIVINGLICENSE",
                docId
              )
            : null,
          lifeBNonMandatoryDocuments?.passport
            ? createDocumentDetails(
                [lifeBNonMandatoryDocuments.passport],
                "PASSPORT",
                docId
              )
            : null,
        ].filter(Boolean),
      };
    }

    try {
      await saveDetail("al_document_details", data);
      console.log("Document data saved successfully:::", JSON.stringify(data));
    } catch (e) {
      console.log("Error while saving::", e);
    }

    if (kids === "yes") {
      values.children.forEach((child, index) => {
        const ordinalKey = `${getOrdinalWord(index)}ChildInsured`;
        data[ordinalKey] = {
          personId: personId, // Assuming all children share the same personId (you may need to adjust if not)
          documentDetails: [
            {
              documentId: generatedocId(), // Assuming each child gets a new docId
              documentType: "BIRTHCERTIFICATE", // Use the appropriate document type for the child
              documents: [
                {
                  base64Content: child.childAadhaarDocuments[0].base64, // Replace with actual base64 content
                  documentName: child.childBirthCertificateDocuments[0]?.name, // Replace with actual document name
                },
              ],
            },
            {
              documentId: String(generatedocId()), // Assuming separate documentId for Aadhaar as well
              documentType: "AADHARCARD", // For Aadhaar document
              documents: [
                {
                  base64Content: child.childAadhaarDocuments[0].base64, // Replace with actual base64 content
                  documentName: child.childBirthCertificateDocuments[0]?.name, // Replace with actual document name
                },
              ],
            },
          ],
        };
      });

      try {
        await updateDetailById("al_document_details", docId, data);
        console.log("Child data updated successfully:::", data);
      } catch (e) {
        console.log("Error while updating child data::", e);
      }
    }

    try {
      const apidata = await findRecordById("al_document_details", docId);

      console.log(
        "Data for API in document upload:::",
        JSON.stringify(apidata.result)
      );

      // Directly use apidata.result instead of relying on setapicalldata
      const apiCall = await fetch(
        `http://192.168.2.7:4002/documentManagementService/proposals/${agentID}/${caseId}/documents`,
        {
          //const apiCall = await fetch(`http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com/document-management-service/proposals/${agentID}/${caseId}/documents`, {

          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apidata.result), // Use the result directly
        }
      );

      const response = await apiCall.json();
      console.log("API Response:", JSON.stringify(response));
    } catch (e) {
      console.error("Error while processing data for API call:", e);
    }
  };

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
    document.body.classList.add("ios-safearea");
  } else {
    document.body.classList.remove("ios-safearea");
  }

  return (
    <SidebarLayout>
      <div className="docupload-container">
        <div className="docuploadForm">
          <form onSubmit={formik.handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label htmlFor="bank">Bank</label>
                <input
                  type="text"
                  id="bank"
                  name="bank"
                  className="form-control"
                  value={formik.values.bank}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.bank && formik.errors.bank && (
                  <div className="error" style={{ color: "red" }}>
                    {formik.errors.bank}
                  </div>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="branch">Branch</label>
                <input
                  type="text"
                  id="branch"
                  name="branch"
                  className="form-control"
                  value={formik.values.branch}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.branch && formik.errors.branch && (
                  <div className="error" style={{ color: "red" }}>
                    {formik.errors.branch}
                  </div>
                )}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label htmlFor="accountNumber">Account Number</label>
                <input
                  type="number"
                  id="accountNumber"
                  name="accountNumber"
                  className="form-control"
                  value={formik.values.accountNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  onKeyDown={(e) => {
                    // Allow only numbers, backspace, and arrow keys
                    if (
                      !/^[0-9]$/.test(e.key) &&
                      e.key !== "Backspace" &&
                      e.key !== "ArrowLeft" &&
                      e.key !== "ArrowRight"
                    ) {
                      e.preventDefault();
                    }
                  }}
                  onInput={(e) => {
                    // Restrict the input to a maximum of 16 digits
                    if (e.target.value.length > 16) {
                      e.target.value = e.target.value.slice(0, 16);
                    }
                  }}
                />
                {formik.touched.accountNumber &&
                  formik.errors.accountNumber && (
                    <div className="error" style={{ color: "red" }}>
                      {formik.errors.accountNumber}
                    </div>
                  )}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-12 mb-2">
                <h5>Contact number of a relative/friend not living with you</h5>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="relativeName">Name</label>
                <input
                  type="text"
                  id="relativeName"
                  name="relativeName"
                  className="form-control"
                  value={formik.values.relativeName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.relativeName && formik.errors.relativeName && (
                  <div className="error" style={{ color: "red" }}>
                    {formik.errors.relativeName}
                  </div>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="relativeContact">Contact No.</label>
                <input
                  type="number"
                  id="relativeContact"
                  name="relativeContact"
                  className="form-control"
                  value={formik.values.relativeContact}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  onKeyDown={(e) => {
                    // Allow only numbers, backspace, and arrow keys
                    if (
                      !/^[0-9]$/.test(e.key) &&
                      e.key !== "Backspace" &&
                      e.key !== "ArrowLeft" &&
                      e.key !== "ArrowRight"
                    ) {
                      e.preventDefault();
                    }
                  }}
                  onInput={(e) => {
                    // Restrict the input to a maximum of 16 digits
                    if (e.target.value.length > 10) {
                      e.target.value = e.target.value.slice(0, 10);
                    }
                  }}
                />
                {formik.touched.relativeContact &&
                  formik.errors.relativeContact && (
                    <div className="error" style={{ color: "red" }}>
                      {formik.errors.relativeContact}
                    </div>
                  )}
              </div>
            </div>
            <div className="row justify-content-between">
              <div className="col-auto">
                <button
                  className="btn btn-danger"
                  onClick={handlePreview}
                  disabled={!savebuttonclicked}
                >
                  Preview Uploaded Images
                </button>
              </div>
              <div className="col-auto">
                <button
                  className="btn btn-danger"
                  onClick={handledocpreview}
                  disabled={!previewUploadclicked}
                >
                  Preview
                </button>
              </div>
            </div>

            {/* Accordion Items */}
            <AccordionItem
              title="Life A: Proposal/Main Proposer"
              isOpen={openItem.includes("lifeA")}
              onClick={(event) => handleAccordionClick("lifeA", event)}
              disabled={ApplicationType === ""}
            >
              <h5>Mandatory Documents</h5>
              {/* Aadhaar Card Document Upload */}
              <div className="document-upload">
                <label className="document-label">Aadhaar Card</label>

                <div className="upload-section">
                  <div className="image-preview-container">
                    {aadhaarPreview ? (
                      <img
                        src={aadhaarPreview}
                        alt="Aadhaar Preview"
                        className="preview-image"
                      />
                    ) : (
                      <div className="image-placeholder">
                        <img
                          src="/image.png"
                          alt="Placeholder"
                          className="placeholder-image"
                        />
                      </div>
                    )}
                  </div>

                  <div className="upload-actions">
                    <label className="icon">
                      <FontAwesomeIcon icon={faFolderOpen} title="Browse" />
                      <input
                        type="file"
                        id="file-upload-aadhaar"
                        accept="image/jpeg, image/png, image/jpg"
                        style={{ display: "none" }}
                        onChange={handleLifeAFileUpload}
                      />
                    </label>

                    {/* Show camera button for mobile and tablet devices */}
                    {(Capacitor.getPlatform() === "android" ||
                      Capacitor.getPlatform() === "ios") &&
                      (window.innerWidth <= 768 ||
                        (window.innerWidth >= 769 &&
                          window.innerWidth <= 1200)) && (
                        <button
                          type="button"
                          className="camera-button"
                          onClick={() => handleCaptureImage("lifeA")}
                        >
                          <FontAwesomeIcon
                            icon={faCamera}
                            title="Capture with Camera"
                          />
                        </button>
                      )}

                    {/* Delete button */}
                    {/* <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleDeleteFile(0, "lifeA", "aadhaar")}
                    >
                      <FontAwesomeIcon icon={faTrash} title="Delete" />
                    </button> */}
                  </div>
                </div>

                <ul className="col-md-12 uploaded-files-list">
                  {formik.values.lifeADocuments.map((file, index) => (
                    <li key={index} className="uploaded-file-item">
                      {file.name}
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="delete-icon"
                        title="Delete"
                        onClick={() =>
                          handleDeleteFile(index, "lifeA", "aadhaar")
                        }
                      />
                    </li>
                  ))}
                </ul>

                {formik.errors.lifeADocuments &&
                  formik.touched.lifeADocuments && (
                    <div className="error-message" style={{ color: "red" }}>
                      {formik.errors.lifeADocuments}
                    </div>
                  )}
              </div>

              {/* Pancard Document Upload */}
              <div className="document-upload">
                <label className="document-label">PAN Card</label>
                <div className="upload-section">
                  <div className="image-preview-container">
                    {pancardPreview ? (
                      <img
                        src={pancardPreview}
                        alt="PAN Card Preview"
                        className="preview-image"
                      />
                    ) : (
                      <div className="image-placeholder">
                        <img
                          src="/image.png"
                          alt="Placeholder"
                          className="placeholder-image"
                        />
                      </div>
                    )}
                  </div>

                  <div className="upload-actions">
                    <label className="icon">
                      <FontAwesomeIcon icon={faFolderOpen} title="Browse" />
                      <input
                        type="file"
                        id="file-upload-pancard"
                        accept="image/jpeg, image/png, image/jpg"
                        style={{ display: "none" }}
                        onChange={handlePancardFileUpload}
                      />
                    </label>

                    {(Capacitor.getPlatform() === "android" ||
                      Capacitor.getPlatform() === "ios") &&
                      (window.innerWidth <= 768 ||
                        (window.innerWidth >= 769 &&
                          window.innerWidth <= 1200)) && (
                        <button
                          type="button"
                          className="camera-button"
                          onClick={() => handleCaptureImage("pancard")}
                        >
                          <FontAwesomeIcon
                            icon={faCamera}
                            title="Capture with Camera"
                          />
                        </button>
                      )}

                    {/* <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleDeleteFile(0, "lifeA", "aadhaar")}
                    >
                      <FontAwesomeIcon icon={faTrash} title="Delete" />
                    </button> */}
                  </div>
                </div>

                <ul className="col-md-12 uploaded-files-list">
                  {formik.values.pancardDocuments.map((file, index) => (
                    <li key={index} className="uploaded-file-item">
                      {file.name}
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="delete-icon"
                        title="Delete"
                        onClick={() =>
                          handleDeleteFile(index, "lifeA", "pancard")
                        }
                      />
                    </li>
                  ))}
                </ul>

                {formik.errors.pancardDocuments &&
                  formik.touched.pancardDocuments && (
                    <div className="error-message" style={{ color: "red" }}>
                      {formik.errors.pancardDocuments}
                    </div>
                  )}
              </div>

              <h5>Non-Mandatory Documents</h5>
              <label>Non-Mandatory Document Type</label>
              <div className="col-md-6 non-mandatory-document">
                <select
                  className="form-control"
                  value={selectedNonMandatoryDocument}
                  onChange={(e) =>
                    setSelectedNonMandatoryDocument(e.target.value)
                  }
                >
                  <option value="">Select Document</option>
                  <option value="drivingLicence">Driving Licence</option>
                  <option value="passport">Passport</option>
                </select>

                {selectedNonMandatoryDocument && (
                  <div className="document-upload">
                    <div className="upload-section">
                      <div className="image-preview-container">
                        {nonMandatoryDocuments[selectedNonMandatoryDocument] ? (
                          <img
                            src={
                              nonMandatoryDocuments[
                                selectedNonMandatoryDocument
                              ].preview
                            }
                            alt={`${selectedNonMandatoryDocument} Preview`}
                            className="preview-image"
                          />
                        ) : (
                          <div className="image-placeholder">
                            <img
                              src="/image.png"
                              alt="Placeholder"
                              className="preview-image"
                            />
                          </div>
                        )}
                      </div>

                      <div className="upload-actions">
                        <label className="icon">
                          <FontAwesomeIcon icon={faFolderOpen} title="Browse" />
                          <input
                            type="file"
                            accept="image/jpeg, image/png, image/jpg"
                            style={{ display: "none" }}
                            onChange={(e) =>
                              handleNonMandatoryFileUpload(
                                e,
                                selectedNonMandatoryDocument
                              )
                            }
                          />
                        </label>

                        {(Capacitor.getPlatform() === "android" ||
                          Capacitor.getPlatform() === "ios") &&
                          (window.innerWidth <= 768 ||
                            (window.innerWidth >= 769 &&
                              window.innerWidth <= 1200)) && (
                            <button
                              type="button"
                              className="camera-button"
                              onClick={() =>
                                handleCaptureImage(selectedNonMandatoryDocument)
                              }
                            >
                              <FontAwesomeIcon
                                icon={faCamera}
                                title="Capture with Camera"
                              />
                            </button>
                          )}

                        {/* <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            handleDeleteNonMandatoryFile(
                              selectedNonMandatoryDocument
                            )
                          }
                        >
                          <FontAwesomeIcon icon={faTrash} title="Delete" />
                        </button> */}
                      </div>
                    </div>

                    <ul className="col-md-12 uploaded-files-list">
                      {nonMandatoryDocuments[selectedNonMandatoryDocument] && (
                        <li className="uploaded-file-item">
                          {
                            nonMandatoryDocuments[selectedNonMandatoryDocument]
                              .file.name
                          }
                          <FontAwesomeIcon
                            icon={faTrash}
                            className="icon delete-icon"
                            title="Delete"
                            onClick={() =>
                              handleDeleteNonMandatoryFile(
                                selectedNonMandatoryDocument
                              )
                            }
                          />
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </AccordionItem>

            <AccordionItem
              title="Life B: Spouse Details"
              isOpen={openItem.includes("lifeB")}
              onClick={(event) => handleAccordionClick("lifeB", event)}
              disabled={
                ApplicationType === "" || ApplicationType === "Single Life"
              }
            >
              <h5>Mandatory Documents</h5>
              <div className="document-upload">
                <label className="document-label">Aadhaar Card</label>
                <div className="upload-section">
                  <div className="image-preview-container">
                    {aadhaarBPreview ? (
                      <img
                        src={aadhaarBPreview}
                        alt="Aadhaar Preview"
                        className="preview-image"
                      />
                    ) : (
                      <div className="col-md-3 imagecontainer ">
                        <img
                          src="/image.png"
                          alt="Placeholder"
                          className="preview-image"
                        />
                      </div>
                    )}
                  </div>
                  <div className="upload-actions">
                    <label className="icon">
                      <FontAwesomeIcon icon={faFolderOpen} title="Browse" />
                      <input
                        type="file"
                        id="file-upload-life-b-aadhaar"
                        accept="image/jpeg, image/png, image/jpg"
                        style={{ display: "none" }}
                        onChange={handleLifeBAadhaarUpload}
                      />
                    </label>

                    {(Capacitor.getPlatform() === "android" ||
                      Capacitor.getPlatform() === "ios") &&
                      (window.innerWidth <= 768 ||
                        (window.innerWidth >= 769 &&
                          window.innerWidth <= 1200)) && (
                        <button
                          type="button"
                          className="camera-button"
                          onClick={() => handleCaptureImage("lifeBAadhaar")}
                        >
                          <FontAwesomeIcon
                            icon={faCamera}
                            title="Capture with Camera"
                          />
                        </button>
                      )}

                    {/* <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleDeleteFile(0, "lifeB", "aadhaar")}
                    >
                      <FontAwesomeIcon icon={faTrash} title="Delete" />
                    </button> */}
                  </div>
                </div>

                <ul className="col-md-12 uploaded-files-list">
                  {formik.values.lifeBAadhaarDocuments.map((file, index) => (
                    <li key={index} className="uploaded-file-item">
                      {file.name}
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="icon delete-icon"
                        title="Delete"
                        onClick={() =>
                          handleDeleteFile(index, "lifeB", "aadhaar")
                        }
                      />
                    </li>
                  ))}
                </ul>
                {formik.errors.lifeBAadhaarDocuments &&
                  formik.touched.lifeBAadhaarDocuments && (
                    <div className="error-message" style={{ color: "red" }}>
                      {formik.errors.lifeBAadhaarDocuments}
                    </div>
                  )}
              </div>

              {/* Pancard Document Upload */}
              <div className="document-upload">
                <label className="document-label">PAN Card</label>
                <div className="upload-section">
                  <div className="image-preview-container">
                    {pancardBPreview ? (
                      <img
                        src={pancardBPreview}
                        alt="Pancard Preview"
                        className="preview-image"
                      />
                    ) : (
                      <div className="col-md-3 imagecontainer ">
                        <img
                          src="/image.png"
                          alt="Placeholder"
                          className="preview-image"
                        />
                      </div>
                    )}
                  </div>

                  <div className="upload-actions">
                    <label className="icon">
                      <FontAwesomeIcon icon={faFolderOpen} title="Browse" />
                      <input
                        type="file"
                        id="file-upload-life-b-pancard"
                        accept="image/jpeg, image/png, image/jpg"
                        style={{ display: "none" }}
                        onChange={handleLifeBPancardUpload}
                      />
                    </label>

                    {(Capacitor.getPlatform() === "android" ||
                      Capacitor.getPlatform() === "ios") &&
                      (window.innerWidth <= 768 ||
                        (window.innerWidth >= 769 &&
                          window.innerWidth <= 1200)) && (
                        <button
                          type="button"
                          className="camera-button"
                          onClick={() => handleCaptureImage("lifeBPancard")}
                        >
                          <FontAwesomeIcon
                            icon={faCamera}
                            title="Capture with Camera"
                          />
                        </button>
                      )}

                    {/* <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleDeleteFile(0, "lifeB", "pancard")}
                    >
                      <FontAwesomeIcon icon={faTrash} title="Delete" />
                    </button> */}
                  </div>
                </div>

                <ul className="col-md-12 uploaded-files-list">
                  {formik.values.lifeBPancardDocuments.map((file, index) => (
                    <li key={index} className="uploaded-file-item">
                      {file.name}
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="icon delete-icon"
                        title="Delete"
                        onClick={() =>
                          handleDeleteFile(index, "lifeB", "pancard")
                        }
                      />
                    </li>
                  ))}
                </ul>
                {formik.errors.lifeBPancardDocuments &&
                  formik.touched.lifeBPancardDocuments && (
                    <div className="error-message" style={{ color: "red" }}>
                      {formik.errors.lifeBPancardDocuments}
                    </div>
                  )}
              </div>

              <label>Non-Mandatory Document</label>
              <div className="col-md-6 non-mandatory-document">
                <select
                  className="form-control"
                  value={lifeBNonMandatoryDocType}
                  onChange={(e) => setLifeBNonMandatoryDocType(e.target.value)}
                >
                  <option value="">Select Document Type</option>
                  <option value="drivingLicense">Driving License</option>
                  <option value="passport">Passport</option>
                </select>

                {lifeBNonMandatoryDocType && (
                  <div className="document-upload">
                    <div className="upload-section">
                      <div className="image-preview-container">
                        {lifeBNonMandatoryDocType[
                          selectedNonMandatoryDocument
                        ] ? (
                          <img
                            src={
                              nonMandatoryDocuments[
                                selectedNonMandatoryDocument
                              ].preview
                            }
                            alt={`${selectedNonMandatoryDocument} Preview`}
                            className="preview-image"
                          />
                        ) : (
                          <div className="image-placeholder">
                            <img
                              src="/image.png"
                              alt="Placeholder"
                              className="preview-image"
                            />
                          </div>
                        )}
                      </div>

                      <div className="upload-actions">
                        <label className="icon">
                          <FontAwesomeIcon icon={faFolderOpen} title="Browse" />
                          <input
                            type="file"
                            id="file-upload-lifeB-non-mandatory"
                            accept="image/jpeg, image/png, image/jpg"
                            style={{ display: "none" }}
                            onChange={handleLifeBNonMandatoryFileUpload}
                          />
                        </label>

                        {(Capacitor.getPlatform() === "android" ||
                          Capacitor.getPlatform() === "ios") &&
                          (window.innerWidth <= 768 ||
                            (window.innerWidth >= 769 &&
                              window.innerWidth <= 1200)) && (
                            <button
                              type="button"
                              className="camera-button"
                              onClick={() =>
                                handleCaptureImage(lifeBNonMandatoryDocuments)
                              }
                            >
                              <FontAwesomeIcon
                                icon={faCamera}
                                title="Capture with Camera"
                              />
                            </button>
                          )}

                        {/* <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            handleDeleteNonMandatoryFile(
                              selectedNonMandatoryDocument
                            )
                          }
                        >
                          <FontAwesomeIcon icon={faTrash} title="Delete" />
                        </button> */}
                      </div>
                    </div>

                    <ul className="col-md-12 uploaded-files-list">
                      {lifeBNonMandatoryDocuments.map((doc, index) => (
                        <li key={index} className="uploaded-file-item">
                          {doc.name}
                          <FontAwesomeIcon
                            icon={faTrash}
                            className="icon delete-icon"
                            title="Delete"
                            onClick={() => {
                              setLifeBNonMandatoryDocuments((prevDocs) =>
                                prevDocs.filter((_, i) => i !== index)
                              );
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AccordionItem>

            <AccordionItem
              title="Child/Children Inclusion"
              isOpen={openItem.includes("Child")}
              onClick={(event) => handleAccordionClick("Child", event)}
              disabled={!enableChildAccordion}
            >
              <h3>Child</h3>
              {ChildData && ChildData.length > 0 ? (
                ChildData.map((child, childIndex) => (
                  <div key={child.person_id} className="child-section">
                    <label className="document-label">Aadhaar Card</label>
                    <div className="document-upload">
                      <div className="upload-section">
                        <div className="image-preview-container ">
                          {formik.values.children[childIndex]
                            ?.childAadhaarDocuments?.length > 0 ? (
                            <img
                              src={
                                formik.values.children[childIndex]
                                  ?.childAadhaarDocuments[0]?.base64
                              }
                              alt={`Child ${childIndex + 1} Aadhaar`}
                              className="preview-image"
                            />
                          ) : (
                            <div className="col-md-3 imagecontainer ">
                              <img
                                src="/image.png"
                                alt="Placeholder"
                                className="preview-image"
                              />
                            </div>
                          )}
                        </div>

                        <div className="upload-actions">
                          <label className="icon">
                            <FontAwesomeIcon
                              icon={faFolderOpen}
                              title="Browse"
                            />
                            <input
                              type="file"
                              id={`file-upload-aadhaar-${childIndex}`}
                              accept="image/jpeg, image/png, image/jpg"
                              style={{ display: "none" }}
                              onChange={(e) =>
                                handleChildFileUpload(
                                  e,
                                  childIndex,
                                  "childAadhaarDocuments"
                                )
                              }
                            />
                            {formik.errors.children?.[childIndex]
                              ?.childAadhaarDocuments &&
                              formik.touched.children?.[childIndex]
                                ?.childAadhaarDocuments && (
                                <div style={{ color: "red" }}>
                                  {
                                    formik.errors.children[childIndex]
                                      .childAadhaarDocuments
                                  }
                                </div>
                              )}
                          </label>

                          {(Capacitor.getPlatform() === "android" ||
                            Capacitor.getPlatform() === "ios") &&
                            (window.innerWidth <= 768 ||
                              (window.innerWidth >= 769 &&
                                window.innerWidth <= 1200)) && (
                              <button
                                type="button"
                                className="camera-button"
                                onClick={() =>
                                  handleCaptureImage("childAadhaar")
                                }
                              >
                                <FontAwesomeIcon
                                  icon={faCamera}
                                  title="Capture with Camera"
                                />
                              </button>
                            )}

                          {/* <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              handleDeleteChildFile(
                                childIndex,
                                "childAadhaarDocuments"
                              )
                            }
                          >
                            <FontAwesomeIcon icon={faTrash} title="Delete" />
                          </button> */}
                        </div>
                      </div>

                      <ul className="col-md-12 uploaded-files-list">
                        {formik.values.children[
                          childIndex
                        ]?.childAadhaarDocuments?.map((file, index) => (
                          <li key={index} className="uploaded-file-item">
                            {/* {file.name} */}
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="icon delete-icon"
                              title="Delete"
                              onClick={() =>
                                handleDeleteChildFile(
                                  index,
                                  childIndex,
                                  "childAadhaarDocuments"
                                )
                              }
                            />
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Birth Certificate Document Upload */}
                    <label className="document-label">
                      Birth Certificate Documents
                    </label>
                    <div className="document-upload">
                      <div className="upload-section">
                        <div className="image-preview-container ">
                          {formik.values.children[childIndex]
                            ?.childBirthCertificateDocuments?.length > 0 ? (
                            <img
                              src={
                                formik.values.children[childIndex]
                                  ?.childBirthCertificateDocuments[0]?.base64
                              }
                              alt="Birth Certificate Preview"
                              className="preview-image"
                            />
                          ) : (
                            <div className="col-md-3 imagecontainer">
                              <img
                                src="/image.png"
                                alt="Placeholder"
                                className="preview-image"
                              />
                            </div>
                          )}
                        </div>

                        <div className="upload-actions">
                          <label className="icon">
                            <FontAwesomeIcon
                              icon={faFolderOpen}
                              title="Browse"
                            />
                            <input
                              type="file"
                              id={`file-upload-birthcertificate-${childIndex}`}
                              accept="image/jpeg, image/png, image/jpg"
                              style={{ display: "none" }}
                              onChange={(e) =>
                                handleChildFileUpload(
                                  e,
                                  childIndex,
                                  "childBirthCertificateDocuments"
                                )
                              }
                            />
                            {formik.errors.children?.[childIndex]
                              ?.childBirthCertificateDocuments &&
                              formik.touched.children?.[childIndex]
                                ?.childBirthCertificateDocuments && (
                                <div style={{ color: "red" }}>
                                  {
                                    formik.errors.children[childIndex]
                                      .childBirthCertificateDocuments
                                  }
                                </div>
                              )}
                          </label>

                          {(Capacitor.getPlatform() === "android" ||
                            Capacitor.getPlatform() === "ios") &&
                            (window.innerWidth <= 768 ||
                              (window.innerWidth >= 769 &&
                                window.innerWidth <= 1200)) && (
                              <button
                                type="button"
                                className="camera-button"
                                onClick={() =>
                                  handleCaptureImage("childBirthCertificate")
                                }
                              >
                                <FontAwesomeIcon
                                  icon={faCamera}
                                  title="Capture with Camera"
                                />
                              </button>
                            )}

                          {/* <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              handleDeleteChildFile(
                                "childAadhaarDocuments"
                              )
                            }
                          >
                            <FontAwesomeIcon icon={faTrash} title="Delete" />
                          </button> */}
                        </div>
                      </div>

                      <ul className="col-md-12 uploaded-files-list">
                        {formik.values.children[
                          childIndex
                        ]?.childBirthCertificateDocuments?.map(
                          (file, index) => (
                            <li key={index} className="uploaded-file-item">
                              {/* {file.file.name} */}
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="icon delete-icon"
                                title="Delete"
                                onClick={() =>
                                  handleDeleteChildFile(
                                    index,
                                    childIndex,
                                    "childBirthCertificateDocuments"
                                  )
                                }
                              />
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                ))
              ) : (
                <p>No children data available</p> // A fallback message in case there are no children
              )}
            </AccordionItem>
            {/* {!isKeyboardVisible && (
                                  <div className="fixednextprevbutton d-flex justify-content-between">
                                  <button 
                                                  type="button" 
                                                  className="btn btnprev" 
                                                  onClick={() => navigate("/signaturecapture")}
                                              > Prev </button>
                                    <button className="btn btnnext" onClick={saveData}>
                                      Save
                                    </button>
                                    <button
                                      className="btn btnnext"
                                      disabled={!(previewimage && previewdocs && savebuttonclicked)}
                                      onClick={() => console.log("Formik errors :::", formik.errors)}
                                    >
                                      Next
                                    </button>
                                    
                                  </div>
                      )} */}
            {!isKeyboardVisible && (
              <div className="iosfixednextprevbutton">
                <div className="fixednextprevbutton d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btnprev"
                    onClick={() => navigate("/signaturecapture")}
                  >
                    {" "}
                    Prev{" "}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={saveData}
                  >
                    Save
                  </button>
                  <button
                    type="submit"
                    className="btn btnnext"
                    disabled={
                      !(previewimage && previewdocs && savebuttonclicked)
                    }
                    onClick={() =>
                      console.log("Formik errors :::", formik.errors)
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default DocumentUpload;
