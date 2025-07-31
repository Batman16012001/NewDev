import axios from "axios";
import { encode } from "base-64";
import { environment } from "../../config/environment";
import { getApiUrl } from "../../ConfigUrlBuilder";

//with token
/*export const getAuthToken = async () => {
  const encodedClient = encode("client1:clientsecret1");

  const postData = {
    grant_type: "client_credentials",
    scope: "agent_onboarding"
  };

  const headers = {
    Authorization: "Basic " + encodedClient,
    "Content-Type": "application/x-www-form-urlencoded"
  };

  try {
    console.log('Making token request...');
    const tokenUrl = environment.apiShwetaLogin + '/oauth/token';  
    console.log('tokenUrl', tokenUrl);
    const response = await axios.post(tokenUrl, postData, { headers });
    console.log('Token response:', response.data);
    return response.data; 
  } catch (error) {
    console.error("Failed to get auth token:", error);
    throw error; 
  }
};

export const loginResponse = async (id, password, token, token_type) => {
  try {
    console.log('Making login request...');
    console.log('Token received:', token, token_type);
    const loginUrl = environment.apiShwetaLogin + '/v1/agent-management-service/agentAuthentication';
    const response = await axios.post(loginUrl, {
      id,
      password
    }, {
      headers: {
        'Authorization': `${token_type} ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to login:', error);
    throw error;
  }
};*/

//without token
export const loginResponse = async (id, password) => {
  try {
    console.log("Making login request...");
    //console.log('Token received:', token, token_type);
    // const loginUrl =
    //   environment.apiShwetaLogin +
    //   "/agentManagementService/agentAuthentication";
    const loginUrl = getApiUrl("agentManagementService", "agentAuthentication");
    const response = await axios.post(loginUrl, {
      id,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to login:", error);
    throw error;
  }
};
