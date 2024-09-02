const mongoose = require("mongoose");
const timeStamps = require("mongoose-timestamps");
const models = require("./models");

const schema = mongoose.Schema(
  {
    source: mongoose.Types.ObjectId
    ,
    target: mongoose.Types.ObjectId
    
  },
);

schema.index({
    date:1
},{
    unique:true
})
module.exports = mongoose.model(models.permutation, schema);
