const Notification = require("../models/notification.model.js");

// create a notification
const createNotification = async(req, res) => {
   try {
       const newNotification = await Notification.create(req.body);
       res.status(200).json(newNotification);
   } catch (error) {
       res.status(500).json({message: error.message });
   }
};

// retrieve a notification by id
const getNotificationById = async(req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        res.status(200).json(notification);
    }
    catch (err) {
        res.status(500).json({message: err.message });
    }
};

// retrive all notifications for a recipient
const getNotificationsForRecipient = async(req, res) => {
    try {
        const notifications = await Notification.find({recipientId: req.params.recipientId});
        res.status(200).json(notifications);
    }
    catch (err) {
        res.status(500).json({message: err.message});
    }
};

// delete a notification by id
const deleteNotificationById = async(req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        res.status(200).json(notification);
    }
    catch (err) {
        res.status(500).json({ message: err.message});
    }
};

// delete all notifications for an recipient
const deleteNotificationsForRecipient = async(req, res) => {
    try {
        const notifications = await Notification.deleteMany({recipientId: req.params.recipientId});
        res.status(200).json(notifications);
    }
    catch (err) {
        res.status(500).json({ message: err.message});
    }
};

module.exports = {
    createNotification,
    getNotificationById,
    getNotificationsForRecipient,
    deleteNotificationById,
    deleteNotificationsForRecipient
};