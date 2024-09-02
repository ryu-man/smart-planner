const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/:userId', function(req, res, next) {
  res.send('user get '+req.params.userId);
});
router.put('/:userId', function(req, res) {
  res.send('user put '+req.params.userId)
});
router.post('/:userId/',function(req, res){
  res.send('user post '+req.params.userId);
});

module.exports = server=>{
  server.use('/users', router);
};

