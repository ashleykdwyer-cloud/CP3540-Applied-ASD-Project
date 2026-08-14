const TaskComment = require('../models/taskcomment.model');
const Task = require('../models/task.model');
const Notification = require('../models/notification.model');

// CREATE A COMMENT
const createComment = async (req, res) => {
    try {
        const {
            taskId,
            userId,
            userName,
            comment
        } = req.body;

        if (!taskId || !userId || !userName || !comment) {
            return res.status(400).json({
                message:
                    'Task ID, user ID, user name, and comment are required.'
            });
        }

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: 'Task not found.'
            });
        }

        const newComment = await TaskComment.create({
            taskId: taskId,
            userId: userId,
            userName: userName,
            comment: comment
        });

        const recipientId =
            Number(userId) === Number(task.workerId)
                ? task.supervisorId
                : task.workerId;

        const notificationContent =
            `${userName} commented on Task #${task.taskNumber}: "${comment}"`;

        await Notification.create({
            recipientId: String(recipientId),
            content: notificationContent,
            status: 'unread'
        });

        res.status(201).json(newComment);

    } catch (err) {
        console.error('Error creating task comment:', err);

        res.status(500).json({
            message: 'Failed to create task comment.'
        });
    }
};


// GET COMMENTS FOR A TASK
const getTaskComments = async (req, res) => {
    try {
        const taskId = req.params.taskId;

        const comments = await TaskComment.find({
            taskId: taskId
        }).sort({
            createdAt: 1
        });

        res.status(200).json(comments);

    } catch (err) {
        console.error('Error retrieving task comments:', err);

        res.status(500).json({
            message: 'Failed to retrieve task comments.'
        });
    }
};


module.exports = {
    createComment,
    getTaskComments
};