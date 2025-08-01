const DB_NAME = 'my_database';
const DB_VERSION = 1;
const db_tables = require('./tableCreation.json');

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      for (let i = 0; i < db_tables["tables"].length; i++) {
        if (!db.objectStoreNames.contains(db_tables.tables[i]["table_name"])) {
          db.createObjectStore(db_tables.tables[i]["table_name"], { keyPath: db_tables.tables[i]["primary_key"] });
        }
      }

    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export function saveDetail(STORE_NAME, SAVE_DETAILS) {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
       //const request = store.add(SAVE_DETAILS);
      const request = store.put(SAVE_DETAILS);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  });
}

export function deleteById(STORE_NAME, UNIQUE_ID) {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(UNIQUE_ID);
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  });
}

export function findRecordById(STORE_NAME, UNIQUE_ID) {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(UNIQUE_ID);
      request.onsuccess = () => {
        if (request.result) {
          resolve({
            result: request.result
          });
        } else {
          reject('Record not found');
        }
      };
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  });
}

export function updateDetailById(STORE_NAME, UNIQUE_ID, UPDATED_DATA) {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.get(UNIQUE_ID);

      request.onsuccess = (event) => {
        const targetResult = event.target.result;
        if (targetResult) {
          // Update the user with new data
          Object.assign(targetResult, UPDATED_DATA);

          const updateRequest = store.put(targetResult);

          updateRequest.onsuccess = () => {
            resolve(targetResult);
          };

          updateRequest.onerror = (event) => {
            reject('Error updating : ' + event.target.errorCode);
          };
        } else {
          reject('Record not found');
        }
      };

      request.onerror = (event) => {
        reject('Error finding user: ' + event.target.errorCode);
      };
    });
  });
}


export function fetchDetails(STORE_NAME) {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  });
}


export function sortRecordInAscending(REQUEST_JSON, REQUEST_COLUMN, DATE_FLAG) {
  return REQUEST_JSON.sort((a, b) => {
    if (DATE_FLAG == "Date") {
      return new Date(a[REQUEST_COLUMN]) - new Date(b[REQUEST_COLUMN]);

    } else {
      if (a[REQUEST_COLUMN].toLowerCase() < b[REQUEST_COLUMN].toLowerCase()) {
        return -1;
      }
      if (a[REQUEST_COLUMN].toLowerCase() > b[REQUEST_COLUMN].toLowerCase()) {
        return 1;
      }
      return 0;
    }
  });
};

export function sortRecordInDescending(REQUEST_JSON, REQUEST_COLUMN, DATE_FLAG) {
  return REQUEST_JSON.sort((a, b) => {
    if (DATE_FLAG == "Date") {
      return new Date(b[REQUEST_COLUMN]) - new Date(a[REQUEST_COLUMN]);
    } else {
      if (a[REQUEST_COLUMN].toLowerCase() > b[REQUEST_COLUMN].toLowerCase()) {
        return -1;
      }
      if (a[REQUEST_COLUMN].toLowerCase() < b[REQUEST_COLUMN].toLowerCase()) {
        return 1;
      }
      return 0;
    }
  });
}


export function findByInQuery(DATA, STORE_COLUMN, TYPE) {

  return DATA.filter(record => TYPE.includes(record[STORE_COLUMN]));
}


export function findByAndORQuery(DATA, QUERY) {

  let filterCondition = parseLogicalOperators(parseCondition(QUERY));
  return DATA.filter(new Function('person', `return ${filterCondition};`));

}
function parseCondition(condition) {
  return condition.replace(/(\w+)\s*==\s*'([^']+)'/g, 'person.$1 === "$2"');
}

function parseLogicalOperators(condition) {
  return condition.replace(/AND/g, '&&').replace(/OR/g, '||');
}

////////// JOIN Query //////////
export async function tablesJoin(JOIN_JSON) {
  try {
    const result_of_table = await selectAllData(JOIN_JSON);
    let joinedDataResult = selectTableJoin(JOIN_JSON, result_of_table);
    return joinedDataResult;
  } catch (error) {
    console.error('Error in tablesJoin:', error);
    throw error; // Re-throw the error to ensure it gets propagated
  }
}


function selectAllData(JOIN_JSON) {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {

      //JOIN_JSON.JOIN ;

      let allTableJoins = JOIN_JSON.JOIN.map(join => join.table_join).flat();
      //console.log("allTableJoins===>"+allTableJoins);

      let transaction = db.transaction(allTableJoins, "readonly");

      const fetchPromises = allTableJoins.map((allTableJoins) => {
        const store = transaction.objectStore(allTableJoins);
        const request = store.getAll();

        return new Promise((resolve, reject) => {
          request.onsuccess = () => resolve({ allTableJoins, data: request.result });
          request.onerror = () => reject(request.error);
        });
      });



      Promise.all(fetchPromises)
        .then((results) => {
          const joinedData = results.reduce((acc, result) => {
            acc[result.allTableJoins] = result.data;
            return acc;
          }, {});
          //console.log("Joined Data:", JSON.stringify(joinedData));
          resolve(joinedData);
        })
        .catch(reject);


    });
  });
}


const selectTableJoin = (JOIN_JSON, result_of_table) => {
  let final_join;
  for (let t = 0; t < JOIN_JSON.JOIN.length; t++) {
    if (t == 0) {
      let table_one = JOIN_JSON.JOIN[t]['table_join'][0];
      let table_two = JOIN_JSON.JOIN[t]['table_join'][1];

      let documentObject = {
        [table_one]: result_of_table[table_one]
      };

      let documentObjectTwo = {
        [table_two]: result_of_table[table_two]
      };

      final_join = joinData(documentObject, documentObjectTwo, JOIN_JSON.JOIN[t]['clause_on'][table_one],
        JOIN_JSON.JOIN[t]['clause_on'][table_two], true, JOIN_JSON);

    } else {
      let table_one = JOIN_JSON.JOIN[t]['table_join'][0];
      let documentObject = {
        "selected_result": final_join
      };

      let documentObjectTwo = {
        [table_one]: result_of_table[table_one]
      };
      final_join = joinData(documentObject, documentObjectTwo, JOIN_JSON.JOIN[t]['clause_on']['selected_result'],
        JOIN_JSON.JOIN[t]['clause_on'][table_one], false, JOIN_JSON);
    }

  }
  return final_join;
};


const joinData = (documentObject, documentObjectTwo, key_one, key_two, flag, JOIN_JSON) => {

  const combinedData = [];
  let storeData = documentObject[Object.keys(documentObject)[0]];
  let storeOneData = documentObjectTwo[Object.keys(documentObjectTwo)[0]];
  for (let i = 0; i < storeData.length; i++) {
    const store = storeData[i];
    for (let j = 0; j < storeOneData.length; j++) {
      const storeOne = storeOneData[j];
      if (store[key_one] === storeOne[key_two]) {
        let firstObject = {
          [Object.keys(documentObject)[0]]: store
        };
        let secoundObject = {
          [Object.keys(documentObjectTwo)[0]]: storeOne
        };
        let get_result = createResult(firstObject, secoundObject, flag, JOIN_JSON);
        combinedData.push(get_result);

        break;

      }
    }
  }
  return combinedData;
}


function findTableInSelection(json, tableName) {
  for (const join of json.JOIN) {
    if (join.selection[tableName]) {
      return join.selection[tableName];
    }
  }
  return null;
}


const createResult = (documentObject, documentObjectTwo, flag, JOIN_JSON) => {


  let TableOneData = documentObject[Object.keys(documentObject)[0]];
  let TableTwoData = documentObjectTwo[Object.keys(documentObjectTwo)[0]];
  let TableOneName = Object.keys(documentObject)[0];
  let TableTwoName = Object.keys(documentObjectTwo)[0];
  let object_result = {};
  let teable_count = 1
  let result = "";

  if (flag) {
    while (teable_count <= 2) {
      if (teable_count == 1) {
        result = findTableInSelection(JOIN_JSON, TableOneName);
      } else {
        result = findTableInSelection(JOIN_JSON, TableTwoName);
      }

      for (let i = 0; i < result.length; i++) {
        if (teable_count == 1) {
          object_result[result[i]] = TableOneData[result[i]];
        } else {
          object_result[result[i]] = TableTwoData[result[i]];
        }

      }
      teable_count++;
    }

    return object_result;
  } else {
    result = findTableInSelection(JOIN_JSON, TableTwoName);
    for (let i = 0; i < result.length; i++) {
      TableOneData[result[i]] = TableTwoData[result[i]];
    }
    return TableOneData;
  }

}



export async function getPaginatedData(data, limit, offset) {
  try {
    const paginatedData = data.slice(offset, offset + limit);
    return paginatedData;
  } catch (error) {
    console.error('Error in getPaginatedData:', error);
    throw error;
  }
}


export async function likeOperator(data, like, fieldName) {
  try {
    const escapedTerm = like.replace(/%/g, '.*').replace(/_/g, '.').replace(/\\/g, '\\\\');
    const regex = new RegExp(`^${escapedTerm}$`, 'i');//i=flag(refers case insensitive)
    const result = data.filter(item => {
      const value = String(item[fieldName]); 
      return regex.test(value); 
    });
    return result;
  } catch (error) {
    console.error('Error in searchByName:', error);
    throw error;
  }
}
