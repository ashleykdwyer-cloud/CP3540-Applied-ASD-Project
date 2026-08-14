const express = require('express');

const router = express.Router();

const {
    createComment,
    getTaskComments
} = require('../controllers/taskcomment.controller');


// Create a comment
router.post('/', createComment);


// Get comments for a task
router.get('/task/:taskId', getTaskComments);


module.exports = router;