import axios from "axios";
import { environment } from "../../config/environment";

export const fetchRelatioships = async () =>{
    try{
        const relationshipToOwner =  await axios.get(environment.apiBaseUrl + '/serverFilesRoute/relationships/relationships');
        return relationshipToOwner.data
    }catch(error) {
        console.log('error for fetching paymentModes', error)
        throw error;
    }
}


export const fetchCountries = async () => {
    try {
      const tokenRes = await axios.get(
        "https://www.universal-tutorial.com/api/getaccesstoken",
        {
          headers: {
            Accept: "application/json",
            "api-token": "ZIhNrrVFSMK3hH99iTS1UvoPfi_CDeW5-eSnpZ4EjTKRHLb6NbExFbmH11r_pvnN32E",
            "user-email": "onkar.swami@acceltree.com",
          },
        }
      );
      const auth_token = tokenRes.data.auth_token;
      console.log("auth_token", auth_token);
  
      // Fetch the list of countries using the token
      const countryRes = await axios.get(
        "https://www.universal-tutorial.com/api/countries/",
        {
          headers: {
            Authorization: "Bearer " + auth_token,
            Accept: "application/json",
          },
        }
      );
      return countryRes.data;
    } catch (error) {
      console.log("Error fetching countries", error);
      throw error;
    }
  };

  export const fetchOccupations = async () =>{
    try{
        const occupationsList =  await axios.get(environment.apiBaseUrl + '/serverFilesRoute/occupation/occupation');
        return occupationsList.data
    }catch(error) {
        console.log('error for fetching fetchOccupations', error)
        throw error;
    }
}

export const fetchNatureOfBusiness = async () =>{
    try{
        const natureOfBusinessList =  await axios.get(environment.apiBaseUrl + '/serverFilesRoute/natureOfBusinessList/natureOfBusinessList');
        return natureOfBusinessList.data
    }catch(error) {
        console.log('error for fetching fetchNatureOfBusiness', error)
        throw error;
    }
}

export const saveToBackend = async (payorDetailsData) => {
    try {
      const backendUrl = 'https://'
  
      const response = await axios.post(backendUrl, payorDetailsData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status !== 200) {
        throw new Error('Failed to send data to backend: ' + response.statusText);
      }
  
      console.log('Response from backend:', response.data);
  
      return response.data; 
  
    } catch (error) {
      console.error('Error sending data to backend:', error);
      throw error; 
    }
  };
  

  export const handleCountryChange = async (event, setStateCall, stateField, formik) => {
    const selectedCountry = event.target.value;
    formik.handleChange(event);
  
    try {
      const tokenRes = await axios.get(
        `https://www.universal-tutorial.com/api/getaccesstoken`,
        {
          headers: {
            "Accept": "application/json",
            "api-token": "ZIhNrrVFSMK3hH99iTS1UvoPfi_CDeW5-eSnpZ4EjTKRHLb6NbExFbmH11r_pvnN32E",
            "user-email": "onkar.swami@acceltree.com"
          }
        }
      );
  
      const auth_token = tokenRes.data.auth_token;
  
      if (selectedCountry) {
        const statesRes = await axios.get(
          `https://www.universal-tutorial.com/api/states/${selectedCountry}`,
          {
            headers: {
              "Authorization": `Bearer ${auth_token}`,
              "Accept": "application/json"
            }
          }
        );
  
        const stateList = statesRes.data;
        setStateCall(stateList);
        formik.setFieldValue(stateField, '');
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };