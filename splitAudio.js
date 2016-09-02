"use strict";

var exec = require('child_process').exec;
var dir = require('node-dir');
var path = require('path');
var mkdirp = require('mkdirp');

const DEFAULT_DURATION = parseInt(process.env.SPLIT_DURATION || 5);

module.exports.split = (opt, cb) => {
	let splitOutPath = path.join(__dirname, 'splitOut');
	exec(`rm -rf ${splitOutPath}/*`, (err) => {
		if (err) {
			return cb(err);
		}
		mkdirp(splitOutPath, err => {
			if (err) {
				return cb(err);
			}

			let duration = opt.duration || DEFAULT_DURATION;

			console.log(duration);

			let options = Object.assign({duration: duration}, opt);


			let audioExtension = opt.inputFilePath.split('.')[1];
			let cmd = `ffmpeg -i ${options.inputFilePath} -f segment -segment_time ${duration} -c copy splitOut/out%03d.${audioExtension}`;

			console.log('split', options);

			exec(cmd, function(error, stdout, stderr) {
			  if (error) {
			  	console.error(error.message);

			  	return cb(error);
			  }

			  // get all files
			  dir.files(path.join(__dirname, 'splitOut'), cb);
			});
		})
	})
	
	
};