const mongoose = require("mongoose");
const timeStamps = require("mongoose-timestamps");
const models = require("./models");

const schema = mongoose.Schema(
  {
    _id: {
      type: String
    },
    location: {
      type: String
    },
    chairs: Number,
    type: {
      type: String,
      enum: ["TD", "TP"]
    },
    network:{
      type:String,
      required:true
    }
  },
  { toJSON: { virtuals: true } }
);

schema.virtual("temperatures", {
  ref: models.temperature,
  localField: "_id", 
  foreignField: "classroom",
  justOne: false,
  options: { sort: { name: -1 }, limit: 5 } // Query options, see http://bit.ly/mongoose-query-options
});
schema.virtual("devices", {
  ref: models.device,
  localField: "_id", 
  foreignField: "classroom",
  justOne: false,
  options: { sort: { name: -1 }, limit: 5 } // Query options, see http://bit.ly/mongoose-query-options
});
schema.virtual("lights", {
  ref: models.light,
  localField: "_id", 
  foreignField: "classroom",
  justOne: false,
  options: { sort: { name: -1 }, limit: 5 } // Query options, see http://bit.ly/mongoose-query-options
});

schema.plugin(timeStamps);

module.exports = mongoose.model(models.classroom, schema);
