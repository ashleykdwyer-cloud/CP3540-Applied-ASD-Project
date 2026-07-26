const express = require("express");
const userRouter = express.Router();

const {createUser, getUserById, getUserByName, getUsersByRole, updateUserById, deleteUserById} =
    require ("../controllers/user.controller.js");

userRouter.get('/id=:id', getUserById);
userRouter.get('/userName=:userName', getUserByName);
userRouter.get('/role=:role', getUsersByRole);
userRouter.post('/', createUser);
userRouter.put('/id=:id', updateUserById);
userRouter.delete('/id=:id', deleteUserById);

module.exports = userRouter;