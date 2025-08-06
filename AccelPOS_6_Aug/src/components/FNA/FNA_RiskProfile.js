import React, { useState, useEffect } from "react";
import SidebarLayout from "../Dashboard/Template";
import "./FNA.css";
import { useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import {
  findRecordById,
  saveDetail,
  updateDetailById,
} from "../../db/indexedDB";

const riskQuestions = [
  {
    id: 1,
    question: "Which of the following describes your current stage of life?",
    options: [
      { answer: "Single with few financial burdens", score: 3 },
      { answer: "A couple without children", score: 4 },
      {
        answer:
          "Young family with a home, You have mortgage and child care costs",
        score: 5,
      },
      { answer: "You are thinking about child's higher education", score: 6 },
      { answer: "Preparing for Retirement, You own your own home", score: 6 },
      {
        answer:
          "Retired, You rely on your investments and savings for daily expenses",
        score: 4,
      },
    ],
  },
  {
    id: 2,
    question: "How familiar are you with investment matters?",
    options: [
      {
        answer: "Not Familiar, I do not understand anything about investments",
        score: 2,
      },
      { answer: "Somewhat familiar, I am aware of investments", score: 4 },
      {
        answer:
          "Fairly familiar, I do understand the factors involved in investments",
        score: 5,
      },
      {
        answer: "Very familiar, I do research and invest in stocks at times",
        score: 7,
      },
    ],
  },
  {
    id: 3,
    question: "If your investment fell by 5% over a short period, would you:",
    options: [
      { answer: "Sell all of the remaining investment", score: 2 },
      { answer: "Sell only a portion of the remaining investment", score: 3 },
      { answer: "Hold your investment and sell nothing", score: 6 },
      {
        answer:
          "Invest more funds, You can tolerate short-term losses in return for future growth",
        score: 8,
      },
    ],
  },
  {
    id: 4,
    question:
      "How long prior to realization would you invest, so as to access the desired amount?",
    options: [
      { answer: "Less than 3 years", score: 2 },
      { answer: "Within 3-5 years", score: 4 },
      { answer: "Within 6-10 years", score: 6 },
      { answer: "More than 10 years", score: 8 },
    ],
  },
];

const getRiskProfile = (score) => {
  if (score <= 18)
    return {
      type: "Conservative",
      description:
        "You are a conservative investor who does not wish to take any risks.",
    };
  if (score <= 35)
    return {
      type: "Moderate",
      description: "You are a moderate investor who wishes to take some risk.",
    };
  if (score <= 55)
    return {
      type: "Aggressive",
      description:
        "You are a balanced investor with some understanding of investments.",
    };
  return {
    type: "Very Aggressive",
    description: "You are an aggressive investor who wishes to take risk.",
  };
};

const FNA_RiskProfile = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [riskType, setRiskType] = useState("");
  const [riskDesc, setRiskDesc] = useState("");
  const [hasGeneratedProfile, setHasGeneratedProfile] = useState(false);
  const [showUnifiedModal, setShowUnifiedModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const fnaId = sessionStorage.getItem("fnaId");

  useEffect(() => {
    const fetchData = async () => {
      const fnaId = sessionStorage.getItem("fnaId");
      if (!fnaId) return;

      try {
        const data = await findRecordById("al_fna_risk_profile", fnaId);
        if (data?.result) {
          const { final_score, risk_type, risk_description } = data.result;

          // Optional: If you had saved question answers earlier
          const savedAnswers = data.result.answers || {};

          setFinalScore(final_score);
          setRiskType(risk_type);
          setRiskDesc(risk_description);
          setHasGeneratedProfile(true);
          setAnswers(savedAnswers); // Uncomment if answers were saved
        }
      } catch (error) {
        console.error("Error fetching FNA risk profile from IndexedDB:", error);
      }
    };

    fetchData();
  }, []);

  const handleSelect = (questionId, optionIndex) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleGenerateRiskProfile = async () => {
    const riskProfileSchema = riskQuestions.map((question) => {
      const selectedIdx = answers[question.id];
      let ansKey = "";

      switch (question.id) {
        case 1:
          ansKey = [
            "singleWithfinancialBurdens",
            "coupleWithoutchildren",
            "youngFamilywithHome",
            "childHighereducation",
            "prepareForretirement",
            "retired",
          ][selectedIdx];
          break;
        case 2:
          ansKey = [
            "notFamiliar",
            "someFamiliar",
            "fairlyFamiliar",
            "veryFamiliar",
          ][selectedIdx];
          break;
        case 3:
          ansKey = ["sellAll", "sellPortion", "sellNothing", "investMore"][
            selectedIdx
          ];
          break;
        case 4:
          ansKey = [
            "lessThan3years",
            "within3-5years",
            "within6-10years",
            "morethan10years",
          ][selectedIdx];
          break;
        default:
          break;
      }

      const questionKey =
        question.id === 1
          ? "currentStageofLife"
          : question.id === 2
          ? "familiarWithinvestments"
          : question.id === 3
          ? "investmentfellby5%"
          : "investFordesiredReturns";

      return { id: questionKey, ans: ansKey };
    });

    try {
      const response = await fetch(
        "http://192.168.2.7:4001/fnaService/riskProfile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fnaId, // ✅ Top-level key
            riskProfileSchema, // ✅ Array of question-answer mappings
          }),
        }
      );

      if (!response.ok) throw new Error("API response not OK");

      const result = await response.json();
      const { calculatedResponse } = result;

      if (calculatedResponse) {
        setFinalScore(calculatedResponse.RiskScore || 0);
        setRiskType(calculatedResponse.status || "Unknown");
        setRiskDesc(calculatedResponse.description || "No description");
        setModalType("result");
        setShowUnifiedModal(true);
        setShowResult(true);
        setHasGeneratedProfile(true);
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (error) {
      console.error("Error generating risk profile via API:", error);
    }
  };

  const handleSubmit = async () => {
    if (!hasGeneratedProfile) {
      setModalType("alert");
      setShowUnifiedModal(true);
      return;
    }

    const fna_id = sessionStorage.getItem("fnaId");
    const agentId = sessionStorage.getItem("agentId");
    const clientId = sessionStorage.getItem("clientId");
    const personId = sessionStorage.getItem("person_id");
    if (!fna_id) {
      console.error("fna_id not found in session.");
      return;
    }

    const riskQestData = riskQuestions.map((question) => {
      const selectedIdx = answers[question.id];
      let ansKey = "";

      switch (question.id) {
        case 1:
          ansKey = [
            "singleWithfinancialBurdens",
            "coupleWithoutchildren",
            "youngFamilywithHome",
            "childHighereducation",
            "prepareForretirement",
            "retired",
          ][selectedIdx];
          break;
        case 2:
          ansKey = [
            "notFamiliar",
            "someFamiliar",
            "fairlyFamiliar",
            "veryFamiliar",
          ][selectedIdx];
          break;
        case 3:
          ansKey = ["sellAll", "sellPortion", "sellNothing", "investMore"][
            selectedIdx
          ];
          break;
        case 4:
          ansKey = [
            "lessThan3years",
            "within3-5years",
            "within6-10years",
            "morethan10years",
          ][selectedIdx];
          break;
        default:
          break;
      }

      const questionKey =
        question.id === 1
          ? "currentStageofLife"
          : question.id === 2
          ? "familiarWithinvestments"
          : question.id === 3
          ? "investmentfellby5%"
          : "investFordesiredReturns";

      return { id: questionKey, ans: ansKey };
    });

    const fnaRiskProfilePayload = {
      riskQestData,
      riskProfileResponse: {
        riskScore: finalScore,
        riskDescriptor: riskDesc,
      },
    };

    const dataToSave = {
      fna_id,
      answers,
      final_score: finalScore,
      risk_type: riskType,
      risk_description: riskDesc,
    };

    const mainRiskProfileToSave = {
      fnaRiskProfile: fnaRiskProfilePayload,
    };

    try {
      // 1. Save or update in al_fna_risk_profile
      let existingFnaRecord = null;
      try {
        existingFnaRecord = await findRecordById("al_fna_risk_profile", fna_id);
      } catch (innerError) {
        console.warn(
          "No existing FNA goal record found. A new one will be saved."
        );
      }

      if (existingFnaRecord?.result) {
        await updateDetailById("al_fna_risk_profile", fna_id, dataToSave);
      } else {
        await saveDetail("al_fna_risk_profile", dataToSave);
      }

      // 2. Save or update in al_fna_main
      const existingMain = await findRecordById("al_fna_main", fna_id).catch(
        () => null
      );
      const updatedMain = {
        fna_id,
        ...mainRiskProfileToSave,
      };

      if (existingMain?.result) {
        await updateDetailById("al_fna_main", fna_id, {
          ...existingMain.result,
          ...mainRiskProfileToSave,
        });
      } else {
        await saveDetail("al_fna_main", updatedMain);
      }

      console.log(
        "Risk profile saved to both al_fna_risk_profile and al_fna_main"
      );

      try {
        const response = await fetch(
          "http://192.168.2.7:4001/fnaService/saveFNAData",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fnaMainId: fna_id,
              agentId,
              clientId,
              personId,
              fnaRiskProfile: mainRiskProfileToSave.fnaRiskProfile,
            }),
          }
        );

        if (!response.ok)
          throw new Error("Failed to save FNA data to backend.");

        const result = await response.json();
        console.log("Combined FNA data saved to API:", result);
      } catch (error) {
        console.error("API call failed:", error);
      }
      navigate("/fnaneeds");
    } catch (error) {
      console.error("Error saving FNA data:", error);
    }
  };

  return (
    <SidebarLayout>
      <div className="customer-container d-flex flex-column">
        <div className="customer-form flex-grow-1">
          {riskQuestions.map((q) => (
            <div key={q.id} className="mb-4 p-3 shadow-sm bg-light">
              <div className="d-flex align-items-start mb-2">
                <div className="me-2 fw-bold">{q.id}.</div>
                <div className="fw-bold">{q.question}</div>
              </div>

              <div className="row">
                {q.options.map((opt, idx) => (
                  <div className="col-md-6" key={idx}>
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`question-${q.id}`}
                        id={`q${q.id}-opt${idx}`}
                        checked={answers[q.id] === idx}
                        onChange={() => handleSelect(q.id, idx)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`q${q.id}-opt${idx}`}
                      >
                        {opt.answer}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {!isKeyboardVisible && (
            <div className="iosfixednextprevbutton">
              <div className="fixednextprevbutton d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btnprev"
                  onClick={() =>
                    navigate("/fnacalculatorsdetails", {
                      state: { fromRisk: "risk" },
                    })
                  }
                >
                  Prev
                </button>

                <button
                  className="btn btn-danger"
                  onClick={handleGenerateRiskProfile}
                  disabled={riskQuestions.some(
                    (q) => typeof answers[q.id] !== "number"
                  )}
                >
                  Generate Risk Profile
                </button>

                <button
                  type="submit"
                  className="btn btnnext"
                  onClick={handleSubmit}
                  disabled={
                    riskQuestions.some(
                      (q) => typeof answers[q.id] !== "number"
                    ) || !hasGeneratedProfile
                  }
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Result Modal */}
        <Modal
          show={showUnifiedModal}
          onHide={() => setShowUnifiedModal(false)}
          backdrop="static"
          keyboard={false}
          className="success-modal"
          centered
        >
          {/* Close icon */}
          <div className="modal-close-btn">
            {/* <FaTimes onClick={() => setShowUnifiedModal(false)} /> */}
          </div>

          <Modal.Body className="text-center p-2">
            {/* Risk Profile Result */}
            {modalType === "result" ? (
              <>
                <h5 className="my-3" style={{ color: "#800000" }}>
                  My Risk Profile Status
                </h5>

                <div className="border p-4 rounded bg-light">
                  <div className="d-flex justify-content-between mb-3 flex-wrap">
                    <div className="mb-2">
                      <strong>Risk Score:</strong> {finalScore}
                    </div>
                    <div className="mb-2">
                      <strong>Risk Type:</strong> {riskType}
                    </div>
                  </div>

                  <hr />
                  <div className="row">
                    <div className="col-5 fw-bold">Description:</div>
                    <div className="col-7 text-muted">{riskDesc}</div>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <Button
                    style={{
                      backgroundColor: "#800000",
                      borderColor: "#800000",
                    }}
                    onClick={() => setShowUnifiedModal(false)}
                  >
                    OK
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Alert Modal */}
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  size="3x"
                  style={{ color: "#7a0014" }}
                />
                <p className="mt-2">
                  Please generate the <strong>Risk Profile</strong> before
                  continuing.
                </p>

                <Button
                  style={{ backgroundColor: "#800000" }}
                  onClick={() => setShowUnifiedModal(false)}
                >
                  OK
                </Button>
              </>
            )}
          </Modal.Body>
        </Modal>
      </div>
    </SidebarLayout>
  );
};

export default FNA_RiskProfile;
