{
	"configurationSettings": [{
		"category": "General",
		"fields": [{
			"type": "webmap"
		}, {
			"type": "appproxies"
		}, {
			"placeHolder": "Defaults to web map title",
			"label": "Title:",
			"fieldName": "title",
			"type": "string",
			"tooltip": "Defaults to web map title"
		}, {
			"placeHolder": "Description",
			"label": "Description:",
			"fieldName": "description",
			"type": "string",
			"tooltip": "Defaults to web map snippet",
			"stringFieldOption": "richtext"
		}, {
			"type": "conditional",
			"condition": false,
			"fieldName": "splashModal",
			"tooltip": "Enable Splash Screen",
			"label": "Splash Screen",
			"items": [{
				"type": "string",
				"fieldName": "splashTitle",
				"label": "Splash screen title",
				"tooltip": "Define splash screen title"
			}, {
				"type": "string",
				"fieldName": "splashContent",
				"label": "Splash screen content text",
				"tooltip": "Define splash screen content",
				"stringFieldOption": "richtext"
			}, {
				"type": "string",
				"fieldName": "splashButtonText",
				"label": "Splash screen button text",
				"tooltip": "Define button text"
			}]
		}]
	}, {
		"category": "Theme",
		"fields": [{
			"type": "subcategory",
			"label": "Colors"
		}, {
			"type": "paragraph",
			"value": "Define background and text colors for the app"
		}, {
			"type": "color",
			"fieldName": "background",
			"tooltip": "Choose a background color",
			"label": "Background color",
			"sharedThemeProperty": "header.background"
		}, {
			"type": "string",
			"fieldName": "backgroundOpacity",
			"tooltip": "Specify background opacity using a value between 0 and 1",
			"label": "Background opacity"
		}, {
			"type": "color",
			"fieldName": "color",
			"tooltip": "Choose a text color",
			"label": "Text color",
			"sharedThemeProperty": "header.text"
		}, {
			"type": "subcategory",
			"label": "Profile Theme"
		}, {
			"type": "paragraph",
			"value": "Specify custom colors for the elevation profile chart. Default color scheme is blue/gray"
		}, {
			"type": "color",
			"fieldName": "axisFontColor",
			"tooltip": "Choose text color for the axis",
			"label": "Axis font color"
		}, {
			"type": "color",
			"fieldName": "axisMajorTickColor",
			"tooltip": "Choose tick color",
			"label": "Axis major tick color"
		}, {
			"type": "color",
			"fieldName": "elevationBottomColor",
			"tooltip": "Specify bottom elevation color",
			"label": "Elevation bottom color"
		}, {
			"type": "color",
			"fieldName": "elevationTopColor",
			"tooltip": "Specify top elevation color",
			"label": "Elevation top color"
		}, {
			"type": "color",
			"fieldName": "skyBottomColor",
			"tooltip": "Specify sky bottom color",
			"label": "Sky bottom color"
		}, {
			"type": "color",
			"fieldName": "skyTopColor",
			"tooltip": "Specify sky top color",
			"label": "Sky top color"
		}, {
			"type": "subcategory",
			"label": "Layout Options"
		}, {
			"type": "string",
			"fieldName": "panelLocation",
			"label": "Elevation profile location",
			"tooltip": "Specify profile panel location",
			"options": [{
				"label": "Bottom Center",
				"value": "bottom-center"
			}, {
				"label": "Top Center",
				"value": "top-center"
			}]
		}, {
			"type": "radio",
			"fieldName": "customLayout",
			"label": "Custom Layout",
			"items": [{
				"label": "Default",
				"value": "default",
				"checked": true
			}, {
				"label": "Full Width Profile",
				"value": "fullprofile"
			}]
		}, {
			"type": "paragraph",
			"value": "Use the Custom css option to paste css that overwrites rules in the app."
		}, {
			"type": "string",
			"fieldName": "customstyle",
			"tooltip": "Enter custom css",
			"label": "Custom css"
		}]
	}, {
		"category": "Options",
		"fields": [{
			"type": "conditional",
			"condition": false,
			"fieldName": "legend",
			"label": "Enable legend",
			"tooltip": "Display legend",
			"items": [{
				"type": "boolean",
				"fieldName": "includelayeropacity",
				"label": "Enable opacity slider in legend"
			}]
		}, {
			"type": "boolean",
			"fieldName": "share",
			"label": "Share Dialog",
			"tooltip": "Display share dialog"
		}, {
			"type": "paragraph",
			"value": "Basemap Switcher: Choose one.  If both basemap gallery and basemap toggle are selected only the toggle will display."
		}, {
			"type": "boolean",
			"fieldName": "basemaps",
			"tooltip": "Enable basemap gallery",
			"label": "Basemap Gallery"
		}, {
			"type": "conditional",
			"condition": false,
			"fieldName": "basemapToggle",
			"label": "Basemap Toggle",
			"items": [{
				"type": "basemaps",
				"fieldName": "alt_basemap",
				"tooltip": "Select the alternate basemap",
				"label": "Alternate Basemap"
			}]
		}]
	}, {
		"category": "Elevation Profile",
		"fields": [{
			"type": "string",
			"fieldName": "units",
			"tooltip": "Select elevation profile units",
			"label": "Elevation profile units",
			"options": [{
				"label": "Kilometers",
				"value": "metric"
			}, {
				"label": "Miles",
				"value": "english"
			}]
		}, {
			"type": "boolean",
			"fieldName": "elevationDraw",
			"label": "Display draw tool",
			"tooltip": "Draw a line to generate an elevation profile"
		}, {
			"type": "paragraph",
			"value": "This application uses the Elevation Analysis <a target=\"_blank\" href=\"https://developers.arcgis.com/rest/elevation/api-reference/profilesync.htm\"> Profile Task</a> to generate the elevation values along the profile.  It can be configured to consume a custom profile task. Learn more about <a target=\"_blank\" href=\"http://blogs.esri.com/esri/arcgis/2014/08/26/setting-up-your-own-profile-service \">setting up your own Profile Service.</a> "
		}, {
			"type": "string",
			"fieldName": "customProfileUrl",
			"label": "Custom profile url",
			"tooltip": "Custom profile service url",
			"placeHolder": "http://elevation.arcgis.com/arcgis/rest/services/Tools/ElevationSync/GPServer"
		}]
	}, {
		"category": "Search",
		"fields": [{
			"type": "subcategory",
			"label": "Search Settings"
		}, {
			"type": "paragraph",
			"value": "Enable search to allow users to find a location or data in the map. Configure the search settings to refine the experience in your app by setting the default search resource, placeholder text, etc."
		}, {
			"type": "conditional",
			"condition": false,
			"fieldName": "search",
			"label": "Enable search tool",
			"items": [{
				"type": "search",
				"fieldName": "searchConfig",
				"label": "Configure search tool"
			}]
		}, {
			"type": "subcategory",
			"label": "Custom URL Parameter"
		}, {
			"type": "paragraph",
			"value": "Setup the app to support a custom url parameter. For example if your map contains a feature layer with parcel information and you'd like to be able to find parcels using a url parameter you can use this section to do so. Select a layer and search field then define the name of a custom param. Once you've defined these values you can append the custom search to your application url using the custom parameter name you define. For example, if I set the custom param value to parcels a custom url would look like this index.html?parcel=3045"
		}, {
			"placeHolder": "i.e. parcels",
			"label": "URL param name:",
			"fieldName": "customUrlParam",
			"type": "string",
			"tooltip": "Custom URL param name"
		}, {
			"type": "layerAndFieldSelector",
			"fieldName": "customUrlLayer",
			"label": "Layer to search for custom url param value",
			"tooltip": "Url param search layer",
			"fields": [{
				"multipleSelection": false,
				"fieldName": "urlField",
				"label": "URL param search field",
				"tooltip": "URL param search field"
			}],
			"layerOptions": {
				"supportedTypes": ["FeatureLayer"],
				"geometryTypes": ["esriGeometryPoint", "esriGeometryLine", "esriGeometryPolyline", "esriGeometryPolygon"]
			}
		}]
	}],
	"values": {
		"splashModal": false,
		"background": "#666",
		"color": "#fff",
		"legend": false,
		"elevationDraw": true,
		"includelayeropacity": false,
		"basemaps": false,
		"basemapToggle": false,
		"share": false,
		"search": false,
		"units": "english",
		"backgroundOpacity": "0.9",
		"panelLocation": "bottom-center",
		"axisFontColor": "#fff",
		"axisMajorTickColor": "#fff",
		"elevationTopColor": "#8C8C8C",
		"elevationBottomColor": "#696969",
		"skyBottomColor": "#00B2EE",
		"skyTopColor": "#009ACD"
	}
}