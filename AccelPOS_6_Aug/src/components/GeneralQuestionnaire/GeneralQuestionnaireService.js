import axios from "axios";
import { environment } from "../../config/environment";

// export const fetchBaseQuestions = async (screenID,section) => {
//     setLoader(true);
//     try {
//         const baseResponse = await axios.get(environment.apiQuestionnaireUrl+`/underwritingCases/getBaseQuestions?caseId=`+screenID+`&section=`+section+`&insuredId=`+insuredId);
//  //   const response = await axios.get(environment.apiQuestionnaireUrl+`/underwritingCases/getBaseQuestions?caseId=`+screenID+`&section=`+section+`&insuredId=`+insuredId);
//             //   const response = await axios.get("http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com/questionnaire-management-service/baseQuestions?caseId=00000003&section=Health_Section&insuredId=1");
//             const response = await fetchBaseQuestions (screenID,section)
//         console.log("baseResponse-->", baseResponse.data);
//         return baseResponse.data;
//     } catch (error) {
//         console.error('Error fetching base questions:', error);
//         return [];
//     } finally {
//         setLoader(false);
//     }
// };

// export const fetchReflexiveQuestions = async (disclosureId, categoryId, questionId) => {
//     setLoader(true);
//     try {
//         const reflexiveResponse = await axios.get(environment.apiQuestionnaireUrl+`/underwritingCases/reflexiveQuestions?caseId=${getScreenID}&disclosureId=${disclosureId}&insuredId="1"`);
//         // const reflexiveResponse = await axios.get("http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com/questionnaire-management-service/reflexiveQuestions?caseId=00000003&disclosureId=1&insuredId=1");

//         console.log("reflexiveResponse-->", reflexiveResponse.data);
//         return reflexiveResponse.data;
//     } catch (error) {
//         console.error('Error fetching reflexive questions:', error);
//         return [];
//     } finally {
//         setLoader(false);
//     }
// };

export const putBaseQuestions = async (putBaseQueAns, caseId, insuredId) => {
  try {
    console.log("putBaseQueAns", JSON.stringify(putBaseQueAns));
    // const response = await axios.put(`http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com/questionnaire-management-service/baseQuestions?caseId=${caseId}&section=Health_Section&insuredId=${insuredId}`, putBaseQueAns);
    const response = await axios.put(
      `http://192.168.2.7:4009/questionnaireManagementService/baseQuestions?caseId=${caseId}&section=Health_Section&insuredId=${insuredId}`,
      putBaseQueAns
    );
    console.log("PUT request successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in PUT request:", error);
    throw error;
  }
};

export const putReflexiveQuestions = async (payload) => {
  try {
    console.log("Sending payload:", JSON.stringify(payload));
    const response = await axios.put(
      // `http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com/questionnaire-management-service/reflexiveQuestions`,
      `http://192.168.2.7:4009/questionnaireManagementService/reflexiveQuestions`,
      payload
    );
    console.log("PUT request successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in PUT request:", error);
    throw error;
  }
};

export const fetchDisclosures = async (
  caseId,
  insuredId,
  categoryId,
  searchText
) => {
  try {
    // const disclosureURL = await axios.get(`${environment.apiQuestionnaireUrl}/underwritingCases/disclosures?caseID=${caseId}&searchText=${searchText}&insuredId=${insuredId}&categoryID=${categoryId}`);

    const disclosureURL = await axios.get(
      // `http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com/questionnaire-management-service/disclosures?caseId=${caseId}&searchText=${searchText}&insuredId=${insuredId}&categoryID=${categoryId}`
      `http://192.168.2.7:4009/questionnaireManagementService/disclosures?caseId=${caseId}&searchText=${searchText}&insuredId=${insuredId}&categoryID=${categoryId}`
    );

    // const disclosureURL = await axios.get (http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com/questionnaire-management-service/disclosures?caseId=202311050&searchText=ab&insuredId=1&categoryID=medical)

    return disclosureURL.data;
  } catch (error) {
    console.error("Error fetching disclosures:", error);
    throw error;
  }
};

export const getBasePages = async (caseId) => {
  try {
    const basePages = await axios.get(
      //`http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com/questionnaire-management-service/basePages?caseid=${caseId}`
      `http://192.168.2.7:4009/questionnaireManagementService/basePages?caseid=${caseId}`
    );

    return basePages.data;
  } catch (error) {
    console.error("Error while fetching base pages::", error);
    throw error;
  }
};
