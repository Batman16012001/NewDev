import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { findRecordById } from "../../db/indexedDB";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { FileOpener } from "@capacitor-community/file-opener";


const FNA_Output = () => {
  const navigate = useNavigate();
  const [fnaData, setFnaData] = useState(null);
  const [pdfBase64, setPdfBase64] = useState(null);
  const fnaMainId = sessionStorage.getItem("fnaId");
  const agentId = sessionStorage.getItem("agentId");
  const clientId = sessionStorage.getItem("clientId");
  const personId = sessionStorage.getItem("personId");

  const postDataToGeneratePDF = async (fnaOutputData) => {
    const fnaMainId = sessionStorage.getItem("fnaId");
    const agentId = sessionStorage.getItem("agentId");
    const clientId = sessionStorage.getItem("clientId");
    const personId = sessionStorage.getItem("personId");

    const payload = {
      fnaMainId: `${fnaMainId}`,
      agentId: `${agentId}`,
      clientId: `${clientId}`,
      personId: `${personId}`,
      ...fnaOutputData?.Data, // flatten correctly
    };

    console.log("Sending payload to generate PDF:", payload);

    try {
      const response = await fetch(
        "http://192.168.2.14:4004/outputProcessingService/fna",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch PDF");

      const result = await response.json();
      const base64 = result?.[0]?.base64content;

      if (base64) {
        // Convert base64 to Blob
        const byteCharacters = atob(base64);
        const byteNumbers = Array.from(byteCharacters).map((char) =>
          char.charCodeAt(0)
        );
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        // Create a blob URL
        const blobUrl = URL.createObjectURL(blob);

        // Set to state to render iframe
        setPdfBase64(blobUrl);
      } else {
        throw new Error("Base64 PDF not found");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  useEffect(() => {
    const fetchFNAOutput = async () => {
      const getAllData = await findRecordById("al_fna_main", fnaMainId);

      const requestBody = {
        fnaMainId: `${fnaMainId}`,
        agentId: `${agentId}`,
        clientId: `${clientId}`,
        personId: `${personId}`, // Convert to string explicitly
        lifeInsurancePlanning: {
          amntRequiredPerChild: `${
            getAllData?.result?.fnaSavingProvision?.amntRequiredMonthly || "0"
          }`,
          totalLiabilities: `${
            getAllData?.result?.fnaAssetsLiabilities?.totalLiabilities || "0"
          }`,
          totalAssets: `${
            getAllData?.result?.fnaAssetsLiabilities?.totalAssets || "0"
          }`, // string
          totalSavings: `${
            getAllData?.result?.fnaSavingProvision?.totalSavings || "0"
          }`, // string
          deathInServiceSumassured: `${
            getAllData?.result?.fnaExistingInsurance
              ?.deathInServiceSumAssured || "0"
          }`,
          mortgageProtectionPlansSumassured: `${
            getAllData?.result?.fnaExistingInsurance
              ?.mortgageProtectionPlansSumAssured || "0"
          }`,
        },
        savingsForChildrenEducation: {
          futureGoalCost: `${
            getAllData?.result?.fnaCalculators?.find(
              (c) => c.calculatorType === "wealth_calc"
            )?.futureCostOfGoal || "0"
          }`,
          actualCorpus: `${
            getAllData?.result?.fnaCalculators?.find(
              (c) => c.calculatorType === "wealth_calc"
            )?.ActualCorpusRequiredForGoal || "0"
          }`,
          educationPlansSumassured: `${
            getAllData?.result?.fnaExistingInsurance
              ?.educationPlansSumAssured || "0"
          }`,
        },
        healthInsurance: {
          hospSurgicalPlanFlag: `${
            getAllData?.result?.fnaExistingInsurance?.hospSurgicplanPlanFlag ||
            "Select"
          }`,
          totalMonthlyIncome: `${
            getAllData?.result?.fnaIncomeExpenses?.totalMonthlyIncome || "0"
          }`, // string
          hospCritIllPlanSA: `${
            getAllData?.result?.fnaExistingInsurance
              ?.hospSurgicplanPlanPremium || "0"
          }`,
          criticalIllnessSumassured: `${
            getAllData?.result?.fnaExistingInsurance
              ?.criticalIllnessSumAssured || "0"
          }`,
        },
        retirementPlanning: {
          lifeExpectancy: `${
            getAllData?.result?.fnaPersons?.lifeExpectancy || "75"
          }`,
          desiredRetirementAge: `${
            getAllData?.result?.fnaPersons?.desiredRetirementAge || "60"
          }`,
          amountRequired: `${
            getAllData?.result?.fnaIncomeExpenses?.retirementExpense || "0"
          }`,
          noYrsToProvide: `${
            getAllData?.result?.fnaSavingProvision?.noYrsToProvide || "0"
          }`, // string
          epfAccountValue: `${
            getAllData?.result?.fnaAssetsLiabilities?.epfAccountValue || "0"
          }`, // string
          retirementSumassured: `${
            getAllData?.result?.fnaExistingInsurance?.retirementSumAssured ||
            "0"
          }`,
          monthlyIncomeRetire: `${
            getAllData?.result?.fnaIncomeExpenses?.monthlyIncomeRetire || "0"
          }`, // string
        },
      };

      try {
        const response = await fetch(
          "http://192.168.2.7:4001/fnaService/calculateOutputData",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Output data", data);
          setFnaData(data);
          // Immediately generate PDF with this output
          postDataToGeneratePDF(data);
        } else {
          console.error("FNA calculation failed:", response.status);
        }
      } catch (error) {
        console.error("Error calling FNA calculation:", error);
      }
    };

    fetchFNAOutput();
  }, []);

  useEffect(() => {
    console.log("Recieved ::: ", pdfBase64);

    const openPdfInAndroid = async () => {
      if (pdfBase64) {
        try {
          // Fetch the PDF as a blob
          const response = await fetch(pdfBase64);
          const blob = await response.blob();

          // Convert blob to Base64
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64data = reader.result.split(",")[1];
            console.log("Base64 Data:", base64data);

            // Define the subfolder and generate a unique file name
            const folderName = "MyAppFiles"; // Subfolder name inside Documents
            const fileName = `sample_${Date.now()}.pdf`; // Unique file name using timestamp

            // Ensure the subfolder exists inside Documents
            try {
              await Filesystem.mkdir({
                path: folderName,
                directory: Directory.Documents,
                recursive: true,
              });
            } catch (error) {
              if (error.message !== "Directory exists") {
                console.error("Error creating directory:", error);
                return;
              }
            }

            try {
              // Write the PDF to the subfolder with a unique file name
              const writeResult = await Filesystem.writeFile({
                path: `${folderName}/${fileName}`, // Save file in the subfolder with unique name
                data: base64data,
                directory: Directory.Documents,
                recursive: true,
              });

              console.log("Write Result:", writeResult);

              // Get the absolute URI of the file
              const fileUri = await Filesystem.getUri({
                path: `${folderName}/${fileName}`,
                directory: Directory.Documents,
              });

              console.log("File URI:", fileUri.uri);

              // Open the file using the native PDF viewer
              await FileOpener.open({
                filePath: fileUri.uri, // Absolute path of the file
                contentType: "application/pdf",
              });
            } catch (fileError) {
              console.error("Error writing or opening file:", fileError);
            }
          };

          reader.readAsDataURL(blob);
        } catch (error) {
          console.error("Error opening PDF on Android:", error);
        }
      }
    };

    // Only open PDF on Android (or based on platform)
    if (
      Capacitor.getPlatform() === "android" ||
      Capacitor.getPlatform() === "ios"
    ) {
      openPdfInAndroid();
    }
  }, [pdfBase64]);

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
    document.body.classList.add("ios-safeareasubmission");
  } else {
    document.body.classList.remove("ios-safeareasubmission");
  }

  if (!fnaData)
    return <div className="text-center mt-5">Loading FNA Report...</div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-center mt-4">
        <button
          type="button"
          className="btn"
          onClick={() => navigate("/fnasignature")}
          style={{
            backgroundColor: "#800000",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Close
        </button>
      </div>

      {/* {pdfBase64 && (
        <div className="my-4">
          <iframe
            title="FNA Report"
            src={pdfBase64} // now it's a blob URL
            width="100%"
            height="800px"
            style={{ border: "1px solid #ccc" }}
          />
        </div>
      )} */}

      {pdfBase64 ? (
        <iframe
          title="FNA Report"
          src={pdfBase64} // now it's a blob URL
          width="100%"
          height="800px"
          style={{ border: "1px solid #ccc" }}
        />
      ) : (
        <p>Loading FNA Report...</p>
      )}
    </div>
  );
};

export default FNA_Output;
