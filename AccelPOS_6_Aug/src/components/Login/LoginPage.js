import React, { useState,useEffect } from 'react';
import './Login.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { saveDetail } from '../../db/indexedDB'; 
import { loginResponse, getAuthToken } from '../../components/Login/LoginService';
import { Modal, Form, Button } from 'react-bootstrap'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons';
import Loader from "react-spinner-loader";

const LoginForm = () => {
    const navigate = useNavigate();
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loader, setLoader] = useState(false); 
    const [modalShow, setModalShow] = React.useState(false);
    const [loginDetails, setLoginDetails] = useState('')
    const togglePasswordVisibility = () => setShowPassword(!showPassword); 
    const handleForgotPasswordClick = () => setShowForgotModal(true);
    const handleCloseForgotModal = () => setShowForgotModal(false);

    // Utility functions to disable/enable scrolling
const disableBodyScroll = () => {
    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";
  };
  
  const enableBodyScroll = () => {
    document.body.style.overflow = "";
    document.body.style.height = "";
  };

  useEffect(() => {
    // Handle focus and blur events for inputs
    const inputs = document.querySelectorAll("input, select, textarea");

    const handleFocus = () => disableBodyScroll();
    const handleBlur = () => enableBodyScroll();

    inputs.forEach((input) => {
      input.addEventListener("focus", handleFocus);
      input.addEventListener("blur", handleBlur);
    });

    return () => {
      inputs.forEach((input) => {
        input.removeEventListener("focus", handleFocus);
        input.removeEventListener("blur", handleBlur);
      });
    };
  }, []);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
        document.body.classList.add("ios-safearea");
      } else {
        document.body.classList.remove("ios-safearea");
      }

    // Formik form validation and handling
    const formik = useFormik({
        initialValues: {
            id: '',
            password: '',
        },
        validationSchema: Yup.object({
            id: Yup.string()
                .min(6, 'Agent ID must be at least 4 characters long')
                .required('Agent ID is required'),
            password: Yup.string()
                .min(6, 'Password must be at least 6 characters long')
                .required('Password is required'),
        }),
        onSubmit: async (values) => {
            setLoader(true); // Start loader on form submission

            // Check if required fields are filled
            if (values['id'] === "" || values['password'] === "") {
                setLoader(false); // Stop loader if fields are empty
                setLoginDetails("Please fill all required fields");
                setModalShow(true); // Show the modal with the error message
                return;
            }

            try {
                const response = await loginResponse(values.id, values.password);
                console.log('Login successful:', response);
                
                // Save details to IndexedDB
                const agentDetail = {
                    id: values.id,
                    password: values.password
                };
                await saveDetail('al_agent_details', agentDetail);

                sessionStorage.setItem('agentId', values.id); 
                console.log('Login id:', values.id);
                
                navigate('/dashboard');
            } catch (error) {
                console.error('Login failed:', error);
                setLoginDetails("Login failed. Please check your credentials."); // Set error message
                setModalShow(true); // Show the modal with the error message
            } finally {
                setLoader(false); // Stop loader after attempt
            }
        }
    });
    
    return (
        <>
        <div className="safearea safearea-top"></div>
            <div className="safe-area container-fluid p-xl-5  login-bg-image vh-100 d-flex align-items-center justify-content-center">
            <div className="row h-100 login-form">
            <div className="col-lg-6 col-md-6 p-2">
                    <div
                        className="h-100 d-flex align-items-center justify-content-center"
                        style={{ backgroundColor: '#CA001D', borderRadius: '10px', height: '100%' }}
                    >
                        {/* Hidden on mobile devices */}
                        <img 
                            src="/LoginLeftImage.png" 
                            alt="Login illustration" 
                            className="img-fluid tab-logo d-none d-md-block"
                        />
                        {/* Visible only on mobile devices */}
                        <img 
                            src="/Accellogo.png" 
                            alt="Login illustration" 
                            className="mobile-logo d-block d-md-none"
                        />
                    </div>
                </div>
                <h2 className="mb-4 ml-3 welcometext showmobile">Welcome Back!</h2>
                    <div className="col-lg-6 col-md-6 mx-auto d-flex align-items-center justify-content-center">
                        <div className="img-logo-container">
                            <img 
                                src="/AcceLife.png" 
                                alt="Login illustration for tablet" 
                                className="img-logo tablet-logo"
                            />
                            
                            
                            <Form onSubmit={formik.handleSubmit} className='loginform'>
                            <h2 className="mb-4 welcometext showtab">Welcome Back!</h2>
                                <div className="form-group">
                                    <label htmlFor="id">Agent ID</label>
                                    <input
                                        type="text"
                                        name="id"
                                        id="id"
                                        className={`form-control ${formik.touched.id && formik.errors.id ? 'is-invalid' : ''}`}
                                        placeholder="Agent ID"
                                        value={formik.values.id}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.touched.id && formik.errors.id && <div className="invalid-feedback">{formik.errors.id}</div>}
                                </div>
                                <div className="form-group position-relative">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        id="password"
                                        className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                                        placeholder="Password"
                                        value={formik.values.password}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    <FontAwesomeIcon
                                        icon={showPassword ? faEye : faEyeSlash}
                                        className="position-absolute"
                                        style={{ top: "45px", right: "10px", cursor: "pointer" }}
                                        onClick={togglePasswordVisibility}
                                    />
                                    {formik.touched.password && formik.errors.password && <div className="invalid-feedback">{formik.errors.password}</div>}
                                    <a href="#" className="small d-flex justify-content-end" onClick={handleForgotPasswordClick} style={{ color: 'black' }}>Forgot Password?</a>
                                </div>

                                {/* <div className="d-flex justify-content-end mt-2">
                                    <a href="#" className="small" onClick={handleForgotPasswordClick} style={{ color: 'black' }}>Forgot Password?</a>
                                </div> */}

                                <div className="form-group mt-2">
                                    <select className="form-control" defaultValue="English">
                                        <option>Select Language</option>
                                        <option>English</option>
                                        <option>Sinhala</option>
                                        <option>Tamil</option>
                                    </select>
                                </div>

                                <Button variant="danger" type="submit" className="w-100 mt-4" style={{ borderRadius: '0.45rem' }}>LOGIN</Button>

                                {loader && <Loader show={loader} />}
                                
                                {/* Modal for showing alert */}
                                <Modal
                                    show={modalShow}
                                    onHide={() => setModalShow(false)}
                                >
                                    <Modal.Body>{loginDetails}</Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="primary" onClick={() => setModalShow(false)}>
                                            Close
                                        </Button>
                                    </Modal.Footer>
                                </Modal>
                            </Form>

                            <div className="text-center my-2">
                                <span>OR</span>
                            </div>

                            <div className="form-group mt-2">
                                <Button
                                    className="w-100 mb-3 d-flex align-items-center justify-content-center"
                                    style={{ backgroundColor: '#fff', border: '1px solid #ced4da', color: '#000000' }}
                                >
                                Login with Google
                                    <img 
                                        width="24" 
                                        height="24" 
                                        src="https://img.icons8.com/color/48/google-logo.png" 
                                        alt="google-logo" 
                                        className="mr-2"
                                    />
                                
                                </Button>
                            </div>

                            <div className="text-center mt-2">
                                <span>Don’t have an account? <a href="#" onClick={() => navigate('/signup', { state: { agentId: sessionStorage.getItem('id') } })} style={{ color: '#CA001D' }}>Sign Up</a></span>
                            </div>


                            {/* Forgot Password Modal */}
                            <Modal show={showForgotModal} onHide={handleCloseForgotModal}>
                                <Modal.Header>
                                    <Modal.Title>Forgot Password</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <div className="form-group">
                                        <label htmlFor="forgotAgentId">Agent ID</label>
                                        <input type="text" id="forgotAgentId" className="form-control" />
                                    </div>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="danger" onClick={handleCloseForgotModal}>
                                        Close
                                    </Button>
                                    <Button variant="danger">
                                        Send SMS
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </div>
                    </div>
                </div>
            </div>
        <div className="safearea safearea-bottom"></div>
        </>
    );
};
export default LoginForm;
