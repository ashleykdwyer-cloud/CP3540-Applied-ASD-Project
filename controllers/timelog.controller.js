const TimeLog = require ("../models/timelog.model.js");

// create a timelog
const createTimeLog = async(req, res) => {
   try {
       const newTimeLog = await TimeLog.create(req.body);
       res.status(200).json(newTimeLog);
   } catch (error) {
       res.status(500).json({message: error.message });
   }
};

// retrieve a timelog by id
const getTimeLogById = async(req, res) => {
    try {
        const timelog = await TimeLog.findById(req.params.id);
        res.status(200).json(timelog);
    }
    catch (err) {
        res.status(500).json({message: err.message });
    }
};

// retrive all timelogs for a worker
const getTimeLogsForWorker = async(req, res) => {
    try {
        const timelogs = await TimeLog.find({workerId: req.params.workerId});
        res.status(200).json(timelogs);
    }
    catch (err) {
        res.status(500).json({message: err.message});
    }
};

// update a timelog by id
const updateTimeLogById = async(req, res) => {
    try {
        const timelog = await TimeLog.findByIdAndUpdate(req.params.id, req.body, {new: true});
        res.status(200).json(timelog);
    }
    catch (err) {
        res.status(500).json({message: err.message});
    }
};

module.exports = {
    createTimeLog,
    getTimeLogById,
    getTimeLogsForWorker,
    updateTimeLogById
};