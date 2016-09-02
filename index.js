"use strict";

const flacConverter = require('./flacConverter');
const splitAudio = require('splitAudio');
const path = require('path');
const async = require('async');

let inputFilePath = path.join(__dirname, '349633.mp3');

flacConverter.convertToFlac({inputFilePath}, (error, outFilePath) => {
	if (error) {
		console.log(error);
		process.exit(1);
	}

	console.log(outFilePath);

	splitAudio.split(outFilePath, (error, splitFilesPath) => {
		// upload each flac audios
		// async.parallel();
	})
})
