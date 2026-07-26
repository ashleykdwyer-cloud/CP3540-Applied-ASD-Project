const mongoose = require('mongoose');

const NotificationSchema = mongoose.Schema ({
                    recipientId: {
                        type: String,
                        required: true
                    },
                    content: {
                        type: String,
                        required: true
                    },
                    status: {
                        type: String,
                        required: true
                    }
                },
                { 
                    timestamps: true
                });

const Notification = mongoose.model("notifications", NotificationSchema);
module.exports = Notification;