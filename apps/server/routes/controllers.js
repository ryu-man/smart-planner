var express = require('express');
var router = express.Router();
const Temperature = require('../models/temperature');
const Light = require('../models/light');
const moment = require('moment');
router.get('/', function (req,res){
    console.log(req.body)
    res.send("data recieved")
});

router.post('/', (req,res)=>{
    console.log(req.body)
    const {temperature, light} = req.body
    const date = moment().format();
    const model = new Temperature({ date, value:temperature, classroom:1 });
  model.save((err, data) => {
    res.send(err == null ? "" : err);
  });

  const mlight = new Light({ date, value:light, classroom: 1 });
  mlight.save((err, data) => {
    //res.send("light value added succesfully");
  });
  
    //res.send("data recieved")
});

module.exports = server=>{
    server.use('/controllers', router);
  };