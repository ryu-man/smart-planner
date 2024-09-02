const mongoose = require('mongoose');
const timeStamps = require('mongoose-timestamps');
const models = require('../models/models')
const schema = mongoose.Schema({
    value: {
        type: Number,
        required: true,
       
    },
    classroom:{
        type: String,
        ref: models.classroom
    }
});

schema.plugin(timeStamps);

module.exports = mongoose.model(models.temperature, schema)