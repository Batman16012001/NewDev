import React from "react";
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
const Header = () => {
    return (
        <>
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" className="ms-auto" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="#home">Calender-logo</Nav.Link>
                            <Nav.Link href="#link">Agent-logo</Nav.Link>
                            <Nav.Link href="#link">Logout-logo</Nav.Link>
                            <Nav.Link href="#link">Home-logo</Nav.Link>

                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    )
}

export default Header