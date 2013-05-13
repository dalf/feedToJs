var domToJs = ( function() {
    "use strict";

    function parsePath(domElement, path) {
	var element, attributeName, result = null;
	if (path.charAt(0) === "@") {
	    attributeName = path.substr(1);
	    return domElement.getAttribute(attributeName);	    
	} if (path === ".") {
	    element = $(domElement);
	} else {
	    element = $(domElement).find(path);
	}
	
	if (element) {
	    result = element.text();
	} 
	return result;
    }
    
    function parseArray(domElement, spec) {
	var i, value, path, template, result=[], parseElement = function(_,e) {
	    value = parseAll(e, template);
	    if (value !== null && value !== "") {
		result.push(value);
	    }
	};
	for (i=0; i<spec.length; i=i+2) {
	    path = spec[i];
	    template = spec[i+1];
	    $(domElement).find(path).each(parseElement);
	}
	return result;
    }   
    
    function parseObject(domElement, template) {
	var key, value, templateValue, templateValueType, result = {};
	for (key in template) {
	    if (template.hasOwnProperty(key)) { 
		templateValue = template[key];
		value = parseAll(domElement, templateValue);
		if (value !== null) {
		    result[key] = value;
		}
	    }
	}
	return result;
    }
    
    function parseAll(domElement, template) {
	var value, templateType = $.type(template);
	if (templateType === "function") {
	    // a function : call it
	    value = template(domElement);
	} else if (templateType === "string") {
	    // jquery selector
	    value = parsePath(domElement, template); 
	} else if (templateType === "array") {
	    // create an array, the templateValue specify how to.
	    value = parseArray(domElement, template); 
	} else if (templateType === "object") {
	    // an other template
	    value = parseObject(domElement, template); 
	} else {
	    // problem
	}
	return value;
    }

    return {
	parse: function(domDocument, template) {
	    return parseAll(domDocument, template);
	}
    };
    
})();

var feedToJs = ( function () {

    function parseTime(time){
	var temp = time.slice(0,-1);
	temp = temp.split('T');
	var date = temp[0].split('-');
	var clock = temp[1];
	var arrayMonths = new Array("January","February","March","April","May","June","July","August","September","October","Novermber","December");
	date[1] = arrayMonths[parseInt(date[1]) - 1];
	date = date[1] + "/" + date[2] + "/" + date[0];
	return(date + " (" + clock + ")");
    }

    var atomTemplate = {
	"title" : "feed > title",
	"logo" : "feed > logo",
	"updated" : "feed > updated",
	"description" : "feed > desription",
	"link" : "feed > link",
	"entries" : [ "feed > entry", {
	    "id": "id",
	    "title": "title",
	    "summary": "summary",
	    "content": "content",
	    "published" : "published",
	    "updated" : "updated",
	    "authors"   : [ "authors", {"name": "name", "email": "email"}, "dc:creator", {"name": "@term" } ],
	    "categories": [ "dc:subject", ".", "category", "@term" ],
	    "links" : {
		"alternate" : [ "link[rel='alternate']", "@href" ],
		"enclosure" : [ "link[rel='enclosure']", "@href", "media:content", "@url" ]
	    }
	}]
    };

    var rssTemplate = {
	"title" : "channel > title",
	"logo" : "channel > logo",
	"updated" : "channel > lastBuildDate",
	"description" : "channel > desription",
	"link" : "channel > link",
	"entries" : [ "channel > item", {
	    "id": "guid",
	    "title": "title",
	    "summary": "summary",
	    "content": "content",
	    "published" : "pubDate",
	    "updated" : "updated",
	    "authors"   : [ "author", { "email" : "."} ],
	    "categories": [ "category", "." ],
	    "links" : {
		"alternate" : [ "link", "." ],
		"enclosure" : [ ]
	    }
	}]
    };
            
    return {
	parse : function(xmlDocument) {
	    var result = null;
	    if (xmlDocument.getElementsByTagName("rss").length == 1) {
		result = domToJs.parse(xmlDocument, rssTemplate);
	    } else {
		result = domToJs.parse(xmlDocument, atomTemplate);
	    }
	    console.log(result);
	    return result;
	}
    };
    
})();


