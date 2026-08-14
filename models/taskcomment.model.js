const mongoose = require('mongoose');

const TaskCommentSchema = mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'tasks'
    },

    userId: {
        type: Number,
        required: true
    },

    userName: {
        type: String,
        required: true
    },

    comment: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

const TaskComment = mongoose.model(
    "taskcomments",
    TaskCommentSchema
);

module.exports = TaskComment;