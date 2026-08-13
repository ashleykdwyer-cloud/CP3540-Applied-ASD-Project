const mongoose = require('mongoose');

const UserSchema = mongoose.Schema ({
                    name: {
                        type: String,
                        required:true
                    },

                    userId: {
                        type: Number,
                        required: true
                    },
                    userName: {
                        type: String,
                        required: true
                    },
                    skillSet: {
                        type: String,
                        required: true
                    },
                    passwordHash: {
                        type: String,
                        required: true
                    },
                    status: {
                        type: String,
                        required: true
                    },
                    role: {
                        type: String,
                        enum: ['worker', 'supervisor', 'administrator'],
                        required: true
                    }
                },
                { 
                    timestamps: true
                });

const User = mongoose.model("users", UserSchema);
module.exports = User;