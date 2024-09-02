const mongoose = require('mongoose');
const timeStamps = require('mongoose-timestamps');
const models = require('./models')
const schema = mongoose.Schema({

    name: {
        type: String,
        required: true,
        //trim: true
    },
    description: String,
    ip: {
        type: String,
        required: true
    },
    classroom: {
        type: String,
        ref: 'Classroom',
        required: true
    },
    consume: [{
        type: Object,
        ref:'EnergyConsumption'
    }]
});
schema.virtual("consumptions", {
    ref: models.energyConsumption,
    localField: "_id", 
    foreignField: "device",
    justOne: false,
    options: { sort: { name: -1 }, limit: 5 } // Query options, see http://bit.ly/mongoose-query-options
  });
schema.plugin(timeStamps);

module.exports = mongoose.model('Device', schema)