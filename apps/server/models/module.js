const mongoose = require("mongoose");
const timeStamps = require("mongoose-timestamps");
const models = require("./models");

function abbreviation(v){
  words =v.split(" ")
  return words.length > 1?
  words.map(w => w.substr(0, 1)).reduce((c1, c2) => c1 + c2).toUpperCase():
  v
}
var schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
      //trim:true
    },
    abbr: {
      type: String,
      set: abbreviation
    },
    description: {
      type: String,
      //trim: true
    },
    coefficient: {
      type: Number,
      required: true
    },
    unite: {
      type: mongoose.Types.ObjectId,
      ref: models.unite
    }
  },
  {
    toJSON: {
      virtuals: true
    }
  }
);
schema.path('abbr').set((v)=> abbreviation(v))
schema.virtual("components", {
  ref: models.classroom,
  localField: "_id",
  foreignField: "module",
  justOne: false,
  options: { sort: { name: -1 }, limit: 5 } // Query options, see http://bit.ly/mongoose-query-options
});

schema.plugin(timeStamps);

module.exports = mongoose.model(models.module, schema);
