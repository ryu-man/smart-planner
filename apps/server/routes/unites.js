const express = require('express');
const router = express.Router();
const Unite = require('../models/unite')

/* GET users listing. */
router.get('/', function(req, res, next) {
    Unite.find({},(err, data)=>{
        if (err==null) {
            res.send(data)
        } else {
            res.send(err)
        }
    })
});
router.put('/', function(req, res) {
  res.send('user put '+req.params.userId)
});
router.post('/',function(req, res){
  const { name, speciality, type } = req.body
  const unite = new Unite({name, speciality, type})
  unite.save((err, doc)=>{
      if(err==null){
        res.statusCode = 200
        res.send()
      }else{
        res.statusCode = 403
        res.send()
      }
  })
});

module.exports = server=>{
  server.use('/unites', router);
};

