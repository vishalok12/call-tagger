"use strict";

const express = require('express'),
	router = express.Router(),
	getTagForAudio = require('../index'),
	cachedResponses = require('../cachedResponses');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Call Tagger - PROPTIGER HACKATHON 2016 - THE GAME OF HACKS' });
});

/* GET second page. */
router.get('/second', function(req, res, next) {
  res.render('second', { title: 'Call Tagger - PROPTIGER HACKATHON 2016 - THE GAME OF HACKS' });
});

router.post('/fileTag', function (req, res) {
	console.log(req.body, "req.body");
	let key = req.body.fileName;

	let value;

	let cache = process.env.CACHE == 'false' ? false : true;

	if (cache && (value = cachedResponses.get(key))) {
		console.log('returning from cache');

		return res.send(value);
	}

	getTagForAudio({fileName: key, duration: req.body.duration, langCode: req.body.langCode}, (err, response) => {
		if(err){
			console.log(err, "err")
			return res.status(500).send({message: err.message})
		}

		cachedResponses.set(key, response);
		res.send(response);
	});
})

module.exports = router;
