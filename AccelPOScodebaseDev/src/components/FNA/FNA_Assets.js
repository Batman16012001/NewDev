import React, { useEffect, useState } from "react";
import SidebarLayout from "../Dashboard/Template";
import "./FNA.css";
import { useNavigate } from "react-router-dom";
import {
  findRecordById,
  saveDetail,
  updateDetailById,
} from "../../db/indexedDB";
import numberToWords from "number-to-words";

const FNA_Assets = () => {
  const navigate = useNavigate();

  const [liquidAssets, setLiquidAssets] = useState(0);
  const [inheritance, setInheritance] = useState(0);
  const [epf, setEpf] = useState(0);
  const [investments, setInvestments] = useState(0);
  const [others, setOthers] = useState(0);

  const isSafeNumber = (num) =>
    typeof num === "number" && Number.isSafeInteger(num) && num >= 0;

  const handleIncrement = (setter, value) => {
    setter((prev) => Math.max(0, prev + value));
  };

  const totalAssets = liquidAssets + inheritance + epf + investments + others;

  useEffect(() => {
    const fnaId = sessionStorage.getItem("fnaId");
    if (!fnaId) return;

    const fetchData = async () => {
      const data = await findRecordById(
        "al_fna_assests_liabilities",
        fnaId
      ).catch(() => null);
      if (data?.result.fnaAssetsLiabilities) {
        setLiquidAssets(
          Number(data.result.fnaAssetsLiabilities.liquidAssets) || 0
        );
        setInheritance(
          Number(data.result.fnaAssetsLiabilities.inheritance) || 0
        );
        setEpf(Number(data.result.fnaAssetsLiabilities.epfAccountValue) || 0);
        setInvestments(
          Number(data.result.fnaAssetsLiabilities.investments) || 0
        );
        setOthers(Number(data.result.fnaAssetsLiabilities.others) || 0);
      }
    };

    fetchData();
  }, []);

  // const handleSubmit = async () => {
  //   const fna_id = sessionStorage.getItem("fnaId");
  //   if (!fna_id) {
  //     console.error("fna_id not found in session.");
  //     return;
  //   }

  //   const newAssets = {
  //     liquidAssets: liquidAssets,
  //     inheritance: inheritance,
  //     epfAccountValue: epf,
  //     investments: investments,
  //     others: others,
  //     totalAssets: totalAssets,
  //   };

  //   try {
  //     const existingFnaRecord = await findRecordById(
  //       "al_fna_assests_liabilities",
  //       fna_id
  //     ).catch(() => null);
  //     const existingData =
  //       existingFnaRecord?.result?.fnaAssetsLiabilities || {};

  //     const dataToSave = {
  //       fna_id,
  //       fnaAssetsLiabilities: {
  //         ...existingData,
  //         ...newAssets,
  //       },
  //     };

  //     if (existingFnaRecord?.result) {
  //       await updateDetailById(
  //         "al_fna_assests_liabilities",
  //         fna_id,
  //         dataToSave
  //       );
  //     } else {
  //       await saveDetail("al_fna_assests_liabilities", dataToSave);
  //     }

  //     // Update al_fna_main
  //     const existingMain = await findRecordById("al_fna_main", fna_id).catch(
  //       () => null
  //     );
  //     if (existingMain) {
  //       await updateDetailById("al_fna_main", fna_id, dataToSave);
  //     } else {
  //       await saveDetail("al_fna_main", dataToSave);
  //     }

  //     navigate("/fnaliabilitiesdetails");
  //   } catch (error) {
  //     console.error("Error saving assets:", error.message || error);
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
  
  //  const newAssets = {
  //     liquidAssets: liquidAssets,
  //     inheritance: inheritance,
  //     epfAccountValue: epf,
  //     investments: investments,
  //     others: others,
  //     totalAssets: totalAssets,
  //   };
  
  //   try {
  //   const [
  //     existingFnaAssestsLiabilities,
  //     existingFnaSavingProvision,
  //     existingFnaPersons,
  //     existingFnaGoals,
  //     existingFnaIncomeExpenses,
  //     existingFNAMain
  //   ] = await Promise.all([
  //     findRecordById("al_fna_assests_liabilities", fna_id).catch(() => null),
  //     findRecordById("al_fna_saving_provision", fna_id).catch(() => null),
  //     findRecordById("al_fna_persons", fna_id).catch(() => null),
  //     findRecordById("al_fna_goals", fna_id).catch(() => null),
  //     findRecordById("al_fna_income_expenses", fna_id).catch(() => null),
  //     findRecordById("al_fna_main", fna_id).catch(() => null),
  //   ]);

  //   const existingAssetLiabilityData = existingFnaAssestsLiabilities?.result?.fnaAssetsLiabilities || {};

  //   const mergedAssetsLiabilities = {
  //     ...existingAssetLiabilityData,
  //     ...newAssets,
  //   };

  //   const assetsDataToSave = {
  //     fna_id,
  //     fnaAssetsLiabilities: mergedAssetsLiabilities,
  //   };

  //   // Save/update assets in al_fna_assests_liabilities
  //   if (existingFnaAssestsLiabilities?.result) {
  //     await updateDetailById("al_fna_assests_liabilities", fna_id, assetsDataToSave);
  //   } else {
  //     await saveDetail("al_fna_assests_liabilities", assetsDataToSave);
  //   }

  //   // Update al_fna_main
  //   const mergedMainData = {
  //     ...existingFNAMain?.result,
  //     agentId,
  //     clientId,
  //     fnaPersons: existingFnaPersons?.result?.fnaPersons || {},
  //     fnaGoals: existingFnaGoals?.result?.fnaGoals || [],
  //     fnaIncomeExpenses: existingFnaIncomeExpenses?.result?.fnaIncomeExpenses || {},
  //     fnaSavingProvision: existingFnaSavingProvision?.result?.fnaSavingProvision || {},
  //     fnaAssetsLiabilities: mergedAssetsLiabilities,
  //   };

  //   if (existingFNAMain) {
  //     await updateDetailById("al_fna_main", fna_id, mergedMainData);
  //   } else {
  //     await saveDetail("al_fna_main", mergedMainData);
  //   }

  //   // API Call
  //   try {
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
  //         fnaAssetsLiabilities: mergedAssetsLiabilities,
  //       }),
  //     });

  //     if (!response.ok) throw new Error("Failed to save FNA data to backend.");
  //     const result = await response.json();
  //     console.log("Assets data posted to API:", result);
  //   } catch (apiError) {
  //     console.error("API call failed:", apiError);
  //   }

  //   navigate("/fnaliabilitiesdetails");
  // } catch (error) {
  //   console.error("Error saving assets:", error.message || error);
  // }
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
        fnaAssetsLiabilities: {
          liquidAssets: liquidAssets,
      inheritance: inheritance,
      epfAccountValue: epf,
      investments: investments,
      others: others,
      totalAssets: totalAssets,
        },
      };
  
      try {
        // Try to find existing FNA goal record
        let existingFnaRecord = null;
        try {
          existingFnaRecord = await findRecordById(
            "al_fna_assests_liabilities",
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
          await updateDetailById("al_fna_assests_liabilities", fna_id, dataToSave);
          console.log(
            "FNA details updated successfully in IndexedDB!",
            dataToSave
          );
        } else {
          // Record does not exist — create new
          await saveDetail("al_fna_assests_liabilities", dataToSave);
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
                fnaAssetsLiabilities: dataToSave.fnaAssetsLiabilities,
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
        navigate("/fnaliabilitiesdetails");
      } catch (error) {
        console.error("Error saving savings:", error.message || error);
      }
    };

  const renderAssetField = (label, value, setter) => (
    <div className="row align-items-center my-3">
      <div className="col-12 col-md-4">{label}</div>
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
  );

  return (
    <SidebarLayout>
      <div className="customer-container d-flex flex-column p-5">
        <div className="p-3">
          {renderAssetField(
            "Assets that can be liquidated",
            liquidAssets,
            setLiquidAssets
          )}
          {renderAssetField("Inheritance", inheritance, setInheritance)}
          {renderAssetField("EPF account value", epf, setEpf)}
          {renderAssetField("Investments", investments, setInvestments)}
          {renderAssetField("Others", others, setOthers)}

          {/* Total Assets */}
          <div className="row align-items-center my-3">
            <div className="col-12 col-md-4">Total Assets</div>
            <div className="col-12 col-md-4 fw-bold">
              Rs. {totalAssets.toLocaleString()}
            </div>
            <div className="col-12 col-md-4">
              <small className="text-muted">
                In Words (
                {isSafeNumber(totalAssets)
                  ? numberToWords
                      .toWords(totalAssets)
                      .replace(/^\w/, (c) => c.toUpperCase())
                  : "Zero"}
                )
              </small>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="iosfixednextprevbutton">
          <div className="fixednextprevbutton d-flex justify-content-between">
            <button
              type="button"
              className="btn btnprev"
              onClick={() => navigate("/fnaprovisionsdetails")}
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
      </div>
    </SidebarLayout>
  );
};

export default FNA_Assets;
