/*************************************************************
 *
 *  diagnostix.js
 *  
 *  ---------------------------------------------------------------------
 *  
 *  Copyright (c) 2010 Design Science, Inc.
 * 
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

(function() {
var root = MathJaxToolsDir
var height = 300;
var img = document.createElement("img");
img.src = root + "/logo.gif";
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
iframe.src = root + "/diagnostix.html";
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
