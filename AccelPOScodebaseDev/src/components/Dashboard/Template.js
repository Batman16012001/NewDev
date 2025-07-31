import React, { useState, useRef, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "./Template.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { main } from "@popperjs/core";

const SidebarLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation(); // To get the current route
  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null); // Reference for the toggle button
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const goToLoginScreen = () => {
    navigate("/");
  };

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    let overlay = document.getElementById("overlay");

    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";

      // Create overlay if it doesn't exist
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "overlay";
        document.body.appendChild(overlay);

        // Add click event to close the sidebar
        overlay.addEventListener("click", () => setIsSidebarOpen(false));
      }

      overlay.classList.add("active-overlay");
    } else {
      document.body.style.overflow = "auto";
      if (overlay) {
        overlay.classList.remove("active-overlay");
        overlay.removeEventListener("click", () => setIsSidebarOpen(false));
        document.body.removeChild(overlay);
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "auto";
      if (overlay) {
        overlay.removeEventListener("click", () => setIsSidebarOpen(false));
        document.body.removeChild(overlay);
      }
    };
  }, [isSidebarOpen]);

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
    document.body.classList.add("ios-safearea");
  } else {
    document.body.classList.remove("ios-safearea");
  }

  // Map routes to screen names
  const sections = {
    "/dashboard": { main: "Dashboard" },
    "/customer-summary": { main: "Customer", sub: "Customer Summary" },
    "/customer": { main: "Customer", sub: "Customer Details" },
    "/Quotationsummary": {
      main: "Insurance Quotations",
      sub: "Quotation Summary",
    },
    "/mysavedquotations": {
      main: "Insurance Quotations",
      sub: "My Saved Quotations",
    },
    "/sqs_personal_detail": {
      main: "Insurance Quotations",
      sub: "Quotation Personal Details",
    },
    "/benefitselection": {
      main: "Insurance Quotations",
      sub: "Benefit Details",
    },
    "/proposal-summary": {
      main: "Insurance Proposals",
      sub: "Proposal Summary",
    },
    "/agentdetails": { main: "Insurance Proposals", sub: "Agent Details" },
    "/eapp_personaldetails": {
      main: "Insurance Proposals",
      sub: "Proposal Personal Details",
    },
    "/eappaddress_details": {
      main: "Insurance Proposals",
      sub: "Address Details",
    },
    "/benefiecierydetails": {
      main: "Insurance Proposals",
      sub: "Beneficiary Details",
    },
    "/proposedInsuranceDetails": {
      main: "Insurance Proposals",
      sub: "Proposed Insurance",
    },
    "/previousinsurance": {
      main: "Insurance Proposals",
      sub: "Previous Insurance",
    },
    "/clientsdeclaration": {
      main: "Insurance Proposals",
      sub: "Clients Declaration",
    },
    "/signaturecapture": {
      main: "Insurance Proposals",
      sub: "Signature Capture",
    },
    "/documentcapture": { main: "Insurance Proposals", sub: "Document Upload" },
    "/submission": { main: "Insurance Proposals", sub: "Submission" },
    "/familyinformation": {
      main: "Insurance Proposals",
      sub: "Family Information",
    },
    "/generalquestionnaire": { main: "Insurance Proposals" },
    "/about-us": "About Us",
    "/knowledge-bank": "Knowledge Bank",
    "/user-guide": "User Guide",
    "/products": "Products",
    "/settings": "Settings",
    "/backup-data": "Backup Data",
    "/restore-data": "Restore Data",
    "/": "LoginPage",
    "/fnasummary": { main: "Financial Need Analysis", sub: "FNA Summary" },
    "/fnapersonaldetails": {
      main: "Financial Need Analysis",
      sub: "FNA Personal Details",
    },
    "/fnagoaldetails": { main: "Financial Need Analysis", sub: "Goal Setting" },
    "/fnaincomedetails": { main: "Financial Need Analysis", sub: "Income" },
    "/fnaexpensesdetails": { main: "Financial Need Analysis", sub: "Expenses" },
    "/fnasavingsdetails": { main: "Financial Need Analysis", sub: "Savings" },
    "/fnaprovisionsdetails": {
      main: "Financial Need Analysis",
      sub: "Provision for Self/Family",
    },
    "/fnaAssestsdetails": { main: "Financial Need Analysis", sub: "Assests" },
    "/fnaliabilitiesdetails": {
      main: "Financial Need Analysis",
      sub: "Liabilities",
    },
    "/fnacoveragedetails": { main: "Financial Need Analysis", sub: "Coverage" },
    "/fnacalculatorsdetails": {
      main: "Financial Need Analysis",
      sub: "Calculators",
    },
    "/fnariskprofiledetails": {
      main: "Financial Need Analysis",
      sub: "Risk Profile",
    },
     "/fnasignature": {
      main: "Financial Need Analysis",
      sub: "Signature",
    },
     "/fnaproducrrecomnedations": {
      main: "Financial Need Analysis",
      sub: "Product Recomendations",
    },
    "/fnaneeds": {
      main: "Financial Need Analysis",
      sub: "Your Needs",
    },
    "/products": {
      main: "Insurance Products",
      sub: "All Products",
    },
  };

  // Get the current section and subsection based on the route
  const currentSection = sections[location.pathname]?.main || "Unknown Section";
  const currentSubSection = sections[location.pathname]?.sub || "";

  return (
    <>
      <div className="safearea safearea-top"></div>

      <Container fluid className="safearea dashboardcontainer">
        <Row className="safearea">
          {/* Sidebar */}
          <Col
            md={2}
            className={`sidenav bg-light m-3 ${
              isSidebarOpen ? "open" : "closed"
            }`}
            style={{
              display:
                isSidebarOpen || window.innerWidth >= 768 ? "block" : "none",
            }}
          >
            <h4 className="mb-4">
              <div>
                <img
                  src="/AcceLife.png"
                  alt="Login illustration"
                  className="img-fluid"
                  style={{ height: "50px" }}
                />
              </div>
            </h4>
            <nav>
              <ul className="list-unstyled">
                <li className="mt-4">
                  <span className="text-muted">Menu</span>
                </li>
                <li>
                  <Button
                    className="btn btn-light w-100 text-left mb-2"
                    onClick={goToDashboard}
                  >
                    <img
                      src="/DashboardIcon.png"
                      alt="Login illustration"
                      className="img-fluid"
                      style={{ height: "15px", backgroundColor: "#5d5959" }}
                    />
                    <span className="ml-2">Dashboard</span>
                  </Button>
                </li>
                <li>
                  <Button className="btn btn-light w-100 text-left mb-2">
                    <img
                      src="/AboutUsIcon.png"
                      alt="Login illustration"
                      className="img-fluid"
                      style={{ height: "15px" }}
                    />
                    <span className="ml-2">About Us</span>
                  </Button>
                </li>
                <li>
                  <Button className="btn btn-light w-100 text-left mb-2">
                    <img
                      src="/KnowledgeBank.png"
                      alt="Login illustration"
                      className="img-fluid"
                      style={{ height: "15px" }}
                    />
                    <span className="ml-2">Knowledge Bank</span>
                  </Button>
                </li>
                <li>
                  <Button className="btn btn-light w-100 text-left mb-2">
                    <img
                      src="/UserGuide.png"
                      alt="Login illustration"
                      className="img-fluid"
                      style={{ height: "15px" }}
                    />
                    <span className="ml-2">User Guide</span>
                  </Button>
                </li>
                <li>
                  <Button className="btn btn-light w-100 text-left mb-2" onClick={() => navigate("/products")}>
                    <img
                      src="/Products.png"
                      alt="Login illustration"
                      className="img-fluid"
                      style={{ height: "15px" }}
                    />
                    <span className="ml-2">Products</span>
                    
                  </Button>
                </li>
                <li className="mt-4">
                  <span className="text-muted">User</span>
                </li>
                <li>
                  <Button className="btn btn-light w-100 text-left mb-2">
                    <img
                      src="/Settings.png"
                      alt="Login illustration"
                      className="img-fluid"
                      style={{ height: "15px" }}
                    />
                    <span className="ml-2">Settings</span>
                  </Button>
                </li>
                <li>
                  <Button className="btn btn-light w-100 text-left mb-2">
                    <img
                      src="/BackUp.png"
                      alt="Login illustration"
                      className="img-fluid"
                      style={{ height: "15px" }}
                    />
                    <span className="ml-2">Backup Data</span>
                  </Button>
                </li>
                <li>
                  <Button className="btn btn-light w-100 text-left mb-2">
                    <img
                      src="/Rename.png"
                      alt="Login illustration"
                      className="img-fluid"
                      style={{ height: "15px" }}
                    />
                    <span className="ml-2">Restore Data</span>
                  </Button>
                </li>
              </ul>
            </nav>
            <Button
              className="btn btn-danger w-100 logoutbutton"
              onClick={goToLoginScreen}
            >
              LOGOUT
            </Button>
          </Col>

          {/* Main Content */}
          <Col md={10} className="main">
            {/* Dynamic Navigation Bar */}
            <nav className="safearea navbar navbar-light border-bottom mb-3 d-flex align-items-center justify-content-between">
              {/* Left-side icon */}
              <div
                className="d-block d-md-none"
                onClick={goToDashboard}
                style={{ flex: "0 0 auto" }}
              >
                <img
                  src="/AcceLife.png"
                  alt="Login illustration"
                  className="imgfluid"
                  style={{ height: "35px", weight: "35px", cursor: "pointer" }}
                />
              </div>

              <span className="redtext mb-0 h1" style={{ fontWeight: "bold" }}>
                {currentSection}
              </span>

              <div
                className="d-md-none btn red-text toggle-btn"
                onClick={toggleSidebar}
                ref={toggleButtonRef}
                style={{
                  flex: "0 0 auto",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                <FontAwesomeIcon
                  icon={isSidebarOpen ? faTimes : faBars}
                  size="lg"
                />
              </div>
            </nav>

            <div id="main-content">
              {/* Subsection (if available) */}
              {currentSubSection && (
                <div className="subsection h5 ml-sm-2 ml-2">
                  {currentSubSection}
                </div>
              )}
              {children}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Safe Area Bottom */}
      <div className="safearea safearea-bottom"></div>
    </>
  );
};

export default SidebarLayout;
