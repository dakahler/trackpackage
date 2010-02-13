// Copyright Dave Kahler. Do not copy without permission.

var tpPrefs = Components.classes["@mozilla.org/preferences-service;1"].
				getService(Components.interfaces.nsIPrefService).getBranch("trackpackage.");

var observerService = Components.classes["@mozilla.org/observer-service;1"].
						getService(Components.interfaces.nsIObserverService);
						
var tpXMLObject = null
						
function tpLoadSettings()
{
    document.getElementById("tpCheckBox").
		setAttribute("checked", tpPrefs.getCharPref("tpCheckBox"));
		
	document.getElementById("tpSmartSense").
		setAttribute("checked", tpPrefs.getCharPref("tpSmartSense"));
		
	document.getElementById("tpNotifications").
		setAttribute("checked", tpPrefs.getCharPref("tpNotifications"));
		
	document.getElementById("tpMaxNumbers").
		setAttribute("value", tpPrefs.getCharPref("tpMaxNumbers"));
		
	document.getElementById("tpEnableGMaps").
		setAttribute("checked", tpPrefs.getCharPref("tpEnableGMaps"));
		
	document.getElementById("tpUpdateURL").
		setAttribute("value", tpPrefs.getCharPref("tpUpdateURL"));
		
		
	var regexListbox = document.getElementById("regexListbox");

	// Loop through regex defines
	var regexesArray = tpPrefs.getCharPref("tpRegex").split(";");
	for (var i=0;i<regexesArray.length;i++)
	{
		var carrierRegex = tpExtractQuotedStrings(regexesArray[i]);
		
		if (carrierRegex=="")
			return;
		
		var newCarrierField = document.createElement("textbox");
		var newRegexField = document.createElement("textbox");
		
		var row = document.createElement('listitem');
		row.setAttribute('allowevents',true);
		var carrierCell = document.createElement('textbox');
		carrierCell.setAttribute('value', carrierRegex[0] );
		var regexCell = document.createElement('textbox');
		regexCell.setAttribute('value', carrierRegex[1] );
		
		row.appendChild( carrierCell );
		row.appendChild( regexCell );

		regexListbox.appendChild(row);
	}
	
	
	var urlListbox = document.getElementById("urlListbox");

	// Loop through URL defines
	var urlArray = tpPrefs.getCharPref("tpURL").split(";");
	for (var i=0;i<urlArray.length;i++)
	{
		var carrierURL = tpExtractQuotedStrings(urlArray[i]);
		
		if (carrierURL=="")
			return;
			
		var newCarrierField = document.createElement("textbox");
		var newURLFrontField = document.createElement("textbox");
		var newURLBackField = document.createElement("textbox");
		
		var row = document.createElement('listitem');
		row.setAttribute('allowevents',true);
		var carrierCell = document.createElement('textbox');
		carrierCell.setAttribute('value', carrierURL[0] );
		var urlFrontCell = document.createElement('textbox');
		urlFrontCell.setAttribute('value', carrierURL[1] );
		var urlBackCell = document.createElement('textbox');
		urlBackCell.setAttribute('value', carrierURL[2] );

		row.appendChild( carrierCell );
		row.appendChild( urlFrontCell );
		row.appendChild( urlBackCell );

		urlListbox.appendChild(row);
	}

}

function tpSaveSettings()
{

    tpPrefs.setCharPref("tpCheckBox",
		document.getElementById("tpCheckBox").checked);
		
	tpPrefs.setCharPref("tpSmartSense",
		document.getElementById("tpSmartSense").checked);
		
	tpPrefs.setCharPref("tpNotifications",
		document.getElementById("tpNotifications").checked);
		
	tpPrefs.setCharPref("tpMaxNumbers",
		document.getElementById("tpMaxNumbers").value);
		
	tpPrefs.setCharPref("tpEnableGMaps",
		document.getElementById("tpEnableGMaps").checked);
		
	tpPrefs.setCharPref("tpUpdateURL",
		document.getElementById("tpUpdateURL").value);
		
		
	var myListbox = document.getElementById("regexListbox");
	var regexPrefArray = new Array();
	var regexCarrierArray = new Array();
	for (var index=0;index<myListbox.getRowCount();index++)
	{
		var item = myListbox.getItemAtIndex(index);
		var nodes = item.childNodes;
		var carrier =  nodes.item(0).value;
		var regex =  nodes.item(1).value;		
		regexPrefArray[regexPrefArray.length] = "\"" + carrier + "\"" + "," + "\"" + regex + "\"";
		regexCarrierArray[regexCarrierArray.length] = carrier;
	}
	
	var regexPref = regexPrefArray.join(";");
	
	
	myListbox = document.getElementById("urlListbox");
	var urlPrefArray = new Array();
	var urlCarrierArray = new Array();
	for (var index=0;index<myListbox.getRowCount();index++)
	{
		var item = myListbox.getItemAtIndex(index);
		var nodes = item.childNodes;
		var carrier =  nodes.item(0).value;
		var urlFront =  nodes.item(1).value;
		var urlBack =  nodes.item(2).value;
		
		urlPrefArray[urlPrefArray.length] = "\"" + carrier + "\"" + "," + "\"" + urlFront + "\"" + "," + "\"" + urlBack + "\"";
		urlCarrierArray[urlCarrierArray.length] = carrier;
	}
	
	var urlPref = urlPrefArray.join(";");
	
	// Make sure all regex's have matching URL's
	for (var i=0;i<regexCarrierArray.length;i++)
	{
		var foundMatch=false;
		for (var j=0;j<urlCarrierArray.length;j++)
		{
			if (regexCarrierArray[i]==urlCarrierArray[j])
			{
				foundMatch=true;
				break;
			}
		}
		
		if (!foundMatch)
		{
			alert("URL match for regex not found for carrier " + regexCarrierArray[i] + "! Check your case?");
			return false;
		}
	}
	
	
	tpPrefs.setCharPref("tpURL",urlPref);
	tpPrefs.setCharPref("tpRegex",regexPref);

    observerService.notifyObservers(null, "trackpackage-settings", "changed");

    return true;
}

function tpAddNewRegex()
{
	var regexListbox = document.getElementById("regexListbox");
	var row = document.createElement('listitem');
	row.setAttribute('allowevents',true);
	var carrierCell = document.createElement('textbox');
	carrierCell.setAttribute('value', "" );
	var regexCell = document.createElement('textbox');
	regexCell.setAttribute('value', "" );
	
	row.appendChild( carrierCell );
	row.appendChild( regexCell );

	regexListbox.appendChild(row);
}

function tpDeleteRegex()
{
	var regexListbox = document.getElementById("regexListbox");
	regexListbox.removeItemAt(regexListbox.selectedIndex);
}

function tpAddNewURL()
{
	var urlListbox = document.getElementById("urlListbox");
	var row = document.createElement('listitem');
	row.setAttribute('allowevents',true);
	var carrierCell = document.createElement('textbox');
	carrierCell.setAttribute('value', "" );
	var urlFrontCell = document.createElement('textbox');
	urlFrontCell.setAttribute('value', "" );
	var urlBackCell = document.createElement('textbox');
	urlBackCell.setAttribute('value', "" );
	
	row.appendChild( carrierCell );
	row.appendChild( urlFrontCell );
	row.appendChild( urlBackCell );

	urlListbox.appendChild(row);
}

function tpDeleteURL()
{
	var urlListbox = document.getElementById("urlListbox");
	urlListbox.removeItemAt(urlListbox.selectedIndex);
}

function tpResetRegexDefaults()
{

	if(!confirm("Are you sure you want to reset regular expressions to defaults? This cannot be undone!"))
		return;

	tpPrefs.setCharPref("tpRegex",regexDefaults);
	
	var regexListbox = document.getElementById("regexListbox");
	
	// Delete existing items
	var numElements = regexListbox.getRowCount();
	for (var index=0;index<numElements;index++)
	{
		regexListbox.removeItemAt(0);
	}
	
	// Loop through regex defines
	var regexesArray = tpPrefs.getCharPref("tpRegex").split(";");
	for (var i=0;i<regexesArray.length;i++)
	{
		var carrierRegex = tpExtractQuotedStrings(regexesArray[i]);
		var newHBox = document.createElement("hbox");
		var newCarrierField = document.createElement("textbox");
		var newRegexField = document.createElement("textbox");
		
		var row = document.createElement('listitem');
		row.setAttribute('allowevents',true);
		var carrierCell = document.createElement('textbox');
		carrierCell.setAttribute('value', carrierRegex[0] );
		var regexCell = document.createElement('textbox');
		regexCell.setAttribute('value', carrierRegex[1] );
		
		row.appendChild( carrierCell );
		row.appendChild( regexCell );

		regexListbox.appendChild(row);
	}
}

function tpResetURLDefaults()
{

	if(!confirm("Are you sure you want to reset URLs to defaults? This cannot be undone!"))
		return;

	tpPrefs.setCharPref("tpURL",URLDefaults);
	
	var urlListbox = document.getElementById("urlListbox");
	
	// Delete existing items
	var numElements = urlListbox.getRowCount();
	for (var index=0;index<numElements;index++)
	{
		urlListbox.removeItemAt(0);
	}

	// Loop through URL defines
	var urlArray = tpPrefs.getCharPref("tpURL").split(";");
	for (var i=0;i<urlArray.length;i++)
	{
		var carrierURL = tpExtractQuotedStrings(urlArray[i]);
		var newHBox = document.createElement("hbox");
		var newCarrierField = document.createElement("textbox");
		var newURLFrontField = document.createElement("textbox");
		var newURLBackField = document.createElement("textbox");
		
		var row = document.createElement('listitem');
		row.setAttribute('allowevents',true);
		var carrierCell = document.createElement('textbox');
		carrierCell.setAttribute('value', carrierURL[0] );
		var urlFrontCell = document.createElement('textbox');
		urlFrontCell.setAttribute('value', carrierURL[1] );
		var urlBackCell = document.createElement('textbox');
		urlBackCell.setAttribute('value', carrierURL[2] );
		
		row.appendChild( carrierCell );
		row.appendChild( urlFrontCell );
		row.appendChild( urlBackCell );

		urlListbox.appendChild(row);
	}
}

function tpUpdateDefs()
{
	if(!confirm("Are you sure you want to perform a preference internet update?\nThis will overwrite current regex/URL preferences and cannot be undone."))
		return;

	var xmldoc = document.implementation.createDocument("", "", null);
	xmldoc.addEventListener("load", function(event){processXML(event.currentTarget)}, false);
	
	var req = new XMLHttpRequest();
	tpXMLObject = req;
	req.open('GET', document.getElementById("tpUpdateURL").value, false);
	req.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
	req.onload = processXML;
	req.onerror = xmlLoadError;
	req.send(null);
	
	
	//if (!xmldoc.load(document.getElementById("tpUpdateURL").value))
	//	xmlLoadError();
}

function tpSaveXML()
{
	const nsIFilePicker = Components.interfaces.nsIFilePicker;
	var filePicker   = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	filePicker.init(window, "Save As", filePicker.modeSave);
	filePicker.appendFilters(nsIFilePicker.filterXML);
	filePicker.defaultExtension = "xml";
	filePicker.defaultString = "customXML";
	
	var result = filePicker.show();
    
    if(result == filePicker.returnOK || result == filePicker.returnReplace) {

		var finalXML = "<?xml version=\"1.0\"?>\n\n";
		
		finalXML += "<trackpackage>\n\n";
		
		var regexURLArray = tpGetRegexURLArray();
		
		for (var i=0;i<regexURLArray.length;i++)
		{
			if (regexURLArray[i][1]=="")
				continue;
			
			finalXML += "\t<regex carrier=\"" + regexURLArray[i][0] + "\" value=\"" + regexURLArray[i][1] + "\" />\n";
		}
		
		finalXML += "\n";
		
		for (var i=0;i<regexURLArray.length;i++)
		{
			finalXML += "\t<url carrier=\"" + regexURLArray[i][0] + "\" front=\"" + regexURLArray[i][2] + "\" back=\"" + regexURLArray[i][3] + "\" />\n";
		}
		
		finalXML += "\n";
		
		finalXML += "</trackpackage>\n";
		
		var regex = new RegExp("&","gi");
		finalXML = finalXML.replace(regex,"&amp;");
		
		
		// file is nsIFile, data is a string
		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
		                         .createInstance(Components.interfaces.nsIFileOutputStream);
								 
		var file = Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);
					 
		file.initWithPath(filePicker.file.path);

		// use 0x02 | 0x10 to open file for appending.
		foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate
		foStream.write(finalXML, finalXML.length);
		foStream.close();
    }
}

function xmlLoadError()
{
	alert("Error loading XML file. Check your URL or try again later.");
}

function processXML(xmlDoc)
{
	if (!tpXMLObject.responseXML)
	{
		xmlLoadError();
		return;
	}

	var rootNode = tpXMLObject.responseXML.firstChild;
	
	if (!rootNode)
	{
		xmlLoadError()
		return;
	}

	if (rootNode.nodeName=="parsererror")
	{
		xmlLoadError()
		return;
	}
	
	var nodes = rootNode.childNodes;
	var regexArray = new Array();
	var urlArray = new Array();
	for (var i=0;i<nodes.length;i++)
	{
		var node = nodes.item(i);
		var name = node.nodeName;
		
		if (name=="regex")
		{
			var carrier = node.getAttribute("carrier");
			var value = node.getAttribute("value");
			
			regexArray[regexArray.length] = "\"" + carrier + "\",\"" + value + "\"";
		}
		
		if (name=="url")
		{
			var carrier = node.getAttribute("carrier");
			var front = node.getAttribute("front");
			var back = node.getAttribute("back");
			
			urlArray[urlArray.length] = "\"" + carrier + "\",\"" + front + "\",\"" + back + "\"";
		}
	}
	
	var finalRegexString = regexArray.join(";");
	var finalURLString = urlArray.join(";");

	tpPrefs.setCharPref("tpRegex",finalRegexString);
	tpPrefs.setCharPref("tpURL",finalURLString);
	
	// Delete existing items
	var regexListbox = document.getElementById("regexListbox");
	var numElements = regexListbox.getRowCount();
	for (var index=0;index<numElements;index++)
	{
		regexListbox.removeItemAt(0);
	}
	
	// Delete existing items
	var urlListbox = document.getElementById("urlListbox");
	var numElements = urlListbox.getRowCount();
	for (var index=0;index<numElements;index++)
	{
		urlListbox.removeItemAt(0);
	}
	
	tpLoadSettings();
	
	alert("Successfully loaded remote XML preferences!");
}

























