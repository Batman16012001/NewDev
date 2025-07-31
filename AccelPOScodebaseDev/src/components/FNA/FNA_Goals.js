// import React, { useState, useEffect } from "react";
// import SidebarLayout from "../../components/Dashboard/Template";
// import {
//   findRecordById,
//   saveDetail,
//   updateDetailById,
// } from "../../db/indexedDB";
// import "./FNA.css";
// import { useNavigate } from "react-router-dom";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { Modal, Button } from "react-bootstrap";
// import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

// const goalDefn = [
//   {
//     key: "Children Education",
//     label: "Children Education",
//     lifeStages: ["married", "widowed", "divorced"],
//   },
//   {
//     key: "Retirement Planning",
//     label: "Retirement Planning",
//     lifeStages: ["single", "married", "widowed", "divorced"],
//   },
//   {
//     key: "Wealth Planning",
//     label: "Wealth Planning",
//     lifeStages: ["single", "married", "widowed", "divorced"],
//   },
//   {
//     key: "Health & Life Style",
//     label: "Health & Lifestyle",
//     lifeStages: ["single", "married", "widowed", "divorced"],
//   },
//   {
//     key: "Protection Plan",
//     label: "Protection Plan",
//     lifeStages: ["single", "married", "widowed", "divorced"],
//   },
//   {
//     key: "Marraige",
//     label: "Marraige",
//     lifeStages: ["single"],
//   },
// ];

// const FNA_Goals = () => {
//   const [goals, setGoals] = useState({});
//   const [priorities, setPriorities] = useState({});
//   const [yearsToGoal, setYearsToGoal] = useState({});
//   const [maritalStatus, setMaritalStatus] = useState("");
//   const [error, setError] = useState("");
//   const [age, setAge] = useState(null);
//   const [desiredRetirementAge, setDesiredRetirementAge] = useState(null);
//   const [lifeExpectancy, setLifeExpectancy] = useState(null);
//   const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
//   const navigate = useNavigate();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [message, setMessage] = useState("");
//   const isNewCustomer = sessionStorage.getItem("isNewCustomer");

//   const getAutoYearsToGoal = (goalKey) => {
//     const currentAge = age || 0;
//     const retirement = desiredRetirementAge || 55;
//     const expectancy = lifeExpectancy || 75;

//     switch (goalKey) {
//       case "Children Education":
//         return 12;
//       case "Retirement Planning":
//         return Math.max(retirement - currentAge, 0);
//       case "Wealth Planning":
//         return 30;
//       case "Health & Life Style":
//       case "Marraige":
//         return 5;
//       case "Protection Plan":
//         return Math.max(expectancy - currentAge, 0);
//       default:
//         return 0;
//     }
//   };

//   useEffect(() => {
//     const fetchAllData = async () => {
//       const fnaMainId = sessionStorage.getItem("fnaId");
//       if (!fnaMainId) return;

//       // Fetch personal details from al_fna_persons
//       const personData = await findRecordById("al_fna_persons", fnaMainId);
//       if (personData?.result.fnaPersons) {
//         const person = personData.result.fnaPersons;
//         setMaritalStatus(person.maritalStatus || "");
//         setAge(parseInt(person.age));
//         if (person.desiredRetirementAge) {
//           setDesiredRetirementAge(parseInt(person.desiredRetirementAge));
//         }
//         if (person.lifeExpectancy) {
//           setLifeExpectancy(parseInt(person.lifeExpectancy));
//         }
//       }

//       // Fetch goals data from al_fna_goals
//       const fnaData = await findRecordById("al_fna_goals", fnaMainId).catch(
//         (err) => {
//           console.warn("Could not find al_fna_goals with ID:", fnaMainId);
//           return null;
//         }
//       );

//       if (fnaData?.result?.fnaGoals && Array.isArray(fnaData.result.fnaGoals)) {
//         const restoredGoals = {};
//         const restoredPriorities = {};
//         const restoredYearsToGoal = {};

//         fnaData.result.fnaGoals.forEach((goal) => {
//           const key = goal.goalDescription;
//           if (key) {
//             restoredGoals[key] = true;
//             restoredPriorities[key] = parseInt(goal.goalPriority) || 1;
//             restoredYearsToGoal[key] = parseInt(goal.goalTimeHorizon) || 0;
//           }
//         });

//         setGoals(restoredGoals);
//         setPriorities(restoredPriorities);
//         setYearsToGoal(restoredYearsToGoal);
//       } else {
//         // If no data, show blank fields
//         setGoals({});
//         setPriorities({});
//         setYearsToGoal({});
//       }
//     };

//     fetchAllData();
//   }, []);

//   const handleGoalToggle = (key) => {
//     setGoals((prev) => {
//       const updated = { ...prev, [key]: !prev[key] };

//       if (!prev[key]) {
//         setPriorities((p) => ({ ...p, [key]: 1 }));
//         setYearsToGoal((y) => ({ ...y, [key]: getAutoYearsToGoal(key, age) }));
//       } else {
//         const { [key]: _, ...restP } = priorities;
//         const { [key]: __, ...restY } = yearsToGoal;
//         setPriorities(restP);
//         setYearsToGoal(restY);
//       }

//       return updated;
//     });
//   };

//   const validateGoals = () => {
//     const selectedGoals = Object.keys(goals).filter((key) => goals[key]);

//     if (selectedGoals.length === 0) {
//       setMessage("Please select at least one goal setting.");
//       setIsModalOpen(true);
//       return true; //  Return true to indicate a validation error
//     }

//     const prioritiesUsed = selectedGoals.map((key) => priorities[key]);
//     const uniquePriorities = new Set(prioritiesUsed);

//     if (uniquePriorities.size < prioritiesUsed.length) {
//       setMessage("Please assign a unique priority to each goal.");
//       setIsModalOpen(true);
//       return true;
//     }

//     const hasZeroYears = selectedGoals.some(
//       (key) => yearsToGoal[key] === 0 || yearsToGoal[key] === undefined
//     );

//     if (hasZeroYears) {
//       setMessage("Please assign a valid number of years to each goal.");
//       setIsModalOpen(true);
//       return true;
//     }

//     return false; //  Validation passed
//   };

//   const handleSubmit = async () => {
//     const hasError = validateGoals();
//     if (hasError) return;
//     const fna_id = sessionStorage.getItem("fnaId");
//     const agentId = sessionStorage.getItem("agentId");
//       const clientId = sessionStorage.getItem("clientId");
//       const personId = sessionStorage.getItem("person_id");
//     console.log("fna_id found in session:", fna_id);

//     if (!fna_id) {
//       console.error("fna_id not found in session.");
//       return;
//     }

//     const selectedGoals = Object.keys(goals).filter((key) => goals[key]);

//     const detailedGoals = selectedGoals.map((key) => ({
//       goalDescription: key,
//       goalPriority: priorities[key]?.toString() || "",
//       goalTimeHorizon: yearsToGoal[key]?.toString() || "",
//     }));

//     const dataToSave = {
//       fna_id,
//       fnaGoals: detailedGoals,
//     };

//     try {
//       // Try to find existing FNA goal record
//       let existingFnaRecord = null;
//       try {
//         existingFnaRecord = await findRecordById("al_fna_goals", fna_id);
//       } catch (innerError) {
//         console.warn(
//           "No existing FNA goal record found. A new one will be saved."
//         );
//       }

//       let existingFNAMain;
//       try {
//         existingFNAMain = await findRecordById("al_fna_main", fna_id);
//       } catch (error) {
//         console.warn("No existing FNA main record found, proceeding to save.");
//         existingFNAMain = null;
//       }

//       if (existingFnaRecord?.result) {
//         // Record exists — update
//         await updateDetailById("al_fna_goals", fna_id, dataToSave);
//         console.log(
//           "FNA details updated successfully in IndexedDB!",
//           dataToSave
//         );
//       } else {
//         // Record does not exist — create new
//         await saveDetail("al_fna_goals", dataToSave);
//         console.log(
//           "New FNA details saved successfully in IndexedDB!",
//           dataToSave
//         );
//       }

//       // Save or update `al_fna_main`
//       if (existingFNAMain) {
//         await updateDetailById("al_fna_main", fna_id, dataToSave);
//         console.log("Updated FNA main record in IndexedDB");
//       } else {
//         await saveDetail("al_fna_main", dataToSave);
//         console.log("Saved new FNA main record in IndexedDB");
//       }

//       try {
//         const response = await fetch(
//           "http://192.168.2.7:4001/fnaService/saveFNAData",
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                fnaMainId: fna_id,
//               agentId,
//               clientId,
//               personId,
//               fnaGoals: dataToSave.fnaGoals,
//             }),
//           }
//         );

//         if (!response.ok) {
//           throw new Error("Failed to save FNA data to backend.");
//         }

//         const result = await response.json();
//         console.log("FNA data saved to API:", result);
//       } catch (error) {
//         console.error("API call failed:", error);
//       }
//       navigate("/fnaincomedetails");
//     } catch (error) {
//       console.error(
//         "Error saving/updating FNA details:",
//         error.message || error
//       );
//     }
//   };

// //   const handleSubmit = async () => {
// //   const hasError = validateGoals();
// //   if (hasError) return;

// //   const fna_id = sessionStorage.getItem("fnaId");
// //   const agentId = sessionStorage.getItem("agentId");
// //   const clientId = sessionStorage.getItem("clientId");

// //   if (!fna_id) {
// //     console.error("fna_id not found in session.");
// //     return;
// //   }

// //   const selectedGoals = Object.keys(goals).filter((key) => goals[key]);

// //   const detailedGoals = selectedGoals.map((key) => ({
// //     goalDescription: key,
// //     goalPriority: priorities[key]?.toString() || "",
// //     goalTimeHorizon: yearsToGoal[key]?.toString() || "",
// //   }));

// //   const dataToSave = {
// //     fna_id,
// //     fnaGoals: detailedGoals,
// //   };

// //   try {
// //     let existingFnaRecord = await findRecordById("al_fna_goals", fna_id).catch(() => null);
// //     let existingFNAMain = await findRecordById("al_fna_main", fna_id).catch(() => null);
// //     let existingFnaPersons = await findRecordById("al_fna_persons", fna_id).catch(() => null);

// //     // Save/update goals in local DB
// //     if (existingFnaRecord?.result) {
// //       await updateDetailById("al_fna_goals", fna_id, dataToSave);
// //     } else {
// //       await saveDetail("al_fna_goals", dataToSave);
// //     }

// //     // Merge and update main FNA record
// //     const mergedMainData = {
// //       ...existingFNAMain?.result,
// //       ...dataToSave,
// //       fnaPersons: existingFnaPersons?.result?.fnaPersons || {},
// //       agentId,
// //       clientId,
// //     };

// //     if (existingFNAMain) {
// //       await updateDetailById("al_fna_main", fna_id, mergedMainData);
// //     } else {
// //       await saveDetail("al_fna_main", mergedMainData);
// //     }

// //     // Final API call with both fnaPersons and fnaGoals
// //     try {
// //       const response = await fetch("http://192.168.2.7:4001/fnaService/saveFNAData", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           fnaMainId: fna_id,
// //           agentId,
// //           clientId,
// //           personId: existingFnaPersons?.result?.personId || "",
// //           fnaPersons: existingFnaPersons?.result?.fnaPersons || {},
// //           fnaGoals: detailedGoals,
// //         }),
// //       });

// //       if (!response.ok) throw new Error("Failed to save FNA data to backend.");

// //       const result = await response.json();
// //       console.log("Combined FNA data saved to API:", result);
// //     } catch (error) {
// //       console.error("API call failed:", error);
// //     }

// //     navigate("/fnaincomedetails");
// //   } catch (error) {
// //     console.error("Error saving/updating FNA details:", error.message || error);
// //   }
// // };

//   const filteredGoals = goalDefn.filter((goal) =>
//     goal.lifeStages.includes(maritalStatus)
//   );

//   const navigate_to_fnapersoanldetails = () => {
//     navigate("/fnapersonaldetails");
//   };

//   return (
//     <SidebarLayout>
//       <div className="customer-container d-flex flex-column p-5">
//         {error && <div className="alert alert-danger">{error}</div>}

//         <div className="row mb-2 d-none d-md-flex" style={{ fontWeight: 900 }}>
//           <div className="col-md-4">Goals</div>
//           <div className="col-md-4">Priority</div>
//           <div className="col-md-4">Years to Goal</div>
//         </div>

//         {filteredGoals.map(({ key, label }) => (
//           <div className="row fna-goal-row mb-3" key={key}>
//             {/* Mobile: Goals heading always shown */}
//             <div className="d-flex d-md-none mb-1">
//               <div className="fw-bold">Goals</div>
//             </div>

//             {/* Goal checkbox */}
//             <div className="col-12 col-md-4">
//               <div className="form-check">
//                 <input
//                   className="form-check-input"
//                   type="checkbox"
//                   id={key}
//                   checked={goals[key] || false}
//                   onChange={() => handleGoalToggle(key)}
//                 />
//                 <label className="form-check-label" htmlFor={key}>
//                   {label}
//                 </label>
//               </div>
//             </div>

//             {goals[key] && (
//               <>
//                 {/* Mobile: Priority heading only if goal is selected */}
//                 <div className="d-flex d-md-none mb-1 mt-2">
//                   <div className="fw-bold">Priority</div>
//                 </div>
//                 <div className="col-12 col-md-4 fna-priority">
//                   <div className="priority-scale">
//                     {[1, 2, 3, 4, 5].map((val) => (
//                       <label key={val} className="priority-option">
//                         <input
//                           type="radio"
//                           name={`priority-${key}`}
//                           value={val}
//                           checked={priorities[key] === val}
//                           onChange={() =>
//                             setPriorities((prev) => ({ ...prev, [key]: val }))
//                           }
//                         />
//                         <span>{val}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Mobile: Years to Goal heading only if goal is selected */}
//                 <div className="d-flex d-md-none mb-1 mt-2">
//                   <div className="fw-bold">Years to Goal</div>
//                 </div>
//                 <div className="col-12 col-md-4 fna-years">
//                   <div className="d-flex align-items-center gap-2">
//                     <button
//                       type="button"
//                       className="btn btn-secondary btn-sm"
//                       onClick={() =>
//                         setYearsToGoal((prev) => ({
//                           ...prev,
//                           [key]: Math.max(0, (prev[key] || 0) - 1),
//                         }))
//                       }
//                     >
//                       −
//                     </button>

//                     <span>
//                       <input
//                         min="1"
//                         value={yearsToGoal[key] || 0}
//                         onChange={(e) => {
//                           const value = parseInt(e.target.value, 10);
//                           setYearsToGoal((prev) => ({
//                             ...prev,
//                             [key]: isNaN(value) ? 0 : value,
//                           }));
//                         }}
//                         className="form-control form-control-sm"
//                         style={{ border: "none", textAlign: "center" }}
//                       />
//                     </span>
//                     <button
//                       type="button"
//                       className="btn btn-secondary btn-sm"
//                       onClick={() =>
//                         setYearsToGoal((prev) => ({
//                           ...prev,
//                           [key]: (prev[key] || 0) + 1,
//                         }))
//                       }
//                     >
//                       +
//                     </button>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         ))}

//         {!isKeyboardVisible && (
//           <div className="iosfixednextprevbutton">
//             <div className="fixednextprevbutton d-flex justify-content-between">
//               <button
//                 type="button"
//                 className="btn btnprev"
//                 onClick={navigate_to_fnapersoanldetails}
//               >
//                 Prev
//               </button>
//               <button
//                 type="submit"
//                 className="btn btnnext"
//                 onClick={handleSubmit}
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         )}

//         <Modal
//           show={isModalOpen}
//           onHide={() => setIsModalOpen(false)}
//           backdrop="static"
//           keyboard={false}
//           className="success-modal"
//           centered
//         >
//           <Modal.Body className="text-center p-3">
//             <FontAwesomeIcon
//               icon={faTriangleExclamation}
//               size="3x"
//               style={{ color: "#7a0014" }}
//             />
//             <h5 className="my-3" style={{ color: "#800000" }}>
//               {message}
//             </h5>
//             <Button
//               style={{ backgroundColor: "#800000" }}
//               onClick={() => setIsModalOpen(false)}
//             >
//               OK
//             </Button>
//           </Modal.Body>
//         </Modal>
//       </div>
//     </SidebarLayout>
//   );
// };

// export default FNA_Goals;

import React, { useState, useEffect } from "react";
import SidebarLayout from "../../components/Dashboard/Template";
import {
  findRecordById,
  saveDetail,
  updateDetailById,
} from "../../db/indexedDB";
import "./FNA.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal, Button } from "react-bootstrap";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

const FNA_Goals = () => {
  const [goals, setGoals] = useState({});
  const [priorities, setPriorities] = useState({});
  const [yearsToGoal, setYearsToGoal] = useState({});
  const [maritalStatus, setMaritalStatus] = useState("");
  const [error, setError] = useState("");
  const [age, setAge] = useState(null);
  const [desiredRetirementAge, setDesiredRetirementAge] = useState(null);
  const [lifeExpectancy, setLifeExpectancy] = useState(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const isNewCustomer = sessionStorage.getItem("isNewCustomer");
  const [goalDefn, setGoalDefn] = useState([]);
  const [goalConstraints, setGoalConstraints] = useState({});

  useEffect(() => {
    const fetchGoalsFromAPI = async () => {
      if (maritalStatus) {
        try {
          const res = await fetch(
            `http://192.168.2.7:4001/fnaService/getGoals?maritalStatus=${maritalStatus}`
          );
          const result = await res.json();

          if (result.status === "Success" && result.data) {
            const formattedGoals = Object.keys(result.data).map((key) => ({
              key,
              label: prettifyKey(key),
            }));

            setGoalDefn(formattedGoals);
            setGoalConstraints(result.data); // save min/max if needed later
          }
        } catch (err) {
          console.error("Error fetching goal definitions:", err);
        }
      }
    };

    fetchGoalsFromAPI();
  }, [maritalStatus]);

  const getAutoYearsToGoal = (goalKey) => {
    const currentAge = age || 0;
    const retirement = desiredRetirementAge || 55;
    const expectancy = lifeExpectancy || 75;

    switch (goalKey) {
      case "childrenEducation":
        return 12;
      case "retirementPlanning":
        return Math.max(retirement - currentAge, 0);
      case "wealthPlanning":
        return 30;
      case "healthLifestyle":
      case "Marraige":
        return 5;
      case "protection":
        return Math.max(expectancy - currentAge, 0);
      default:
        return 0;
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      const fnaMainId = sessionStorage.getItem("fnaId");
      if (!fnaMainId) return;

      // Fetch personal details from al_fna_persons
      const personData = await findRecordById("al_fna_persons", fnaMainId);
      if (personData?.result.fnaPersons) {
        const person = personData.result.fnaPersons;
        setMaritalStatus(person.maritalStatus || "");
        setAge(parseInt(person.age));
        if (person.desiredRetirementAge) {
          setDesiredRetirementAge(parseInt(person.desiredRetirementAge));
        }
        if (person.lifeExpectancy) {
          setLifeExpectancy(parseInt(person.lifeExpectancy));
        }
      }

      // Fetch goals data from al_fna_goals
      const fnaData = await findRecordById("al_fna_goals", fnaMainId).catch(
        (err) => {
          console.warn("Could not find al_fna_goals with ID:", fnaMainId);
          return null;
        }
      );

      if (fnaData?.result?.fnaGoals && Array.isArray(fnaData.result.fnaGoals)) {
        const restoredGoals = {};
        const restoredPriorities = {};
        const restoredYearsToGoal = {};

        fnaData.result.fnaGoals.forEach((goal) => {
          const key = goal.goalDescription;
          if (key) {
            restoredGoals[key] = true;
            restoredPriorities[key] = parseInt(goal.goalPriority) || 1;
            // restoredYearsToGoal[key] = parseInt(goal.goalTimeHorizon) || 0;
            restoredYearsToGoal[key] = parseInt(goal.goalTimeHorizon) || 0;

          }
        });

        setGoals(restoredGoals);
        setPriorities(restoredPriorities);
        setYearsToGoal(restoredYearsToGoal);
      } else {
        // If no data, show blank fields
        setGoals({});
        setPriorities({});
        setYearsToGoal({});
      }
    };

    fetchAllData();
  }, []);

const handleGoalToggle = (key) => {
  setGoals((prev) => {
    const isSelecting = !prev[key];
    const updated = { ...prev, [key]: isSelecting };

    if (isSelecting) {
      const defaultYears = getAutoYearsToGoal(key);
      setPriorities((p) => ({ ...p, [key]: 1 }));
      setYearsToGoal((y) => ({ ...y, [key]: defaultYears })); // ✅ Important
      console.log("Setting yearsToGoal:", key, defaultYears);

    } else {
      const { [key]: _, ...restP } = priorities;
      const { [key]: __, ...restY } = yearsToGoal;
      setPriorities(restP);
      setYearsToGoal(restY);
    }

    return updated;
  });
};


  const validateGoals = () => {
    const selectedGoals = Object.keys(goals).filter((key) => goals[key]);

    if (selectedGoals.length === 0) {
      setMessage("Please select at least one goal setting.");
      setIsModalOpen(true);
      return true; //  Return true to indicate a validation error
    }

    const prioritiesUsed = selectedGoals.map((key) => priorities[key]);
    const uniquePriorities = new Set(prioritiesUsed);

    if (uniquePriorities.size < prioritiesUsed.length) {
      setMessage("Please assign a unique priority to each goal.");
      setIsModalOpen(true);
      return true;
    }

    const hasZeroYears = selectedGoals.some(
      (key) => yearsToGoal[key] === 0 || yearsToGoal[key] === undefined
    );

    if (hasZeroYears) {
      setMessage("Please assign a valid number of years to each goal.");
      setIsModalOpen(true);
      return true;
    }

    return false; //  Validation passed
  };

  const handleSubmit = async () => {
    const hasError = validateGoals();
    if (hasError) return;
    const fna_id = sessionStorage.getItem("fnaId");
    const agentId = sessionStorage.getItem("agentId");
    const clientId = sessionStorage.getItem("clientId");
    const personId = sessionStorage.getItem("person_id");
    console.log("fna_id found in session:", fna_id);

    if (!fna_id) {
      console.error("fna_id not found in session.");
      return;
    }

    const selectedGoals = Object.keys(goals).filter((key) => goals[key]);

    const detailedGoals = selectedGoals.map((key) => ({
      goalDescription: key,
      goalPriority: priorities[key]?.toString() || "",
      goalTimeHorizon: yearsToGoal[key]?.toString() || "",
    }));

    const dataToSave = {
      fna_id,
      fnaGoals: detailedGoals,
    };

    try {
      // Try to find existing FNA goal record
      let existingFnaRecord = null;
      try {
        existingFnaRecord = await findRecordById("al_fna_goals", fna_id);
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
        await updateDetailById("al_fna_goals", fna_id, dataToSave);
        console.log(
          "FNA details updated successfully in IndexedDB!",
          dataToSave
        );
      } else {
        // Record does not exist — create new
        await saveDetail("al_fna_goals", dataToSave);
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
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fnaMainId: fna_id,
              agentId,
              clientId,
              personId,
              fnaGoals: dataToSave.fnaGoals,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to save FNA data to backend.");
        }

        const result = await response.json();
        console.log("FNA data saved to API:", result);
      } catch (error) {
        console.error("API call failed:", error);
      }
      navigate("/fnaincomedetails");
    } catch (error) {
      console.error(
        "Error saving/updating FNA details:",
        error.message || error
      );
    }
  };

  const prettifyKey = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };
  
   const filteredGoals = goalDefn.map((goal) => ({
  ...goal,
  yearsToGoal: getAutoYearsToGoal(goal.key),
}));

  const navigate_to_fnapersoanldetails = () => {
    navigate("/fnapersonaldetails");
  };

  return (
    <SidebarLayout>
      <div className="customer-container d-flex flex-column p-5">
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row mb-2 d-none d-md-flex" style={{ fontWeight: 900 }}>
          <div className="col-md-4">Goals</div>
          <div className="col-md-4">Priority</div>
          <div className="col-md-4">Years to Goal</div>
        </div>

        {filteredGoals.map(({ key, label }) => (
          <div className="row fna-goal-row mb-3" key={key}>
            {/* Mobile: Goals heading always shown */}
            <div className="d-flex d-md-none mb-1">
              <div className="fw-bold">Goals</div>
            </div>

            {/* Goal checkbox */}
            <div className="col-12 col-md-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={key}
                  checked={goals[key] || false}
                  onChange={() => handleGoalToggle(key)}
                />
                <label className="form-check-label" htmlFor={key}>
                  {label}
                </label>
              </div>
            </div>

            {goals[key] && (
              <>
                {/* Mobile: Priority heading only if goal is selected */}
                <div className="d-flex d-md-none mb-1 mt-2">
                  <div className="fw-bold">Priority</div>
                </div>
                <div className="col-12 col-md-4 fna-priority">
                  <div className="priority-scale">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <label key={val} className="priority-option">
                        <input
                          type="radio"
                          name={`priority-${key}`}
                          value={val}
                          checked={priorities[key] === val}
                          onChange={() =>
                            setPriorities((prev) => ({ ...prev, [key]: val }))
                          }
                        />
                        <span>{val}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Mobile: Years to Goal heading only if goal is selected */}
                <div className="d-flex d-md-none mb-1 mt-2">
                  <div className="fw-bold">Years to Goal</div>
                </div>
                <div className="col-12 col-md-4 fna-years">
                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        const min = Math.min(
                          goalConstraints[key]?.yearToGoal?.min || 1,
                          99
                        );
                        setYearsToGoal((prev) => ({
                          ...prev,
                          [key]: Math.max(min, (prev[key] || min) - 1),
                        }));
                      }}
                    >
                      −
                    </button>
                    <span>
                      <input
                        min={Math.min(
                          goalConstraints[key]?.yearToGoal?.min || 1,
                          99
                        )}
                        max={Math.min(
                          goalConstraints[key]?.yearToGoal?.max || 99,
                          99
                        )}
                    //  value={yearsToGoal[key] ?? ""}
                    value={yearsToGoal[key] !== undefined ? yearsToGoal[key] : getAutoYearsToGoal(key)}

                        onChange={(e) => {
                          let value = parseInt(e.target.value, 10);

                          const min = Math.min(
                            goalConstraints[key]?.yearToGoal?.min || 1,
                            99
                          );
                          const max = Math.min(
                            goalConstraints[key]?.yearToGoal?.max || 99,
                            99
                          );

                          if (isNaN(value)) value = 0;
                          if (value < min) value = min;
                          if (value > max) value = max;

                          setYearsToGoal((prev) => ({
                            ...prev,
                            [key]: value,
                          }));
                        }}
                        className="form-control form-control-sm"
                        style={{ border: "none", textAlign: "center" }}
                      />
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        const max = Math.min(
                          goalConstraints[key]?.yearToGoal?.max || 99,
                          99
                        );
                        setYearsToGoal((prev) => ({
                          ...prev,
                          [key]: Math.min(max, (prev[key] || 0) + 1),
                        }));
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        {!isKeyboardVisible && (
          <div className="iosfixednextprevbutton">
            <div className="fixednextprevbutton d-flex justify-content-between">
              <button
                type="button"
                className="btn btnprev"
                onClick={navigate_to_fnapersoanldetails}
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

        <Modal
          show={isModalOpen}
          onHide={() => setIsModalOpen(false)}
          backdrop="static"
          keyboard={false}
          className="success-modal"
          centered
        >
          <Modal.Body className="text-center p-3">
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              size="3x"
              style={{ color: "#7a0014" }}
            />
            <h5 className="my-3" style={{ color: "#800000" }}>
              {message}
            </h5>
            <Button
              style={{ backgroundColor: "#800000" }}
              onClick={() => setIsModalOpen(false)}
            >
              OK
            </Button>
          </Modal.Body>
        </Modal>
      </div>
    </SidebarLayout>
  );
};

export default FNA_Goals;

// import React, { useState, useEffect } from "react";
// import SidebarLayout from "../../components/Dashboard/Template";
// import {
//   findRecordById,
//   saveDetail,
//   updateDetailById,
// } from "../../db/indexedDB";
// import "./FNA.css";
// import { useNavigate } from "react-router-dom";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { Modal, Button } from "react-bootstrap";
// import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

// const FNA_Goals = () => {
//   const [goals, setGoals] = useState({});
//   const [priorities, setPriorities] = useState({});
//   const [yearsToGoal, setYearsToGoal] = useState({});
//   const [maritalStatus, setMaritalStatus] = useState("");
//   const [error, setError] = useState("");
//   const [age, setAge] = useState(null);
//   const [desiredRetirementAge, setDesiredRetirementAge] = useState(null);
//   const [lifeExpectancy, setLifeExpectancy] = useState(null);
//   const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
//   const navigate = useNavigate();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [message, setMessage] = useState("");
//   const isNewCustomer = sessionStorage.getItem("isNewCustomer");
//   const [goalDefn, setGoalDefn] = useState([]);
//   const [goalConstraints, setGoalConstraints] = useState({});

//   useEffect(() => {
//     const fetchGoalsFromAPI = async () => {
//       if (maritalStatus) {
//         try {
//           const res = await fetch(
//             `http://192.168.2.7:4001/fnaService/getGoals?maritalStatus=${maritalStatus}`
//           );
//           const result = await res.json();

//           if (result.status === "Success" && result.data) {
//             const formattedGoals = Object.keys(result.data).map((key) => ({
//               key,
//               label: prettifyKey(key),
//             }));

//             setGoalDefn(formattedGoals);
//             setGoalConstraints(result.data); // save min/max if needed later
//           }
//         } catch (err) {
//           console.error("Error fetching goal definitions:", err);
//         }
//       }
//     };

//     fetchGoalsFromAPI();
//   }, [maritalStatus]);

//   const getAutoYearsToGoal = (goalKey) => {
//     const currentAge = age || 0;
//     const retirement = desiredRetirementAge || 55;
//     const expectancy = lifeExpectancy || 75;

//     switch (goalKey) {
//       case "Children Education":
//         return 12;
//       case "Retirement Planning":
//         return Math.max(retirement - currentAge, 0);
//       case "Wealth Planning":
//         return 30;
//       case "Health & Life Style":
//       case "Marraige":
//         return 5;
//       case "Protection Plan":
//         return Math.max(expectancy - currentAge, 0);
//       default:
//         return 0;
//     }
//   };

//   useEffect(() => {
//     const fetchAllData = async () => {
//       const fnaMainId = sessionStorage.getItem("fnaId");
//       if (!fnaMainId) return;

//       // Fetch personal details from al_fna_persons
//       const personData = await findRecordById("al_fna_persons", fnaMainId);
//       if (personData?.result.fnaPersons) {
//         const person = personData.result.fnaPersons;
//         setMaritalStatus(person.maritalStatus || "");
//         setAge(parseInt(person.age));
//         if (person.desiredRetirementAge) {
//           setDesiredRetirementAge(parseInt(person.desiredRetirementAge));
//         }
//         if (person.lifeExpectancy) {
//           setLifeExpectancy(parseInt(person.lifeExpectancy));
//         }
//       }

//       // Fetch goals data from al_fna_goals
//       const fnaData = await findRecordById("al_fna_goals", fnaMainId).catch(
//         (err) => {
//           console.warn("Could not find al_fna_goals with ID:", fnaMainId);
//           return null;
//         }
//       );

//       if (fnaData?.result?.fnaGoals && Array.isArray(fnaData.result.fnaGoals)) {
//         const restoredGoals = {};
//         const restoredPriorities = {};
//         const restoredYearsToGoal = {};

//         fnaData.result.fnaGoals.forEach((goal) => {
//           const key = goal.goalDescription;
//           if (key) {
//             restoredGoals[key] = true;
//             restoredPriorities[key] = parseInt(goal.goalPriority) || 1;
//             restoredYearsToGoal[key] = parseInt(goal.goalTimeHorizon) || 0;
//           }
//         });

//         setGoals(restoredGoals);
//         setPriorities(restoredPriorities);
//         setYearsToGoal(restoredYearsToGoal);
//       } else {
//         // If no data, show blank fields
//         setGoals({});
//         setPriorities({});
//         setYearsToGoal({});
//       }
//     };

//     fetchAllData();
//   }, []);

//   const handleGoalToggle = (key) => {
//     setGoals((prev) => {
//       const updated = { ...prev, [key]: !prev[key] };

//       if (!prev[key]) {
//         setPriorities((p) => ({ ...p, [key]: 1 }));
//         setYearsToGoal((y) => ({ ...y, [key]: getAutoYearsToGoal(key, age) }));
//       } else {
//         const { [key]: _, ...restP } = priorities;
//         const { [key]: __, ...restY } = yearsToGoal;
//         setPriorities(restP);
//         setYearsToGoal(restY);
//       }

//       return updated;
//     });
//   };

//   const validateGoals = () => {
//     const selectedGoals = Object.keys(goals).filter((key) => goals[key]);

//     if (selectedGoals.length === 0) {
//       setMessage("Please select at least one goal setting.");
//       setIsModalOpen(true);
//       return true; //  Return true to indicate a validation error
//     }

//     const prioritiesUsed = selectedGoals.map((key) => priorities[key]);
//     const uniquePriorities = new Set(prioritiesUsed);

//     if (uniquePriorities.size < prioritiesUsed.length) {
//       setMessage("Please assign a unique priority to each goal.");
//       setIsModalOpen(true);
//       return true;
//     }

//     const hasZeroYears = selectedGoals.some(
//       (key) => yearsToGoal[key] === 0 || yearsToGoal[key] === undefined
//     );

//     if (hasZeroYears) {
//       setMessage("Please assign a valid number of years to each goal.");
//       setIsModalOpen(true);
//       return true;
//     }

//     return false; //  Validation passed
//   };

//   const handleSubmit = async () => {
//     const hasError = validateGoals();
//     if (hasError) return;
//     const fna_id = sessionStorage.getItem("fnaId");
//     const agentId = sessionStorage.getItem("agentId");
//     const clientId = sessionStorage.getItem("clientId");
//     const personId = sessionStorage.getItem("person_id");
//     console.log("fna_id found in session:", fna_id);

//     if (!fna_id) {
//       console.error("fna_id not found in session.");
//       return;
//     }

//     const selectedGoals = Object.keys(goals).filter((key) => goals[key]);
//     const exceedsMax = selectedGoals.some((key) => {
//       const max = Math.min(goalConstraints[key]?.yearToGoal?.max || 99, 99);
//       return yearsToGoal[key] > max;
//     });

//     if (exceedsMax) {
//       setMessage(
//         "One or more goals exceed the allowed years to goal (max 99)."
//       );
//       setIsModalOpen(true);
//       return true;
//     }

//     const detailedGoals = selectedGoals.map((key) => ({
//       goalDescription: key,
//       goalPriority: priorities[key]?.toString() || "",
//       goalTimeHorizon: yearsToGoal[key]?.toString() || "",
//     }));

//     const dataToSave = {
//       fna_id,
//       fnaGoals: detailedGoals,
//     };

//     try {
//       // Try to find existing FNA goal record
//       let existingFnaRecord = null;
//       try {
//         existingFnaRecord = await findRecordById("al_fna_goals", fna_id);
//       } catch (innerError) {
//         console.warn(
//           "No existing FNA goal record found. A new one will be saved."
//         );
//       }

//       let existingFNAMain;
//       try {
//         existingFNAMain = await findRecordById("al_fna_main", fna_id);
//       } catch (error) {
//         console.warn("No existing FNA main record found, proceeding to save.");
//         existingFNAMain = null;
//       }

//       if (existingFnaRecord?.result) {
//         // Record exists — update
//         await updateDetailById("al_fna_goals", fna_id, dataToSave);
//         console.log(
//           "FNA details updated successfully in IndexedDB!",
//           dataToSave
//         );
//       } else {
//         // Record does not exist — create new
//         await saveDetail("al_fna_goals", dataToSave);
//         console.log(
//           "New FNA details saved successfully in IndexedDB!",
//           dataToSave
//         );
//       }

//       // Save or update `al_fna_main`
//       if (existingFNAMain) {
//         await updateDetailById("al_fna_main", fna_id, dataToSave);
//         console.log("Updated FNA main record in IndexedDB");
//       } else {
//         await saveDetail("al_fna_main", dataToSave);
//         console.log("Saved new FNA main record in IndexedDB");
//       }

//       try {
//         const response = await fetch(
//           "http://192.168.2.7:4001/fnaService/saveFNAData",
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               fnaMainId: fna_id,
//               agentId,
//               clientId,
//               personId,
//               fnaGoals: dataToSave.fnaGoals,
//             }),
//           }
//         );

//         if (!response.ok) {
//           throw new Error("Failed to save FNA data to backend.");
//         }

//         const result = await response.json();
//         console.log("FNA data saved to API:", result);
//       } catch (error) {
//         console.error("API call failed:", error);
//       }
//       navigate("/fnaincomedetails");
//     } catch (error) {
//       console.error(
//         "Error saving/updating FNA details:",
//         error.message || error
//       );
//     }
//   };

//   const prettifyKey = (key) => {
//     return key
//       .replace(/([A-Z])/g, " $1")
//       .replace(/^./, (str) => str.toUpperCase())
//       .trim();
//   };

//   const filteredGoals = goalDefn; // already filtered by API

//   const navigate_to_fnapersoanldetails = () => {
//     navigate("/fnapersonaldetails");
//   };

//   return (
//     <SidebarLayout>
//       <div className="customer-container d-flex flex-column p-5">
//         {error && <div className="alert alert-danger">{error}</div>}

//         <div className="row mb-2 d-none d-md-flex" style={{ fontWeight: 900 }}>
//           <div className="col-md-4">Goals</div>
//           <div className="col-md-4">Priority</div>
//           <div className="col-md-4">Years to Goal</div>
//         </div>

//         {goalDefn.map(({ key, label }) => (
//           <div className="row fna-goal-row mb-3" key={key}>
//             {/* Mobile: Goals heading always shown */}
//             <div className="d-flex d-md-none mb-1">
//               <div className="fw-bold">Goals</div>
//             </div>

//             {/* Goal checkbox */}
//             <div className="col-12 col-md-4">
//               <div className="form-check">
//                 <input
//                   className="form-check-input"
//                   type="checkbox"
//                   id={key}
//                   checked={goals[key] || false}
//                   onChange={() => handleGoalToggle(key)}
//                 />
//                 <label className="form-check-label" htmlFor={key}>
//                   {label}
//                 </label>
//               </div>
//             </div>

//             {goals[key] && (
//               <>
//                 {/* Mobile: Priority heading only if goal is selected */}
//                 <div className="d-flex d-md-none mb-1 mt-2">
//                   <div className="fw-bold">Priority</div>
//                 </div>
//                 <div className="col-12 col-md-4 fna-priority">
//                   <div className="priority-scale">
//                    {Array.from(
//   {
//     length:
//       (goalConstraints[key]?.priority?.max || 5) -
//       (goalConstraints[key]?.priority?.min || 1) +
//       1,
//   },
//   (_, i) => (goalConstraints[key]?.priority?.min || 1) + i
// ).map((val) => (
//   <label key={val} className="priority-option">
//     <input
//       type="radio"
//       name={`priority-${key}`}
//       value={val}
//       checked={priorities[key] === val}
//       onChange={() =>
//         setPriorities((prev) => {
//           const min = goalConstraints[key]?.priority?.min || 1;
//           const max = goalConstraints[key]?.priority?.max || 5;
//           if (val >= min && val <= max) {
//             return { ...prev, [key]: val };
//           }
//           return prev;
//         })
//       }
//     />
//     <span>{val}</span>
//   </label>
// ))}

//                   </div>
//                 </div>

//                 {/* Mobile: Years to Goal heading only if goal is selected */}
//                 <div className="d-flex d-md-none mb-1 mt-2">
//                   <div className="fw-bold">Years to Goal</div>
//                 </div>
//                 <div className="col-12 col-md-4 fna-years">
//                   <div className="d-flex align-items-center gap-2">
//                     <button
//                       type="button"
//                       className="btn btn-secondary btn-sm"
//                       onClick={() => {
//                         const min = Math.min(
//                           goalConstraints[key]?.yearToGoal?.min || 1,
//                           99
//                         );
//                         setYearsToGoal((prev) => ({
//                           ...prev,
//                           [key]: Math.max(min, (prev[key] || min) - 1),
//                         }));
//                       }}
//                     >
//                       −
//                     </button>

//                     <span>
//                       <input
//                         type="number"
//                         min={Math.min(
//                           goalConstraints[key]?.yearToGoal?.min || 1,
//                           99
//                         )}
//                         max={Math.min(
//                           goalConstraints[key]?.yearToGoal?.max || 99,
//                           99
//                         )}
//                         value={yearsToGoal[key] || ""}
//                         onChange={(e) => {
//                           let value = parseInt(e.target.value, 10);

//                           const min = Math.min(
//                             goalConstraints[key]?.yearToGoal?.min || 1,
//                             99
//                           );
//                           const max = Math.min(
//                             goalConstraints[key]?.yearToGoal?.max || 99,
//                             99
//                           );

//                           if (isNaN(value)) value = 0;
//                           if (value < min) value = min;
//                           if (value > max) value = max;

//                           setYearsToGoal((prev) => ({
//                             ...prev,
//                             [key]: value,
//                           }));
//                         }}
//                         className="form-control form-control-sm"
//                         style={{ border: "none", textAlign: "center" }}
//                       />
//                     </span>
//                     <button
//                       type="button"
//                       className="btn btn-secondary btn-sm"
//                       onClick={() => {
//                         const max = Math.min(
//                           goalConstraints[key]?.yearToGoal?.max || 99,
//                           99
//                         );
//                         setYearsToGoal((prev) => ({
//                           ...prev,
//                           [key]: Math.min(max, (prev[key] || 0) + 1),
//                         }));
//                       }}
//                     >
//                       +
//                     </button>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         ))}

//         {!isKeyboardVisible && (
//           <div className="iosfixednextprevbutton">
//             <div className="fixednextprevbutton d-flex justify-content-between">
//               <button
//                 type="button"
//                 className="btn btnprev"
//                 onClick={navigate_to_fnapersoanldetails}
//               >
//                 Prev
//               </button>
//               <button
//                 type="submit"
//                 className="btn btnnext"
//                 onClick={handleSubmit}
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         )}

//         <Modal
//           show={isModalOpen}
//           onHide={() => setIsModalOpen(false)}
//           backdrop="static"
//           keyboard={false}
//           className="success-modal"
//           centered
//         >
//           <Modal.Body className="text-center p-3">
//             <FontAwesomeIcon
//               icon={faTriangleExclamation}
//               size="3x"
//               style={{ color: "#7a0014" }}
//             />
//             <h5 className="my-3" style={{ color: "#800000" }}>
//               {message}
//             </h5>
//             <Button
//               style={{ backgroundColor: "#800000" }}
//               onClick={() => setIsModalOpen(false)}
//             >
//               OK
//             </Button>
//           </Modal.Body>
//         </Modal>
//       </div>
//     </SidebarLayout>
//   );
// };

// export default FNA_Goals;
