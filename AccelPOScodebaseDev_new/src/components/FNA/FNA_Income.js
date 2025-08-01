import React, { useState, useEffect } from "react";
import SidebarLayout from "../Dashboard/Template";
import "./FNA.css";
import { useNavigate } from "react-router-dom";
import {
  findRecordById,
  saveDetail,
  updateDetailById,
} from "../../db/indexedDB";

const numberToWords = require("number-to-words");

const FNA_Income = () => {
  const [netIncome, setNetIncome] = useState(0);
  const [otherIncome, setOtherIncome] = useState(0);
  const [retirementIncome, setRetirementIncome] = useState(0);
  const isSafeNumber = (num) =>
    typeof num === "number" && Number.isSafeInteger(num) && num >= 0;
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      const fnaMainId = sessionStorage.getItem("fnaId");
      if (!fnaMainId) return;

      const fnaData = await findRecordById(
        "al_fna_income_expenses",
        fnaMainId
      ).catch((err) => {
        console.warn(
          "Could not find al_fna_income_expenses with ID:",
          fnaMainId
        );
        return null;
      });

      if (fnaData?.result.fnaIncomeExpenses) {
        setNetIncome(Number(fnaData.result.fnaIncomeExpenses.netIncome) || 0);
        setOtherIncome(Number(fnaData.result.fnaIncomeExpenses.others) || 0);
        setRetirementIncome(Number(fnaData.result.fnaIncomeExpenses.monthlyIncomeRetire) || 0);
      } else {
        setNetIncome(0);
        setOtherIncome(0);
        setRetirementIncome(0);
      }
    };

    fetchAllData();
  }, []);

  const handleIncrement = (setter, value) => {
    setter((prev) => Math.max(0, prev + value));
  };

  const totalIncome = netIncome + otherIncome;

  const navigate_to_fnagoaldetails = () => {
    navigate("/fnagoaldetails");
  };

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

    const dataToSave = {
      fna_id: fna_id,
      fnaIncomeExpenses: {
        netIncome: netIncome,
        others: otherIncome,
        monthlyIncomeRetire: retirementIncome,
        totalMonthlyIncome: totalIncome,
      },
    };

    try {
      // Try to find existing FNA goal record
      let existingFnaRecord = null;
      try {
        existingFnaRecord = await findRecordById(
          "al_fna_income_expenses",
          fna_id
        );
      } catch (innerError) {
        console.warn(
          "No existing FNA goal record found. A new one will be saved."
        );
      }

      let existingFNAMain;
      try {
        existingFNAMain = await findRecordById("al_fna_main", fna_id);
      } catch (error) {
        console.warn("No existing FNA main record found, proceeding to save.");
        existingFNAMain = null;
      }

      if (existingFnaRecord?.result) {
        // Record exists — update
        await updateDetailById("al_fna_income_expenses", fna_id, dataToSave);
        console.log(
          "FNA details updated successfully in IndexedDB!",
          dataToSave
        );
      } else {
        // Record does not exist — create new
        await saveDetail("al_fna_income_expenses", dataToSave);
        console.log(
          "New FNA details saved successfully in IndexedDB!",
          dataToSave
        );
      }

      // Save or update `al_fna_main`
      if (existingFNAMain) {
        await updateDetailById("al_fna_main", fna_id, dataToSave);
        console.log("Updated FNA main record in IndexedDB");
      } else {
        await saveDetail("al_fna_main", dataToSave);
        console.log("Saved new FNA main record in IndexedDB");
      }

       try {
      const response = await fetch("http://192.168.2.7:4001/fnaService/saveFNAData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           fnaMainId: fna_id,
              agentId,
              clientId,
              personId,
              fnaIncomeExpenses: dataToSave.fnaIncomeExpenses,
        }),
      });

      if (!response.ok) throw new Error("Failed to save FNA data to backend.");

      const result = await response.json();
      console.log("Combined FNA data saved to API:", result);
    } catch (error) {
      console.error("API call failed:", error);
    }
      navigate("/fnaexpensesdetails");
    } catch (error) {
      console.error(
        "Error saving/updating FNA details:",
        error.message || error
      );
    }
  };

//   const handleSubmit = async () => {
//   const fna_id = sessionStorage.getItem("fnaId");
//     const agentId = sessionStorage.getItem("agentId");
//       const clientId = sessionStorage.getItem("clientId");
//       const personId = `PER${agentId}${Date.now()}`;
//   console.log("fna_id found in session:", fna_id);

//   if (!fna_id) {
//     console.error("fna_id not found in session.");
//     return;
//   }

//   const newIncomeValues = {
//     netIncome: netIncome,
//     others: otherIncome,
//     monthlyIncomeRetire: retirementIncome,
//     totalMonthlyIncome: totalIncome,
//   };

//   try {
//     // Step 1: Get existing record
//     let existingFnaRecord = await findRecordById("al_fna_income_expenses", fna_id).catch(() => null);
//     const existingIncomeExpenses = existingFnaRecord?.result?.fnaIncomeExpenses || {};

//     // Step 2: Merge values
//     const mergedIncomeExpenses = {
//       ...existingIncomeExpenses,
//       ...newIncomeValues,
//     };

//     const dataToSave = {
//       fna_id,
//       fnaIncomeExpenses: mergedIncomeExpenses,
//     };

//     // Step 3: Save to al_fna_income_expenses
//     if (existingFnaRecord?.result) {
//       await updateDetailById("al_fna_income_expenses", fna_id, dataToSave);
//       console.log("Income updated in IndexedDB!", dataToSave);
//     } else {
//       await saveDetail("al_fna_income_expenses", dataToSave);
//       console.log("Income saved in IndexedDB!", dataToSave);
//     }

//     // Step 4: Also update al_fna_main
//     let existingFNAMain = await findRecordById("al_fna_main", fna_id).catch(() => null);
//     if (existingFNAMain) {
//       await updateDetailById("al_fna_main", fna_id, dataToSave);
//     } else {
//       await saveDetail("al_fna_main", dataToSave);
//     }


//      try {
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

//     navigate("/fnaexpensesdetails");
//   } catch (error) {
//     console.error("Error saving income details:", error.message || error);
//   }
// };

// const handleSubmit = async () => {
//   const fna_id = sessionStorage.getItem("fnaId");
//   const agentId = sessionStorage.getItem("agentId");
//   const clientId = sessionStorage.getItem("clientId");

//   if (!fna_id) {
//     console.error("fna_id not found in session.");
//     return;
//   }

//   const newIncomeValues = {
//     netIncome: netIncome,
//     others: otherIncome,
//     monthlyIncomeRetire: retirementIncome,
//     totalMonthlyIncome: totalIncome,
//   };

//   try {
//     // Step 1: Fetch existing data
//     const [existingIncomeExp, existingFNAPersons, existingFNAGoals, existingFNAMain] = await Promise.all([
//       findRecordById("al_fna_income_expenses", fna_id).catch(() => null),
//       findRecordById("al_fna_persons", fna_id).catch(() => null),
//       findRecordById("al_fna_goals", fna_id).catch(() => null),
//       findRecordById("al_fna_main", fna_id).catch(() => null),
//     ]);

//     const existingIncomeExpenses = existingIncomeExp?.result?.fnaIncomeExpenses || {};

//     // Step 2: Merge income data
//     const mergedIncomeExpenses = {
//       ...existingIncomeExpenses,
//       ...newIncomeValues,
//     };

//     const incomeDataToSave = {
//       fna_id,
//       fnaIncomeExpenses: mergedIncomeExpenses,
//     };

//     // Step 3: Save to al_fna_income_expenses
//     if (existingIncomeExp?.result) {
//       await updateDetailById("al_fna_income_expenses", fna_id, incomeDataToSave);
//       console.log("Income updated in IndexedDB!", incomeDataToSave);
//     } else {
//       await saveDetail("al_fna_income_expenses", incomeDataToSave);
//       console.log("Income saved in IndexedDB!", incomeDataToSave);
//     }

//     // Step 4: Merge into al_fna_main and save
//     const updatedFnaMain = {
//       ...existingFNAMain?.result,
//       fnaPersons: existingFNAPersons?.result?.fnaPersons || {},
//       fnaGoals: existingFNAGoals?.result?.fnaGoals || [],
//       fnaIncomeExpenses: mergedIncomeExpenses,
//       agentId,
//       clientId,
//     };

//     if (existingFNAMain) {
//       await updateDetailById("al_fna_main", fna_id, updatedFnaMain);
//     } else {
//       await saveDetail("al_fna_main", updatedFnaMain);
//     }

//     // Step 5: Send combined data to API
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

//     navigate("/fnaexpensesdetails");
//   } catch (error) {
//     console.error("Error saving income details:", error.message || error);
//   }
// };


  return (
    <SidebarLayout>
      <div className="customer-container d-flex flex-column p-5">
        <div className="p-3 mb-4">
          <h5 style={{ color: "#9b0b0b" }}>Current Monthly Income</h5>

          <div className="row align-items-center my-3">
            <div className="col-12 col-md-4 mb-2 mb-md-0">
              Net Income (exclude EPF & Taxes)
            </div>

            <div className="col-12 col-md-4 d-flex align-items-center gap-2 fna-years mb-2 mb-md-0">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleIncrement(setNetIncome, -5000)}
              >
                −
              </button>
              <span>
                <input
                  className="form-control form-control-sm"
                  value={netIncome}
                  onChange={(e) => setNetIncome(Number(e.target.value))}
                  style={{ border: "none", textAlign: "center" }}
                />
              </span>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleIncrement(setNetIncome, 5000)}
              >
                +
              </button>
            </div>

            <div className="col-12 col-md-4">
              <small className="text-muted">
                In Words (
                {netIncome
                  ? numberToWords
                      .toWords(netIncome)
                      .replace(/^\w/, (c) => c.toUpperCase())
                  : "Zero"}
                )
              </small>
            </div>
          </div>

          <div className="row align-items-center my-3 mt-5">
            <div className="col-12 col-md-4 mb-2 mb-md-0">Others</div>

            <div className="col-12 col-md-4 d-flex align-items-center gap-2 fna-years">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleIncrement(setOtherIncome, -5000)}
              >
                −
              </button>
              <span>
                <input
                  className="form-control form-control-sm"
                  value={otherIncome}
                  onChange={(e) => setOtherIncome(Number(e.target.value))}
                  style={{ border: "none", textAlign: "center" }}
                />
              </span>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleIncrement(setOtherIncome, 5000)}
              >
                +
              </button>
            </div>

            {/* Text in words */}
            <div className="col-12 col-md-4 pt-2">
              <small className="text-muted">
                In Words (
                {isSafeNumber(otherIncome)
                  ? numberToWords
                      .toWords(otherIncome)
                      .replace(/^\w/, (c) => c.toUpperCase())
                  : "Zero"}
                )
              </small>
            </div>
          </div>

          <div className="row my-3 align-items-center mt-5">
            <div className="col-12 col-md-4  mb-2 mb-md-0">
              Total Monthly Income
            </div>

            <div className="col-12 col-md-4 mb-2 mb-md-0">
              <div className="fw-bold">Rs. {totalIncome.toLocaleString()}</div>
            </div>

            <div className="col-12 col-md-4 pt-2">
              <small className="text-muted">
                In Words (
                {isSafeNumber(totalIncome)
                  ? numberToWords
                      .toWords(totalIncome)
                      .replace(/^\w/, (c) => c.toUpperCase())
                  : "Zero"}
                )
              </small>
            </div>
          </div>
        </div>

        <div className="p-3">
          <h5 style={{ color: "#9b0b0b" }}>During Retirement</h5>

          <div className="row align-items-center my-3">
            <div className="col-12 col-md-4  mb-2 mb-md-0">
              Monthly income during retirement (exclude annuity)
            </div>
            <div className="col-12 col-md-4 d-flex align-items-center gap-2 fna-years">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleIncrement(setRetirementIncome, -5000)}
              >
                -
              </button>
              <span>
                <input
                  className="form-control form-control-sm"
                  value={retirementIncome}
                  onChange={(e) => setRetirementIncome(Number(e.target.value))}
                  style={{ border: "none", textAlign: "center" }}
                />
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleIncrement(setRetirementIncome, 5000)}
              >
                +
              </button>
            </div>
            <div className="col-12 col-md-4 pt-2">
              <small className="text-muted">
                In Words (
                {numberToWords
                  .toWords(retirementIncome)
                  .replace(/^\w/, (c) => c.toUpperCase())}
                )
              </small>
            </div>
          </div>
        </div>
      </div>

      {!isKeyboardVisible && (
        <div className="iosfixednextprevbutton">
          <div className="fixednextprevbutton d-flex justify-content-between">
            <button
              type="button"
              className="btn btnprev"
              onClick={navigate_to_fnagoaldetails}
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

export default FNA_Income;
