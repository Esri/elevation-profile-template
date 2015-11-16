define([
  "dojo/_base/declare", 
  "dojo/_base/array",
  "dojo/_base/lang",

  "dojo/Evented",
  "dojo/on",
  "dojo/dom",

  "esri/graphic",
  "esri/layers/GraphicsLayer",
  "esri/dijit/ElevationProfile"
], function (
    declare, 
    array,
    lang,
    Evented,
    on,
    dom,
    Graphic,
    GraphicsLayer,
    ElevationProfile
  ) {
  return declare("application.ElevationProfileSetup", [Evented], {
    constructor: function (parameters) {
      var defaults = {
        elevProfileChartNode: "elevProfileChart",
        map: null,
        profileTaskUrl: null,
        scalebarUnits: null
      };
      lang.mixin(this, defaults, parameters);
    },

    /* Public Methods */
    setupProfile: function () {
      var profileParams = {
          map: this.map,
          profileTaskUrl: this.profileTaskUrl,
          scalebarUnits: this.scalebarUnits,  
          chartOptions: this.chartParams
      };
      this.profileWidget = new ElevationProfile(profileParams, this.elevProfileChartNode);

      this.profileWidget.startup();

      this.selGraphicsLayer = new GraphicsLayer();
      this.map.addLayer(this.selGraphicsLayer);


      // Setup click handlers for all polyline layers 
      var layerIds = this.map.graphicsLayerIds;
      array.forEach(layerIds, lang.hitch(this, function(id){
        var l = this.map.getLayer(id);
        if(l && l.geometryType && l.geometryType === "esriGeometryPolyline"){
          l.on("click", lang.hitch(this, function(e){
            if(e && e.graphic && e.graphic.geometry){
              this.generateProfile(e.graphic.geometry);
            }
          }));
        }
      }));

      // also show elev profile when popup for polyline layers is clicked
      on(this.map.infoWindow, "selection-change", lang.hitch(this, function(){
        var sel = this.map.infoWindow.getSelectedFeature();
        if(sel && sel.geometry && sel.geometry.type === "polyline"){
          this.generateProfile(sel.geometry);
        }else{
          this.clearProfileChart();
        }
      }));
    },
    generateProfile: function (geometry) {
      this.profileWidget.set("profileGeometry", geometry);
      this.emit("profile-generated");
      // Add selected graphic to the map so we get a highlight symbol
      this.selGraphicsLayer.add(new Graphic(geometry, this.map.infoWindow.lineSymbol));
    },
    /* Private Methods */
    clearProfileChart: function(){
      //remove sel graphic from map 
      this.profileWidget.clearProfile();
      // Clear any selected graphics 
      this.selGraphicsLayer.clear();
    }
  });
});