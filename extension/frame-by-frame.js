fbf = {};

fbf.FRAMES_PER_SECOND = 25;
fbf.PLAYER_ID = "movie_player";
fbf.LEFT_SQUARE_BRACKET = 219;
fbf.RIGHT_SQUARE_BRACKET = 221;
fbf.COMMA = 188;
fbf.PERIOD = 190;
fbf.P_KEY = 80;
fbf.O_KEY = 79;
var FRAMESKIP = 1;
var player = document.getElementById(fbf.PLAYER_ID);

fbf.prevFrame = function(FRAMESKIP) {
    // Based on YouTube enhancer userscript, http://userscripts.org/scripts/show/33042.
    player.pauseVideo();
    player.seekBy(-FRAMESKIP * (1/fbf.FRAMES_PER_SECOND));
}

fbf.nextFrame = function(FRAMESKIP) {
    // Based on YouTube enhancer userscript, http://userscripts.org/scripts/show/33042.
    player.pauseVideo();
    player.seekBy(FRAMESKIP * (1/fbf.FRAMES_PER_SECOND));
}

fbf.fbfPlayback = function() {
	if (player.getPlaybackRate()==0.25) {
		player.setPlaybackRate(1);
	}
	else {
		player.setPlaybackRate(0.25);
	}
}

fbf.setFrameRate = function() {
	if (fbf.FRAMES_PER_SECOND==25) {
		fbf.FRAMES_PER_SECOND = 30;
	}
	else {
		fbf.FRAMES_PER_SECOND = 25;
	}
	fbf.updateFpsAndFS();
}

fbf.multiplyFS = function(factor) {
	if (factor=="decrease" && FRAMESKIP >=2){
		FRAMESKIP/=2;
	} 
	if (factor=="increase" && FRAMESKIP <=16) {
		FRAMESKIP*=2;
	}
	fbf.updateFpsAndFS();
}
fbf.injectControls = function() {
    var controls_html = "<i class=\"icon icon-to-start\"></i><i class=\"icon icon-to-end\"></i>";
    var control_bar = document.getElementsByClassName("ytp-chrome-controls")[0];
    var fpsAndFrameskip_html = "<b>FPS:&nbsp;" + fbf.FRAMES_PER_SECOND + "</b>\
	&nbsp;&nbsp;<b> Frameskip:&nbsp;" + FRAMESKIP + "</b>";
	
    var newButtons = document.createElement('div');
    newButtons.innerHTML = controls_html;
    newButtons.style.float = 'left';
    newButtons.style['margin-top'] = '2px';
	
	var fpsAndFrameskip = document.createElement('div');
    fpsAndFrameskip.innerHTML = fpsAndFrameskip_html;
    fpsAndFrameskip.style.float = 'right';
	fpsAndFrameskip.style['margin-top'] = '2px';
	
    var child = document.getElementsByClassName('ytp-volume-hover-area')[0];

    control_bar.insertBefore(newButtons, child);
	control_bar.insertBefore(fpsAndFrameskip, child);
	
	fbf.updateFpsAndFS = function() {
		fpsAndFrameskip_html = "<b>FPS:&nbsp;" + fbf.FRAMES_PER_SECOND + "</b>\
	&nbsp;&nbsp;<b> Frameskip:&nbsp;" + FRAMESKIP + "</b>";
		fpsAndFrameskip.innerHTML = fpsAndFrameskip_html;
	}
	
    var forward_button = document.getElementsByClassName("icon-to-end")[0];
    forward_button.addEventListener('click', function() {
        fbf.nextFrame(FRAMESKIP);
    });

    var back_button = document.getElementsByClassName("icon-to-start")[0];
    back_button.addEventListener('click', function() {
        fbf.prevFrame(FRAMESKIP);
    });
}

if (document.getElementsByClassName("ytp-chrome-controls")[0]) {
    fbf.injectControls();

document.addEventListener("keydown", function(e) {
        switch(e.which) {
            case fbf.LEFT_SQUARE_BRACKET:
                fbf.prevFrame(FRAMESKIP);
                break;
            case fbf.RIGHT_SQUARE_BRACKET:
                fbf.nextFrame(FRAMESKIP);
                break;
            case fbf.COMMA:
				fbf.multiplyFS("decrease");
                break;
            case fbf.PERIOD:
				fbf.multiplyFS("increase");
				break;
            case fbf.P_KEY:
				fbf.fbfPlayback();
				break;
            case fbf.O_KEY:
				fbf.setFrameRate();
                break;
        }
    }, false);
};