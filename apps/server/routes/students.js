const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Student = require("../models/student");
const Account = require("../models/account");
const Schedule = require("../models/seance");
const moment = require("moment");
const { ObjectId } = require("mongodb");

/* GET users listing. */
router.get("/name=:name", async function(req, res, next) {
  const students = await Student.findOne({ firstName: req.params.name });
  res.send(students);
  next();
});
router.get("/email=:email", async function(req, res, next) {
  const student = await Student.findOne({
    "contactInfos.email": req.params.email
  }).populate("");
  //let students = await Account.findOne({ 'email': req.params.email });
  res.send(await student.Account);

  //next();
});
router.get("/", (req, res, next) => {
  const { groups } = req.query;

  if (groups != null && groups.length != 0) {
    Student.aggregate(
      [
        {
          $match: {
            $expr: {
              $in: ["$group", groups.map(g => ObjectId(g))]
            }
          }
        },
        {
          $lookup: {
            from: "groups",
            localField: "group",
            foreignField: "_id",
            as: "group"
          }
        },
        {
          $unwind: {
            path: "$group"
          }
        },
        {
          $lookup: {
            from: "specialities",
            localField: "group.speciality",
            foreignField: "_id",
            as: "group.speciality"
          }
        },
        {
          $unwind: {
            path: "$group.speciality"
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
  } else {
    Student.find({}, (err, data) => {
      if (err == null) {
        res.send(data);
      } else {
        res.statusCode = 500;
        res.send();
      }
    });
  }
});
router.put("/:studentId", function(req, res, next) {
  res.send("student put " + req.params.studentId);
});
router.post("/", async function(req, res, next) {
  const { firstName, lastName, birthday, contactInfos, password } = req.body;
  const email = contactInfos.email;

  let account = new Account({ email });
  let student = new Student({
    firstName,
    lastName,
    birthday,
    contactInfos,
    account: account._id
  });

  bcrypt.hash(password, bcrypt.genSaltSync(10), (err, hach) => {
    account.password = hach;
    account.owner = "student";
    account.save((err, model) => {
      if (err != null) console.log(err);
    });
    student.save((err, model) => {
      res.send(model);
    });
  });

  //console.log(account);
  /*Student.find({}).populate('account').exec((err, results)=>{
    res.send(results);
  });*/
});

router.get("/:_id/loadSchedules", async (req, res) => {
  const { _id } = req.params;
  const student = await Student.findOne({ _id });

  if (student != null) {
    const now = moment();
    console.log(now.toDate());
    Schedule.aggregate(
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
          $match: {
            "component.module.unite.speciality": {
              level: "M2",
              value: "GL"
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
        if (err == null) {
          res.set("date", now.startOf("day").format("YYYY-MM-D"));
          res.send(data);
        } else {
          res.send(err);
        }
      }
    );
  } else {
    res.statusCode = 404;
    res.send();
  }
});

router.get("/components/:component/records", async (req, res) => {
  const { component } = req.params;
  Student.aggregate(
    [
      {
        $lookup: {
          from: "consernsgroups",
          localField: "group",
          foreignField: "group",
          as: "records"
        }
      },
      {
        $lookup: {
          from: "seances",
          localField: "records.seance",
          foreignField: "_id",
          as: "records"
        }
      },
      {
        $unwind: {
          path: "$records"
        }
      },
      {
        $lookup: {
          from: "components",
          localField: "records.component",
          foreignField: "_id",
          as: "records.component"
        }
      },
      {
        $unwind: {
          path: "$records.component"
        }
      },
      {
        $match: {
          $expr: {
            $eq: ["$records.component._id", new ObjectId(component)]
          }
        }
      },
      {
        $lookup: {
          from: "attendances",
          localField: "records._id",
          foreignField: "schedule",
          as: "records.meetings"
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          birthday: 1,
          contactInfos: 1,
          group: 1,
          "records.component": 1,
          "records.meetings": {
            $map: {
              input: "$records.meetings",
              in: {
                $cond: {
                  if: {
                    $in: ["$_id", "$$this.list"]
                  },
                  then: 1,
                  else: 0
                }
              }
            }
          },
          "records.totalMeetings": {
            $size: "$records.meetings"
          }
        }
      },
      {
        $addFields: {
          "records.presence": {
            $reduce: {
              input: "$records.meetings",
              initialValue: 0,
              in: {
                $add: ["$$value", "$$this"]
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: "homeworks",
          localField: "records.component._id",
          foreignField: "component",
          as: "homeworks"
        }
      },
      {
        $addFields: {
          homeworks: {
            $map: {
              input: "$homeworks",
              in: "$$this.evaluationList"
            }
          }
        }
      },
      {
        $addFields: {
          homeworks: {
            $reduce: {
              input: "$homeworks",
              initialValue: [],
              in: "$$this"
            }
          }
        }
      },
      {
        $addFields: {
          homeworks: {
            $filter: {
              input: "$homeworks",
              cond: {
                $eq: ["$$this.studentId", "$_id"]
              }
            }
          }
        }
      },
      {
        $addFields: {
          homeworks: {
            $reduce: {
              input: "$homeworks",
              initialValue: 0,
              in: {
                $add: ["$$value", "$$this.evaluation"]
              }
            }
          }
        }
      },
      {
        $group: {
          _id: {
            _id: "$_id",
            component: "$records.component._id"
          },
          firstName: {
            $first: "$firstName"
          },
          lastName: {
            $first: "$lastName"
          },
          birthday: {
            $first: "$birthday"
          },
          contactInfos: {
            $first: "$contactInfos"
          },
          group: {
            $first: "$group"
          },
          homeworks: {
            $first: "$homeworks"
          },
          presence: {
            $push: "$$ROOT.records.presence"
          },
          totalMeetings: {
            $push: "$$ROOT.records.totalMeetings"
          }
        }
      },
      {
        $addFields: {
          presence: {
            $reduce: {
              input: "$presence",
              initialValue: 0,
              in: {
                $add: ["$$value", "$$this"]
              }
            }
          },
          totalMeetings: {
            $reduce: {
              input: "$totalMeetings",
              initialValue: 0,
              in: {
                $add: ["$$value", "$$this"]
              }
            }
          }
        }
      },
      {
        $addFields: {
          _id: "$_id._id",
          ratio: {
            $divide: ["$presence", "$totalMeetings"]
          }
        }
      },
      {
        $lookup: {
          from: "groups",
          localField: "group",
          foreignField: "_id",
          as: "group"
        }
      },
      {
        $unwind: {
          path: "$group"
        }
      },
      {
        $lookup: {
          from: "specialities",
          localField: "group.speciality",
          foreignField: "_id",
          as: "group.speciality"
        }
      },
      {
        $unwind: {
          path: "$group.speciality"
        }
      }
    ],
    (err, data) => {
      if (err == null) {
        res.send(data);
      } else {
        res.send(err);
      }
    }
  );
});

module.exports = server => {
  server.use("/students", router);
};
