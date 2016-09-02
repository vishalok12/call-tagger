var exec = require('child_process').exec;
var cmd = 'ffmpeg -i ~/split.mp3 ~/output.flac';

exec(cmd, function(error, stdout, stderr) {
  if (error) {
  	console.error(error.message);
  }
});
