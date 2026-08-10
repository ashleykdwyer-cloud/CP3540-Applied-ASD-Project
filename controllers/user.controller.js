const User = require ("../models/user.model.js");

// create a user
const createUser = async(req, res) => {
   try {
       const newUser = await User.create(req.body);
       res.status(200).json(newUser);
   } catch (error) {
       res.status(500).json({message: error.message });
   }
};

// retrieve a user by id
const getUserById = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.status(200).json(user);
    }
    catch (err) {
        res.status(500).json({message: err.message });
    }
};

// retrieve a user by name
const getUserByName = async(req, res) => {
    try {
        const user = await User.findOne({userName: req.params.userName});
        res.status(200).json(user);
    }
    catch (err) {
        res.status(500).json({message: err.message});
    }
};

// retrive all users of a role
const getUsersByRole = async(req, res) => {
    try {
        const users = await User.find({role: req.params.role});
        res.status(200).json(users);
    }
    catch (err) {
        res.status(500).json({message: err.message});
    }
};

// update a user by id
const updateUserById = async(req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true});
        res.status(200).json(user);
    }
    catch (err) {
        res.status(500).json({message: err.message});
    }
};

// delete a user by id
const deleteUserById = async(req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        res.status(200).json(user);
    }
    catch (err) {
        res.status(500).json({ message: err.message});
    }
};

// retrieve all users
const getAllUsers = async(req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    }
    catch (err) {
        res.status(500).json({message: err.message });
    }
};

module.exports = {
    createUser,
    getUserById,
    getUserByName,
    getUsersByRole,
    updateUserById,
    deleteUserById,
    getAllUsers
};