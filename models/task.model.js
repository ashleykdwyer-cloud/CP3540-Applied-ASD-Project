const mongoose = require('mongoose');

const TaskSchema = mongoose.Schema ({
                    taskNumber: {
                        type: Number,
                        required: true
                    },
                    description: {
                        type: String,
                        required: true
                    },
                    workerId: {
                        type: Number,
                        required: true
                    },
                    supervisorId: {
                        type: Number,
                        required: true
                    },
                    isCompleted: {
                        type: Boolean,
                        required: true
                    },
                },
                { 
                    timestamps: true
                });

const Task = mongoose.model("tasks", TaskSchema);
module.exports = Task;