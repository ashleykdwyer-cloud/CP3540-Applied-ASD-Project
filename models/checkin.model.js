const mongoose = require('mongoose');

const CheckInSchema = mongoose.Schema({
    workerId: {
        type: Number,
        required: true
    },

    supervisorId: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ['pending', 'completed', 'expired'],
        required: true,
        default: 'pending'
    },

    requestedAt: {
        type: Date,
        default: Date.now
    },

    completedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

const CheckIn = mongoose.model("checkins", CheckInSchema);

module.exports = CheckIn;