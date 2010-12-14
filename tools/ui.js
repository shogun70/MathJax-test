if (!Object.each) Object.each = function(object, callback, context) {
	for (var key in object) callback.call(context, key, object[key]);
}
if (!Object.copy) Object.copy = function(object, props) {
	Object.each(props, function(key, val) {
		object[key] = val;
	});	
}
if (!Object.extend) Object.extend = function(object, props) {
	Object.each(props, function(key, val) {
		if (typeof object[key] === "undefined") object[key] = val;
	});
}

Object.extend(String.prototype, {
trim: function() { return this.replace(/^\s\s*/, "").replace(/\s*\s$/, ""); }
});
Object.extend(String, {
eachWord: function(text, callback, context) {
	text.split(/\s+/).forEach(function(word, i) { callback.call(context, word, i); });
}
});
Object.extend(Date, {
now: function() { return +(new Date); }
});
Object.extend(Array.prototype, {
indexOf: function(val, start) {
	var array = this;
	var n = array.length, i = (start > 0) ? start : 0;
	for (; i<n; i++) if (val === array[i]) return i;
	return -1;
},
lastIndexOf: function(val, start) {
	var array = this;
	var n = array.length, i = (start != null && start < n) ? start : n-1;
	for (; i>= 0; i--) if (array[i] === val) return i;
	return -1;
},
every: function(callback, context) {
	var array = this;
	var n = array.length;
	for (var i=0; i<n; i++) {
		var val = array[i];
		if (typeof val === "undefined") continue;
		if (!callback.call(context, val, i, array)) return false;
	}
	return true;
},
some: function(callback, context) {
	var array = this;
	for (var n=array.length, i=0; i<n; i++) {
		var val = array[i];
		if (typeof val === "undefined") continue;
		if (callback.call(context, val, i, array)) return true;
	}
	return false;
},
map: function(callback, context) {
	var array = this;
	var result = [];
	for (var n=array.length, i=0; i<n; i++) {
		val = array[i];
		if (typeof val === "undefined") continue;
		result[i] = callback.call(context, array[i], i, array);
	}
	return result;
},
forEach: function(callback, context) {
	var array = this;
	for (var n=array.length, i=0; i<n; i++) {
		var val = array[i];
		if (typeof val === "undefined") continue;
		callback.call(context, val, i, array);
	}
},
filter: function(callback, context) {
	var array = this;
	var result = [];
	for (var n=array.length, i=0; i<n; i++) {
		var val = array[i];
		if (typeof val === "undefined") continue;
		callback.call(context, val, i, array) && result.push(val);
	}
	return result;
},
compare: function(array2, cmp) { // NOTE compares n elements where n is length of shorter array
	var array = this;
	if (!cmp) cmp = function(a,b) { return (a < b) ? -1 : (a > b) ? 1 : 0 };
	var rc = 0;
	var n1 = array.length, n2 = array2.length, n = (n1 <= n2) ? n1 : n2;
	for (var i=0; i<n; i++) {
		if (rc = cmp(array[i], array2[i])) return rc;
	}
	return rc;
}

})

Object.extend(Array, {
slice: function(start, end) {
	var array = this;
	var slice = [].slice;
	return (end === undefined) ?
		slice.call(array, start) :
		slice.call(array, start, end);
},
indexOf: function(array, val, start) { return this.prototype.indexOf.call(array, val, start); },
lastIndexOf: function(array, val, start) { return this.prototype.lastIndexOf.call(array, val, start); },
every: function(array, callback, context) { return this.prototype.every.call(array, callback, context); },
filter: function(array, callback, context) { return this.prototype.filter.call(array, callback, context); },
forEach: function(array, callback, context) { return this.prototype.forEach.call(array, callback, context); },
map: function(array, callback, context) { return this.prototype.map.call(array, callback, context); },
some: function(array, callback, context) { return this.prototype.some.call(array, callback, context); },
compare: function(array, array2, cmp) { return this.prototype.compare.call(array, array2, cmp); }
});

if (!document.documentElement.contains && document.compareDocumentPosition) {

Element.prototype.contains = function(node) { // FIXME compare nodes in different documents
	if (node == undefined) return false;
	if (this === node) return false;
	return (this.compareDocumentPosition(node) && 0x10);
}

}

var MathJaxUI = (function() {

var ui = {};

var Queue = ui.Queue = function(timeout) { // FIXME this probably breaks in several trivial ways
	this.list = [];
	this.timeout = timeout || 100;
}
Queue.prototype.Push = function() {
	[].push.apply(this.list, arguments);
	this.Play();
}
Queue.prototype.Play = function() {
	if (this.timer) return;
	var fn = this.list.shift();
	var queue = this;
	if (fn) this.timer = window.setTimeout(function() { fn(); delete queue.timer; queue.Play(); }, this.timeout);	
}

var DOMTokenList = ui.DOMTokenList = function(getter, setter) {
	if (!(this instanceof DOMTokenList)) return new DOMTokenList(getter, setter);
	this.__get__ = getter;
	this.__set__ = setter;
}
Object.extend(DOMTokenList.prototype, {

items: function() { return this.__get__().split(/\s+/); },
item: function(index) { return this.items()[index]; },
contains: function(token) { return this.items().indexOf(token) >= 0; },
add: function(token) { // FIXME doesn't maintain spacing
	if (this.contains(token)) return;
	var items = this.items();
	items.push(token);
	this.__set__(items.join(" "));
},
remove: function(token) { // FIXME doesn't maintain spacing
	var items = this.items().filter(function(item) { return item !== token; });
	this.__set__(items.join(" "));
}, 
toggle: function(token) {
	if (this.contains(token)) this.remove(token);
	else this.add(token);
}

});

var ClassList = ui.ClassList = function(el) {
	var __get__ = function() { return el.className; };
	var __set__ = function(val) { el.className = val; };
	return new DOMTokenList(__get__, __set__);
}

var DataTable = ui.DataTable = function(table) {
	this.table = table;
	var tBody = this.tBody = (table.tBodies) ? table.tBodies[0] : table;
	this.scale = 1;
	var rows = tBody.rows;
	var template = this.template = rows[rows.length - 1];
	tBody.removeChild(template);
	ClassList(template).remove("template");
}
Object.extend(DataTable.prototype, {
addRow: function(data) {
	var tBody = this.tBody, template = this.template;
	var row = template.cloneNode(true);
	tBody.appendChild(row);
	var inputs = $$("input", row);
	var dataTable = this;
	Array.forEach(inputs, function(input) {
		var key = input.name, val = data[key];
		dataTable.updateInput(input, val);
	});
},
updateInput: function(input, data) {
	if (typeof data !== "object") return this.updateInputValue(input, data);
	this.updateInputValue(input, data.value);
	if (data.title) input.title = data.title;
	if (data["class"]) ClassList(input).add(data["class"]);
},
updateInputValue: function(input, val) {
	switch (typeof val) {
		case "boolean": input.checked = val; break;
		case "number": case "string": input.value = val; break;
	}
	if (input.className === "duration" && typeof val === "number") input.style.width = this.scale * val +"%";
}

})


Object.extend(ui, {

getOptions: function(callback, context) {
	if (!context) context = this;
	var optString = location.toString().split("?")[1];
	if (!optString) return;
	var optList = optString.split("&");
	var options = {};
	Array.forEach(optList, function(text) {
		var m = text.split("=");
		callback.call(context, m[0], m[1]);
	});
}

});

if (document.querySelector) Object.extend(ui, {

$: function(selectorText, node) {
	if (!node) node = document;
	return node.querySelector(selectorText);
},
$$: function(selectorText, node) {
	if (!node) node = document;
	return node.querySelectorAll(selectorText);
}

});

else Object.extend(ui, {

$: function(selectorText, node) {
	var m = selectorText.match(/^\s*#(.+)\s*$/);
	if (!m[0]) throw "This selector engine only supports ID selectors (#id)";
	var id = m[1];
	var doc = (node) ? node.ownerDocument : document;
	var el = doc.getElementById(id);
	if (!node) return el;
	if (node.contains(el)) return el;
},
$$: function(selectorText, node) {
	if (!node) node = document;
	return node.getElementsByTagName(selectorText);
}

});

return ui;

})();
