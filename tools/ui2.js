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

var wrap = function(object) {
	if (object.nodeType) return uiElement(object);
	if (object.item) return uiNodeList(object);
	return uiObject(object);
}

var Selector = function(text) {
	if (!(this instanceof Selector)) return new Selector(text);
	text = text.trim();
	if (/\s/.test(text)) throw "This implementation only supports simple selectors"
	var m = null;
	// Element / Universal
	m = /^(\*|[a-zA-Z0-9_-]+)?/.exec(text);
	if (m) {
		this.tagName = m[1];
		text = text.substr(m[0].length);
	}
	// ID
	m = /^#([a-zA-Z0-9_-]+)/.exec(text);
	if (m) {
		this.id = m[1];
		text = text.substr(m[0].length);
	}
	
	do {
		// Class
		m = /^\.([a-zA-Z0-9_-]+)/.exec(text);
		if (m) {
			if (!this.classNames) this.classNames = [];
			this.classNames.push(m[1]);
			text = text.substr(m[0].length);
		}

		// Attribute
		m = /^\[\s*([a-z0-9_-]+)\s*(=\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]+))\s*)?\]/.exec(text);
		if (m) {
			if (!this.attributes) this.attributes = [];
			var spec = {};
			this.attributes.push(spec);
			spec.name = m[1];
			if (m[2]) {
				spec.value = m[3] || m[4] || m[5];
			}
			text = text.substr(m[0].length);
			break;
		}
	} while (m && text.length);
}

var uiObject = function(actual) {
	if (!actual) return; // This is how we do inheritance;
	if (!(this instanceof uiElement)) return new uiElement(actual);
	this.__actual__ = actual;	
}

Object.extend(uiObject.prototype, {
get: function(name) {
	var actual = this.__actual__;
	if (arguments.length === 0) return actual;
	var val = actual[name];
	return (typeof val === "object") ? wrap(val) : val;
},
set: function(name, val) {
	var actual = this.__actual__;
	if (typeof name === "object") Object.each(name, function(name, val) {
		this.set(name, val);
	}, this);
	node[name] = (val.__actual__) ? val.__actual__ : val;
	return this;
}	
});

var uiElement = function(actual) {
	if (!actual) return; // inheritance
	if (!(this instanceof uiElement)) return new uiElement(actual);
	this.__actual__ = actual;
}

uiElement.prototype = new uiObject();

Object.extend(uiElement.prototype, {

classNames: function() { return this.get("className").split(/\s+/); },
hasClass: function(token) { return this.classNames().indexOf(token) >= 0; },
addClass: function(token) { this.set("className", this.get("className") + " " + token); }, // FIXME doesn't maintain spacing
removeClass: function(token) { // FIXME doesn't maintain spacing
	var prev = this.classNames(), next = [];
	for (var n=prev.length, i=0; i<n; i++) {
		var string = prev[i];
		if (string !== token) next.push(string);
	}
	this.set("className", next.join(" "));
}, 
toggleClass: function(token) {
	if (this.hasClass(token)) this.removeClass(token);
	else this.addClass(token);
},
_matches: function(selector) {
	if (selector.tagName && selector.tagName !== "*" && selector.tagName !== this.get("tagName").toLowerCase()) return false;
	if (selector.id && selector.id !== this.get("id")) return false;
	var me = this;
	if (selector.classNames && !selector.classNames.every(function(name) { return me.hasClass(name); })) return false;
	// TODO attributes??
	return true;	
},
matches: function(selectorText) {
	var selector = new Selector(selectorText);
	return this._matches(selector);
},
find: function(selectorText) {
	var selector = new Selector(selectorText);
	var el;
	if (selector.id) {
		el = document.getElementById(selector.id);
		var actual = this.get();
		if (actual !== document && !actual.contains(el)) return;
		var wrapper = wrap(el);
		if (wrapper._matches(selector)) return wrapper;
		return;
	}
	var tagName = selector.tagName || "*";
	var nodeList = wrap(this.get().getElementsByTagName(tagName));
	return nodeList.first(function(node) { return node._matches(selector); });	
},
findAll: function(selectorText) {
	var selector = new Selector(selectorText);
	var tagName = selector.tagName || "*";
	var nodeList = wrap(this.get().getElementsByTagName(tagName));
	return nodeList.filter(function(node) { return node._matches(selector); });		
}

});

var uiNodeList = function(actual) {
	if (!actual) return; // inheritance
	if (!(this instanceof uiNodeList)) return new uiNodeList(actual);
	this.__actual__ = actual;	
}

uiNodeList.prototype = new uiObject;
Object.extend(uiNodeList.prototype, {

size: function() { return this.__actual__.length; },
item: function(index) { return wrap(this.__actual__[index]); },
namedItem: function(name) { return wrap(this.__actual__[name]); },
forEach: function(callback, context) { // NOTE not completely compatible with native Array.forEach
	for (var n=this.size(), i=0; i<n; i++) {
		var item = this.item(i);
		callback.call(context, item, this);
	}
},
filter: function(callback, context) {
	var nodeList = this, items = [];
	this.forEach(function(item) { if (callback.call(this, item, nodeList)) items.push(item.__actual__); }, context);
	return uiNodeList(items);
},
first: function(callback, context) {
	for (var n=this.size(), i=0; i<n; i++) {
		var item = this.item(i);
		if (callback.call(context, item, this)) return item;
	}
},
last: function(callback, context) {
	for (var i=this.size()-1; i>=0; i--) {
		var item = this.item(i);
		if (callback.call(context, item, this)) return item;
	}
}

});

var ui = {
	DOMObject: uiObject,
	Element: uiElement,
	NodeList: uiNodeList
}

Object.extend(ui, {

getOptions: function(callback, context) {
	if (!context) context = this;
	var optString = location.toString().split("?")[1];
	if (!optString) return;
	var optList = optString.split("&");
	var options = {};
	forEach(optList, function(text) {
		var m = text.split("=");
		callback.call(context, m[0], m[1]);
	});
},

$: function(selectorText, node) {
	if (!node) node = document;
	if (selectorText.nodeType) return uiElement(selectorText);
	return wrap(node).find(selectorText);
},
$$: function(selectorText, node) {
	if (!node) node = document;
	return wrap(node).findAll(selectorText);
}

})

return ui;

})();
