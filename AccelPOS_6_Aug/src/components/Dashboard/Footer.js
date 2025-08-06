import React from "react";
import "./Footer.css";
import { useNavigate } from "react-router-dom";
import { saveDetail } from "../../db/indexedDB";
import Button from 'react-bootstrap/Button';

const Footer = () => {
    const json_data = {
        "CL1001": {
            "person_id": "1234",
            "agent_id": "A001",
            "customer_name": "John Doe"
        },
        "CL2001": {
            "person_id": "5678",
            "agent_id": "A002",
            "customer_name": "Jane Smith"
        }
    };

    const sqsID = sessionStorage.getItem("sqsID")

    const sqs_json_data = {"sqsID":sqsID , "signature_flag":"false","client_id":"CL78903214","productName":"Micro_Insurance_plan","paymentMode":"Cheque","paymentFrequency":"M"}
    const rider_json_data = {"rider_id":"RI12345","client_id":"CL78903214","showAccelterm":true,"showCrisesCoverPlus":true,"coverageCrisesCoverPlus":10000,"policyTermCrisesCoverPlus":10,"showAccelmortage":true,"coverageAccelmortage":10000,"policyTermAccelmortage":10,"showAccidentalDeath":true,"coverageAccidentalDeath":10000,"policyTermAccidentalDeath":10,"showWeeklyIndenmnity":true,"coverageWeeklyIndemnity":10000,"policyTermWeeklyIndemnity":10}

    const go_to_previous_page = useNavigate();

    const gotopreviouspage = () => {
        go_to_previous_page(-1);
    };



    //SQS // {"sqs_id":"SQS292024155932550","client_id":"CL78903214","productName":"Micro_Insurance_plan","paymentMode":"Cheque","paymentFrequency":"M"}

    //Rider// {"client_id":"CL78903214","showAccelterm":true,"showCrisesCoverPlus":true,"coverageCrisesCoverPlus":10000,"policyTermCrisesCoverPlus":10,"showAccelmortage":true,"coverageAccelmortage":10000,"policyTermAccelmortage":10,"showAccidentalDeath":true,"coverageAccidentalDeath":10000,"policyTermAccidentalDeath":10,"showWeeklyIndenmnity":true,"coverageWeeklyIndemnity":10000,"policyTermWeeklyIndemnity":10}
    const savedatatodb = () =>
    {
        Object.entries(json_data).forEach(([key, detail]) => {
            console.log("All details:", detail);
            saveDetail('al_person_details', { ...detail, client_id: key }) // Add client_id to the details if needed
                .then(() => {
                    console.log('Detail saved successfully:', detail);
                })
                .catch((error) => {
                    console.error('Error saving detail:', detail, error);
                });
        });
        //saveDetail('al_person_details',json_data)

        saveDetail('al_sqs_details',sqs_json_data).then(() => {
            console.log('Detail of sqs saved successfully:');
        })

        .catch((error) => {
            console.error('Error saving detail:',error);
        });

        saveDetail('al_rider_details',rider_json_data).then(()=>{
            console.log("Riders details saved successfully")
        }).catch((error) => {
            console.error('Error saving rider detail:',error);
        });
    }

    return (
        <>
            <div className="container">
                <div className="row mt-2">
                    {/* <div className="col-4 col-sm-4">
                        <Button variant="primary" onClick={gotopreviouspage}>Back</Button>
                    </div> */}
                    <div className="col-4 col-sm-4">
                        <Button variant="success" className="save" onClick={savedatatodb}>Save</Button>
                    </div>
                    <div className="col-4 col-sm-4">
                        <Button variant="success" className="saveandproceed">Proceed</Button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Footer;
