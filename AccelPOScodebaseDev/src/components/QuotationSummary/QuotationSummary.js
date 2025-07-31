import React from 'react'
import "./QuotationSummary.css"
// import Encryption from "../../service/Encryption";
import Table from 'react-bootstrap/Table';
import { useState, useEffect } from "react";
// import { environment } from '../../config/environment'
import { Link, useNavigate, useLocation } from "react-router-dom";
import Loader from "react-spinner-loader";
import { Button, Container, Row, Form } from "react-bootstrap";
// import { openDatabase, addObject, getAllObjects,getObjectById } from '../../service/dbService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import {fetchDetails} from '../../db/indexedDB'
import { faChevronCircleRight } from '@fortawesome/free-solid-svg-icons';
import SidebarLayout from '../../components/Dashboard/Template';

const Quotationsummary = (props) => {
  const location = useLocation();
  const [data, setdata] = useState([]);
  const [loader, setLoader] = useState();
  const navigate = useNavigate();
  const gotolistdashboard = useNavigate();
  const [getAgentID,setAgentID] = useState();
  const [tableData, setTableData] = useState({});
  const fromPage = location.state?.from || "Unknown";
  console.log("Data navigated from:", fromPage);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8; // Number of records per page

    useEffect(() => {
      const fetchData = async () => {
          try {
              const storeMap = {
                personalDetails: 'al_person_details',
                sqsdetails: 'al_sqs_details',
                riderDetails: 'al_rider_details',
              };
              const dataFromIndexedDB = [];

              // Iterate over each store in storeMap
              for (const [key, store] of Object.entries(storeMap)) {
                const storedData = await fetchDetails(store);
      
                if (storedData && Object.keys(storedData).length > 0) {
                  console.log(`Data found in IndexedDB for ${key}`);
                  dataFromIndexedDB[key] = storedData;
                }
                      // Sort personalDetails by creationDateTime (latest first)
                    if (dataFromIndexedDB.personalDetails) {
                        dataFromIndexedDB.personalDetails.sort((a, b) => {
                        const dateA = new Date(a.primaryInsured?.person?.creationDateTime || 0);
                        const dateB = new Date(b.primaryInsured?.person?.creationDateTime || 0);
                        return dateB - dateA; 
                        });
                    }

                console.log("Concatenated Data:", dataFromIndexedDB);
                setTableData(dataFromIndexedDB)
              }

          } catch (error) {
              console.error("Error fetching data:", error);
          }
      };

      fetchData();
    }, []); 
    
    const navigate_to_dashboard = () => {
        navigate('/dashboard');
    };

    function openMySavedQuotation(personDetails, sqsDetails, riderDetails) {

      sessionStorage.setItem('personDetails', JSON.stringify(personDetails));
      sessionStorage.setItem('sqsDetails', JSON.stringify(sqsDetails));
      sessionStorage.setItem('riderDetails', JSON.stringify(riderDetails));

      console.log("JSON.stringify(personDetails)",JSON.stringify(personDetails))
      console.log("JSON.stringify(sqsDetails)",JSON.stringify(sqsDetails))
      console.log("JSON.stringify(riderDetails)",JSON.stringify(riderDetails))
  
      navigate('/mysavedquotations');
    }

    // Calculate pagination details
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = tableData.personalDetails?.slice(indexOfFirstRecord, indexOfLastRecord) || [];
    const totalPages = Math.ceil((tableData.personalDetails?.length || 0) / recordsPerPage);
    console.log("Current Records:", currentRecords);
    console.log("Total Pages:", totalPages);
    console.log("Current Page:", currentPage);

    // Handle page navigation
    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(
                    <button
                        key={i}
                        className={`pagination-btn ${i === currentPage ? "active" : ""}`}
                        onClick={() => goToPage(i)}
                    >
                        {i}
                    </button>
                );
            }
        } else {
            pageNumbers.push(
                <button
                    key={1}
                    className={`pagination-btn ${currentPage === 1 ? "active" : ""}`}
                    onClick={() => goToPage(1)}
                >
                    1
                </button>
            );

            if (currentPage > 3) {
                pageNumbers.push(<span key="start-dots" className="dots">...</span>);
            }

            const startPage = Math.max(2, currentPage - 1);
            const endPage = Math.min(totalPages - 1, currentPage + 1);
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(
                    <button
                        key={i}
                        className={`pagination-btn ${i === currentPage ? "active" : ""}`}
                        onClick={() => goToPage(i)}
                    >
                        {i}
                    </button>
                );
            }

            if (currentPage < totalPages - 2) {
                pageNumbers.push(<span key="end-dots" className="dots">...</span>);
            }

            pageNumbers.push(
                <button
                    key={totalPages}
                    className={`pagination-btn ${currentPage === totalPages ? "active" : ""}`}
                    onClick={() => goToPage(totalPages)}
                >
                    {totalPages}
                </button>
            );
        }

        return pageNumbers;
    };

    return (
        <SidebarLayout>
            <div className="quotesummary-container">
                {/* <div className="quotesummary-navbar bg-white mb-4 p-3 shadow-sm">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="backArrow pt-2" onClick={navigate_to_dashboard}>
                            <FontAwesomeIcon icon={faArrowLeft} className="backPointer red-text" />
                            <span className="ms-2 redtext ml-2">Saved Quotations</span>
                        </div>
                        <div className="d-flex align-items-center">
                            <img
                                src="/notification.png"
                                alt="Notification Icon"
                                className="notification-icon mx-3"
                                style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                            />
                        </div>
                    </div>
                    <div className="border-bottom mt-2"></div>
                </div> */}

                <div className="quotesummaryform">
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead className="heading">
                                <tr>
                                    <td>Created Date</td>
                                    <td>Prospect Name</td>
                                    <td>My Saved Quotation</td>
                                </tr>
                            </thead>
                            <tbody className="tableBody">
                    {currentRecords && currentRecords.length > 0 ? (
                        currentRecords.map((person, index) => {
                            const quotationData = person.primaryInsured?.person || {};
                            return (
                                <tr
                                    key={index}
                                    onClick={() =>
                                        openMySavedQuotation(
                                            person,
                                            currentRecords.sqsdetails?.[index],
                                            currentRecords.riderDetails?.[index]
                                        )
                                    }
                                >
                                    <td>{quotationData.creationDateTime || 'N/A'}</td>
                                    <td>{`${quotationData.name?.first || ''} ${quotationData.name?.last || ''}`.trim() || 'No Name Available'}</td>
                                    <td style={{ cursor: 'pointer' }}>
                                        <FontAwesomeIcon
                                            icon={faChevronCircleRight}
                                            aria-hidden="true"
                                        />
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="3" style={{ textAlign: 'center' }}>
                                No quotations generated
                            </td>
                        </tr>
                    )}
                </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="pagination-container fixed-bottom">
                    <button onClick={goToPrevPage} disabled={currentPage === 1} className="left" >&lt;</button>
                    {renderPageNumbers()}
                    <button onClick={goToNextPage} disabled={currentPage === totalPages} className="right">&gt;</button>
                </div>

            </div>
        </SidebarLayout>
    );
};

export default Quotationsummary;   