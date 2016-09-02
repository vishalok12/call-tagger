(function() {
    $(document).ready(function(){
        $.get('/sounds').then(function(sounds) {
            fillDropdown(sounds);
        });

        // for dropdown
        $(".selectbox").click(function() {
            $(".dd-wrap").addClass('active');
        });

        // $('html').click(function() {
        //     $(".dd-wrap").removeClass('active');
        // });

        $('.dd-wrap').click(function(event){
            event.stopPropagation();
        });


        var wavesurfer = WaveSurfer.create({
            container: '#waveform',
            waveColor: 'violet',
            progressColor: 'purple'
        });
        
        function genwave(file) {
            $(".dd-wrap").removeClass('active');

            wavesurfer.load('/' + file);

            let postData =  {
               "fileName": '/input/' + file
            };

            $.post('/fileTag', postData).then(function(output) {
                console.log(output);
            }, function(e) {
                console.log(e);
            })
        }

        wavesurfer.on('ready', function () {
            wavesurfer.play();
        });

        $('#waveform').click(function(){
            wavesurfer.playPause();
        });

        $('#sound-list').on('click', '.file', function(e) {
            let sound = $(e.target).data('value');

            genwave(sound);
        });
    });

    function fillDropdown(soundList) {
        let $lists = $();

        soundList.map(function(sound, index) {
            let $li = $('<li class="file clearfix" id="file-' + index + '" data-value="' + sound + '">');
            $li.append($('<span class="file-name">').text(sound));
            $li.append($('<span class="process" title="start processing">')
                .append($('<i class="fa fa-play">')));

            $lists = $lists.add($li);
        });

        $('#sound-list').append($lists);
    }
})();
