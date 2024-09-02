const mongoose = require("mongoose");
const timeStamps = require("mongoose-timestamps");
const models = require("./models");

const schema = mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  isActive:{
    type:Boolean,
    default:true
  },
  list: [],
  completedPlanningItems: [],
  canAttende: {
    type: Boolean,
    default: false
  },
  schedule: {
    type: mongoose.Types.ObjectId,
    ref: models.seance,
    required: true
  }
});

schema.index(
  {
    date: 1,
    schedule:1
  },
  {
    unique: true
  }
);
module.exports = mongoose.model(models.attendance, schema);
