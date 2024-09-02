const mongoose = require('mongoose');
const timeStamps = require('mongoose-timestamps');
const models = require('./models');
const {ObjectId} = require('mongodb');

const schema = mongoose.Schema({
    seance:{
    type:mongoose.Types.ObjectId,
    ref:models.seance,
    required:true
},
    group:{
        type:mongoose.Types.ObjectId,
        ref:models.group,
        required:true
    }
});
schema.index({
    group:1,
    seance:1
},{
    unique:true
})
schema.path('group').set((v)=> ObjectId(v))
schema.plugin(timeStamps);

module.exports = mongoose.model(models.consernsGroup, schema)