const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Model = require('../models/group');

router.get('/', (req, res, next) => {
    Model.find({},(err, data)=>{
        res.send(err==null? data: [])
    })
});
router.post('/', function (req, res, next) {
    const{group, speciality} = req.body;
    const model = new Model({group, speciality});
    model.save((err,data)=>{
        if(err == null){
            res.send("Semester added succesfully")
            return;
        }
        res.statusCode = 500
        res.send(err)
    })
});

module.exports = server => {
    server.use('/groups', router);
};

