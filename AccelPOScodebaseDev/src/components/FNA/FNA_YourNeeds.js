// import React, { useState, useEffect } from "react";
// import { Bar, Pie, Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
//   Legend,
//   ArcElement,
//   PointElement,
//   LineElement,
// } from "chart.js";

// ChartJS.register(
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
//   Legend,
//   ArcElement,
//   PointElement,
//   LineElement
// );

// const FNA_YourNeeds = ({ goalKey = "protection", label, data }) => {
//   const [showChart, setShowChart] = useState(false);
//   const [chartData, setChartData] = useState(null);
//   const [chartType, setChartType] = useState("");
//   const [finalGapAmount, setFinalGapAmount] = useState("");

//   useEffect(() => {
//     if (data) {
//       generateChartData(goalKey, data);
//     }
//   }, [goalKey, data]);

//   const generateChartData = (key, data) => {
//     if (key === "protection") {
//       const amountReq = Math.round(
//         +data.amnt_required_per_child + +data.total_liabilities
//       );
//       const amountAvailable = Math.round(
//         +data.total_savings + +data.total_assets
//       );
//       const existingInsurance = Math.round(+data.death_in_service_sumassured);
//       const mortgage = Math.round(+data.mortgage_protection_plans_sumassured);
//       const finalOutput = Math.round(+data.est_amnt_coverage_req || 0);

//       setFinalGapAmount(finalOutput);

//       setChartData({
//         labels: [
//           "Self/Family + Liabilities",
//           "Savings & Assets",
//           "Existing Insurance",
//           "Mortgage Protection",
//           "Final Estimated Amount",
//         ],
//         datasets: [
//           {
//             label: "Amount (Rs)",
//             data: [
//               amountReq,
//               amountAvailable,
//               existingInsurance,
//               mortgage,
//               finalOutput,
//             ],
//             backgroundColor: "#e81c23",
//           },
//         ],
//       });
//       setChartType("bar");
//     } else if (key === "eductaion") {
//       setFinalGapAmount(data.final_est_ann_cash_sav_reqd);
//       setChartData({
//         labels: [
//           "Total Required for Education",
//           "Estimated in Today’s Money",
//           "Current Education Plans",
//           "Final Estimated Savings Required",
//         ],
//         datasets: [
//           {
//             data: [
//               +data.amnt_reqd_child_edu,
//               +data.est_annual_sav_reqd_child,
//               +data.curr_ann_cash_sav_child,
//               +data.final_est_ann_cash_sav_reqd,
//             ],
//             backgroundColor: ["#e81c23", "#4caf50", "#9e9e9e", "#ffeb3b"],
//           },
//         ],
//       });
//       setChartType("pie");
//     } else if (key === "health") {
//       setFinalGapAmount(data.final_est_crit_illness_coverage_reqd);
//       setChartData({
//         labels: [
//           "Estimated Critical Illness Cover",
//           "Existing Coverage",
//           "Final Estimated Requirement",
//         ],
//         datasets: [
//           {
//             label: "Amount (Rs)",
//             data: [
//               +data.est_crit_illness_coverage_reqd,
//               +data.existing_crit_illness_coverage,
//               +data.final_est_crit_illness_coverage_reqd,
//             ],
//             borderColor: "#e81c23",
//             backgroundColor: "rgba(255,99,132,0.2)",
//             fill: true,
//             tension: 0.4,
//           },
//         ],
//       });
//       setChartType("line");
//     } else if (key === "retirement") {
//       setFinalGapAmount(data.final_est_retire_fund_reqd);
//       setChartData({
//         labels: [
//           "Total Required at Retirement",
//           "EPF Withdrawal",
//           "Annuity Income",
//           "Non-Annuity Income",
//           "Required Today",
//           "Final Retirement Fund",
//         ],
//         datasets: [
//           {
//             data: [
//               +data.amnt_reqd_retirement,
//               +data.epf_acc_full_ret_withdrawal,
//               +data.income_from_ann_annuity,
//               +data.income_from_non_annuity_srces,
//               +data.amnt_req_today,
//               +data.final_est_retire_fund_reqd,
//             ],
//             backgroundColor: [
//               "#F7464A",
//               "#46BFBD",
//               "#FDB45C",
//               "#949FB1",
//               "#4D5360",
//               "#ff9966",
//             ],
//           },
//         ],
//       });
//       setChartType("pie");
//     }
//   };

//   const renderChart = () => {
//     if (!chartData) return null;
//     if (chartType === "bar") return <Bar data={chartData} />;
//     if (chartType === "line") return <Line data={chartData} />;
//     if (chartType === "pie") return <Pie data={chartData} />;
//   };
//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//   };

//   return (
//     <div className="bg-white border rounded p-4 mb-4 shadow-sm">
//       <div className="flex justify-between items-center">
//         <p className="text-lg font-medium text-gray-800">
//           {label} Rs. {Number(finalGapAmount || 0).toLocaleString()}
//         </p>
//         <button
//           className={`flex items-center gap-2 px-4 py-2  text-sm rounded ${
//             finalGapAmount > 0 ? "" : "bg-gray-400 cursor-not-allowed"
//           }`}
//           style={
//             finalGapAmount > 0
//               ? { backgroundColor: "#800000", color: "white" }
//               : {}
//           }
//           disabled={finalGapAmount <= 0}
//           onClick={() => setShowChart((prev) => !prev)}
//         >
//           <img
//             src="https://img.icons8.com/ios-filled/20/ffffff/combo-chart--v1.png"
//             alt="Chart Icon"
//           />

//           <span className="ml-2">
//             {showChart ? "Hide Graph" : "Graphical View"}
//           </span>
//         </button>
//       </div>

//       {showChart && (
//         <div className="mt-6 flex justify-center">
//           <div
//             className="w-full"
//             style={{
//               maxWidth: "500px",
//               height: "350px",
//             }}
//           >
//             {chartType === "bar" && (
//               <Bar data={chartData} options={chartOptions} />
//             )}
//             {chartType === "line" && (
//               <Line data={chartData} options={chartOptions} />
//             )}
//             {chartType === "pie" && (
//               <Pie data={chartData} options={chartOptions} />
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FNA_YourNeeds;



// Updated FNA_YourNeeds.js (only the new section added below chart)

import React, { useState, useEffect } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const FNA_YourNeeds = ({ goalKey , label, data }) => {
  const [showChart, setShowChart] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [chartType, setChartType] = useState("");
  const [finalGapAmount, setFinalGapAmount] = useState("");

  useEffect(() => {
    if (data) {
      generateChartData(goalKey, data);
      console.log("goalKey:", goalKey);
      console.log("data:", data);
      
    }
  }, [goalKey, data]);

 const generateChartData = (key, data) => {
  if (key === "protection") {
    const amountReq = Math.round(+data.amnt_required_per_child + +data.total_liabilities);
    const amountAvailable = Math.round(+data.total_savings + +data.total_assets);
    const existingInsurance = Math.round(+data.death_in_service_sumassured);
    const mortgage = Math.round(+data.mortgage_protection_plans_sumassured);
    const finalOutput = Math.round(+data.est_amnt_coverage_req || 0);

    setFinalGapAmount(finalOutput);
    setChartData({
      labels: [
        "Self/Family + Liabilities",
        "Savings & Assets",
        "Existing Insurance",
        "Mortgage Protection",
        "Final Estimated Amount",
      ],
      datasets: [
        {
          label: "Amount (Rs)",
          data: [amountReq, amountAvailable, existingInsurance, mortgage, finalOutput],
          backgroundColor: "#e81c23",
        },
      ],
    });
    setChartType("bar");
  }

  if (key === "eductaion") {
    const amountRequired = Math.round(+data.total_amount_required_all_children);
    const todaysMoney = Math.round(+data.est_amount_today);
    const currentPlans = Math.round(+data.curr_education_plans || 0);
    const finalOutput = Math.round(+data.final_cash_saving_required || 0);

    setFinalGapAmount(finalOutput);
    setChartData({
      labels: [
        "Amount Required (All Children)",
        "Today's Money Equivalent",
        "Current Education Plans",
        "Final Annual Cash Saving Required",
      ],
      datasets: [
        {
          label: "Amount (Rs)",
          data: [amountRequired, todaysMoney, currentPlans, finalOutput],
          backgroundColor: "#00a3e0",
        },
      ],
    });
    setChartType("bar");
  }

  if (key === "health") {
    const estimatedCoverage = Math.round(+data.estimated_critical_illness_coverage);
    const existingCoverage = Math.round(+data.existing_critical_illness_coverage);
    const finalOutput = Math.round(+data.final_critical_illness_coverage_req || 0);

    setFinalGapAmount(finalOutput);
    setChartData({
      labels: [
        "Estimated CI Coverage",
        "Existing CI Coverage",
        "Final Estimated CI Coverage Required",
      ],
      datasets: [
        {
          label: "Amount (Rs)",
          data: [estimatedCoverage, existingCoverage, finalOutput],
          backgroundColor: "#1cc88a",
        },
      ],
    });
    setChartType("bar");
  }

  if (key === "retirement") {
    const totalRequired = Math.round(+data.total_amt_required_with_inflation);
    const epf = Math.round(+data.epf_withdrawal);
    const annuity = Math.round(+data.income_from_annual_annuity);
    const nonAnnuity = Math.round(+data.income_from_non_annuity_sources);
    const amountToday = Math.round(+data.amount_req_today_to_meet_above);
    const finalOutput = Math.round(+data.final_est_retirement_coverage_required || 0);

    setFinalGapAmount(finalOutput);
    setChartData({
      labels: [
        "Total Amount Required (Inflated)",
        "EPF Withdrawal",
        "Annual Annuity Income",
        "Non-Annuity Sources",
        "Amount Required Today",
        "Final Retirement Coverage Required",
      ],
      datasets: [
        {
          label: "Amount (Rs)",
          data: [totalRequired, epf, annuity, nonAnnuity, amountToday, finalOutput],
          backgroundColor: "#f6c23e",
        },
      ],
    });
    setChartType("bar");
  }
};


  const renderChart = () => {
    if (!chartData) return null;
    if (chartType === "bar") return <Bar data={chartData} />;
    if (chartType === "line") return <Line data={chartData} />;
    if (chartType === "pie") return <Pie data={chartData} />;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  const renderDetails = () => {
    switch (goalKey) {
      case "protection":
        return (
          <>
            <h5 className="mt-4">Life Insurance Planning</h5>
            <table className="table table-bordered table-sm">
              <tbody>
                <tr>
                  <th>Details</th>
                  <th>Rs.</th>
                </tr>
                <tr>
                  <td>Amount required for provision for self/family and liabilities</td>
                  <td>Rs. {Number(data.total_liabilities).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Less: Amount available from savings and assets</td>
                  <td>Rs. {Number(data.total_savings + data.total_assets).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Less: Existing Life Insurance coverage</td>
                  <td>Rs. {Number(data.death_in_service_sumassured).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Less: Mortgage Protection coverage</td>
                  <td>Rs. {Number(data.mortgage_protection_plans_sumassured).toLocaleString()}</td>
                </tr>
                <tr className="table-active">
                  <td>Final estimated amount of coverage required</td>
                  <td>Rs. {Number(data.est_amnt_coverage_req).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </>
        );
      // Add cases for 'education', 'health', 'retirement' as needed...
      default:
        return null;
    }
  };

  return (
    <div className="row bg-white border rounded p-4 mb-4 shadow-sm">
      <div className="col-sm-12 col-12 d-flex justify-content-between align-items-center">
        <p className="mb-0 fw-bold">
          {label} Rs. {Number(finalGapAmount || 0).toLocaleString()}
        </p>
        <button
          className={`btn btn-sm ${finalGapAmount > 0 ? "btn-danger" : "btn-secondary"}`}
          disabled={finalGapAmount <= 0}
          onClick={() => setShowChart((prev) => !prev)}
        >
          {showChart ? "Hide Graph" : "Graphical View"}
        </button>
      </div>

      {showChart && (
  <>
    <div className="col-sm-6 col-6  mt-6 flex justify-center">
      <div
        className="w-full"
        style={{
          maxWidth: "500px",
          height: "350px",
        }}
      >
        {chartType === "bar" && <Bar data={chartData} options={chartOptions} />}
        {chartType === "line" && <Line data={chartData} options={chartOptions} />}
        {chartType === "pie" && <Pie data={chartData} options={chartOptions} />}
      </div>
    </div>

    {/* LIFE PLANNING DETAILS */}
    <div className="col-sm-6 col-6 mt-3 p-3 border rounded bg-gray-50 shadow-sm">
      <h4 className="text-md font-semibold mb-3 text-gray-700">Details</h4>
      <table className="table-auto w-full text-sm custom-goal-table">
        <tbody>
          {goalKey === "protection" && (
            <>
           
              <tr >
                <td className="py-1 font-medium" >Amount required for provision for self/family and outstanding liabilities:</td>
                <td>Rs. 3,302,566</td>
              </tr>
               
              <tr>
                <td className="py-1 font-medium">Less: Amount available from savings and assets:</td>
                <td>Rs. 15,000</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Less: Existing Life Insurance coverage:</td>
                <td>Rs. 0</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Less: Mortgage Protection coverage:</td>
                <td>Rs. 0</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Final estimated amount of coverage required:</td>
                <td>Rs. 3,287,566</td>
              </tr>
            </>
          )}

          {goalKey === "eductaion" && (
            <>
              <tr>
                <td className="py-1 font-medium">Amount required for all Children Education when they enter Uni:</td>
                <td>Rs. 5,625,330</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Estimated amount required in today’s money:</td>
                <td>Rs. 5,625,330</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Less: Current Education Plans:</td>
                <td>Rs. 0</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Final estimated annual cash savings required:</td>
                <td>Rs. 5,625,330</td>
              </tr>
            </>
          )}

          {goalKey === "health" && (
            <>
              <tr>
                <td className="py-1 font-medium">Estimated Critical Illness coverage required:</td>
                <td>Rs. 38,181,780</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Less: Existing Critical Illness coverage:</td>
                <td>Rs. 5,000</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Final estimated critical illness coverage required:</td>
                <td>Rs. 38,176,780</td>
              </tr>
            </>
          )}

          {goalKey === "retirement" && (
            <>
              <tr>
                <td className="py-1 font-medium">Total Amount Required at retirement with inflation:</td>
                <td>Rs. 1,000,000</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Less: EPF Withdrawal:</td>
                <td>Rs. 250,000</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Less: Income from annual annuity:</td>
                <td>Rs. 250,000</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Less: Income from non-annuity sources:</td>
                <td>Rs. 250,000</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Amount required today to meet above:</td>
                <td>Rs. 250,000</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">Final estimated retirement coverage required:</td>
                <td>Rs. 0</td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  </>
)}

    </div>
  );
};

export default FNA_YourNeeds;
