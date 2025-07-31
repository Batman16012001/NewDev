const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL)
  .then(() => process.stdout.write('MongoDB connected'+ "\n"))
  .catch((err) => process.stdout.write('MongoDB connection error:'+ err+ "\n"));


const getDataFromDB = async (query, collectionName) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);
    const userData = await collection.findOne(query);
    return userData;
  } catch (error) {
    console.error('Error getting data from DB:', error);
    throw error;
  }
};

const getCountFromDB = async (query, collectionName) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);
    const count = await collection.countDocuments(query);
    return count;
  } catch (error) {
    console.error('Error getting count from DB:', error);
    throw error;
  }
};

const getDataFromDBAll = async (query, collectionName, projection) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);
    let userData;
    if (projection !== undefined) {
      userData = await collection.find(query).project(projection).toArray();
    } else {
      userData = await collection.find(query).toArray();
    }
    return userData;
  } catch (error) {
    console.error('Error getting data from DB:', error);
    throw error;
  }
};

const aggregateDataFromDB = async (pipeline, collectionName) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);
    const aggregatedData = await collection.aggregate(pipeline).toArray();
    return aggregatedData;
  } catch (error) {
    console.error('Error aggregating data from DB:', error);
    throw error;
  }
};

const insertDataIntoDB = async (data, collectionName) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);
    const result = await collection.insertOne(data);
    return result;
  } catch (error) {
    console.error('Error inserting data into DB:', error);
    throw error;
  }
};

const updateDataIntoDB = async (query, updateOperation, collectionName) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);
    const result = await collection.updateOne(query, updateOperation);
    return result;
  } catch (error) {
    console.error('Error updating data in DB:', error);
    throw error;
  }
};

const getRecords = async (collectionName, findQuery, projection) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);
    const userData = await collection.find(findQuery).project(projection).toArray();
    return userData;
  } catch (error) {
    console.error('Error getting records from DB:', error);
    throw error;
  }
};

const insertRecords = async (collectionName, insertQuery) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);
    const result = await collection.insertMany(insertQuery);
    return result;
  } catch (error) {
    console.error('Error inserting records into DB:', error);
    throw error;
  }
};

const updateRecords = async (collectionName, updateQueries) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);
    const updatePromises = updateQueries.map(({ filter, update }) => collection.updateOne(filter, update));
    const results = await Promise.all(updatePromises);
    return results;
  } catch (error) {
    console.error('Error updating records in DB:', error);
    throw error;
  }
};

const getSingleRecord = async (collectionName, query = {}, projection = {}) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);
    const userData = await collection.findOne(query, { projection });
    return userData;
  } catch (error) {
    console.error('Error getting single record from DB:', error);
    throw error;
  }
};

const insertSingleRecord = async (collectionName, data) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);
    const result = await collection.insertOne(data);
    return result;
  } catch (error) {
    console.error('Error inserting single record into DB:', error);
    throw error;
  }
};

const findOneAndReplace = async (collectionName, filter, replacement) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);
    const result = await collection.findOneAndReplace(filter, replacement, {
      returnDocument: 'after',
    });
    return result;
  } catch (error) {
    console.error('Error finding and replacing record in DB:', error);
    throw error;
  }
};

module.exports = {
  getDataFromDB,
  getCountFromDB,
  getDataFromDBAll,
  aggregateDataFromDB,
  insertDataIntoDB,
  updateDataIntoDB,
  getRecords,
  insertRecords,
  updateRecords,
  getSingleRecord,
  insertSingleRecord,
  findOneAndReplace
};
