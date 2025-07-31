// import React, { useEffect, useState } from 'react';
// import SidebarLayout from "../Dashboard/Template";
// import { fetchDetails } from "../../db/indexedDB";
// import { Table } from 'react-bootstrap';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faSearch } from '@fortawesome/free-solid-svg-icons';
// import './FNA.css';
// import { useNavigate } from 'react-router-dom';

// const FNA_Summary = () => {
//   const [persons, setPersons] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const navigate = useNavigate();
//   const fna_id = sessionStorage.getItem("fnaId");

//   useEffect(() => {
//     const fetchPersons = async () => {
//       try {
//         const allGoals = await fetchDetails("al_fna_persons");
//         console.log("Fetched FNA persons:", allGoals);
        
//         setPersons(allGoals);
//       } catch (error) {
//         console.error("Error fetching FNA persons:", error);
//       }
//     };

//     fetchPersons();
//   }, []);

//   const filteredRecords = persons.filter((person) => {
//     const fullName = person.firstName || person.name || '';
//     return fullName.toLowerCase().includes(searchTerm.toLowerCase());
//   });

//   const handleRowClick = (person) => {
//     console.log('Clicked customer:', person);
//     if (fna_id) {
//       navigate('/fnapersonaldetails', {
//         state: {
//           source: 'IndexedDB',
//           fnaData: person
//         }
//       });
//     } else {
//       console.error('No valid ID found for the selected customer');
//     }
//   };

//   return (
//     <SidebarLayout>
//       <div className="customersummary-container">
//         <div className="summaryform">
//           <div className="row align-items-center justify-content-between mb-3">
//             <div className="col-md-5 mt-2">
//               <div
//                 className="form-control d-flex align-items-center"
//                 style={{ border: 'none', boxShadow: '0 0 10px #0000001a' }}
//               >
//                 <span style={{ marginRight: '8px', color: 'red' }}>
//                   <FontAwesomeIcon icon={faSearch} />
//                 </span>
//                 <input
//                   type="text"
//                   placeholder="Search here..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   style={{
//                     border: 'none',
//                     outline: 'none',
//                     width: '100%',
//                     background: 'transparent',
//                   }}
//                 />
//               </div>
//             </div>
//           </div>

//           <div className='iostable'>
//             <div className="table-responsive mobiletable">
//               <Table className="table table-striped tabwidth">
//                 <thead className="heading">
//                   <tr>
//                     <th>Name</th>
//                     <th>Mobile Number</th>
//                     <th>Email ID</th>
//                   </tr>
//                 </thead>
//                <tbody>
//   {filteredRecords.length > 0 ? (
//     filteredRecords.map((person, index) => (
//       <tr key={index} onClick={() => handleRowClick(person)} style={{ cursor: 'pointer' }}>
//         <td>{person.fnaPersons?.firstName || 'N/A'}</td>
//         <td>{person.fnaPersons?.mobileNo || 'N/A'}</td>
//         <td>{person.fnaPersons?.emailId || 'N/A'}</td>
//       </tr>
//     ))
//   ) : (
//     <tr>
//       <td colSpan="3" className="text-center">No customer data available</td>
//     </tr>
//   )}
// </tbody>

//               </Table>
//             </div>
//           </div>

//           {/* <button className="button" onClick={() => alert("Delete logic here")}>
//             Delete
//           </button> */}
//         </div>
//       </div>
//     </SidebarLayout>
//   );
// };

// export default FNA_Summary;



import React, { useEffect, useState } from "react";
import SidebarLayout from "../Dashboard/Template";
import { fetchDetails } from "../../db/indexedDB";
import { Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import "./FNA.css";
import { useNavigate } from "react-router-dom";

const FNA_Summary = () => {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const agentId = sessionStorage.getItem("agentId");
  const clientId = sessionStorage.getItem("clientId");
  const fnaMainId = sessionStorage.getItem("fnaId");

  useEffect(() => {
    const fetchCombinedRecords = async () => {
      const combinedData = [];

      // 1. Fetch from IndexedDB
      try {
        const indexedDBData = await fetchDetails("al_fna_persons");
        const taggedLocalData = indexedDBData.map((item) => ({
          ...item,
          source: "IndexedDB",
        }));
        combinedData.push(...taggedLocalData);
      } catch (err) {
        console.error("Error fetching from IndexedDB:", err);
      }

      // 2. Fetch from API
      try {
        let url = new URL("http://192.168.2.7:4001/fnaService/getFNAData");
        if (agentId) url.searchParams.append("agentId", agentId);
        // if (clientId) url.searchParams.append("clientId", clientId);
        // if (fnaMainId) url.searchParams.append("fnaMainId", fnaMainId);

        const response = await fetch(url.toString());

        if (response.ok) {
          const data = await response.json();
          console.log("API Response:", data);
          const apiArray = Array.isArray(data) ? data : [data];
          const taggedApiData = apiArray.map((item) => ({
            ...item,
            source: "API",
          }));
          combinedData.push(...taggedApiData);
        } else {
          console.error("API fetch error:", response.status);
        }
      } catch (err) {
        console.error("Error fetching from API:", err);
      }

      setRecords(combinedData);
    };

    fetchCombinedRecords();
  }, [agentId, clientId, fnaMainId]);

  const filteredRecords = records.filter((record) => {
    const person = record.fnaPersons || record; // for API and IndexedDB
    const fullName = person.firstName || person.nameWithInitials || "";
    return fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleRowClick = (record) => {
    navigate("/fnapersonaldetails", {
      state: {
        source: record.source,
        fnaData: record,
        fnaId: record._id,
      },
    });
  };

  return (
    <SidebarLayout>
      <div className="customersummary-container">
        <div className="summaryform">
          <div className="row align-items-center justify-content-between mb-3">
            <div className="col-md-5 mt-2">
              <div
                className="form-control d-flex align-items-center"
                style={{ border: "none", boxShadow: "0 0 10px #0000001a" }}
              >
                <span style={{ marginRight: "8px", color: "red" }}>
                  <FontAwesomeIcon icon={faSearch} />
                </span>
                <input
                  type="text"
                  placeholder="Search here..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    width: "100%",
                    background: "transparent",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="iostable">
            <div className="table-responsive mobiletable">
              <Table className="table table-striped tabwidth">
                <thead className="heading">
                  <tr>
                    <th>Name</th>
                    <th>Mobile Number</th>
                    <th>Email ID</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record, index) => {
                      const person = record.fnaPersons || record;
                      return (
                        <tr
                          key={index}
                          onClick={() => handleRowClick(record)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>
                            {person.firstName ||
                              person.nameWithInitials ||
                              "N/A"}
                          </td>
                          <td>{person.mobileNo || person.mobile || "N/A"}</td>
                          <td>{person.emailId || "N/A"}</td>
                          <td>{record.source}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No FNA records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default FNA_Summary;
