import React, { useState, useRef, useEffect } from "react";
import "./Submission.css";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SignatureCanvas from "react-signature-canvas";
import { faPenNib, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import {
  findRecordById,
  saveDetail,
  updateDetailById,
} from "../../../db/indexedDB";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../../Dashboard/Template";
import ValidationErrorModal from "../ValidationErrorModal";

const Submisson = () => {
  const [showPad, setShowPad] = useState(false);
  const [signature, setSignature] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [signaturedone, setsignaturedone] = useState(true);
  const [preview, previewdone] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [docpreviewed, setdocpreviewed] = useState(false);
  // const [acrid , setacrid] = useState()

  const sigCanvasPad = useRef({});
  let erefid = sessionStorage.getItem("erefid");
  const navigate = useNavigate();

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const acr_id = sessionStorage.getItem("acr_id");

  useEffect(() => {
    const storedSignatureDone =
      sessionStorage.getItem("signaturedone") === "true";
    const storedSignature = sessionStorage.getItem("signature");

    setsignaturedone(storedSignatureDone);
    setSignature(storedSignature);

    // If signature is done, disable the checkbox
    if (storedSignatureDone) {
      formik.setFieldValue("decl_checkbox", true);
    } else {
      // If no signature is done, keep the checkbox enabled and unticked
      formik.setFieldValue("decl_checkbox", false);
    }
  }, []);

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
    const fetchData = async () => {
      const previewflagdata = await findRecordById(
        "al_application_main",
        erefid
      );
      console.log("Preview Flag ::::", previewflagdata);

      if (previewflagdata.result.previewsubmission) {
        setdocpreviewed(true);
        //previewdone(true)
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchacrdetails = async () => {
      //setacrid(acr_id)
      console.log("Acrid:::", acr_id);
      if (acr_id) {
        const signaturedataonbackswipe = await findRecordById(
          "al_acr_details",
          acr_id
        );
        console.log("ACR data on backswipe::::", signaturedataonbackswipe);

        if (signaturedataonbackswipe) {
          console.log("Got data");
          const result = signaturedataonbackswipe.result.data;
          formik.setFieldValue("SOName", result.SOName || "");
          formik.setFieldValue("SOCode", result.SoCode || "");
          formik.setFieldValue("CompanyCode", result.CompanyCode || "");
          formik.setFieldValue(
            "Proposer_MainProposer",
            result.Proposer_MainProposer || ""
          );
          formik.setFieldValue("tothevalueofrs", result.TothevalueofRs || "");
          formik.setFieldValue("bearingno", result.BearingNo || "");
          formik.setFieldValue("CodeNo", result.CodeNo || "");
          formik.setFieldValue("SubmissionDate", result.Date || "");
          formik.setFieldValue("decl_checkbox", result.Declaration);

          // Set the signature value
          setSignature(result.Signature || "");
        }
      } else {
        console.log("ACR Id not found::::");
      }
    };

    fetchacrdetails();
  }, [acr_id]);

  const clearSignature = () => {
    sigCanvasPad.current.clear();
  };

  const proposalsubmithandler = async () => {
    //alert("Proposal Submitted Successfully")

    if (isSubmitted) {
      alert("This proposal has already been submitted.");
      return;
    }
    const erefid = sessionStorage.getItem("erefid");

    const data = await findRecordById("al_application_main", erefid);
    console.log("Data in submission screen::::", data);

    const proposalStatus = data.result.proposalStatus;
    console.log("proposalStatus", proposalStatus);

    const sqs_id = sessionStorage.getItem("sqsID");

    const sqsdata = await findRecordById("al_sqs_details", sqs_id);

    const caseID = sessionStorage.getItem("CaseId");

    console.log("SQS data on submission::::", sqsdata);
    const payment = sqsdata.result.payment;
    console.log("Payment::::", payment);

    data.result["payment"] = {
      paymentFrequency: payment.paymentFrequency,
      paymentMode: "AutoDebit", //need to change as It is undefined in db,
      paymentTerm: 10, //Need to change as there is no value in db
    };

    console.log("Final API data ::::: ", JSON.stringify(data.result));

    try {
      //Prod
      // const apicall = await fetch('http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com/proposal-management-service/submitData/' + { caseID }, {

      //Dev
      const apicall = await fetch(
        "http://192.168.2.7:4008/proposalManagementService/submitData/" +
          { caseID },
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data.result),
        }
      );
      const result = await apicall.json();
      console.log("API Response:", result);
    } catch (e) {
      console.log("Error while calling API:::", e);
    }

    setIsModalVisible(true);
    setModalMessage(
      "Congratulations!!! , Your Proposal has been Submitted Successfully"
    );
    sessionStorage.setItem("caseSubmitted", "true");
    console.log("caseSubmitted", "true");
    // let updatedata = {
    //     "proposalStatus": "Submitted"
    // }
    data.result.product.policyDetails.proposalStatus = "Submitted";

    await updateDetailById("al_application_main", erefid, data.result);
    console.log("Data updated successfully", data.result);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setIsSubmitted(true);
    // navigate('/proposal-summary');
  };

  const saveSignature = () => {
    if (!sigCanvasPad.current || !sigCanvasPad.current.isEmpty()) {
      const dataUrl = sigCanvasPad.current
        .getTrimmedCanvas()
        .toDataURL("image/png");
      setSignature(dataUrl); // Save the signature as a data URL
      setShowPad(false);
      setsignaturedone(true);
      sessionStorage.setItem("signature", dataUrl);
      sessionStorage.setItem("signaturedone", "true");

      formik.setFieldValue("decl_checkbox", true);
      sessionStorage.setItem("decl_checkbox", "true");
    } else {
      setModalMessage("Signature is required , Please sign before saving");
      setIsModalVisible(true);
    }
  };

  const validationSchema = Yup.object({
    SOName: Yup.string().required("SO Name is required"),
    SOCode: Yup.string().required("SO Code is required"),
    CompanyCode: Yup.string().required("Company Code is required"),
    ProposerMainProposer: Yup.string().required(
      "Proposer/Main Proposer is required"
    ),
    tothevalueofrs: Yup.string().required("This field is required"),
    bearingno: Yup.string().required("This field is required"),
    CodeNo: Yup.string().required("Code No is required"),
    SubmissionDate: Yup.string().required("Date is required"),
    decl_checkbox: Yup.boolean()
      .oneOf([true], "You must agree before signing")
      .required("You must agree before signing"),
  });

  const handlePreviewDocs = () => {
    console.log("Inside Preview Docs");
    setdocpreviewed(true);
    let updated_data = {
      previewsubmission: true,
    };

    let updateddata = updateDetailById(
      "al_application_main",
      erefid,
      updated_data
    );
    console.log("Data updated successfully", updateddata);

    let acrdata = {
      data: {
        SOName: formik.values.SOName,
        SoCode: formik.values.SOCode,
        CompanyCode: formik.values.CompanyCode,
        Proposer_MainProposer: formik.values.Proposer_MainProposer,
        TothevalueofRs: formik.values.tothevalueofrs,
        BearingNo: formik.values.bearingno,
        CodeNo: formik.values.CodeNo,
        Date: formik.values.SubmissionDate,
        Signature: signature,
        Declaration: formik.values.decl_checkbox,
      },
      acr_id: acr_id,
    };
    console.log("ACR Data ", JSON.stringify(acrdata));
    let saveData = saveDetail("al_acr_details", acrdata);
    console.log("Data saved successfully", saveData);
    navigate("/submissonpreview");
  };

  const formik = useFormik({
    initialValues: {
      SOName: "",
      SOCode: "",
      CompanyCode: "",
      Proposer_MainProposer: "",
      decl_checkbox: false,
      tothevalueofrs: "",
      bearingno: "",
      CodeNo: "",
      SubmissionDate: "",
    },

    validationSchema: validationSchema,
    onSubmit: async (values) => {
      console.log("Form data", values);
      console.log("Formik errors::::", formik.errors);
    },
  });

  const handleBack = () => {
    navigate("/documentcapture");
  };

  useEffect(() => {
    let overlay = document.getElementById("overlay");

    if (showPad) {
      document.body.style.overflow = "hidden";

      // Create overlay if it doesn't exist
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "overlay";
        document.body.appendChild(overlay);

        // Add click event to close the sidebar
        overlay.addEventListener("click", () => setShowPad(false));
      }

      overlay.classList.add("active-overlay");
    } else {
      document.body.style.overflow = "auto";
      if (overlay) {
        overlay.classList.remove("active-overlay");
        overlay.removeEventListener("click", () => setShowPad(false));
        document.body.removeChild(overlay);
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "auto";
      if (overlay) {
        overlay.removeEventListener("click", () => setShowPad(false));
        document.body.removeChild(overlay);
      }
    };
  }, [showPad]);

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
    document.body.classList.add("ios-safearea");
  } else {
    document.body.classList.remove("ios-safearea");
  }

  return (
    <SidebarLayout>
      <div className="salesofficers-container">
        <div className="salesofficersForm">
          <form
            onSubmit={formik.handleSubmit}
            className={`${showPad ? "open" : "closed"}`}
          >
            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label htmlFor="SOName">SO Name</label>
                <input
                  type="text"
                  id="SOName"
                  name="SOName"
                  className="form-control"
                  value={formik.values.SOName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.SOName && formik.errors.SOName ? (
                  <div className="text-danger">{formik.errors.SOName}</div>
                ) : null}
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="SOCode">So Code</label>
                <input
                  type="text"
                  id="SoCode"
                  name="SOCode"
                  className="form-control"
                  value={formik.values.SOCode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.SOCode && formik.errors.SOCode ? (
                  <div className="text-danger">{formik.errors.SOCode}</div>
                ) : null}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label htmlFor="CompanyCode">Company Code</label>
                <input
                  type="text"
                  id="CompanyCode"
                  name="CompanyCode"
                  className="form-control"
                  value={formik.values.CompanyCode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.CompanyCode && formik.errors.CompanyCode ? (
                  <div className="text-danger">{formik.errors.CompanyCode}</div>
                ) : null}
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="ProposerMainProposer">
                  Proposer/Main Proposer
                </label>
                <input
                  type="text"
                  id="ProposerMainProposer"
                  name="Proposer_MainProposer"
                  className="form-control"
                  value={formik.values.Proposer_MainProposer}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.Proposer_MainProposer &&
                formik.errors.Proposer_MainProposer ? (
                  <div className="text-danger">
                    {formik.errors.Proposer_MainProposer}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-12 mb-3">
                <label
                  className="d-flex align-items-start"
                  htmlFor="decl_checkbox"
                >
                  <input
                    type="checkbox"
                    id="decl_checkbox"
                    name="decl_checkbox"
                    className="me-2 mt-1"
                    checked={formik.values.decl_checkbox}
                    onChange={(e) => {
                      formik.handleChange(e);
                      localStorage.setItem("decl_checkbox", e.target.checked);
                    }}
                    onBlur={formik.handleBlur}
                    disabled={signaturedone}
                  />
                  <span className="ml-2">
                    I hereby confirm that the foregoing answers are based on the
                    information received by me in the course of my
                    investigation, and I certify them to be correct. I also
                    confirm that I have explained clearly, correctly, and
                    honestly the questions in the proposal form and the
                    benefits, policy conditions, privileges, and exclusions.
                  </span>
                </label>
                {formik.touched.decl_checkbox &&
                  formik.errors.decl_checkbox && (
                    <div className="text-danger">
                      {formik.errors.decl_checkbox}
                    </div>
                  )}
              </div>
            </div>

            <div className="row align-items-center p-4 mb-3 justify-content-center">
              {/* Signature Section */}
              <div
                className="col-md-4 col-12 d-flex flex-column justify-content-between align-items-center mb-3 mb-md-0 signaturepad"
                style={{
                  height: "220px",
                  overflow: "hidden",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                }}
              >
                <div
                  className="text-center d-flex justify-content-center align-items-center"
                  style={{ height: "100%", width: "100%" }}
                >
                  {signature ? (
                    <img
                      src={signature}
                      alt="Signature"
                      style={{
                        display: "block",
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                        padding: "5px",
                      }}
                    />
                  ) : (
                    <FontAwesomeIcon
                      size="2x"
                      icon={faPenNib}
                      onClick={() => {
                        if (formik.values.decl_checkbox) {
                          setShowPad(true);
                        }
                      }}
                      style={{
                        cursor: formik.values.decl_checkbox
                          ? "pointer"
                          : "not-allowed",
                        color: formik.values.decl_checkbox ? "black" : "gray",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label htmlFor="tothevalueofrs"> To the value of Rs </label>
                <input
                  type="text"
                  name="tothevalueofrs"
                  id="tothevalueofrs"
                  className="form-control"
                  value={formik.values.tothevalueofrs}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.tothevalueofrs &&
                formik.errors.tothevalueofrs ? (
                  <div className="text-danger">
                    {formik.errors.tothevalueofrs}
                  </div>
                ) : null}
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="bearingNo"> Bearing No </label>
                <input
                  type="text"
                  name="bearingno"
                  id="bearingno"
                  className="form-control"
                  value={formik.values.bearingno}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.bearingno && formik.errors.bearingno ? (
                  <div className="text-danger">{formik.errors.bearingno}</div>
                ) : null}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label htmlFor="CodeNo">Code No</label>
                <input
                  type="text"
                  name="CodeNo"
                  id="CodeNo"
                  className="form-control"
                  value={formik.values.CodeNo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.CodeNo && formik.errors.CodeNo ? (
                  <div className="text-danger">{formik.errors.CodeNo}</div>
                ) : null}
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="SubmissionDate">Date</label>
                <input
                  type="date"
                  id="SubmissionDate"
                  name="SubmissionDate"
                  className="form-control"
                  value={formik.values.SubmissionDate}
                  onChange={(e) => {
                    const selectedDate = e.target.value; // Get the selected date
                    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

                    // Check if the selected date is in the future
                    if (selectedDate > today) {
                      alert("Date cannot be in the future!");
                      return;
                    }
                    formik.setFieldValue("SubmissionDate", selectedDate);
                  }}
                  onBlur={formik.handleBlur}
                  max={new Date().toISOString().split("T")[0]} // Sets the maximum date to today's date
                />
                {formik.touched.SubmissionDate &&
                formik.errors.SubmissionDate ? (
                  <div className="text-danger">
                    {formik.errors.SubmissionDate}
                  </div>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handlePreviewDocs}
            >
              Preview Docs
            </button>
          </form>

          {showPad && (
            <div className="canvas_div ">
              <SignatureCanvas
                penColor="black"
                canvasProps={{
                  className: "sigCanvasPad border rounded shadow-sm",
                }}
                ref={sigCanvasPad}
              />
              <div className="d-flex justify-content-between mt-3">
                <input
                  type="button"
                  value="Clear"
                  onClick={clearSignature}
                  className="btn btn-danger"
                />
                <input
                  type="button"
                  value="Save"
                  onClick={saveSignature}
                  className="btn btn-danger"
                />
                <input
                  type="button"
                  value="Close"
                  onClick={() => setShowPad(false)}
                  className="btn btn-outline-danger"
                />
              </div>
            </div>
          )}
        </div>
        {!isKeyboardVisible && (
          <div className="iosfixednextprevbutton">
            <div className="fixednextprevbutton d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-secondary btnprev"
                onClick={handleBack}
              >
                {" "}
                Prev{" "}
              </button>
              <button
                onClick={proposalsubmithandler}
                className="btn btnnext"
                disabled={isSubmitted || !(signature && docpreviewed)}
              >
                {isSubmitted ? "Submitted" : "Submit"}
              </button>
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

export default Submisson;
