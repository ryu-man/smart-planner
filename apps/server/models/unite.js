const mongoose = require('mongoose');
const timeStamps = require('mongoose-timestamps');
const models = require('./models');

const schema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        //trim:true
    },
    type:{
        type:String
    },
    speciality: {
        type: mongoose.Types.ObjectId,
        ref:models.unite
    },
});
schema.plugin(timeStamps);

module.exports = mongoose.model(models.unite, schema)