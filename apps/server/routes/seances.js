const { ObjectId } = require("mongodb");
const express = require("express");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const router = express.Router();

const PermutationDemande = require("../models/permutationDemande");
const ConsernsGroup = require("../models/consernsGroup");
const Permutation = require("../models/permutation");
const Attendance = require("../models/attendance");
const Component = require("../models/component");
const Semester = require("../models/semester");
const DayUnite = require("../models/dayUnite");
const Student = require("../models/student");
const Account = require("../models/account");
const Seance = require("../models/seance");
const Day = require("../models/day");

router.get("/", (req, res, next) => {
  require("../models/component");
  console.log(moment().day());
  console.log((1 + 6) % 7);

  Seance.aggregate(
    [
      {
        $lookup: {
          from: "components",
          localField: "component",
          foreignField: "_id",
          as: "component"
        }
      },
      {
        $unwind: {
          path: "$component"
        }
      },
      {
        $lookup: {
          from: "modules",
          localField: "component.module",
          foreignField: "_id",
          as: "component.module"
        }
      },
      {
        $unwind: {
          path: "$component.module"
        }
      },
      {
        $lookup: {
          from: "unites",
          localField: "component.module.unite",
          foreignField: "_id",
          as: "component.module.unite"
        }
      },
      {
        $unwind: {
          path: "$component.module.unite"
        }
      },
      // {
      //   '$match': {
      //     'component.module.unite.speciality': new ObjectId('5d03a47f631b910fc05b586a')
      //   }
      // },
      {
        $lookup: {
          from: "specialities",
          localField: "component.module.unite.speciality",
          foreignField: "_id",
          as: "component.module.unite.speciality"
        }
      },
      {
        $unwind: {
          path: "$component.module.unite.speciality"
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
        $lookup: {
          from: "semesters",
          localField: "semester",
          foreignField: "_id",
          as: "semester"
        }
      },
      {
        $unwind: {
          path: "$semester"
        }
      },
      {
        $lookup: {
          from: "classrooms",
          localField: "classroom",
          foreignField: "_id",
          as: "classroom"
        }
      },
      {
        $unwind: {
          path: "$classroom"
        }
      },
      {
        $lookup: {
          from: "teachers",
          localField: "component.teacher",
          foreignField: "_id",
          as: "component.teacher"
        }
      },
      {
        $unwind: {
          path: "$component.teacher"
        }
      },
      {
        $group: {
          _id: "$day",
          seances: {
            $push: "$$ROOT"
          }
        }
      }
    ],
    (err, data) => {
      console.log(err);
      res.send(data);
    }
  );
});
router.get("/specialities/:speciality", (req, res, next) => {
  require("../models/component");
  const { speciality } = req.params;

  Seance.aggregate(
    [
      {
        $addFields: {
          today: moment()
            .startOf("day")
            .toDate()
        }
      },
      {
        $addFields: {
          currentWeek: {
            $week: {
              date: "$today",
              timezone: "CET"
            }
          },
          permutationWeek: {
            $ifNull: [
              {
                $week: {
                  date: "$activeOn",
                  timezone: "CET"
                }
              },
              "$$REMOVE"
            ]
          }
        }
      },
      {
        $addFields: {
          deff: {
            $ifNull: [
              {
                $abs: {
                  $subtract: ["$currentWeek", "$permutationWeek"]
                }
              },
              "$$REMOVE"
            ]
          }
        }
      },
      {
        $project: {
          replace: {
            $cond: [
              {
                $lte: ["$deff", 0]
              },
              "$replace",
              null
            ]
          },
          isActive: {
            $or: [
              {
                $eq: ["$primary", true]
              },
              {
                $and: [
                  {
                    $eq: ["$primary", false]
                  },
                  {
                    $eq: ["$deff", 0]
                  }
                ]
              }
            ]
          },
          classroom: 1,
          day: 1,
          component: 1,
          semester: 1,
          primary: 1,
          dayUnite: 1,
          currentWeek: 1,
          today: 1,
          group: 1
        }
      },
      {
        $group: {
          _id: "$semester",
          list: {
            $push: "$$ROOT"
          },
          replacements: {
            $push: "$$ROOT.replace"
          }
        }
      },
      {
        $unwind: {
          path: "$list"
        }
      },
      {
        $addFields: {
          "list.replacements": "$replacements"
        }
      },
      {
        $replaceRoot: {
          newRoot: "$list"
        }
      },
      {
        $project: {
          isSelected: {
            $or: [
              {
                $eq: ["$primary", false]
              },
              {
                $and: [
                  {
                    $eq: ["$primary", true]
                  },
                  {
                    $not: {
                      $in: ["$_id", "$replacements"]
                    }
                  }
                ]
              }
            ]
          },
          isActive: 1,
          classroom: 1,
          day: 1,
          component: 1,
          semester: 1,
          primary: 1,
          dayUnite: 1,
          currentWeek: 1,
          today: 1,
          group: 1
        }
      },
      {
        $match: {
          isSelected: true
        }
      },
      {
        $lookup: {
          from: "components",
          localField: "component",
          foreignField: "_id",
          as: "component"
        }
      },
      {
        $lookup: {
          from: "classrooms",
          localField: "classroom",
          foreignField: "_id",
          as: "classroom"
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
        $lookup: {
          from: "semesters",
          localField: "semester",
          foreignField: "_id",
          as: "semester"
        }
      },
      {
        $unwind: {
          path: "$semester"
        }
      },
      {
        $unwind: {
          path: "$dayUnite"
        }
      },
      {
        $lookup: {
          from: "consernsgroups",
          localField: "_id",
          foreignField: "seance",
          as: "groups"
        }
      },
      {
        $lookup: {
          from: "groups",
          localField: "groups.group",
          foreignField: "_id",
          as: "groups"
        }
      },
      {
        $unwind: {
          path: "$groups"
        }
      },
      {
        $lookup: {
          from: "specialities",
          localField: "groups.speciality",
          foreignField: "_id",
          as: "groups.speciality"
        }
      },
      {
        $unwind: {
          path: "$groups.speciality"
        }
      },
      {
        $unwind: {
          path: "$classroom"
        }
      },
      {
        $unwind: {
          path: "$component"
        }
      },
      {
        $group: {
          _id: "$_id",
          classroom: {
            $first: "$classroom"
          },
          semester: {
            $first: "$semester"
          },
          component: {
            $first: "$component"
          },
          day: {
            $first: "$day"
          },
          dayUnite: {
            $first: "$dayUnite"
          },
          today: {
            $first: "$today"
          },
          primary: {
            $first: "$primary"
          },
          currentWeek: {
            $first: "$currentWeek"
          },
          isSelected: {
            $first: "$isSelected"
          },
          isActive: {
            $first: "$isActive"
          },
          groups: {
            $push: "$groups"
          }
        }
      },
      {
        $lookup: {
          from: "teachers",
          localField: "component.teacher",
          foreignField: "_id",
          as: "component.teacher"
        }
      },
      {
        $unwind: {
          path: "$component.teacher"
        }
      },
      {
        $lookup: {
          from: "modules",
          localField: "component.module",
          foreignField: "_id",
          as: "component.module"
        }
      },
      {
        $unwind: {
          path: "$component.module"
        }
      },
      {
        $lookup: {
          from: "unites",
          localField: "component.module.unite",
          foreignField: "_id",
          as: "component.module.unite"
        }
      },
      {
        $unwind: {
          path: "$component.module.unite"
        }
      },
      {
        $lookup: {
          from: "specialities",
          localField: "component.module.unite.speciality",
          foreignField: "_id",
          as: "component.module.unite.speciality"
        }
      },
      {
        $unwind: {
          path: "$component.module.unite.speciality"
        }
      },
      {
        $match: {
          "component.module.unite.speciality._id": new ObjectId(speciality)
        }
      },
      {
        $lookup: {
          from: "homeworks",
          localField: "component._id",
          foreignField: "component",
          as: "component.homeworks"
        }
      },
      {
        $lookup: {
          from: "attendances",
          localField: "_id",
          foreignField: "schedule",
          as: "attendances"
        }
      },
      {
        $lookup: {
          from: "plannings",
          localField: "component._id",
          foreignField: "form",
          as: "component.planning"
        }
      },
      {
        $sort: {
          attendances: 1
        }
      },
      {
        $project: {
          classroom: 1,
          semester: 1,
          day: 1,
          dayUnite: 1,
          groups: 1,
          today: 1,
          primary: true,
          currentWeek: 1,
          isActive: 1,
          attendances: 1,
          "component._id": 1,
          "component.type": 1,
          "component.module": 1,
          "component.teacher": 1,
          "component.planning": 1,
          "component.homeworks": {
            $filter: {
              input: "$component.homeworks",
              as: "i",
              cond: {
                $eq: ["$$i.semester", "$semester._id"]
              }
            }
          }
        }
      },
      {
        $group: {
          _id: "$day",
          seances: {
            $push: "$$ROOT"
          }
        }
      }
    ],
    (err, data) => {
      res.send(data);
    }
  );
});
router.post("/", async (req, res, next) => {
  const {
    classroom,
    component,
    day,
    dayUnite,
    group,
    semester,
    primary,
    activeOn,
    replace
  } = req.body;

  const p = {
    classroom,
    component,
    day,
    dayUnite,
    group,
    semester
  };
  const sem = await Semester.findOne({ _id: semester });
  var begin = moment(sem.begin);
  const end = moment(sem.end);

  if (primary != null && activeOn != null) {
    p.primary = primary;
    p.activeOn = moment(activeOn)
      .toDate()
      .toUTCString();
    if (replace != null) {
      p.replace = replace;
    }
  }
  const session = await Seance.startSession();
  session.startTransaction();
  try {
    const seance = Seance(p);
    seance.save(async (err, data) => {
      if (err == null) {
        if (activeOn != null) {
          const attendance = {
            date: moment(activeOn)
              .toDate()
              .toUTCString(),
            schedule: ObjectId(data._id)
          };
          Attendance(attendance).save();

          if (replace != null) {
            Attendance.findOneAndUpdate(
              {
                schedule: ObjectId(data._id),
                date: moment(activeOn).toDate()
              },
              {
                isActive: false
              },
              { new: true },
              (err, doc) => {
                const attendance = {
                  date: moment(activeOn)
                    .toDate()
                    .toUTCString(),
                  schedule: ObjectId(data._id)
                };
                Attendance(attendance).save();
              }
            );
          }
        } else {
          begin = begin.add(Math.abs(((day + 6) % 7) - begin.day()), "days");

          while (begin.isBefore(end)) {
            const attendance = {
              date: begin.toDate().toUTCString(),
              schedule: ObjectId(data._id)
            };
            try {
              await Attendance(attendance).save();
            } catch (error) {}
            begin.add(7, "days");
          }
        }
        begin.add(day - 1, "days");

        res.send("Seance added succesfully");
      } else {
        res.statusCode;
        res.send(err);
      }
    });
    group.forEach(g => {
      let consernsGroup = ConsernsGroup({ seance: seance._id, group: g });
      consernsGroup.save();
    });

    await session.commitTransacrion();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
  }

  // const { day } = req.body;
  // const { schedule } = req.params;
});
router.get("/days", (req, res, next) => {
  Day.find({})
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.send(err);
    });
});
router.post("/days", (req, res, next) => {
  const { _id, value } = req.body;

  const dayModel = new Day({
    _id,
    value
  });
  dayModel.save((err, data) => {
    console.log(err);
    res.send(
      err == null ? "Day added succesfully" : "operation fails : " + err
    );
  });
});
router.post("/dayunites", (req, res, next) => {
  const { begin, end } = req.body;

  const dayUniteModel = new DayUnite({
    begin,
    end
  });
  dayUniteModel.save((err, data) => {
    console.log(data);
    res.send(
      err == null ? "Day unite added succesfuly" : "operation fails : " + err
    );
  });
});
router.put("/:seanceId/createSeance", (req, res, next) => {
  const { teacherId } = req.query;
  const { seanceId } = req.params;
  // const date = moment().startOf("day")
  const date = moment("2019-05-25").startOf("day");
  const attendance = Attendance({
    date: date,
    list: [],
    schedule: seanceId
  });
  attendance.save((err, doc) => {
    if (err == null) {
      res.send(doc);
    } else {
      res.send(err);
    }
  });
});
router.put("/:seanceId/attende", (req, res, next) => {
  const { student } = req.query;
  const { seanceId } = req.params;
  const now = moment("2019-02-03");
  const hour = 10;
  const minute = 35;
  const jour = 1;
  // const now = moment();
  // const hour = now.format("HH");
  // const minute = now.format("mm");
  console.log(
    now
      .startOf("day")
      .toDate()
      .toDateString()
  );
  Seance.aggregate(
    [
      {
        $addFields: {
          today: now.toDate()
        }
      },
      {
        $addFields: {
          currentWeek: {
            $week: {
              date: "$today",
              timezone: "CET"
            }
          },
          permutationWeek: {
            $ifNull: [
              {
                $week: "$activeOn"
              },
              "$$REMOVE"
            ]
          }
        }
      },
      {
        $addFields: {
          deff: {
            $ifNull: [
              {
                $abs: {
                  $subtract: ["$currentWeek", "$permutationWeek"]
                }
              },
              "$$REMOVE"
            ]
          }
        }
      },
      {
        $project: {
          replace: {
            $cond: [
              {
                $eq: ["$deff", 0]
              },
              "$replace",
              null
            ]
          },
          classroom: 1,
          day: 1,
          component: 1,
          semester: 1,
          primary: 1,
          dayUnite: 1,
          currentWeek: 1,
          today: 1
        }
      },
      {
        $group: {
          _id: "$semester",
          list: {
            $push: "$$ROOT"
          },
          replacements: {
            $push: "$$ROOT.replace"
          }
        }
      },
      {
        $unwind: {
          path: "$list"
        }
      },
      {
        $addFields: {
          "list.replacements": "$replacements"
        }
      },
      {
        $replaceRoot: {
          newRoot: "$list"
        }
      },
      {
        $project: {
          isSelected: {
            $and: [
              {
                $cond: [
                  {
                    $and: [
                      {
                        $eq: ["$replace", null]
                      },
                      {
                        $eq: ["$primary", false]
                      }
                    ]
                  },
                  false,
                  true
                ]
              },
              {
                $not: {
                  $in: ["$_id", "$replacements"]
                }
              }
            ]
          },
          classroom: 1,
          day: 1,
          component: 1,
          semester: 1,
          primary: 1,
          dayUnite: 1,
          currentWeek: 1,
          today: 1
        }
      },
      {
        $match: {
          isSelected: true
        }
      },
      {
        $lookup: {
          from: "components",
          localField: "component",
          foreignField: "_id",
          as: "component"
        }
      },
      {
        $lookup: {
          from: "classrooms",
          localField: "classroom",
          foreignField: "_id",
          as: "classroom"
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
        $lookup: {
          from: "semesters",
          localField: "semester",
          foreignField: "_id",
          as: "semester"
        }
      },
      {
        $unwind: {
          path: "$semester"
        }
      },
      {
        $unwind: {
          path: "$dayUnite"
        }
      },
      {
        $unwind: {
          path: "$classroom"
        }
      },
      {
        $unwind: {
          path: "$component"
        }
      },
      {
        $lookup: {
          from: "teachers",
          localField: "component.teacher",
          foreignField: "_id",
          as: "component.teacher"
        }
      },
      {
        $unwind: {
          path: "$component.teacher"
        }
      },
      {
        $lookup: {
          from: "modules",
          localField: "component.module",
          foreignField: "_id",
          as: "component.module"
        }
      },
      {
        $unwind: {
          path: "$component.module"
        }
      },
      {
        $lookup: {
          from: "unites",
          localField: "component.module.unite",
          foreignField: "_id",
          as: "component.module.unite"
        }
      },
      {
        $unwind: {
          path: "$component.module.unite"
        }
      },
      {
        $addFields: {
          duration: {
            $subtract: [
              {
                $multiply: [
                  {
                    $subtract: ["$dayUnite.end.hour", "$dayUnite.begin.hour"]
                  },
                  60
                ]
              },
              {
                $subtract: ["$dayUnite.begin.minute", "$dayUnite.end.minute"]
              }
            ]
          },
          elapsed: {
            $subtract: [
              {
                $multiply: [
                  {
                    $subtract: [hour, "$dayUnite.begin.hour"]
                  },
                  60
                ]
              },
              {
                $subtract: ["$dayUnite.begin.minute", minute]
              }
            ]
          }
        }
      },
      {
        $match: {
          "component.module.unite.speciality": new ObjectId(
            "5d03a47f631b910fc05b586a"
          ),
          "dayUnite.begin.hour": {
            $lte: hour
          },
          "dayUnite.end.hour": {
            $gte: hour
          },
          day: {
            $eq: jour
          },
          $expr: {
            $lte: ["$elapsed", "$duration"]
          }
        }
      }
    ],
    (err, data) => {
      if (err == null) {
        if (data[0] != null) {
          console.log(data[0]);
          // const attendance = Attendance.findOne(
          //   {
          //     schedule: ObjectId(seanceId),
          //     date: now.toDate()
          //   },(err,data)=>{
          //     print(data)
          //   })

          Attendance.findOneAndUpdate(
            {
              schedule: ObjectId(seanceId),
              date: now.toDate()
            },
            {
              $addToSet: {
                list: ObjectId(student)
              }
            },
            {
              new: true
            },
            (err, doc) => {
              if (err == null) {
                res.send(doc);
              } else {
                res.statusCode = 404;
                res.send();
              }
            }
          );
        } else {
          res.statusCode = 404;
          res.send();
        }
      } else {
        res.statusCode = 404;
        res.send();
      }
    }
  );
});
router.get("/:seanceId/attendances", (req, res, next) => {
  const { seanceId } = req.params;
  const { date } = req.query;
  console.log(seanceId);
  if (date == null) {
    Attendance.find({ schedule: seanceId }, (err, data) => {
      res.send(data);
    });
  } else {
    Attendance.find(
      { schedule: seanceId, date: moment(date).toDate() },
      (err, data) => {
        if (err == null) {
          if (data != null) {
            res.send(data[0].list);
          }
        }
      }
    );
  }
});
router.get("/attendances", (req, res, next) => {
  const { seances, day } = req.query;
  const date = moment(day);

  Attendance.aggregate(
    [
      {
        $match: {
          schedule: new ObjectId("5cf57bb9e501ae2f50831b14")
        }
      },
      {
        $group: {
          _id: "$schedule",
          root: {
            $push: "$$ROOT"
          },
          sum: {
            $sum: 1
          }
        }
      },
      {
        $unwind: {
          path: "$root"
        }
      },
      {
        $addFields: {
          "root.sum": "$sum"
        }
      },
      {
        $replaceRoot: {
          newRoot: "$root"
        }
      },
      {
        $unwind: {
          path: "$list",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $group: {
          _id: "$list",
          root: {
            $push: "$$ROOT"
          },
          attended: {
            $sum: 1
          }
        }
      },
      {
        $unwind: {
          path: "$root"
        }
      },
      {
        $addFields: {
          "root.attended": "$attended"
        }
      },
      {
        $replaceRoot: {
          newRoot: "$root"
        }
      },
      {
        $group: {
          _id: "$list",
          list: {
            $addToSet: "$$ROOT"
          }
        }
      },
      {
        $unwind: {
          path: "$list"
        }
      },
      {
        $replaceRoot: {
          newRoot: "$list"
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "list",
          foreignField: "_id",
          as: "list"
        }
      },
      {
        $match: {
          date: new Date("Sun, 19 May 2019 23:00:00 GMT")
        }
      },
      {
        $project: {
          "list._id": 1,
          "list.firstName": 1,
          "list.lastName": 1,
          ratio: {
            $divide: ["$attended", "$sum"]
          },
          schedule: 1
        }
      },
      {
        $unwind: {
          path: "$list"
        }
      },
      {
        $addFields: {
          "list.ratio": "$ratio",
          "list.schedule": "$schedule"
        }
      },
      {
        $replaceRoot: {
          newRoot: "$list"
        }
      },
      {
        $group: {
          _id: "$schedule",
          list: {
            $push: "$$ROOT"
          }
        }
      },
      {
        $lookup: {
          from: "seances",
          localField: "_id",
          foreignField: "_id",
          as: "absents"
        }
      },
      {
        $lookup: {
          from: "components",
          localField: "absents.component",
          foreignField: "_id",
          as: "absents"
        }
      },
      {
        $lookup: {
          from: "modules",
          localField: "absents.module",
          foreignField: "_id",
          as: "absents"
        }
      },
      {
        $lookup: {
          from: "unites",
          localField: "absents.unite",
          foreignField: "_id",
          as: "absents"
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "absents.speciality",
          foreignField: "speciality",
          as: "absents"
        }
      },
      {
        $project: {
          list: 1,
          absents: {
            $setDifference: [
              {
                $map: {
                  input: "$absents",
                  in: "$$this._id"
                }
              },
              {
                $map: {
                  input: "$list",
                  in: "$$this._id"
                }
              }
            ]
          }
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "absents",
          foreignField: "_id",
          as: "absents"
        }
      },
      {
        $project: {
          list: 1,
          "absents._id": 1,
          "absents.firstName": 1,
          "absents.lastName": 1
        }
      }
    ],
    (err, data) => {
      if (err == null) {
        res.send(data);
      } else {
        res.statusCode = 404;
        res.send();
      }
    }
  );
});
router.put("/:seanceId/createList", (req, res) => {
  const { seanceId } = req.params;
  const { day } = req.query;
  console.log(day);

  Attendance.findOne(
    {
      schedule: seanceId,
      date: moment(day)
        .toDate()
        .toUTCString()
    },
    async (err, doc) => {
      console.log(doc);
      if (err == null) {
        if (doc != null) {
          doc.canAttende = true;
          await doc.save();
          console.log(doc);
          res.send(doc);
        }
      }
      res.statusCode = 500;
      res.send();
    }
  );
});
router.get("/:seanceId/checkAttendance", (req, res, next) => {
  const { seanceId } = req.params;
  const { date, studentId } = req.query;

  if (date != null) {
    Attendance.findOne(
      {
        schedule: seanceId,
        date: moment(date).toDate()
      },
      (err, data) => {
        console.log(data);
        if (err == null) {
          if (data != null) {
            if (data.list.includes(studentId)) {
              res.send(true);
            } else {
              res.send(false);
            }
          } else {
            res.send(false);
          }
        } else {
          res.send(err);
        }
      }
    );
  } else {
    res.send("error please specifie the date");
  }
});
router.get("/:schedule/summary", (req, res, next) => {
  const { schedule } = req.params;
  const { studentId } = req.query;
  const { ObjectId } = require("mongodb");
  Attendance.aggregate(
    [
      {
        $match: {
          schedule: new ObjectId(schedule)
        }
      },
      {
        $lookup: {
          from: "seances",
          localField: "schedule",
          foreignField: "_id",
          as: "schedule"
        }
      },
      {
        $unwind: {
          path: "$schedule"
        }
      },
      {
        $lookup: {
          from: "components",
          localField: "schedule.component",
          foreignField: "_id",
          as: "component"
        }
      },
      {
        $addFields: {
          scheduleId: "$schedule._id"
        }
      },
      {
        $unwind: {
          path: "$list",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: "$date",
          students: {
            $push: "$$ROOT.list"
          },
          attendances: {
            $sum: 1
          }
        }
      },
      {
        $project: {
          students: {
            $filter: {
              input: "$students",
              as: "i",
              cond: {
                $eq: ["$$i", studentId]
              }
            }
          }
        }
      },
      {
        $addFields: {
          attende: {
            $size: "$students"
          }
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: 1
          },
          attendance: {
            $sum: "$$ROOT.attende"
          }
        }
      }
    ],
    (err, data) => {
      if (err == null) {
        res.send(data[0]);
      } else {
        res.statusCode = 404;
        res.send();
      }
    }
  );
});
router.get("/currentSeance", async (req, res) => {
  const { userId } = req.query;
  const { ObjectId } = require("mongodb");
  var teacher = null,
    speciality = null;
  const classroom = "2";
  const today = moment().toDate();
  const currentDay = ((today.getDay() + 1) % 7)

  account = await Account.findOne({ owner: userId });
  if (account != null) {
    switch (account.type) {
      case "student":
        var student = await Student.findById({ _id: account.owner })
          .populate("group")
          .exec();
        speciality = student.group.speciality;
        break;
      case "teacher":
        teacher = account.owner;
        break;
    }

    Seance.aggregate(
      [
        {
          $addFields: {
            today: moment().toDate(),
            hour: 14,
            minute: 38,
            teacher: new ObjectId(teacher),
            speciality: new ObjectId(speciality),
            currentClassroom: classroom
          }
        },
        {
          $addFields: {
            currentWeek: {
              $week: {
                date: "$today",
                timezone: "CET"
              }
            },
            permutationWeek: {
              $ifNull: [
                {
                  $week: "$activeOn"
                },
                "$$REMOVE"
              ]
            }
          }
        },
        {
          $addFields: {
            deff: {
              $ifNull: [
                {
                  $abs: {
                    $subtract: ["$currentWeek", "$permutationWeek"]
                  }
                },
                "$$REMOVE"
              ]
            }
          }
        },
        {
          $addFields: {
            replace: {
              $cond: [
                {
                  $eq: ["$deff", 0]
                },
                "$replace",
                null
              ]
            }
          }
        },
        {
          $group: {
            _id: "$semester",
            list: {
              $push: "$$ROOT"
            },
            replacements: {
              $push: "$$ROOT.replace"
            }
          }
        },
        {
          $unwind: {
            path: "$list"
          }
        },
        {
          $addFields: {
            "list.replacements": "$replacements"
          }
        },
        {
          $replaceRoot: {
            newRoot: "$list"
          }
        },
        {
          $addFields: {
            isSelected: {
              $and: [
                {
                  $cond: [
                    {
                      $and: [
                        {
                          $eq: ["$replace", null]
                        },
                        {
                          $eq: ["$primary", false]
                        }
                      ]
                    },
                    false,
                    true
                  ]
                },
                {
                  $not: {
                    $in: ["$_id", "$replacements"]
                  }
                }
              ]
            }
          }
        },
        {
          $match: {
            isSelected: true
          }
        },
        {
          $lookup: {
            from: "components",
            localField: "component",
            foreignField: "_id",
            as: "component"
          }
        },
        {
          $lookup: {
            from: "classrooms",
            localField: "classroom",
            foreignField: "_id",
            as: "classroom"
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
          $lookup: {
            from: "semesters",
            localField: "semester",
            foreignField: "_id",
            as: "semester"
          }
        },
        {
          $unwind: {
            path: "$semester"
          }
        },
        {
          $unwind: {
            path: "$dayUnite"
          }
        },
        {
          $unwind: {
            path: "$classroom"
          }
        },
        {
          $unwind: {
            path: "$component"
          }
        },
        {
          $lookup: {
            from: "teachers",
            localField: "component.teacher",
            foreignField: "_id",
            as: "component.teacher"
          }
        },
        {
          $unwind: {
            path: "$component.teacher"
          }
        },
        {
          $lookup: {
            from: "modules",
            localField: "component.module",
            foreignField: "_id",
            as: "component.module"
          }
        },
        {
          $unwind: {
            path: "$component.module"
          }
        },
        {
          $lookup: {
            from: "unites",
            localField: "component.module.unite",
            foreignField: "_id",
            as: "component.module.unite"
          }
        },
        {
          $unwind: {
            path: "$component.module.unite"
          }
        },
        {
          $addFields: {
            duration: {
              $subtract: [
                {
                  $multiply: [
                    {
                      $subtract: ["$dayUnite.end.hour", "$dayUnite.begin.hour"]
                    },
                    60
                  ]
                },
                {
                  $subtract: ["$dayUnite.begin.minute", "$dayUnite.end.minute"]
                }
              ]
            },
            elapsed: {
              $subtract: [
                {
                  $multiply: [
                    {
                      $subtract: ["$hour", "$dayUnite.begin.hour"]
                    },
                    60
                  ]
                },
                {
                  $subtract: ["$dayUnite.begin.minute", "$minute"]
                }
              ]
            }
          }
        },
        {
          $match: {
            $expr: {
              $and: [
                {
                  $and: [
                    {
                      $and: [
                        {
                          $lte: ["$dayUnite.begin.hour", "$hour"]
                        },
                        {
                          $lte: ["$hour", "$dayUnite.end.hour"]
                        }
                      ]
                    },
                    {
                      $and: [
                        {
                          $lt: ["$elapsed", "$duration"]
                        },
                        {
                          $lte: [0, "$elapsed"]
                        }
                      ]
                    }
                  ]
                },
                {
                  $and: [
                    {
                      $or: [
                        {
                          $eq: [
                            "$component.module.unite.speciality",
                            "$speciality"
                          ]
                        },
                        {
                          $eq: ["$component.teacher._id", "$teacher"]
                        }
                      ]
                    },
                    {
                      $and: [
                        {
                          $eq: ["$classroom._id", "$currentClassroom"]
                        },
                        {
                          $eq: ["$day", currentDay]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          }
        },
        {
          $project: {
            classroom: 1,
            day: 1,
            component: 1,
            semester: 1,
            primary: 1,
            dayUnite: 1
          }
        }
      ],
      (err, doc) => {
        if (doc[0] != null) {
          res.send(doc[0]);
        } else {
          res.statusCode = 404;
          res.send();
        }
      }
    );
  } else {
    res.statusCode = 401;
    res.send();
  }
});
router.get("/currentSeanceForTeacher", async (req, res) => {
  const { userId } = req.query;
  const { ObjectId } = require("mongodb");

  const now = moment();
  const h = 10;
  const m = 20;
  // const h = now.format("HH");
  // const m = now.format("mm");
  Seance.aggregate(
    [
      {
        $addFields: {
          today: now.toDate()
        }
      },
      {
        $addFields: {
          currentWeek: {
            $week: {
              date: "$today",
              timezone: "CET"
            }
          },
          permutationWeek: {
            $ifNull: [
              {
                $week: "$activeOn"
              },
              "$$REMOVE"
            ]
          }
        }
      },
      {
        $addFields: {
          deff: {
            $ifNull: [
              {
                $abs: {
                  $subtract: ["$currentWeek", "$permutationWeek"]
                }
              },
              "$$REMOVE"
            ]
          }
        }
      },
      {
        $project: {
          replace: {
            $cond: [
              {
                $eq: ["$deff", 0]
              },
              "$replace",
              null
            ]
          },
          classroom: 1,
          day: 1,
          component: 1,
          semester: 1,
          primary: 1,
          dayUnite: 1,
          currentWeek: 1,
          today: 1
        }
      },
      {
        $group: {
          _id: "$semester",
          list: {
            $push: "$$ROOT"
          },
          replacements: {
            $push: "$$ROOT.replace"
          }
        }
      },
      {
        $unwind: {
          path: "$list"
        }
      },
      {
        $addFields: {
          "list.replacements": "$replacements"
        }
      },
      {
        $replaceRoot: {
          newRoot: "$list"
        }
      },
      {
        $project: {
          isSelected: {
            $and: [
              {
                $cond: [
                  {
                    $and: [
                      {
                        $eq: ["$replace", null]
                      },
                      {
                        $eq: ["$primary", false]
                      }
                    ]
                  },
                  false,
                  true
                ]
              },
              {
                $not: {
                  $in: ["$_id", "$replacements"]
                }
              }
            ]
          },
          classroom: 1,
          day: 1,
          component: 1,
          semester: 1,
          primary: 1,
          dayUnite: 1,
          currentWeek: 1,
          today: 1
        }
      },
      {
        $match: {
          isSelected: true
        }
      },
      {
        $lookup: {
          from: "components",
          localField: "component",
          foreignField: "_id",
          as: "component"
        }
      },
      {
        $lookup: {
          from: "classrooms",
          localField: "classroom",
          foreignField: "_id",
          as: "classroom"
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
        $lookup: {
          from: "semesters",
          localField: "semester",
          foreignField: "_id",
          as: "semester"
        }
      },
      {
        $unwind: {
          path: "$semester"
        }
      },
      {
        $unwind: {
          path: "$dayUnite"
        }
      },
      {
        $unwind: {
          path: "$classroom"
        }
      },
      {
        $unwind: {
          path: "$component"
        }
      },
      {
        $lookup: {
          from: "teachers",
          localField: "component.teacher",
          foreignField: "_id",
          as: "component.teacher"
        }
      },
      {
        $unwind: {
          path: "$component.teacher"
        }
      },
      {
        $match: {
          "component.teacher._id": ObjectId(userId),
          "dayUnite.begin.hour": {
            $lte: 10
          },
          "dayUnite.end.hour": {
            $gt: 10
          },
          day: {
            $eq: 2
          }
        }
      }
    ],
    (err, doc) => {
      if (doc[0] != null) {
        res.send(doc[0]);
      } else {
        res.statusCode = 403;
        res.send();
      }
    }
  );
});
router.post("/seances/permutate", async (req, res) => {
  const { source, target, date } = req.body;
  permute(source, target, date);
});
router.get("/permutations", (req, res) => {
  const now = moment();

  Permutation.aggregate(
    [
      [
        {
          $lookup: {
            from: "seances",
            localField: "source",
            foreignField: "_id",
            as: "source"
          }
        },
        {
          $unwind: {
            path: "$source"
          }
        },
        {
          $addFields: {
            date: "$source.activeOn",
            source: "$source._id"
          }
        },
        {
          $addFields: {
            currentWeek: {
              $week: {
                date: now.toDate(),
                timezone: "CET"
              }
            },
            permutationWeek: {
              $week: {
                date: "$date",
                timezone: "CET"
              }
            }
          }
        },
        {
          $addFields: {
            show: {
              $lte: [
                {
                  $abs: {
                    $subtract: ["$currentWeek", "$permutationWeek"]
                  }
                },
                1
              ]
            }
          }
        },
        {
          $match: {
            show: true
          }
        },
        {
          $lookup: {
            from: "seances",
            localField: "source",
            foreignField: "_id",
            as: "source"
          }
        },
        {
          $unwind: {
            path: "$source"
          }
        },
        {
          $lookup: {
            from: "components",
            localField: "source.component",
            foreignField: "_id",
            as: "source.component"
          }
        },
        {
          $unwind: {
            path: "$source.component"
          }
        },
        {
          $lookup: {
            from: "modules",
            localField: "source.component.module",
            foreignField: "_id",
            as: "source.component.module"
          }
        },
        {
          $unwind: {
            path: "$source.component.module"
          }
        },
        {
          $lookup: {
            from: "dayunites",
            localField: "source.dayUnite",
            foreignField: "_id",
            as: "source.dayUnite"
          }
        },
        {
          $unwind: {
            path: "$source.dayUnite"
          }
        },
        {
          $lookup: {
            from: "seances",
            localField: "target",
            foreignField: "_id",
            as: "target"
          }
        },
        {
          $unwind: {
            path: "$target"
          }
        },
        {
          $lookup: {
            from: "components",
            localField: "target.component",
            foreignField: "_id",
            as: "target.component"
          }
        },
        {
          $unwind: {
            path: "$target.component"
          }
        },
        {
          $lookup: {
            from: "modules",
            localField: "target.component.module",
            foreignField: "_id",
            as: "target.component.module"
          }
        },
        {
          $unwind: {
            path: "$target.component.module"
          }
        },
        {
          $lookup: {
            from: "dayunites",
            localField: "target.dayUnite",
            foreignField: "_id",
            as: "target.dayUnite"
          }
        },
        {
          $unwind: {
            path: "$target.dayUnite"
          }
        },
        {
          $project: {
            "source.begin": "$source.dayUnite.begin",
            "source.end": "$source.dayUnite.end",
            "source.type": "$source.component.type",
            "source.moduleName": "$source.component.module.name",
            "target.begin": "$target.dayUnite.begin",
            "target.end": "$target.dayUnite.end",
            "target.type": "$target.component.type",
            "target.moduleName": "$target.component.module.name",
            date: 1
          }
        }
      ]
    ],
    (err, data) => {
      res.send(data);
    }
  );
});
router.post("/:schedule/test", async (req, res) => {
  const { day } = req.body;
  const { schedule } = req.params;
  const semester = await Semester.findOne({ year: 2019, semester: "s1" });
  const begin = moment(semester.begin);
  const end = moment(semester.end);
  const duration = moment.duration(end.diff(begin));

  begin.add(day - 1, "days");
  while (begin.isBefore(end)) {
    const attendance = {
      date: begin.format("YYYY-MM-DD"),
      schedule: ObjectId(schedule),
      list: []
    };

    try {
      Attendance(attendance).save();
    } catch (error) {}
    console.log(attendance);
    begin.add(7, "days");
  }
  res.send(
    begin
      .add(day, "days")
      .weekday()
      .toString()
  );
});
router.post("/permutationdemandes", async (req, res) => {
  const { source, target, date } = req.body;
  console.log(req.body);

  const ss = await Seance.findOne({ _id: source });
  const ts = await Seance.findOne({ _id: target });

  const ssc = await Component.findOne({ _id: ss.component });
  const tsc = await Component.findOne({ _id: ts.component });

  if (ss != null && ts != null) {
    console.log(ssc.teacher.toString());
    console.log(tsc.teacher.toString());

    if (ssc.teacher.toString() == tsc.teacher.toString()) {
      permute(source, target, date);
    } else {
      const demande = PermutationDemande({ date, source, target });
      demande.save((err, doc) => {
        if (err == null) {
          res.send();
        } else {
          res.statusCode = 404;
          res.send();
        }
      });
    }
  }
});
router.post("/demands/:id/respond", (req, res) => {
  const { id } = req.params;
  const { response } = req.body;

  PermutationDemande.findOneAndUpdate(
    { _id: id },
    {
      response: response ? "accepted" : "rejected"
    },
    (err, doc) => {
      if (!err) {
        if (response) {
          permute(doc.source, doc.target, doc.date, msg => res.send(msg));
        }
      }
    }
  );
});
router.get("/:seanceId/studentsList", (req, res) => {
  const { seanceId } = req.params;
  Seance.aggregate(
    [
      {
        $match: {
          _id: ObjectId(seanceId)
        }
      },
      {
        $lookup: {
          from: "components",
          localField: "component",
          foreignField: "_id",
          as: "component"
        }
      },
      {
        $lookup: {
          from: "modules",
          localField: "component.module",
          foreignField: "_id",
          as: "component.module"
        }
      },
      {
        $lookup: {
          from: "unites",
          localField: "component.module.unite",
          foreignField: "_id",
          as: "component.module.unite"
        }
      },
      {
        $unwind: {
          path: "$component.module.unite"
        }
      },
      {
        $project: {
          _id: 0,
          speciality: "$component.module.unite.speciality"
        }
      },
      {
        $group: {
          _id: "$speciality"
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "speciality",
          as: "students"
        }
      }
    ],
    (err, data) => {
      if (err == null) {
        res.send(data);
      }
    }
  );
});
router.get("/classrooms/nonUsedSchedules", async (req, res) => {
  const { level, value } = req.query;
  Seance.aggregate(
    [
      {
        $lookup: {
          from: "components",
          localField: "component",
          foreignField: "_id",
          as: "speciality"
        }
      },
      {
        $lookup: {
          from: "modules",
          localField: "speciality.module",
          foreignField: "_id",
          as: "speciality"
        }
      },
      {
        $lookup: {
          from: "unites",
          localField: "speciality.unite",
          foreignField: "_id",
          as: "speciality"
        }
      },
      {
        $addFields: {
          speciality: "$speciality.speciality"
        }
      },
      {
        $unwind: {
          path: "$speciality"
        }
      },
      {
        $lookup: {
          from: "semesters",
          localField: "semester",
          foreignField: "_id",
          as: "semester"
        }
      },
      {
        $unwind: {
          path: "$semester"
        }
      },
      {
        $addFields: {
          today: moment().toDate()
        }
      },
      {
        $match: {
          speciality: {
            level: level,
            value: value
          },
          $expr: {
            $and: [
              {
                $gte: ["$today", "$semester.begin"]
              },
              {
                $lte: ["$today", "$semester.end"]
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: "$classroom",
          used: {
            $push: {
              day: "$$ROOT.day",
              dayUnite: "$$ROOT.dayUnite"
            }
          }
        }
      },
      {
        $addFields: {
          days: [0, 1, 2, 3, 4, 5],
          dayunites: [
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
          path: "$days"
        }
      },
      {
        $unwind: {
          path: "$dayunites"
        }
      },
      {
        $group: {
          _id: {
            classroom: "$_id",
            day: "$days"
          },
          used: {
            $first: "$used"
          },
          all: {
            $addToSet: {
              day: "$$ROOT.days",
              dayUnite: "$$ROOT.dayunites"
            }
          }
        }
      },
      {
        $project: {
          classroom: "$_id.classroom",
          day: "$_id.day",
          nonUsed: {
            $map: {
              input: {
                $setDifference: ["$all", "$used"]
              },
              in: "$$this.dayUnite"
            }
          },
          _id: 0
        }
      },
      {
        $lookup: {
          from: "dayunites",
          localField: "nonUsed",
          foreignField: "_id",
          as: "nonUsed"
        }
      },
      {
        $group: {
          _id: "$classroom",
          nonUsed: {
            $push: {
              day: "$$ROOT.day",
              dayUnites: "$$ROOT.nonUsed"
            }
          }
        }
      }
    ],
    (err, data) => {
      if (err == null) {
        res.send(data);
      }
    }
  );
});
async function permute(source, target, date, onComplete) {
  try {
    const ss = await Seance.findOne({ _id: source });
    const ts = await Seance.findOne({ _id: target });

    const ssb = {
      classroom: ss.classroom,
      component: ss.component,
      day: ts.day,
      dayUnite: ts.dayUnite,
      semester: ss.semester,
      primary: false,
      activeOn: moment(date)
        .toDate()
        .toUTCString(),
      replace: target
    };
    const tsb = {
      classroom: ts.classroom,
      component: ts.component,
      day: ss.day,
      dayUnite: ss.dayUnite,
      semester: ts.semester,
      primary: false,
      activeOn: moment(date)
        .subtract(ts.day - ss.day, "days")
        .toDate()
        .toUTCString(),
      replace: source
    };
    if (ss != null && ts != null) {
      nss = await Seance(ssb);
      nts = await Seance(tsb);

      ssGroups = await ConsernsGroup.find({ seance: ss._id });
      tsGroups = await ConsernsGroup.find({ seance: ts._id });

      nssAttendance = await Attendance({
        date: ssb.activeOn,
        schedule: nss._id
      });
      ntsAttendance = await Attendance({
        date: tsb.activeOn,
        schedule: nts._id
      });

      await nss.save();
      await nts.save();

      ssGroups.forEach(async e => {
        await ConsernsGroup({ seance: nss._id, group: e.group }).save();
      });
      tsGroups.forEach(async e => {
        await ConsernsGroup({ seance: nts._id, group: e.group }).save();
      });

      await nssAttendance.save();
      await ntsAttendance.save();

      if (onComplete != null) {
        onComplete("done");
      }
    }
  } catch (error) {
    if (onComplete != null) {
      if (error.code == 11000) {
        onComplete("This schedule is alredy exist");
      }
    }
  }
}

module.exports = server => {
  server.use("/seances", router);
};
