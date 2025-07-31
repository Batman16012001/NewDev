import React, { useRef, useState, useEffect } from 'react'
import "./MySavedQuotations.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SignatureCanvas from 'react-signature-canvas';
import { faEdit, faEnvelope, faEye, faFileAlt, faPenNib, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { findRecordById, saveDetail, updateDetailById } from '../../db/indexedDB';
import SidebarLayout from '../../components/Dashboard/Template';
import ValidationErrorModal from '../Proposal/ValidationErrorModal';

const MySavedQuotations = () => {
    const navigate = useNavigate();
    const personID = sessionStorage.getItem('personID');
    const riderID = sessionStorage.getItem("riderID")
    const [signaturedone, setsignaturedone] = useState(false)
    const [modalMessage, setModalMessage] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showPad, setShowPad] = useState(false);
    const [signatureUrl, setSignatureUrl] = useState();
    const [planName, setPlanName] = useState();
    const [sumAssured, setSumAssured] = useState();
    const [ProposedInsured, setProposedInsured] = useState();
    const [isPreviewed, setIsPreviewed] = useState(false);
    const [totalPremiumData , settotalPremiumData] = useState([])
    const sigCanvas = useRef({});

    useEffect(() => {
        const sqsID = sessionStorage.getItem("sqsID");
        const fetchdata = async () => {
            if (sqsID) {
                try {
                    const signatureObject = await findRecordById('al_sqs_details', sqsID)
                    console.log('Signature object:', signatureObject);
                    const signatureBase64 = signatureObject.result.signatureFile;
                    if(signatureObject.result.policyDetails.productName){
                        setPlanName(signatureObject.result.policyDetails.productName);
                    }else{
                        setPlanName("Plan is not selected")
                    }
                   
                    setSumAssured(signatureObject.result.policyDetails.sumAssured);

                    if (signatureBase64) {
                        // Convert Base64 back to Blob
                        fetch(signatureBase64)
                            .then(res => res.blob())
                            .then(blob => {
                                const fileUrl = URL.createObjectURL(blob);
                                setSignatureUrl(fileUrl);
                            })
                            .catch(error => {
                                console.error('Error converting Base64 to Blob:', error);
                            });
                    } else {
                        console.log('signatureFile is not available:', signatureBase64);
                    }
                } catch (e) {
                    console.log("Error::", e)
                }

            }else{
                console.log("SQS Id is not present")
            }
            // const person_id = sessionStorage.getItem('personId');
            console.log("Got the personId:::", personID);
            if (personID) {
                try {
                    const personalData = await findRecordById('al_person_details', personID)
                    console.log("personla data::", personalData)
                    console.log("Personal data:::", personalData.result.primaryInsured.person.name.first)
                    setProposedInsured(personalData.result.primaryInsured.person.name.first)
                } catch (e) {
                    console.log("Error:::", e)
                }
            }

            if(riderID){
                try{
                    const riderdata = await findRecordById("al_rider_details" , riderID)
                    console.log("Rider data:::",riderdata.result.totalPremiumData)
                    settotalPremiumData(riderdata.result.totalPremiumData[0].PremiumAmount)
                }catch(e){
                    console.log("Error getting rider data::::",e)
                }
            }
        };
        fetchdata()

    }, []);

    useEffect(() => {
        // Retrieve the signaturedone state from sessionStorage
        const storedSignatureDone = sessionStorage.getItem("signaturedoneonmysavedquotations") === "true";
        setsignaturedone(storedSignatureDone);
    }, []);

    const clearSignature = () => {
        sigCanvas.current.clear();
    };
    const proceedtoeapp = () => {
        navigate('/agentdetails')
    }

    const saveSignature = () => {
        if (!sigCanvas.current || !sigCanvas.current.isEmpty()) {
            setsignaturedone(true)
            sessionStorage.setItem("signaturedoneonmysavedquotations", "true");
            const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
            setShowPad(false);

            // Convert dataUrl to Blob and then create a File
            fetch(dataUrl)
                .then(res => res.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.readAsDataURL(blob); // Convert Blob to Base64
                    reader.onloadend = () => {
                        const base64data = reader.result;

                        const sqsID = sessionStorage.getItem("sqsID");

                        // Create an object to save in IndexedDB
                        const signatureObject = {
                            sqs_id: sqsID,
                            signatureFile: base64data // Save the Base64 string
                        };

                        // Save the Base64 string to IndexedDB
                        updateDetailById('al_sqs_details', sqsID, signatureObject)
                            .then(() => {
                                setSignatureUrl(base64data);
                                console.log('Signature saved in IndexedDB');
                            })
                            .catch(error => {
                                console.error('Error saving signature in IndexedDB:', error);
                            });
                    };
                })
                .catch(error => {
                    console.error('Error converting dataUrl to Blob:', error);
                });
        } else {
            setModalMessage("Signature is required , Please sign before saving")
            setIsModalVisible(true)
        }

    };

    const handleModalClose = () => setIsModalVisible(false);
    const QuotationSummaryPreview = () => {
        navigate('/quotationoutput')
        setIsPreviewed(true)
    }

    const editQuotation = (riderid, sqsID, person_id) => {
        console.log("Got data when function called:::", riderid, sqsID, person_id)
        sessionStorage.setItem("personID", person_id);
        //setQuotationData({ riderid, sqsid: sqsID, personid: person_id });
        navigate('/sqs_personal_detail')
    }

    const navigate_to_dashboard = () => {
        navigate('/dashboard');
    };

    return (
        <SidebarLayout>
            <div className='savedquote-container'>
                {/* <div className="savedquote-navbar bg-white mb-4 p-3 shadow-sm">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="backArrow pt-2" onClick={navigate_to_dashboard}>
                            <FontAwesomeIcon icon={faArrowLeft} className="backPointer red-text" />
                            <span className="ms-2 redtext ml-2">Insurance Quotation</span>
                        </div>
                        <div className="d-flex align-items-center">
                            <img
                                src="/notification.png"
                                alt="Notification Icon"
                                className="notification-icon mx-3"
                                style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                            />
                        </div>
                    </div>

                    <div className="border-bottom mt-2"></div>
                    <span className="ms-2 text ml-2">Saved Quotations</span>
                </div> */}

                <div className="savedquoteform">
                    <div class="table-responsive">
                        <table className="table table-striped">
                            <thead className="heading">
                                <tr>
                                    <th scope="col">Select</th>
                                    <th scope="col">ProposedInsured</th>
                                    <th scope="col">PlanName</th>
                                    {/* <th scope="col">SumAssured</th> */}
                                    <th scope="col">Premium</th>
                                    <th scope="col">Edit</th>
                                    <th scope="col">Preview</th>
                                    <th scope="col">Signature</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Application</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th scope="row">
                                        <div class="input-group mb-3">
                                            <div class="input-group-prepend">
                                                <div class="input-group-text">
                                                    <input type="checkbox" aria-label="Checkbox for following text input" />
                                                </div>
                                            </div>
                                        </div>
                                    </th>
                                    <td>{ProposedInsured}</td>
                                    <td>{planName}</td>
                                    {/* <td>Rs.85858</td> */}
                                    <td>Rs. {totalPremiumData}</td>
                                    <td
                                        style={{
                                            cursor: signaturedone ? 'not-allowed' : 'pointer',
                                            opacity: signaturedone ? 0.5 : 1,
                                        }}
                                        onClick={() => {
                                            if (!signaturedone) {
                                                editQuotation(
                                                    sessionStorage.getItem("riderID"),
                                                    sessionStorage.getItem("sqsID"),
                                                    sessionStorage.getItem("personID")
                                                );
                                            }
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                        {/* Edit */}
                                    </td>

                                    <td >
                                        <FontAwesomeIcon icon={faEye} onClick={() => QuotationSummaryPreview()}>Preview</FontAwesomeIcon>
                                    </td>
                                    <td>
                                        {signatureUrl ? (
                                            <img src={signatureUrl} alt="Signature" style={{ width: '100px', height: 'auto' }} />
                                        ) : (
                                            <FontAwesomeIcon icon={faPenNib} onClick={() => setShowPad(true)}>Signature</FontAwesomeIcon>
                                        )}
                                    </td>

                                    <td>
                                        <FontAwesomeIcon icon={faEnvelope}>Email</FontAwesomeIcon>
                                    </td>
                                    <td
                                        onClick={signatureUrl ? proceedtoeapp : null}
                                        style={{
                                            cursor: signatureUrl ? 'pointer' : 'not-allowed',
                                            opacity: signatureUrl ? 1 : 0.5
                                        }}>
                                        <FontAwesomeIcon icon={faFileAlt}>Application</FontAwesomeIcon>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                {showPad && (
                    <div className="canvasdiv p-3 border rounded">
                        <SignatureCanvas
                            penColor="black"
                            canvasProps={{ className: "sigCanvas border rounded" }}
                            ref={sigCanvas}
                        />
                        <div className="mt-3 d-flex justify-content-between flex-wrap">
                            <button className="btn btn-danger me-2 mb-2" onClick={clearSignature}>
                                Clear
                            </button>
                            <button className="btn btn-danger me-2 mb-2" onClick={saveSignature}>
                                Save
                            </button>
                            <button className="btn btn-outline-danger mb-2" onClick={() => setShowPad(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                )}
                <ValidationErrorModal
                    show={isModalVisible}
                    onClose={handleModalClose}
                    message={modalMessage}
                />
                {/* <Footer></Footer> */}
            </div>
        </SidebarLayout>

    )
}

export default MySavedQuotations
