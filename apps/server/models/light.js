const mongoose = require('mongoose');
const timeStamps = require('mongoose-timestamps');
const models = require('./models')
const detailSchema = mongoose.Schema({
    
});
const schema = mongoose.Schema({
    // date: {
    //     type: Date,
    //     required: true,
    //     //trim:true
    // },
    value: {
        type: Number,
        required: true,
        //trim: true
    },
    classroom:{
        type:Number,
        ref:models.classroom
    }
});

schema.plugin(timeStamps);

module.exports = mongoose.model(models.light, schema)