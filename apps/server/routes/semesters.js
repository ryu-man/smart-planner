const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Model = require('../models/semester');

router.get('/', (req, res, next) => {
    Model.find({},(err, data)=>{
        res.send(err==null? data: [])
    })
});
router.post('/', function (req, res, next) {
    const{year, semester} = req.body;
    const model = new Model({year, semester});
    model.save((err,data)=>{
        res.send(err==null? "Semester added succesfully": err)
    })
});

module.exports = server => {
    server.use('/semesters', router);
};

