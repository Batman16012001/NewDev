import axios from "axios";
import { encode } from "base-64";
import { environment } from "../../config/environment";

export const getAuthToken = async () => {
  const encodedClient = encode("client1:clientsecret1");

  const postData = {
    grant_type: "client_credentials",
    scope: "agent_onboarding",
  };

  const headers = {
    CLIENT_ID: "client1",
    CLIENT_SECRET: "clientsecret1",
    Authorization: "Basic " + encodedClient,
    scope: "agent_onboarding",
  };

  try {
    console.log("Making token request...");
    const tokenUrl = environment.apiShwetaLogin + "/oauth/token";
    console.log("tokenUrl", tokenUrl);
    const response = await axios.post(tokenUrl, postData, { headers });
    console.log("Token response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to get auth token:", error);
    throw error;
  }
};

export const sendDataToBackend = async (token, token_type, backendData) => {
  try {
    console.log(
      "Making authentication request with backend data:",
      backendData
    );
    console.log("Token received:", token, token_type);

    const SignUPUrl =
      environment.apiShwetaLogin + "/agentManagementService/agentOnboarding";

    const response = await axios.post(SignUPUrl, backendData, {
      headers: {
        Authorization: `${token_type} ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Failed to send data to backend:", error);
    throw error;
  }
};
