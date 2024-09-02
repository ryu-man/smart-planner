const mongoose = require('mongoose');
const timeStamps = require('mongoose-timestamps');
const models = require('./models')
const schema = mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    header:{
        type:String,
        required:true
    },
    requiredTime:{
        type:Number,
        required:true
    },
    index:{
        type:Number,
        required:true
    },
    form:{
        type:mongoose.Types.ObjectId,
        ref: models.component
    }
});
schema.metho
schema.plugin(timeStamps);

module.exports = mongoose.model(models.planning, schema)