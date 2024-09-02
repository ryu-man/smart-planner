const mongoose = require('mongoose')
const timeStamps = require('mongoose-timestamps')
const models = require('./models.js')

const schema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        //trim:true
    },
    lastName: {
        type: String,
        required: true,
    },
    birthday: {
        type: Date,
        required: true
    },
    contactInfos: {
        type: Object,
        required: true
    },
    group:{
        type:mongoose.Types.ObjectId,
        ref:models.group
    }
    // account: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Account',
    //     //required:true
    // }
});
schema.plugin(timeStamps);

module.exports = mongoose.model(models.student, schema)