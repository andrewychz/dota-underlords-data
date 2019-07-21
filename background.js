var log = console.log.bind(console)

log('background.js ready')

chrome.commands.onCommand.addListener(function(command) {
    log('background.js get command' + ' ' + command)

    // https://developer.chrome.com/extensions/examples/api/eventPage/basic/background.js

    chrome.tabs.query({active : true, currentWindow : true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {"content" : "NeedFrame"}, null, function(frame) {
            log(frame.x, frame.y, frame.width, frame.height)

            // https://stackoverflow.com/questions/38181137/how-can-i-take-screenshot-of-some-specific-area-using-javascript-in-chrome-exten
            chrome.tabs.captureVisibleTab(null, {}, function(base64) {
                var img = new Image()
                img.src = base64
                img.onload = function() {
                    var canvas = document.createElement('canvas')
                    canvas.width = frame.width
                    canvas.height = frame.height
                    var context = canvas.getContext('2d')
                    context.drawImage(img, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height)
                    var croppedUri = canvas.toDataURL('image/png')
                    log(croppedUri)
                }
            })
        })
    })
})
