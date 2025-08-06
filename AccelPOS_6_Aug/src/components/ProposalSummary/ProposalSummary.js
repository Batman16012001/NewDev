import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSlidersH, faSearch,faAngleUp, faAngleDown  } from '@fortawesome/free-solid-svg-icons';
import './ProposalSummary.css';
import { fetchDetails } from '../../db/indexedDB'; // Assuming you have this function
import SidebarLayout from '../../components/Dashboard/Template';

const ProposalSummary = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState([]);
    const [isDropdownVisible, setDropdownVisible] = useState(false); 
    const [searchTerm, setSearchTerm] = useState(''); 
    const [summaryData, setSummaryData] = useState([]);
    const dropdownRef = useRef(null);
    const filterButtonRef = useRef(null); 
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 8; // Number of records per page

    const clientId = sessionStorage.getItem('clientId');
    const erefId = sessionStorage.getItem('erefid');
    const agentId = sessionStorage.getItem('agentId');

    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    
      useEffect(() => {
        const handleResize = () => {
          const viewportHeight = window.visualViewport.height;
          const screenHeight = window.screen.height;
    
          // If viewport height is significantly less than screen height, keyboard is likely open
          setIsKeyboardVisible(viewportHeight < screenHeight * 0.85);
        };
    
        window.visualViewport.addEventListener("resize", handleResize);
        return () => {
          window.visualViewport.removeEventListener("resize", handleResize);
        };
      }, []);

    const navigate_to_dashboard = () => {
        navigate('/dashboard');
    };

    const toggleFilter = (value) => {
        if (filter.includes(value)) {
            setFilter(filter.filter(item => item !== value));
        } else {
            setFilter([...filter, value]);
        }
    };

    const toggleDropdown = () => {
        setDropdownVisible((prevState) => !prevState);
    };

    // Close the dropdown if clicked outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                filterButtonRef.current && !filterButtonRef.current.contains(event.target)) {
                setDropdownVisible(false); 
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [dropdownRef, filterButtonRef]);

    const filters = [
        { id: 1, value: 'draft', label: 'Draft' },
        { id: 2, value: 'pending', label: 'Pending' },
        { id: 3, value: 'submitted', label: 'Submitted' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storeMap = {
                    proposalSummary: 'al_application_main',  
                };
                const dataFromIndexedDB = [];

                // Iterate over each store in storeMap
                for (const [key, store] of Object.entries(storeMap)) {
                    const storedData = await fetchDetails(store);

                    if (storedData && Array.isArray(storedData) && storedData.length > 0) {
                        console.log(`Data found in IndexedDB for ${key}:`, storedData);

                        // Map through storedData array to extract relevant details
                        const combinedData = storedData.map(item => {
                            
                            const result = item || {};
                            const product = result.product || {};
                            const primaryInsured = product.primaryInsured?.person || {};
                            const policyDetails = product.policyDetails || {};
                            const proposalStatus = result.product.policyDetails.proposalStatus || '';


                            return {
                                erefNumber: result.e_referenceId || '',
                                mainProposer: `${primaryInsured.name?.first || ''} ${primaryInsured.name?.last || ''}`,
                                lifeAssured: `${primaryInsured.name?.first || ''} ${primaryInsured.name?.last || ''}`,
                                productType: policyDetails.productType || '',
                                status: proposalStatus || '',
                            };
                        });
                        //sorting added by shubham
                        combinedData.sort((a, b) => {
                            return b.erefNumber.localeCompare(a.erefNumber, undefined, { numeric: true });
                          });
                          
                        // Set the summary data with the mapped results
                        setSummaryData(combinedData);
                    } else {
                        console.warn(`No valid data found in IndexedDB for ${key}`);
                    }
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [agentId]); 

    const filteredProposals = summaryData.filter(proposal =>
        (filter.length === 0 || filter.includes(proposal.status.toLowerCase())) &&
        (searchTerm === '' ||
            proposal.erefNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            proposal.mainProposer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            proposal.lifeAssured.toLowerCase().includes(searchTerm.toLowerCase()))
    );


        // Calculate pagination details
        const indexOfLastRecord = currentPage * recordsPerPage;
        const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
        const currentRecords = filteredProposals.slice(indexOfFirstRecord, indexOfLastRecord);
        const totalPages = Math.ceil(filteredProposals.length / recordsPerPage);


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

    const getFilterButtonText = () => {
        if (filter.length === 0) {
            return 'Filter By';
        } 
        if (filter.length === 1) {
            return filter[0].charAt(0).toUpperCase() + filter[0].slice(1); // Capitalize the first letter
        } 
        if (filter.length === 2) {
            return filter.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(', ');
        } 
        return `${filter[0].charAt(0).toUpperCase() + filter[0].slice(1)}, ${filter[1].charAt(0).toUpperCase() + filter[1].slice(1)} +${filter.length - 2} more`;
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

    const handleRowClick = (proposal , erefNumber) => {
        console.log("Erefno form ", erefNumber)
        sessionStorage.setItem("erefid", erefNumber);
        sessionStorage.setItem("eReferenceIdthroughproposalsummary" , erefNumber)
        navigate('/agentdetails', { state: { proposal } });
    };

    return (
         <SidebarLayout>
            <div className="proposalsummary-container">
                <div className="proposalsummary">
                    <div className="row align-items-center mb-3 justify-content-between">
                        <div className="col-md-4 d-flex mt-2 ">
                            <div className="form-control d-flex align-items-center " style={{ border: 'none', boxShadow: '0 0 10px #0000001a',}}>
                                <span style={{ marginRight: '8px', color: 'red' }}>
                                    <FontAwesomeIcon icon={faSearch} />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search here..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        border: 'none',
                                        outline: 'none',
                                        width: '100%',
                                        background: 'transparent',
                                    }}
                                />
                            </div>
                        </div>

                        <div className="col-md-4 d-flex mt-2 align-items-center">
                            {/* Filter Button with Icon */}
                            <div
                                className=" form-control d-flex align-items-center justify-content-between filtericon"
                                id="filterDropdownButton" 
                                ref={filterButtonRef}
                                onClick={toggleDropdown}
                                style={{ border: 'none', boxShadow: '0 0 10px #0000001a',}}
                            >
                                <span className="icon-left">
                                    <FontAwesomeIcon icon={faSlidersH} />
                                </span>
                                <span className="filter-text">{getFilterButtonText()}</span>
                                <span className="icon-right">
                                    <FontAwesomeIcon icon={isDropdownVisible ? faAngleUp : faAngleDown} />
                                </span>
                            </div>

                            {/* Dropdown */}
                            {isDropdownVisible && (
                                <ul
                                    className="dropdown-menu show"
                                    aria-labelledby="filterDropdownButton"
                                    ref={dropdownRef}
                                >
                                    {filters.map((filterOption) => (
                                        <li key={filterOption.id}>
                                            <label className="dropdown-item">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input me-2"
                                                    onChange={() => toggleFilter(filterOption.value)}
                                                    checked={filter.includes(filterOption.value)}
                                                />
                                                {filterOption.label}
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className='iostableproposal'>
                        <div className="table-responsive mobiletable">
                            <table className="table table-striped tabwidth">
                                <thead className="heading">
                                    <tr>
                                        <th>Eref-Number</th>
                                        <th>Proposer/Main Proposer</th>
                                        <th>Life to be Assured</th>
                                        <th>Plan Name</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRecords.length > 0 ? (
                                        currentRecords.map((proposal, index) => (
                                            <tr key={index} style={{ cursor: 'pointer' }} onClick={() => handleRowClick(proposal , proposal.erefNumber)}>
                                                <td>{proposal.erefNumber}</td>
                                                <td>{proposal.mainProposer}</td>
                                                <td>{proposal.lifeAssured}</td>
                                                <td>{proposal.productType}</td>
                                                <td>{proposal.status}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5">No matching proposals found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
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

export default ProposalSummary;
