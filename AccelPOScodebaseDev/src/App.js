import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import Quotationsummary from "./components/QuotationSummary/QuotationSummary";
import BenefitSelection from "./components/BenefitSelection/BenefitSelection";
import PayorDetails from "./components/PayorDetails/PayorDetails";
import LoginPage from "./components/Login/LoginPage";
import SignUPDetails from "./components/SignUP/SignUPDetails";
import Dashboard from "./components/Dashboard/Dashboard";
import CustomerDetailsForm from "./components/Customer/Customerdetails";
import CustomerSummary from "./components/Customer/CustomerSummary";
import SqsPersonalDetail from "./components/QuotationPersonalDetails/SQS_personal_detail";
import MySavedQuotations from "./components/MySavedQuotations/MySavedQuotations";
import QuotationOutput from "./components/QuotationOutput/QuotationOutput";
import AgentDetails from "./components/Proposal/AgentDetails";
import EappPersonalDetail from "./components/Proposal/Eapp_PersonalDetails";
import Eapp_addressDetails from "./components/Proposal/Eapp_addressDetails";
import BeneficieryDetails from "./components/Proposal/BeneficieryDetails";
import ProposedInsuranceDetails from "./components/Proposal/ProposedInsuranceDetails";
import ProposalSummary from "./components/ProposalSummary/ProposalSummary";
import PreviousLifeInsurance from "./components/PreviousLifeInsurance/Previous_life_insurance";
import ClientDeclarationDetails from "./components/Declaration/ClientsDeclaration";
import SignatureCapture from "./components/Proposal/SignatureCapture";
import ProposalOutput from "./components/Proposal/ProposalOutPut/ProposalOutput";
import DocumentUpload from "./components/Proposal/DocumentUpload/DocumentUpload";
import PreviewUpload from "./components/Proposal/DocumentUpload/PreviewUpload";
import Submisson from "./components/Proposal/Submisson/Submisson";
import SubmissionPreview from "./components/Proposal/Submisson/SubmissionPreview";
import SidebarLayout from "./components/Dashboard/Template";
import FamilyInformation from "./components/FamilyInformation/FamilyInformation";
import GeneralQuestionnaire from "./components/GeneralQuestionnaire/GeneralQuestionnaire";
import FNA_PersonalDetails from "./components/FNA/FNA_PersonalDetails";
import FNA_Goals from "./components/FNA/FNA_Goals";
import FNA_Income from "./components/FNA/FNA_Income";
import FNA_Expenses from "./components/FNA/FNA_Expenses";
import FNA_Savings from "./components/FNA/FNA_Savings";
import FNA_Provisions from "./components/FNA/FNA_Provisions";
import FNA_Assets from "./components/FNA/FNA_Assets";
import FNA_Liabilities from "./components/FNA/FNA_Liabilities";
import FNA_Coverages from "./components/FNA/FNA_Coverages";
import FNA_RiskProfile from "./components/FNA/FNA_RiskProfile";
import FNA_Calculators from "./components/FNA/FNA_Calculators";
import FNA_Signature from "./components/FNA/FNA_Signature";
import FNA_ProductRecomendations from "./components/FNA/FNA_ProductRecomendations";
import FNA_YourNeeds from "./components/FNA/FNA_YourNeeds";
import FNA_AllNeedsGraphs from "./components/FNA/FNA_AllNeedsGraphs";
import FNA_Summary from "./components/FNA/FNA_Summary";
import FNA_Output from "./components/FNA/FNA_Output";
import Products from "./components/Dashboard/Products";
import NeedsCalculator from "./components/NeedsCalculator/NeedsCalculator";


const App = () => {
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").then(
      (registration) => {
        console.log("Service worker registration succeeded:", registration);
      },
      (error) => {
        console.error(`Service worker registration failed: ${error}`);
      }
    );
  } else {
    console.warn(
      "Service workers are not supported or running in development."
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} /> {/*  added by Shweta */}
        <Route path="/signup" element={<SignUPDetails />} />{" "}
        {/*  added by Shweta */}
        <Route path="/dashboard" element={<Dashboard />} />{" "}
        {/*  added by Prathmesh */}
        <Route path="/customer" element={<CustomerDetailsForm />} />
        {/*  added by Shweta */}

        <Route path="/needs-calculator" element={<NeedsCalculator />} /> {/*  added by Pranav */}
        <Route path="/customer-summary" element={<CustomerSummary />} />
        {/*  added by Shweta */}
        <Route
          path="/Quotationsummary"
          element={<Quotationsummary></Quotationsummary>}
        ></Route>{" "}
        {/*  added by Shubham */}
        <Route
          path="/sqs_personal_detail"
          element={<SqsPersonalDetail />}
        />{" "}
        {/*  added by Shweta */}
        <Route
          path="/benefitselection"
          element={<BenefitSelection></BenefitSelection>}
        ></Route>{" "}
        {/*  added by Shubham */}
        <Route
          path="/quotationoutput"
          element={<QuotationOutput />}
        ></Route>{" "}
        {/*  added by Prathmesh */}
        <Route
          path="/mysavedquotations"
          element={<MySavedQuotations />}
        ></Route>{" "}
        {/*  added by Prathmesh */}
        <Route
          path="/agentdetails"
          element={<AgentDetails></AgentDetails>}
        ></Route>
        {/*  added by Prathmesh */}
        <Route
          path="/payordetails"
          element={<PayorDetails></PayorDetails>}
        ></Route>{" "}
        {/*  added by Shubham */}
        <Route
          path="/eapp_personaldetails"
          element={<EappPersonalDetail />}
        ></Route>
        {/*  added by Prathmesh */}
        <Route
          path="/eappaddress_details"
          element={<Eapp_addressDetails />}
        ></Route>
        {/*  added by Prathmesh */}
        <Route
          path="/benefiecierydetails"
          element={<BeneficieryDetails />}
        ></Route>
        {/*  added by Prathmesh */}
        <Route
          path="/proposedInsuranceDetails"
          element={<ProposedInsuranceDetails />}
        ></Route>
        <Route path="/proposal-summary" element={<ProposalSummary />} />{" "}
        {/*  added by Shweta */}
        <Route
          path="/previousinsurance"
          element={<PreviousLifeInsurance />}
        />{" "}
        {/*  added by Shweta */}
        <Route
          path="/clientsdeclaration"
          element={<ClientDeclarationDetails />}
        />{" "}
        {/*  added by Shweta */}
        <Route path="/signaturecapture" element={<SignatureCapture />} />
        {/*  added by Prathmesh */}
        <Route path="/proposaloutput" element={<ProposalOutput />}></Route>
        {/*  added by Prathmesh */}
        <Route path="/documentcapture" element={<DocumentUpload />}></Route>
        {/*  added by Prathmesh */}
        <Route path="/previewUpload" element={<PreviewUpload />}></Route>
        {/*  added by Prathmesh */}
        <Route path="/submission" element={<Submisson />}></Route>
        {/*  added by Prathmesh */}
        <Route path="/submissonpreview" element={<SubmissionPreview />}></Route>
        <Route path="/familyinformation" element={<FamilyInformation />} />
        {/*  added by Shweta */}
        <Route path="/" element={<SidebarLayout />} /> {/*  added by Shweta */}
        <Route
          path="/generalquestionnaire"
          element={<GeneralQuestionnaire />}
        ></Route>
      
        {/*  added by Shweta */}
        <Route path="/fnapersonaldetails" element={<FNA_PersonalDetails />} />
        {/*  added by Shweta */}
        <Route path="/fnagoaldetails" element={<FNA_Goals />} />
        {/*  added by Shweta */}
        <Route path="/fnaincomedetails" element={<FNA_Income />} />
        <Route path="/fnaexpensesdetails" element={<FNA_Expenses />} />
        <Route path="/fnasavingsdetails" element={<FNA_Savings />} />
        <Route path="/fnaprovisionsdetails" element={<FNA_Provisions />} />
        <Route path="/fnaAssestsdetails" element={<FNA_Assets />} />
        <Route path="/fnaliabilitiesdetails" element={<FNA_Liabilities />} />
        <Route path="/fnacoveragedetails" element={<FNA_Coverages />} />
        <Route path="/fnariskprofiledetails" element={<FNA_RiskProfile />} />
        <Route path="/fnacalculatorsdetails" element={<FNA_Calculators />} />
        <Route path="/fnasignature" element={<FNA_Signature />} />
        <Route path="/fnaproducrrecomnedations" element={<FNA_ProductRecomendations />} />
        <Route path="/fnaneeds" element={<FNA_AllNeedsGraphs />} />
               <Route path="/fnasummary" element={<FNA_Summary/>} />
                 <Route path="/fnareport" element={<FNA_Output/>} />
                   <Route path="/products" element={<Products/>} />
      </Routes>
    </Router>
  );
};

export default App;
