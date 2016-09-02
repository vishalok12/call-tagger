"use strict";

var path = require('path');
var exec = require('child_process').exec;
var cmd = 'ffmpeg -i ~/split.mp3 ~/output.flac';

module.exports.convertToFlac = (options, cb) => {
	options.outfileName = options.outfileName || 'output';
	let outPath = path.join(__dirname, 'out', options.outfileName + '.flac'); 
	let cmd = `ffmpeg -i ${options.inputFilePath} ${outPath}`;

	exec(cmd, function(error, stdout, stderr) {
	  if (error) {
	  	console.error(error.message);

	  	cb(error);
	  }

	  cb(null, outPath);
	});
}
