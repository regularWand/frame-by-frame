//Bug when following session link automatically when idle on invalid video (blocked etc)
//the span innerhtml of the current time doesnt update when hidden
frameByFrame = function() {
	var fbf = {};
		fbf.FPS = 25;

	var hotkeys = {};	
		hotkeys.LEFT_SQUARE_BRACKET = 219,
		hotkeys.RIGHT_SQUARE_BRACKET = 221,
		hotkeys.COMMA = 188,
		hotkeys.PERIOD = 190,
		hotkeys.P_KEY = 80,
		hotkeys.O_KEY = 79,
		hotkeys.BACKSLASH = 220,
		hotkeys.APOSTROPHE = 222;
	
	var frameskip = 1,
		imageURLCounter = 0,
		frameNumberSaved = 0,
		seekTime = (frameskip/fbf.FPS),
		seekInterval = seekTime*1000,
		hotkeysEnabled = true,
		sessionToggle = true,
		captureToggle = true,
		seekToggle = true,
		fbfPlayback = true,
		controlsToggle = false,
		continueCapture = false,
		imageURL = [],
		videoTitles = [" " + document.getElementById("eow-title").title],
		currentVideoNumber = 0,
		fbfForward,
		fbfReverse,
		fbfReverseAndCapture,
		fbfForwardAndCapture,
		frameWindow,
		player = document.getElementById("movie_player"),
		header = document.getElementById("watch-header");
	
	fbf.enableSeek = function() {
		seekToggle = true;
	}
	
	fbf.prevFrame = function() {
		// Based on YouTube enhancer userscript, http://userscripts.org/scripts/show/33042.
		player.pauseVideo();
		player.seekBy(-seekTime);
	}

	fbf.nextFrame = function() {
		// Based on YouTube enhancer userscript, http://userscripts.org/scripts/show/33042.
		player.pauseVideo();
		console.log(player.getCurrentTime());
		console.log(seekInterval);
		player.playVideo();
		setTimeout(player.pauseVideo, seekInterval);
		//player.seekBy(seekTime);
	}

	fbf.togglePlaybackRate = function() {
		if (player.getPlaybackRate()===0.25) {
			player.setPlaybackRate(1);
			seekInterval = seekTime*1000;	
		}
		else {
			player.setPlaybackRate(0.25);
			seekInterval = seekTime*4000;
		}
	}

	fbf.setFrameRate = function() {
		switch(fbf.FPS) {
			case 25:
				fbf.FPS = 30;
				break;
			case 30:
				fbf.FPS = 60;
				break;
			case 60:
				fbf.FPS = 24;
				break;
			case 24:
			fbf.FPS = 25
				break;
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
		//https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx#file_and_directory_names
		var currentTimeString = document.getElementsByClassName("ytp-time-current")[0].innerHTML;
		var safeCTS = currentTimeString.replace(/:/g, "꞉");
		var durationString = document.getElementsByClassName("ytp-time-duration")[0].innerHTML;
		var safeDS = durationString.replace(/:/g, "꞉");
		
		var currentTime = player.getCurrentTime();
		var duration = player.getDuration();
		var frameNumber = Math.floor(currentTime*fbf.FPS);
		var frameTotal = Math.floor(duration*fbf.FPS);
		
		var videoTime = currentTimeString + "/" + durationString + "\
		(" + frameNumber + "/" + frameTotal + "  frames)";
		var safeVideoTime = safeCTS + "∕" + safeDS + "_"
		safeVideoTime += "(" + frameNumber + "∕" + frameTotal + "  frames)";
		fractionalFrames = (currentTime%fbf.FPS);
		
		return [videoTime, safeVideoTime];
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
	var searchButton = document.getElementsByClassName("search-button")[0];
	var search = document.getElementById("masthead-search-term");
	var showMore = document.getElementById("watch-more-related-button");
	fbf.addSessionLinkListeners = function() {
		console.log("session links added");
		var sessionlink = Array.from(document.getElementsByClassName("yt-uix-sessionlink"));
			sessionlink.push(searchButton);
			sessionlink.push(search);
			if (showMore) {
				sessionlink.push(showMore);
			}
			//https://jsperf.com/for-vs-foreach/66
			for (var i = 0, len = sessionlink.length; i < len; ++i) {
				sessionlink[i].addEventListener("mouseup", function() {
					fbf.controlsVisibility("visible");
					controlsToggle = false;
					sessionToggle = true;
					fbf.resetIntervals();
					++currentVideoNumber;
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
	
	//The following four functions work together to capture and save video frames
	
	//https://gist.github.com/kosso/4246840
	function dataURItoBlob(dataURI) {
		var binary = atob(dataURI.split(',')[1]);
		var array = [];
		//https://jsperf.com/for-vs-foreach/66
		for(var i = 0, len = binary.length; i < len; ++i) {
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
		var a = document.createElement("a");
		for (var i = 0, len = imageURL.length; i < len; ++i, ++i) {
			a.href = imageURL[i];
			a.download = imageURL[i+1];
			a.click();
		}
	}
	
	fbf.captureFrame = function() {
			var video = document.getElementsByClassName("html5-main-video")[0];
			if (!videoTitles[currentVideoNumber]) {
				videoTitles[currentVideoNumber] = " " + document.getElementById("eow-title").title;
			}
			var canvas = fbf.drawFrame(video);
			var time = fbf.getVideoTime(video)[0];
			var safeTime = fbf.getVideoTime(video)[1];
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
			imageURL[frameNumberSaved+1] ="Frame_" + (frameNumberSaved/2) + "_" + safeTime + "_" + videoTitles[currentVideoNumber];
			var bodyHtml = "<div class=\"frame-div\"><strong><figcaption class=\"fig-caption\">Frame \
			" + (frameNumberSaved/2) + " captured at " + time + "\
			</figcaption><strong><img src=\"" + imageURL[frameNumberSaved] + "\"></div>";
		if (!frameWindow || frameWindow.closed) {
			player.pauseVideo();
			frameWindow = window.open("", "Frame Capturer", "height=\
			" + window.height + ", width=" + window.width + "\"");
			var headHtml = "<title>Frame Capturer</title><style>.frame-div { font-family: \"Trebuchet MS\", Arial,\
			Helvetica, sans-serif; background-color: rgb(179,0,0); padding: 5px;\
			border-style: solid; border-width: 2px; width: -webkit-fit-content} .fig-caption\
			{color: rgb(240,240,240);} ::-webkit-scrollbar {width: 6px;height: 6px;}\
			::-webkit-scrollbar-button {width: 0px;height: 0px;}::-webkit-scrollbar-thumb\
			{background: #e1e1e1;border: 0px none #ffffff;border-radius: 50px;}\
			::-webkit-scrollbar-corner {background: transparent;}<style>";
			frameWindow.document.head.innerHTML = headHtml;
			frameWindow.document.body.outerHTML = "<body style=\"margin: 0px;\">" + bodyHtml + "</body>";
			frameNumberSaved+=2;
		} else {
			frameWindow.document.body.innerHTML += bodyHtml;
			frameNumberSaved+=2;
		}
	}
	
	//The following four functions control auto frame seeking
	//and auto frame capture if enabled
	
	fbf.enableCapture = function() {
		captureToggle = true;
	}
	
	fbf.resetIntervals = function() {
		if (fbfForward) {
			clearInterval(fbfForward);
		}
		if (fbfReverse) {
			clearInterval(fbfReverse);
		}
		if (fbfReverseAndCapture) {
			clearInterval(fbfReverseAndCapture);
		}
		if (fbfForwardAndCapture) {
			clearInterval(fbfForwardAndCapture);
		}
		fbfPlayback = true;
	}
	
	fbf.fbfInterval = function(direction, capture) {
		if (fbfPlayback===true) {
			if (direction==="reverse" && capture==="captureDisabled") {
				fbfReverse = setInterval(fbf.prevFrame, 500);
			} else if (direction==="forward" && capture==="captureDisabled") {
				fbfForward = setInterval(fbf.nextFrame, 500);
			} else if (direction==="reverse" && capture==="captureEnabled") {
				fbf.captureFrame();
				fbfReverseAndCapture = setInterval(fbf.seekFrameAndCapture, 500, direction);
			} else if (direction==="forward" && capture==="captureEnabled") {
				fbf.captureFrame();
				fbfForwardAndCapture = setInterval(fbf.seekFrameAndCapture, 500, direction);
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
	
	fbf.seekFrameAndCapture = function(direction) {
		if (direction==="reverse") {
			seekFrame = -frameskip;
		} else {
			seekFrame = frameskip;

		}
		if (player.getPlayerState()===2) {
			fbf.captureFrame();
			player.pauseVideo();
		}
		if (player.getPlayerState()===2) {
			player.seekBy(seekFrame/fbf.FPS);
		}
	}
	
	//Injects onscreen buttons and other HTML
	fbf.injectControls = function() {
		var controls_html = "<i class=\"icon icon-to-start\"></i><i class=\"icon icon-to-end\"></i>";
		control_bar = document.getElementsByClassName("ytp-chrome-controls")[0];
		var fpsAndframeskip_html = "<strong>FPS:&nbsp;" + fbf.FPS + "</strong>\
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
			seekTime = (frameskip/fbf.FPS);
			if (player.getPlaybackRate()===0.25) {
				seekInterval = seekTime*4000;	
			} else {
				seekInterval = seekTime*1000;
			}
			fpsAndframeskip_html = "<strong>FPS:&nbsp;" + fbf.FPS + "</strong>\
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
	
	
	if (document.getElementsByClassName("ytp-chrome-controls")[0]) {
		fbf.injectControls();
	}
		
	//Add hotkey event listeners	
	document.addEventListener("keydown", function(e) {
		if (hotkeysEnabled) {
			switch(e.which) {
				case !e.altKey && !e.shiftKey && hotkeys.LEFT_SQUARE_BRACKET:
					if (seekToggle) {
						seekToggle = false;
						setTimeout(fbf.enableSeek, 200);
						fbf.prevFrame();
					}
					break;
				case !e.altKey && !e.shiftKey && hotkeys.RIGHT_SQUARE_BRACKET:
					if (seekToggle) {
						seekToggle = false;
						setTimeout(fbf.enableSeek, 200);
						fbf.nextFrame();
					}
					break;
				case e.altKey && !e.shiftKey && hotkeys.LEFT_SQUARE_BRACKET:
					fbf.fbfInterval("reverse", "captureDisabled");
					break;
				case e.altKey && !e.shiftKey && hotkeys.RIGHT_SQUARE_BRACKET:
					fbf.fbfInterval("forward", "captureDisabled");
					break;
				/*case e.altKey && e.shiftKey && hotkeys.LEFT_SQUARE_BRACKET:
					fbf.fbfInterval("reverse", "captureEnabled");
					break;
				case e.altKey && e.shiftKey && hotkeys.RIGHT_SQUARE_BRACKET:
					fbf.fbfInterval("forward", "captureEnabled");
					break;*/
				case hotkeys.COMMA:
					fbf.multiplyFS("decrease");
					break;
				case hotkeys.PERIOD:
					fbf.multiplyFS("increase");
					break;
				case hotkeys.P_KEY:
					fbf.togglePlaybackRate();
					break;
				case hotkeys.O_KEY:
					fbf.setFrameRate();
					break;
				case hotkeys.BACKSLASH:
					fbf.toggleControls();
					break;
				case !e.altKey && hotkeys.APOSTROPHE:
					//https://remysharp.com/2010/07/21/throttling-function-calls
					if (captureToggle) {
						captureToggle = false;
						setTimeout(fbf.enableCapture, 500);
						fbf.captureFrame();
					}
					break;
				case e.altKey && hotkeys.APOSTROPHE:
					fbf.saveFrame(imageURL);
					break;
			}
		}
	  }, false);

	//Add mousewheel event listeners  
	document.addEventListener('wheel', function(e) {
		if (e.deltaX < 0 && e.shiftKey && e.pageX >= window.innerWidth/2) {
			fbf.nextFrame();
		}
		if (e.deltaX < 0 && e.shiftKey && e.pageX < window.innerWidth/2) {
			fbf.prevFrame();
		}
	});
	

	//Test if player state changes 
	//Result_1: While paused, seeking does not change player state
	/*player.addEventListener("onStateChange", "onPlayerStateChange");
	onPlayerStateChange = function(state) {
		console.log(state);
	}*/
	
	//The following two event listeners disable the hotkeys
	//when input fields on a video page have focus
	search.addEventListener("focus", function(e) {
		hotkeysEnabled = false;
	});
	search.addEventListener("blur", function(e) {
		hotkeysEnabled = true;
	});

	var comment = document.getElementById("watch-discussion");
	comment.addEventListener("focus", function(e) {
		hotkeysEnabled = false;
	}, true);
	comment.addEventListener("blur", function(e) {
		hotkeysEnabled = true;
	}, true);
}

//Grab html body and use a MutationObserver to load frameByFrame() only
//when a video page is loaded		
var body = document.getElementById("body");
var spfDataName = body.getAttribute("data-spf-name");

if (spfDataName==="watch") {
	frameByFrame();
} else {
	//https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
	var observer = new MutationObserver(
		function() {
			var spfDataName = body.getAttribute("data-spf-name");
			if (spfDataName==="watch") {
				frameByFrame();
				observer.disconnect();
			}
		}
	);
	var config = {attributes: true};
	observer.observe(body, config);
}