"use strict";

const path = require('path');

require('dotenv').config({path: path.join(__dirname, '.env')});

const flacConverter = require('./flacConverter');
const splitAudio = require('./splitAudio');
const async = require('async');
const upload = require('./upload');
const recognize = require('./recognize');

const BUCKET = process.env.BUCKET;

module.exports = (config, callback) => {
	if (!config.fileName) {
		return callback(new Error('Input File missing'));
	}
	let inputFilePath = path.join(__dirname, config.fileName);
	
	flacConverter.convertToFlac({inputFilePath}, (error, outFilePath) => {
		console.log('flacConverter output', outFilePath);
		if (error) {
			console.log(error);
			//process.exit(1);
			callback(error);
			return
		}

		splitAudio.split({inputFilePath: outFilePath, duration: config.duration}, (error, splitFilesPath) => {
			if (error) {
				console.log(error);

				return process.exit(1);
			}

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
						let fileName = filePath.slice(filePath.lastIndexOf('/') + 1);
						cb(null, `gs://${BUCKET}/${fileName}`);
					});
				};
			});

			async.parallel(splitFilesUploadFnMap, (err, results) => {
				if (err) {
					console.log(err);

					process.exit(1);
				}
				recognize.flacArrayToText(results, {langCode: config.langCode} ,callback)
				// console.log(transcript, 'transcript')
				// callback(transcript)
			});
		});
	});
}

