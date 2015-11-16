/*global define,document */
/*jslint sloppy:true,nomen:true */
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
define([
  "dojo/_base/declare",
  "dojo/_base/array",
  "dojo/_base/lang",
  "dojo/_base/Color",

  "dojo/on",
  "dojo/mouse",
  "dojo/query",
  "dojo/Deferred",

  "dojo/_base/fx",

  "dojo/dom",
  "dojo/dom-construct",
  "dojo/dom-style",
  "dojo/dom-class",
  "dojo/dom-geometry",

  "dijit/registry",
  
  "esri/units",
  "esri/domUtils",
  "esri/arcgis/utils",

  "application/ElevationProfileSetup",

  "dojo/domReady!"
], function (
  declare, array, lang, Color,
  on,mouse, query,
  Deferred,
  baseFx, 
  dom, domConstruct, domStyle, domClass, domGeometry,
  registry,
  Units,
  domUtils,
  arcgisUtils,
  ElevationProfileSetup
) {
  return declare(null, {
    config: {},
    containers: [],
    startup: function (config) {
      var promise;
      // config will contain application and user defined info for the template such as i18n strings, the web map id
      // and application id
      // any url parameters and any application specific configuration information.
      if (config) {
        this.config = config;

      // Create and add custom style sheet
      if(this.config.customstyle){
          var style = document.createElement("style");
          style.appendChild(document.createTextNode(this.config.customstyle));
          document.head.appendChild(style);    
      }

        this._setupSplashModal();

        //supply either the webmap id or, if available, the item info
        var itemInfo = this.config.itemInfo || this.config.webmap;
        promise = this._createWebMap(itemInfo);
      } else {
        var error = new Error("Main:: Config is not defined");
        this.reportError(error);
        var def = new Deferred();
        def.reject(error);
        promise = def.promise;
      }
      return promise;
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
      return error;
    },

    // create a map based on the input web map id
    _createWebMap: function (itemInfo) {
      // set extent from config/url
      itemInfo = this._setExtent(itemInfo);
      // Optionally define additional map config here for example you can
      // turn the slider off, display info windows, disable wraparound 180, slider position and more.
      var mapOptions = {};
      // set zoom level from config/url
      mapOptions = this._setLevel(mapOptions);
      // set map center from config/url
      mapOptions = this._setCenter(mapOptions);
      //enable/disable the slider 
      mapOptions.slider = this.config.mapZoom;
      domClass.add(document.body, "slider-" + this.config.mapZoom);

      // create webmap from item
      return arcgisUtils.createMap(itemInfo, "mapDiv", {
        mapOptions: mapOptions,
        usePopupManager: true,
        layerMixins: this.config.layerMixins || [],
        editable: this.config.editable,
        bingMapsKey: this.config.bingKey
      }).then(lang.hitch(this, function (response) {
        this.map = response.map;
        dom.byId("elevTitle").innerHTML = this.config.title || response.itemInfo.item.title;
        document.title = this.config.title || response.itemInfo.item.title;

        var desc = this.config.description || response.itemInfo.item.snippet;
        if(desc){
          dom.byId("desc").innerHTML = desc;
          domUtils.show(dom.byId("desc"));
        }

        this.config.response = response;

        // remove loading class from body
        domClass.remove(document.body, "app-loading");
        on(window, "resize", function(){
            registry.byId("elevProfileChart").resize();
        });
      // Hide or show profile when button is clicked. 
        var profileToggle = dom.byId("toggleProfile");
        profileToggle.title = this.config.i18n.elevation.toggle;
        on(profileToggle, "click", lang.hitch(this, function(){
            this._togglePanel("panelContent");
        }));
        this._setupAppTools();
        // setup elevation profile 
        this._setupProfile();
        // update app theme 
        this._updateTheme();
        // return for promise
        return response;
      }), this.reportError);
    },
    _drawLine: function(Draw){
      // Add active class
      domClass.toggle("drawTool", "active");
      if(domClass.contains("drawTool","active")){
        this.drawTool.activate(Draw.POLYLINE);
        this.map.setInfoWindowOnClick(false);
      }else{
        this.map.setInfoWindowOnClick(true);
        this.elevationWidget.clearProfileChart();
        this.drawTool.deactivate();
        return;
      }
      on(this.drawTool, "draw-complete", lang.hitch(this, function(result){
        this.elevationWidget.generateProfile(result.geometry);
        on.once(this.map, "click", lang.hitch(this, function(){
          this.elevationWidget.clearProfileChart();
        }));
      }));
    },
    _setupAppTools: function(){
        // setup the draw tool 
        if(this.config.elevationDraw){
          require(["esri/toolbars/draw"], lang.hitch(this, function(Draw){
  
            var drawToolButton = dom.byId("drawTool");

            domClass.remove(drawToolButton, "hide");
            drawToolButton.title = this.config.i18n.elevation.drawTool;

            this.drawTool = new Draw(this.map);
            if(this.map.infoWindow.lineSymbol){
              this.drawTool.setLineSymbol(this.map.infoWindow.lineSymbol);
            }
            on(drawToolButton, "click", lang.hitch(this, function(){
              this._drawLine(Draw);
            }));

          }));
 
        }
        query(".closeBtn").on("click", lang.hitch(this, function(){
          array.forEach(this.containers, lang.hitch(this, function(container){
             domClass.remove(container.btn,"activeTool");
             domStyle.set(container.container,{
              visibility: "hidden"
             });
             domClass.add(document.body, "noscroll");  
          }));
        }));
        // setup the basemap tool

        if(this.config.basemaps){
          require(["esri/dijit/BasemapGallery"], lang.hitch(this, function(BasemapGallery){
            var basemapGallery = new BasemapGallery({
              map:this.map,
              portalUrl: this.config.sharinghost,
              basemapsGroup: this._getBasmapGroup
            },"basemapDiv");
            basemapGallery.startup();
            var basemapButton = dom.byId("basemapBtn");
            domStyle.set(basemapButton, "display", "inline-block");
            basemapButton.title = this.config.i18n.basemap.tip;
            this.containers.push({btn:"basemapBtn", container:"basemapContainer"});
            on(basemapButton, "click", lang.hitch(this, function(){
              this._toggleButtonContainer(basemapButton, "basemapContainer");      
            }));
          }));
        }
        // setup the legend tool 
        if(this.config.legend){
          require(["esri/dijit/LayerList"], lang.hitch(this, function(LayerList){
            var legendButton = dom.byId("legendBtn");
            domStyle.set(legendButton, "display", "inline-block");
            legendButton.title = this.config.i18n.legend.tip;
            this.containers.push({btn:"legendBtn", container:"legendContainer"});

            var layerList = null;
            on(legendButton, "click", lang.hitch(this, function(){
              this._toggleButtonContainer(legendButton, "legendContainer");

              if(!layerList){
                layerList = new LayerList({
                  map: this.map,
                  showSubLayers: this.config.includesublayers,
                  showLegend: this.config.includelayerlegend,
                  showOpacitySlider: this.config.includelayeropacity,
                  layers: arcgisUtils.getLayerList(this.config.response)
                },"legendDiv");
     
                layerList.startup();
       
                query(".esriLayerList").style({
                  "background-color": this.config.background,
                  "color": this.config.color
                });
              }
            }));
          }));
        }
        // setup the share dialog
        if(this.config.share){
          require(["application/ShareDialog"], lang.hitch(this, function(ShareDialog){

            var shareButton = dom.byId("shareBtn");
            domStyle.set(shareButton, "display", "inline-block");
            shareButton.title = this.config.i18n.share.tip;
            this.containers.push({btn:"shareBtn", container:"shareContainer"});
            var shareDialog = new ShareDialog({
                bitlyLogin: this.config.bitlyLogin,
                bitlyKey: this.config.bitlyKey,
                map: this.map,
                image: this.config.sharinghost + "/sharing/rest/content/items/" + this.config.response.itemInfo.item.id + "/info/" + this.config.response.itemInfo.thumbnail,
                title: this.config.title,
                summary: this.config.response.itemInfo.item.snippet || ""
            }, "shareDiv");
            shareDialog.startup();
            on(shareButton, "click", lang.hitch(this, function(){
              this._toggleButtonContainer(shareButton, "shareContainer");
            }));
          }));
        }

        //Feature Search or find (if no search widget)
        if ((this.config.find || (this.config.customUrlLayer.id !== null && this.config.customUrlLayer.fields.length > 0 && this.config.customUrlParam !== null))) {
            require(["esri/dijit/Search", "esri/urlUtils", "esri/lang"], lang.hitch(this, function (Search, urlUtils, esriLang) {
    
                //Support find or custom url param 
                if (this.config.find) {
                    value = decodeURIComponent(this.config.find);
                } else if (customUrl){
                      var source = null,
                          value = null,
                          searchLayer = null;

                      var urlObject = urlUtils.urlToObject(document.location.href);
                      urlObject.query = urlObject.query || {};
                      urlObject.query = esriLang.stripTags(urlObject.query);
                      var customUrl = null;
                      for(var prop in urlObject.query){
                          if(urlObject.query.hasOwnProperty(prop)){
                              if(prop.toUpperCase() === this.config.customUrlParam.toUpperCase()){
                                  customUrl = prop;
                              }
                          }
                      }
                  
                    value = urlObject.query[customUrl];
                    searchLayer = this.map.getLayer(this.config.customUrlLayer.id);
                    if (searchLayer) {

                        var searchFields = this.config.customUrlLayer.fields[0].fields;
                        source = {
                            exactMatch: true,
                            outFields: ["*"],
                            featureLayer: searchLayer,
                            displayField: searchFields[0],
                            searchFields: searchFields
                        };
                    }
                }
                var urlSearch = new Search({
                    map: this.map
                });

                if (source) {
                    urlSearch.set("sources", [source]);
                }
                urlSearch.on("load", lang.hitch(this, function () {
                    urlSearch.search(value).then(lang.hitch(this, function () {
                        on.once(this.map.infoWindow, "hide", lang.hitch(this, function () {
                            urlSearch.clear();
                            urlSearch.destroy();
                            if(this.editor){
                                this._destroyEditor();
                                this._createEditor();
                            }
                        }));
                    }));
                }));
                urlSearch.startup();

            }));
        }


        if(this.config.search){
          require(["esri/dijit/Search", "esri/tasks/locator", "application/SearchSources"], lang.hitch(this, function(Search, Locator, SearchSources){
            if(!Search || !Locator){
              return;
            }

            var searchOptions = {
              map: this.map,
              useMapExtent: this.config.searchExtent,
              itemData: this.config.response.itemInfo.itemData
            };

            if(this.config.searchConfig){
              searchOptions.applicationConfiguredSources = this.config.searchConfig.sources || [];
            }else{
              var configuredSearchLayers = (this.config.searchLayers instanceof Array) ? this.config.searchLayers : JSON.parse(this.config.searchLayers);
              searchOptions.configuredSearchLayers = configuredSearchLayers;
              searchOptions.geocoders = this.config.locationSearch ? this.config.helperServices.geocode : [];              
            }
            var searchSources = new SearchSources(searchOptions);
            var createdOptions = searchSources.createOptions();
            createdOptions.enableButtonMode = true;
            createdOptions.expanded = false;

            if (this.config.searchConfig && this.config.searchConfig.activeSourceIndex) {
                createdOptions.activeSourceIndex = this.config.searchConfig.activeSourceIndex;
            }

            var search = new Search(createdOptions, domConstruct.create("div", {
                id: "search"
            }, "mapDiv"));
   
            this._updateTheme();

            search.startup();

          }));
        }else{
          domClass.add(document.body, "nosearch");
        }
    },
      _getBasemapGroup: function () {
          //Get the id or owner and title for an organizations custom basemap group.
          var basemapGroup = null;
          if (this.config.basemapgroup && this.config.basemapgroup.title && this.config.basemapgroup.owner) {
              basemapGroup = {
                  "owner": this.config.basemapgroup.owner,
                  "title": this.config.basemapgroup.title
              };
          } else if (this.config.basemapgroup && this.config.basemapgroup.id) {
              basemapGroup = {
                  "id": this.config.basemapgroup.id
              };
          }
          return basemapGroup;
      },
    _toggleButtonContainer: function(button, container){
          var position = domGeometry.position(button);
          domClass.toggle(button,"activeTool");
          if(domClass.contains(button,"activeTool")){
            domStyle.set(container ,{
              position:"absolute",
              top: (position.y) + "px",
              left:"85px",
              visibility:"visible",
              display:"block"
            });
            domClass.add(document.body, "noscroll");
          }else{
            domClass.remove(document.body, "noscroll");
            domStyle.set(container,{
              visibility: "hidden",
              display:"none"
            });
          }

          // close any other open tool containers 
          array.forEach(this.containers, lang.hitch(this, function(container){
            if(container.btn !== button.id && domClass.contains(dom.byId(container.btn),"activeTool")){
             domClass.toggle(container.btn,"activeTool");
             domStyle.set(container.container,{
              visibility: "hidden"
             });
             domClass.add(document.body, "noscroll");  
            }
          }));
    },

    _setupProfile: function(){
        // Set the panel location 
        domClass.add(dom.byId("panelContainer"), this.config.panelLocation);

        var units = this.config.units;
        if(units === "english" || units === "metric"){
         units = (units === "english") ? Units.MILES : Units.KILOMETERS;
        }
        var profileUrl = this.config.helperServices.elevationSync.url;
        if(this.config.customProfileUrl){
          //overwrite the profile url if a custom one is specified
          profileUrl = this.config.customProfileUrl;
        }

        var params = {
            map: this.map,
            chartParams:{
              title: " ",
              axisFontColor: this.config.axisFontColor, 
              titleFontColor: this.config.titleFontColor, 
              axisMajorTickColor: this.config.axisMajorTickColor,
              elevationLineColor: this.config.elevationLineColor,
              elevationBottomColor: this.config.elevationBottomColor, 
              elevationTopColor: this.config.elevationTopColor,  
              skyBottomColor: this.config.skyBottomColor,
              skyTopColor: this.config.skyTopColor,
              elevationMarkerStrokeColor: "#00FFFF",
              indicatorFontColor: "#fff",
              indicatorFillColor: "#666",
              mapIndicatorSymbol: {
                type: "esriSMS",
                style: "esriSMSCircle",
                color:[0,183,235],
                size:12,
                outline:{
                  type: "esriSLS",
                  style: "esriSLSolid",
                  color:[255,255,255],
                  width:1
                }
              }
            },
            profileTaskUrl: profileUrl,
            scalebarUnits: units
        };

        this.elevationWidget = new ElevationProfileSetup(params);
        this.elevationWidget.setupProfile();

        on(this.elevationWidget, "profile-generated",lang.hitch(this, function(){
          //open profile chart if closed
          var element =  dom.byId("panelContent");
          var height = domStyle.get(dom.byId("panelContent"), "height");
          if(height <=  0){
            this._togglePanel("panelContent");
          }
        }));
    },
    _updateTheme: function(){
      var bgColor =this.config.background;
      var bgOpacity = Number(this.config.backgroundOpacity);
      var textColor = this.config.color;
     

      // Set the background color using the configured background color
      // and opacity
      query(".bg").style({
        "background-color": bgColor,
        "opacity": bgOpacity
      });
      query(".esriPopup .pointer").style({
        "background-color": bgColor,
        "opacity": bgOpacity
      });
      query(".esriPopup .titlePane").style({
        "background-color": bgColor,
        "opacity": bgOpacity,
        "color": textColor
      });

      query(".fg").style("color", textColor);
      //query(".esriPopup .titlePane").style("color", textColor);
      query(".esriPopup. .titleButton").style("color", textColor);

      query(".esriSimpleSlider").style({
        "color": textColor,
        "background-color": bgColor,
        "opacity": bgOpacity
      });
      query(".searchCollapsed .searchBtn.searchSubmit").style({
        "color": textColor,
        "background-color": bgColor,
        "opacity": bgOpacity
      });
      // Apply the background color as the arrow border color
      query(".arrow_box").style({
        "border-color": bgColor,
        "opacity": bgOpacity
      });

    },

    _togglePanel: function(chartNode){
          var element = dom.byId(chartNode),
           height =  domStyle.get(element, "height"),
           opacity = parseInt(domStyle.get(element, "opacity")),
           visibility = domStyle.get(element, "visibility");
           var btn = dom.byId("toggleProfile");
           // Toggle Active 
           domClass.toggle("toggleProfile","active");

          baseFx.animateProperty({
            node: dom.byId(chartNode),
            duration: 500,
            properties:{
              height: height === 0 ? 210 : 0
            },
            onBegin: function(){
              // hide the panel if showing when animation starts
              if(opacity === 1){
                domStyle.set(element,"opacity","0");
              }
            },
            onEnd: function(){
              // when height animation ends show/hide panel
              domStyle.set(element,"opacity", opacity === 0 ? 1:0);
              domStyle.set(element, "visibility", visibility === "hidden" ? "visible" : "hidden");
            }
          }).play();
    },
    _setLevel: function (options) {
      var level = this.config.level;
      //specify center and zoom if provided as url params 
      if (level) {
        options.zoom = level;
      }
      return options;
    },
    _setCenter: function (options) {
      var center = this.config.center;
      if (center) {
        var points = center.split(",");
        if (points && points.length === 2) {
          options.center = [parseFloat(points[0]), parseFloat(points[1])];
        }
      }
      return options;
    },

    _setExtent: function (info) {
      var e = this.config.extent;
      //If a custom extent is set as a url parameter handle that before creating the map
      if (e) {
        var extArray = e.split(",");
        var extLength = extArray.length;
        if (extLength === 4) {
          info.item.extent = [[parseFloat(extArray[0]), parseFloat(extArray[1])], [parseFloat(extArray[2]), parseFloat(extArray[3])]];
        }
      }
      return info;
    },
    _setupSplashModal: function(){
        // Setup the modal overlay if enabled
        if(this.config.splashModal){
          domClass.remove("modal", "hide");
          var title = this.config.splashTitle || this.config.i18n.splash.title;
          var content = this.config.splashContent || this.config.i18n.splash.content;
          dom.byId("modalTitle").innerHTML = title;
          dom.byId("modalContent").innerHTML = content;
          // Close button handler for the overlay  
          on(dom.byId("closeOverlay"), "click", function(){
            domClass.add("modal", "hide");
          });
        }
    }

  });
});
