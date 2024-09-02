const mongoose = require("mongoose");
const timeStamps = require("mongoose-timestamps");
const models = require("./models");

// const planningSchema = mongoose.Schema({
//   title: String,
//   requiredTime:Number,
//   subTitles: []
// },{_id:false});

var schema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["COURS", "TD", "TP"]
      //trim:true
    },
    module: {
      type: mongoose.Types.ObjectId,
      ref: models.module
      //trim: true
    },
    teacher: {
      type: mongoose.Types.ObjectId,
      ref: models.teacher
    },
    // planning: [
    //   {
    //     type: planningSchema,  
    //   }
    // ]
  },
  {
    toJSON: {
      virtuals: true
    }
  }
);

schema.plugin(timeStamps);

module.exports = mongoose.model(models.component, schema);
