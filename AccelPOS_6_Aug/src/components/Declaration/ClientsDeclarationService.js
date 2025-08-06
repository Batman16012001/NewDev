import axios from "axios";
import { environment } from '../../config/environment';

export const clientsDeclResponse = async (fetchedProductName) => {
  try {
    console.log('Fetching declaration details for ',fetchedProductName);
    const declarationUrl = `${environment.apiClientsService}/proposalManagementService/getdeclaration?productName=${fetchedProductName}`;
    
    const response = await axios.get(declarationUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to get clients declaration:', error);
    throw error;
  }
};

