"use strict";

var exec = require('child_process').exec;

module.exports.split = (options) => {
	options.duration = options.duration || 10;	
	let cmd = `ffmpeg -i ${options.inputFilePath} -f segment -segment_time ${options.duration} -c copy out%03d.m4a`;

	exec(cmd, function(error, stdout, stderr) {
	  if (error) {
	  	console.error(error.message);

	  	cb(error);
	  }

	  cb(null, outPath);
	});
};