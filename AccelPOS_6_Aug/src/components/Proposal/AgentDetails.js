import axios from "axios";
import "./AgentDetails.css";
import React, { useEffect, useState } from "react";
import Spinner from "react-bootstrap/Spinner";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { findRecordById, saveDetail } from "../../db/indexedDB";
import SidebarLayout from "../../components/Dashboard/Template";

const AgentDetails = () => {
  const [agentdata, setagentdata] = useState({});
  const [error, seterror] = useState();
  const [loading, setloading] = useState(true);
  const navigate = useNavigate();
  const agent_id = sessionStorage.getItem("agentId");

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const viewportHeight = window.visualViewport.height;
      const screenHeight = window.screen.height;

      console.log("Viewport Height:", viewportHeight);
      console.log("Screen Height:", screenHeight);
      console.log("Keyboard Visible:", viewportHeight < screenHeight * 0.85);

      // If viewport height is significantly less than screen height, keyboard is likely open
      setIsKeyboardVisible(viewportHeight < screenHeight * 0.85);
    };

    window.visualViewport.addEventListener("resize", handleResize);
    return () => {
      window.visualViewport.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        //const EReferenceId = sessionStorage.getItem("erefid");

        //const response = await axios.get('http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com/agentManagementService/fetchAgents/'+agent_id);
        const response = await axios.get(
          "http://192.168.2.7:4000/agentManagementService/fetchAgents/" +
            agent_id
        );
        console.log("Response:::", response.data.data);
        const agentData = response.data.data;

        // Prepare the agent data
        const agentDetails = {
          id: agentData.agentId,
          name: agentData.firstName,
          registrationNo: agentData.licenseNumber,
          emailId: agentData.email,
          mobileNo: agentData.mobile,
          pinCode: agentData.pinCode,
        };

        // Set the agent data to state
        setagentdata(agentDetails);

        // Save the agent data after it is set in state
        await saveDetail("al_agent_details", agentDetails);
        console.log("Agent data saved successfully!");

        // if(EReferenceId){
        //     const applicationData = await findRecordById("al_application_main" , EReferenceId)
        //     console.log("Got e-reference id:::",EReferenceId,"and data",applicationData)
        //     const eReferenceIdthroughproposalsummary = applicationData.result.e_referenceId
        //     sessionStorage.setItem("eReferenceIdthroughproposalsummary" , eReferenceIdthroughproposalsummary)

        // }else{
        //     console.log("No ErefrenceId found")
        // }
      } catch (err) {
        seterror(err.message);
      } finally {
        setloading(false);
      }
    };

    fetchAgentDetails();
  }, []); // Empty dependency array to run this effect only once

  if (loading) {
    return <div>Loading....</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  const proceedtoeapppersonaldetails = () => {
    navigate("/eapp_personaldetails");
  };

  const navigate_to_summary = () => {
    navigate("/proposal-summary");
  };

  return (
    <SidebarLayout>
      <div className="agent-container">
        <div className="form-scroll-container flex-grow-1">
          <form className="agentform">
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="salesOfficerCode" class="form-label">
                  Sales officer code
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="salesOfficerCode"
                  placeholder="Enter Sales Officer Code"
                  value={agentdata.id}
                  readOnly
                />
              </div>

              <div class="col-md-6">
                <label for="name" class="form-label">
                  Name
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="name"
                  placeholder="Enter Name"
                  value={agentdata.name}
                  readOnly
                />
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <label for="registrationNo" class="form-label">
                  Registration No
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="registrationNo"
                  placeholder="Enter Registration No"
                  value={agentdata.registrationNo}
                  readOnly
                />
              </div>

              <div class="col-md-6">
                <label for="emailId" class="form-label">
                  Email ID
                </label>
                <input
                  type="email"
                  class="form-control"
                  id="emailId"
                  placeholder="Enter Email ID"
                  value={agentdata.emailId}
                  readOnly
                />
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <label for="mobileNo" class="form-label">
                  Mobile No
                </label>
                <input
                  type="tel"
                  class="form-control"
                  id="mobileNo"
                  placeholder="Enter Mobile No"
                  value={agentdata.mobileNo}
                  readOnly
                />
              </div>

              <div class="col-md-6">
                <label for="branchCode" class="form-label">
                  Branch Code
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="branchCode"
                  placeholder="Enter Branch Code"
                  value={"12345"}
                  readOnly
                />
              </div>
            </div>
          </form>
        </div>

        {!isKeyboardVisible && (
          <div className="iosfixednextprevbutton">
            <div className="fixednextprevbutton d-flex justify-content-between">
              <button
                type="button"
                className="btn btnprev"
                onClick={navigate_to_summary}
              >
                Prev
              </button>
              <button
                type="submit"
                className="btn btnnext"
                onClick={proceedtoeapppersonaldetails}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default AgentDetails;
