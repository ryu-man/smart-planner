const express = require("express");
const router = express.Router();
const Homework = require("../models/homework");
const moment = require("moment");


  router.get("/", (req, res, next) => {
    const { componentId, semesterId } = req.query;
    const { date } = req.query;
    console.log(componentId+" "+semesterId)
    if(componentId && semesterId){
      Homework.find(
        { component: componentId, semester: semesterId },
        (err, data) => {
          try {
            res.send(data);
          } catch (error) {
            next(error);
          }
        }
      )
    }else{
      res.send("Error : unsuffisant parameters")
    }
    
  });

router.post("/", (req, res, next) => {
  const { component, semester, returnsDate, requiredWork } = req.body;

  const homework = Homework({
    component,
    semester,
    deliveredDate: moment(),
    returnsDate,
    requiredWork
  });

  homework.save((err, doc) => {
    if (err == null) {
      res.send(doc);
    } else {
      res.send(err);
    }
  });
});
router.put("/:homeworkId/evaluate", (req, res, next) => {
  const { studentId, evaluation } = req.body
  const { homeworkId } = req.params

  Homework.findOneAndUpdate({_id:homeworkId},{
    $addToSet:{
        evaluationList:{studentId:studentId, evaluation:evaluation}
    }
  },(err,doc)=>{
      console.log(err)
        res.send(doc)
  })
})
module.exports = server => {
  server.use("/homeworks", router)
}
