const mongoose = require('mongoose')
const timeStamps = require('mongoose-timestamps')
const models = require('./models')

const StudentSchema = mongoose.Schema({
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
    contactInfos: {
        type: Object,
        required: true
    }
})

var schema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        //unique:true
        //trim:true
    },
    password:{
        type:String,
        required:true,
        select:false
        //trim: true
    },
    profileImage:{
        type: String
    },
    type:{
        type:String,
        enum:["student", "teacher", "admin", "technician"],
        required:true
    },
    owner:{
        type:mongoose.Types.ObjectId,
        
        required:true
    }

});
schema.index({
    email:1
},{
    unique:true
})
// schema.set('toJSON', {
//     transform: function(doc, ret, opt) {
//         delete ret['password']
//         return ret
//     }
// })
// schema.virtual('student',{
//     ref: models.student,
//     localField: "_id", 
//     foreignField: "account",
//     justOne: true,
//     options: { sort: { name: -1 }, limit: 5 } // Query options, see http://bit.ly/mongoose-query-options
//   })
// schema.virtual('teacher',{
//     ref: models.teacher,
//     localField: "_id", 
//     foreignField: "account",
//     justOne: true,
//     options: { sort: { name: -1 }, limit: 5 } // Query options, see http://bit.ly/mongoose-query-options
//   })
schema.plugin(timeStamps);

module.exports = mongoose.model('Account', schema);;