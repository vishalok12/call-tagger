"use strict";

var exec = require('child_process').exec;
var dir = require('node-dir');
var path = require('path');
var mkdirp = require('mkdirp');

module.exports.split = (opt, cb) => {
	mkdirp(path.join(__dirname, 'splitOut'), err => {
		if (err) {
			console.log(err);
			return process.exit(1);
		}

		let options = Object.assign({duration: 10}, opt);
		let audioExtension = opt.inputFilePath.split('.')[1];
		let cmd = `ffmpeg -i ${options.inputFilePath} -f segment -segment_time ${options.duration} -c copy splitOut/out%03d.${audioExtension}`;

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
	
};