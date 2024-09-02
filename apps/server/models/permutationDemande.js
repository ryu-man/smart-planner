const mongoose = require("mongoose");
const timeStamps = require("mongoose-timestamps");
const models = require("./models");

const schema = mongoose.Schema({
    date:{
        type:Date, 
        required:true
    },
    source:{
        type:mongoose.Types.ObjectId, 
        ref: models.seance,
        required:true
    },
    target:{
        type:mongoose.Types.ObjectId,
        ref: models.seance,
        required:true
    },
    response:{
        type:String,
        enum:["accepted" , "rejected", "waiting"],
        default:"waiting"
    }
});
schema.index({
    date:1,
    source:1,
    target:1
},{
    unique:true
})
schema.plugin(timeStamps);

module.exports = mongoose.model(models.permutationDemande, schema);
