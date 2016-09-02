var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Call Tagger - PROPTIGER HACKATHON 2016 - THE GAME OF HACKS' });
});

/* GET second page. */
router.get('/second', function(req, res, next) {
  res.render('second', { title: 'Call Tagger - PROPTIGER HACKATHON 2016 - THE GAME OF HACKS' });
});

module.exports = router;
