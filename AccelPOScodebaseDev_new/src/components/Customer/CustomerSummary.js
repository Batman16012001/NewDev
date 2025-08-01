import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CustomerSummary.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus, faSlidersH, faSearch,faAngleUp, faAngleDown,faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { fetchDetails } from '../../db/indexedDB'; 
import { summaryResponse } from './CustomerService';
import SidebarLayout from '../../components/Dashboard/Template';

const CustomerSummary = () => {
    const [summaryData, setSummaryData] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const fromPage = location.state?.from || "Unknown";
    console.log("Data navigated from:", fromPage);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 7; // Number of records per page

    // Get clientId and agentId from sessionStorage
    const clientId = sessionStorage.getItem('clientId');
    const agentId = sessionStorage.getItem('agentId');
    const [filter, setFilter] = useState([]);
    const [isDropdownVisible, setDropdownVisible] = useState(false); 
    const [searchTerm, setSearchTerm] = useState(''); 
    const dropdownRef = useRef(null);
    const filterButtonRef = useRef(null); 

    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    
      useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                let apiData = []; // Store only API data
    
                if (agentId) {
                    try {
                        const apiResponse = await summaryResponse(agentId);
                        console.log('API response:', apiResponse);
    
                        if (apiResponse && apiResponse.length > 0) {
                            apiData = apiResponse.map(customer => {
                                const demographics = customer.segmentation?.demographics || {};
                                const geographic = customer.segmentation?.geographic || {};
                                const productInterest = customer.segmentation?.productInterest || [];
                                const status = customer.statusHistory?.[0]?.status || 'Unknown';
    
                                return {
                                    leadId: customer._id || '',
                                    name: {
                                        first: customer.name.first || '',
                                        last: customer.name.last || '',
                                        title: customer.name.title || '',
                                        middle: customer.name.middle || '',
                                    }, 
                                    mobile: customer.mobile || '',
                                    email: customer.email || '',
                                    status: status,
                                    segmentation: {
                                        demographics: {
                                            dob: demographics.dob || '',
                                            gender: demographics.gender || '',
                                            income: demographics.income || '',
                                            maritalStatus: demographics.maritalStatus || '',
                                            occupation: demographics.occupation || ''
                                        },
                                        geographic: {
                                            state: geographic.state || '',
                                            city: geographic.city || '',
                                            pinCode: geographic.pinCode || ''
                                        },
                                        productInterest: productInterest || []   
                                    },
                                    source: customer.source || '',
                                    createdAt: customer.createdAt || '',
                                    updatedAt: customer.updatedAt || '',
                                };
                            });
    
                            // **Sort API data (recent cases first)**
                            apiData.sort((a, b) => {
                                const dateA = new Date(a.updatedAt || a.createdAt || 0);
                                const dateB = new Date(b.updatedAt || b.createdAt || 0);
                                return dateB - dateA; // **Descending order (latest first)**
                            });
    
                        } else {
                            console.warn('No valid API data found for agentId:', agentId);
                        }
                    } catch (apiError) {
                        console.error('Error fetching customer data from API:', apiError);
                    }
                } else {
                    console.warn('No agentId provided to fetch API data.');
                }
    
                // **Set only API data (IndexedDB data is removed)**
                setSummaryData(apiData);
                console.log("Final API data (Sorted by recent cases):", apiData);
    
            } catch (error) {
                console.error('Error fetching customer data:', error);
            }
        };
    
        const handleResize = () => {
            const viewportHeight = window.visualViewport.height;
            const screenHeight = window.screen.height;
      
            // If viewport height is significantly less than screen height, keyboard is likely open
            setIsKeyboardVisible(viewportHeight < screenHeight * 0.85);
         };
      
        fetchCustomerData();
        handleResize();

        window.visualViewport.addEventListener("resize", handleResize);
          return () => {
            window.visualViewport.removeEventListener("resize", handleResize);
          };
    }, [agentId]);
    
    
    const handleCreateCustomerClick = () => {
        console.log('Before Reset: ');
        sessionStorage.removeItem('clientId'); // Clear client ID
        console.log('After Reset: ');  
        sessionStorage.setItem('isNewCustomer', 'true');  
        navigate('/customer'); 
    };

    const handleRowClick = (customer) => {
        console.log('Clicked customer:', customer);
    
        const customerLeadId = customer.leadId;
        const setLeadID = sessionStorage.setItem('setLeadID',customerLeadId)
        console.log("setLeadID-->",setLeadID)

        const customerClientId = customer.client_id;
        
        // Directly access the name fields instead of splitting a string
        const firstName = customer.name?.first || '';
        const lastName = customer.name?.last || '';
        const nameWithInitials = `${firstName} ${lastName}`; // Combining firstName and lastName
    
        if (customerLeadId) {
            console.log('Lead ID:', customerLeadId);
            
    
            const segmentation = customer.segmentation || {};
            const demographics = segmentation.demographics || {};
            const geographic = segmentation.geographic || {};
            const productInterest = segmentation.productInterest || [];
    
            navigate('/customer', { 
                state: {
                    source: 'API',
                    customerData: {
                        nameWithInitials: nameWithInitials, 
                        title: customer.name?.title || '',
                        firstName: firstName,
                        lastName: lastName,
                        email: customer.email || '',
                        mobile: customer.mobile || '',
                        ...demographics,
                        ...geographic,
                        source: customer.source || '',
                        productInterest: productInterest,
                    },
                    leadId: customerLeadId
                }
            });
            sessionStorage.setItem('isNewCustomer', 'false');
        } else if (customerClientId) {
            console.log('Client ID:', customerClientId);
            sessionStorage.setItem('clientId', customerClientId);
            sessionStorage.setItem('isNewCustomer', 'false');
    
            navigate('/customer', { 
                state: {
                    source: 'IndexedDB',
                    customerData: customer
                }
            });
        } else {
            console.error('No valid ID found for the selected customer');
        }
    };
    
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
        { id: 1, value: 'customer', label: 'Customer' },
        { id: 2, value: 'new', label: 'New' },
        { id: 3, value: 'submitted', label: 'Submitted' },
    ];

    const filteredRecords = summaryData.filter(customer => {
        const customerName = 
            typeof customer.name === 'string'
                ? customer.name.toLowerCase()
                : `${customer.name?.first || ''} ${customer.name?.last || ''}`.toLowerCase();
        
        return (
            (filter.length === 0 || filter.some(f => customer.status?.toLowerCase() === f.toLowerCase())) &&
            (searchTerm === '' ||
                customerName.includes(searchTerm.toLowerCase()) ||
                (customer.mobile?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (customer.status?.toLowerCase() || '').includes(searchTerm.toLowerCase()))
        );
    });

    // Calculate pagination details
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

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

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
        document.body.classList.add("ios-safearea");
      } else {
        document.body.classList.remove("ios-safearea");
      }

    return (
        <SidebarLayout>
            <div className="customersummary-container">
                <div className="summaryform">
                    <div className="row align-items-center justify-content-between mb-3">
                        {/* Search Bar */}
                        <div className="col-md-5 mt-2">
                        <div
                            className="form-control d-flex align-items-center"
                            style={{ border: 'none', boxShadow: '0 0 10px #0000001a' }}
                        >
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

                        {/* Filter Button */}
                        <div className="col-md-5 mt-2">
                        <div
                            className="form-control d-flex align-items-center justify-content-between"
                            id="filterDropdownButton"
                            ref={filterButtonRef}
                            onClick={toggleDropdown}
                            style={{ border: 'none', boxShadow: '0 0 10px #0000001a' }}
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
                    <div className='iostable'>
                        <div className="table-responsive mobiletable">
                            <table className="table table-striped tabwidth">
                            <thead className="heading">
                                <tr>
                                <th>Customer Name</th>
                                <th>Mobile Number</th>
                                <th>Email ID</th>
                                <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.length > 0 ? (
                                currentRecords.map((customer, index) => (
                                    <tr
                                    key={index}
                                    onClick={() => handleRowClick(customer)}
                                    style={{ cursor: 'pointer' }}
                                    >
                                    <td>
                                        {typeof customer.name === 'string'
                                        ? customer.name
                                        : `${customer.name?.first || ''} ${
                                            customer.name?.last || ''
                                            }`}
                                    </td>
                                    <td>{customer.mobile}</td>
                                    <td>{customer.email}</td>
                                    <td>{customer.status}</td>
                                    </tr>
                                ))
                                ) : (
                                <tr>
                                    <td colSpan="5">No customer data available</td>
                                </tr>
                                )}
                            </tbody>
                            </table>
                        </div>
                    </div>
                    
                </div>


                {/* Pagination */}
                {!isKeyboardVisible && (
                    <div className="pagination-container fixed-bottom">
                        <button onClick={goToPrevPage} disabled={currentPage === 1} className="left" >&lt;</button>
                        {renderPageNumbers()}
                        <button onClick={goToNextPage} disabled={currentPage === totalPages} className="right">&gt;</button>
                    </div>
                )}

                <button className="floating-plus-button" onClick={handleCreateCustomerClick}>
                    <span> <FontAwesomeIcon icon={faPlus} className="backPointer" /></span>
                </button>
            </div>
            
        </SidebarLayout>
    );
};

export default CustomerSummary;  