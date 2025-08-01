import React, { useState, useEffect, useCallback } from "react";
import SidebarLayout from "../Dashboard/Template";
import ProtectionPlanningForm from "../FNA/ProtectionPlanningForm";
import ChildrenEducationForm from "../FNA/ChildrenEducationForm";
import RetirementPlanningForm from "../FNA/RetirementPlanningForm";
import { findRecordById, updateDetailById } from "../../db/indexedDB";
import { updateCustomerResponse, customerResponse } from "../Customer/CustomerService";
import { useNavigate } from "react-router-dom";

const calculators = [
  {
    key: "hlv",
    label: "Human Life Value",
    component: ProtectionPlanningForm,
    calcKey: "humanLifeCalculator",
    props: { goalKey: "humanLifeValue", heading: "Human Life Value Calculator" }
  },
  {
    key: "wealth",
    label: "Wealth Planning",
    component: ChildrenEducationForm,
    calcKey: "wealthCalculator",
    props: { goalKey: "wealthPlanning", heading: "Wealth Planning Calculator" }
  },
  {
    key: "retirement",
    label: "Retirement Planning",
    component: RetirementPlanningForm,
    calcKey: "retirementCalculator",
    props: { goalKey: "retirementPlanning", heading: "Retirement Planning Calculator" }
  }
];

export default function NeedsCalculator() {
  const [step, setStep] = useState(0);
  const [calculatorResults, setCalculatorResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState(null);
  const [maritalStatus, setMaritalStatus] = useState("");
  const navigate = useNavigate();

  // Load calculator_results from IndexedDB on mount
  useEffect(() => {
    const fetchResults = async () => {
      const cid = sessionStorage.getItem("clientId");
      setClientId(cid);
      if (!cid) return setLoading(false);
      try {
        const rec = await findRecordById("al_client_details", cid);
        setCalculatorResults(rec.result?.calculator_results || {});
        setMaritalStatus(rec.result?.maritalStatus || "");
      } catch (e) {
        setCalculatorResults({});
        setMaritalStatus("");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  // Save calculator_results to IndexedDB and MongoDB
  const saveCalculatorResult = useCallback(
    async (calcKey, form_data, results) => {
      if (!clientId) return;
      try {
        // Update IndexedDB
        const rec = await findRecordById("al_client_details", clientId);
        const prev = rec.result?.calculator_results || {};
        const updated = {
          ...prev,
          [calcKey]: { form_data, results }
        };
        await updateDetailById("al_client_details", clientId, { calculator_results: updated });
        setCalculatorResults(updated);

        // --- Sync to MongoDB ---
        const customer = await findRecordById("al_client_details", clientId);
        const leadId = customer.result?.leadId;
        const backendData = { ...customer.result, calculator_results: updated };

        if (leadId) {
          await updateCustomerResponse(backendData, leadId);
        } else {
          await customerResponse(backendData);
        }
      } catch (e) {
        // Optionally show error
        // console.error("Failed to save calculator result", e);
      }
    },
    [clientId]
  );

  if (loading) return <SidebarLayout><div className="customer-container d-flex flex-column p-5 mt-4">Loading...</div></SidebarLayout>;

  const { component: CalcComponent, calcKey, props } = calculators[step];
  const saved = calculatorResults[calcKey] || {};

  // Handler for calculation in each calculator
  const handleCalculate = (form_data, results) => {
    saveCalculatorResult(calcKey, form_data, results);
  };

  // Compose props for each calculator
  const calcProps = {
    ...props,
    defaultValues: saved.form_data || {},
    result: saved.results,
    maritalStatus, // Pass maritalStatus to all calculators
    onCalculate: (goalKey, result, form_data) => {
      saveCalculatorResult(calcKey, form_data || {}, result);
    },
  };

  return (
    <SidebarLayout>
      <div className="customer-container d-flex flex-column p-4 pt-5 pt-xs-3 mt-4">
        <CalcComponent {...calcProps} />
        <div className="iosfixednextprevbutton">
          <div className="fixednextprevbutton d-flex justify-content-between">
            <button
              type="button"
              className="btn btnprev"
              onClick={() => {
                if (step === 0) {
                  navigate("/customer");
                } else {
                  setStep((s) => Math.max(0, s - 1));
                }
              }}
            >
              Prev
            </button>
            <button
              type="button"
              className="btn btnprev"
              onClick={() => {
                navigate("/sqs_personal_detail");

              }}
            >
              Quotation
            </button>
            <button
              type="button"
              className="btn btnnext"
              onClick={() => setStep((s) => Math.min(calculators.length - 1, s + 1))}
              disabled={step === calculators.length - 1}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
} 