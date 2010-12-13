(function() {
var root = MathJax.Hub.config.root;
var height = 300;
var img = document.createElement("img");
img.src = root + "/tools/logo.gif";
img.width = "100";
img.height = "20";
img.style.cssText = "position: fixed; bottom: 0px; right: 10px; background-color: #fff; padding: 0.5em; border: 2px solid #ccc; " +
	"-webkit-border-radius: 4px 4px 0 0; -moz-border-radius: 4px 4px 0 0; border-radius: 4px 4px 0 0;";
document.body.appendChild(img);

var div = document.createElement("div");
div.style.height = "0px";
document.body.appendChild(div);

var iframe = document.createElement("iframe");
iframe.style.cssText = "position: fixed; bottom: 0px; left: 0px; width: 100%; height: 0px; overflow: " +
	"hidden; background-color: #fff; border: none; border-top: 2px solid #ccc;";
iframe.src = root + "/tools/diagnostix.html";
document.body.appendChild(iframe);

img.onclick = function() {
	if (img.className == "checked") {
		img.className = "";
		img.style.bottom = "0px";
		div.style.height = "0px";
		iframe.style.height = "0px";
	}
	else {
		img.className = "checked";
		img.style.bottom = height + "px";
		div.style.height = height + "px";
		iframe.style.height = height + "px";
	}
}

})();
