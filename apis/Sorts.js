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

Sorts.getSortName = function (num) {
	return "sort_"+num.toString();
}

Sorts.getAllSorts = function () {
	return Sorts.JSON.parse(localStorage.getItem("sort_all"));
}

Sorts.SortMeta = function (name) {
	this.name = name;
	this.stringify = function () {
		return Sorts.JSON.stringify({"name":this.name});
	}
	return this;
}
Sorts.SortMeta.metaNameForSort = function (name) {
	return name+"_meta";
}
Sorts.SortMeta.metaForSort = function (num) {
	var metaJson = localStorage.getItem(Sorts.SortMeta.metaNameForSort(Sorts.getSortName(num)));
	if (metaJson) {
		var parsedMeta = Sorts.JSON.parse(metaJson);
		if (parsedMeta.parseData) {
			return new Sorts.SortMeta(parsedMeta.parseData["name"]);
		} else {
			Sorts.Log.logError(parsedMeta.error);
		}
	}
}

Sorts.SortTerm = function (termName) {
	this.text = termName;
	this.isBold = false;
	this.objectify = function () {
		return {"text":this.text,"isBold":this.isBold};
	}
	return this;
}
Sorts.SortTerm.termFromData = function (termData) {
	var sortTerm = new Sorts.SortTerm(termData["text"]);
	sortTerm.isBold = termData["isBold"];
	return sortTerm;
}

Sorts.SortColumn = function (columnName) {
	this.name = columnName;
	this.terms = [];
	this.addTerm = function (term) {
		this.terms.push(term);
	}
	this.objectify = function () {
		var data = {"name":this.name,"terms":[]};
		var termNum = 0;
		while (termNum < this.terms.length) {
			data["terms"].push(this.terms[termNum].objectify());
			termNum = termNum + 1;
		}
		return data;
	}
	return this;
}
Sorts.SortColumn.columnFromData = function (columnData) {
	var sortColumn = new Sorts.SortColumn(columnData["name"]);
	var sortData = columnData["terms"];
	if (sortData) {
		var termNum = 0;
		while (termNum < sortData.length) {
			sortColumn.addTerm(Sorts.SortTerm.termFromData(sortData[termNum]));
			termNum = termNum + 1;
		}
	}
	return sortColumn;
}

Sorts.Sort = function () {
	this.meta = new Sorts.SortMeta();
	this.sortNumber = null;
	this.sortColumns = [];
	return this;
}
Sorts.Sort.getSort = function (num) {
	var sort = new Sorts.Sort();
	sort.sortNumber = num;
	sort.meta = Sorts.SortMeta.metaForSort(num);
	var json = localStorage.getItem(Sorts.getSortName(num));
	if (json) {
		var parsed = Sorts.JSON.parse(json);
		if (parsed.parseData) {
			var i = 0;
			while (i < parsed.parseData.length) {
				sort.sortColumns.push(Sorts.SortColumn.columnFromData(parsed.parseData[i]));
				i = i + 1;
			}
		} else {
			if (parsed.error) {
				Sorts.Log.logError(parsed.error);
			}
		}
	}
	return sort;
}

Sorts.removeSort = function (num) {
	var current = Sorts.getAllSorts();
	if (current.error) {
		return current.error;
	}
	var removed;
	if (current.parseData) {
		if (current.parseData.indexOf(num) == -1) {
			return new Error("There is no such sort as sort "+num);
		}
		current.parseData.splice(current.parseData.indexOf(num), 1);
	} else {
		return new Error("There is no such sort as sort "+num);
	}
	localStorage.removeItem(Sorts.getSortName(num));
	localStorage.removeItem(Sorts.SortMeta.metaNameForSort(Sorts.getSortName(num)));
	localStorage.setItem("sort_all", Sorts.JSON.stringify(current.parseData));
}