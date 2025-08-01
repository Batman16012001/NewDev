import axios from "axios";
import { encode } from "base-64";
import { environment } from "../../config/environment";
import { getApiUrl } from "../../ConfigUrlBuilder";

export const customerResponse = async (backendData) => {
  try {
    console.log("customerResponse backendData ", JSON.stringify(backendData));
    // const customerUrl =
    //   environment.apiCustomerService + "/leadManagementService/createLead";
    const customerUrl = getApiUrl("leadManagementService", "createLead");
    const response = await axios.post(
      customerUrl,
      JSON.stringify(backendData),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Failed to create customer:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const summaryResponse = async (agentId) => {
  try {
    // const customerUrl =
    //   environment.apiCustomerService + "/leadManagementService/getLeads";
    const customerUrl = getApiUrl("leadManagementService", "getLeads");
    const response = await axios.get(customerUrl, {
      params: { agentId },
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data.errorCode === "AgentNotFound") {
      console.warn("Agent not found. Please check the agent ID:", agentId);
    } else {
      console.error(
        "Failed to fetch customer data:",
        error.response ? error.response.data : error.message
      );
    }
    throw error;
  }
};

export const updateCustomerResponse = async (backendData, leadID) => {
  try {
    console.log("Updating lead with ID:", leadID, "and data:", backendData);
    const updateUrl = `${environment.apiCustomerService}/leadManagementService/updateLead/${leadID}`;
    console.log('updateUrl:::', updateUrl)
    const response = await axios.put(updateUrl, JSON.stringify(backendData), {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Failed to update customer:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
