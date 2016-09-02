"use strict";
let cachedFile 
try{
	cachedFile = require('./cachedResponses.json') || {}
} catch(e){
	cachedFile = {}
}
let fs = require('fs');


// cachedFile = JSON.parse(cachedFile);

module.exports.get = (key) => {
	return cachedFile[key];
}

module.exports.set = (key, value) => {
	cachedFile[key] = value;

	saveCachedFile();
}

function saveCachedFile() {
	fs.writeFile('./cachedResponses.json', JSON.stringify(cachedFile, null, 2), function(err) {
		if(err) {
			console.log('file not saved!', err);
		}
	});
}