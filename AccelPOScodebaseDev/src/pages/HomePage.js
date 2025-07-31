// src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import {
    saveDetail, deleteById, findRecordById, updateDetailById, fetchDetails,
    fetchSortedDetails, sortRecordInAscending, sortRecordInDescending,tablesJoin,
    findByInQuery,findByAndORQuery
} from '../db/indexedDB';

const HomePage = () => {
    const [storeName, setStoreName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [e_reference_id, setID] = useState('');
    const [lastName, setLastName] = useState('');
    const [items, setItems] = useState([]);
    const [findUserId, setFindUserId] = useState('');



    const handleAddItem = async () => {
        let userDetail = "";

        console.log("click store====>" + storeName)

        if (storeName == 'address_detail') {
            let address_id = e_reference_id;
            userDetail = { firstName, lastName, address_id };

        } else if (storeName == 'al_person_details') {
            //let person_id = e_reference_id;
            // userDetail = { firstName, lastName ,person_id};
            userDetail = {
                "person_type": "slife",
                "person_id": "PR167202493235519",
                "client_id": "CL167202492216345",
                "pre_natal_child_flg": "",
                "agent_id": "2222709",
                "language": "english",
                "company_id": "709",
                "module_version": "",
                "is_proposer": "",
                "title": "DR",
                "first_name": "NEW",
                "name_with_initials": "NEW",
                "last_name": "NEW",
                "mobile_no": "3698074521",
                "dob": "16/07/1991",
                "anb": "33",
                "gender": "Female",
                "marital_status": "Single",
                "nationality": "SL",
                "educational_qualification": "A/L Completed",
                "is_child_included": "No",
                "is_parent_included": "No",
                "e_reference_id": "ER167202493235507"
            }

        } else if (storeName == 'al_application_main') {

             //userDetail = { firstName, lastName ,e_reference_id};

            // userDetail = { "firstName": "VED", "lastName": "VED", "e_reference_id": "123" ,"cretion_date":"2023-03-04 20:01:01"};

            userDetail = {
                "is_slife_mandatory": "", "is_tlife_mandatory": "",
                "application_type": "04", "application_flow": "NC", "status": "Quotation",
                "e_reference_id": "ER167202493235508", "company_id": "708", "agent_id": "2222709", 
                "client_id": "CL167202492216345", "module_version": "", "language": "sinhala", 
                "creation_dt": "2024-07-16 09:32:32", "modified_dt": "2024-07-16 09:32:32", "expiry_dt": "2024-07-16 09:32:32"
            }

        } else if (storeName == 'client_details') {
            userDetail = {
                "client_id": "CL167202492216345", "agent_id": "2222709", "company_id": "709", "title": "DR.", "dob": "16/07/1991 ", "anb": "33", "educational_qualification": "A/L Completed", "marital_status": "Single", "gender": "01", "first_name": "NEW", "name_with_initials": "NEW", "last_name": "NEW",
                "email_id": "Vedika.kumbhar@acceltree.com", "mobile_no": "3698074521", "appointment_date": "", "appointment_time": "",
                "creation_dt": "2024-07-16 09:22:22", "modified_dt": "2024-07-16 09:22:22", "syncFlag": "N"
            }
        }

        saveDetail(storeName, userDetail)
            .then(() => {
                console.log('User details saved successfully');
                //fetchJoinedDetails().then((data) => setJoinedDetails(data));
            })
            .catch((error) => {
                console.error('Error saving user details:', error);
            });
    };

    const handleFind = mutationList => {

        findRecordById(storeName, e_reference_id)
            .then((data) => {
                console.log('find details  successfully' + JSON.stringify(data));
            })
            .catch((error) => {
                console.error('Error finding user details:', error);
            });
    };
    const handleDeleteItem = async () => {

        deleteById(storeName, e_reference_id)
            .then(() => {
                console.log('User deleted successfully');
                // Optionally, fetch updated details here
            })
            .catch((error) => {
                console.error('Error deleting user:', error);
            });

    };

    const handleSelectAll = mutationList => {

        fetchDetails(storeName)
            .then((data) => {
                console.log('find All details  successfully' + JSON.stringify(data));

                // let sortedData= sortRecordInAscending(data,'firstName',"");                                      
                //let sortedData= sortRecordInAscending(data,'cretion_date',"Date");

                //let sortedData= sortRecordInDescending(data,'firstName',"");
                let sortedData = sortRecordInDescending(data, 'cretion_date', "Date");
                console.log("sortRecordInAscending=====>" + JSON.stringify(sortedData));
            })
            .catch((error) => {
                console.error('Error finding user details:', error);
            });
    };


    const handleUpdate = (event) => {
        event.preventDefault();
        let updatedData = "";

        console.log("click store====>" + storeName)

        if (storeName == 'address_detail') {
            let address_id = e_reference_id;
            updatedData = { firstName, lastName, address_id };

        } else if (storeName == 'al_person_details') {
            let person_id = e_reference_id;
           // updatedData = { firstName, lastName, person_id };
           updatedData = {
            "person_type": "mlife",
            "person_id": "PR167202493235518",
            "client_id": "CL167202492216345",
            "pre_natal_child_flg": "",
            "agent_id": "2222709",
            "language": "english",
            "company_id": "709",
            "module_version": "",
            "is_proposer": "",
            "title": "DR",
            "first_name": "NEW",
            "name_with_initials": "NEW",
            "last_name": "NEW",
            "mobile_no": "3698074521",
            "dob": "16/07/1991",
            "anb": "33",
            "gender": "Female",
            "marital_status": "Single",
            "nationality": "SL",
            "educational_qualification": "A/L Completed",
            "is_child_included": "No",
            "is_parent_included": "No",
            "e_reference_id": "ER167202493235508"
        }


        } else if (storeName == 'al_application_main') {

            updatedData = { firstName, lastName, e_reference_id };
        }else if(storeName == 'client_details'){
            updatedData = {
                "client_id": "CL167202492216345", "agent_id": "2222709", "company_id": "709", "title": "DR.", "dob": "16/07/1991 ", "anb": "33", "educational_qualification": "A/L Completed", "marital_status": "Single", "gender": "01", "first_name": "NEW", "name_with_initials": "NEW", "last_name": "NEW",
                "email_id": "Vedika.kumbhar@acceltree.com", "mobile_no": "3698074521", "appointment_date": "", "appointment_time": "",
                "creation_dt": "2024-07-16 09:22:22", "modified_dt": "2024-07-16 09:22:22", "syncFlag": "N"
            }
    }
        updateDetailById(storeName, e_reference_id, updatedData)
            .then((data) => {
                console.log('User details updated successfully', data);
            })
            .catch((error) => {
                console.error('Error updating user details:', error);
            });
    };
    const handleJoinItem = async () => {
        let jsonJoin = 
        {
            "JOIN": [
              {
                "table_join": [
                  "al_application_main",
                  "al_person_details"
                ],
                "clause_on": {
                  "al_application_main": "e_reference_id",
                  "al_person_details": "e_reference_id"
                },
                "selection": {
                  "al_application_main": [
                    "e_reference_id",
                    "company_id",
                    "client_id",
                    "module_version",
                    "status"
                  ],
                  "al_person_details": [
                    "person_id",
                    "name_with_initials",
                    "first_name",
                    "title"
                  ]
                }
              },
              {
                "table_join": [
                  "client_details"
                ],
                "clause_on": {
                  "selected_result": "client_id",
                  "client_details": "client_id"
                },
                "selection": {
                  "client_details": [
                    "client_id"
                  ]
                }
              }
            ]
          }
        
        
        tablesJoin(jsonJoin)
        .then((data) => {
            console.log('find All details  successfully' + JSON.stringify(data));

            // let sortedData= sortRecordInAscending(data,'firstName',"");                                      
            //let sortedData= sortRecordInAscending(data,'cretion_date',"Date");

            //let sortedData= sortRecordInDescending(data,'firstName',"");
            // let sortedData = sortRecordInDescending(data, 'cretion_date', "Date");
            // console.log("sortRecordInAscending=====>" + JSON.stringify(sortedData));

            
        })
        .catch((error) => {
            console.error('Error finding user details:', error);
        });
};
    
const handleIN = (event) => {

    fetchDetails('al_person_details')
    .then((data) => {
       
        let test = "person_type == 'mlife' AND educational_qualification == 'A/L Completed' OR person_id == 'PR167202493235517'";
        let a =findByAndORQuery(data,test); //findByInQuery(data,'person_type', ['slife', 'mlife']);

        console.log('find All details  successfully' + JSON.stringify(a));
       
    })
    .catch((error) => {
        console.error('Error finding user details:', error);
    });
   
};

    return (
        <div>
            <h1>Home Page</h1>
            <div>
                <input
                    type="text"
                    placeholder="Store Name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="ID"
                    value={e_reference_id}
                    onChange={(e) => setID(e.target.value)}
                />
                {/* <button onClick={handleAddItem}>Add Item</button>

                <button onClick={handleJoinItem}>Join Item</button>

                <button onClick={handleUpdate}>UPDATE Item</button>

                <button onClick={handleDeleteItem}>Delete Item</button> 

                <button onClick={handleFind}>Find Item</button> */}

                <button onClick={handleIN}>Find By In</button>
{/* 
                <button onClick={handleUpdate}>UPDATE Item</button>

                <button onClick={handleSelectAll}>Select All</button> */}

            </div>


            <ul>
                {items.map((item) => (
                    <li key={item.id}>{`${item.firstName} ${item.lastName}`}</li>
                ))}
            </ul>
        </div>
    );
};

export default HomePage;
