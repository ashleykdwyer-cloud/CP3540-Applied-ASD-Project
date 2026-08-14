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
                        type: String,
                        required: true
                    },
                    supervisorName: {
                        type:String,
                        required: true
                    },
                    supervisorId: {
                        type: Number,
                        required: true
                    },  
                    status: {
                        type:String,
                        enum: ["Pending", "In Progress", "Completed"],
                        default: "Pending"
                    },
                    isCompleted: {
                        type: Boolean,
                        required: true
                    }
                },
                { 
                    timestamps: true
                });

const Task = mongoose.model("tasks", TaskSchema);
module.exports = Task;