var express = require('express');
var router = express.Router();

router.get('/:coursId', function (req,res){
    res.send('cours get '+req.params.coursId);
});
router.put('/:coursId', function (req,res){
    res.send('cours put '+req.params.coursId);
});
router.post('/:coursId', function (req,res){
    res.send('cours post '+req.params.coursId);
});

module.exports = server=>{
    server.use('/courses', router);
  };