import React, { useEffect, useState, useCallback } from "react";
import SidebarLayout from "../Dashboard/Template";
import {
  saveDetail,
  findRecordById,
  updateDetailById,
} from "../../db/indexedDB";
import ChildrenEducationForm from "./ChildrenEducationForm";
import RetirementPlanningForm from "./RetirementPlanningForm";
import ProtectionPlanningForm from "./ProtectionPlanningForm";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

const FNA_Calculators = () => {
  const navigate = useNavigate();
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [results, setResults] = useState({});
  const [formData, setFormData] = useState({});
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
  const currentGoal = selectedGoals[currentGoalIndex];
  const [calculatedGoals, setCalculatedGoals] = useState({});
  const [showUnifiedModal, setShowUnifiedModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const location = useLocation();
  const fromCoverage = location.state?.fromCoverage || false;
  const fromRisk = location.state?.fromRisk || false;
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [maritalStatus, setMaritalStatus] = useState("");

  useEffect(() => {
    const fetchGoalsAndResults = async () => {
      const fnaId = sessionStorage.getItem("fnaId");
      const clientId = sessionStorage.getItem("clientId");
      if (!fnaId || !clientId) return;

      // Fetch selected goals
      const record = await findRecordById("al_fna_goals", fnaId);
      if (Array.isArray(record?.result?.fnaGoals)) {
        const selected = record.result.fnaGoals.map((goalObj) =>
          normalizeGoalName(goalObj.goalDescription)
        );
        setSelectedGoals(selected);
      }

      // Fetch marital status
      const personData = await findRecordById("al_fna_persons", fnaId);
      if (personData?.result.fnaPersons) {
        setMaritalStatus(personData.result.fnaPersons.maritalStatus || "");
      }

      // Re-fetch calculation results
      const calcData = await findRecordById("al_client_details", clientId);
      const storedCalcs = calcData?.result?.fnaCalculators || [];

      const newResults = {};
      const newFormData = {};
      const newCalculatedFlags = {};

      storedCalcs.forEach((item) => {
        const calcKey = reverseMapCalculatorType(item.calculatorType);
        if (calcKey) {
          newResults[calcKey] = item;
          newFormData[calcKey] = item; // Assuming result contains input too; adapt if needed
          newCalculatedFlags[calcKey] = true;
        }
      });

      setResults(newResults);
      setFormData(newFormData);
      setCalculatedGoals(newCalculatedFlags);
    };

    fetchGoalsAndResults();
  }, [location.state]); // Run again if returning from risk screen

  const reverseMapCalculatorType = (type) => {
    switch (type) {
      case "education_calc":
        return "childrenEducation";
      case "marriage_calc":
        return "marraige";
      case "health_calc":
        return "healthLifestyle";
      case "wealth_calc":
        return "wealthPlanning";
      case "retirement_calc":
        return "retirementPlanning";
      case "protection_calc":
        return "protection";
      default:
        return null;
    }
  };

  const normalizeGoalName = (goal) => {
    switch (goal.toLowerCase()) {
      case "children education":
        return "childrenEducation";
      case "marraige":
        return "marraige";
      case "health & life style":
        return "healthLifestyle";
      case "wealth planning":
        return "wealthPlanning";
      case "retirement planning":
        return "retirementPlanning";
      case "protection plan":
        return "protection";
      default:
        return goal.toLowerCase().replace(/\s+/g, "");
    }
  };

  const handleCalculate = async (goalKey, result, inputData) => {
    try {
      if (!result || !inputData) return;

      setResults((prev) => ({ ...prev, [goalKey]: result }));
      setFormData((prev) => ({ ...prev, [goalKey]: inputData }));
      setCalculatedGoals((prev) => ({ ...prev, [goalKey]: true }));

      await saveCalculatorResult(goalKey, inputData, result);
    } catch (err) {
      console.error("Failed to save calculation result:", err);
    }
  };

   

  // const saveCalculatorResult = useCallback(
  //   async (calcKey, form_data, results) => {
  //     const clientId = sessionStorage.getItem("clientId");
  //     const fnaId = sessionStorage.getItem("fnaId");
  //     if (!clientId || !fnaId) return;

  //     const calcMap = {
  //       childrenEducation: "education_calc",
  //       marraige: "marriage_calc",
  //       healthLifestyle: "health_calc",
  //       wealthPlanning: "wealth_calc",
  //       retirementPlanning: "retirement_calc",
  //       protection: "protection_calc",
  //     };

  //     const calculatorType = calcMap[calcKey] || calcKey;

  //     const enrichedResult = {
  //       calculatorType,
  //       module: "FNA",
  //       ...results,
  //     };

  //     try {
        
  //       const clientRecord = await findRecordById(
  //         "al_client_details",
  //         clientId
  //       );
  //       const existingArray = clientRecord.result?.fnaCalculators || [];

  //       const filtered = existingArray.filter(
  //         (item) => item.calculatorType !== calculatorType
  //       );
  //       const updatedCalculators = [...filtered, enrichedResult];

  //       await updateDetailById("al_client_details", clientId, {
  //         fnaCalculators: updatedCalculators,
  //       });


  //       const fnaMainRecord = await findRecordById("al_fna_main", fnaId).catch(
  //         () => null
  //       );

  //       const fnaMainUpdate = {
  //         fna_id: fnaId,
  //         fnaCalculators: updatedCalculators,
  //       };

  //       if (fnaMainRecord?.result) {
  //         await updateDetailById("al_fna_main", fnaId, fnaMainUpdate);
  //       } else {
  //         await saveDetail("al_fna_main", fnaMainUpdate);
  //       }

  //       console.log(
  //         "Saved calculator data to both al_client_details and al_fna_main"
  //       );
  //     } catch (e) {
  //       console.error("Failed to save calculator result", e);
  //     }
  //   },
  //   []
  // );

   const saveCalculatorResult = useCallback(
    async (calcKey, form_data, results) => {
    const fna_id = sessionStorage.getItem("fnaId");
      const agentId = sessionStorage.getItem("agentId");
      const clientId = sessionStorage.getItem("clientId");
      const personId = sessionStorage.getItem("person_id");
      if (!clientId || !fna_id) return;

      const calcMap = {
        childrenEducation: "education_calc",
        marraige: "marriage_calc",
        healthLifestyle: "health_calc",
        wealthPlanning: "wealth_calc",
        retirementPlanning: "retirement_calc",
        protection: "protection_calc",
      };

      const calculatorType = calcMap[calcKey] || calcKey;

      const enrichedResult = {
        calculatorType,
        module: "FNA",
        ...results,
      };

      try {

  
        const clientRecord = await findRecordById(
          "al_client_details",
          clientId
        );
        const existingArray = clientRecord.result?.fnaCalculators || [];

        const filtered = existingArray.filter(
          (item) => item.calculatorType !== calculatorType
        );
        const updatedCalculators = [...filtered, enrichedResult];

        await updateDetailById("al_client_details", clientId, {
          fnaCalculators: updatedCalculators,
        });


        const fnaMainRecord = await findRecordById("al_fna_main", fna_id).catch(
          () => null
        );

        const fnaMainUpdate = {
          fna_id: fna_id,
          fnaCalculators: updatedCalculators,
        };

        if (fnaMainRecord?.result) {
          await updateDetailById("al_fna_main", fna_id, fnaMainUpdate);
        } else {
          await saveDetail("al_fna_main", fnaMainUpdate);
        }

        console.log(
          "Saved calculator data to both al_client_details and al_fna_main"
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
                fnaCalculators: fnaMainUpdate.fnaCalculators,
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
      } catch (e) {
        console.error("Failed to save calculator result", e);
      }
    },
    []
  );

  const renderCalculator = () => {
    switch (currentGoal) {
      case "childrenEducation":
        return (
          <ChildrenEducationForm
            defaultValues={formData.childrenEducation || {}}
            goalKey="childrenEducation"
            heading="Children's Higher Education Calculator"
            result={results.childrenEducation || null}
            onCalculate={(goalKey, result, inputs) =>
              handleCalculate(goalKey, result, inputs)
            }
          />
        );
      case "marraige":
        return (
          <ChildrenEducationForm
            defaultValues={formData.marraige || {}}
            goalKey="marraige"
            heading="Marriage Calculator"
            result={results.marraige || null}
            onCalculate={(goalKey, result, inputs) =>
              handleCalculate(goalKey, result, inputs)
            }
          />
        );
      case "healthLifestyle":
        return (
          <ChildrenEducationForm
            defaultValues={formData.healthLifestyle || {}}
            goalKey="healthLifestyle"
            heading="Health & Lifestyle Calculator"
            result={results.healthLifestyle || null}
            onCalculate={(goalKey, result, inputs) =>
              handleCalculate(goalKey, result, inputs)
            }
          />
        );
      case "wealthPlanning":
        return (
          <ChildrenEducationForm
            defaultValues={formData.wealthPlanning || {}}
            goalKey="wealthPlanning"
            heading="Wealth Planning Calculator"
            result={results.wealthPlanning || null}
            onCalculate={(goalKey, result, inputs) =>
              handleCalculate(goalKey, result, inputs)
            }
          />
        );
      case "retirementPlanning":
        return (
          <RetirementPlanningForm
            defaultValues={formData.retirementPlanning || {}}
            goalKey="retirementPlanning"
            heading="Retirement Planning Calculator"
            maritalStatus={maritalStatus}
            result={results.retirementPlanning || null}
            onCalculate={(goalKey, result, inputs) =>
              handleCalculate(goalKey, result, inputs)
            }
          />
        );
      case "protection":
        return (
          <ProtectionPlanningForm
            formData={formData.protection || {}}
            goalKey="protection"
            heading="Protection Planning Calculator"
            setFormData={(data) =>
              setFormData((prev) => ({ ...prev, protection: data }))
            }
            onCalculate={(goalKey, result, inputs) =>
              handleCalculate(
                goalKey,
                result,
                inputs,
                formData.protection || {}
              )
            }
            result={results.protection || null}
            onReset={() => handleReset("protection")}
          />
        );
      default:
        return <p>No valid goal selected</p>;
    }
  };

  const handleReset = (goalKey) => {
    setResults((prev) => ({ ...prev, [goalKey]: null }));
    setFormData((prev) => ({ ...prev, [goalKey]: {} }));
  };

  return (
    <SidebarLayout>
      <div className="customer-container d-flex flex-column p-5">
        {renderCalculator()}

        {!isKeyboardVisible && (
          <div className="iosfixednextprevbutton">
            <div className="fixednextprevbutton d-flex justify-content-between">
              {currentGoalIndex > 0 || fromCoverage || fromRisk ? (
                <button
                  type="button"
                  className="btn btnprev"
                  onClick={() => {
                    if (currentGoalIndex === 0 && (fromCoverage || fromRisk)) {
                      navigate("/fnacoveragedetails");
                    } else {
                      setCurrentGoalIndex((prev) => prev - 1);
                    }
                  }}
                >
                  Prev
                </button>
              ) : (
                <div />
              )}

              {currentGoalIndex < selectedGoals.length - 1 ? (
                <button
                  type="button"
                  className="btn btnnext"
                  onClick={() => {
                    const currentGoal = selectedGoals[currentGoalIndex];
                    if (!calculatedGoals[currentGoal]) {
                      setModalMessage(
                        "Please click on Calculate before proceeding to the next goal."
                      );
                      setShowUnifiedModal(true);
                      return;
                    }
                    setCurrentGoalIndex((prev) => prev + 1);
                  }}
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btnnext"
                  onClick={() => {
                    const currentGoal = selectedGoals[currentGoalIndex];
                    if (!calculatedGoals[currentGoal]) {
                      setModalMessage(
                        "Please click on Calculate before proceeding to the next goal."
                      );
                      setShowUnifiedModal(true);
                      return;
                    }
                    navigate("/fnariskprofiledetails");
                  }}
                >
                  Next
                </button>
              )}
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
            <Button
              style={{ backgroundColor: "#800000" }}
              onClick={() => setShowUnifiedModal(false)}
            >
              OK
            </Button>
          </Modal.Body>
        </Modal>
      </div>
    </SidebarLayout>
  );
};

export default FNA_Calculators;
