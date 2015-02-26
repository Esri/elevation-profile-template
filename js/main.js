define(["dojo/ready", "dojo/_base/declare", "dojo/query",  "dojo/dom-style", "dojo/_base/lang", "dojo/on", "dojo/dom", "dojo/dom-class", "dojo/dom-construct", "dijit/registry", "dijit/layout/ContentPane", "esri/arcgis/utils", "esri/dijit/Legend", "esri/layers/FeatureLayer", "esri/dijit/Scalebar", "esri/dijit/Measurement", "esri/units", "esri/IdentityManager", "application/ElevationsProfile/Widget"], function (ready, declare, dojoQuery, domStyle, lang, on, dom, domClass, domConstruct, registry, ContentPane, arcgisUtils, Legend, FeatureLayer, Scalebar, Measurement, Units, IdentityManager, ElevationsProfile) {
    return declare([], {
        config: {},
        startup: function (config) {
            this.config = config;
            //supply either the webmap id or, if available, the item info
            var itemInfo = this.config.itemInfo || this.config.webmap;
            this._createWebMap(itemInfo);

            if (config) {
                this.config = config;
                this._createWebMap(itemInfo);
            } else {
                var error = new Error("Main:: Config is not defined");
                this.reportError(error);
            }
        },
        reportError: function (error) {
            // remove loading class from body
            domClass.remove(document.body, "app-loading");
            domClass.add(document.body, "app-error");
            // an error occurred - notify the user. In this example we pull the string from the
            // resource.js file located in the nls folder because we've set the application up
            // for localization. If you don't need to support multiple languages you can hardcode the
            // strings here and comment out the call in index.html to get the localization strings.
            // set message
            var node = dom.byId("loading_message");
            if (node) {
                if (this.config && this.config.i18n) {
                    node.innerHTML = this.config.i18n.map.error + ": " + error.message;
                } else {
                    node.innerHTML = "Unable to create map: " + error.message;
                }
            }
        },
        /**
         * CREATE MAP FROM WEBMAP
         *
         * @private
         */
        _createWebMap: function (itemInfo) {
            // CREATE MAP FROM WEBMAP //
            arcgisUtils.createMap(itemInfo, "mapPane", {
                mapOptions: {
                    wrapAround180: true
                },
                editable: false,
                ignorePopups: false,
                usePopupManager:true,
                bingMapsKey: this.config.bingmapskey
            }).then(lang.hitch(this, function (response) {
                this.config.response = response;


                var descNode = null;
                if (this.config.titleInHeader) {
                    descNode = dom.byId("topContainer");
                    domStyle.set(descNode, "height", "60px");

                } else {
                    descNode = dom.byId("descriptionPane");
                    domStyle.set(dom.byId("topContainer"), "display", "none");
                }

                var titleNode = domConstruct.create("div", {
                    id: "titleNode",
                    innerHTML: response.itemInfo.item.title || ""
                }, descNode, "first");
                var snippetNode = domConstruct.create("div", {
                    id: "snippetNode",
                    innerHTML: response.itemInfo.item.snippet || ""
                }, descNode);
                registry.byId("mainContainer").layout();
   
                dom.byId("descriptionNode").innerHTML = response.itemInfo.item.description || "";
                registry.byId("infoContainer").layout();


                this.map = response.map;

                //Enable snapping
                this.map.enableSnapping();


                //Enable/disable popups 
                if (!this.config.displaypopups) {
                    this.map.infoWindow.set("popupWindow", false);
                }

                //Map Cursor 
                this.map.on("update-start", lang.hitch(this.map, this.map.setMapCursor, "wait"));
                this.map.on("update-end", lang.hitch(this.map, this.map.setMapCursor, "default"));


                var scalebar = new Scalebar({
                    map: this.map,
                    scalebarUnit: this.config.scalebarUnits || "dual"
                });

                var legendLayers = arcgisUtils.getLegendLayers(response);
                if(legendLayers && legendLayers.length > 0){
                  var legendDijit = new Legend({
                      map: this.map,
                      layerInfos: legendLayers
                  }, "legendNode");
                  legendDijit.startup();

                }


                //Create the Geocoder
                if (this.config.geocoder) {

                    //Add the location search widget
                    require(["esri/dijit/Search", "esri/tasks/locator", "dojo/_base/array", "esri/lang"], lang.hitch(this, function (Search, Locator, array, esriLang) {
                        if (!Search && !Locator) {
                            return;
                        }
                        var options = {
                            map: this.map,
                            addLayersFromMap: false
                        };
                        var searchLayers = false;
                        var search = new Search(options, domConstruct.create("div", {
                            id: "search"
                        }, "mapPane"));
                        var defaultSources = [];

                        //setup geocoders defined in common config 
                        if (this.config.helperServices.geocode && this.config.locationSearch) {
                            var geocoders = lang.clone(this.config.helperServices.geocode);
                            array.forEach(geocoders, lang.hitch(this, function (geocoder) {
                                if (geocoder.url.indexOf(".arcgis.com/arcgis/rest/services/World/GeocodeServer") > -1) {

                                    geocoder.hasEsri = true;
                                    geocoder.locator = new Locator(geocoder.url);

                                    geocoder.singleLineFieldName = "SingleLine";

                                    geocoder.name = geocoder.name || "Esri World Geocoder";

                                    if (this.config.searchExtent) {
                                        geocoder.searchExtent = this.map.extent;
                                        geocoder.localSearchOptions = {
                                            minScale: 300000,
                                            distance: 50000
                                        };
                                    }
                                    defaultSources.push(geocoder);
                                } else if (esriLang.isDefined(geocoder.singleLineFieldName)) {

                                    //Add geocoders with a singleLineFieldName defined 
                                    geocoder.locator = new Locator(geocoder.url);

                                    defaultSources.push(geocoder);
                                }
                            }));
                        }
                        //add configured search layers to the search widget 
                        var configuredSearchLayers = (this.config.searchLayers instanceof Array) ? this.config.searchLayers : JSON.parse(this.config.searchLayers);
                        array.forEach(configuredSearchLayers, lang.hitch(this, function (layer) {

                            var mapLayer = this.map.getLayer(layer.id);
                            if (mapLayer) {
                                var source = {};
                                source.featureLayer = mapLayer;

                                if (layer.fields && layer.fields.length && layer.fields.length > 0) {
                                    source.searchFields = layer.fields;
                                    source.displayField = layer.fields[0];
                                    source.outFields = ["*"];
                                    searchLayers = true;
                                    defaultSources.push(source);
                                    if (mapLayer.infoTemplate) {
                                        source.infoTemplate = mapLayer.infoTemplate;
                                    }
                                }
                            }
                        }));
                        //Add search layers defined on the web map item 
                        if (this.config.response.itemInfo.itemData && this.config.response.itemInfo.itemData.applicationProperties && this.config.response.itemInfo.itemData.applicationProperties.viewing && this.config.response.itemInfo.itemData.applicationProperties.viewing.search) {
                            var searchOptions = this.config.response.itemInfo.itemData.applicationProperties.viewing.search;

                            array.forEach(searchOptions.layers, lang.hitch(this, function (searchLayer) {
                                //we do this so we can get the title specified in the item
                                var operationalLayers = this.config.itemInfo.itemData.operationalLayers;
                                var layer = null;
                                array.some(operationalLayers, function (opLayer) {
                                    if (opLayer.id === searchLayer.id) {
                                        layer = opLayer;
                                        return true;
                                    }
                                });
                                if (layer && layer.hasOwnProperty("url")) {
                                    var source = {};
                                    var url = layer.url;
                                    var name = layer.title || layer.name;

                                    if (esriLang.isDefined(searchLayer.subLayer)) {
                                        url = url + "/" + searchLayer.subLayer;
                                        array.some(layer.layerObject.layerInfos, function (info) {
                                            if (info.id == searchLayer.subLayer) {
                                                name += " - " + layer.layerObject.layerInfos[searchLayer.subLayer].name;
                                                return true;
                                            }
                                        });
                                    }

                                    source.featureLayer = new FeatureLayer(url);


                                    source.name = name;


                                    source.exactMatch = searchLayer.field.exactMatch;
                                    source.displayField = searchLayer.field.name;
                                    source.searchFields = [searchLayer.field.name];
                                    source.placeholder = searchOptions.hintText;
                                    defaultSources.push(source);
                                    searchLayers = true;
                                }

                            }));
                        }

                        search.set("sources", defaultSources);
                        search.startup();
                        
                        //set the first non esri layer as active if search layers are defined. 
                        var activeIndex = 0;
                        if (searchLayers) {
                            array.some(defaultSources, function (s, index) {
                                if (!s.hasEsri) {
                                    activeIndex = index;
                                    return true;
                                }
                            });


                            if (activeIndex > 0) {
                                search.set("activeSourceIndex", activeIndex);
                            }
                        }


                    }));
                }


                var elevationObj = {
                    "elevationSync": {
                      "url": location.protocol + "//elevation.arcgis.com/arcgis/rest/services/Tools/ElevationSync/GPServer"
                    }
                };

                //Elevation service configured in app. 
                if (this.config.elevationSync) {
                    elevationObj.elevationSync.url = this.config.elevationSync;
                    lang.mixin(this.config.helperServices, elevationObj);
                }
  
                //No elevation service in self call or configured. This happens in portal which doesn't have 
                //an elevation service defined. 
                if(!this.config.helperServices.hasOwnProperty("elevationSync")){ 
                    lang.mixin(this.config.helperServices, elevationObj);
                }


                var profileParams = {
                    map: this.map,
                    profileTaskUrl: this.config.helperServices.elevationSync.url,
                    scalebarUnits: this.config.scalebarUnits,
                    showHelpAtStartup: this.config.showHelpOnLoad
                };


                var elevationsProfile = new ElevationsProfile(profileParams, dom.byId("profileChartNode"));
                //Send errors to the console 
                elevationsProfile.on("error", console.warn);
                //disable popups when measure tool is used. 
                elevationsProfile.on("measure-distance-checked", lang.hitch(this, function (evt) {
                    if (evt.checked) {
                      this.map.setInfoWindowOnClick(false);
                    } else {
                      this.map.setInfoWindowOnClick(true);
                    }
                }));
                elevationsProfile.startup();

            }), lang.hitch(this, function (error) {
                if (this.config && this.config.i18n) {
                    alert(this.config.i18n.map.error + ": " + error.message);
                } else {
                    alert("Unable to create map: " + error.message);
                }
            }));
        }
    });
});
