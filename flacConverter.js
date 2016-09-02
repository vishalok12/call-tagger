"use strict";

var path = require('path');
var exec = require('child_process').exec;

module.exports.convertToFlac = (options, cb) => {
	console.log('called convertToFlac', options);
	options.outfileName = options.outfileName || 'output';
	let outPath = path.join(__dirname, 'out', options.outfileName + '.flac'); 
	//let cmd = `ffmpeg -y -i ${options.inputFilePath} ${outPath}`;
	let cmd = `ffmpeg -i ${options.inputFilePath} -ar 16000 -sample_fmt s16 -y ${outPath}`;
	console.log(cmd);

	exec(cmd, function(error, stdout, stderr) {
	  if (error) {
	  	console.error(error.message);

	  	return cb(error);
	  }

	  cb(null, outPath);
	});
}
