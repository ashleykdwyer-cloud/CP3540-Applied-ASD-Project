const Task = require ("../models/task.model.js");

// create a task
const createTask = async(req, res) => {
   try {
       const newTask = await Task.create(req.body);
       res.status(200).json(newTask);
   } catch (error) {
       res.status(500).json({message: error.message });
   }
};

// retrieve a task by id
const getTaskById = async(req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        res.status(200).json(task);
    }
    catch (err) {
        res.status(500).json({message: err.message });
    }
};

// update a task by id
const updateTaskById = async(req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(task);
    }
    catch (err) {
        res.status(500).json({message: err.message});
    }
};

//get tasks assigned to a specific worker
const getTasksByWorkerId = async (req, res) => {
    try {
        const workerId = req.params.workerId;
        const tasks = await Task.find({
            workerId: workerId
        });

        res.status(200).json(tasks);

    } catch (error) {
        console.error("Error retrieving worker tasks:", error);

        res.status(500).json({
            message: "Failed to retrieve worker tasks."
        });
    }
};

// delete a task by id
const deleteTaskById = async(req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        res.status(200).json(task);
    }
    catch (err) {
        res.status(500).json({message: err.message});
    }
};

// retrieve all tasks
const getAllTasks = async(req, res) => {
    try {
        const tasks = await Task.find({});
        res.status(200).json(tasks);
    }
    catch (err) {
        res.status(500).json({message: err.message });
    }
};

module.exports = {
    createTask,
    getTaskById,
    updateTaskById,
    deleteTaskById,
    getAllTasks,
    getTasksByWorkerId
};