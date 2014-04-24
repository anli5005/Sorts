if (!$) {
	throw new Error("jQuery is not included; please include it");
}

this.Sorts = new Object();

Sorts.ParsedData = function(parseData, error) {
	this.parseData = parseData;
	this.error = error;
	return this;
};

Sorts.JSON = new Object();
Sorts.JSON.stringify = function (parseData) {
	return JSON.stringify(parseData);
}
Sorts.JSON.parse = function (stringData) {
	var parseData;
	try {
		parseData = new Sorts.ParsedData(JSON.parse(stringData))
	} catch(err) {
		parseData = new Sorts.ParsedData();
		parseData.error = err;
	}
	return parseData;
}

Sorts.parseParams = function (stringData) {
	var params = {};
	try {
		var dataStart = stringData.indexOf("?") + 1;
		var dataEnd;
		if (stringData.indexOf("#") > -1) { dataEnd = stringData.indexOf("#") } else { dataEnd = stringData.length };
		var data = stringData.slice(dataStart, dataEnd);
		var parts = data.replace("+", " ").split("&");
		for (i = 0; i < parts.length; i++) {
			var part = parts[i].split("=");
			var key = decodeURIComponent(part[0]);
			if (!params.hasOwnProperty(key)) {
				params[key] = [];
			}
			var value = decodeURIComponent(part[1]);
			params[key].push(value);
		}
	} catch(err) {
		parseData = new Sorts.ParsedData();
		parseData.error = err;
		return parseData; 
	}
	return new Sorts.ParsedData(params);
}

Sorts.Log = new Object();
Sorts.Log.logError = function (error) {
	if (error.line && error.sourceURL) {
		console.log("Error at line "+error.line+" in "+error.sourceURL+": "+error.message);
	} else {
		console.log("Error: "+error.message);
	}
}

Sorts.getAllSorts = function () {
	return Sorts.JSON.parse(localStorage.getItem("sort_all"));
}

Sorts.SortMeta = function (name) {
	this.name = name;
	return this;
}