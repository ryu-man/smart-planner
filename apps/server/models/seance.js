const mongoose = require("mongoose");
const timeStamps = require("mongoose-timestamps");
const mongooseUniqueArray = require("mongoose-unique-array");
const models = require("./models");
const moment = require("moment");

function toDate() {}
function dateToString(date) {
  console.log("hello world");
  return moment(date).format("MMMM Do YYYY");
}
const schema = mongoose.Schema({
  classroom: {
    type: String,
    ref: models.classroom,
    required: true
  },
  component: {
    type: mongoose.Types.ObjectId,
    ref: models.component,
    required: true
  },
  day: {
    type: Number,
    ref: models.day,
    required: true
  },
  dayUnite: {
    type: mongoose.Types.ObjectId,
    ref: models.dayUnite,
    required: true
  },
  semester: {
    type: mongoose.Types.ObjectId,
    ref: models.semester,
    required: true
  },
  primary:{
    type:Boolean,
    default:true
  },
  activeOn:Date,
  replace:mongoose.Types.ObjectId
});
schema.index(
  {
    classroom: 1,
    day: 1,
    dayUnite: 1,
    semester: 1,
    primary:1
  },
  {
    unique: true
  }
);

schema.plugin(timeStamps);

module.exports = mongoose.model(models.seance, schema);
