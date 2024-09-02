const mongoose = require('mongoose');
const timeStamps = require('mongoose-timestamps');
const models = require('./models')
const detailSchema = mongoose.Schema({
    
});
const schema = mongoose.Schema({
    date: {
        type: Date,
        required: true,
        //trim:true
    },
    value: {
        type: Number,
        required: true,
        //trim: true
    },
    device:{
        type: mongoose.Types.ObjectId,
        ref: models.device
    }
});
schema.virtual('duration').get(()=>{
    
});
schema.plugin(timeStamps);

module.exports = mongoose.model('EnergyConsumption', schema)