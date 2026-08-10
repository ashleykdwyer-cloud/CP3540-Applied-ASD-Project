const express = require('express');
const notificationRoute = require("./routes/notification.route.js");
const taskRoute = require("./routes/task.route.js");
const timelogRoute = require("./routes/timelog.route.js");
const userRoute = require("./routes/user.route.js");
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use("/api/notifications", notificationRoute);
app.use("/api/tasks", taskRoute);
app.use("/api/timelogs", timelogRoute);
app.use("/api/users", userRoute);

mongoose.connect('mongodb+srv://bradleyhowell48_db_user:Password1@home.2funf.mongodb.net/?appName=home', {dbName: 'home'})
    .then(() => {
        console.log("Connected to the database!");
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`);
        });
    })
    .catch(() => {
        console.log("Failed to connect to the database.");
    }
);