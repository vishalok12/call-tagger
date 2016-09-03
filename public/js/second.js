(function() {
    $(document).ready(function(){
        $.get('/sounds').then(function(sounds) {
            fillDropdown(sounds);
        });

        // for dropdown
        $(".selectbox").click(function() {
            $(".dd-wrap").toggleClass('active');
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
        }

        wavesurfer.on('ready', function () {
            wavesurfer.play();
        });

        $('#waveform').click(function(){
            wavesurfer.playPause();
        });

        $('#sound-list').on('click', '.file', function(e) {
            let sound = $(e.currentTarget).data('value');
            genwave(sound);

            $('.sample-name').text(sound + ' keywords:')
            $('.afile-list > li').addClass('hide');
            $('.loader2').removeClass('hide');
            $('.selected-txt').text(sound).removeClass('hide');
            $('.default-txt').addClass('hide');

            let postData =  {
               "fileName": '/input/' + sound
            };

            let t = Date.now();
            $.post('/fileTag', postData).then(function(output) {
                if (Date.now() - t < 1000) {
                    return setTimeout(() => {
                        showTags(output.tags);
                    }, 2000);
                }
                // show active tags
                showTags(output.tags);
            }, function(e) {
                console.log(e);
            });
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

    function showTags(tags) {
        $('.tag').removeClass('active');
        $('.loader2').addClass('hide');

        $('.afile-list > li').removeClass('hide');

        setTimeout(() => {
            tags.map(tag => {
                $('.tag[data-value="' + tag.category + '"]').addClass('active');
            });
        }, 0);
    }
})();
