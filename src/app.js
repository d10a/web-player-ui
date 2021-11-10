String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}
// ---------------------------------------------------------------------

const manifestUri = 'https://storage.googleapis.com/shaka-demo-assets/tos-ttml/dash.mpd';
// const manifestUri = 'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd';

function initApp() {
    shaka.polyfill.installAll();
    if (shaka.Player.isBrowserSupported()) {
        initPlayer().then((player) => {
            initControls(player);
        });
    } else {
        // This browser does not have the minimum set of APIs we need.
        console.error('Browser not supported!');
    }
}

function updateVolumeIcon(volumeButton){
    let level = null;
    if(player.getMediaElement().volume > 0.5){
        level = 'volume-high';
    }
    if(player.getMediaElement().volume <= 0.5){
        level = 'volume-low';
    }
    if(player.getMediaElement().volume === 0){
        level = 'volume-xmark';
    }
    console.log(level, player.getMediaElement().volume)
    // if(!volumeButton.firstElementChild.classList.contains('fa' + level)){
        volumeButton.firstElementChild.classList.remove('fa-volume')
        volumeButton.firstElementChild.classList.remove('fa-volume-low')
        volumeButton.firstElementChild.classList.remove('fa-volume-high')
        volumeButton.firstElementChild.classList.remove('fa-volume-xmark')
        volumeButton.firstElementChild.classList.add('fa-' + level)
    // }
}

function initControls(player){
    const playerContainer = document.querySelector('#web-player-container')
    const controlsContainer = document.querySelector('#controls-container')
    const controls = {
        contentTitleContainer: document.querySelector('#content-title'),
        playPauseButton: document.getElementById('play-pause-button'),
        volumeButton: document.getElementById('volume'),
        toggleFullscreenButton: document.getElementById('fullscreen'),
        forwardButton: document.getElementById('forward'),
        backwardButton: document.getElementById('backward'),
        timeline: document.getElementById('timeline'),
        currentTime: document.getElementById('current-time'),
        languageSelector: document.getElementById('caption-language-selection'),
    }

    controls.contentTitleContainer.textContent = 'Mon super film'
    // controls.contentDurationContainer.textContent = parseInt(player.getMediaElement().duration).toString().toHHMMSS()

    updateVolumeIcon(controls.volumeButton)

    /**
     * set subtitles lang
     */
    const audioLanguages = player.getAudioLanguages()
    const textLanguages = player.getTextLanguages()

    console.log(audioLanguages)
    console.log(textLanguages)

    /**
     * Language selection layer
     */


    /**
     * show controls
     */
    playerContainer.addEventListener('mousemove', (event) => {
        controlsContainer.classList.remove('hidden')
    })
    playerContainer.addEventListener('mouseleave', (event) => {
        controlsContainer.classList.add('hidden')
    })

    /**
     * On volume change
     */
    player.getMediaElement().addEventListener('volumechange', (event) => {
        updateVolumeIcon(controls.volumeButton)
    })

    /**
     * Mute volume
     */
    const backupVolumeLevel = player.getMediaElement().volume;
    controls.volumeButton.addEventListener('click', () => {
        player.getMediaElement().volume = (player.getMediaElement().volume === 0)
            ? backupVolumeLevel
            : 0;
    })

    /**
     * Display duration
     */
    let videoPercent = 0;
    player.getMediaElement().addEventListener('timeupdate', (event) => {
        controls.currentTime.innerText = parseInt(player.getMediaElement().currentTime).toString().toHHMMSS();

        videoPercent = (player.getMediaElement().currentTime / player.getMediaElement().duration) * 100;
        videoBuffered = (player.getBufferedInfo().total[0].end / player.getMediaElement().duration) * 100;
        document.documentElement.style.setProperty('--buffered-position', videoBuffered + '%');
        document.documentElement.style.setProperty('--timeline-position', videoPercent + '%');

    })

    /**
     * click Play / Pause button
     */
    controls.playPauseButton.addEventListener('click', (event) => {
        if(player.getMediaElement().paused){
            controls.playPauseButton.firstElementChild.classList.remove('fa-play')
            controls.playPauseButton.firstElementChild.classList.add('fa-pause')
            player.getMediaElement().play();
            //hide controls
            setTimeout(() => {
                controlsContainer.classList.add('hidden')
            }, 5000)
        }else{
            controls.playPauseButton.firstElementChild.classList.remove('fa-pause')
            controls.playPauseButton.firstElementChild.classList.add('fa-play')
            player.getMediaElement().pause();
        }


    });

    /**
     * Toggle Fullscreen
     */
    controls.toggleFullscreenButton.addEventListener('click', (event) => {
        if (!document.fullscreenElement) {
            playerContainer.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    })



    /**
     * Forward 10 seconds
     */
    controls.forwardButton.addEventListener('click', (event) => {
            player.getMediaElement().currentTime += 50;
    });

    /**
     * Backward 10 seconds
     */
    controls.backwardButton.addEventListener('click', (event) => {
            player.getMediaElement().currentTime -= 10;
    });
}

function initPlayer() {
    return new Promise((resolve, reject) => {
        // Create a Player instance.
        const video = document.getElementById('web-player');
        const player = new shaka.Player(video);

        // Attach player to the window to make it easy to access in the JS console.
        window.player = player;

        // Listen for error events.
        player.addEventListener('error', onErrorEvent);

        player.load(manifestUri)
            .then(() => {
                console.log('player ok man')
                resolve(player)
            })
            .catch((error) => {
                reject(error);
            });
    })
}

function onErrorEvent(event) {
    // Extract the shaka.util.Error object from the event.
    onError(event.detail);
}

function onError(error) {
    // Log the error.
    console.error('Error code', error.code, 'object', error);
}


window.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM entièrement chargé et analysé");
    initApp();
});