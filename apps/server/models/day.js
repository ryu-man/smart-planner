const mongoose = require('mongoose');
const timeStamps = require('mongoose-timestamps');

const schema = mongoose.Schema({
    _id: {
        type: Number,
        enum:[0, 1, 2, 3, 4, 5],
        required: true,
        //trim:true
    },
    value:{
        type:String,
        enum:["saturday","sunday", "monday", "tuesday", "wednesday", "thursday"]
    }
});
schema.plugin(timeStamps);

module.exports = mongoose.model('Day', schema)