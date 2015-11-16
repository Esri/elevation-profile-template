/*global define,location */
/*jslint sloppy:true */
/*
 | Copyright 2014 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
define({
  //Default configuration settings for the application. This is where you'll define things like a bing maps key,
  //default web map, default app color theme and more. These values can be overwritten by template configuration settings and url parameters.
  "appid": "",
  "webmap": "ede90ed05cd04ca1ad6beb9b3820e7db",
  "oauthappid": null, //"AFTKRmv16wj14N3z",
  //Group templates must support a group url parameter. This will contain the id of the group.
  "group": "",
  //Enter the url to the proxy if needed by the application. See the 'Using the proxy page' help topic for details
  //http://developers.arcgis.com/en/javascript/jshelp/ags_proxy.html
  "proxyurl": "",
  "bingKey": "", //Enter the url to your organizations bing maps key if you want to use bing basemaps
  //Defaults to arcgis.com. Set this value to your portal or organization host name.
  "sharinghost": location.protocol + "//" + "www.arcgis.com",
  "customProfileUrl": null,
  // Define the profile widget location. Valid values are bottom-center
  // and top-center. 
  "panelLocation": "bottom-center", 
  // Define the profile units if no units are specified 
  // arcgis online org units will be used
  "units": null,
  // Define the title and description text that appears on the panel
  "title": null,
  "description": null,
  // Set splashModal to display a splash screen when the app loads
  // Define the splash content using splashTitle and splashContent. 
  "splashModal": false,
  "splashTitle": null,
  "splashContent": null,
  //If your applcation needs to edit feature layer fields set this value to true. When false the map will
  //be dreated with layers that are not set to editable which allows the FeatureLayer to load features optimally. 
  "editable": false,
  // Define background and text colors for the app. 
  "background": "#666", // #009ACD
  "backgroundOpacity": "0.9",
  "color": "#fff", 
  // Enable/disable tools
  "mapZoom": true, // set to false to disable map zoom slider 
  "search": false, // Search Tool
  "searchExtent": true,
  "searchLayers":[{
      "id": "",
      "fields": []
  }],
  // Enter custom start location to find (POI, location etc). Note
  // this uses the esri default locator 
  "find": null,
  //Setup the app to support a custom url parameter. Use this if you want users
  //to be able to search for a string field in a layer. For example if the web map
  //has parcel data and you'd like to be able to zoom to a feature using its parcel id
  //you could add a custom url param named parcel then users could enter 
  //a value for that param in the url. index.html?parcel=3203
  "customUrlLayer":{
      "id": null,//id of the search layer as defined in the web map
      "fields": []//Name of the string field to search 
  },
  "customUrlParam": null,//Name of url param. For example parcels
  "basemaps": false, // Basemap Gallery 
  "legend": false, // Legend  and Layer List 
  "includesublayers":true,// Include ability to toggle sub layers
  "includelayerlegend": true, // Show Legend 
  "includelayeropacity": false, // Show opacity slider in legend
  "share": false, // Share Dialog 
  //Replace these with your own bitly key
  "bitlyLogin": "arcgis",
  "bitlyKey": "R_b8a169f3a8b978b9697f64613bf1db6d",
  "elevationDraw": true, // include draw tool
  // Profile Chart Colors 
  "axisFontColor": "#fff", // white 
  "titleFontColor": "#fff", // white 
  "axisMajorTickColor": "#fff", // white 
  "elevationLineColor": "#f2f2f2", // white 
  "elevationBottomColor":"#696969", //gray 
  "elevationTopColor": "#8C8C8C", //gray  
  "skyBottomColor": "#00B2EE", // robin blue 
  "skyTopColor":"#009ACD", // baby blue           
  "helperServices": {
    "geometry": {
      "url": null
    },
    "printTask": {
      "url": null
    },
    "elevationSync": {
      "url": null
    },
    "geocode": [{
      "url": null
    }]
  },
  // This is an option added so that developers working with the 
  // hosted version of the application can apply custom styles
  // not used in the download version. 
  "customstyle": null
});
