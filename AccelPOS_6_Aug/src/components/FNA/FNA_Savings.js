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

const FNA_Savings = () => {
  const navigate = useNavigate();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [cashSavings, setCashSavings] = useState(0);
  // const [totalSavings, setTotalSavings] = useState(0);
  const isSafeNumber = (num) =>
    typeof num === "number" && Number.isSafeInteger(num) && num >= 0;

  const totalSavings = cashSavings;

  const handleIncrement = (setter, value) => {
    setter((prev) => Math.max(0, prev + value));
  };

  useEffect(() => {
    const fetchSavings = async () => {
      const fnaId = sessionStorage.getItem("fnaId");
      if (!fnaId) return;

      const data = await findRecordById("al_fna_saving_provision", fnaId).catch(
        () => null
      );

      if (data?.result?.fnaSavingProvision) {
        setCashSavings(
          Number(data.result.fnaSavingProvision.currentSavings) || 0
        );
        // setTotalSavings(Number(data.result.fnaSavingProvision.totalSavings) || 0);
      }
    };

    fetchSavings();
  }, []);

  //  const handleSubmit = async () => {
  //   const fna_id = sessionStorage.getItem("fnaId");
  //   if (!fna_id) {
  //     console.error("fna_id not found in session.");
  //     return;
  //   }

  //   const newSavingsValues = {
  //     currentSavings: cashSavings,
  //     totalSavings: totalSavings,
  //   };

  //   try {
  //     let existingFnaRecord = await findRecordById("al_fna_saving_provision", fna_id).catch(() => null);
  //     const existingProvisionData = existingFnaRecord?.result?.fnaSavingProvision || {};

  //     const mergedProvision = {
  //       ...existingProvisionData,
  //       ...newSavingsValues,
  //     };

  //     const dataToSave = {
  //       fna_id,
  //       fnaSavingProvision: mergedProvision,
  //     };

  //     if (existingFnaRecord?.result) {
  //       await updateDetailById("al_fna_saving_provision", fna_id, dataToSave);
  //       console.log("Updated savings in IndexedDB!", dataToSave);
  //     } else {
  //       await saveDetail("al_fna_saving_provision", dataToSave);
  //       console.log("Saved new savings in IndexedDB!", dataToSave);
  //     }

  //     let existingFNAMain = await findRecordById("al_fna_main", fna_id).catch(() => null);
  //     if (existingFNAMain) {
  //       await updateDetailById("al_fna_main", fna_id, dataToSave);
  //     } else {
  //       await saveDetail("al_fna_main", dataToSave);
  //     }

  //     navigate("/fnaprovisionsdetails");
  //   } catch (error) {
  //     console.error("Error saving savings:", error.message || error);
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

  //   const newSavingsValues = {
  //     currentSavings: cashSavings,
  //     totalSavings: totalSavings,
  //   };

  //   try {
  //     // Step 1: Fetch all existing data
  //     const [
  //       existingFnaSavingProvision,
  //       existingFnaPersons,
  //       existingFnaGoals,
  //       existingFnaIncomeExpenses,
  //       existingFNAMain
  //     ] = await Promise.all([
  //       findRecordById("al_fna_saving_provision", fna_id).catch(() => null),
  //       findRecordById("al_fna_persons", fna_id).catch(() => null),
  //       findRecordById("al_fna_goals", fna_id).catch(() => null),
  //       findRecordById("al_fna_income_expenses", fna_id).catch(() => null),
  //       findRecordById("al_fna_main", fna_id).catch(() => null),
  //     ]);

  //     const existingSavingData = existingFnaSavingProvision?.result?.fnaSavingProvision || {};

  //     // Step 2: Merge savings
  //     const mergedProvision = {
  //       ...existingSavingData,
  //       ...newSavingsValues,
  //     };

  //     const savingsDataToSave = {
  //       fna_id,
  //       fnaSavingProvision: mergedProvision,
  //     };

  //     // Step 3: Save/update `al_fna_saving_provision`
  //     if (existingFnaSavingProvision?.result) {
  //       await updateDetailById("al_fna_saving_provision", fna_id, savingsDataToSave);
  //       console.log("Updated savings in IndexedDB!", savingsDataToSave);
  //     } else {
  //       await saveDetail("al_fna_saving_provision", savingsDataToSave);
  //       console.log("Saved new savings in IndexedDB!", savingsDataToSave);
  //     }

  //     // Step 4: Update `al_fna_main` with all merged data
  //     const mergedMainData = {
  //       ...existingFNAMain?.result,
  //       agentId,
  //       clientId,
  //       fnaPersons: existingFnaPersons?.result?.fnaPersons || {},
  //       fnaGoals: existingFnaGoals?.result?.fnaGoals || [],
  //       fnaIncomeExpenses: existingFnaIncomeExpenses?.result?.fnaIncomeExpenses || {},
  //       fnaSavingProvision: mergedProvision,
  //     };

  //     if (existingFNAMain) {
  //       await updateDetailById("al_fna_main", fna_id, mergedMainData);
  //     } else {
  //       await saveDetail("al_fna_main", mergedMainData);
  //     }

  //     // Step 5: API call with full consolidated payload
  //     try {
  //       const response = await fetch("http://192.168.2.7:4001/fnaService/saveFNAData", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           fnaMainId: fna_id,
  //           agentId,
  //           clientId,
  //           personId: existingFnaPersons?.result?.personId || "",
  //           fnaPersons: existingFnaPersons?.result?.fnaPersons || {},
  //           fnaGoals: existingFnaGoals?.result?.fnaGoals || [],
  //           fnaIncomeExpenses: existingFnaIncomeExpenses?.result?.fnaIncomeExpenses || {},
  //           fnaSavingProvision: mergedProvision,
  //         }),
  //       });

  //       if (!response.ok) throw new Error("Failed to save FNA data to backend.");

  //       const result = await response.json();
  //       console.log("Full FNA data saved to API:", result);
  //     } catch (apiError) {
  //       console.error("API call failed:", apiError);
  //     }

  //     navigate("/fnaprovisionsdetails");
  //   } catch (error) {
  //     console.error("Error saving savings:", error.message || error);
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

    const dataToSave = {
      fna_id: fna_id,
      fnaSavingProvision: {
        currentSavings: cashSavings,
        totalSavings: totalSavings,
      },
    };

    try {
         // Try to find existing FNA goal record
         let existingFnaRecord = null;
         try {
           existingFnaRecord = await findRecordById(
             "al_fna_saving_provision",
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
           await updateDetailById("al_fna_saving_provision", fna_id, dataToSave);
           console.log(
             "FNA details updated successfully in IndexedDB!",
             dataToSave
           );
         } else {
           // Record does not exist — create new
           await saveDetail("al_fna_saving_provision", dataToSave);
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
                 fnaSavingProvision: dataToSave.fnaSavingProvision,
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
         navigate("/fnaprovisionsdetails");
       }  catch (error) {
      console.error("Error saving savings:", error.message || error);
    }
  };

  return (
    <SidebarLayout>
      <div className="customer-container d-flex flex-column p-5">
        <div className="p-3">
          {/* Current Savings */}
          <div className="row align-items-center my-3">
            <div className="col-12 col-md-4 mb-2 mb-md-0">
              Current Savings (Cash/Bank Deposits)
            </div>
            <div className="col-12 col-md-4 d-flex align-items-center gap-2 fna-years mb-2 mb-md-0">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleIncrement(setCashSavings, -5000)}
              >
                −
              </button>
              <span>
                <input
                  className="form-control form-control-sm"
                  value={cashSavings}
                  onChange={(e) =>
                    setCashSavings(Number(e.target.value.replace(/[^\d]/g, "")))
                  }
                  style={{ border: "none", textAlign: "center" }}
                />
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleIncrement(setCashSavings, 5000)}
              >
                +
              </button>
            </div>
            <div className="col-12 col-md-4">
              <small className="text-muted">
                In Words (
                {isSafeNumber(cashSavings)
                  ? numberToWords
                      .toWords(cashSavings)
                      .replace(/^\w/, (c) => c.toUpperCase())
                  : "Zero"}
                )
              </small>
            </div>
          </div>

          {/* Total Savings */}
          <div className="row align-items-center my-3">
            <div className="col-12 col-md-4 ">Total Savings</div>
            <div className="col-12 col-md-4 fw-bold">
              Rs. {totalSavings.toLocaleString()}
            </div>
            <div className="col-12 col-md-4">
              <small className="text-muted">
                In Words (
                {isSafeNumber(totalSavings)
                  ? numberToWords
                      .toWords(totalSavings)
                      .replace(/^\w/, (c) => c.toUpperCase())
                  : "Zero"}
                )
              </small>
            </div>
          </div>
        </div>

        {!isKeyboardVisible && (
          <div className="iosfixednextprevbutton">
            <div className="fixednextprevbutton d-flex justify-content-between">
              <button
                type="button"
                className="btn btnprev"
                onClick={() => navigate("/fnaexpensesdetails")}
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
      </div>
    </SidebarLayout>
  );
};

export default FNA_Savings;
