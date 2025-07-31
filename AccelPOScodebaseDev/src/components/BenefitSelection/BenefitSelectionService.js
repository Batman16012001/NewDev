import axios from "axios";
import { environment } from "../../config/environment";

export const fetchProducts = async () => {
  try {
    const productsList = await axios.get(
      "http://192.168.2.7:4007/productManagementService/products"
    );
    // const productsList = await axios.get(environment.apiBenefitDropdowns + '/serverFilesRoute/products/products');
    //const productsList = await axios.get('http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com/product-management-service/products');
    console.log("productsList-->", productsList.data);
    return productsList.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const fetchBenefitData = async (planCode, paymentfrq) => {
  try {
    //const benefitData = await axios.get(
    //`http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com/quote-management-service/getRiderOptions`,
    //{
    const benefitData = await axios.get(
      `http://192.168.2.7:4010/quoteManagementService/getRiderOptions?`,
      {
        params: {
          planCode: planCode,
          paymentFrequency: paymentfrq,
        },
      }
    );

    return benefitData.data;
  } catch (error) {
    console.error("Error fetching benefits data:", error);
    throw error;
  }
};

// export const postCalculation = async (postCalculationData) => {
//   console.log("postCalculationData:", JSON.stringify(postCalculationData, null, 2));
//   try {
//     const calculationResponse = await axios.post(
//       'http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com/quote-management-service/quote',
//       postCalculationData,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       }
//     );
//     console.log('calculation Response from API:', calculationResponse.data);
//     return calculationResponse.data;
//   } catch (error) {
//     // console.error('Error posting data:', error.response?.data || error.message);
//     // throw error;
//       const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.';

//     alert(`Error: ${errorMessage}`);
//   }
// };

export const postCalculation = async (postCalculationData) => {
  console.log(
    "postCalculationData:",
    JSON.stringify(postCalculationData, null, 2)
  );
  try {
    const calculationResponse = await axios.post(
      //"http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com/quote-management-service/quote",
      "http://192.168.2.7:4010/quoteManagementService/quote",

      postCalculationData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("calculation Response from API:", calculationResponse.data);
    return calculationResponse.data;
  } catch (error) {
    let errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred.";
    console.log("Original error message:", errorMessage);

    if (errorMessage.includes("Total premium should be greater than")) {
      errorMessage =
        "Invalid data for premium calculation please change benefit period or benefit amount";
    }

    console.log("Modified error message:", errorMessage);

    alert(`Error: ${errorMessage}`);
  }
};

export const fetchPaymentMethods = async () => {
  try {
    const paymentModes = await axios.get(
      environment.apiBenefitDropdowns +
        "/serverFilesRoute/paymentMethods/paymentMethods"
    );
    return paymentModes.data;
  } catch (error) {
    console.log("error for fetching paymentModes", error);
    throw error;
  }
};

export const fetchPaymentFrequency = async () => {
  try {
    const paymentModes = await axios.get(
      environment.apiBenefitDropdowns +
        "/serverFilesRoute/paymentFrequency/paymentFrequency"
    );
    return paymentModes.data;
  } catch (error) {
    console.log("error for fetching paymentModes", error);
    throw error;
  }
};

export const findRecordByIdServer = async (table_name, id) => {
  try {
    const response = await axios.get(environment.apiBenefitDropdowns + "/");
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${table_name} data from API:`, error);
    throw error;
  }
};

export const saveToBackend = async (
  ProductChoiceData,
  BenefitSelectionData
) => {
  try {
    const backendUrl = "https://";

    const PlanBenefitData = {
      productChoice: ProductChoiceData,
      benefitSelection: BenefitSelectionData,
    };

    const response = await axios.post(backendUrl, PlanBenefitData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200) {
      throw new Error("Failed to send data to backend: " + response.statusText);
    }

    console.log("Response from backend:", response.data);

    return response.data;
  } catch (error) {
    console.error("Error sending data to backend:", error);
    throw error;
  }
};
