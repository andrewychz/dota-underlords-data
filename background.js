var log = console.log.bind(console)

log('background.js ready')

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.query({active : true, currentWindow : true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {"content" : "NeedFrame"}, null, function(frame) {

        })
    })
})
