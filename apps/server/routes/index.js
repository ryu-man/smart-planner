var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(`${new Date()} - ${req.methode} request for ${req.url}`);
  res.send("/");
});

module.exports = server=>{
  server.use('/', router);
};
