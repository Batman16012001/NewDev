import React, { useState, useEffect } from "react";
import {
  findRecordById,
  saveDetail,
  updateDetailById,
} from "../../db/indexedDB";
import { formatWithRs, parseRs } from "../../utils/currency";

const ChildrenEducationForm = ({ onCalculate, defaultValues, heading, goalKey, result }) => {
  const [inputs, setInputs] = useState({
    currentCost: defaultValues?.currentCost ?? 200000,
    currentSaving: defaultValues?.currentSaving ?? 0,
    expectedInflation: defaultValues?.expectedInflation ?? 9,
    assumedRate: defaultValues?.assumedRate ?? 5,
    projectedRate: defaultValues?.projectedRate ?? 8,
    yearGoal: defaultValues?.yearGoal ?? 12,
    annualExpense: defaultValues?.annualExpense ?? 0,
    projectedAnnuityRate: defaultValues?.projectedAnnuityRate ?? 4.5,
  });

  const [results, setResults] = useState(result || null);
  // Sync local results state with result prop
  useEffect(() => {
    setResults(result || null);
  }, [result]);
  const [resetEnabled, setResetEnabled] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [maritalStatus, setMaritalStatus] = useState("");
  const [apiMessage, setApiMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For currency fields, parse and store only numeric value
    if (["currentCost", "currentSaving", "annualExpense"].includes(name)) {
      const numericValue = parseRs(value);
      setInputs((prev) => ({
        ...prev,
        [name]: numericValue === "" ? "" : Number(numericValue),
      }));
    } else if (name === "expectedInflation") {
      const numericValue = Number(value);
      if (numericValue < 0 || numericValue > 15) return;
      setInputs((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setInputs((prev) => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const fnaId = sessionStorage.getItem("fnaId");
      if (!fnaId) return;

      const incomeData = await findRecordById(
        "al_fna_income_expenses",
        fnaId
      ).catch(() => null);

      if (incomeData?.result?.fnaIncomeExpenses.balance) {
        const income = Number(incomeData.result.fnaIncomeExpenses.balance);
        setTotalIncome(income);

        // Set this as the currentSaving once fetched
        setInputs((prev) => ({
          ...prev,
          currentSaving: income,
        }));
      }

      const personData = await findRecordById("al_fna_persons", fnaId);
      if (personData?.result.fnaPersons) {
        const person = personData.result.fnaPersons;
        setMaritalStatus(person.maritalStatus || "");
      }
    };

    fetchData();
  }, []);

  const handleCalculate = async () => {
    const {
      currentCost,
      currentSaving,
      expectedInflation,
      assumedRate,
      projectedRate,
      projectedAnnuityRate,
      annualExpense,
      yearGoal,
    } = inputs;

    // Start with base payload
    const payload = { goals: [goalKey] };

    // Define goal-specific fields
    switch (goalKey) {
      case "childrenEducation":
        Object.assign(payload, {
          currentCost: Number(currentCost),
          expectedInflation: Number(expectedInflation),
          yearGoal: Number(yearGoal),
          currentSaving: Number(currentSaving),
          assumedRate: Number(assumedRate),
          projectedRate: Number(projectedRate),
          maritalStatus: maritalStatus,
        });
        break;

      case "wealthPlanning":
        Object.assign(payload, {
          annualExpense: Number(annualExpense) || 5000,
          expectedInflation: Number(expectedInflation),
          yearGoal: Number(yearGoal),
          currentCost: Number(currentCost),
          currentSaving: Number(currentSaving),
          assumedRate: Number(assumedRate),
          projectedAnnuityRate: Number(projectedAnnuityRate),
          projectedRate: Number(projectedRate),
        });
        break;

      case "healthLifestyle":
        Object.assign(payload, {
          currentCost: Number(currentCost),
          annualExpense: Number(annualExpense) || 5000,
          expectedInflation: Number(expectedInflation),
          yearGoal: Number(yearGoal),
          currentSaving: Number(currentSaving),
          assumedRate: Number(assumedRate),
          projectedAnnuityRate: Number(projectedAnnuityRate),
          projectedRate: Number(projectedRate),
        });
        break;

      case "marraige":
        Object.assign(payload, {
          annualExpense: Number(annualExpense) || 5000,
          expectedInflation: Number(expectedInflation),
          yearGoal: Number(yearGoal),
          currentSaving: Number(currentSaving),
          currentCost: Number(currentCost),
          assumedRate: Number(assumedRate),
          projectedAnnuityRate: Number(projectedAnnuityRate),
          projectedRate: Number(projectedRate),
          maritalStatus: maritalStatus,
        });
        break;

      default:
        console.warn("Unknown goalKey:", goalKey);
    }

    console.log("====================================");
    console.log(`Request payload for ${goalKey}`, payload);
    console.log("====================================");

    try {
      const res = await fetch("http://192.168.2.164:3001/api/fna/calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

    const data = await res.json();
    const result = data.provisinedData?.[goalKey];
    setResults(result);
     setApiMessage('');
    setResetEnabled(true);
    onCalculate && onCalculate(goalKey, result, inputs);
    
    } catch (err) {
      console.error("Calculation failed", err);
    }
  };

  const handleReset = () => {
    setInputs({
      currentCost: "",
      currentSaving: "",
      expectedInflation: 9,
      assumedRate: 5,
      projectedRate: 8,
      yearGoal: 10,
      annualExpense: "",
      projectedAnnuityRate: 4.5,
    });
    setResults(null);
    setResetEnabled(false);
  };

  return (
    <div className="">
      <h4 className="calculator-title">{heading || "Calculator"}</h4>

      <form className="row g-3 mobile-form">
        {/* Current Cost - only for childrenEducation, marraige, wealth */}
        {[
          "childrenEducation",
          "marraige",
          "wealthPlanning",
          "healthLifestyle",
        ].includes(goalKey) && (
          <div className="col-12 row align-items-center">
            <label className="col-sm-7 col-form-label">
              Current cost of goal
            </label>
            <div className="col-sm-3">
              <input
                type="number"
                name="currentCost"
                className="form-control"
                value={inputs.currentCost}
                onChange={(e) => {
                  const value = Math.min(200000, Number(e.target.value));
                  setInputs((prev) => ({ ...prev, currentCost: value }));
                }}
                onInput={(e) => {
                  // Optional: limit character length
                  if (e.target.value.length > 6) {
                    e.target.value = e.target.value.slice(0, 6);
                  }
                }}
                max={200000}
                min={0}
              />
            </div>
          </div>
        )}

        {/* Current Saving */}
        {[
          "childrenEducation",
          "marraige",
          "wealthPlanning",
          "healthLifestyle",
        ].includes(goalKey) && (
          <>
            <div className="col-12 row align-items-center mt-2">
              <label className="col-sm-7 col-form-label">
                Current savings for the goal
              </label>
              <div className="col-sm-3">
                <input
                  type="number"
                  name="currentSaving"
                  className="form-control"
                  value={inputs.currentSaving}
                  onChange={handleChange}
                  min={0}
                />
              </div>
            </div>

            <div className="col-12 row align-items-center mt-2">
              <label className="col-sm-7 col-form-label">
                Assumed inflation rate (%)
              </label>
              <div className="col-sm-3">
                <input
                  type="number"
                  name="expectedInflation"
                  className="form-control"
                  value={inputs.expectedInflation}
                  onChange={handleChange}
                  onInput={(e) => {
                    if (e.target.value > 15) e.target.value = 15;
                    if (e.target.value < 0) e.target.value = 0;
                  }}
                  min={0}
                  max={15}
                  step={0.1}
                />
              </div>
            </div>

            <div className="col-12 row align-items-center mt-2">
              <label className="col-sm-7 col-form-label">
                Assumed rate of return on current savings (%)
              </label>
              <div className="col-sm-3">
                <input
                  type="number"
                  name="assumedRate"
                  className="form-control"
                  value={inputs.assumedRate}
                  onChange={handleChange}
                  onInput={(e) => {
                    if (e.target.value > 15) e.target.value = 15;
                    if (e.target.value < 0) e.target.value = 0;
                  }}
                  min={0}
                  max={15}
                  step={0.1}
                />
              </div>
            </div>

            <div className="col-12 row align-items-center mt-2">
              <label className="col-sm-7 col-form-label">
                Projected rate of return on investment (%)
              </label>
              <div className="col-sm-3">
                <input
                  type="number"
                  name="projectedRate"
                  className="form-control"
                  value={inputs.projectedRate}
                  onChange={handleChange}
                  onInput={(e) => {
                    if (e.target.value > 15) e.target.value = 15;
                    if (e.target.value < 0) e.target.value = 0;
                  }}
                  min={0}
                  max={15}
                  step={0.1}
                />
              </div>
            </div>

            <div className="col-12 row align-items-center mt-2">
              <label className="col-sm-7 col-form-label">
                Years of milestone
              </label>
              <div className="col-sm-3">
                <input
                  type="number"
                  name="yearGoal"
                  className="form-control"
                  value={inputs.yearGoal}
                  onChange={handleChange}
                  onInput={(e) => {
                    if (e.target.value.length > 2)
                      e.target.value = e.target.value.slice(0, 2);
                  }}
                  max={99}
                  min={0}
                />
              </div>
            </div>
          </>
        )}
        {/* Annual Expense - for wealth, health, marraige, retirement */}
        {["retirementPlanning"].includes(goalKey) && (
          <div className="col-12 row align-items-center mt-2">
            <label className="col-sm-7 col-form-label">Annual Expense</label>
            <div className="col-sm-3">
              <input
                type="number"
                name="annualExpense"
                className="form-control"
                value={inputs.annualExpense}
                onChange={handleChange}
                min={0}
              />
            </div>
          </div>
        )}

        {/* Projected Annuity Rate - for wealth, health, marraige, retirement */}
        {/* {["wealthPlanning", "healthLifestyle", "marraige", "retirementPlanning"].includes(goalKey) && (
  <div className="col-12 row align-items-center mt-2">
    <label className="col-sm-7 col-form-label">
      Projected Annuity Rate (%)
    </label>
    <div className="col-sm-3">
      <input
        type="number"
        name="projectedAnnuityRate"
        className="form-control"
        value={inputs.projectedAnnuityRate}
        onChange={handleChange}
        min={0}
        max={15}
        step={0.1}
      />
    </div>
  </div>
)} */}

        {/* Buttons */}
        <div className="col-9 d-flex justify-content-between mt-4 content-center-mobile custom-gap">
          <button
            type="button"
            className="btn btn-reset"
            onClick={handleReset}
            disabled={!resetEnabled}
          >
            Reset
          </button>
          <button
            type="button"
            className="btn btn-calculate"
            onClick={handleCalculate}
          >
            Calculate
          </button>
        </div>
      </form>

      {apiMessage && (
  <div className="alert alert-warning mt-4" role="alert">
    {apiMessage}
  </div>
)}

      {/* Results */}
      {results && (
        <div className="mt-5">
          <h5 className="result-heading">Result</h5>

          <div className="row mb-2">
            <label className="col-sm-7 col-form-label">
              Future cost of goal
            </label>
            <div className="col-sm-3">
              <input
                className="form-control"
                value={
                  results.futureCostOfGoal
                    ? `Rs. ${new Intl.NumberFormat("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(results.futureCostOfGoal)}`
                    : ""
                }
                readOnly
              />
            </div>
          </div>

          <div className="row mb-2">
            <label className="col-sm-7 col-form-label">
              Future value of current Savings
            </label>
            <div className="col-sm-3">
              <input
                className="form-control"
                value={
                  results.futureValue
                    ? `Rs. ${new Intl.NumberFormat("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(results.futureValue)}`
                    : ""
                }
                readOnly
              />
            </div>
          </div>

          <div className="row mb-2">
            <label className="col-sm-7 col-form-label">
              Actual corpus required for Goal
            </label>
            <div className="col-sm-3">
              <input
                className="form-control"
                value={
                  results.ActualCorpusRequiredForGoal
                    ? `Rs. ${new Intl.NumberFormat("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(results.ActualCorpusRequiredForGoal)}`
                    : ""
                }
                readOnly
              />
            </div>
          </div>

          <div className="row mb-2">
            <label className="col-sm-7 col-form-label">
              Annual investment required for the Goal
            </label>
            <div className="col-sm-3">
              <input
                className="form-control"
                value={
                  results.AnnualInvestmentRequiredForGoal
                    ? `Rs. ${new Intl.NumberFormat("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(results.AnnualInvestmentRequiredForGoal)}`
                    : ""
                }
                readOnly
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildrenEducationForm;
