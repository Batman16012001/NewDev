import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { formatWithRs, parseRs } from "../../utils/currency";

const ProtectionPlanningForm = ({
  onCalculate,
  result,
  onReset,
  heading,
  defaultValues,
  goalKey,
}) => {
  const [method, setMethod] = useState(defaultValues?.method || "income");
  const [inputs, setInputs] = useState({
    monthlyIncome: defaultValues?.monthlyIncome ?? 0,
    monthlyExpense: defaultValues?.monthlyExpense ?? 0,
    outStandingLoanAmount: defaultValues?.outStandingLoanAmount ?? 0,
    fixedDeposit: defaultValues?.fixedDeposit ?? 0,
    existingTLR: defaultValues?.existingTLR ?? 0,
  });

  const [results, setResults] = useState(result || null);
  // Sync local results state with result prop
  useEffect(() => {
    setResults(result || null);
  }, [result]);
  // Restore method from defaultValues if present
  useEffect(() => {
    if (defaultValues?.method && defaultValues.method !== method) {
      setMethod(defaultValues.method);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues?.method]);
  const [resetEnabled, setResetEnabled] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Remove Rs. and non-numeric chars for storage
    const numericValue = parseRs(value);
    setInputs((prev) => ({
      ...prev,
      [name]: numericValue === "" ? "" : Number(numericValue),
    }));
  };

  const handleToggle = (e) => {
    setMethod(e.target.checked ? "income" : "expense");
  };

  const handleReset = () => {
    setInputs({
      monthlyIncome: 0,
      monthlyExpense: 0,
      outStandingLoanAmount: 0,
      fixedDeposit: 0,
      existingTLR: 0,
    });
    setResults(null);
    setResetEnabled(false);
  };

  const handleCalculate = async () => {
    const payload = {
      goals: [goalKey],
      monthlyIncome: Number(inputs.monthlyIncome),
      monthlyExpense: Number(inputs.monthlyExpense),
      outStandingLoanAmount: Number(inputs.outStandingLoanAmount),
      fixedDeposit: Number(inputs.fixedDeposit),
      existingTLR: Number(inputs.existingTLR),
      netWorth: 0,
      existingInsurance: 0,
      method: method,
    };

    try {
      const res = await fetch("http://192.168.2.164:3001/api/fna/calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("data:::", data);
      // const result = data.provisinedData.protection.humanValue || data.provisinedData.humanLifeValue.HLV;
      // console.log("data.provisinedData.humanLifeValue.HLV:::::::",data.provisinedData.humanLifeValue.HLV);
      const result =
        data?.provisinedData?.protection?.humanValue ??
        data?.provisinedData?.humanLifeValue?.HLV;
      console.log(
        "data.provisinedData.protection:::::::",
        data.provisinedData.protection
      );
      setResults(result); // 👈 Store full object here
      setResetEnabled(true);
      // Pass method in form_data
      onCalculate && onCalculate(goalKey, result, { ...inputs, method });

      
    } catch (err) {
      console.error("Calculation failed", err);
    }
  };

  const handleToggleChange = () => {
    setMethod(method === "income" ? "expense" : "income");
  };

  return (
    <div className="calculator-form">
      <h4 className="calculator-title">{heading || "Calculator"}</h4>

      {/* <div className="toggle-switch mb-3 text-center">
        <label className="switch">
          <input
            type="checkbox"
            checked={method === "income"}
            onChange={handleToggle}
          />
          <span className="slider round fw-bold">
            {method === "income" ? "Income" : "Expense"}
          </span>
        </label>
      </div> */}
      {/* <div className="custom-toggle-switch mb-3 text-center">
        <label className="custom-switch">
          <input
            type="checkbox"
            checked={method === "expense"}
            onChange={() => setMethod(method === "income" ? "expense" : "income")}
          />
          <span className="custom-slider">
            <span className="custom-slider-label">
              {method === "expense" ? "Expense" : "Income"}
            </span>
          </span>
        </label>
      </div> */}

      {/* Modern Toggle
      <div className="mb-3 text-center">
        <label className="modern-toggle">
          <input
            type="checkbox"
            checked={method === "expense"}
            onChange={handleToggleChange}
          />
          <span className="modern-toggle-slider">
            <span className="modern-toggle-text modern-toggle-text-left">Income</span>
            <span className="modern-toggle-text modern-toggle-text-right">Expense</span>
          </span>
        </label>
      </div> */}

      {/* Modern Toggle */}
      <div className="text-center">
        {" "}
        {/* removed mb-3 */}
        <label className="modern-toggle">
          <input
            type="checkbox"
            checked={method === "expense"}
            onChange={handleToggleChange}
          />
          <span className="modern-toggle-slider">
            <span className="modern-toggle-text modern-toggle-text-left">
              Income
            </span>
            <span className="modern-toggle-text modern-toggle-text-right">
              Expense
            </span>
          </span>
        </label>
      </div>

      <form className="row g-3 mobile-form">
        {method === "income" ? (
          <div className="col-12 row align-items-center">
            <label className="col-sm-7 col-form-label">
              How much is your monthly Income?
            </label>
            <div className="col-sm-3">
              <input
                type="text"
                className="form-control"
                name="monthlyIncome"
                value={formatWithRs(inputs.monthlyIncome)}
                onChange={handleChange}
                min={0}
              />
            </div>
          </div>
        ) : (
          <div className="col-12 row align-items-center">
            <label className="col-sm-7 col-form-label">
              How much is your monthly Expense?
            </label>
            <div className="col-sm-3">
              <input
                type="text"
                className="form-control"
                name="monthlyExpense"
                value={formatWithRs(inputs.monthlyExpense)}
                onChange={handleChange}
                min={0}
              />
            </div>
          </div>
        )}

        {/* Outstanding Loan Amount */}
        <div className="col-12 row align-items-center">
          <label className="col-sm-7 col-form-label">
            Have you obtained any loans without DTA/ mortgage protection Life
            insurance policy? If so, what is the outstanding loan amount?
          </label>
          <div className="col-sm-3">
            <input
              type="text"
              className="form-control"
              name="outStandingLoanAmount"
              value={formatWithRs(inputs.outStandingLoanAmount)}
              onChange={handleChange}
              min={0}
            />
          </div>
        </div>

        {/* Fixed Deposit */}
        <div className="col-12 row align-items-center">
          <label className="col-sm-7 col-form-label">
            Have you invested any large sum in fixed deposit? If so what is the
            total amount?
          </label>
          <div className="col-sm-3">
            <input
              type="text"
              className="form-control"
              name="fixedDeposit"
              value={formatWithRs(inputs.fixedDeposit)}
              onChange={handleChange}
              min={0}
            />
          </div>
        </div>

        {/* Existing Life Insurance (TLR) */}
        <div className="col-12 row align-items-center mt-2">
          <label className="col-sm-7 col-form-label">
            Have you already obtained any life insurance covers? If so what is
            the Total Life Risk (TLR)?
          </label>
          <div className="col-sm-3">
            <input
              type="text"
              className="form-control"
              name="existingTLR"
              value={formatWithRs(inputs.existingTLR)}
              onChange={handleChange}
              min={0}
            />
          </div>
        </div>

        {/* Buttons */}

        <div className="col-8 d-flex justify-content-md-between content-center-mobile mt-4 custom-gap">
          <button
            type="button"
            className="btn btn-reset"
            onClick={handleReset}
            disabled={!result}
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
      {/* Results */}
      {results && (
        <div className="mt-5 mobile-result">
          <h5 className="result-heading">Result</h5>

          <div className="row mb-2">
            <label className="col-sm-7 col-form-label">
              Human Life Value (HLV)
            </label>
            <div className="col-sm-3">
              <input
                className="form-control"
                value={`Rs. ${parseFloat(results).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                readOnly
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProtectionPlanningForm;
