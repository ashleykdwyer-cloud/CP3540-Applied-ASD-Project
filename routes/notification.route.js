const express = require("express");
const notificationRouter = express.Router();

const {createNotification, getNotificationById, getNotificationsForRecipient, deleteNotificationById, deleteNotificationsForRecipient} =
    require("../controllers/notification.controller.js");

notificationRouter.get('/id=:id', getNotificationById);
notificationRouter.get('/recipientId=:recipientId', getNotificationsForRecipient);
notificationRouter.post('/', createNotification);
notificationRouter.delete('/id=:id', deleteNotificationById);
notificationRouter.delete('/recipientId=:recipientId', deleteNotificationsForRecipient);

module.exports = notificationRouterRouter;