const db = require('../database/locationDatabase');
const csv = require('csvtojson');

exports.replace = async (req, res) => {
    const path = '../data/europe-destinations.csv';
    const data = await csv().fromFile(path);
    const ids = await db.replaceAllData(data);
    res.json(ids);
};

exports.getDestinations = async (req, res) => {
    const destinations = await db.getDestinations();
    res.json(destinations);
}

exports.search = async (req, res) => {
    const { query } = req.query;  // Get the search query from the request query parameters
    const destinations = await db.searchDestinations(query);
    res.json(destinations);  // Send the search results as a JSON response
};

exports.getDestinationById = async (req, res) => {
    const {id} = req.params;  // Get the destination ID from the request parameters
    const destination = await db.getDestinationById(id);
    res.json(destination);  // Send the destination details as a JSON response
}