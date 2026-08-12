const express = require("express");
const timelogRouter = express.Router();

const {createTimeLog, getTimeLogById, getTimeLogsForWorker, updateTimeLogById, getAllTimeLogs} =
    require ("../controllers/timelog.controller.js");

timelogRouter.get('/id=:id', getTimeLogById);
timelogRouter.get('/workerId=:workerId', getTimeLogsForWorker);
timelogRouter.post('/', createTimeLog);
timelogRouter.put('/id=:id', updateTimeLogById);
timelogRouter.get('/', getAllTimeLogs); 

module.exports = timelogRouter;