const http = require("http"),
	fs = require("fs"),
	types = require("./mine.json"),
	staticPath = __dirname + "/build";
function ServerFile (res, path, type, status) {
	status = status || 200;
	fs.readFile(path, (err, data) => {
		if (err) {
			res.writeHead(404);
			res.end("Not Found");
		} else {
			res.writeHead(status, {"Content-type": type});
			res.end(data);
		}
	});
}	 
http.createServer((req, res) => {
	var path = req.url.replace(/\/?(?:\?.*)?$/, "").toLowerCase() || "/index.html",
		type = path.slice(path.indexOf(".") + 1);
	if (type === "html" || type === "" || type === "ico")
		path = __dirname + path;
	else
		path = staticPath + path;
	ServerFile(res, path, types[type]);
}).listen(3000);
console.log("Server is on...");