const express = require("express");
const userRouter = express.Router();

const {createUser, getAllUsers, getUserById, getUserByName, getUsersByRole, updateUserById, deleteUserById, login} =
    require ("../controllers/user.controller.js");

userRouter.get('/', getAllUsers);    
userRouter.get('/id=:id', getUserById);
userRouter.get('/userName=:userName', getUserByName);
userRouter.get('/role=:role', getUsersByRole);
userRouter.post('/', createUser);
userRouter.put('/id=:id', updateUserById);
userRouter.delete('/id=:id', deleteUserById);
userRouter.post("/login", login);

module.exports = userRouter;