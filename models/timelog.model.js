const mongoose = require('mongoose');

const TimeLogSchema = mongoose.Schema ({
                    taskNumber: {
                        type: Number,
                        required: true
                    },
                    workerId: {
                        type: String,
                        required: true
                    },
                    startTime: {
                        type: Date,
                        required: true
                    },
                    endTime: {
                        type: Date,
                        required: true
                    },
                    notes: {
                        type: String,
                        required: true
                    }
                },
                { 
                    timestamps: true
                });

const TimeLog = mongoose.model("timelogs", TimeLogSchema);
module.exports = TimeLog;