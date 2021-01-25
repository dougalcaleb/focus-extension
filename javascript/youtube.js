// Options
const allowedTime = 2 * 60 * 60 * 1000;
const updateSpeed = 5 * 1000;
const alertWhenUnder = 67 * 60 * 1000;
const alertEvery = 1 * 60 * 1000;
const resetTime = false;
const showBadge = true;

// Variables
let month = new Date().getMonth().toString();
let day = new Date().getDate().toString();
let year = new Date().getFullYear().toString();
let todayString = month + "/" + day + "/" + year;
let nextAlert = alertWhenUnder;


// If it is a new day, allot more time
let prevDate;
chrome.storage.sync.get("date", (data) => {
	prevDate = data.date;
	if (todayString != prevDate) {
		chrome.storage.sync.set({timeLeft: allowedTime, date: todayString}, () => {
			// console.log(`It is a new day. You have ${allowedTime} left.`);
		});
	}
});

// For development. Resets the time to max on reload instead of continuing the timer
if (resetTime) {
	chrome.storage.sync.set({timeLeft: allowedTime}, () => {});
}

let timeChecker = setInterval(update, updateSpeed);

function update() {
	
   // Send a message to the background to check if Youtube is active. If it is, tick down the time. Otherwise pause it.
   chrome.runtime.sendMessage({ action: { type: "active" } }, (response) => {
      if (response) {
         
         // Get the time left
         chrome.storage.sync.get("timeLeft", (data) => {
            // Send desktop notifications when time is low
            if (data.timeLeft <= alertWhenUnder && data.timeLeft > 0 && data.timeLeft <= nextAlert) {
               chrome.runtime.sendMessage({action: {type: "notify", data: Math.floor(data.timeLeft / (1000 * 60))}});
               nextAlert -= alertEvery;
            }
            // Force close the tab when there is no time left
            if (data.timeLeft <= 0) {
               clearInterval(timeChecker);
               chrome.runtime.sendMessage({action: {type: "close"}}, function (response) {});
            }
            
            // Update the time
            if (!data.timeLeft) {
               chrome.storage.sync.set({timeLeft: allowedTime, date: todayString}, () => {});
            } else {
               chrome.storage.sync.set({timeLeft: data.timeLeft - updateSpeed, date: todayString}, () => {});
            }
            // Update the badge to show remaining time
            if (showBadge) {
               chrome.runtime.sendMessage({action: {type: "badge", data: data.timeLeft / (60 * 1000)}});
            }
         });

      }
   });

   // Make sure that the current date is correct
	month = new Date().getMonth().toString();
	day = new Date().getDate().toString();
	year = new Date().getFullYear().toString();
	todayString = month + "/" + day + "/" + year;
}

update();