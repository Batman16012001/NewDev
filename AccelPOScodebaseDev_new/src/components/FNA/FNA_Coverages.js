// import React, { useState, useEffect } from "react";
// import SidebarLayout from "../Dashboard/Template";
// import "./FNA.css";
// import { useNavigate } from "react-router-dom";
// import {
//   findRecordById,
//   saveDetail,
//   updateDetailById,
// } from "../../db/indexedDB";
// import numberToWords from "number-to-words";

// const FNA_Coverages = () => {
//   const navigate = useNavigate();

//   // State definitions
//   const [coverage, setCoverage] = useState({
//     savingOrInvestPlanSumAssured: 0,
//     educationPlansSumAssured: 0,
//     mortgageProtectionPlansSumAssured: 0,
//     deathInServiceSumAssured: 0,
//     criticalIllnessSumAssured: 0,
//     retirementSumAssured: 0,
//     hospSurgicplanPlanPremium: 0,
//     hospSurgicalPlanFlag: "",
//   });

//   const isSafeNumber = (num) =>
//     typeof num === "number" && Number.isSafeInteger(num) && num >= 0;

//   const handleIncrement = (field, value) => {
//     setCoverage((prev) => ({
//       ...prev,
//       [field]: Math.max(0, prev[field] + value),
//     }));
//   };

//   const handleChange = (field, val) => {
//     setCoverage((prev) => ({
//       ...prev,
//       [field]: val,
//     }));
//   };

//   useEffect(() => {
//     const fetchCoverage = async () => {
//       const fnaId = sessionStorage.getItem("fnaId");
//       if (!fnaId) return;

//       const result = await findRecordById("al_fna_coverages", fnaId).catch(
//         () => null
//       );
//       const insurance = result?.result?.fnaExistingInsurance;

//       if (insurance) {
//         setCoverage(insurance); // Or use Formik's setValues or similar if applicable
//       }
//     };

//     fetchCoverage();
//   }, []);

//  const handleSubmit = async () => {
//   const fna_id = sessionStorage.getItem("fnaId");
//   const agentId = sessionStorage.getItem("agentId");
//   const clientId = sessionStorage.getItem("clientId");
//   console.log("fna_id found in session:", fna_id);

//   if (!fna_id) {
//     console.error("fna_id not found in session.");
//     return;
//   }

//   // Only coverage fields, not fna_id
//   const coverageFields = { ...coverage };

//   try {
//     const [
//       existingFnaCoverages,
//       existingFnaAssetsLiabilities,
//       existingFnaSavingProvision,
//       existingFnaPersons,
//       existingFnaGoals,
//       existingFnaIncomeExpenses,
//       existingFNAMain,
//     ] = await Promise.all([
//       findRecordById("al_fna_coverages", fna_id).catch(() => null),
//       findRecordById("al_fna_assests_liabilities", fna_id).catch(() => null),
//       findRecordById("al_fna_saving_provision", fna_id).catch(() => null),
//       findRecordById("al_fna_persons", fna_id).catch(() => null),
//       findRecordById("al_fna_goals", fna_id).catch(() => null),
//       findRecordById("al_fna_income_expenses", fna_id).catch(() => null),
//       findRecordById("al_fna_main", fna_id).catch(() => null),
//     ]);

//     // Always flat object, not nested
//     const liabilitiesDataToSave = {
//       fna_id,
//       fnaExistingInsurance: coverageFields,
//     };

//     if (existingFnaCoverages) {
//       await updateDetailById("al_fna_coverages", fna_id, liabilitiesDataToSave);
//       console.log("FNA details updated successfully in IndexedDB!", liabilitiesDataToSave);
//     } else {
//       await saveDetail("al_fna_coverages", liabilitiesDataToSave);
//       console.log("New FNA details saved successfully in IndexedDB!", liabilitiesDataToSave);
//     }

//     const mergedMainData = {
//       ...existingFNAMain?.result,
//       agentId,
//       clientId,
//       fnaPersons: existingFnaPersons?.result?.fnaPersons || {},
//       fnaGoals: existingFnaGoals?.result?.fnaGoals || [],
//       fnaIncomeExpenses: existingFnaIncomeExpenses?.result?.fnaIncomeExpenses || {},
//       fnaSavingProvision: existingFnaSavingProvision?.result?.fnaSavingProvision || {},
//       fnaAssetsLiabilities: existingFnaAssetsLiabilities?.result?.fnaAssetsLiabilities || {},
//       fnaExistingInsurance: coverageFields, // flat object here
//     };

//     if (existingFNAMain) {
//       await updateDetailById("al_fna_main", fna_id, mergedMainData);
//     } else {
//       await saveDetail("al_fna_main", mergedMainData);
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
//             personId: existingFnaPersons?.result?.personId || "",
//             fnaPersons: existingFnaPersons?.result?.fnaPersons || {},
//             fnaGoals: existingFnaGoals?.result?.fnaGoals || [],
//             fnaIncomeExpenses: existingFnaIncomeExpenses?.result?.fnaIncomeExpenses || {},
//             fnaSavingProvision: existingFnaSavingProvision?.result?.fnaSavingProvision || {},
//             fnaAssetsLiabilities: existingFnaAssetsLiabilities?.result?.fnaAssetsLiabilities || {},
//             fnaExistingInsurance: coverageFields, // flat object here
//           }),
//         }
//       );

//       if (!response.ok)
//         throw new Error("Failed to save FNA data to backend.");
//       const result = await response.json();
//       console.log("Liabilities data posted to API:", result);
//       navigate("/fnacalculatorsdetails", { state: { fromCoverage: true } });
//     } catch (apiError) {
//       console.error("API call failed:", apiError);
//     }
//   } catch (error) {
//     console.error("Error saving savings:", error);
//   }
// };

//   const renderNumericField = (label, fieldKey) => (
//     <div className="row align-items-center my-3">
//       <div className="col-12 col-md-4 ">{label}</div>
//       <div className="col-12 col-md-4 d-flex align-items-center gap-2 fna-years">
//         <button
//           type="button"
//           className="btn btn-secondary btn-sm"
//           onClick={() => handleIncrement(fieldKey, -5000)}
//         >
//           −
//         </button>
//         <span>
//           <input
//             className="form-control form-control-sm"
//             value={coverage[fieldKey]}
//             onChange={(e) =>
//               handleChange(
//                 fieldKey,
//                 Number(e.target.value.replace(/[^\d]/g, ""))
//               )
//             }
//             style={{ border: "none", textAlign: "center" }}
//           />
//         </span>
//         <button
//           type="button"
//           className="btn btn-secondary btn-sm"
//           onClick={() => handleIncrement(fieldKey, 5000)}
//         >
//           +
//         </button>
//       </div>
//       <div className="col-12 col-md-4">
//         <small className="text-muted">
//           In Words (
//           {isSafeNumber(coverage[fieldKey])
//             ? numberToWords
//                 .toWords(coverage[fieldKey])
//                 .replace(/^\w/, (c) => c.toUpperCase())
//             : "Zero"}
//           )
//         </small>
//       </div>
//     </div>
//   );

//   return (
//     <SidebarLayout>
//       <div className="customer-container d-flex flex-column p-5">
//         <div className="p-3">
//           <h6 className="mt-4 fw-bold" style={{ color: "#9b0b0b" }}>
//             Existing Coverage
//           </h6>
//           {renderNumericField(
//             "Savings / Investment Plans",
//             "savingOrInvestPlanSumAssured"
//           )}
//           {renderNumericField("Education Plans", "educationPlansSumAssured")}
//           {renderNumericField(
//             "Mortgage Protection Plans",
//             "mortgageProtectionPlansSumAssured"
//           )}

//           <h6 className="mt-4 fw-bold" style={{ color: "#9b0b0b" }}>
//             Employee Benefits
//           </h6>
//           {renderNumericField("Death in Service", "deathInServiceSumAssured")}
//           {renderNumericField("Critical Illness", "criticalIllnessSumAssured")}
//           {renderNumericField(
//             "Retirement (Annual Annuity Benefit)",
//             "retirementSumAssured"
//           )}

//           <h6 className="mt-4 fw-bold" style={{ color: "#9b0b0b" }}>
//             Health Insurance
//           </h6>
//           {renderNumericField("Critical Illness", "hospSurgicplanPlanPremium")}

//           <div className="row align-items-center my-3">
//             <div className="col-12 col-md-4">
//               Do you have Hospitalisation and Surgery Plans?
//             </div>
//             <div className="col-12 col-md-3">
//               <select
//                 className="form-select form-control"
//                 value={coverage.hospSurgicalPlanFlag}
//                 onChange={(e) =>
//                   handleChange("hospSurgicalPlanFlag", e.target.value)
//                 }
//               >
//                 <option value="">Select</option>
//                 <option value="Yes">Yes</option>
//                 <option value="No">No</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Navigation */}
//         <div className="iosfixednextprevbutton">
//           <div className="fixednextprevbutton d-flex justify-content-between">
//             <button
//               type="button"
//               className="btn btnprev"
//               onClick={() => navigate("/fnaliabilitiesdetails")}
//             >
//               Prev
//             </button>
//             <button
//               type="submit"
//               className="btn btnnext"
//               onClick={handleSubmit}
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>
//     </SidebarLayout>
//   );
// };

// export default FNA_Coverages;




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

const FNA_Coverages = () => {
  const navigate = useNavigate();

  const [coverage, setCoverage] = useState({
    savingOrInvestPlanSumAssured: 0,
    educationPlansSumAssured: 0,
    mortgageProtectionPlansSumAssured: 0,
    deathInServiceSumAssured: 0,
    criticalIllnessSumAssured: 0,
    retirementSumAssured: 0,
    hospSurgicplanPlanPremium: 0,
    hospSurgicalPlanFlag: "",
  });

  const isSafeNumber = (num) =>
    typeof num === "number" && Number.isSafeInteger(num) && num >= 0;

  const handleIncrement = (field, value) => {
    setCoverage((prev) => ({
      ...prev,
      [field]: Math.max(0, prev[field] + value),
    }));
  };

  const handleChange = (field, val) => {
    setCoverage((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  useEffect(() => {
    const fetchCoverage = async () => {
      const fnaId = sessionStorage.getItem("fnaId");
      if (!fnaId) return;

      const result = await findRecordById("al_fna_coverages", fnaId).catch(() => null);
      const insurance = result?.result?.fnaExistingInsurance;

      if (insurance && typeof insurance === "object") {
        setCoverage(insurance); // no nesting
      }
    };

    fetchCoverage();
  }, []);

  // const handleSubmit = async () => {
  //   const fna_id = sessionStorage.getItem("fnaId");
  //   const agentId = sessionStorage.getItem("agentId");
  //   const clientId = sessionStorage.getItem("clientId");

  //   if (!fna_id) {
  //     console.error("fna_id not found in session.");
  //     return;
  //   }

  //   // const coverageFields = { ...coverage };
  //   const coverageFields = {
  //     savingOrInvestPlanSumAssured: coverage.savingOrInvestPlanSumAssured,
  //     educationPlansSumAssured: coverage.educationPlansSumAssured,
  //     mortgageProtectionPlansSumAssured: coverage.mortgageProtectionPlansSumAssured,
  //     deathInServiceSumAssured: coverage.deathInServiceSumAssured,
  //     criticalIllnessSumAssured: coverage.criticalIllnessSumAssured,
  //     retirementSumAssured: coverage.retirementSumAssured,
  //     hospSurgicplanPlanPremium: coverage.hospSurgicplanPlanPremium,
  //     hospSurgicalPlanFlag: coverage.hospSurgicalPlanFlag,
  //   };

  //   try {
  //     const [
  //       existingFnaCoverages,
  //       existingFnaAssetsLiabilities,
  //       existingFnaSavingProvision,
  //       existingFnaPersons,
  //       existingFnaGoals,
  //       existingFnaIncomeExpenses,
  //       existingFNAMain,
  //     ] = await Promise.all([
  //       findRecordById("al_fna_coverages", fna_id).catch(() => null),
  //       findRecordById("al_fna_assests_liabilities", fna_id).catch(() => null),
  //       findRecordById("al_fna_saving_provision", fna_id).catch(() => null),
  //       findRecordById("al_fna_persons", fna_id).catch(() => null),
  //       findRecordById("al_fna_goals", fna_id).catch(() => null),
  //       findRecordById("al_fna_income_expenses", fna_id).catch(() => null),
  //       findRecordById("al_fna_main", fna_id).catch(() => null),
  //     ]);

  //     const dataToSave = {
  //       fna_id,
  //       fnaExistingInsurance: coverageFields, // flat object, no nesting
  //     };

  //     if (existingFnaCoverages) {
  //       await updateDetailById("al_fna_coverages", fna_id, dataToSave);
  //       console.log("FNA details updated successfully in IndexedDB!", dataToSave);
  //     } else {
  //       await saveDetail("al_fna_coverages", dataToSave);
  //       console.log("New FNA details saved successfully in IndexedDB!", dataToSave);
  //     }

  //     const mergedMainData = {
  //       ...existingFNAMain?.result,
  //       agentId,
  //       clientId,
  //       fnaPersons: existingFnaPersons?.result?.fnaPersons || {},
  //       fnaGoals: existingFnaGoals?.result?.fnaGoals || [],
  //       fnaIncomeExpenses: existingFnaIncomeExpenses?.result?.fnaIncomeExpenses || {},
  //       fnaSavingProvision: existingFnaSavingProvision?.result?.fnaSavingProvision || {},
  //       fnaAssetsLiabilities: existingFnaAssetsLiabilities?.result?.fnaAssetsLiabilities || {},
  //       fnaExistingInsurance: coverageFields, 
  //     };

  //     if (existingFNAMain) {
  //       await updateDetailById("al_fna_main", fna_id, mergedMainData);
  //     } else {
  //       await saveDetail("al_fna_main", mergedMainData);
  //     }

  //     const response = await fetch("http://192.168.2.7:4001/fnaService/saveFNAData", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         fnaMainId: fna_id,
  //         agentId,
  //         clientId,
  //         personId: existingFnaPersons?.result?.personId || "",
  //         fnaPersons: existingFnaPersons?.result?.fnaPersons || {},
  //         fnaGoals: existingFnaGoals?.result?.fnaGoals || [],
  //         fnaIncomeExpenses: existingFnaIncomeExpenses?.result?.fnaIncomeExpenses || {},
  //         fnaSavingProvision: existingFnaSavingProvision?.result?.fnaSavingProvision || {},
  //         fnaAssetsLiabilities: existingFnaAssetsLiabilities?.result?.fnaAssetsLiabilities || {},
  //         fnaExistingInsurance: coverageFields, 
  //       }),
  //     });

  //     if (!response.ok) throw new Error("Failed to save FNA data to backend.");

  //     const result = await response.json();
  //     console.log("Liabilities data posted to API:", result);
  //     navigate("/fnacalculatorsdetails", { state: { fromCoverage: true } });
  //   } catch (error) {
  //     console.error("Error saving FNA Coverage:", error);
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
        fnaExistingInsurance: {
         savingOrInvestPlanSumAssured: coverage.savingOrInvestPlanSumAssured,
      educationPlansSumAssured: coverage.educationPlansSumAssured,
      mortgageProtectionPlansSumAssured: coverage.mortgageProtectionPlansSumAssured,
      deathInServiceSumAssured: coverage.deathInServiceSumAssured,
      criticalIllnessSumAssured: coverage.criticalIllnessSumAssured,
      retirementSumAssured: coverage.retirementSumAssured,
      hospSurgicplanPlanPremium: coverage.hospSurgicplanPlanPremium,
      hospSurgicalPlanFlag: coverage.hospSurgicalPlanFlag,
        },
      };
  
      try {
        // Try to find existing FNA goal record
        let existingFnaRecord = null;
        try {
          existingFnaRecord = await findRecordById(
            "al_fna_coverages",
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
          await updateDetailById(
            "al_fna_coverages",
            fna_id,
            dataToSave
          );
          console.log(
            "FNA details updated successfully in IndexedDB!",
            dataToSave
          );
        } else {
          // Record does not exist — create new
          await saveDetail("al_fna_coverages", dataToSave);
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
                fnaExistingInsurance: dataToSave.fnaExistingInsurance,
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
       navigate("/fnacalculatorsdetails", { state: { fromCoverage: true } });
      } catch (error) {
        console.error("Error saving savings:", error.message || error);
      }
    };

  const renderNumericField = (label, fieldKey) => (
    <div className="row align-items-center my-3">
      <div className="col-12 col-md-4">{label}</div>
      <div className="col-12 col-md-4 d-flex align-items-center gap-2 fna-years">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => handleIncrement(fieldKey, -5000)}
        >
          −
        </button>
        <span>
          <input
            className="form-control form-control-sm"
            value={coverage[fieldKey]}
            onChange={(e) =>
              handleChange(fieldKey, Number(e.target.value.replace(/[^\d]/g, "")))
            }
            style={{ border: "none", textAlign: "center" }}
          />
        </span>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => handleIncrement(fieldKey, 5000)}
        >
          +
        </button>
      </div>
      <div className="col-12 col-md-4">
        <small className="text-muted">
          In Words (
          {isSafeNumber(coverage[fieldKey])
            ? numberToWords.toWords(coverage[fieldKey]).replace(/^\w/, (c) => c.toUpperCase())
            : "Zero"}
          )
        </small>
      </div>
    </div>
  );

  return (
    <SidebarLayout>
      <div className="customer-container d-flex flex-column p-5">
        <div className="p-3">
          <h6 className="mt-4 fw-bold" style={{ color: "#9b0b0b" }}>
            Existing Coverage
          </h6>
          {renderNumericField("Savings / Investment Plans", "savingOrInvestPlanSumAssured")}
          {renderNumericField("Education Plans", "educationPlansSumAssured")}
          {renderNumericField("Mortgage Protection Plans", "mortgageProtectionPlansSumAssured")}

          <h6 className="mt-4 fw-bold" style={{ color: "#9b0b0b" }}>
            Employee Benefits
          </h6>
          {renderNumericField("Death in Service", "deathInServiceSumAssured")}
          {renderNumericField("Critical Illness", "criticalIllnessSumAssured")}
          {renderNumericField("Retirement (Annual Annuity Benefit)", "retirementSumAssured")}

          <h6 className="mt-4 fw-bold" style={{ color: "#9b0b0b" }}>
            Health Insurance
          </h6>
          {renderNumericField("Hospitalisation & Surgery Premium", "hospSurgicplanPlanPremium")}

          <div className="row align-items-center my-3">
            <div className="col-12 col-md-4">
              Do you have Hospitalisation and Surgery Plans?
            </div>
            <div className="col-12 col-md-3">
              <select
                className="form-select form-control"
                value={coverage.hospSurgicalPlanFlag}
                onChange={(e) => handleChange("hospSurgicalPlanFlag", e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        <div className="iosfixednextprevbutton">
          <div className="fixednextprevbutton d-flex justify-content-between">
            <button type="button" className="btn btnprev" onClick={() => navigate("/fnaliabilitiesdetails")}>
              Prev
            </button>
            <button type="submit" className="btn btnnext" onClick={handleSubmit}>
              Next
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default FNA_Coverages;
