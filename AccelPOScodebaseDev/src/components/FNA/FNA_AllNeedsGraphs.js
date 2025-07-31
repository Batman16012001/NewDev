// import React, { useState, useEffect } from "react";
// import FNA_YourNeeds from "./FNA_YourNeeds";
// import SidebarLayout from "../Dashboard/Template";
// import { Button } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";

// const FNA_AllNeedsGraphs = () => {
//  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
//   const navigate = useNavigate();


//   const protectionData = {
//     amnt_required_per_child: 300000,
//     total_liabilities: 600000,
//     total_savings: 200000,
//     total_assets: 160000,
//     death_in_service_sumassured: 150000,
//     mortgage_protection_plans_sumassured: 50000,
//     est_amnt_coverage_req: 1939636,
//   };

//   const educationData = {
//     amnt_reqd_child_edu: 6000000,
//     est_annual_sav_reqd_child: 5000000,
//     curr_ann_cash_sav_child: 1000000,
//     final_est_ann_cash_sav_reqd: 5620330,
//   };

//   const healthData = {
//     est_crit_illness_coverage_reqd: 600000,
//     existing_crit_illness_coverage: 218220,
//     final_est_crit_illness_coverage_reqd: 381780,
//   };

//   const retirementData = {
//     amnt_reqd_retirement: 1000000,
//     epf_acc_full_ret_withdrawal: 250000,
//     income_from_ann_annuity: 250000,
//     income_from_non_annuity_srces: 250000,
//     amnt_req_today: 250000,
//     final_est_retire_fund_reqd: 0, // so the button will be disabled
//   };

//   return (
//     <SidebarLayout>
//       <div className="customer-container px-4 py-6">
//         <FNA_YourNeeds
//           goalKey="protection"
//           label="Your Protection Gap is"
//           data={protectionData}
//         />
//         <FNA_YourNeeds
//           goalKey="eductaion"
//           label="Your Education & Savings Gap is"
//           data={educationData}
//         />
//         <FNA_YourNeeds
//           goalKey="health"
//           label="Your Health Gap is"
//           data={healthData}
//         />
//         <FNA_YourNeeds
//           goalKey="retirement"
//           label="Your Retirement Gap is"
//           data={retirementData}
//         />

//          {/* Prev / Next Buttons */}
//         {!isKeyboardVisible && (
//           <div className="iosfixednextprevbutton">
//             <div className="fixednextprevbutton d-flex justify-content-between mt-4">
//               <Button
//                 type="button"
//                 className="btn btnprev"
//                 onClick={() => navigate("/fnasignature")}
//               >
//                 Prev
//               </Button>

//               <Button
//                 type="submit"
//                 className="btn btnnext"
//                  onClick={() => navigate("/fnasignature")}
//               >
//                 Next
//               </Button>
//             </div>
//           </div>
//         )}

//       </div>
//     </SidebarLayout>
//   );
// };

// export default FNA_AllNeedsGraphs;




import React, { useState, useEffect } from "react";
import FNA_YourNeeds from "./FNA_YourNeeds";
import SidebarLayout from "../Dashboard/Template";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  saveDetail,
  findRecordById,
  updateDetailById,
} from "../../db/indexedDB"; 

const FNA_AllNeedsGraphs = () => {
  const [fnaData, setFnaData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fnaId = sessionStorage.getItem("fnaId");
    if (!fnaId) return;

    findRecordById("al_fna_main", fnaId).then((data) => {
      if (data) {
        const insurance = data.fnaExistingInsurance || {};
        const calculators = data.fnaCalculators || [];

        const getCalcValue = (type, key) => {
          const obj = calculators.find((c) => c.calculatorType === type);
          return obj?.[key] ? parseFloat(obj[key]) : 0;
        };

        const protectionData = {
          amnt_required_per_child: 0,
          total_liabilities: parseFloat(data.fnaAssetsLiabilities?.totalLiabilities || 0),
          total_savings: parseFloat(data.fnaIncomeExpenses?.regCashSaving || 0),
          total_assets: parseFloat(data.fnaAssetsLiabilities?.totalAssets || 0),
          death_in_service_sumassured: parseFloat(insurance?.deathService || 0),
          mortgage_protection_plans_sumassured: parseFloat(insurance?.mortgagePlan || 0),
          est_amnt_coverage_req: getCalcValue("protection_calc", "ActualCorpusRequiredForGoal"),
        };

        const educationData = {
          amnt_reqd_child_edu: getCalcValue("education_calc", "futureCostOfGoal"),
          est_annual_sav_reqd_child: getCalcValue("education_calc", "ActualCorpusRequiredForGoal"),
          curr_ann_cash_sav_child: parseFloat(insurance?.educationPlan || 0),
          final_est_ann_cash_sav_reqd: getCalcValue("education_calc", "ActualCorpusRequiredForGoal"),
        };

        const healthData = {
          est_crit_illness_coverage_reqd: getCalcValue("health_calc", "ActualCorpusRequiredForGoal"),
          existing_crit_illness_coverage:
            parseFloat(insurance?.healthCriticalIllness || 0) +
            parseFloat(insurance?.empCriticalIllness || 0),
          final_est_crit_illness_coverage_reqd: getCalcValue("health_calc", "ActualCorpusRequiredForGoal"),
        };

        const retirementData = {
          amnt_reqd_retirement: getCalcValue("retirement_calc", "futureCostOfGoal"),
          epf_acc_full_ret_withdrawal: parseFloat(data.fnaAssetsLiabilities?.epfAccountValue || 0),
          income_from_ann_annuity: parseFloat(insurance?.retirementAnnuity || 0),
          income_from_non_annuity_srces: parseFloat(data.fnaIncomeExpenses?.monthlyIncomeRetire || 0),
          amnt_req_today: getCalcValue("retirement_calc", "amountRequiredToday"),
          final_est_retire_fund_reqd: getCalcValue("retirement_calc", "ActualCorpusRequiredForGoal"),
        };

        setFnaData({
          protectionData,
          educationData,
          healthData,
          retirementData,
        });
      }
    });
  }, []);

  if (!fnaData) {
    return <div className="text-center mt-5">Loading FNA Needs Data...</div>;
  }

  const { protectionData, educationData, healthData, retirementData } = fnaData;

  return (
    <SidebarLayout>
      <div className="customer-container px-4 py-6">
        <FNA_YourNeeds
          goalKey="protection"
          label="Your Protection Gap is"
          data={protectionData}
        />
        <FNA_YourNeeds
          goalKey="eductaion"
          label="Your Education & Savings Gap is"
          data={educationData}
        />
        <FNA_YourNeeds
          goalKey="health"
          label="Your Health Gap is"
          data={healthData}
        />
        <FNA_YourNeeds
          goalKey="retirement"
          label="Your Retirement Gap is"
          data={retirementData}
        />

        <div className="iosfixednextprevbutton">
          <div className="fixednextprevbutton d-flex justify-content-between mt-4">
            <Button
              type="button"
              className="btn btnprev"
              onClick={() => navigate("/fnasignature")}
            >
              Prev
            </Button>

            <Button
              type="submit"
              className="btn btnprev"
              onClick={() => navigate("/fnasignature")}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default FNA_AllNeedsGraphs;
