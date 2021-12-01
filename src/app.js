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


/**
 * App init (player + controls)
 */
function initApp() {
    // shaka.log.setLevel(shaka.log.Level.DEBUG);
    shaka.polyfill.installAll();
    if (shaka.Player.isBrowserSupported()) {
        initPlayer().then((player) => {
            initControls(player);
            setTimeout(() => {
                player.getMediaElement().play()
            }, 2000)
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

    // if(!volumeButton.firstElementChild.classList.contains('fa' + level)){
        volumeButton.firstElementChild.classList.remove('fa-volume')
        volumeButton.firstElementChild.classList.remove('fa-volume-low')
        volumeButton.firstElementChild.classList.remove('fa-volume-high')
        volumeButton.firstElementChild.classList.remove('fa-volume-xmark')
        volumeButton.firstElementChild.classList.add('fa-' + level)
    // }
}


/**
 * Init player controls
 * @param player
 */
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
        languageSelectorButton: document.getElementById('caption-language-selection'),
        languageSelectionContainer: document.querySelector('#language-selection-container'),
        audioLanguageList: document.querySelector('#language-selection-container #audio-container>ul'),
        textLanguageList: document.querySelector('#language-selection-container #text-container>ul'),

    }

    controls.contentTitleContainer.textContent = 'Tears of Steel'
    updateVolumeIcon(controls.volumeButton)

    /**
     * set subtitles lang
     */
    player.getAudioLanguages().forEach(lang => {
        const langElement = document.createElement('li');
        langElement.appendChild(document.createTextNode(lang))
        controls.audioLanguageList.appendChild(langElement);

    })

    player.getTextLanguages().forEach(lang => {
        const langElement = document.createElement('li');
        langElement.appendChild(document.createTextNode(lang))
        controls.textLanguageList.appendChild(langElement);
    })

    /**
     * Language selection layer
     */
    controls.languageSelectorButton.addEventListener('click', (event) => {
        controls.languageSelectionContainer.classList.toggle('hidden')
    })

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
    let videoBuffered = 0;
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
                resolve(player)
            })
            .catch((error) => {
                reject(error);
            });
    })
}

function onErrorEvent(event) {
    onError(event.detail);
}

function onError(error) {
    // Log the error.
    console.error('Error code', error.code, 'object', error);
}


window.addEventListener("DOMContentLoaded", (event) => {
    initApp();
});