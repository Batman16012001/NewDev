import React, { useState, useEffect } from 'react';
import './ClientsDeclaration.css'
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft,faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { findRecordById, saveDetail } from '../../db/indexedDB';
import { clientsDeclResponse } from '../../components/Declaration/ClientsDeclarationService';
import SidebarLayout from '../../components/Dashboard/Template';

const ClientDeclarationDetails = () => {
  const [checkboxes, setCheckboxes] = useState({});
  const [declarations, setDeclarations] = useState([]);
  const [error, setError] = useState(false);  
  const navigate = useNavigate();
  const consentId = sessionStorage.getItem('consent_id');
  const sqsId = sessionStorage.getItem('sqsID');
  const [productName, setProductName] = useState('');

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Step 1: Fetch product name from IndexedDB using sqsID
        const sqsDetails = await findRecordById('al_sqs_details', sqsId);
        if (sqsDetails && sqsDetails.result) {
          const fetchedProductName = sqsDetails.result.policyDetails.productType; 
          // const fetchedProductName = "Investment"; 
          // const fetchedProductName = "CRA"; 
          // const fetchedProductName = "Pradeepa"; 
          setProductName(fetchedProductName);
  
          // Step 2: Fetch declarations using the fetched product name
          console.log('Fetching declarations for product:', fetchedProductName);
          const response = await clientsDeclResponse(fetchedProductName);
          console.log('API Response:', response);
  
          if (response.declaration) {
            // Create initialCheckboxState based on the number of declarations
            const initialCheckboxState = {};
            response.declaration.forEach((_, index) => {
              initialCheckboxState[`checkbox${index + 1}`] = false;
            });
  
            setCheckboxes(initialCheckboxState);
            setDeclarations(response.declaration);
            console.log('Declarations set in state:', response.declaration);
  
            // Step 3: Fetch saved consent data from IndexedDB
            const savedConsent = await findRecordById('al_consent_and_decl_details', consentId);
            console.log("Fetched data from IndexedDB:", savedConsent);
  
            if (savedConsent) {
              // Dynamically set checkbox states based on savedConsent and number of declarations
              const dynamicCheckboxState = {};
              response.declaration.forEach((_, index) => {
                dynamicCheckboxState[`checkbox${index + 1}`] = savedConsent.result.client_declaration === 'Y' ? true : false;
              });
  
              setCheckboxes(dynamicCheckboxState);
            }
          }
        } else {
          console.error('SQS details not found for sqsId:', sqsId);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [consentId, sqsId]);
  
  
  const handleCheckboxChange = (e) => {
    setCheckboxes({
      ...checkboxes,
      [e.target.name]: e.target.checked,
    });
  };

  const handleSubmit = async () => {
    const allChecked = Object.values(checkboxes).every(Boolean);
    if (!allChecked) {
      setError(true);
    } else {
      const consent_id = consentId || `consent${Date.now()}`;
      sessionStorage.setItem('consent_id', consent_id);

      const consentData = {
        consent_id,
        client_declaration: allChecked ? 'Y' : 'N',
        ...checkboxes,
      };

      try {
        await saveDetail("al_consent_and_decl_details", consentData);
	      console.log("Data saved under ConsentID:", consentData);
      } catch (error) {
        console.error("Failed to save data for", consentData);
      }
      navigate("/signaturecapture");
    }
  };

  const closeModal = () => {
    setError(false);
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
        document.body.classList.add("ios-safearea");
      } else {
        document.body.classList.remove("ios-safearea");
      }

  return (
    <SidebarLayout>
      <div className="clientsDeclaration-detail-container">
                {/* <div className="clientsDeclaration-navbar bg-white mb-4 p-3 shadow-sm">
                    <div className="backArrow pt-2"  onClick={() => navigate('/familyinformation')}>
                        <FontAwesomeIcon icon={faArrowLeft} className="backPointer red-text" />
                        <span className="ms-2 red-text ml-2">Clients Declaration</span>
                    </div>
                    <div className="border-bottom mt-2"></div>
                </div> */}


        <div className='clientsDeclarationForm'>
          <p>I/We, do hereby jointly and severally declare and agree that:</p>

          {declarations.map((declaration, index) => {
            const [questionNumber, ...statement] = declaration.split(' ');
            return (
              <div className="row mb-3" key={index}>
                <div className="col-1">{questionNumber}</div>
                <div className="col-9" style={{textAlign:'justify'}}>{statement.join(' ')}</div>
                <div className="col-2">
                  <input
                    type="checkbox"
                    name={`checkbox${index + 1}`}
                    checked={checkboxes[`checkbox${index + 1}`] || false}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div
            className="modal fade show"
            tabIndex="-1"
            role="dialog"
            aria-labelledby="errorModalLabel"
            aria-hidden="true"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-body">
                  Please check all the boxes to proceed.
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-danger" onClick={closeModal}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

      {!isKeyboardVisible && (
        <div className="iosfixednextprevbutton">
              <div className="fixednextprevbutton d-flex justify-content-between">  
                              <button 
                                  type="button" 
                                  className="btn btn-secondary btnprev" 
                                  onClick={() => navigate('/familyinformation')}
                              > Prev </button>
                    <button type="submit" className="btn btnnext" onClick={handleSubmit}>
                    Next
                    </button>
              </div>
              </div>
      )}
      </div>
    </SidebarLayout>
  );
};

export default ClientDeclarationDetails;
