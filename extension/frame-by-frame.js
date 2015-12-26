var fbf = {};

fbf.FRAMES_PER_SECOND = 25;
fbf.PLAYER_ID = "movie_player";
fbf.LEFT_SQUARE_BRACKET = 219;
fbf.RIGHT_SQUARE_BRACKET = 221;
fbf.COMMA = 188;
fbf.PERIOD = 190;
fbf.P_KEY = 80;
fbf.O_KEY = 79;
fbf.BACKSLASH_KEY = 220;
var frameskip = 1;
var hotkeys = true;
var player = document.getElementById(fbf.PLAYER_ID);
var pbar = document.getElementsByClassName("ytp-progress-bar")[0];
var control_bar = document.getElementsByClassName("ytp-chrome-controls")[0];
var shadow = document.getElementsByClassName("ytp-gradient-bottom")[0];
var header = document.getElementById("watch-header");
var controlsToggle = 0;

fbf.prevFrame = function(frameskip) {
    // Based on YouTube enhancer userscript, http://userscripts.org/scripts/show/33042.
    player.pauseVideo();
    player.seekBy(-frameskip * (1/fbf.FRAMES_PER_SECOND));
}

fbf.nextFrame = function(frameskip) {
    // Based on YouTube enhancer userscript, http://userscripts.org/scripts/show/33042.
    player.pauseVideo();
    player.seekBy(frameskip * (1/fbf.FRAMES_PER_SECOND));
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
	if (factor=="decrease" && frameskip >=2){
		frameskip/=2;
	} 
	if (factor=="increase" && frameskip <=16) {
		frameskip*=2;
	}
	fbf.updateFpsAndFS();
}

fbf.hideControls= function() {
	if (controlsToggle==0) {
	pbar.style.visibility="hidden";
	control_bar.style.visibility="hidden";
	shadow.style.visibility="hidden";
	controlsToggle = 1;
	} else {
	pbar.style.visibility="visible";
	control_bar.style.visibility="visible";
	shadow.style.visibility="visible";
	controlsToggle = 0;
	}
}

fbf.injectControls = function() {
    var controls_html = "<i class=\"icon icon-to-start\"></i><i class=\"icon icon-to-end\"></i>";
    var fpsAndframeskip_html = "<b>FPS:&nbsp;" + fbf.FRAMES_PER_SECOND + "</b>\
	&nbsp;&nbsp;<b>Frameskip:&nbsp;" + frameskip + "</b>";
	var hotkeysButton_html = "<i class=\"icon icon-for-hotkeys-menu\"></i>";
		
    var newButtons = document.createElement('div');
    newButtons.innerHTML = controls_html;
    newButtons.style.float = 'left';
    newButtons.style['margin-top'] = '2px';
	
	var hotkeysButton = document.createElement('div');
    hotkeysButton.innerHTML = hotkeysButton_html;
    hotkeysButton.style.float = 'right';
	hotkeysButton.style['margin-top'] = '2px';
	
	var fpsAndframeskip = document.createElement('div');
    fpsAndframeskip.innerHTML = fpsAndframeskip_html;
    fpsAndframeskip.style.float = 'right';
	fpsAndframeskip.style['margin-top'] = '2px';
	
    var child = document.getElementsByClassName('ytp-volume-hover-area')[0];
	
    control_bar.insertBefore(newButtons, child);
	control_bar.insertBefore(hotkeysButton, child);
	control_bar.insertBefore(fpsAndframeskip, child);
	
	fbf.updateFpsAndFS = function() {
		fpsAndframeskip_html = "<b>FPS:&nbsp;" + fbf.FRAMES_PER_SECOND + "</b>\
		&nbsp;&nbsp;<b>Frameskip:&nbsp;" + frameskip + "</b>";
		fpsAndframeskip.innerHTML = fpsAndframeskip_html;
	}
	
    var forward_button = document.getElementsByClassName("icon-to-end")[0];
    forward_button.addEventListener('click', function() {
        fbf.nextFrame(frameskip);
    });

    var back_button = document.getElementsByClassName("icon-to-start")[0];
    back_button.addEventListener('click', function() {
        fbf.prevFrame(frameskip);
    });
	
	hotkeysButton.addEventListener('click', function(){
		newwindow=window.open("http://codepen.io/regularWand/full/eJdVep\
		","name","height=475, width=467, top=125");
		if (window.focus) {newwindow.focus()}
	});
	
	//attempted solution to hotkey lockout after using alt + mousewheel to frame skip
	/*document.addEventListener('keyup', function(e) {
		if (e.which==18) {
			window.setTimeout(forward_button.click(), 200);
			console.log("called");
		}
	});*/
}

if (document.getElementsByClassName("ytp-chrome-controls")[0]) {
    fbf.injectControls();
	
	document.addEventListener("keydown", function(e) {
	if (hotkeys) {
			switch(e.which) {
				case fbf.LEFT_SQUARE_BRACKET:
					fbf.prevFrame(frameskip);
					break;
				case fbf.RIGHT_SQUARE_BRACKET:
					fbf.nextFrame(frameskip);
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
				case fbf.BACKSLASH_KEY:
					fbf.hideControls();
					break;
			}
		}
	  }, false);

	document.addEventListener('wheel', function(e) {
		if (e.deltaY < 0 && e.altKey && e.pageX >= window.innerWidth/2) {
			fbf.nextFrame(frameskip);
		}
		if (e.deltaY < 0 && e.altKey && e.pageX < window.innerWidth/2) {
			fbf.prevFrame(frameskip);
		}
	});

	var search = document.getElementById("masthead-search-term");
	search.addEventListener("focus", function(e) {
		hotkeys = false;
	});
	search.addEventListener("blur", function(e) {
		hotkeys = true;
	});

	var comment = document.getElementById("watch-discussion");
	comment.addEventListener("focus", function(e) {
		hotkeys = false;
	}, true);
	comment.addEventListener("blur", function(e) {
		hotkeys = true;
	}, true);
};