import React, { useState, useEffect } from "react";
import SidebarLayout from "../Dashboard/Template";
import "./FNA.css";
import { useNavigate } from "react-router-dom";
import {
  findRecordById,
  saveDetail,
  updateDetailById,
} from "../../db/indexedDB";
import numberToWords from "number-to-words";

const FNA_Expenses = () => {
  const navigate = useNavigate();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Income for balance
  const [totalIncome, setTotalIncome] = useState(0);

  // Expense fields
  const [personalExpense, setPersonalExpense] = useState(0);
  const [cashSavings, setCashSavings] = useState(0);
  const [insurancePremium, setInsurancePremium] = useState(0);
  const [investments, setInvestments] = useState(0);
  const [retirementExpense, setRetirementExpense] = useState(0);

  const totalExpenses =
    personalExpense + cashSavings + insurancePremium + investments;

  const balance = totalIncome - totalExpenses;

  const isSafeNumber = (num) =>
    typeof num === "number" && Number.isSafeInteger(num) && num >= 0;

  const handleIncrement = (setter, value) => {
    setter((prev) => Math.max(0, prev + value));
  };

  useEffect(() => {
    const fetchData = async () => {
      const fnaId = sessionStorage.getItem("fnaId");
      if (!fnaId) return;

      const incomeData = await findRecordById(
        "al_fna_income_expenses",
        fnaId
      ).catch(() => null);

      //  GET totalIncome from indexedDB
      if (incomeData?.result?.fnaIncomeExpenses?.totalMonthlyIncome) {
        setTotalIncome(
          Number(incomeData.result.fnaIncomeExpenses.totalMonthlyIncome)
        );
      }

      const expenseData = await findRecordById(
        "al_fna_income_expenses",
        fnaId
      ).catch(() => null);

      if (expenseData?.result.fnaIncomeExpenses) {
        const d = expenseData.result.fnaIncomeExpenses;
        setPersonalExpense(Number(d.personalHouseholdExp || 0));
        setCashSavings(Number(d.regCashSaving || 0));
        setInsurancePremium(Number(d.insurancePremium || 0));
        setInvestments(Number(d.regularInvestment || 0));
        setRetirementExpense(Number(d.retirementExpense || 0));
      }
    };

    fetchData();
  }, []);

  // const handleSubmit = async () => {
  //   const fna_id = sessionStorage.getItem("fnaId");
  //   const agentId = sessionStorage.getItem("agentId");
  //   const clientId = sessionStorage.getItem("clientId");
  //   const personId = sessionStorage.getItem("person_id");
  //   console.log("fna_id found in session:", fna_id);

  //   if (!fna_id) {
  //     console.error("fna_id not found in session.");
  //     return;
  //   }

  //   const dataToSave = {
  //     fna_id: fna_id,
  //     fnaIncomeExpenses: {
  //       personalHouseholdExp: personalExpense,
  //       regCashSaving: cashSavings,
  //       insurancePremium: insurancePremium,
  //       regularInvestment: investments,
  //       totalMonthlyExpense: totalExpenses,
  //       retirementExpense: retirementExpense,
  //       balance: balance,
  //     },
  //   };

  //   try {
  //     // Try to find existing FNA goal record
  //     let existingFnaRecord = null;
  //     try {
  //       existingFnaRecord = await findRecordById(
  //         "al_fna_income_expenses",
  //         fna_id
  //       );
  //     } catch (innerError) {
  //       console.warn(
  //         "No existing FNA goal record found. A new one will be saved."
  //       );
  //     }

  //     let existingFNAMain;
  //     try {
  //       existingFNAMain = await findRecordById("al_fna_main", fna_id);
  //     } catch (error) {
  //       console.warn("No existing FNA main record found, proceeding to save.");
  //       existingFNAMain = null;
  //     }

  //     if (existingFnaRecord?.result) {
  //       // Record exists — update
  //       await updateDetailById("al_fna_income_expenses", fna_id, dataToSave);
  //       console.log(
  //         "FNA details updated successfully in IndexedDB!",
  //         dataToSave
  //       );
  //     } else {
  //       // Record does not exist — create new
  //       await saveDetail("al_fna_income_expenses", dataToSave);
  //       console.log(
  //         "New FNA details saved successfully in IndexedDB!",
  //         dataToSave
  //       );
  //     }

  //     // Save or update `al_fna_main`
  //     if (existingFNAMain) {
  //       await updateDetailById("al_fna_main", fna_id, dataToSave);
  //       console.log("Updated FNA main record in IndexedDB");
  //     } else {
  //       await saveDetail("al_fna_main", dataToSave);
  //       console.log("Saved new FNA main record in IndexedDB");
  //     }

  //     try {
  //       const response = await fetch(
  //         "http://192.168.2.7:4001/fnaService/saveFNAData",
  //         {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({
  //             fnaMainId: fna_id,
  //             agentId,
  //             clientId,
  //             personId,
  //             fnaIncomeExpenses: dataToSave.fnaIncomeExpenses,
  //           }),
  //         }
  //       );

  //       if (!response.ok)
  //         throw new Error("Failed to save FNA data to backend.");

  //       const result = await response.json();
  //       console.log("Combined FNA data saved to API:", result);
  //     } catch (error) {
  //       console.error("API call failed:", error);
  //     }
  //     navigate("/fnasavingsdetails");
  //   } catch (error) {
  //     console.error(
  //       "Error saving/updating FNA details:",
  //       error.message || error
  //     );
  //   }
  // };

  const handleSubmit = async () => {
    const fna_id = sessionStorage.getItem("fnaId");
    const agentId = sessionStorage.getItem("agentId");
    const clientId = sessionStorage.getItem("clientId");
    const personId = sessionStorage.getItem("person_id");
    console.log("fna_id found in session:", fna_id);

    if (!fna_id) {
      console.error("fna_id not found in session.");
      return;
    }

    const newExpenseValues = {
      personalHouseholdExp: personalExpense,
      regCashSaving: cashSavings,
      insurancePremium: insurancePremium,
      regularInvestment: investments,
      totalMonthlyExpense: totalExpenses,
      retirementExpense: retirementExpense,
      balance: balance,
    };

    try {
      // Step 1: Get existing record
      let existingFnaRecord = await findRecordById(
        "al_fna_income_expenses",
        fna_id
      ).catch(() => null);
      const existingIncomeExpenses =
        existingFnaRecord?.result?.fnaIncomeExpenses || {};

      // Step 2: Merge values
      const mergedIncomeExpenses = {
        ...existingIncomeExpenses,
        ...newExpenseValues,
      };

      const dataToSave = {
        fna_id,
        fnaIncomeExpenses: mergedIncomeExpenses,
      };

      // Step 3: Save to al_fna_income_expenses
      if (existingFnaRecord?.result) {
        await updateDetailById("al_fna_income_expenses", fna_id, dataToSave);
        console.log("Expenses updated in IndexedDB!", dataToSave);
      } else {
        await saveDetail("al_fna_income_expenses", dataToSave);
        console.log("Expenses saved in IndexedDB!", dataToSave);
      }

      // Step 4: Also update al_fna_main
      let existingFNAMain = await findRecordById("al_fna_main", fna_id).catch(
        () => null
      );
      if (existingFNAMain) {
        await updateDetailById("al_fna_main", fna_id, dataToSave);
      } else {
        await saveDetail("al_fna_main", dataToSave);
      }

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
              fnaIncomeExpenses: dataToSave.fnaIncomeExpenses,
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

      navigate("/fnasavingsdetails");
    } catch (error) {
      console.error("Error saving expense details:", error.message || error);
    }
  };

  //   const handleSubmit = async () => {
  //   const fna_id = sessionStorage.getItem("fnaId");
  //   const agentId = sessionStorage.getItem("agentId");
  //   const clientId = sessionStorage.getItem("clientId");

  //   if (!fna_id) {
  //     console.error("fna_id not found in session.");
  //     return;
  //   }

  //   const newExpenseValues = {
  //     personalHouseholdExp: personalExpense,
  //     regCashSaving: cashSavings,
  //     insurancePremium: insurancePremium,
  //     regularInvestment: investments,
  //     totalMonthlyExpense: totalExpenses,
  //     retirementExpense: retirementExpense,
  //     balance: balance,
  //   };

  //   try {
  //     // Step 1: Fetch existing data
  //     const [
  //       existingIncomeExpenseRecord,
  //       existingFNAPersons,
  //       existingFNAGoals,
  //       existingFNAMain
  //     ] = await Promise.all([
  //       findRecordById("al_fna_income_expenses", fna_id).catch(() => null),
  //       findRecordById("al_fna_persons", fna_id).catch(() => null),
  //       findRecordById("al_fna_goals", fna_id).catch(() => null),
  //       findRecordById("al_fna_main", fna_id).catch(() => null),
  //     ]);

  //     const existingIncomeExpenses = existingIncomeExpenseRecord?.result?.fnaIncomeExpenses || {};

  //     // Step 2: Merge expense data into existing income+expense data
  //     const mergedIncomeExpenses = {
  //       ...existingIncomeExpenses,
  //       ...newExpenseValues,
  //     };

  //     const incomeExpenseDataToSave = {
  //       fna_id,
  //       fnaIncomeExpenses: mergedIncomeExpenses,
  //     };

  //     // Step 3: Save to al_fna_income_expenses
  //     if (existingIncomeExpenseRecord?.result) {
  //       await updateDetailById("al_fna_income_expenses", fna_id, incomeExpenseDataToSave);
  //       console.log("Expenses updated in IndexedDB!", incomeExpenseDataToSave);
  //     } else {
  //       await saveDetail("al_fna_income_expenses", incomeExpenseDataToSave);
  //       console.log("Expenses saved in IndexedDB!", incomeExpenseDataToSave);
  //     }

  //     // Step 4: Merge and update al_fna_main
  //     const mergedMainData = {
  //       ...existingFNAMain?.result,
  //       fnaPersons: existingFNAPersons?.result?.fnaPersons || {},
  //       fnaGoals: existingFNAGoals?.result?.fnaGoals || [],
  //       fnaIncomeExpenses: mergedIncomeExpenses,
  //       agentId,
  //       clientId,
  //     };

  //     if (existingFNAMain) {
  //       await updateDetailById("al_fna_main", fna_id, mergedMainData);
  //     } else {
  //       await saveDetail("al_fna_main", mergedMainData);
  //     }

  //     // Step 5: API call with combined payload
  //     try {
  //       const response = await fetch("http://192.168.2.7:4001/fnaService/saveFNAData", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           fnaMainId: fna_id,
  //           agentId,
  //           clientId,
  //           personId: existingFNAPersons?.result?.personId || "",
  //           fnaPersons: existingFNAPersons?.result?.fnaPersons || {},
  //           fnaGoals: existingFNAGoals?.result?.fnaGoals || [],
  //           fnaIncomeExpenses: mergedIncomeExpenses,
  //         }),
  //       });

  //       if (!response.ok) throw new Error("Failed to save FNA data to backend.");

  //       const result = await response.json();
  //       console.log("Combined FNA data saved to API:", result);
  //     } catch (error) {
  //       console.error("API call failed:", error);
  //     }

  //     navigate("/fnasavingsdetails");
  //   } catch (error) {
  //     console.error("Error saving expense details:", error.message || error);
  //   }
  // };

  const expenseFields = [
    {
      label: "Personal and household expenses",
      value: personalExpense,
      setter: setPersonalExpense,
    },
    {
      label: "Regular cash savings",
      value: cashSavings,
      setter: setCashSavings,
    },
    {
      label: "Insurance premium",
      value: insurancePremium,
      setter: setInsurancePremium,
    },
    {
      label: "Regular investments (e.g. Unit Trust)",
      value: investments,
      setter: setInvestments,
    },
  ];

  return (
    <SidebarLayout>
      <div className="customer-container d-flex flex-column p-5">
        <div className="p-3 mb-4">
          <h5 style={{ color: "#9b0b0b" }}>Current Monthly Expenses</h5>

          {expenseFields.map(({ label, value, setter }, idx) => (
            <div className="row align-items-center my-3" key={idx}>
              <div className="col-12 col-md-4 mb-2 mb-md-0">{label}</div>
              <div className="col-12 col-md-4 d-flex align-items-center gap-2 fna-years mb-2 mb-md-0">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleIncrement(setter, -5000)}
                >
                  −
                </button>
                <span>
                  <input
                    className="form-control form-control-sm"
                    value={value}
                    onChange={(e) =>
                      setter(Number(e.target.value.replace(/[^\d]/g, "")))
                    }
                    style={{ border: "none", textAlign: "center" }}
                  />
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleIncrement(setter, 5000)}
                >
                  +
                </button>
              </div>
              <div className="col-12 col-md-4">
                <small className="text-muted">
                  In Words (
                  {isSafeNumber(value)
                    ? numberToWords
                        .toWords(value)
                        .replace(/^\w/, (c) => c.toUpperCase())
                    : "Zero"}
                  )
                </small>
              </div>
            </div>
          ))}

          {/* Total Monthly Expenses */}
          <div className="row align-items-center my-3">
            <div className="col-12 col-md-4">Total monthly expenses</div>
            <div className="col-12 col-md-4 fw-bold">Rs. {totalExpenses}</div>
            <div className="col-12 col-md-4">
              <small className="text-muted">
                In Words (
                {isSafeNumber(totalExpenses)
                  ? numberToWords
                      .toWords(totalExpenses)
                      .replace(/^\w/, (c) => c.toUpperCase())
                  : "Zero"}
                )
              </small>
            </div>
          </div>

          {/* Balance */}
          <div className="row align-items-center my-3">
            <div className="col-12 col-md-4">Balance</div>
            <div className="col-12 col-md-4 fw-bold">Rs. {balance}</div>
            <div className="col-12 col-md-4">
              <small className="text-muted">
                In Words (
                {isSafeNumber(balance)
                  ? numberToWords
                      .toWords(balance)
                      .replace(/^\w/, (c) => c.toUpperCase())
                  : "Zero"}
                )
              </small>
            </div>
          </div>
        </div>

        {/* Retirement */}
        <div className="p-3">
          <h5 style={{ color: "#9b0b0b" }}>Retirement Expenses</h5>
          <div className="row align-items-center my-3">
            <div className="col-12 col-md-4 mb-2 mb-md-0">
              Amount required monthly based on present value
            </div>
            <div className="col-12 col-md-4 d-flex align-items-center gap-2 fna-years mb-2 mb-md-0">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleIncrement(setRetirementExpense, -5000)}
              >
                −
              </button>
              <span>
                <input
                  className="form-control form-control-sm"
                  value={retirementExpense}
                  onChange={(e) =>
                    setRetirementExpense(
                      Number(e.target.value.replace(/[^\d]/g, ""))
                    )
                  }
                  style={{ border: "none", textAlign: "center" }}
                />
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleIncrement(setRetirementExpense, 5000)}
              >
                +
              </button>
            </div>
            <div className="col-12 col-md-4">
              <small className="text-muted">
                In Words (
                {isSafeNumber(retirementExpense)
                  ? numberToWords
                      .toWords(retirementExpense)
                      .replace(/^\w/, (c) => c.toUpperCase())
                  : "Zero"}
                )
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Nav */}
      {!isKeyboardVisible && (
        <div className="iosfixednextprevbutton">
          <div className="fixednextprevbutton d-flex justify-content-between">
            <button
              type="button"
              className="btn btnprev"
              onClick={() => navigate("/fnaincomedetails")}
            >
              Prev
            </button>
            <button
              type="submit"
              className="btn btnnext"
              onClick={handleSubmit}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
};

export default FNA_Expenses;
