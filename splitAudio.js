"use strict";

var exec = require('child_process').exec;
var dir = require('node-dir');
var path = require('path');

module.exports.split = (opt, cb) => {
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
};