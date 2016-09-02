"use strict";

const path = require('path');

require('dotenv').config({path: path.join(__dirname, '.env')});

const flacConverter = require('./flacConverter');
const splitAudio = require('./splitAudio');
const async = require('async');
const upload = require('./upload');

const BUCKET = process.env.BUCKET;

let inputFilePath = path.join(__dirname, '349633.mp3');

flacConverter.convertToFlac({inputFilePath}, (error, outFilePath) => {
	console.log('flacConverter output', outFilePath);
	if (error) {
		console.log(error);
		process.exit(1);
	}

	console.log(outFilePath);

	splitAudio.split({inputFilePath: outFilePath}, (error, splitFilesPath) => {
		// upload each flac audios

		let splitFilesUploadFnMap = splitFilesPath.map(filePath => {
			return cb => {
				upload({
			  		bucket: BUCKET,
			  		srcFile: filePath
				}, (err, file) => {
					if (err) {
						return cb(err);
					}
					cb(null, `gs://${BUCKET}/${filePath}`);
				});
			};
		});

		async.parallel(splitFilesUploadFnMap, (err, results) => {
			console.log(results);
		});
	});
});
