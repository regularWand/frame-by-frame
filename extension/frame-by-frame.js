frameByFrame = function() {
	var fbf = {};
	fbf.FRAMES_PER_SECOND = 25;
	fbf.PLAYER_ID = "movie_player";
	fbf.LEFT_SQUARE_BRACKET = 219;
	fbf.RIGHT_SQUARE_BRACKET = 221;
	fbf.COMMA = 188;
	fbf.PERIOD = 190;
	fbf.P_KEY = 80;
	fbf.O_KEY = 79;
	fbf.BACKSLASH = 220;
	fbf.APOSTROPHE = 222;
	
	var frameskip = 1;
	var hotkeys = true;
	var sessionToggle = true;
	var controlsToggle = false;
	var fbfPlayback = true;
	var fbfForward;
	var fbfReverse;
	var frameWindow;
	var continueCapture = false;
	var imageURL = [];
	var imageURLCounter = 0;
	var frameNumberSaved = 0;
	var player = document.getElementById(fbf.PLAYER_ID);
	var header = document.getElementById("watch-header");
	
	fbf.prevFrame = function() {
		// Based on YouTube enhancer userscript, http://userscripts.org/scripts/show/33042.
		player.pauseVideo();
		player.seekBy(-frameskip * (1/fbf.FRAMES_PER_SECOND));
	}

	fbf.nextFrame = function() {
		// Based on YouTube enhancer userscript, http://userscripts.org/scripts/show/33042.
		player.pauseVideo();
		player.seekBy(frameskip * (1/fbf.FRAMES_PER_SECOND));
	}

	fbf.fbfPlayback = function() {
		if (player.getPlaybackRate()===0.25) {
			player.setPlaybackRate(1);
		}
		else {
			player.setPlaybackRate(0.25);
		}
	}

	fbf.setFrameRate = function() {
		if (fbf.FRAMES_PER_SECOND===25) {
			fbf.FRAMES_PER_SECOND = 30;
		}
		else {
			fbf.FRAMES_PER_SECOND = 25;
		}
		fbf.updateFpsAndFS();
	}

	fbf.multiplyFS = function(factor) {
		if (factor==="decrease" && frameskip >=2){
			frameskip/=2;
		} 
		if (factor==="increase" && frameskip <=16) {
			frameskip*=2;
		}
		fbf.updateFpsAndFS();
	}
	
	fbf.getVideoTime = function(video) {
		var videoCurrentTime = document.getElementsByClassName("ytp-time-current")[0].innerHTML;
		var videoDuration = document.getElementsByClassName("ytp-time-duration")[0].innerHTML;
		var videoTime = videoCurrentTime + "/" + videoDuration;
		//TODO: Add calculation for current frame number
		return videoTime;
	}
	
	//The following three functions work together to toggle the video controls
	fbf.controlsVisibility = function(visibility) {
		if (!brand) {
			var brand = document.getElementsByClassName("iv-branding")[0];
		}
		pbar.style.visibility=visibility;
		control_bar.style.visibility=visibility;
		shadow.style.visibility=visibility;
		if (brand) {
			brand.style.visibility=visibility;
		}
	}
	
	//Ensures player control elements are visible after
	//navigating Youtube via session links. Anything else that needs to be
	//reset when following session links could go here
	fbf.addSessionLinkListeners = function() {
		var sessionlink = document.getElementsByClassName("yt-uix-sessionlink");
			for (var i = 0; i < sessionlink.length; i++) {
				sessionlink[i].addEventListener("mouseup", function() {
					fbf.controlsVisibility("visible");
					controlsToggle = false;
					sessionToggle = true;
					
					fbf.resetIntervals();
					
					var frameWindow;
				});
			}
	}
	
	var shadow = document.getElementsByClassName("ytp-gradient-bottom")[0];
	var pbar = document.getElementsByClassName("ytp-progress-bar")[0];
	fbf.toggleControls = function() {
		if (!controlsToggle) {
			fbf.controlsVisibility("hidden");
			if (sessionToggle) {
				fbf.addSessionLinkListeners();
				sessionToggle = false;
			}
			controlsToggle = true;
		} else {
			fbf.controlsVisibility("visible");
			controlsToggle = false;
		}
	}
	
	//The following three functions work together to capture and save video frames
	
	//https://gist.github.com/kosso/4246840
	function dataURItoBlob(dataURI) {
		var binary = atob(dataURI.split(',')[1]);
		var array = [];
		for(var i = 0; i < binary.length; i++) {
			array.push(binary.charCodeAt(i));
		}
    return new Blob([new Uint8Array(array)], {type: 'image/png'});
	}
	
	fbf.drawFrame = function(video) {
		var w = video.videoWidth
		var h = video.videoHeight
		var canvas = document.createElement("canvas");
			canvas.width = w;
			canvas.height = h;
		var ctx = canvas.getContext("2d");
			ctx.drawImage(video, 0, 0, w, h);
		return canvas;
	}
	
	fbf.saveFrame = function(imageURL) {
		for (var i = 0; i < imageURL.length; i++) {
			var a = document.createElement("a");
			a.href = imageURL[i];
			a.download = "Frame_" + i;
			a.click();
		}
	}
	
	fbf.captureFrame = function() {
			var video = document.getElementsByClassName("html5-main-video")[0];
			var canvas = fbf.drawFrame(video);
			//https://code.google.com/p/chromium/issues/detail?id=67587
			var dataURL = canvas.toDataURL();
			var blob = dataURItoBlob(dataURL);
			//https://jsfiddle.net/Jan_Miksovsky/yy7Zs/
			if (frameWindow && frameWindow.closed) {
				imageURL = [];
				frameNumberSaved = 0;
			}
			var urlCreator = window.URL || window.webkitURL;
			imageURL[frameNumberSaved] = urlCreator.createObjectURL(blob);
			var bodyHtml = "<div class=\"frame-div\"><strong><figcaption class=\"fig-caption\">Frame \
			" + frameNumberSaved + " captured at " + fbf.getVideoTime(video) + "\
			</figcaption><strong><img src=\"" + imageURL[frameNumberSaved] + "\"></div>";
		if (!frameWindow || frameWindow.closed) {
			player.pauseVideo();
			frameWindow = window.open("", "Frame Captured");
			var headHtml = "<head><style>.frame-div { font-family: \"Trebuchet MS\", Arial,\
			Helvetica, sans-serif; background-color: rgb(179,0,0); padding: 5px;\
			border-style: solid; border-width: 2px; width: -webkit-fit-content} .fig-caption\
			{color: rgb(240,240,240);} ::-webkit-scrollbar {width: 6px;height: 6px;}\
			::-webkit-scrollbar-button {width: 0px;height: 0px;}::-webkit-scrollbar-thumb\
			{background: #e1e1e1;border: 0px none #ffffff;border-radius: 50px;}\
			::-webkit-scrollbar-corner {background: transparent;}<head><style>";
			frameWindow.document.head.innerHTML = headHtml;
			frameWindow.document.body.outerHTML = "<body style=\"margin: 0px;\">" + bodyHtml + "</body>";
			frameNumberSaved++;
		} else {
			frameWindow.document.body.innerHTML += bodyHtml;
			frameNumberSaved++;
		}
	}
	
	fbf.injectControls = function() {
		var controls_html = "<i class=\"icon icon-to-start\"></i><i class=\"icon icon-to-end\"></i>";
		control_bar = document.getElementsByClassName("ytp-chrome-controls")[0];
		var fpsAndframeskip_html = "<strong>FPS:&nbsp;" + fbf.FRAMES_PER_SECOND + "</strong>\
		&nbsp;&nbsp;<strong>Frameskip:&nbsp;" + frameskip + "</strong>";
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
			fpsAndframeskip_html = "<strong>FPS:&nbsp;" + fbf.FRAMES_PER_SECOND + "</strong>\
			&nbsp;&nbsp;<strong>Frameskip:&nbsp;" + frameskip + "</strong>";
			fpsAndframeskip.innerHTML = fpsAndframeskip_html;
		}
		
		var forward_button = document.getElementsByClassName("icon-to-end")[0];
		forward_button.addEventListener('click', function() {
			fbf.nextFrame();
		});

		var back_button = document.getElementsByClassName("icon-to-start")[0];
		back_button.addEventListener('click', function() {
			fbf.prevFrame();
		});
		
		hotkeysButton.addEventListener('click', function(){
			newwindow = window.open("http://codepen.io/regularWand/full/eJdVep\
			","name","height=510, width=467, top=125");
			if (window.focus) {newwindow.focus()}
		});
	}

	fbf.resetIntervals = function() {
		if (fbfForward) {
			clearInterval(fbfForward);
		}
		if (fbfReverse) {
			clearInterval(fbfReverse);
		}
		fbfPlayback = true;
	}
	
	fbf.fbfInterval = function(direction) {
		if (fbfPlayback===true) {
			if (direction==="reverse") {
				fbfReverse = setInterval(fbf.prevFrame, 500);
			} else if (direction==="forward") {
				fbfForward = setInterval(fbf.nextFrame, 500);
			}
			fbfPlayback = false;
			if (sessionToggle) {
				fbf.addSessionLinkListeners();
				sessionToggle = false;
			}
		} else {
			fbf.resetIntervals();
		}
	}
	
	if (document.getElementsByClassName("ytp-chrome-controls")[0]) {
		fbf.injectControls();
		
		document.addEventListener("keydown", function(e) {
			if (hotkeys) {
				switch(e.which) {
					case !e.altKey && fbf.LEFT_SQUARE_BRACKET:
						fbf.prevFrame();
						break;
					case !e.altKey && fbf.RIGHT_SQUARE_BRACKET:
						fbf.nextFrame();
						break;
					case e.altKey && fbf.LEFT_SQUARE_BRACKET:
						fbf.fbfInterval("reverse");
						break;
					case e.altKey && fbf.RIGHT_SQUARE_BRACKET:
						fbf.fbfInterval("forward");
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
					case fbf.BACKSLASH:
						fbf.toggleControls();
						break;
					case !e.altKey && fbf.APOSTROPHE:
						fbf.captureFrame();
						break;
					case e.altKey && fbf.APOSTROPHE:
						fbf.saveFrame(imageURL);
						break;
				}
			}
		  }, false);

		document.addEventListener('wheel', function(e) {
			if (e.deltaX < 0 && e.shiftKey && e.pageX >= window.innerWidth/2) {
				fbf.nextFrame();
			}
			if (e.deltaX < 0 && e.shiftKey && e.pageX < window.innerWidth/2) {
				fbf.prevFrame();
			}
		});

		//The following two event listeners disable the hotkeys
		//when input fields on a video page have focus
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
}

var spfDataName = document.getElementById("body").getAttribute("data-spf-name");

if (spfDataName==="watch") {
	frameByFrame();
} else {
	addSessionLinkListeners = function() {
		var sessionlink = document.getElementsByClassName("yt-uix-sessionlink");
			for (var i = 0; i < sessionlink.length; i++) {
				sessionlink[i].addEventListener("mouseup", function() {
				frameByFrame();
				});
			}
		}
	addSessionLinkListeners();
}