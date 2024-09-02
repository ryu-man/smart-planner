const mongoose = require('mongoose');
const timeStamps = require('mongoose-timestamps');
const models = require('./models');
const {ObjectId} = require('mongodb');

const schema = mongoose.Schema({
    group:{
        type:Number,
        required:true
    },
    speciality:{
        type:mongoose.Types.ObjectId,
        ref:models.speciality,
        required:true
    }
});
schema.index({
    group:1,
    speciality:1
},{
    unique:true
})
schema.path('speciality').set((v)=> ObjectId(v))
schema.plugin(timeStamps);

module.exports = mongoose.model(models.group, schema)