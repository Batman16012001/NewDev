import React, { useState, useEffect } from "react";
import { findRecordById } from "../../db/indexedDB";
import { formatWithRs, parseRs } from "../../utils/currency";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

// Validation schema for retirement planning form
const RetirementValidationSchema = Yup.object().shape({
  annualExpense: Yup.number()
    .typeError("Amount must be a number")
    .required("Annual expense is required")
    .min(5000, "Annual expense must be at least ₹5,000")
    .max(100000, "Annual expense cannot exceed ₹100,000"),
  expectedInflation: Yup.number()
    .typeError("Inflation rate must be a number")
    .required("Expected inflation rate is required")
    .min(2, "Inflation rate must be at least 2%")
    .max(15, "Inflation rate cannot exceed 15%"),
  currentSaving: Yup.number()
    .typeError("Amount must be a number")
    .required("Current savings is required")
    .min(0, "Current savings cannot be negative"),
  assumedRate: Yup.number()
    .typeError("Rate must be a number")
    .required("Assumed rate is required")
    .min(0, "Rate cannot be negative")
    .max(15, "Rate cannot exceed 15%"),
  projectedRate: Yup.number()
    .typeError("Rate must be a number")
    .required("Projected rate is required")
    .min(0, "Rate cannot be negative")
    .max(15, "Rate cannot exceed 15%"),
  projectedAnnuityRate: Yup.number()
    .typeError("Rate must be a number")
    .required("Projected annuity rate is required")
    .min(0, "Rate cannot be negative"),
  yearGoal: Yup.number()
    .typeError("Years must be a number")
    .required("Years of milestone is required")
    .min(1, "Years must be at least 1")
    .max(99, "Years cannot exceed 99"),
});

const RetirementPlanningForm = ({
  onCalculate,
  defaultValues,
  goalKey,
  heading,
  result,
  maritalStatus,
}) => {
  const [results, setResults] = useState(result || null);
  // ✅ Rename internal state to avoid conflict
  const [maritalStatusState, setMaritalStatusState] = useState(
    maritalStatus || ""
  );

  // Sync local results state with result prop
  useEffect(() => {
    setResults(result || null);
  }, [result]);
  const [resetEnabled, setResetEnabled] = useState(false);

  const initialValues = {
    currentCost: defaultValues?.currentCost ?? 200000,
    annualExpense: defaultValues?.annualExpense ?? 60000,
    currentSaving: defaultValues?.currentSaving ?? 0,
    expectedInflation: defaultValues?.expectedInflation ?? 9,
    assumedRate: defaultValues?.assumedRate ?? 5,
    projectedRate: defaultValues?.projectedRate ?? 8,
    projectedAnnuityRate: defaultValues?.projectedAnnuityRate ?? 4.5,
    yearGoal: defaultValues?.yearGoal ?? 14,
  };

  useEffect(() => {
    const fetchData = async () => {
      const fnaId = sessionStorage.getItem("fnaId");
      if (!fnaId) return;

      const incomeData = await findRecordById(
        "al_fna_income_expenses",
        fnaId
      ).catch(() => null);

      if (incomeData?.result?.retirement_Income) {
        const retireincome = Number(incomeData.result.retirement_Income);
        // Optionally update initialValues if needed
      }

      // Use maritalStatus from props only if it's valid
      if (!maritalStatus) {
        const personData = await findRecordById("al_fna_persons", fnaId).catch(
          () => null
        );
        if (personData?.result?.fnaPersons.maritalStatus) {
          setMaritalStatusState(personData.result.fnaPersons.maritalStatus);
        }
      } else {
        setMaritalStatusState(maritalStatus);
      }
    };
    fetchData();
  }, []);

  const handleCalculate = async (values) => {
    const payload = {
      goals: [goalKey],
      ...values,
      maritalStatus: maritalStatusState || "",
    };
    try {
      const res = await fetch("http://192.168.2.164:3001/api/fna/calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await res.json();
      const result = data.provisinedData?.retirementPlanning;
      if (!result) {
        throw new Error("Invalid response format");
      }
      setResults(result);
      setResetEnabled(true);
      onCalculate && onCalculate(goalKey, result, values);
    } catch (err) {
      console.error("Calculation failed:", err);
    }
  };

  const handleReset = () => {
    setResults(null);
    setResetEnabled(false);
    return {
      annualExpense: 60000,
      currentSaving: 0,
      currentCost: 200000,
      expectedInflation: 9,
      assumedRate: 5,
      projectedRate: 8,
      projectedAnnuityRate: 4.5,
      yearGoal: 14,
    };
  };

  return (
    <div className="calculator-form">
      <h4 className="calculator-title">{heading || "Calculator"}</h4>
      <Formik
        initialValues={initialValues}
        validationSchema={RetirementValidationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          await handleCalculate(values);
          setSubmitting(false);
        }}
        enableReinitialize
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          isSubmitting,
          setFieldValue,
        }) => (
          <Form className="row g-3">
            {/* Current Cost */}
            <div className="col-12 row align-items-center mt-2">
              <label
                htmlFor="annualExpense"
                className="col-sm-7 col-form-label"
              >
                Estimated annuity required (as per current date)
              </label>
              <div className="col-sm-3">
                <Field
                  type="text"
                  id="annualExpense"
                  name="annualExpense"
                  className={`form-control ${
                    errors.annualExpense && touched.annualExpense
                      ? "is-invalid"
                      : ""
                  }`}
                  value={formatWithRs(values.annualExpense)}
                  onChange={(e) => {
                    const numericValue = parseRs(e.target.value);
                    setFieldValue(
                      "annualExpense",
                      numericValue === "" ? "" : Number(numericValue)
                    );
                  }}
                  onBlur={handleBlur}
                  inputMode="numeric"
                />
                <ErrorMessage
                  name="annualExpense"
                  component="div"
                  className="invalid-feedback"
                />
              </div>
            </div>
            {/* Current Saving */}
            <div className="col-12 row align-items-center mt-2">
              <label
                htmlFor="currentSaving"
                className="col-sm-7 col-form-label"
              >
                Current savings for retirement
              </label>
              <div className="col-sm-3">
                <Field
                  type="text"
                  id="currentSaving"
                  name="currentSaving"
                  className={`form-control ${
                    errors.currentSaving && touched.currentSaving
                      ? "is-invalid"
                      : ""
                  }`}
                  value={formatWithRs(values.currentSaving)}
                  onChange={(e) => {
                    const numericValue = parseRs(e.target.value);
                    setFieldValue(
                      "currentSaving",
                      numericValue === "" ? "" : Number(numericValue)
                    );
                  }}
                  onBlur={handleBlur}
                  inputMode="numeric"
                />
                <ErrorMessage
                  name="currentSaving"
                  component="div"
                  className="invalid-feedback"
                />
              </div>
            </div>
            {/* Expected Inflation */}
            <div className="col-12 row align-items-center mt-2">
              <label
                htmlFor="expectedInflation"
                className="col-sm-7 col-form-label"
              >
                Assumed inflation rate (%)
              </label>
              <div className="col-sm-3">
                <Field
                  type="number"
                  id="expectedInflation"
                  name="expectedInflation"
                  className={`form-control ${
                    errors.expectedInflation && touched.expectedInflation
                      ? "is-invalid"
                      : ""
                  }`}
                  step="0.1"
                  min="2"
                  max="15"
                  onBlur={handleBlur}
                />
                <ErrorMessage
                  name="expectedInflation"
                  component="div"
                  className="invalid-feedback"
                />
              </div>
            </div>
            {/* Assumed Rate */}
            <div className="col-12 row align-items-center mt-2">
              <label htmlFor="assumedRate" className="col-sm-7 col-form-label">
                Assumed rate of return on current savings (%)
              </label>
              <div className="col-sm-3">
                <Field
                  type="number"
                  id="assumedRate"
                  name="assumedRate"
                  className={`form-control ${
                    errors.assumedRate && touched.assumedRate
                      ? "is-invalid"
                      : ""
                  }`}
                  step="0.1"
                  min="0"
                  max="15"
                  onBlur={handleBlur}
                />
                <ErrorMessage
                  name="assumedRate"
                  component="div"
                  className="invalid-feedback"
                />
              </div>
            </div>
            {/* Projected Rate */}
            <div className="col-12 row align-items-center mt-2">
              <label
                htmlFor="projectedRate"
                className="col-sm-7 col-form-label"
              >
                Projected rate of return on investment (%)
              </label>
              <div className="col-sm-3">
                <Field
                  type="number"
                  id="projectedRate"
                  name="projectedRate"
                  className={`form-control ${
                    errors.projectedRate && touched.projectedRate
                      ? "is-invalid"
                      : ""
                  }`}
                  step="0.1"
                  min="0"
                  max="15"
                  onBlur={handleBlur}
                />
                <ErrorMessage
                  name="projectedRate"
                  component="div"
                  className="invalid-feedback"
                />
              </div>
            </div>
            {/* Projected Annuity Rate */}
            <div className="col-12 row align-items-center mt-2">
              <label
                htmlFor="projectedAnnuityRate"
                className="col-sm-7 col-form-label"
              >
                Projected annuity rate
              </label>
              <div className="col-sm-3">
                <Field
                  type="number"
                  id="projectedAnnuityRate"
                  name="projectedAnnuityRate"
                  className={`form-control ${
                    errors.projectedAnnuityRate && touched.projectedAnnuityRate
                      ? "is-invalid"
                      : ""
                  }`}
                  min="0"
                  step="0.1"
                  onBlur={handleBlur}
                />
                <ErrorMessage
                  name="projectedAnnuityRate"
                  component="div"
                  className="invalid-feedback"
                />
              </div>
            </div>
            {/* Year Goal */}
            <div className="col-12 row align-items-center mt-2">
              <label htmlFor="yearGoal" className="col-sm-7 col-form-label">
                Years of milestone
              </label>
              <div className="col-sm-3">
                <Field
                  type="number"
                  id="yearGoal"
                  name="yearGoal"
                  className={`form-control ${
                    errors.yearGoal && touched.yearGoal ? "is-invalid" : ""
                  }`}
                  min="1"
                  max="99"
                  onBlur={handleBlur}
                />
                <ErrorMessage
                  name="yearGoal"
                  component="div"
                  className="invalid-feedback"
                />
              </div>
            </div>
            {/* Buttons */}
            <div className="col-9 d-flex justify-content-between mt-4">
              <button
                type="button"
                className="btn btn-reset"
                onClick={handleReset}
                disabled={!resetEnabled}
              >
                Reset
              </button>
              <button
                type="submit"
                className="btn btn-calculate"
                disabled={isSubmitting || Object.keys(errors).length > 0}
              >
                {isSubmitting ? "Calculating..." : "Calculate"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
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
              Future value of current savings
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
              Actual corpus required for goal
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
              Annual investment required
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

export default RetirementPlanningForm;
