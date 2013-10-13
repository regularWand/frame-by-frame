fbf = {}

fbf.FRAMES_PER_SECOND = 25
fbf.PLAYER_ID = "movie_player"

fbf.prevFrame = function() {
    // Based on YouTube enhancer userscript, http://userscripts.org/scripts/show/33042.
    player = document.getElementById(fbf.PLAYER_ID)
    player.pauseVideo()
    player.seekBy(-1 * (1/fbf.FRAMES_PER_SECOND))
}

fbf.nextFrame = function() {
    // Based on YouTube enhancer userscript, http://userscripts.org/scripts/show/33042.
    player = document.getElementById(fbf.PLAYER_ID)
    player.pauseVideo()
    player.seekBy(1 * (1/fbf.FRAMES_PER_SECOND))
}

fbf.injectControls = function() {
    /*
    Injects extra player controls into the page.
    */
    // Really basic controls to get started.
    controls_html = "(<a href=\"javascript: fbf.prevFrame()\">prev</a>/<a href=\"javascript: fbf.nextFrame()\">next</a>)"
    title_element = document.getElementById("watch-headline-title")
    title_element.innerHTML = controls_html + title_element.innerHTML
}

fbf.injectControls()