// Copyright Dave Kahler. Do not copy without permission.

if(!com) var com={};
if(!com.dakahler) com.dakahler={};
if(!com.dakahler.tp) com.dakahler.tp={};
if(!com.dakahler.tp.history) com.dakahler.tp.history={};

com.dakahler.tp.history = {

	tpHistoryInit: function()
	{
		const FIREFOX_ID = "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}";
		const THUNDERBIRD_ID = "{3550f703-e582-4d05-9a08-453d09bdfdc6}";
		var appInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
		
		if (appInfo.ID == THUNDERBIRD_ID)
		{
			com.dakahler.tp.functionLib.gInThunderbird = true;
			
			if (document.getElementById("messagepanebox"))
			{
				com.dakahler.tp.functionLib.gHasThunderbrowse = document.getElementById("messagepanebox").hasAttribute("thunderbrowse");
			}
		}
		else
		{
			com.dakahler.tp.functionLib.gInThunderbird = false;
		}

		var myTPPrefs = Components.classes["@mozilla.org/preferences-service;1"].
						getService(Components.interfaces.nsIPrefService).getBranch("trackpackage.");
					
		var historyString = myTPPrefs.getCharPref("tpTrackingHistory");

		var historyArray = com.dakahler.tp.history.tpBuildHistoryArray(historyString);
		
		// Populate list box
		com.dakahler.tp.history.tpPopulateListBox(historyArray);
		
		if (com.dakahler.tp.functionLib.tpGetGMapsSetting())
		{
			var menuitem = document.createElement('button');
			menuitem.setAttribute('id',"mapButton");
			menuitem.setAttribute('label',"Map Selected");
			menuitem.setAttribute('oncommand',"com.dakahler.tp.history.tpHistoryMapTrack();");
			menuitem.setAttribute('style',"width: 120px; height: 30px;");
			
			if (document.getElementById("buttonhbox"))
				document.getElementById("buttonhbox").appendChild(menuitem);
				
		}
	},

	tpBuildHistoryArray: function(historyString)
	{
		return(historyString.split(";"));
	},

	tpBuildHistoryString: function(historyArray)
	{
		return(historyArray.join(";"));
	},

	tpGetStringFromHistoryContents: function()
	{
		var myListbox = document.getElementById("historyListbox");
		var finalString = "";
		
		for (index=0;index<myListbox.getRowCount();index++)
		{
			var row = myListbox.getItemAtIndex(index);
			var nodes = row.childNodes;
			var rowString = "";
			for (node=0;node<nodes.length;node++)
			{
				if (node<nodes.length-1)
					rowString += nodes.item(node).localName + ",";
				else
					rowString += nodes.item(node).localName;
			}
			
			if (index<myListbox.getRowCount()-1)
				finalString += rowString + ",";
			else
				finalString += rowString;
		}
		
		return(finalString);
	},

	tpPopulateListBox: function(historyArray)
	{
		for (var index=0;index<historyArray.length;index++)
		{
			// Grab individual cells for this row
			var rowString = historyArray[index];
			var rowArray = rowString.split(",");
			
			var numItems = 4;
			
			var row = document.createElement('listitem');
			row.setAttribute('allowevents',true);
			for (var cellIndex=0;cellIndex<numItems;cellIndex++)
			{
				if (cellIndex == 0)
				{
					// Special case for drop-down carrier field
					var cell = document.createElement('menulist');
					var menupopup = document.createElement('menupopup');
					cell.appendChild(menupopup);
					
					// Add all carriers to drop-down list
					var regexURLArray = com.dakahler.tp.functionLib.tpGetRegexURLArray();
					var carrier;
					var sIndex = 0;
					for (var i=0;i<regexURLArray.length;i++)
					{
						if (regexURLArray[i][1]=="" && carrier.length==0)
							continue;

						carrier=regexURLArray[i][0];
						var menuitem = document.createElement('menuitem');
						menuitem.setAttribute('label',carrier);
						
						if (carrier == rowArray[cellIndex])
							menuitem.setAttribute('selected',true);
							
						menupopup.appendChild(menuitem);
					}

					row.appendChild(cell);
				}
				else if (cellIndex < numItems - 1)
				{
					var cell = document.createElement('listcell');
					
					// Abort!!
					if (rowArray[cellIndex]==undefined)
						return;
					
					cell.setAttribute('label', rowArray[cellIndex] );
					row.appendChild( cell );
				}
				else
				{
					// Special case for user-editable "Info" field
					var infoCell = document.createElement('textbox');
					infoCell.setAttribute('allowevents',true);
					
					if (rowArray[cellIndex] != undefined)
						infoCell.setAttribute('value', rowArray[cellIndex] );
					else
						infoCell.setAttribute('value', "" );

					row.appendChild( infoCell );
				}
			}
			
			document.getElementById("historyListbox").appendChild( row );
			
			row.addEventListener("dblclick",com.dakahler.tp.history.tpHistoryTrack,true);
		}
	},

	tpHistoryKeyDown: function(e)
	{
		if (e.keyCode == 46) // delete
		{
			if(!confirm("Are you sure you want to delete the selected item(s)?"))
				return;
		
			var myListbox = document.getElementById("historyListbox");
			var items = myListbox.selectedItems;
			
			while (myListbox.selectedIndex!=-1)
			{
				myListbox.removeItemAt(myListbox.selectedIndex);
			}
		}
	},

	onCloseHistory: function()
	{
		var myListbox = document.getElementById("historyListbox");
		var historyArray = new Array();
		for (var index=0;index<myListbox.getRowCount();index++)
		{
			var item = myListbox.getItemAtIndex(index);
			var nodes = item.childNodes;
			var carrier =  nodes.item(0).getAttribute('label');
			var trackingString =  nodes.item(1).getAttribute('label');
			var date =  nodes.item(2).getAttribute('label');
			var info =  nodes.item(3).value;
			
			//var regex = new RegExp(";|,");
			info = info.replace(/[\;\,]+/," ");
			
			if (info!="")
				historyArray[historyArray.length] = carrier  + "," + trackingString  + "," + date  + "," + info;
			else
				historyArray[historyArray.length] = carrier  + "," + trackingString  + "," + date;
		}
		
		var historyPref = historyArray.join(";");
		
		var myTPPrefs = Components.classes["@mozilla.org/preferences-service;1"].
						getService(Components.interfaces.nsIPrefService).getBranch("trackpackage.");
		
		myTPPrefs.setCharPref("tpTrackingHistory",historyPref);
	},

	tpHistoryTrack: function()
	{
		var myListbox = document.getElementById("historyListbox");
		var items = myListbox.selectedItems;
		
		for (var index=0;index<items.length;index++)
		{
			var nodes = items[index].childNodes;
			var carrier =  nodes.item(0).getAttribute("label");
			var trackingString =  nodes.item(1).getAttribute("label");
			var date =  nodes.item(2).getAttribute("label");
			
			var url = com.dakahler.tp.functionLib.tpGetPackageURL(carrier,trackingString,false);
			
			if (url!="")
			{
				if (items.length>1)
				{
					com.dakahler.tp.functionLib.tpOpenPackageWindow(url,true, false);
				}
				else
				{
					if (!com.dakahler.tp.functionLib.tpGetTabSetting())
						com.dakahler.tp.functionLib.tpOpenPackageWindow(url,false, false);
					else
						com.dakahler.tp.functionLib.tpOpenPackageWindow(url,true, false);
				}
			}
		}
	},

	tpHistoryMapTrack: function()
	{
		var myListbox = document.getElementById("historyListbox");
		var items = myListbox.selectedItems;
		
		for (var index=0;index<items.length;index++)
		{
			var nodes = items[index].childNodes;
			var carrier =  nodes.item(0).getAttribute("label");
			var trackingString =  nodes.item(1).getAttribute("label");
			var date =  nodes.item(2).getAttribute("label");

			if (items.length>1)
			{
				com.dakahler.tp.functionLib.tpHistoryOpenMap(carrier,trackingString,true);
			}
			else
			{
				if (!com.dakahler.tp.functionLib.tpGetTabSetting())
					com.dakahler.tp.functionLib.tpHistoryOpenMap(carrier,trackingString,false);
				else
					com.dakahler.tp.functionLib.tpHistoryOpenMap(carrier,trackingString,true);
			}
		}
	},

	tpClearHistory: function()
	{
		if (confirm("Are you sure you want to clear your tracking history?"))
		{
			var myTPPrefs = Components.classes["@mozilla.org/preferences-service;1"].
							getService(Components.interfaces.nsIPrefService).getBranch("trackpackage.");
							
			if (myTPPrefs.prefHasUserValue("tpTrackingHistory"))
			{
				myTPPrefs.setCharPref("tpTrackingHistory","");
				
				var listBox = document.getElementById("historyListbox");
				var numElements = listBox.getRowCount();
				for (var index=0;index<numElements;index++)
				{
					listBox.removeItemAt(0);
				}
			}
			else
			{
				alert("Preferences error! Please email support@trackpackageextension.com");
			}
		}
	},

	tpOpenHistoryOptions: function()
	{
		window.open("chrome://trackpackage/content/tpPrefDialog.xul", "prefdialog", "chrome,screenX=150,screenY=150");
	},
	
}

window.addEventListener("load",com.dakahler.tp.history.tpHistoryInit,false);
