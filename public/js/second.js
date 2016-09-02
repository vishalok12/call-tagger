$(document).ready(function(){
    var wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'violet',
        progressColor: 'purple'
    });
    
    function genwave() {
        wavesurfer.load('audio/test.mp3');
    }

    wavesurfer.on('ready', function () {
        wavesurfer.play();
    });
    document.getElementById('file1').addEventListener('click', function() {
        genwave()
    });
})