(function() {
    var timeoutArray = []
    $(document).ready(function(){
        let soundWaveLoaded = false;
        let t;
        let tagLoaded = false;
        let outPutTags;

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

            soundWaveLoaded = false;
            wavesurfer.load('/' + file);
        }

        wavesurfer.on('ready', function () {
            soundWaveLoaded = true;
            t = Date.now();

            wavesurfer.play();

            if (tagLoaded) {
                showTags(outPutTags, 0);
            }
        });

        $('#waveform').click(function(){
            wavesurfer.playPause();
        });

        $('#sound-list').on('click', '.file', function(e) {
            let sound = $(e.currentTarget).data('value');

            tagLoaded = false;

            clearShowingTags();

            genwave(sound);

            $('.sample-name').text(sound + ' keywords:')
            // $('.afile-list > li').addClass('hide');
            // $('.loader2').removeClass('hide');
            $('.selected-txt').text(sound).removeClass('hide');
            $('.default-txt').addClass('hide');

            $('.tag').removeClass('active');

            let postData =  {
               "fileName": '/input/' + sound
            };

            $.post('/fileTag', postData).then(function(output) {
                // if (Date.now() - t < 10000) {
                //     return setTimeout(() => {
                //         showTags(output.tags);
                //     }, 10000 - (Date.now() - t));
                // }
                // show active tags

                tagLoaded = true;
                outPutTags = output.tags;

                if (soundWaveLoaded) {
                    showTags(outPutTags, Date.now() - t);
                }
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

    function clearShowingTags() {
        for(let i=0, length=timeoutArray.length;i<length;i++){
            window.clearTimeout(timeoutArray[i]);
        }

        timeoutArray.length = 0;
    }

    function showTags(tags, timeDiff) {
        // $('.loader2').addClass('hide');

        // $('.afile-list > li').removeClass('hide');

        // setTimeout(() => {
            tags.map(tag => {
                if (tag.time) {
                    timeoutArray.push(setTimeout(() => {
                        $('.tag[data-value="' + tag.category + '"]')
                            .addClass('active');
                    }, tag.time - timeDiff));
                } else {
                    $('.tag[data-value="' + tag.category + '"]')
                        .addClass('active');
                }

            });
        // }, 0);
    }
})();
