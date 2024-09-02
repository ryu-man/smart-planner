const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Model = require('../models/speciality');

router.get('/', (req, res, next) => {
    Model.find({},(err, data)=>{
        if(err == null){
            res.send(data)
            return;
        }
        res.statusCode = 500
        res.send(err)
    })
});
router.post('/', function (req, res, next) {
    const{level, name} = req.body;
    const model = new Model({level, name, "abbr":name});
    model.save((err,data)=>{
        res.send(err==null? "Semester added succesfully": err)
    })
});

module.exports = server => {
    server.use('/specialities', router);
};

