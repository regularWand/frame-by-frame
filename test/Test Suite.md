# Test Suite

## Set Up

Disable any existing frame by frame extensions.
chrome://extensions/
Load unpacked extension.
Select "extension" directory.

## Test - Loading

Open https://www.youtube.com/
Open first video
Expect: Frame by frame to have loaded

Open https://www.youtube.com/
Open first video in new tab
Expect: Frame by frame to have loaded

Open https://www.youtube.com/
Search "Giant 6ft Water Balloon"
Open first video
Expect: Frame by frame to have loaded

Open https://www.youtube.com/
Search "Giant 6ft Water Balloon"
Open first video in new tab
Expect: Frame by frame to have loaded

Open https://www.youtube.com/
Search "Giant 6ft Water Balloon"
Open first video
Expect: Frame by frame to have loaded
Open first video in results to the left
Expect: Frame by frame to have loaded

Open https://www.youtube.com/user/theslowmoguys
Open first video on page
Expect: Frame by frame to have loaded

Open https://www.youtube.com/watch?v=j_OyHUqIIOU
Expect: Frame by frame to have loaded

## Test - On Screen UX

Open https://www.youtube.com/watch?v=j_OyHUqIIOU

Check UI appears

- Back one frameskip
- Forward one frameskip
- FPS
- Frameskip
- Help

Check "back one frameskip".

Check "forward one frameskip".

Check FPS changes when use o.

Check Frameskip changes when use < and >.

## Test - Keyboard Driven UX

Check [ goes back by one frameskip.

Check ] goes forward by one frameskip.

Check < decreases frameskip by x2.

Check < increases frameskip by x2.

Check p toggles between 1/4 and normal play back.

Check o toggles between frame skipping for 25 and 30 fps video.
