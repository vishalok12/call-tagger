"use strict";

const express = require('express'),
	router = express.Router(),
	getTagForAudio = require('../index'),
	cachedResponses = require('../cachedResponses'),
	dir = require('node-dir'),
	path = require('path'),
	categoryMap = require('../categoryMap');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Audio Sense - PROPTIGER HACKATHON 2016 - THE GAME OF HACKS' });
});

/* GET second page. */
router.get('/second', function(req, res, next) {
  res.render('second', {
  	title: 'Audio Sense - PROPTIGER HACKATHON 2016 - THE GAME OF HACKS',
  	categories: Object.keys(categoryMap)
  });
});

let inputFiles;
router.get('/sounds', function(req, res) {
	if (inputFiles) {
		return res.send(inputFiles);
	}
	dir.files(path.join(__dirname, '..', 'input'), function(error, files) {
		if (error) {
			return res.status(500).send({message: error.message});
		}
		inputFiles = files
			.filter(file => (file.indexOf('m4a')>-1||file.indexOf('mp3')>-1||file.indexOf('flac') > -1))
			.map(file => file.slice(file.lastIndexOf('/') + 1));

		return res.send(inputFiles);
	});
})

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
