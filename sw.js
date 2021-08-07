self.addEventListener("fetch", (event) => {
	console.log("DEBUG " + event.request.url);
});

self.addEventListener("install", (event) => {
	console.log("DEBUG SW status = install");
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	console.log("DEBUG SW status = activate");
});

