fbf = {};

fbf.FRAMES_PER_SECOND = 25;
fbf.PLAYER_ID = "movie_player"
fbf.LEFT_SQUARE_BRACKET = 219;
fbf.RIGHT_SQUARE_BRACKET = 221;
fbf.commaKey = 188;
fbf.periodKey = 190;
var frameSkip = 1;

fbf.prevFrame = function(frameSkip) {
    // Based on YouTube enhancer userscript, http://userscripts.org/scripts/show/33042.
    player = document.getElementById(fbf.PLAYER_ID);
    player.pauseVideo();
    player.seekBy(-frameSkip * (1/fbf.FRAMES_PER_SECOND));
}

fbf.nextFrame = function(frameSkip) {
    // Based on YouTube enhancer userscript, http://userscripts.org/scripts/show/33042.
    player = document.getElementById(fbf.PLAYER_ID);
    player.pauseVideo();
    player.seekBy(frameSkip * (1/fbf.FRAMES_PER_SECOND));
}


fbf.injectControls = function() {
    var controls_html = "<i class=\"icon icon-to-start\"></i> <i class=\"icon icon-to-end\"></i>";
    var control_bar = document.getElementsByClassName("html5-player-chrome")[0];
    
    var newButtons = document.createElement('div');
    newButtons.innerHTML = controls_html;
    newButtons.style.float = 'left';

    var child = document.getElementsByClassName('ytp-volume-hover-area')[0];

    control_bar.insertBefore(newButtons, child);

    var forward_button = document.getElementsByClassName("icon-to-end")[0];
    forward_button.addEventListener('click', function() {
        fbf.nextFrame(frameSkip);
    });

    var back_button = document.getElementsByClassName("icon-to-start")[0];
    back_button.addEventListener('click', function() {
        fbf.prevFrame(frameSkip);
    });
}

if (document.getElementsByClassName("html5-player-chrome")[0]) {
    fbf.injectControls();

    document.addEventListener("keydown", function(e) {
        switch(e.which) {
            case fbf.LEFT_SQUARE_BRACKET:
                fbf.prevFrame(frameSkip);
                break
            case fbf.RIGHT_SQUARE_BRACKET:
                fbf.nextFrame(frameSkip);
                break
		    case fbf.commaKey:
				if (frameSkip >=2){
					frameSkip=frameSkip/2;
				}
                break
            case fbf.periodKey:
				if (frameSkip <=32){
					frameSkip=frameSkip*2;
				}
                break;
        }
    }, false);
};