const mongoose = require('mongoose');
const timeStamps = require('mongoose-timestamps');
const models = require('./models')

const schema = mongoose.Schema({
    year:{
        type:String,
        required:true,
    },
    semester:{
        type:String,
        enum:['s1', 's2'],
        required:true,
    },
    speciality:{
        type:Object
    },
    begin:Date,
    end:Date
});
schema.index({
    year:1,
    semester:1
},{
    unique:true
})
schema.plugin(timeStamps);


module.exports = mongoose.model(models.semester, schema)