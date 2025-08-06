import React, { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button, Row, Col, Card, Modal } from "react-bootstrap";
import SidebarLayout from "../Dashboard/Template";
import "./FNA.css";
import { useNavigate } from "react-router-dom";
import {
  saveDetail,
  findRecordById,
  updateDetailById,
} from "../../db/indexedDB"; // adjust import if needed
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

const SignatureBlock = ({ title, signatureData, onClick }) => (
  <div className="container-fluid">
    <h5 className="mb-4 text-center">{title}</h5>
    <div className="row align-items-center justify-content-center">
      <div
        className="col-md-12 col-10 signaturepad bg-light d-flex justify-content-center align-items-center"
        style={{ height: "200px", cursor: "pointer" }}
        onClick={onClick}
      >
        {signatureData ? (
          <img
            src={signatureData}
            alt={`${title} Signature`}
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
        ) : (
          <img
            src="/signature.png"
            alt="Add Signature"
            style={{ width: "50px", height: "50px" }}
          />
        )}
      </div>
    </div>
  </div>
);

const FNA_Signature = () => {
  const sigCanva = useRef({});
  const [showPad, setShowPad] = useState(false);
  const [activeSigner, setActiveSigner] = useState(null);
  const [customerSignature, setCustomerSignature] = useState(null);
  const [officerSignature, setOfficerSignature] = useState(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const navigate = useNavigate();
  const [showUnifiedModal, setShowUnifiedModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalAction, setModalAction] = useState(null);

  useEffect(() => {
    const fetchSignatures = async () => {
      const fna_id = sessionStorage.getItem("fnaId");
      if (!fna_id) return;

      try {
        const existingRecord = await findRecordById(
          "al_fna_signatures",
          fna_id
        );
        if (existingRecord?.result) {
          const { customer_signature, officer_signature } =
            existingRecord.result;

          if (customer_signature) setCustomerSignature(customer_signature);
          if (officer_signature) setOfficerSignature(officer_signature);

          console.log("Mapped signatures from IndexedDB:", {
            customer_signature,
            officer_signature,
          });
        }
      } catch (error) {
        console.warn("No existing signature record found.");
      }
    };

    fetchSignatures();
  }, []);

  const openSignaturePad = (signer) => {
    if (
      (signer === "customer" && customerSignature) ||
      (signer === "officer" && officerSignature)
    ) {
      setModalMessage(
        `${
          signer === "customer" ? "Customer" : "Sales Officer"
        } signature already captured. Cannot modify.`
      );
      setModalAction("signatureExists");
      setShowUnifiedModal(true);
      return;
    }
    setActiveSigner(signer);
    setShowPad(true);
  };

  const clearSignature = () => sigCanva.current.clear();

  const saveSignature = () => {
    if (sigCanva.current.isEmpty()) {
      setModalMessage("Please sign before saving.");
      setModalAction("emptySignature");
      setShowUnifiedModal(true);
      return;
    }

    setModalMessage(
      "Once you save the signature, it cannot be modified. Do you want to continue?"
    );
    setModalAction("confirmSave");
    setShowUnifiedModal(true);
  };

  const confirmSaveSignature = () => {
    const dataURL = sigCanva.current.getTrimmedCanvas().toDataURL("image/png");

    if (activeSigner === "customer") {
      setCustomerSignature(dataURL);
    } else if (activeSigner === "officer") {
      setOfficerSignature(dataURL);
    }

    setShowPad(false);
    setShowUnifiedModal(false);
  };

  const cancelSignature = () => {
    setShowPad(false);
  };

  const handleSubmit = async () => {
    if (!customerSignature || !officerSignature) {
      setModalMessage("Please capture both signatures before submitting.");
      setShowUnifiedModal(true);
      return;
    }

    const fna_id = sessionStorage.getItem("fnaId");
    if (!fna_id) {
      setModalMessage("FNA ID not found in session.");
      setShowUnifiedModal(true);
      return;
    }

    const dataToSave = {
      fna_id: fna_id,
      customer_signature: customerSignature,
      officer_signature: officerSignature,
    };

    console.log("Saving signature:", dataToSave);

    try {
      let existingRecord = null;
      try {
        existingRecord = await findRecordById("al_fna_signatures", fna_id);
      } catch {}

      if (existingRecord?.result) {
        await updateDetailById("al_fna_signatures", fna_id, dataToSave);
        console.log("Signature updated in IndexedDB", dataToSave);
      } else {
        await saveDetail("al_fna_signatures", dataToSave);
        console.log("Signature saved in IndexedDB", dataToSave);
      }

      navigate("/fnaproducrrecomnedations");
    } catch (error) {
      console.error("Error saving signature:", error);
    }
  };

  const handleFinalSubmitToAPI = async () => {
    const fna_id = sessionStorage.getItem("fnaId");
    const agentId = sessionStorage.getItem("agentId");
    const clientId = sessionStorage.getItem("clientId");
    const personId = sessionStorage.getItem("personId");


    try {
      const mainRecord = await findRecordById("al_fna_main", fna_id);

      if (!mainRecord?.result) {
        setModalMessage("FNA Main record not found.");
        setShowUnifiedModal(true);
        return;
      }

      const payload = {
        fnaMainId: fna_id,
        agentId,
        clientId,
        personId,
        ...mainRecord.result,
      };

      console.log("Final FNA payload:", payload);

      // Make API call here
      const response = await fetch(
        "http://192.168.2.7:4001/fnaService/saveFNAData",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("FNA submitted successfully:", data);
        setModalMessage("FNA submitted successfully!");
      } else {
        const errorData = await response.json();

        if (errorData?.errorCode === "FNAIdExists") {
          console.error("Duplicate FNA ID:", errorData.message);
          setModalMessage(`${errorData.message}`);
        } else {
          console.error("API Error:", response.status, errorData);
          setModalMessage("Failed to submit FNA. Please try again.");
        }
      }

      setShowUnifiedModal(true);
    } catch (error) {
      console.error("Error submitting FNA:", error);
      setModalMessage("Unexpected error occurred.");
      setShowUnifiedModal(true);
    }
  };

  return (
    <SidebarLayout>
      <div className="customer-container p-4">
        <Row className="justify-content-center mb-5">
          <Col md={5}>
            <Card className="p-3 shadow-sm">
              <SignatureBlock
                title="Customer"
                signatureData={customerSignature}
                onClick={() => openSignaturePad("customer")}
              />
            </Card>
          </Col>
          <Col md={5} className="mt-4 mt-sm-0">
            <Card className="p-3 shadow-sm">
              <SignatureBlock
                title="Sales Officer"
                signatureData={officerSignature}
                onClick={() => openSignaturePad("officer")}
              />
            </Card>
          </Col>
        </Row>

        {/* Signature Pad Modal */}
        {showPad && (
          <>
            {/* Overlay */}
            <div
              className="overlay-backdrop"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 1040,
              }}
            />

            <div
              className="canvas-container"
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 1050,
                width: "90%",
                maxWidth: "500px",
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 0 20px rgba(0, 0, 0, 0.2)",
              }}
            >
              <SignatureCanvas
                penColor="black"
                canvasProps={{
                  className: "sigCanva border rounded shadow-sm",
                  style: { width: "100%", height: 300 },
                }}
                ref={sigCanva}
              />

              <div className="d-flex justify-content-between mt-3">
                <button
                  type="button"
                  className="btn red-outline "
                  onClick={clearSignature}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="btn red-outline "
                  onClick={cancelSignature}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-calculate"
                  onClick={saveSignature}
                >
                  Save
                </button>
              </div>
            </div>
          </>
        )}

        {/* Prev / Next Buttons */}
        {!isKeyboardVisible && (
          <div className="iosfixednextprevbutton">
            <div className="fixednextprevbutton d-flex justify-content-between mt-4">
              <Button
                type="button"
                className="btn btnprev"
                onClick={() => navigate("/fnariskprofiledetails")}
              >
                Prev
              </Button>

              <Button
                type="button"
                className="btn btnprev"
                onClick={() => navigate("/fnareport")}
              >
                FNA Report
              </Button>

          
              <Button
                type="submit"
                className="btn btnprev"
                onClick={handleSubmit}
                disabled={!customerSignature || !officerSignature}
              >
                Recommendation
              </Button>
            </div>
          </div>
        )}

        <Modal
          show={showUnifiedModal}
          onHide={() => setShowUnifiedModal(false)}
          backdrop="static"
          keyboard={false}
          className="success-modal"
          centered
        >
          <Modal.Body className="text-center p-3">
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              size="3x"
              style={{ color: "#7a0014" }}
            />
            <h5 className="my-3" style={{ color: "#800000" }}>
              {modalMessage}
            </h5>
            {/* <Button
              style={{ backgroundColor: "#800000" }}
              onClick={() => {
                confirmSaveSignature();
              }}
            >
              OK
            </Button> */}
            <Button
              style={{ backgroundColor: "#800000" }}
              onClick={() => {
                if (modalAction === "confirmSave") {
                  confirmSaveSignature();
                } else {
                  setShowUnifiedModal(false);
                }
              }}
            >
              OK
            </Button>

            {modalAction === "confirmSave" && (
              <Button
                style={{ backgroundColor: "#800000" }}
                onClick={() => {
                  setShowUnifiedModal(false);
                  setShowPad(true);
                }}
                className="ms-2"
              >
                Cancel
              </Button>
            )}
          </Modal.Body>
        </Modal>
      </div>
    </SidebarLayout>
  );
};

export default FNA_Signature;
