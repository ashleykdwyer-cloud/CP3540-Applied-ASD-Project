const CheckIn = require('../models/checkin.model');

// CREATE CHECK-IN REQUEST
const createCheckIn = async (req, res) => {
    try {
        const { workerId, supervisorId } = req.body;

        if (!workerId || !supervisorId) {
            return res.status(400).json({
                message: 'Worker ID and Supervisor ID are required.'
            });
        }

        const checkIn = await CheckIn.create({
            workerId: workerId,
            supervisorId: supervisorId,
            status: 'pending'
        });

        res.status(201).json(checkIn);

    } catch (err) {
        console.error('Error creating check-in request:', err);

        res.status(500).json({
            message: 'Failed to create check-in request.'
        });
    }
};


// GET PENDING CHECK-INS FOR A WORKER
const getWorkerCheckIns = async (req, res) => {
    try {
        const workerId = req.params.workerId;

        const checkIns = await CheckIn.find({
            workerId: workerId
        }).sort({ requestedAt: -1 });

        // Check for expired requests
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;

        for (const checkIn of checkIns) {

            if (
                checkIn.status === 'pending' &&
                now - checkIn.requestedAt.getTime() > thirtyMinutes
            ) {
                checkIn.status = 'expired';
                await checkIn.save();
            }
        }

        res.status(200).json(checkIns);

    } catch (err) {
        console.error('Error retrieving worker check-ins:', err);

        res.status(500).json({
            message: 'Failed to retrieve check-in requests.'
        });
    }
};


// COMPLETE CHECK-IN
const completeCheckIn = async (req, res) => {
    try {
        const checkInId = req.params.id;

        const checkIn = await CheckIn.findById(checkInId);

        if (!checkIn) {
            return res.status(404).json({
                message: 'Check-in request not found.'
            });
        }

        if (checkIn.status !== 'pending') {
            return res.status(400).json({
                message: `This check-in request is already ${checkIn.status.toLowerCase()}.`
            });
        }

        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;

        // Check whether the request has expired
        if (
            now - checkIn.requestedAt.getTime() > thirtyMinutes
        ) {
            checkIn.status = 'expired';
            await checkIn.save();

            return res.status(400).json({
                message: 'This check-in request has expired.'
            });
        }

        checkIn.status = 'completed';
        checkIn.completedAt = new Date();

        await checkIn.save();

        res.status(200).json(checkIn);

    } catch (err) {
        console.error('Error completing check-in:', err);

        res.status(500).json({
            message: 'Failed to complete check-in.'
        });
    }
};


module.exports = {
    createCheckIn,
    getWorkerCheckIns,
    completeCheckIn
};
