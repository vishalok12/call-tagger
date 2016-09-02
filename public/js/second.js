$(document).ready(function(){
    // for dropdown
    $(".selectbox").click(function() {
        $(".dd-wrap").addClass('active');
    });

    $('html').click(function() {
        $(".dd-wrap").removeClass('active');
    });

    $('.dd-wrap').click(function(event){
        event.stopPropagation();
    });


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