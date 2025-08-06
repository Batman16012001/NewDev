import React, { useState,useEffect } from "react";
import './Dashboard.css'
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Dropdown, Button,Modal } from "react-bootstrap";
import Loader from "react-spinner-loader";
import SidebarLayout from '../../components/Dashboard/Template';

const Dashboard = () => {
    const navigate_to_quotation = useNavigate();
    const navigate = useNavigate();
    const [loader, setLoader] = useState(false);
    const [modalShow, setModalShow] = React.useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

      const [proposalNumberIs, setProposalNumber] = useState('') //shubham

    // Function to update the current date every day
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000 * 60 * 60 * 24); // Updates every 24 hours
    return () => clearInterval(interval);
  }, []);

  // Extract date information
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  //Shubham
    function MyVerticallyCenteredModal(props) {
      return (
        <Modal
          {...props}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
    
          <Modal.Body>
            <p>
            {proposalNumberIs}
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={props.onHide}>Ok</Button>
          </Modal.Footer>
        </Modal>
      );
    }

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  const renderCalendarDays = () => {
    const days = [];
    const firstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay();
    const totalDays = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    // Push empty cells for the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div className="calendar-day empty" key={`empty-${i}`}></div>);
    }

    // Push all days of the current month
    for (let day = 1; day <= totalDays; day++) {
      const isToday =
        day === currentDate.getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? "today" : ""}`}
          style={{
            fontWeight: isToday ? "bold" : "normal",
            color: isToday ? "#fff" : "black",
          }}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const CustomerSummary = () => {
    setLoader(true);
    setTimeout(() => {
      setLoader(false);
      navigate('/customer-summary', { state: { from: "Dashboard" } });
    }, 1000);
  };
    
  const goToQuotation = () => {
    setLoader(true);
    setTimeout(() => {
      setLoader(false);
    navigate_to_quotation('/Quotationsummary');
    }, 1000);
  };

  //shubham
  const goToFNA = () =>{

    setLoader(true);
      navigate_to_quotation('/fnasummary');
    // const alertIs = "Currently this module is unavailable";
    // setProposalNumber(alertIs);
    // setModalShow(true);

  }

  const ProposalSummary = () => {
    setLoader(true);
    setTimeout(() => {
        setLoader(false);
      navigate_to_quotation('/proposal-summary');
    }, 1000);
  };

  const goToLoginScreen = () => {
    navigate('/');
  }

  // Function to navigate to previous or next month
  const handleMonthChange = (offset) => {
    setCurrentDate((prevDate) => {
      const today = new Date(); // Today's date
      const newMonth = prevDate.getMonth() + offset;
      const newYear = prevDate.getFullYear();
  
      // Check if the new date matches the current month and year
      const isCurrentMonth =
        newMonth === today.getMonth() && newYear === today.getFullYear();
  
      // If going to the current month, reset to today's date; otherwise, keep the same day
      return new Date(
        isCurrentMonth ? today.getFullYear() : newYear,
        isCurrentMonth ? today.getMonth() : newMonth,
        isCurrentMonth ? today.getDate() : prevDate.getDate()
      );
    });
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
        document.body.classList.add("ios-safearea");
      } else {
        document.body.classList.remove("ios-safearea");
      }
      
  return (
    
    <SidebarLayout>
    <Container fluid >
      <Row>
      
        {/* Main Content */}
        <Col md={10} className="p-4">
          {/* Top Bar */}
          <Row>
          <Col md={12}>
            {/* <div className="right-navbar bg-white p-3 shadow-sm d-flex justify-content-between align-items-center border-bottom">
              <h4 className="red-text m-0">Dashboard</h4>
              <div className="d-flex align-items-center">
                <img 
                  src="/notification.png" 
                  alt="Notification Icon" 
                  className="notificationicon mx-3"
                  style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                />
                {/* <img 
                  src="/profile-photo.jpg" 
                  alt="Profile Photo" 
                  className="profile-photo rounded-circle"
                  style={{ width: '40px', height: '40px', objectFit: 'cover', cursor: 'pointer' }}
                /> 
              </div>
            </div> */}
          </Col>
          </Row>

          {/* Dashboard Cards */}
          <div className="dashboard-container">
            <Row>
              <Col  md={8}>
                <Row>
                  <Col className="mb-4">
                    {/* <Card className="h-100 shadow-sm" style={{ minHeight: "180px",borderRadius: "0.95rem", boxShadow: '0 4px 6px #0000001a', border: 'none' }}>
                      <Card.Body> */}
                      <img 
                          src="/leadgraph.png" 
                          alt="Customer" 
                          className="w-100 leadgraph" 
                          style={{ borderRadius: "0.95rem" }} 
                        />
                        {/* <Card.Title>Lead</Card.Title> */}
                      {/* </Card.Body>
                    </Card> */}
                  </Col>
                </Row>

                <Row>
                  {/* First Row */}
                  <Col className="mb-4 mt-5 mt-sm-0 col-6 col-md-6">
                    <Card onClick={CustomerSummary} className="shadow-sm" style={{ borderRadius: "0.95rem", boxShadow: '0 4px 6px #0000001a', border: 'none' }} >
                      <Card.Body>
                        <img 
                          src="/Customer.png" 
                          alt="Customer" 
                          className="img-fluid" 
                          style={{ height: "45px", borderRadius: "0.95rem" }} 
                        />
                        <Card.Title className="mt-2">Customer</Card.Title>
                        {/* <h5 style={{ fontSize: '10px',marginTop: '-50px'}}>See Reports &gt;</h5> */}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col className="mb-4 mt-5 mt-sm-0 col-6 col-md-6">
                    <Card onClick={ProposalSummary} className="shadow-sm" style={{ borderRadius: "0.95rem", boxShadow: '0 4px 6px #0000001a', border: 'none' }}>
                      <Card.Body>
                        <img 
                          src="/Proposal.png" 
                          alt="Proposal" 
                          className="img-fluid" 
                          style={{ height: "45px" }} 
                        />
                        <Card.Title className="mt-2">Proposal</Card.Title>
                        {/* <span style={{ fontSize: '10px',marginTop: '-50px' }}>See Reports &gt;</span> */}
                      </Card.Body>
                    </Card>
                  </Col>
                  {/* <Col md={4} className="mb-4 col-6">
                    <Card className="shadow-sm" style={{ borderRadius: "0.95rem", boxShadow: '0 4px 6px #0000001a', border: 'none' }}>
                      <Card.Body>
                        <img 
                          src="/products.png" 
                          alt="Products" 
                          className="img-fluid" 
                          style={{ height: "45px" }} 
                        />
                        <Card.Title className="mt-2">Products</Card.Title>
                         {/* <span style={{ fontSize: '10px',marginTop:'-50px' }}>See Reports &gt;</span>  
                      </Card.Body>
                    </Card>
                  </Col>  */}
                </Row>
                <Row>
                  {/* Second Row */}
                  <Col md={6} className="mb-4 ">
                    <Card onClick={goToQuotation} className="shadow-sm" style={{ borderRadius: "0.95rem", boxShadow: '0 4px 6px #0000001a', border: 'none' }}>
                      <Card.Body>
                        <img 
                          src="/Quote.png" 
                          alt="Insurance Quote" 
                          className="img-fluid" 
                          style={{ height: "45px" }} 
                        />
                        <Card.Title className="mt-2">Insurance Quote</Card.Title>
                        {/* <span style={{ fontSize: '10px' ,marginTop: '-50px'}}>See Reports &gt;</span> */}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6} className="mb-4 ">
                    <Card className="shadow-sm" style={{ borderRadius: "0.95rem", boxShadow: '0 4px 6px #0000001a', border: 'none' }} onClick={goToFNA}>
                      <Card.Body>
                        <img 
                          src="/FNA.png" 
                          alt="Financial Need Analysis" 
                          className="img-fluid" 
                          style={{ height: "45px" }} 
                        />
                        <Card.Title className="mt-2">FNA</Card.Title>
                        {/* <span style={{ fontSize: '10px',marginTop: '-50px' }}>See Reports &gt;</span> */}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Col>

              <Col md={4} className="bg-light" style={{  borderRadius: "0.95rem", display: window.innerWidth >= 768 ? 'block' : 'none' }}>
              <Card.Title className="text-start mt-2">Calendar</Card.Title>
                <Card className="shadow-sm" style={{ borderRadius: "0.95rem", boxShadow: '0 4px 6px #0000001a', border: 'none' }}>
                  <Card.Body>
                    {/* <Card.Title className="text-start">Calendar</Card.Title> */}
                    <div className= "calendar-container">
                      <div className="calendar-header d-flex justify-content-between align-items-center mb-3">
                        <button
                          className="calendar-nav-btn"
                          onClick={() => handleMonthChange(-1)}
                        >
                          &lt;
                        </button>
                        <h5 className="mb-0">
                          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h5>
                        <button
                          className="calendar-nav-btn"
                          onClick={() => handleMonthChange(1)}
                        >
                          &gt;
                        </button>
                      </div>
                      <div className="calendar-grid">
                        {daysOfWeek.map((day) => (
                          <div key={day} className="calendar-day-header">
                            {day}
                          </div>
                        ))}
                        {renderCalendarDays()}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
        
      {/* Loader */}
      {loader && <Loader show={loader} />}
                      
      {/* Modal for showing alert */}

      {/* Shubham */}
      <MyVerticallyCenteredModal
                          show={modalShow}
                          onHide={() => setModalShow(false)}
                        />

    </Container>
    </SidebarLayout>
  );
};

export default Dashboard;