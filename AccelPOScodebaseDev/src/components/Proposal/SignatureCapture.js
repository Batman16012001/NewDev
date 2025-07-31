import { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import "./SignatureCapture.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenNib } from "@fortawesome/free-solid-svg-icons";
import { Formik, Form, Field, ErrorMessage, useFormik } from "formik";
import * as Yup from "yup";
import { findRecordById, updateDetailById } from "../../db/indexedDB";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../../components/Dashboard/Template";
import ValidationErrorModal from "./ValidationErrorModal";

const SignatureCapture = () => {
    const navigate = useNavigate();
    const navigate_to_nextscreen = useNavigate();
    const sigCanva = useRef({});
    const [modalMessage, setModalMessage] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showPad, setShowPad] = useState(false);
    const [salesofficerwitness, setsalesofficerwitness] = useState(false)
    const [isSubmitted, setisSubmitted] = useState(false);
    const [dataaftersignstate, setdataaftersign] = useState()
    const [applicationType, setApplicationType] = useState('');
    const [mainLifeSignature, setMainLifeSignature] = useState(null);
    const [witnessNameonbackswipe, setwitnessNameonbackswipe] = useState("");
    const [witnessNic, setwitnessNic] = useState("");
    const [witnessAddressonbackswipe, setwitnessAddressonbackswipe] = useState("")
    const [witnessSignature, setWitnessSignature] = useState(null);
    const [secondaryLifeSignature, setSecondaryLifeSignature] = useState(null);
    const [currentSignatureType, setCurrentSignatureType] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [signsignaturedata, setsignsignaturedata] = useState();
    const erefid = sessionStorage.getItem("erefid");

    const agent_id = sessionStorage.getItem("agentId");
    let person_id = sessionStorage.getItem("personID");
    let erefId = sessionStorage.getItem("erefid")
    let caseId = sessionStorage.getItem("CaseId")
    const ApplicationType = sessionStorage.getItem("applicationType")
    //    const doc_id = generatedocId()
    // const erefid = sessionStorage.getItem("")

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
        const type = sessionStorage.getItem("applicationType");
        if (type) {
            setApplicationType(type);
        }
    }, []);

    useEffect(() => {
        const fetchdata = async () => {
            const dataaftersign = await findRecordById("al_application_main", erefid);
            console.log("Data on backswipe:::", dataaftersign)
            //setdataaftersign(dataaftersign)
            const signaturestatus = sessionStorage.getItem("Signaturesubmitted")
            if(signaturestatus === "true"){
                setisSubmitted(true)
            }

            let signaturedata = dataaftersign.result.signedInformation
            if (dataaftersign) {

                formik.setFieldValue("witnessName", signaturedata.witnessSignedCaptureDetails.witnessName.first)
                formik.setFieldValue("witnessNicPassport", signaturedata.witnessSignedCaptureDetails.witnessName.witnessNicPassport)
                formik.setFieldValue("witnessAddress", "PUNE")
                formik.setFieldValue("salesOfficerWitness", dataaftersign.result.salasaswitness)
                if (signaturedata.primarySignedCapturedDetails && signaturedata.witnessSignedCaptureDetails) {
                    setMainLifeSignature(signaturedata.primarySignedCapturedDetails.base64)
                    setWitnessSignature(signaturedata.witnessSignedCaptureDetails.base64)


                } if (signaturedata.secondarySignedCapturedDetails) {
                    setSecondaryLifeSignature(signaturedata.secondarySignedCapturedDetails.base64)
                    setWitnessSignature(signaturedata.witnessSignedCaptureDetails.base64)
                }

            }
            if (formik.values.salesOfficerWitness) {
                handleCheckboxChange(true); // Pass true as salesOfficerWitness is checked

            }


        }
        fetchdata();
    }, [])

    const openSignaturePad = (signatureType) => {
        setCurrentSignatureType(signatureType);
        setShowPad(true);
    };

    const createDocumentDetails = (documents, documentType, documentId, documentName) => {
        console.log("documents in createDocumentDetails:::", documents)
        return {
            documentId: generatedocId(), // Function to generate random IDs
            documentType: documentType,

            documents: [
                {
                    documentName: documentName,
                    base64Content: documents.base64
                }

            ],
        };
    };

    const generatedocId = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const handleCombinedSubmit = async (values) => {
        console.log("Values::::", values)
        if (
            (applicationType === 'Single Life' && !mainLifeSignature) ||
            (applicationType === 'Joint Life' && (!mainLifeSignature || !secondaryLifeSignature)) ||
            !witnessSignature
        ) {
            setErrorMessage("All signatures are required.");
            return;
        }
        setErrorMessage("");

        let signedInformation = {};

        // Populate `signedInformation` based on `applicationType`
        const signatureData = {
            location: { place: "ABC" }, // Default location for simplicity; update as needed
            date: new Date().toISOString()
        };

        if (applicationType === 'Single Life') {
            if (mainLifeSignature) {
                signedInformation.primarySignedCapturedDetails = {
                    ...signatureData,
                    base64: mainLifeSignature
                };
            }
            if (witnessSignature) {
                signedInformation.witnessSignedCaptureDetails = {
                    ...signatureData,
                    base64: witnessSignature,
                    witnessNICNumber: values.witnessNicPassport,
                    witnessName: {
                        first: values.witnessName,
                        middle: "middleName",
                        last: "lastName",
                        title: "Title",
                        nameWithInitials: "Mr",
                        witnessNicPassport: values.witnessNicPassport,
                        witnessAddress: values.witnessAddress
                    },
                    witnessAddress: {
                        addressType: "dfsf",
                        line1: "fdsf",
                        line2: "fds",
                        line3: "fds",
                        city: "fds",
                        district: "fdsf",
                        state: "fdsf",
                        postalCode: "String",
                        postalPin: "8989",
                        country: "fsdf"
                    }
                };
            }
        } else if (applicationType === 'Joint Life') {
            if (mainLifeSignature) {
                signedInformation.primarySignedCapturedDetails = {
                    ...signatureData,
                    base64: mainLifeSignature
                };
            }
            if (secondaryLifeSignature) {
                signedInformation.secondarySignedCapturedDetails = {
                    ...signatureData,
                    base64: secondaryLifeSignature
                };
            }
            if (witnessSignature) {
                signedInformation.witnessSignedCaptureDetails = {
                    ...signatureData,
                    base64: witnessSignature,
                    witnessNICNumber: values.witnessNicPassport,
                    witnessName: {
                        first: values.witnessName,
                        middle: "middleName",
                        last: "lastName",
                        title: "Title",
                        nameWithInitials: "Mr",
                        witnessNicPassport: values.witnessNicPassport,
                        witnessAddress: values.witnessAddress
                    },
                    witnessAddress: {
                        addressType: "dfsf",
                        line1: "fdsf",
                        line2: "fds",
                        line3: "fds",
                        city: "fds",
                        district: "fdsf",
                        state: "fdsf",
                        postalCode: "String",
                        postalPin: "8989",
                        country: "fsdf"
                    }
                };
            }
        }

        // Log and update data as needed
        const final_signinfo = {
            signedInformation,
            e_referenceId: erefid,
            salasaswitness: formik.values.salesOfficerWitness,
            //submitted: true
        };

        setsignsignaturedata(final_signinfo);

        // Update or save the data to the backend or session storage
        const updatesignatureDetails = await updateDetailById("al_application_main", erefid, final_signinfo);
        console.log("Data updated successfully::", updatesignatureDetails);

        //setisSubmitted(true)
        sessionStorage.setItem("Signaturesubmitted" ,true)


        let data = {};

        data = {
            "primaryInsured": {
                "personId": person_id,
                "documents": [
                    createDocumentDetails(updatesignatureDetails.signedInformation.primarySignedCapturedDetails, "Signature", 'docIdgenerated', "PrimarySignature")
                ]
            },
            "documentId": generatedocId(),
            "status": "",
            "proposalId": erefId,
            "agentId": agent_id,
            "caseId": caseId,
            "createdAt": new Date(),
            "updatedAt": ""

        }

        if (ApplicationType === "Joint Life") {
            data["secondaryInsured"] = {
                "personId": person_id,
                "documents": [
                    createDocumentDetails(updatesignatureDetails.signedInformation.secondarySignedCapturedDetails, "Signature", 'docIdgenerated', "SecondarySignature")
                ]
            };
        }

        console.log("Final API data ::::: ", JSON.stringify(data));

        try {
            const apiCall = await fetch(`http://192.168.2.7:4002/documentManagementService/proposals/${agent_id}/${caseId}/documents`, {
                //const apiCall = await fetch(`http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com/document-management-service/proposals/${agent_id}/${caseId}/documents`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data), // Use the result directly
            });

            const response = await apiCall.json();
            console.log('API Response:', JSON.stringify(response));
        } catch (e) {
            console.log("Error while calling API:::", e)
        }

        navigate('/documentcapture');
    };

    const handleCheckboxChange = async (isChecked) => {
        if (isChecked) {
            console.log("Ischecked")
            const agentData = await findRecordById("al_agent_details", agent_id)
            console.log("Agent Data:::", agentData)

            if (agentData) {
                formik.setFieldValue("witnessName", agentData.result.name)
                formik.setFieldValue("witnessNicPassport", agentData.result.registrationNo)
                formik.setFieldValue("witnessAddress", "Pune")
                setsalesofficerwitness(true)
            }
        } else {
            formik.setFieldValue("witnessName", "");
            formik.setFieldValue("witnessNicPassport", "");
            formik.setFieldValue("witnessAddress", "")
            setsalesofficerwitness(false)
        }
    }

    const saveSignature = () => {
        if (!sigCanva.current || !sigCanva.current.isEmpty()) {
            const dataUrl = sigCanva.current.getTrimmedCanvas().toDataURL('image/png');
            setShowPad(false);
            console.log("Signature on signature page:", dataUrl);

            fetch(dataUrl)
                .then(res => res.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = () => {
                        const base64data = reader.result;


                        // Define signatureData based on the base64 image
                        const signatureData = {
                            base64: base64data,
                            location: {
                                place: currentSignatureType === "Witness" ? "XYZ" : "ABC"
                            },
                            date: new Date().toISOString() // capture current date
                        };

                        let signedInformation = {};

                        if (applicationType === 'Single Life') {
                            if (currentSignatureType === "MainLife") {
                                signedInformation = {
                                    primarySignedCapturedDetails: signatureData
                                };
                                setMainLifeSignature(base64data); // Save the main life signature
                            } else if (currentSignatureType === "Witness") {
                                signedInformation = {
                                    witnessSignedCaptureDetails: {
                                        ...signatureData,
                                        witnessNICNumber: "7858596548",
                                        witnessName: {
                                            first: "firstName",
                                            middle: "middleName",
                                            last: "lastName",
                                            title: "Title",
                                            nameWithInitials: "Mr"
                                        },
                                        witnessAddress: {
                                            addressType: "dfsf",
                                            line1: "fdsf",
                                            line2: "fds",
                                            line3: "fds",
                                            city: "fds",
                                            district: "fdsf",
                                            state: "fdsf",
                                            postalCode: "String",
                                            postalPin: "8989",
                                            country: "fsdf"
                                        }
                                    }
                                };
                                setWitnessSignature(base64data); // Save the witness signature
                            }
                        } else if (applicationType === 'Joint Life') {
                            if (currentSignatureType === "MainLife") {
                                signedInformation.primarySignedCapturedDetails = signatureData;
                                setMainLifeSignature(base64data); // Save the main life signature
                            } else if (currentSignatureType === "SecondaryLife") {
                                signedInformation.secondarySignedCapturedDetails = signatureData;
                                setSecondaryLifeSignature(base64data); // Save the secondary life signature
                            } else if (currentSignatureType === "Witness") {
                                signedInformation.witnessSignedCaptureDetails = {
                                    ...signatureData,
                                    witnessNICNumber: "7858596548",
                                    witnessName: {
                                        first: "firstName",
                                        middle: "middleName",
                                        last: "lastName",
                                        title: "Title",
                                        nameWithInitials: "Mr"
                                    },
                                    witnessAddress: {
                                        addressType: "dfsf",
                                        line1: "fdsf",
                                        line2: "fds",
                                        line3: "fds",
                                        city: "fds",
                                        district: "fdsf",
                                        state: "fdsf",
                                        postalCode: "String",
                                        postalPin: "8989",
                                        country: "fsdf"
                                    }
                                };
                                setWitnessSignature(base64data); // Save the witness signature
                            }
                        }
                        const final_signinfo = {
                            signedInformation,
                            "e_referenceId": erefid
                        }
                        console.log("Signed Information JSON:", signedInformation);
                        setsignsignaturedata(final_signinfo)
                    }
                })
        } else {
            setModalMessage("Signature is required , Please sign before saving")
            setIsModalVisible(true)
        }

    };

    const clearSignature = () => {
        sigCanva.current.clear();
    };

    // const previewOutput = () => {
    //     navigate_to_nextscreen('/proposaloutput')
    // }

    const handleModalClose = () => setIsModalVisible(false);

    const validationSchema = Yup.object({
        witnessName: Yup.string().required("Witness Name is required"),
        witnessNicPassport: Yup.string().required("NIC/Passport Number is required"),
        witnessAddress: Yup.string().required("Address is required")
    });

    const SignatureBlock = ({ title, signatureType, onClick }) => (

        <div className="container-fluid">
            {/* Title */}
            <h5 className="mb-4 text-center">{title}</h5>

            {/* Row */}
            <div className="row align-items-center p-4 mb-3 justify-content-center ">
                {/* Signature Section */}
                <div className="col-md-4 col-12 d-flex flex-column justify-content-between align-items-center mb-3 mb-md-0 signaturepad" style={{ height: "200px" }}>
                    <div className="text-center d-flex justify-content-center align-items-center" style={{ flexGrow: 1, width: "100%", height: "100%",}}>
                        {signatureType ? (
                            <img
                                src={signatureType}
                                alt="Signature"
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain", // Maintains aspect ratio
                                  }}
                            />
                        ) : (
                            <img
                                src="/signature.png" // Update with the correct path to your image
                                alt="Add Signature"
                                style={{ width: "50px", height: "50px", cursor: "pointer" }}
                                onClick={onClick}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    useEffect(() => {
        let overlay = document.getElementById('overlay');
      
        if (showPad) {
          document.body.style.overflow = 'hidden';
      
          // Create overlay if it doesn't exist
          if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'overlay';
            document.body.appendChild(overlay);
      
            // Add click event to close the sidebar
            overlay.addEventListener('click', () => setShowPad(false));
          }
      
          overlay.classList.add('active-overlay');
        } else {
          document.body.style.overflow = 'auto';
          if (overlay) {
            overlay.classList.remove('active-overlay');
            overlay.removeEventListener('click', () => setShowPad(false));
            document.body.removeChild(overlay);
          }
        }
      
        // Cleanup on unmount
        return () => {
          document.body.style.overflow = 'auto';
          if (overlay) {
            overlay.removeEventListener('click', () => setShowPad(false));
            document.body.removeChild(overlay);
          }
        };
      }, [showPad]);
    
    

    const formik = useFormik({
        initialValues: {
            witnessName: '',
            witnessNicPassport: '',
            witnessAddress: '',
            salesOfficerWitness: false
        },
        validationSchema: validationSchema,
        onSubmit: handleCombinedSubmit,
    });

    return (
        <SidebarLayout>
            <div className="signature-container">


                <form className={`signatureForm ${showPad ? 'open' : 'closed'}`} onSubmit={formik.handleSubmit}>
                    <div className="form-check">

                        <input
                            type="checkbox"
                            className="form-check-input"
                            name="salesOfficerWitness"
                            id="salesOfficerWitness"
                            onChange={async (e) => {
                                const isChecked = e.target.checked;
                                formik.setFieldValue("salesOfficerWitness", isChecked);
                                // Call handleCheckboxChange when the checkbox is checked

                                await handleCheckboxChange(isChecked, formik.setFieldValue);

                            }}
                            checked={formik.values.salesOfficerWitness}
                            disabled={isSubmitted}

                        />
                        <label className="form-check-label" htmlFor="salesOfficerWitness">
                            Sales Officer is Witness
                        </label>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3 mt-2">
                            <label htmlFor="witnessName">Witness Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="witnessName"
                                placeholder="Enter witness name"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.witnessName}
                                disabled={salesofficerwitness || isSubmitted}
                            />
                            {formik.touched.witnessName && formik.errors.witnessName && (
                                <div className="text-danger">{formik.errors.witnessName}</div>
                            )}
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="witnessNicPassport">NIC/Passport Number</label>
                            <input
                                type="text"
                                className="form-control"
                                name="witnessNicPassport"
                                placeholder="Enter NIC/Passport number"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.witnessNicPassport}
                                disabled={salesofficerwitness || isSubmitted}
                            />
                            {formik.touched.witnessNicPassport && formik.errors.witnessNicPassport && (
                                <div className="text-danger">{formik.errors.witnessNicPassport}</div>
                            )}
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="witnessAddress">Address</label>
                            <input
                                type="text"
                                className="form-control"
                                name="witnessAddress"
                                placeholder="Enter address"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.witnessAddress}
                                disabled={salesofficerwitness || isSubmitted}
                            />
                            {formik.touched.witnessAddress && formik.errors.witnessAddress && (
                                <div className="text-danger">{formik.errors.witnessAddress}</div>
                            )}
                        </div>
                    </div>

                    <div className="row signatureForm">
                        <SignatureBlock
                            title="Signature of LifeA"
                            signatureType={mainLifeSignature}
                            onClick={!mainLifeSignature ? () => openSignaturePad("MainLife") : null}
                        />
                        {applicationType === "Joint Life" && (
                            <SignatureBlock
                                title="Signature of LifeB"
                                signatureType={secondaryLifeSignature}
                                onClick={!secondaryLifeSignature ? () => openSignaturePad("SecondaryLife") : null}
                            />
                        )}
                        <SignatureBlock
                            title="Witness Signature"
                            signatureType={witnessSignature}
                            onClick={!witnessSignature ? () => openSignaturePad("Witness") : null}
                        />
                    </div>

                    {!isKeyboardVisible && (
                         <div className='iosfixednextprevbutton'>
                        <div className="fixednextprevbutton d-flex justify-content-between">
                            <button
                                type="button"
                                className="btn btnprev"
                                onClick={() => navigate("/clientsdeclaration")}
                            > Prev </button>
                            <button type="submit" className="btn btnnext" >
                                Next
                            </button>
                        </div>
                        </div>
                    )}

                </form>

                {showPad && (
                        <div
                            className="canvas-container position-fixed top-50 start-50 translate-middle bg-white p-3 rounded shadow"
                            style={{
                                position: 'fixed',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: '1000',
                                backgroundColor: 'white',
                                padding: '20px',
                                borderRadius: '10px',
                                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            <SignatureCanvas
                                penColor="black"
                                canvasProps={{ className: "sigCanva border rounded shadow-sm" }}
                                ref={sigCanva}
                            />
                            <div className="d-flex justify-content-between mt-3">
                                <input type="button" value="Clear" onClick={clearSignature} className="btn btn-danger" />
                                <input type="button" value="Save" onClick={saveSignature} className="btn btn-danger" />
                                <input type="button" value="Close" onClick={() => setShowPad(false)} className="btn btn-outline-danger" />
                            </div>
                        </div>
                    )}

                <ValidationErrorModal
                    show={isModalVisible}
                    onClose={handleModalClose}
                    message={modalMessage}
                />

            </div>
        </SidebarLayout>
    );
};


export default SignatureCapture;
