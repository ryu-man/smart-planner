const Component = require("../models/component");
const Homework = require("../models/homework");
const Planning = require('../models/planning');
const Module = require("../models/module");

const mongoose = require("mongoose");
const {ObjectId} = require('mongodb')
const express = require("express");
const router = express.Router();

const flatten = arr => {
  let result = [];
  arr.forEach(function(v) {
    if (Array.isArray(v)) {
      result = result.concat(flatten(v));
    } else {
      result.push(v);
    }
  });
  return result;
};

router.get("/", (req, res, next) => {
  Module.find({}).then(results => {
    res.send(results);
  });
});
router.post("/", (req, res, next) => {
  const {name, description, coefficient, unite} = req.body
  const doc = new Module({
    name,
    "abbr":name,
    description,
    coefficient,
    unite
  });
  doc.save((err, d) => {
    if (err == null) {
      res.statusCode = 200;
      res.send();
    } else {
      res.statusCode = 500;
      res.send(err);
    }
  });
});

router.get("/teachers", (req, res, next) => {
  Module.find({})
    .populate("components.teacher")
    .exec((err, results) => {
      res.send(flatten(results.map(a => a.components.map(v => v.teacher))));
    });
});

router.get("/components", (req, res) => {
  const { module } = req.params;
  Component.aggregate();
});
router.post("/components", (req, res) => {
  const { type, teacher, module } = req.body;
  const component = Component({ type, module, teacher });
  component.save((err, doc) => {
    if (err == null) {
      res.statusCode = 200;
      res.send();
    }else
    {
      res.statusCode = 500;
      res.send(err);
    }
  });
});



router.get("/:module/progress", (req, res) => {
  Module.aggregate([], (err, data) => {
    if (err == null) {
      res.send(data);
    } else {
      res.send(err);
    }
  });
});
router.get("/components/details", (req, res) => {
  Component.aggregate(
    [
      {
        $lookup: {
          from: "modules",
          localField: "module",
          foreignField: "_id",
          as: "module"
        }
      },
      {
        $unwind: {
          path: "$module"
        }
      },
      {
        $lookup: {
          from: "teachers",
          localField: "teacher",
          foreignField: "_id",
          as: "teacher"
        }
      },
      {
        $unwind: {
          path: "$teacher"
        }
      },
      {
        $group: {
          _id: "$module.name",
          list: {
            $push: "$$ROOT"
          }
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
router.get('/components/homeworks/', async(req, res)=>{
}
)
router.post('/components/homeworks/', async(req, res)=>{
 const {component, semester, requiredWork, deliveredDate, returnsDate} = req.body
 const homework = Homework({component, semester, requiredWork, deliveredDate, returnsDate, "evaluationList":[]})
 homework.save((err, doc)=>{
   if(err == null){
     res.send()
   }else{
     res.statusCode = 500
     res.send()
   }
 })
}
)
router.post('/components/homeworks/:homeworkId', async(req, res)=>{
  const{ homeworkId } = req.params
  var l = req.body["list"].map((e)=> {
    
    e["studentId"] = ObjectId(e["studentId"])
    return e
  })
  var homework = await Homework.findById({_id:homeworkId})
  homework.evaluationList = l
  homework.save((err, doc)=>{
    if(err ==null){
      console.log(doc)
    }
  })
}
)
router.get("/:module/components/:componentId/planning", (req, res) => {
  const { module, componentId } = req.params;
  const { planning } = req.body;
  const component = new Component({});
});
router.post('/components/:componentId/planning', (req, res)=>{
  const {title, header, requiredTime, index} = req.body
  const {componentId} = req.params

  const planning = Planning({title, header, requiredTime, index, "form":componentId})
  planning.save((err, doc)=>{
    if(err == null){
      res.send(doc)
    }else{
      res.send(err)
    }
  })
})

router.get("/:component/studentsRecords", (req, res) => {
  const { component } = req.params;
  Seance.aggregate(
    [
      {
        '$addFields': {
          'speciality': '$component'
        }
      }, {
        '$match': {
          'component': new ObjectId(component)
        }
      }, {
        '$lookup': {
          'from': 'components', 
          'localField': 'component', 
          'foreignField': '_id', 
          'as': 'speciality'
        }
      }, {
        '$lookup': {
          'from': 'modules', 
          'localField': 'speciality.module', 
          'foreignField': '_id', 
          'as': 'speciality.module'
        }
      }, {
        '$lookup': {
          'from': 'unites', 
          'localField': 'speciality.module.unite', 
          'foreignField': '_id', 
          'as': 'speciality.module.unite'
        }
      }, {
        '$unwind': {
          'path': '$speciality.module.unite'
        }
      }, {
        '$addFields': {
          'speciality': '$speciality.module.unite.speciality'
        }
      }, {
        '$lookup': {
          'from': 'students', 
          'localField': 'speciality', 
          'foreignField': 'speciality', 
          'as': 'students'
        }
      }, {
        '$lookup': {
          'from': 'homeworks', 
          'localField': 'component', 
          'foreignField': 'component', 
          'as': 'homeworks'
        }
      }, {
        '$lookup': {
          'from': 'attendances', 
          'localField': '_id', 
          'foreignField': 'schedule', 
          'as': 'attendances'
        }
      }, {
        '$unwind': {
          'path': '$students'
        }
      }, {
        '$addFields': {
          'students.homeworks': '$homeworks', 
          'students.attendances': '$attendances'
        }
      }, {
        '$replaceRoot': {
          'newRoot': '$students'
        }
      }, {
        '$addFields': {
          'homeworks': {
            '$map': {
              'input': '$homeworks', 
              'in': '$$this.evaluationList'
            }
          }
        }
      }, {
        '$unwind': {
          'path': '$homeworks'
        }
      }, {
        '$unwind': {
          'path': '$homeworks'
        }
      }, {
        '$group': {
          '_id': '$_id', 
          'firstName': {
            '$first': '$$ROOT.firstName'
          }, 
          'lastName': {
            '$first': '$$ROOT.lastName'
          }, 
          'speciality': {
            '$first': '$$ROOT.speciality'
          }, 
          'birthday': {
            '$first': '$$ROOT.birthday'
          }, 
          'contactInfos': {
            '$first': '$$ROOT.contactInfos'
          }, 
          'attendances': {
            '$first': '$$ROOT.attendances'
          }, 
          'homeworks': {
            '$push': '$$ROOT.homeworks'
          }
        }
      }, {
        '$addFields': {
          'homeworks': {
            '$filter': {
              'input': '$homeworks', 
              'cond': {
                '$eq': [
                  '$$this.studentId', '$_id'
                ]
              }
            }
          }
        }
      }, {
        '$addFields': {
          'homeworks': '$homeworks.evaluation'
        }
      }, {
        '$addFields': {
          'homeworks': {
            '$reduce': {
              'input': '$homeworks', 
              'initialValue': 0, 
              'in': {
                '$add': [
                  '$$value', '$$this'
                ]
              }
            }
          }, 
          'total': {
            '$size': '$attendances'
          }, 
          'attendances': {
            '$filter': {
              'input': '$attendances', 
              'cond': {
                '$in': [
                  '$_id', '$$this.list'
                ]
              }
            }
          }
        }
      }, {
        '$addFields': {
          'attendances': {
            '$size': '$attendances'
          }
        }
      }, {
        '$addFields': {
          'ratio': {
            '$divide': [
              '$attendances', '$total'
            ]
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
module.exports = server => {
  server.use("/modules", router);
};
