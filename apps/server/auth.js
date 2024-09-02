const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Account = mongoose.model('Account');

module.exports.authenticate = (email, password, type)=>{
    return new Promise(async (resolve, reject)=>{
        try {
            const account = await Account.findOne({"email":email,"type":type}).select("+password") 
                       
            if(account == null) reject("authentication failed")
            bcrypt.compare(password, account.password, (err, match)=>{
                if(match){
                    Account.aggregate([
                      {
                        '$match': {
                          'type': account.type, 
                          'email': email
                        }
                      }, {
                        '$lookup': {
                          'from': account.type+'s', 
                          'localField': 'owner', 
                          'foreignField': '_id', 
                          'as': 'owner'
                        }
                      }, {
                        '$unwind': {
                          'path': '$owner'
                        }
                      }, {
                        '$limit': 1
                      }
                    ],(err, doc)=>{
                        if(err == null){
                            resolve(doc[0])
                        }else{
                            reject("authentication failed"+err)
                        }
                      })
                    
                }else{
                    reject("authentication failed")
                }
            });

        } catch (error) {
            reject(error+": authentication failed")
        }
    });
}