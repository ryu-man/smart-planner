const mongoose = require('mongoose');
const timeStamps = require('mongoose-timestamps');

const schema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        //trim:true
    },
    lastName: {
        type: String,
        required: true,
        //trim: true
    },
    birthday: {
        type: Date,
        required: true
    },
    grade:{
        type:String,
        required: true
    },
    contactInfos: {
        type: Object,
        required: true
    },
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        //required:true
    }
});
schema.plugin(timeStamps);

module.exports = mongoose.model('Teacher', schema);