import React, { useState, useEffect } from 'react'
import "./ProposedInsuranceDetails.css"
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { findRecordById, updateDetailById } from '../../db/indexedDB';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/Dashboard/Template';

const AccordionItem = ({ title, children, isOpen, onClick, disabled }) => {
    return (
        <div className="accordion-item mt-2">
            <button
                className={`accordion-title ${disabled ? 'disabled' : 'enabled'}`}
                onClick={!disabled ? onClick : null}
                disabled={disabled}
            >
                {title}
                <FontAwesomeIcon
                    icon={isOpen ? faAngleUp : faAngleDown}
                    className="accordion-icon"
                />
            </button>
            {isOpen && <div className="accordion-content">{children}</div>}
        </div>
    );
};


const ProposedInsuranceDetails = () => {
    const [openItem, setOpenItem] = useState([]);
    const [rider_data, setriderdata] = useState([]);
    const navigate = useNavigate()
    const [submitclicked , setsubmitclicked] = useState(false)
    //const coverages = rider_data.result.mlife.coverages
    const paymentFrequencyMap = {
        M: 'Monthly',
        Q: 'Quarterly',
        A: 'Annually',
        H: 'Half Yearly' ,
        S: 'Single'
    };
    // Get the application type from sessionStorage


    const applicationType = sessionStorage.getItem("applicationType");
    console.log("ApplicationType:::", applicationType);

    const sqsid = sessionStorage.getItem("sqsID")
    const riderid = sessionStorage.getItem("riderID")

    const validationSchema = Yup.object().shape({
        PaymentMethod: Yup.string().required('Required')
    });

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

    // When the component mounts, handle accordion opening based on application type
    useEffect(() => {
        if (applicationType) {
            if (applicationType === 'Single Life') {
                setOpenItem(['lifeA']); // Open Life A accordion
            } else if (applicationType === 'Joint Life') {
                setOpenItem(['lifeA', 'lifeB']); // Open both Life A and Life B accordions
            }
        }
        console.log("Component loaded");
    }, [applicationType]);

    useEffect(() => {

        const fetchData = async () => {
            try {
                const data = await findRecordById("al_sqs_details", sqsid);
                console.log("SQS data:::", data)

                formik.setFieldValue('PlanName', data.result.policyDetails.productName);
                formik.setFieldValue('SumAssured', 7885);
                const paymentFrequency = paymentFrequencyMap[data.result.payment.paymentFrequency] || data.result.payment.paymentFrequency;

                formik.setFieldValue('PaymentTerm', paymentFrequency);
                //formik.setFieldValue('PaymentMode', data.result.payment.paymentMode);
                if(data.result.payment.PaymentMethod){
                    formik.setFieldValue("PaymentMethod" , data.result.payment.PaymentMethod)
                }

                const riderdata = await findRecordById("al_rider_details", riderid);
                console.log("Rider data:::", riderdata.result.primaryInsured);
                if (Array.isArray(riderdata.result.primaryInsured.coverages)) {
                    riderdata.result.primaryInsured.coverages.forEach((rider, index) => {
                        // Set PolicyTerm based on riderTerm
                        formik.setFieldValue(`PolicyTerm`, rider.benefitPeriod.riderTerm);
                        // Set riderPremium

                    });
                } else {
                    console.error("coverages is not an array:", riderdata.result.primaryInsured.coverages);
                }

                setriderdata(riderdata)
                console.log("Rider data::", rider_data)




            } catch (e) {
                console.log("Error while fetching::", e)
            }
        }
        fetchData();

    }, [])

    // Function to toggle accordion open state
    const handleAccordionClick = (item) => {
        setOpenItem((prevOpenItems) => {
            const updatedItems = Array.isArray(prevOpenItems) ? [...prevOpenItems] : [];

            if (updatedItems.includes(item)) {
                return updatedItems.filter(openItem => openItem !== item); // Close item
            } else {
                return [...updatedItems, item]; // Open item
            }
        });
    };

    const formik = useFormik({
        initialValues: {
            PlanName: '',
            SumAssured: '',
            PolicyTerm: '',
            PaymentTerm: '',
            //PaymentMode: '',
            PaymentMethod: ''
        },
        validationSchema,
        validateOnBlur: true, // Ensure validation runs on blur
        validateOnChange: true, // Ensure validation runs on change
        onSubmit: async values => {
            console.log('Form data', values);
            const PaymentMethod = values.PaymentMethod
            try {

                const sqsdata = await findRecordById("al_sqs_details", sqsid);
                console.log("SQS data:::", sqsdata)


                let updateddata = sqsdata.result
                console.log("updateddatrs:", updateddata)
                updateddata.payment['PaymentMethod'] = PaymentMethod

                await updateDetailById("al_sqs_details", sqsid, updateddata);
                console.log("Data updated successfully")

                setsubmitclicked(true)



            } catch (e) {
                console.log("Error:::", e)
            }
        }
    });
    const handleCombinedSubmit = async () => {
        formik.setTouched({
            PaymentMethod: true,
        });
        const isValid = await formik.validateForm(); // Validate the form explicitly
        if (Object.keys(isValid).length === 0) {
            // Only submit if there are no validation errors
            await formik.handleSubmit();
            navigate('/generalquestionnaire');
        } else {
            console.log("Validation failed:", isValid); // Log any validation errors
        }
    };

    return (
        <SidebarLayout>
            <div className="proposed-detail-container">
                {/* <div className="proposed-navbar bg-white mb-4 p-3 shadow-sm">
                    <div className="backArrow pt-2" onClick={() => navigate('/previousinsurance')}>
                        <FontAwesomeIcon icon={faArrowLeft} className="backPointer red-text" />
                        <span className="ms-2 red-text ml-2">Proposed Insurance</span>
                    </div>
                    <div className="border-bottom mt-2"></div>
                </div> */}

                <div className='proposedForm'>
                    <div className='row mb-3'>
                        <div className="col-md-6 mb-3">
                            <label>Policy Term</label>
                            <input
                                type="text"
                                id="PolicyTerm"
                                name="PolicyTerm"
                                className="form-control"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.PolicyTerm}
                                disabled
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label>Payment Term</label>
                            <input
                                type="text"
                                id="PaymentTerm"
                                name="PaymentTerm"
                                className="form-control"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.PaymentTerm}
                                disabled
                            />
                        </div>
                    </div>

                    <div className='row mb-3'>
                        {/* <div className="col-md-6 mb-3">
                            <label>Payment Mode</label>
                            <input
                                type="text"
                                id="PaymentMode"
                                name="PaymentMode"
                                className="form-control"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.PaymentMode}
                                disabled
                            />
                        </div> */}
                        <div className="col-md-6 mb-3">
                            <label>Payment Method</label>
                            <select
                                id="PaymentMethod"
                                name="PaymentMethod"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.PaymentMethod}
                                className={`form-control ${formik.touched.PaymentMethod && formik.errors.PaymentMethod ? 'is-invalid' : ''}`}
                                // disabled={!submitclicked}
                            >
                                <option value="">Select</option>
                                <option value="Standing Order">Standing Order</option>
                                <option value="Salary Deduction">Salary Deduction</option>
                                <option value="Credit Card">Credit Card</option>
                            </select>
                            {formik.errors.PaymentMethod && (
                                <div className="text-danger">{formik.errors.PaymentMethod}</div>
                            )}
                        </div>
                    </div>

                    {/* Accordion for Life A */}
                    <AccordionItem
                        title="Life A: Proposal/Main Proposer"
                        isOpen={Array.isArray(openItem) && openItem.includes('lifeA')}
                        onClick={() => handleAccordionClick('lifeA')}
                        disabled={applicationType === ''}
                    >
                        <h4>Proposed Plan Details</h4>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th scope="col">Rider Name</th>
                                    <th scope="col">Rider Cover</th>
                                    <th scope="col">Rider Premium</th>

                                </tr>
                            </thead>
                            <tbody>
                                {rider_data && rider_data.result && rider_data.result.primaryInsured && rider_data.result.primaryInsured.coverages ? (
                                    rider_data.result.primaryInsured.coverages.map((rider, index) => (
                                        <tr key={index}>
                                            <td>{rider.riderName.toString()}</td>
                                            <td>{rider.benefitAmount?.riderValue}</td>
                                            <td>{8989}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3">No Rider Data Available</td>
                                    </tr>
                                )}

                            </tbody>
                        </table>
                    </AccordionItem>

                    {/* Accordion for Life B, disable if Single Life */}
                    <AccordionItem
                        title="Life B: Life to be Assured/Spouse"
                        isOpen={Array.isArray(openItem) && openItem.includes('lifeB')}
                        onClick={() => handleAccordionClick('lifeB')}
                        disabled={applicationType === 'Single Life'}
                    >
                        <h4>Proposed Plan Details</h4>

                        <table class="table">
                            <thead>
                                <tr>
                                    <th scope="col">Rider Name</th>
                                    <th scope="col">Rider Cover</th>
                                    <th scope="col">Rider Premium</th>

                                </tr>
                            </thead>
                            <tbody>
                                {rider_data && rider_data.result && rider_data.result.spouseInsured && rider_data.result.spouseInsured.coverages ? (
                                    rider_data.result.spouseInsured.coverages.map((rider, index) => (
                                        <tr key={index}>
                                            <td>{rider.riderName.toString()}</td>
                                            <td>{rider.benefitAmount?.riderValue}</td>
                                            <td>7878</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3">No Rider Data Available for Slife</td>
                                    </tr>
                                )}

                            </tbody>
                        </table>
                    </AccordionItem>

                </div>
                {!isKeyboardVisible && (
                     <div className='iosfixednextprevbutton'>
                    <div className="fixednextprevbutton d-flex justify-content-between">
                        <button
                            type="button"
                            className="btn btn-secondary btnprev"
                            onClick={() => navigate('/previousinsurance')}
                        > Prev </button>
                        <button type="submit" className="btn btnnext" onClick={handleCombinedSubmit}>
                            Next
                        </button>
                    </div>
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
};


export default ProposedInsuranceDetails
