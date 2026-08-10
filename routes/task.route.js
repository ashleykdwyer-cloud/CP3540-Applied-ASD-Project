const express = require("express");
const taskRouter = express.Router();

const {createTask, getTaskById, updateTaskById, deleteTaskById, getAllTasks} =
    require ("../controllers/task.controller.js");

taskRouter.get('/id=:id', getTaskById);
taskRouter.post('/', createTask);
taskRouter.put('/id=:id', updateTaskById);
taskRouter.delete('/id=:id', deleteTaskById);
taskRouter.get('/', getAllTasks);  

module.exports = taskRouter;