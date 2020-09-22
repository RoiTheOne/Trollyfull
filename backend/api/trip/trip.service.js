
const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId


async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    const collection = await dbService.getCollection('trip')
    try {
        const trips = await collection.find(criteria).toArray();
        return trips
    } catch (err) {
        throw err;
    }
}

async function getById(id){
    const collection = await dbService.getCollection('trip')
    try {
        const trips = await collection.findOne({"_id":ObjectId(id)});
        return trips
    } catch (err) {
        throw err;
    }

}

async function update(trip) {
    const collection = await dbService.getCollection('trip')
    trip._id = ObjectId(trip._id);

    try {
        await collection.updateOne({ "_id": trip._id }, { $set: trip })
        
        return trip
    } catch (err) {
        throw err;
    }
}


async function add(trip) {

    const collection = await dbService.getCollection('trip')
    try {
        await collection.insertOne(trip);
        return trip;
    } catch (err) {
        throw err;
    }
}

function remove(trip) {
    return trip
}

function _buildCriteria(filterBy) {
    if(!filterBy) return
    const criteria = { };
    return criteria;
}

module.exports = {
    query,
    update,
    remove,
    add,
    getById
}

