const mongoose = require("mongoose");
const timeStamps = require("mongoose-timestamps");
const models = require("./models");

function abbreviation(v){
  words =v.split(" ")
  return words.length > 1?
  words.map(w => w.substr(0, 1)).reduce((c1, c2) => c1 + c2).toUpperCase():
  v
}

const schema = mongoose.Schema({
  level: {
    type:String,
    required:true
  },
  name: {
    type:String,
    required:true
  },
  abbr: {
    type: String,
  }
});
schema.index(
  {
    level: 1,
    name: 1
  },
  {
    unique: true
  }
);
schema.path('abbr').set((v)=> abbreviation(v))
schema.plugin(timeStamps);

module.exports = mongoose.model(models.speciality, schema);
