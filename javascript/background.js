chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
   switch (request.action.type) {
      case "close":
      sendResponse({farewell: ""});
		chrome.tabs.remove(sender.tab.id, function () {});
         break;
      case "notify":
         chrome.notifications.create("low_time", {
            title: "ProFocus Notifier",
            message: `You have ${request.action.data} minutes left on YouTube today.`,
            requireInteraction: true,
            type: "basic",
            iconUrl: "../images/favicon.png"
         });
         break;
      case "badge":
         chrome.browserAction.setBadgeText({ text: Math.floor(request.action.data).toString() });
         chrome.browserAction.setBadgeBackgroundColor({ color: "#666"});
         break;
      case "active":
         chrome.tabs.query({ active: true, url: "*:\/\/*.youtube.com/*" }, (tabs) => {
            if (tabs.length > 0) {
               sendResponse(true);
            }
         });
   }
   return true;
});