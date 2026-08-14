const express = require('express');

const router = express.Router();

const {
    createCheckIn,
    getWorkerCheckIns,
    completeCheckIn
} = require('../controllers/checkin.controller');


// Create a check-in request
router.post('/', createCheckIn);


// Get check-in requests for a worker
router.get('/worker/:workerId', getWorkerCheckIns);


// Complete a check-in request
router.put('/:id', completeCheckIn);


module.exports = router;