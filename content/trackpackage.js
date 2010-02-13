// Copyright Dave Kahler. Do not copy without permission.

window.addEventListener("load",tpInit,false);
window.addEventListener("unload", tpUnload, false);


function tpInit() {

	tpUninstallObserver.register();
	
	const FIREFOX_ID = "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}";
	const THUNDERBIRD_ID = "{3550f703-e582-4d05-9a08-453d09bdfdc6}";
	var appInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
	
	if (appInfo.ID == THUNDERBIRD_ID)
	{
		gInThunderbird = true;
		if (document.getElementById("messagePaneContext") != null)
			document.getElementById("messagePaneContext").addEventListener("popupshowing",tpHide,false);
		else if (document.getElementById("mailContext") != null)
			document.getElementById("mailContext").addEventListener("popupshowing",tpHide,false);
			
		if (document.getElementById("msgComposeContext") != null)
			document.getElementById("msgComposeContext").addEventListener("popupshowing",tpHide,false);
	}
	else
	{
		document.getElementById("contentAreaContextMenu").addEventListener("popupshowing",tpHide,false);
	}
	
	var myTPPrefs = Components.classes["@mozilla.org/preferences-service;1"].
					getService(Components.interfaces.nsIPrefService).getBranch("trackpackage.");
	
	if (!myTPPrefs.prefHasUserValue("tpCheckBox"))
		myTPPrefs.setCharPref("tpCheckBox",true);
	
	if (!myTPPrefs.prefHasUserValue("tpSmartSense"))
		myTPPrefs.setCharPref("tpSmartSense",true);
		
	if (!myTPPrefs.prefHasUserValue("tpNotifications"))
		myTPPrefs.setCharPref("tpNotifications",true);
		
	if (!myTPPrefs.prefHasUserValue("tpTrackingHistory"))
		myTPPrefs.setCharPref("tpTrackingHistory","");
		
	if (!myTPPrefs.prefHasUserValue("tpMaxNumbers"))
		myTPPrefs.setCharPref("tpMaxNumbers","25");
		
	if (!myTPPrefs.prefHasUserValue("tpEnableGMaps"))
		myTPPrefs.setCharPref("tpEnableGMaps",false);
		
	if (!myTPPrefs.prefHasUserValue("tpRegex"))
		myTPPrefs.setCharPref("tpRegex",regexDefaults);
		
	if (!myTPPrefs.prefHasUserValue("tpURL"))
		myTPPrefs.setCharPref("tpURL",URLDefaults);
		
	if (!myTPPrefs.prefHasUserValue("tpUpdateURL"))
		myTPPrefs.setCharPref("tpUpdateURL","http://www.trackpackageextension.com/defs/defaults.xml");
		
		
	// Add necessary items to explicit tracking menu
//	var regexURLArray = tpGetRegexURLArray();
//	for (var i=0;i<regexURLArray.length;i++)
//	{
//		var menuitem = document.createElement('menuitem');
//		menuitem.setAttribute('id',regexURLArray[i][0]);
//		menuitem.setAttribute('label',"Track " + regexURLArray[i][0] + " Package");
//		menuitem.setAttribute('oncommand',"tpOpenPackageWindow(tpGetPackageURL('"+regexURLArray[i][0]+"','',true),false,false)");
//		document.getElementById("explicitpopup").appendChild(menuitem);
//	}
	
	
	// Add google maps option if necessary
	
	if (tpGetGMapsSetting())
	{
		var menuitem = document.createElement('menuitem');
		menuitem.setAttribute('id',"trackgmaps");
		menuitem.setAttribute('label',"Track with Google Maps");
		menuitem.setAttribute('oncommand',"tpTrackGoogleMaps();");
		
		if (document.getElementById("contentAreaContextMenu"))
			document.getElementById("contentAreaContextMenu").appendChild(menuitem);
			
		if (document.getElementById("messagePaneContext"))
			document.getElementById("messagePaneContext").appendChild(menuitem);
			
		if (document.getElementById("mailContext"))
			document.getElementById("mailContext").appendChild(menuitem);
			
	}

}

function tpUnload()
{
	tpUninstallObserver.deregister();
}

function tpHide() {
	var smartSense = tpGetSmartSenseSetting();
	var trackingString=tpGetTrackingString();
    var carrier = tpGetPackageCarrier(trackingString);
	var showTrack = (tpGetPackageURL(carrier,trackingString,false)!="" || !smartSense);
	var tpItem = document.getElementById("trackpackage");
	var gmapsItem = document.getElementById("trackgmaps");
	var explicitItem = document.getElementById("explicitmenu");

	//if (smartSense) {
		if (tpItem)
			tpItem.hidden = !showTrack && smartSense;
		
		if (gmapsItem)
			gmapsItem.hidden = !showTrack && smartSense;
			
		if (explicitItem)
			explicitItem.hidden = true;
	//}
//	else {
//		//gContextMenu.showItem("explicitmenu", showTrack );
//		//gContextMenu.showItem("trackpackage", false );
//		
//		if (gmapsItem)
//			gContextMenu.showItem("trackgmaps", false );
//			
//		if (tpItem)
//			tpItem.hidden = !showTrack;
//		
//		if (gmapsItem)
//			gmapsItem.hidden = true;
//			
//		if (explicitItem)
//			explicitItem.hidden = !showTrack;
//	}
}

function tpLinkNumbers()
{
	var workingHTML;
	
	if (!gInThunderbird)
	{
		workingHTML = content.document.getElementsByTagName("body").item(0).innerHTML;
	}
	else
	{
	
		var windowManager = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(nsIWindowMediator);
		var messengerWindowList = windowManager.getEnumerator("mail:3pane");
		var messageWindowList = windowManager.getEnumerator("mail:messageWindow");
		var messageURI = GetFirstSelectedMessage();
		var messageBody="";
		if (messageURI != null && messageURI != "") {
		 while (true) {
		  if (messengerWindowList.hasMoreElements()) {
		   win = messengerWindowList.getNext();
		  } else if (messageWindowList.hasMoreElements()) {
		   win = messageWindowList.getNext();
		  } else {
		   break;
		  }
		  loadedMessageURI = win.GetLoadedMessage();
		  if (loadedMessageURI != messageURI) continue;
		  brwsr = win.getMessageBrowser();
		  if (!brwsr) continue;
		  messageBody = brwsr.docShell.contentViewer.DOMDocument.body.textContent; break;
		 }
		} 

		if (messageBody.length>0)
			workingHTML = brwsr.docShell.contentViewer.DOMDocument.body.innerHTML;
	}
	
	var regexURLArray = tpGetRegexURLArray();
	var resultArray = new Array();
	var dividedHTML = workingHTML.split(/\s|\t|\n|\r|\f|(<([^<>]*)>)/);
	var tempArray = new Array();
	for (var i=0;i<regexURLArray.length;i++)
	{
		var stringregex = regexURLArray[i][1];
		
		if (stringregex.length==0)
			continue;

		var regex = new RegExp(stringregex,"gi");
		var foundOne=false;
		for (var j=0;j<dividedHTML.length;j++)
		{
			if (dividedHTML[j].match(regex))
			{
				var length = tempArray.length;
				tempArray[length] = new Array();
				tempArray[length][0] = tpRemoveSpaces(dividedHTML[j]);
				tempArray[length][1] = regexURLArray[i][2];
				tempArray[length][2] = regexURLArray[i][3];
				
			}
		}
	}
	
	// remove duplicates
	var newlist = new Array();
	var newIndex=0;
	for (var index=0; index<tempArray.length; index++)
	{
		var foundDuplicate=false;
		for (var index2=0; index2<newlist.length; index2++)
		{
			if (tempArray[index][0]==newlist[index2][0])
			{
				foundDuplicate=true;
				break;
			}
		}
		
		if (!foundDuplicate)
		{
			newlist[newIndex] = new Array();
			newlist[newIndex][0] = tempArray[index][0];
			newlist[newIndex][1] = tempArray[index][1];
			newlist[newIndex][2] = tempArray[index][2];
			newIndex++;
		}
	}

	for (var index=0;index<newlist.length;index++)
	{
		var regexp = new RegExp(newlist[index][0]);
		var url = "<a href=\"" + newlist[index][1] + newlist[index][0] + newlist[index][2] + "\">" + newlist[index][0] + "</a>";
		workingHTML = workingHTML.replace(regexp,url);
	}
	
	
	if (!gInThunderbird)
	{
		content.document.getElementsByTagName("body").item(0).innerHTML = workingHTML;
	}
	else
	{
		brwsr = win.getMessageBrowser();
		if (brwsr)
			brwsr.docShell.contentViewer.DOMDocument.body.innerHTML = workingHTML;
	}
}


var tpUninstallObserver =
{
	observe:function(subject,topic,data)
	{
		subject = subject.QueryInterface(Components.interfaces.nsIUpdateItem);

		if (subject.name == "Track Package" && data == "item-uninstalled")
		{
			// uninstall clean-up script
			var myTPPrefs = Components.classes["@mozilla.org/preferences-service;1"].
							getService(Components.interfaces.nsIPrefService).getBranch("trackpackage.");
							
			myTPPrefs.deleteBranch("");
		}
	},

	register:function()
	{
		var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
		observerService.addObserver(this, "em-action-requested", false);
	},

	deregister:function()
	{
		var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
		observerService.removeObserver(this,"em-action-requested");
	}
};




























