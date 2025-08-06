import React, { useState, useEffect } from "react";
import "./GeneralQuestionnaire.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { environment } from "../../config/environment";
import { Button, Form } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
// import { Encryption, Decryption } from '../../service/Encryption';
import Loader from "react-spinner-loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faSignOutAlt, faHouse } from "@fortawesome/free-solid-svg-icons";
import { saveDetail, findRecordById } from "../../db/indexedDB";
import {
  fetchBaseQuestions,
  fetchReflexiveQuestions,
  putBaseQuestions,
  putReflexiveQuestions,
  fetchDisclosures,
  getBasePages,
} from "./GeneralQuestionnaireService";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import SidebarLayout from "../../components/Dashboard/Template";

const GeneralQuestionnaire = (props) => {
  const [formState, setFormState] = useState(true);
  const [getANB, setANB] = useState([]);
  const location = useLocation();
  const gotolistdashboard = useNavigate();
  const [selctedDOB, setselctedDOB] = useState("");
  const [loader, setLoader] = useState();
  const [allData, setAllData] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [indexedDBData, setIndexedDBData] = useState([]);
  const [getScreenID, setScreenID] = useState();
  const [getCaseID, setCaseID] = useState();
  const [getSyncFlag, setSyncFlag] = useState();
  const [getAgentID, setAgentID] = useState();
  const [getGeneralID, setGeneralID] = useState();
  const [getSQSID, setSQSID] = useState([]);
  const [personID, setPersonID] = useState();
  const [getFromType, setFromType] = useState();
  const [getEReferenceID, setEReferenceID] = useState();
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [generalQuestionnaire, setGeneralQuestionnaire] = useState([]);
  const [reflexiveQuestions, setReflexiveQuestions] = useState({});
  const [initialValues, setInitialValues] = useState({});
  const [validationSchema, setValidationSchema] = useState(Yup.object());
  const [errors, setErrors] = useState({});
  const [nestedQuestions, setNestedQuestions] = useState(null);
  const [nestedQuestionsMap, setNestedQuestionsMap] = useState({});
  const [nestedReflexiveQuestions, setNestedReflexiveQuestions] = useState({});
  const [selectedBranches, setSelectedBranches] = useState({});
  const [selectedBranchText, setSelectedBranchText] = useState({});
  const [disclosureMatches, setDisclosureMatches] = useState([]);
  const [selectedDisclosure, setSelectedDisclosure] = useState("");
  const [proposalNumberIs, setProposalNumber] = useState("");
  const [modalShow, setModalShow] = React.useState(false);

  const [pageReferences, setPageReferences] = useState([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isSuccessful, setIsSuccessful] = useState();

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [disabledSections, setDisabledSections] = useState({}); // Track disabled state per section

  //   useEffect(() => {
  //     const handleResize = () => {
  //       const viewportHeight = window.visualViewport.height;
  //       const screenHeight = window.screen.height;

  //       // If viewport height is significantly less than screen height, keyboard is likely open
  //       setIsKeyboardVisible(viewportHeight < screenHeight * 0.85);
  //     };

  //     window.visualViewport.addEventListener("resize", handleResize);
  //     return () => {
  //       window.visualViewport.removeEventListener("resize", handleResize);
  //     };
  //   }, []);

  const navigate = useNavigate();

  var agentID = getAgentID;

  const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const AADHAR_REGEX = /^[2-9]{1}[0-9]{11}$/;

  function navToBackScreen() {
    sessionStorage.setItem("agentID", getAgentID);
    sessionStorage.setItem("screenID", getScreenID);
    // navigate('/personaldetails');

    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prevIndex) => {
        const newIndex = prevIndex - 1;
        return newIndex;
      });
    } else {
      navigate("/proposedInsuranceDetails");
    }
  }

  function dashboardNav() {
    navigate("/dashboard");
  }

  function logOut() {
    navigate("/");
  }

  function MyVerticallyCenteredModal(props) {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body>
          <p>{proposalNumberIs}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={props.onHide}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      const storedDisabledSections =
        JSON.parse(sessionStorage.getItem("disabledSections")) || {};
      setDisabledSections(storedDisabledSections);

      try {
        const section = "Lifestyle_Section";
        const insuredId = "1";

        if (getGeneralID) {
          const generalData = await findRecordById(
            "al_general_question",
            getGeneralID
          );
          console.log("fetch existed generalData", generalData);
        }

        // console.log("Fetching data with params:", { caseId: screenID, section, insuredId });
        // const getEreferenceID = sessionStorage.getItem("CaseId");

        const screenID = sessionStorage.getItem("CaseId");
        setCaseID(screenID);
        console.log("Fetching data with params:", screenID);

        // const screenID= "00000004"
        // setCaseID(screenID)
        if (screenID) {
          // try {
          const getBasePagesresponse = await getBasePages(screenID);
          console.log(
            "getBasePagesresponse request response:",
            getBasePagesresponse
          );

          const pageData = getBasePagesresponse.PageReferences || [];
          console.log("pageData-->", pageData);
          setPageReferences(pageData);

          // } catch (error) {
          //     console.error("Error while sending PUT request:", error);
          // }

          const section = pageData[currentSectionIndex]?.name;
          // const section = "General_Section"
          // const section = "Health_Section"

          //   const response = await axios.get(environment.apiQuestionnaireUrl+`/underwritingCases/getBaseQuestions?caseId=`+screenID+`&section=`+section+`&insuredId=`+insuredId);
          //   const response = await axios.get(`http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com/questionnaire-management-service/baseQuestions?caseId=${screenID}&section=Health_Section&insuredId=1`);
          const response = await axios.get(
            `http://192.168.2.7:4009/questionnaireManagementService/baseQuestions?caseId=${screenID}&section=${section}&insuredId=1`
          );
          console.log("API Response:", response.data);

          if (response.data && Array.isArray(response.data)) {
            setGeneralQuestionnaire(response.data);

            // setDisabledSections((prevState) => ({
            //     ...prevState,
            //     [currentSectionIndex]: true,
            // }));

            const initialAnswers = {};
            response.data.forEach((question) => {
              const disclosureId =
                answers[question.baseQuestionId]?.disclosureId;

              if (question.searchType?.[0]?.value === "Search") {
                if (
                  !disclosureId &&
                  question.baseQuestionDisclosures?.[0]?.disclosureId
                ) {
                  const newDisclosureId =
                    question.baseQuestionDisclosures[0].disclosureId;
                  fetchReflexiveQuestions(
                    newDisclosureId,
                    question.categoryId,
                    question.baseQuestionId
                  ).then((reflexiveQuestions) => {
                    let reflexArray = [];
                    reflexArray.push(reflexiveQuestions["decisionTree"]);

                    setReflexiveQuestions((prevReflexive) => ({
                      ...prevReflexive,
                      [question.baseQuestionId]: reflexArray,
                    }));
                  });
                }
              }

              if (question.searchType?.[0]?.value === "Linked_Disclosure") {
                if (question.baseQuestionAnswerValue === true) {
                  initialAnswers[question.baseQuestionId] = "Yes";
                  handleAnswer(
                    question.baseQuestionId,
                    "Yes",
                    "",
                    response.data
                  );
                } else if (question.baseQuestionAnswerValue === false) {
                  initialAnswers[question.baseQuestionId] = "No";
                  handleAnswer(
                    question.baseQuestionId,
                    "No",
                    "",
                    response.data
                  );
                } else {
                  initialAnswers[question.baseQuestionId] = null;
                }
              }

              if (
                question.searchType?.[0]?.value === "Linked_Disclosure" ||
                question.searchType?.[0]?.value === "Pick_List"
              ) {
                if (question.baseQuestionAnswerValue === true) {
                  initialAnswers[question.baseQuestionId] = "Yes";

                  question.baseQuestionDisclosures.forEach((disclosure) => {
                    if (disclosure.disclosureStatus === "Completed") {
                      handleAnswer(
                        question.baseQuestionId,
                        "Yes",
                        disclosure.disclosureId,
                        response.data
                      );
                    }
                  });
                } else if (question.baseQuestionAnswerValue === false) {
                  initialAnswers[question.baseQuestionId] = "No";

                  question.baseQuestionDisclosures.forEach((disclosure) => {
                    if (disclosure.disclosureStatus === "Completed") {
                      handleAnswer(
                        question.baseQuestionId,
                        "No",
                        disclosure.disclosureId,
                        response.data
                      );
                    }
                  });
                } else {
                  initialAnswers[question.baseQuestionId] = null;
                }
              }
            });
            console.log("initialAnswers-->", initialAnswers);

            setAnswers(initialAnswers);

            const initValues = {};
            const validationShape = {};

            response.data.forEach((question) => {
              initValues[`answers.${question.qid}`] =
                question.type === "checkbox" ? [] : "";
              if (question.required) {
                validationShape[`answers.${question.qid}`] =
                  Yup.string().required("This field is required");
              }
            });

            setInitialValues(initValues);
            setValidationSchema(Yup.object().shape(validationShape));
          } else {
            console.error("Unexpected response format:", response.data);
          }
        } else {
          console.error("ScreenID is not available.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);

        setLoader(false);
        var alertIs = error;
        setProposalNumber(alertIs);
        setModalShow(true);
        return false;
      } finally {
        setLoader(false);
      }
    };

    fetchData();
  }, [currentSectionIndex]);

  const handleDisclosureApi = async (questionId, answer, categoryId) => {
    if (!answer) {
      console.warn("Search text is empty. Skipping API call.");
      return;
    }

    try {
      // const caseId = "00000004";
      const caseId = getCaseID;
      const insuredId = 1;
      const response = await fetchDisclosures(
        caseId,
        insuredId,
        categoryId,
        answer
      );
      console.log("API response:", response);

      if (response?.disclosureMatch) {
        setDisclosureMatches(response.disclosureMatch);
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

  const renderQuestion = (question, index) => {
    return (
      <div key={question.baseQuestionId}>
        <div className="row">
          <div className="col-12 col-sm-12 mb-2">
            <label style={{ fontWeight: "bold", fontSize: "18px" }}>
              {`${index + 1}.  ${question.baseQuestionText}`}
            </label>
          </div>
          <div className="col-12 col-sm-4 mb-2 ml-0 ml-sm-3">
            {question.baseQuestionType === "Trigger_On_Yes" &&
              question.searchType?.[0]?.value === "Linked_Disclosure" && (
                <div className="form-group">
                  <label
                    className="d-block"
                    id={`question-label-${question.baseQuestionId}`}
                  >
                    {question.questionText}
                  </label>
                  <div className="form-check form-check-inline">
                    <input
                      type="radio"
                      id={`yes-${question.baseQuestionId}`}
                      name={question.baseQuestionId}
                      value="Yes"
                      checked={answers[question.baseQuestionId] === "Yes"}
                      onChange={() =>
                        handleAnswer(question.baseQuestionId, "Yes")
                      }
                      className="form-check-input"
                      aria-labelledby={`question-label-${question.baseQuestionId}`}
                      //   disabled={!!disabledSections[currentSectionIndex]}
                      disabled={disabledSections[currentSectionIndex] || false}
                    />
                    <label
                      htmlFor={`yes-${question.baseQuestionId}`}
                      className="form-check-label"
                    >
                      Yes
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      type="radio"
                      id={`no-${question.baseQuestionId}`}
                      name={question.baseQuestionId}
                      value="No"
                      checked={answers[question.baseQuestionId] === "No"}
                      onChange={() =>
                        handleAnswer(question.baseQuestionId, "No")
                      }
                      className="form-check-input"
                      aria-labelledby={`question-label-${question.baseQuestionId}`}
                      //   disabled={!!disabledSections[currentSectionIndex]}
                      disabled={disabledSections[currentSectionIndex] || false}
                    />
                    <label
                      htmlFor={`no-${question.baseQuestionId}`}
                      className="form-check-label"
                    >
                      No
                    </label>
                  </div>
                </div>
              )}

            {question.baseQuestionType === "Trigger_On_Yes" &&
              question.searchType?.[0]?.value === "Pick_List" && (
                <div className="row">
                  {question.baseQuestionDisclosures.map((disclosure) => (
                    <div
                      key={disclosure.disclosureId}
                      className="col-12 col-sm-6 mb-2"
                    >
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name={disclosure.disclosureId}
                          value={disclosure.disclosureName}
                          defaultChecked={
                            disclosure.disclosureStatus === "Completed"
                          }
                          // disabled={!!disabledSections[currentSectionIndex]}
                          disabled={
                            disabledSections[currentSectionIndex] || false
                          }
                          onChange={(event) =>
                            handleAnswer(
                              question.baseQuestionId,
                              event.target.checked ? "Yes" : "No",
                              disclosure.disclosureId
                            )
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`disclosure-${disclosure.disclosureId}`}
                        >
                          {disclosure.disclosureName}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {question.baseQuestionType === "Enter_Details" &&
              question.searchType?.[0]?.value === "Search" && (
                <div className="ml-3 ml-sm-3 input-container">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter details"
                    // disabled={!!disabledSections[currentSectionIndex]}
                    disabled={disabledSections[currentSectionIndex] || false}
                    value={
                      typeof answers[question.baseQuestionId] === "object"
                        ? answers[question.baseQuestionId]?.disclosureName || ""
                        : answers[question.baseQuestionId] ??
                          (question.baseQuestionDisclosures?.[0]
                            ?.disclosureName ||
                            "")
                    }
                    onChange={(e) => {
                      const newValue = e.target.value;
                      // setAnswers((prev) => ({
                      //     ...prev,
                      //     [question.baseQuestionId]: newValue,
                      // }));

                      if (/^[a-zA-Z\s]*$/.test(newValue)) {
                        setAnswers((prev) => ({
                          ...prev,
                          [question.baseQuestionId]: newValue,
                        }));
                        handleDisclosureApi(
                          question.baseQuestionId,
                          newValue,
                          question.categoryId
                        );
                      }

                      handleDisclosureApi(
                        question.baseQuestionId,
                        newValue,
                        question.categoryId
                      );
                    }}
                    onBlur={() =>
                      setTimeout(() => setDisclosureMatches([]), 200)
                    }
                    aria-autocomplete="list"
                    aria-controls="autocomplete-list"
                  />

                  {disclosureMatches.length > 0 && (
                    <ul
                      id="autocomplete-list"
                      className="autocomplete-dropdown"
                      role="listbox"
                    >
                      {disclosureMatches.map((match) => (
                        <li
                          key={match._id}
                          role="option"
                          className="autocomplete-item"
                          onClick={() => {
                            setAnswers((prev) => ({
                              ...prev,
                              [question.baseQuestionId]: {
                                disclosureName: match.disclosureName,
                                disclosureId: match.disclosureId,
                              },
                            }));
                            setDisclosureMatches([]);
                            clearAllReflexiveQuestions(question.baseQuestionId);
                            fetchReflexiveQuestions(
                              match.disclosureId,
                              question.categoryId,
                              question.baseQuestionId
                            ).then((reflexiveQuestions) => {
                              let reflexArray = [];

                              if (reflexiveQuestions["decisionTree"]) {
                                reflexArray.push(
                                  reflexiveQuestions["decisionTree"]
                                );
                              } else {
                                reflexArray = [];
                              }

                              // reflexArray.push(reflexiveQuestions["decisionTree"]);
                              setReflexiveQuestions((prevReflexive) => ({
                                ...prevReflexive,
                                [question.baseQuestionId]: reflexArray,
                              }));
                            });
                          }}
                        >
                          {match.disclosureName}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
          </div>
        </div>

        {errors[question.baseQuestionId] && (
          <div style={{ color: "red" }}>{errors[question.baseQuestionId]}</div>
        )}
      </div>
    );
  };

  const handleAnswer = async (
    questionId,
    answer,
    pickListDisclosureId,
    data = generalQuestionnaire,
    isChecked = false
  ) => {
    setAnswers((prev) => {
      const updatedAnswers = { ...prev };
      // const question = generalQuestionnaire.find(q => q.baseQuestionId === questionId || q.reflexiveQuestionId === questionId);
      const question = data.find(
        (q) =>
          q.baseQuestionId === questionId ||
          q.reflexiveQuestionId === questionId
      );

      if (!question) {
        console.error("Question not found for questionId:", questionId);
        return updatedAnswers;
      }

      if (question.baseQuestionType === "checkbox") {
        if (isChecked) {
          if (!updatedAnswers[questionId]) {
            updatedAnswers[questionId] = [];
          }
          updatedAnswers[questionId].push(answer);
        } else {
          updatedAnswers[questionId] = updatedAnswers[questionId].filter(
            (item) => item !== answer
          );
        }
      } else {
        updatedAnswers[questionId] = answer;
      }

      // const error = validateAnswer(questionId, updatedAnswers[questionId]);
      // setErrors((prevErrors) => ({ ...prevErrors, [questionId]: error }));

      if (
        question.baseQuestionType === "Trigger_On_Yes" &&
        answer === "No" &&
        question.searchType?.[0]?.value === "Pick_List"
      ) {
        const reflexiveData = reflexiveQuestions[question.baseQuestionId]?.find(
          (reflexive) => reflexive.disclosureId === pickListDisclosureId
        );

        if (reflexiveData?.reflexiveQuestion?.reflexiveQuestionId) {
          const reflexiveQuestionId =
            reflexiveData.reflexiveQuestion.reflexiveQuestionId;
          const disclosureId = reflexiveData.disclosureId;

          // Remove only the specific reflexive question
          reflexiveQuestions[question.baseQuestionId] = reflexiveQuestions[
            question.baseQuestionId
          ].filter((reflexive) => reflexive.disclosureId !== disclosureId);

          // clearSpecificReflexiveQuestion(
          //     question.baseQuestionId,
          //     reflexiveQuestionId,
          //     disclosureId
          // );
        }
      }

      // else if ((question.baseQuestionType === 'Trigger_On_Yes' && answer === 'Yes' && question.searchType?.[0]?.value === 'Pick_List')) {
      //     if (question.searchType && question.searchType[0]["triggerOn"] === answer && question.baseQuestionDisclosures) {
      //         const baseQuestionId = question.baseQuestionId;
      //         const categoryId = question.categoryId;
      //         const disclosureId = pickListDisclosureId;
      //         // console.log("fromType-->",fromType)
      //         // setFromType(fromType)

      //         fetchReflexiveQuestions(disclosureId, categoryId, baseQuestionId).then((reflexiveQuestions) => {
      //             console.log("Fetched Reflexive Questions:", reflexiveQuestions);
      //             console.log("Decision Tree:", reflexiveQuestions.decisionTree);

      //             const decisionTree = reflexiveQuestions.decisionTree;
      //             const reflexArray = Array.isArray(decisionTree)
      //                 ? decisionTree.map((item) => item.reflexiveQuestion)
      //                 // : [decisionTree.reflexiveQuestion];
      //                 : [decisionTree];

      //             console.log("Reflexive Array:", reflexArray);

      //             setReflexiveQuestions((prevReflexive) => {
      //                 const updatedReflexive = { ...prevReflexive };

      //                 if (!updatedReflexive[baseQuestionId]) {
      //                     updatedReflexive[baseQuestionId] = reflexArray;
      //                 } else {
      //                     updatedReflexive[baseQuestionId] = [
      //                         ...updatedReflexive[baseQuestionId],
      //                         ...reflexArray,
      //                     ];

      //                 }
      //                 console.log("updatedReflexive-->",updatedReflexive)
      //                 return updatedReflexive;
      //             });
      //         });
      //     }
      // }
      else if (
        question.baseQuestionType === "Trigger_On_Yes" &&
        answer === "Yes" &&
        question.searchType?.[0]?.value === "Pick_List"
      ) {
        if (
          question.searchType &&
          question.searchType[0]["triggerOn"] === answer &&
          question.baseQuestionDisclosures
        ) {
          const baseQuestionId = question.baseQuestionId;
          const categoryId = question.categoryId;
          const disclosureId = pickListDisclosureId;

          fetchReflexiveQuestions(
            disclosureId,
            categoryId,
            baseQuestionId
          ).then((reflexiveQuestions) => {
            console.log("Fetched Reflexive Questions:", reflexiveQuestions);
            console.log("Decision Tree:", reflexiveQuestions.decisionTree);

            const decisionTree = reflexiveQuestions.decisionTree;
            const reflexArray = Array.isArray(decisionTree)
              ? decisionTree.map((item) => item.reflexiveQuestion)
              : [decisionTree];

            console.log("Reflexive Array:", reflexArray);

            setReflexiveQuestions((prevReflexive) => {
              const updatedReflexive = { ...prevReflexive };

              if (!updatedReflexive[baseQuestionId]) {
                updatedReflexive[baseQuestionId] = reflexArray;
              } else {
                const existingReflexive = updatedReflexive[baseQuestionId];

                // Merge new reflexive questions, ensuring uniqueness by disclosureId
                const mergedReflexive = [
                  ...existingReflexive,
                  ...reflexArray.filter(
                    (newItem) =>
                      !existingReflexive.some(
                        (existingItem) =>
                          existingItem.disclosureId === newItem.disclosureId
                      )
                  ),
                ];

                updatedReflexive[baseQuestionId] = mergedReflexive;
              }
              console.log("Updated Reflexive:", updatedReflexive);
              return updatedReflexive;
            });
          });
        }
      }

      if (
        question.baseQuestionType === "Trigger_On_Yes" &&
        answer === "No" &&
        question.searchType?.[0]?.value === "Linked_Disclosure"
      ) {
        clearAllReflexiveQuestions(questionId);
      } else if (
        question.baseQuestionType === "Trigger_On_Yes" &&
        answer === "Yes" &&
        question.searchType?.[0]?.value === "Linked_Disclosure"
      ) {
        if (
          question.searchType &&
          question.searchType[0]["triggerOn"] === answer &&
          question.baseQuestionDisclosures
        ) {
          const baseQuestionId = question.baseQuestionId;
          const categoryId = question.categoryId;
          const fetchDisclosureId = question.baseQuestionDisclosures;
          const disclosureId = fetchDisclosureId[0].disclosureId;

          fetchReflexiveQuestions(
            disclosureId,
            categoryId,
            baseQuestionId
          ).then((reflexiveQuestions) => {
            let reflexArray = [];
            reflexArray.push(reflexiveQuestions["decisionTree"]);
            setReflexiveQuestions((prevReflexive) => ({
              ...prevReflexive,
              [questionId]: reflexArray,
            }));
          });
        }
      }

      return updatedAnswers;
    });

    if (answer === "No") {
      // clearAllReflexiveQuestions(questionId);
    } else if (answer === "Yes") {
      handleNestedReflexiveQuestions(questionId, answer);
    }
  };

  const clearAllReflexiveQuestions = (questionId) => {
    setReflexiveQuestions((prevReflexive) => {
      const updatedReflexive = { ...prevReflexive };

      const recursiveClear = (questionId) => {
        if (!questionId || !updatedReflexive[questionId]) return; // Check if id is valid and exists

        if (updatedReflexive[questionId]) {
          updatedReflexive[questionId].forEach((reflexive) => {
            if (reflexive.branches) {
              reflexive.branches.forEach((branch) =>
                recursiveClear(branch.reflexiveQuestionId)
              );
            }
            delete updatedReflexive[reflexive.baseQuestionId];
          });
          delete updatedReflexive[questionId];
        }
      };

      recursiveClear(questionId);

      return updatedReflexive;
    });

    setAnswers((prevAnswers) => {
      const updatedAnswers = { ...prevAnswers };
      const recursiveClearAnswers = (questionId) => {
        if (!questionId || !reflexiveQuestions[questionId]) return; // Check if id is valid and exists

        if (reflexiveQuestions[questionId]) {
          reflexiveQuestions[questionId].forEach((reflexive) => {
            // recursiveClearAnswers(reflexive.reflexiveQuestionId);
            if (reflexive && reflexive.reflexiveQuestionId) {
              // Safeguard reflexive object
              recursiveClearAnswers(reflexive.reflexiveQuestionId);
            }
          });
          delete reflexiveQuestions[questionId];
        }
      };

      recursiveClearAnswers(questionId);

      return updatedAnswers;
    });
  };

  const fetchReflexiveQuestions = async (
    disclosureId,
    categoryId,
    questionId
  ) => {
    setLoader(true);
    try {
      //  const caseID= "00000004"

      const caseID = sessionStorage.getItem("CaseId");
      //  const caseID= getCaseID
      console.log("caseID for reflexive-->", caseID);
      // const reflexiveResponse = await axios.get(environment.apiQuestionnaireUrl+`/underwritingCases/reflexiveQuestions?caseId=${caseID}&disclosureId=${disclosureId}&insuredId="1"`);
      // const reflexiveResponse = await axios.get(`http://k8s-default-microing-20cf7cdd45-1047131912.us-east-1.elb.amazonaws.com/questionnaire-management-service/reflexiveQuestions?caseId=${caseID}&disclosureId=${disclosureId}&insuredId=1`);
      const reflexiveResponse = await axios.get(
        `http://192.168.2.7:4009/questionnaireManagementService/reflexiveQuestions?caseId=${caseID}&disclosureId=${disclosureId}&insuredId=1`
      );
      console.log("reflexiveResponse-->", reflexiveResponse.data);

      if (
        !reflexiveResponse.data ||
        !reflexiveResponse.data.decisionTree ||
        reflexiveResponse.data.decisionTree.length === 0
      ) {
        console.warn("Invalid decisionTree or empty reflexiveResponse.");
        return [];
      }

      return reflexiveResponse.data;
    } catch (error) {
      console.error("Error fetching reflexive questions:", error);
      return [];
    } finally {
      setLoader(false);
    }
  };

  const renderReflexiveQuestions = (questionId) => {
    if (
      !questionId ||
      !reflexiveQuestions ||
      Object.keys(reflexiveQuestions).length === 0
    ) {
      // console.warn("No valid reflexive questions found for rendering.");
      return null;
    }

    const getReflexiveQuestions = (id) => {
      return reflexiveQuestions[id] || [];
    };

    const reflexiveQuestionsForId = getReflexiveQuestions(questionId);

    if (!reflexiveQuestionsForId.length) {
      // console.warn(`No reflexive questions found for questionId: ${questionId}`);
      return null;
    }

    return reflexiveQuestionsForId.map((question, index) => (
      <div key={index}>{renderSingleQuestion(question, index)}</div>
    ));
  };

  const renderSingleQuestion = (question, index) => {
    if (!question || !question.reflexiveQuestion) {
      console.warn("Invalid question or reflexiveQuestion data.");
      return null;
    }

    const baseQuestionId = question.baseQuestionId;
    const parentQuestionId = question.reflexiveQuestion.reflexiveQuestionId;
    const preselectedValue =
      question.reflexiveQuestion.reflexiveQuestionAnswerValue;

    // question.reflexiveQuestion.branches.forEach(branch => {
    //     if (branch.selected === "true") {
    //         handleNestedReflexiveQuestions(baseQuestionId, parentQuestionId, branch, false);
    //     }
    // });

    const handleRadioChange = (selectedValue) => {
      question.reflexiveQuestion.reflexiveQuestionAnswerValue = selectedValue;
      question.reflexiveQuestion.branches =
        question.reflexiveQuestion.branches.map((branch) => ({
          ...branch,
          Selected: branch.branchValue === selectedValue ? true : false, // Mark selected branch as true
        }));

      setSelectedBranchText((prevText) => ({
        ...prevText,
        [parentQuestionId]: selectedValue === "true" ? "Yes" : "No",
      }));
    };

    return (
      <>
        <div className="row">
          <div className="col-12 col-sm-6 mb-2">
            <label>
              {" "}
              {`${String.fromCharCode(65 + index)}. ${
                question.reflexiveQuestion.reflexiveQuestionText
              }`}
            </label>
          </div>
          <div className="col-10 col-sm-6 mb-2">
            {question.reflexiveQuestion.reflexiveQuestionType === "List" && (
              <select
                value={preselectedValue || ""}
                className="col-sm-6 form-control"
                onChange={(e) => {
                  const selectedBranchValue = e.target.value;

                  question.reflexiveQuestion.branches =
                    question.reflexiveQuestion.branches.map((branch) => ({
                      ...branch,
                      selected:
                        branch.branchValue.toString() === selectedBranchValue
                          ? "true"
                          : "false",
                    }));

                  question.reflexiveQuestion.reflexiveQuestionAnswerValue =
                    selectedBranchValue;

                  const selectedBranch =
                    question.reflexiveQuestion.branches.find(
                      (branch) =>
                        branch.branchValue.toString() === selectedBranchValue
                    );

                  // if (selectedBranch) {
                  //     handleNestedReflexiveQuestions(baseQuestionId, parentQuestionId, selectedBranch, false);
                  // }

                  if (selectedBranch) {
                    if (selectedBranch.reflexiveQuestion) {
                      handleNestedReflexiveQuestions(
                        baseQuestionId,
                        parentQuestionId,
                        selectedBranch,
                        false
                      );
                    } else {
                      setSelectedBranchText((prevText) => ({
                        ...prevText,
                        [parentQuestionId]: selectedBranch.branchText,
                      }));
                    }
                  }
                }}
                // disabled={!!disabledSections[currentSectionIndex]}
                disabled={disabledSections[currentSectionIndex] || false}
              >
                <option value="">Select</option>
                {question.reflexiveQuestion.branches.map((branch, index) => (
                  <option key={index} value={branch.branchValue}>
                    {branch.branchText}
                  </option>
                ))}
              </select>
            )}

            {question.reflexiveQuestion.reflexiveQuestionType === "Text" && (
              <div className="ml-3 ml-sm-3 input-container">
                <input
                  type="text"
                  className="form-input"
                  value={
                    question.reflexiveQuestion.reflexiveQuestionAnswerValue ||
                    ""
                  }
                  onChange={(e) => {
                    const textValue = e.target.value;

                    console.log("Updated Text Value:", textValue);
                    console.log(
                      "Question ID:",
                      question.reflexiveQuestion.reflexiveQuestionId
                    );

                    question.reflexiveQuestion.reflexiveQuestionAnswerValue =
                      textValue;

                    setSelectedBranchText((prevText) => ({
                      ...prevText,
                      [question.reflexiveQuestion.reflexiveQuestionId]:
                        textValue,
                    }));
                  }}
                  // disabled={!!disabledSections[currentSectionIndex]}
                  disabled={disabledSections[currentSectionIndex] || false}
                />
              </div>
            )}

            {question.reflexiveQuestion.reflexiveQuestionType === "Numeric" && (
              <div className="ml-3 ml-sm-3 input-container">
                <input
                  type="number"
                  className="form-input"
                  value={
                    question.reflexiveQuestion.reflexiveQuestionAnswerValue ||
                    ""
                  }
                  onChange={(e) => {
                    const numericValue = e.target.value;

                    console.log("Updated Text Value:", numericValue);
                    console.log(
                      "Question ID:",
                      question.reflexiveQuestion.reflexiveQuestionId
                    );

                    question.reflexiveQuestion.reflexiveQuestionAnswerValue =
                      numericValue;

                    setSelectedBranchText((prevText) => ({
                      ...prevText,
                      [question.reflexiveQuestion.reflexiveQuestionId]:
                        numericValue,
                    }));
                  }}
                  //   disabled={!!disabledSections[currentSectionIndex]}
                  disabled={disabledSections[currentSectionIndex] || false}
                />
              </div>
            )}

            {question.reflexiveQuestion.reflexiveQuestionType === "Boolean" && (
              <div className="form-group">
                <label
                  className="d-block"
                  id={`question-label-${question.reflexiveQuestion.reflexiveQuestionId}`}
                >
                  {question.reflexiveQuestion.questionText}
                </label>
                <div className="form-check form-check-inline">
                  <input
                    type="radio"
                    id={`yes-${question.reflexiveQuestion.reflexiveQuestionId}`}
                    name={question.reflexiveQuestion.reflexiveQuestionId}
                    value="Yes"
                    checked={preselectedValue === "true"}
                    onChange={() => handleRadioChange("true")}
                    className="form-check-input"
                    aria-labelledby={`question-label-${question.reflexiveQuestion.reflexiveQuestionId}`}
                    // disabled={!!disabledSections[currentSectionIndex]}
                    disabled={disabledSections[currentSectionIndex] || false}
                  />
                  <label
                    htmlFor={`yes-${question.reflexiveQuestion.reflexiveQuestionId}`}
                    className="form-check-label"
                  >
                    Yes
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    type="radio"
                    id={`no-${question.reflexiveQuestion.reflexiveQuestionId}`}
                    name={question.reflexiveQuestion.reflexiveQuestionId}
                    value="No"
                    checked={preselectedValue === "false"}
                    onChange={() => handleRadioChange("false")}
                    className="form-check-input"
                    aria-labelledby={`question-label-${question.reflexiveQuestion.reflexiveQuestionId}`}
                    // disabled={!!disabledSections[currentSectionIndex]}
                    disabled={disabledSections[currentSectionIndex] || false}
                  />
                  <label
                    htmlFor={`no-${question.reflexiveQuestion.reflexiveQuestionId}`}
                    className="form-check-label"
                  >
                    No
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {nestedReflexiveQuestions[baseQuestionId] &&
          nestedReflexiveQuestions[baseQuestionId][parentQuestionId] && (
            <div style={{ marginLeft: "30px" }}>
              {Object.values(
                nestedReflexiveQuestions[baseQuestionId][parentQuestionId]
              ).map((reflexiveQuestion, index) => (
                <div key={index} style={{ marginLeft: "20px" }}>
                  {renderNestedQuestion(
                    baseQuestionId,
                    parentQuestionId,
                    reflexiveQuestion
                  )}
                </div>
              ))}
            </div>
          )}
      </>
    );
  };

  const renderNestedQuestion = (
    baseQuestionId,
    parentQuestionId,
    reflexiveQuestion
  ) => {
    return (
      <div style={{ marginLeft: "20px" }}>
        <div className="row">
          <div className="col-12 col-sm-6 mb-2">
            <label>{reflexiveQuestion.reflexiveQuestionText}</label>
          </div>
          <div className="col-10 col-sm-6 mb-2">
            {reflexiveQuestion.reflexiveQuestionType === "List" && (
              <div>
                <select
                  className="col-sm-6 form-control"
                  // disabled={!!disabledSections[currentSectionIndex]}
                  disabled={disabledSections[currentSectionIndex] || false}
                  onChange={(e) => {
                    const selectedBranchValue = e.target.value;

                    // Update the branches with the correct `selected` flags
                    reflexiveQuestion.branches = reflexiveQuestion.branches.map(
                      (branch) => ({
                        ...branch,
                        selected:
                          branch.branchValue.toString() === selectedBranchValue
                            ? "true"
                            : "false",
                      })
                    );

                    const selectedBranch = reflexiveQuestion.branches.find(
                      (branch) =>
                        branch.branchValue.toString() === selectedBranchValue
                    );

                    if (selectedBranch) {
                      handleNestedReflexiveQuestions(
                        baseQuestionId,
                        parentQuestionId,
                        selectedBranch,
                        true
                      );
                    }
                  }}
                >
                  <option value="">Select</option>
                  {reflexiveQuestion.branches.map((branch, index) => (
                    <option key={index} value={branch.branchValue}>
                      {branch.branchText}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {reflexiveQuestion.reflexiveQuestionType === "Text" && (
              <input
                type="text"
                onChange={(e) => {
                  /* Handle text input */
                }}
                // disabled={!!disabledSections[currentSectionIndex]}
                disabled={disabledSections[currentSectionIndex] || false}
              />
            )}

            {reflexiveQuestion.reflexiveQuestionType === "numeric" && (
              <input
                type="number"
                onChange={(e) => {
                  /* Handle numeric input */
                }}
                // disabled={!!disabledSections[currentSectionIndex]}
                disabled={disabledSections[currentSectionIndex] || false}
              />
            )}

            {reflexiveQuestion.reflexiveQuestionType === "Boolean" && (
              <div className="form-group">
                <label
                  className="d-block"
                  id={`question-label-${reflexiveQuestion.reflexiveQuestionId}`}
                >
                  {reflexiveQuestion.questionText}
                </label>
                <div className="form-check form-check-inline">
                  <input
                    type="radio"
                    id={`yes-${reflexiveQuestion.reflexiveQuestionId}`}
                    name={reflexiveQuestion.reflexiveQuestionId}
                    value="Yes"
                    onChange={() =>
                      handleAnswer(reflexiveQuestion.reflexiveQuestionId, "Yes")
                    }
                    className="form-check-input"
                    aria-labelledby={`question-label-${reflexiveQuestion.reflexiveQuestionId}`}
                    // disabled={!!disabledSections[currentSectionIndex]}
                    disabled={disabledSections[currentSectionIndex] || false}
                  />
                  <label
                    htmlFor={`yes-${reflexiveQuestion.reflexiveQuestionId}`}
                    className="form-check-label"
                  >
                    Yes
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    type="radio"
                    id={`no-${reflexiveQuestion.reflexiveQuestionId}`}
                    name={reflexiveQuestion.reflexiveQuestionId}
                    value="No"
                    onChange={() =>
                      handleAnswer(reflexiveQuestion.reflexiveQuestionId, "No")
                    }
                    className="form-check-input"
                    aria-labelledby={`question-label-${reflexiveQuestion.reflexiveQuestionId}`}
                  />
                  <label
                    htmlFor={`no-${reflexiveQuestion.reflexiveQuestionId}`}
                    className="form-check-label"
                  >
                    No
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleNestedReflexiveQuestions = (
    baseQuestionId,
    parentQuestionId,
    branch,
    isChildReflexive
  ) => {
    if (branch.reflexiveQuestion) {
      setNestedReflexiveQuestions((prevState) => {
        const updatedState = { ...prevState };

        if (baseQuestionId === "LQ_liquor") {
          if (isChildReflexive) {
            const childReflexiveQuestions =
              updatedState[baseQuestionId]?.[parentQuestionId] || {};

            if (childReflexiveQuestions) {
              delete childReflexiveQuestions[
                branch.reflexiveQuestion.reflexiveQuestionId
              ];
            }

            childReflexiveQuestions[
              branch.reflexiveQuestion.reflexiveQuestionId
            ] = branch.reflexiveQuestion;
            updatedState[baseQuestionId] = {
              ...updatedState[baseQuestionId],
              [parentQuestionId]: childReflexiveQuestions,
            };
          } else {
            updatedState[baseQuestionId] = {
              [parentQuestionId]: {
                [branch.reflexiveQuestion.reflexiveQuestionId]:
                  branch.reflexiveQuestion,
              },
            };
          }

          const reflexiveQuestions =
            updatedState[baseQuestionId]?.[parentQuestionId];
          if (
            reflexiveQuestions &&
            Object.keys(reflexiveQuestions).length === 3
          ) {
            const lastKey = Object.keys(reflexiveQuestions).pop();
            if (lastKey) {
              delete reflexiveQuestions[lastKey];
            }
          }
        } else {
          updatedState[baseQuestionId] = {
            ...updatedState[baseQuestionId],
            [parentQuestionId]: {
              [branch.reflexiveQuestion.reflexiveQuestionId]:
                branch.reflexiveQuestion,
            },
          };
        }

        return updatedState;
      });

      setSelectedBranchText((prevText) => ({
        ...prevText,
        [parentQuestionId]: branch.branchText,
      }));
    } else {
      console.error(
        `No reflexive question found for branch: ${branch.branchText}`
      );
    }
  };

  const validateBaseQuestions = (answers, generalQuestionnaire) => {
    const unansweredBaseQuestions = generalQuestionnaire
      .filter((question) => {
        if (question.baseQuestionType === "Heading") return false;
        // if (question.baseQuestionType === "Enter_Details") return false;

        const answer = answers[question.baseQuestionId];

        if (
          question.baseQuestionType === "Enter_Details" &&
          question.searchType?.[0]?.value === "Search"
        ) {
          if (
            !answer || // No answer at all
            (typeof answer === "string" && answer.trim() === "") ||
            (typeof answer === "object" && !answer.disclosureName)
          ) {
            if (
              !question.baseQuestionDisclosures ||
              question.baseQuestionDisclosures.length === 0
            ) {
              return true;
            }
          }

          if (answer === "") {
            return true;
          }

          return false; // No error, valid answer present
        }

        return (
          answer === null ||
          answer === undefined ||
          answer === false ||
          (typeof answer === "string" && answer.trim() === "")
        );
      })
      .map((question) => question.baseQuestionText);

    if (unansweredBaseQuestions.length > 0) {
      // alert(`Please provide answers for the following base questions: ${unansweredBaseQuestions.join(", ")}`);
      setLoader(false);
      var alertIs = "Please provide answers for the all questions";
      setProposalNumber(alertIs);
      setModalShow(true);
      return false;
    }

    const unansweredReflexiveQuestions = [];
    Object.keys(reflexiveQuestions).forEach((baseQuestionId) => {
      reflexiveQuestions[baseQuestionId].forEach((reflexive) => {
        const reflexiveQuestion = reflexive.reflexiveQuestion;
        const questionText = reflexiveQuestion.reflexiveQuestionText;
        const answerValue = reflexiveQuestion.reflexiveQuestionAnswerValue;

        if (
          answerValue === null ||
          answerValue === "" ||
          answerValue === undefined
        ) {
          unansweredReflexiveQuestions.push(questionText);
        }
      });
    });

    if (unansweredReflexiveQuestions.length > 0) {
      // alert(`Please provide answers for the following reflexive questions: ${unansweredReflexiveQuestions.join(", ")}`);
      setLoader(false);
      var alertIs = "Please provide answers for the all questions";
      setProposalNumber(alertIs);
      setModalShow(true);
      return false;
    }

    return true;
  };

  const saveAndProceed = async () => {
    var currentdate = new Date();
    var generalID =
      "GER" +
      currentdate.getDate() +
      "" +
      (currentdate.getMonth() + 1) +
      currentdate.getFullYear() +
      currentdate.getHours() +
      "" +
      currentdate.getMinutes() +
      currentdate.getSeconds() +
      currentdate.getMilliseconds();
    console.log("GER is :::" + generalID);
    setGeneralID(generalID);
    sessionStorage.setItem("generalID", generalID);

    // const caseId = "00000004";
    const caseId = getCaseID;
    const insuredId = "1";

    if (!validateBaseQuestions(answers, generalQuestionnaire)) {
      return;
    }

    const baseQuestionAnswers = Object.keys(answers)
      .filter(
        (questionId) =>
          answers[questionId] === "Yes" || answers[questionId] === "No"
      )
      .map((questionId) => ({
        questionId: questionId,
        baseQuestionAnswerValue: answers[questionId] === "Yes" ? true : false,
      }));

    const putBaseQuestionPayload = {
      caseId,
      insuredId,
      baseQuestionAnswers,
    };
    let isSuccessful = true;

    console.log(
      "putBaseQuestionPayload to save:",
      JSON.stringify(putBaseQuestionPayload, null, 2)
    );

    try {
      await saveDetail("al_general_question", {
        general_question_id: generalID,
        ...putBaseQuestionPayload,
      });

      console.log("putBaseQuestionPayload saved successfully");
    } catch (error) {
      console.error("Error while saving base question payload:", error);
      isSuccessful = false;
    }

    try {
      const response = await putBaseQuestions(
        putBaseQuestionPayload,
        caseId,
        insuredId
      );
      console.log("PUT request response:", response);
    } catch (error) {
      console.error("Error while sending PUT request:", error);
    }

    const nonBooleanAnswers = Object.keys(answers)
      .filter(
        (questionId) =>
          answers[questionId] !== "Yes" && answers[questionId] !== "No"
      )
      .map((questionId) => ({
        reflexiveQuestionId: questionId,
        disclosureId: answers[questionId].disclosureId,
        reflexiveQuestionAnswerValue: answers[questionId],
      }));

    const reflexivePayload = [];
    Object.keys(reflexiveQuestions).forEach((baseQuestionId) => {
      const reflexiveAnswers = reflexiveQuestions[baseQuestionId];

      reflexiveAnswers.forEach((question) => {
        let reflexiveQuestionAnswerValue = "";

        if (question.reflexiveQuestion.reflexiveQuestionType === "Boolean") {
          const selectedBranchIndex =
            question.reflexiveQuestion.branches.findIndex(
              (branch) => branch.Selected
            );

          if (selectedBranchIndex !== -1) {
            const selectedBranch =
              question.reflexiveQuestion.branches[selectedBranchIndex];
            reflexiveQuestionAnswerValue = selectedBranch.branchValue;
          }
        } else if (
          question.reflexiveQuestion.reflexiveQuestionType === "List"
        ) {
          const selectedBranch = question.reflexiveQuestion.branches.find(
            (branch) => branch.selected === "true"
          );
          reflexiveQuestionAnswerValue = selectedBranch?.branchValue || "";
        } else if (
          question.reflexiveQuestion.reflexiveQuestionType === "Text"
        ) {
          reflexiveQuestionAnswerValue =
            question.reflexiveQuestion.reflexiveQuestionAnswerValue || "";
        } else if (
          question.reflexiveQuestion.reflexiveQuestionType === "Numeric"
        ) {
          reflexiveQuestionAnswerValue =
            question.reflexiveQuestion.reflexiveQuestionAnswerValue || "";
        }

        if (reflexiveQuestionAnswerValue) {
          reflexivePayload.push({
            caseId,
            insuredId,
            disclosureId: question.disclosureId || "1",
            baseQuestionId,
            reflexiveQuestionAnswers: [
              {
                reflexiveQuestionId:
                  question.reflexiveQuestion.reflexiveQuestionId || "0",
                reflexiveQuestionAnswerValue,
              },
            ],
          });
        }
      });
    });

    console.log(
      "Reflexive Payload to Save:",
      JSON.stringify(reflexivePayload, null, 2)
    );

    // PUT request for reflexive questions
    try {
      for (const payload of reflexivePayload) {
        const reflexiveResponse = await putReflexiveQuestions(payload);
        console.log(
          "PUT request response for payload:",
          payload,
          reflexiveResponse
        );
      }
      console.log("All PUT requests completed successfully.");
      isSuccessful = true;
      setIsSuccessful(isSuccessful);
    } catch (error) {
      console.error("Error while sending PUT requests:", error);
      isSuccessful = false;
    }

    setLoader(false);
    if (isSuccessful) {
      // setDisabledSections((prev) => ({
      //     ...prev,
      //     [currentSectionIndex]: true,
      // }));

      const updatedDisabledSections = {
        ...disabledSections,
        [currentSectionIndex]: true,
      };
      setDisabledSections(updatedDisabledSections);
      //add this flag in indexedDb for perticular caseID
      sessionStorage.setItem(
        "disabledSections",
        JSON.stringify(updatedDisabledSections)
      );

      console.log("Current section disabled:", currentSectionIndex);

      if (currentSectionIndex < pageReferences.length - 1) {
        setCurrentSectionIndex((prevIndex) => prevIndex + 1);
      } else {
        navigate("/familyinformation");
      }

      // navigate("/clientsdeclaration");
    } else {
      console.log("Errors occurred, navigation cancelled.");
    }
  };

  const getSectionHeader = () => {
    if (
      pageReferences.length > 0 &&
      currentSectionIndex < pageReferences.length
    ) {
      const sectionName =
        pageReferences[currentSectionIndex]?.name || "General";
      return sectionName.replace(/_/g, " ") + " Questionnaire";
    }
    return "Questionnaire";
  };

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
    document.body.classList.add("ios-safearea");
  } else {
    document.body.classList.remove("ios-safearea");
  }

  return (
    <SidebarLayout>
      <div className="general-container">
        {/* <div className="main-background-image-container"></div> */}
        <div className="subsection h5 ml-sm-2 ml-2">
          <h5>{getSectionHeader()}</h5>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, actions) => {
            saveAndProceed();
          }}
        >
          {(formik) => (
            <Form
              onSubmit={formik.handleSubmit}
              className={`generalform ${isReadOnly ? "overlay active" : ""}`}
            >
              {generalQuestionnaire.map((question, index) => (
                <div key={question.baseQuestionId} className="row mt-2">
                  <div
                    className="col-12 col-sm-12 pl-3"
                    style={{ textAlign: "left" }}
                  >
                    {renderQuestion(question, index)}
                  </div>
                  <div
                    className="col-12 col-sm-12 ml-4"
                    style={{ textAlign: "left" }}
                  >
                    {renderReflexiveQuestions(question.baseQuestionId)}
                  </div>
                </div>
              ))}

              <Loader show={loader} />

              {/* <div style={{textAlign:"center"}} className="pt-4">
                                <Button className="saveQue" type="submit" onClick={(values) => setFormState(values)} id="NominationButton">Save & Proceed</Button>
                            </div> */}
              {!isKeyboardVisible && (
                <div className="fixednextprevbutton d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary btnprev"
                    onClick={navToBackScreen}
                  >
                    {" "}
                    Prev{" "}
                  </button>
                  <button
                    type="submit"
                    className="btn btnnext"
                    onClick={(values) => setFormState(values)}
                    id="NominationButton"
                  >
                    Next
                  </button>
                </div>
              )}
            </Form>
          )}
        </Formik>

        <MyVerticallyCenteredModal
          show={modalShow}
          onHide={() => setModalShow(false)}
        />
      </div>
    </SidebarLayout>
  );
};

export default GeneralQuestionnaire;
