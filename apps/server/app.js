"use strict";
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const logger = require("morgan");
const mongoose = require("mongoose");
const config = require("./config");
const debug = require("debug")("smartclassroomnode:server");
const server = express();
const http = require("http").createServer(server);
const WebSocket = require("ws");
// view engine setup
server.set("views", path.join(__dirname, "views"));
server.set("view engine", "jade");
server.use(logger("dev"));
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use(express.static(path.join(__dirname, "public")));
// catch 404 and forward to error handler
/*server.use(function (req, res, next) {
    next(createError(404));
});*/
// error handler
/*server.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});*/
// var subscribersTeachers = {};
// var subscribers = [];
var attendancesSubscribers = [];
var enviromentSubscribers = [];
var notificationsSubscribers = [];

http.listen(config.PORT, () => {
  console.log("Running on port: " + config.PORT);
  console.log("connecting to database on " + config.DB_URI + "...");
  mongoose.connect(config.DB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  });
  mongoose.connection.once("open", () => {
    console.log("succefully connected");
    const enviromentWSS = new WebSocket.Server({
      port: 9009
    });
    const attendancesWSS = new WebSocket.Server({
      port: 9008
    });
    const notificationsWSS = new WebSocket.Server({
      port: 9007
    });

    enviromentWSS.on("connection", (ws, req) => {
      const { isteacher, seance } = req.headers;
      enviromentSubscribers.push(ws);

      console.log("client connected enviroment watcher " + req.headers["seance"]);
      ws.on("message", msg => {
        console.log(msg);
      });
      ws.on("close", (code, reason) => {
        enviromentSubscribers = enviromentSubscribers.filter(e => e != ws);
        console.log(Object.keys(enviromentSubscribers));

        // for (var key in enviromentSubscribers) {
        //   if (key == seance) {
        //     delete enviromentSubscribers[key];
        //   }
        // }
      });
    });

    attendancesWSS.on("connection", (ws, req) => {
      console.log("client connected to attendances watcher: " + req.connection.remoteAddress);
      attendancesSubscribers.push(ws);
      ws.on("message", msg => {
        console.log(msg);
      });
      ws.on("close", (code, reason) => {
        attendancesSubscribers = attendancesSubscribers.filter(e => e != ws);
        console.log(Object.keys(attendancesSubscribers));
      });
    });
    notificationsWSS.on("connection", (ws, req) => {
      notificationsSubscribers.push(ws);
      ws.on("message", msg => {
        console.log(msg);
      });
      ws.on("close", (code, reason) => {
        notificationsSubscribers = notificationsSubscribers.filter(
          e => e != ws
        );
        console.log(Object.keys(notificationsSubscribers));
      });
    });

    const Light = require("./models/light");
    const Temperature = require("./models/temperature");
    const Seance = require("./models/seance");
    const Attendance = require("./models/attendance");

    Light.watch().on("change", data => {
      console.log(data.fullDocument.value);
      for (var key in enviromentSubscribers) {
        var obj = {
          type: "light",
          value: data.fullDocument.value
        };
        enviromentSubscribers[key].send(JSON.stringify(obj));
      }
    });

    Temperature.watch().on("change", data => {
      console.log(data.fullDocument.value);
      for (var key in enviromentSubscribers) {
        var obj = {
          type: "temp",
          value: data.fullDocument.value
        };
        enviromentSubscribers[key].send(JSON.stringify(obj));
      }
    });

    Attendance.watch().on("change", async data => {
      const { ObjectId } = require("mongodb");
      const moment = require("moment");
      if (data.operationType == "update") {
        var obj = {
          type: "studentAttended",
          value: ""
        };
        console.log(data);
        const d = await Attendance.findOne({ _id: data.documentKey });
        for (var key in attendancesSubscribers) {
          attendancesSubscribers[key].send(JSON.stringify(d.list));
        }
      }
    });
  });
  mongoose.connection.on("error", err => {
    console.log(err);
  });



  require("./routes/index")(server);
  require("./routes/users")(server);
  require("./routes/groups")(server);
  require("./routes/unites")(server);
  require("./routes/seances")(server);
  require("./routes/courses")(server);
  require("./routes/modules")(server);
  require("./routes/accounts")(server);
  require("./routes/teachers")(server);
  require("./routes/students")(server);
  require("./routes/semesters")(server);
  require("./routes/homeworks")(server);
  require("./routes/classrooms")(server);
  require("./routes/controllers")(server);
  require("./routes/specialities")(server);
  require("./routes/notifications")(server);
});
