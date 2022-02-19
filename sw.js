const WSDebug = false;

self.addEventListener("fetch", (event) => {
	if (WSDebug) {console.log("DEBUG " + event.request.url);}
});

self.addEventListener("install", (event) => {
	if (WSDebug) {console.log("DEBUG SW status = install");}
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	if (WSDebug) {console.log("DEBUG SW status = activate");}
});

self.addEventListener("idle", (event) => {
	if (WSDebug) {console.log("DEBUG SW status = idle");}
});

self.addEventListener("terminated", (event) => {
	if (WSDebug) {console.log("DEBUG SW status = terminated");}
});

