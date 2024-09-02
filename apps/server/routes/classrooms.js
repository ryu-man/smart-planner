const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const moment = require("moment");
const Classroom = require("../models/classroom");
const Seance = require("../models/seance");

const Temperature = require("../models/temperature");
const Device = require("../models/device");
const Light = require("../models/light");
const { ObjectId } = require("mongodb");

router.get("/", (req, res, next) => {
  Classroom.find({}, (err, data) => {
    err = !null ? res.send(data) : res.send([]);
  });
});
router.get("/empty", (req, res, next) => {
  Classroom.aggregate(
    [
      {
        $lookup: {
          from: "seances",
          localField: "_id",
          foreignField: "_id.classroom",
          as: "seance"
        }
      },
      {
        $unwind: "$seance"
      },
      {
        $lookup: {
          from: "days",
          localField: "seance._id.day",
          foreignField: "_id",
          as: "day"
        }
      },
      {
        $unwind: "$day"
      },
      {
        $lookup: {
          from: "dayunites",
          localField: "seance._id.dayUnite",
          foreignField: "_id",
          as: "dayUnite"
        }
      },
      {
        $unwind: "$dayUnite"
      },
      {
        $project: {
          _id: 1,
          // "seance":0,
          "dayUnite.begin": 1,
          "dayUnite.end": 1,
          "day.value": 1
        }
      }
    ],
    (err, data) => {
      res.send(data);
    }
  );
});
router.post("/", function(req, res, next) {
  const { _id, location, tables, type, network } = req.body;
  const model = new Classroom({ _id, location, tables, type, network });
  model.save((err, data) => {
    console.log(err);
    res.send(err == null ? "Classroom succesfully added" : "failed");
  });
});
router.get("/:id/devices", (req, res, next) => {
  Classroom.find({ _id: req.params.id })
    .populate("devices")
    .exec()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.send(err);
    });
});
router.post("/:id/devices", (req, res, next) => {
  const Device = require("../models/device");
  const { name, description, ip } = req.body;
  const classroomId = req.params.id;
  const model = new Device({ name, description, ip, classroom: classroomId });
  model.save((err, data) => {
    console.log(data);
    res.send(
      err == null ? "device linked succesfully to classroom" : "failded"
    );
  });
});
router.get("/:classroomId/temperatures", (req, res, next) => {
  const { classroomId } = req.params;
  res.send("[]");
});
router.post("/:classroom/temperatures", (req, res, next) => {
  const { value } = req.body;
  const { classroom } = req.params;

  const model = new Temperature({ date: moment().format(), value, classroom });
  model.save((err, data) => {
    res.send(err == null ? data : err);
  });
});
router.get("/:classroomId/lights", (req, res, next) => {
  const { classroomId } = req.params;
  res.send("[]");
});
router.post("/:classroomId/lights", (req, res, next) => {
  const { classroomId } = req.params;
  const { value } = req.body;
  date = Date.now();
  const light = new Light({ value, classroom: classroomId });
  light.save((err, data) => {
    res.send("light value added succesfully");
  });
});
router.get("/nonUsedSchedules", (req, res) => {
  const { level, value } = req.query;
  Classroom.aggregate(
    [
      {
        $lookup: {
          from: "seances",
          localField: "_id",
          foreignField: "classroom",
          as: "seance"
        }
      },
      {
        $unwind: {
          path: "$seance",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "dayunites",
          localField: "seance.dayUnite",
          foreignField: "_id",
          as: "seance.dayUnite"
        }
      },
      {
        $unwind: {
          path: "$seance.dayUnite",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          used: {
            day: "$seance.day",
            dayUnite: "$seance.dayUnite"
          }
        }
      },
      {
        $group: {
          _id: "$_id",
          used: {
            $push: "$$ROOT.used"
          }
        }
      },
      {
        $addFields: {
          day: [0, 1, 2, 3, 4, 5],
          dayUnite: [
            new ObjectId("5ccdf36a54a259660c535b00"),
            new ObjectId("5cd16e090246d51dd88fc95f"),
            new ObjectId("5ce5333ff69636277cc659ab"),
            new ObjectId("5cf2ef09dc1b0f1b34ad882d"),
            new ObjectId("5cf2ef2cdc1b0f1b34ad882e")
          ]
        }
      },
      {
        $unwind: {
          path: "$day"
        }
      },
      {
        $lookup: {
          from: "dayunites",
          localField: "dayUnite",
          foreignField: "_id",
          as: "dayUnite"
        }
      },
      {
        $unwind: {
          path: "$dayUnite"
        }
      },
      {
        $group: {
          _id: {
            classroom: "$_id",
            day: "$day"
          },
          used: {
            $first: "$used"
          },
          all: {
            $push: {
              day: "$$ROOT.day",
              dayUnite: "$$ROOT.dayUnite"
            }
          }
        }
      },
      {
        $project: {
          "all.day": 1,
          "all.dayUnite._id": 1,
          "all.dayUnite.begin": 1,
          "all.dayUnite.end": 1,
          "used.day": 1,
          "used.dayUnite._id": 1,
          "used.dayUnite.begin": 1,
          "used.dayUnite.end": 1
        }
      },
      {
        $project: {
          _id: "$_id.classroom",
          day: "$_id.day",
          nonUsed: {
            $map: {
              input: {
                $setDifference: ["$all", "$used"]
              },
              in: "$$this.dayUnite"
            }
          }
        }
      },
      {
        $sort: {
          day: 1
        }
      },
      {
        $group: {
          _id: "$_id",
          nonUsed: {
            $push: {
              day: "$$ROOT.day",
              dayUnites: "$$ROOT.nonUsed"
            }
          }
        }
      },
      {
        $unwind: {
          path: "$nonUsed"
        }
      },
      {
        $unwind: {
          path: "$nonUsed.dayUnites"
        }
      },
      {
        $group: {
          _id: {
            dayUnite: "$nonUsed.dayUnites",
            day: "$nonUsed.day"
          },
          classrooms: {
            $push: "$_id"
          }
        }
      },
      {
        $group: {
          _id: "$_id.dayUnite",
          nonUsed: {
            $push: {
              day: "$_id.day",
              classrooms: "$classrooms"
            }
          }
        }
      },
      {
        $sort: {
          "_id.begin.hour": 1
        }
      }
    ],
    (err, data) => {
      if (err == null) {
        res.send(data);
      } else {
        res.statusCode = 500;
        res.send();
      }
    }
  );
});
module.exports = server => {
  server.use("/classrooms", router);
};
