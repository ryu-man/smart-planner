const mongoose = require("mongoose");
const timeStamps = require("mongoose-timestamps");
const models = require("./models");
const evaluationSchema = mongoose.Schema({
    studentId:mongoose.Types.ObjectId,
    evaluation:Number
},{_id:false})

const schema = mongoose.Schema({
    semester:{
        type:mongoose.Types.ObjectId, 
        ref: models.semester,
        required:true
    },
    component:{
        type:mongoose.Types.ObjectId,
        ref: models.component,
        required:true
    },
  deliveredDate: Date,
  returnsDate: Date,
  requiredWork: String,
  evaluationList:[
      {
          type:evaluationSchema
      }
  ]
});
schema.plugin(timeStamps);

module.exports = mongoose.model(models.homework, schema);
