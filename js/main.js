define([
  "dojo/ready",
  "dojo/_base/declare",
  "dojo/_base/connect",
  "dojo/_base/lang",
  "dojo/on",
  "dojo/dom",
  "dojo/dom-class",
  "dojo/dom-construct",
  "dijit/registry",
  "dijit/layout/ContentPane",
  "esri/arcgis/utils",
  "esri/dijit/Legend",
  "esri/dijit/Scalebar",
  "esri/dijit/Measurement",
  "esri/units",
  "esri/IdentityManager",
  "application/ElevationsProfile/Widget"
], function (ready, declare, connect, lang, on, dom, domClass, domConstruct, registry, ContentPane, arcgisUtils, Legend, Scalebar, Measurement, Units, IdentityManager, ElevationsProfile) {

  return declare([], {

    config: {},

    /**
     * CONSTRUCTOR
     *
     * @param config
     */
    constructor: function (config) {
      this.config = config;
      ready(lang.hitch(this, this._createWebMap));
    },

    /**
     * CREATE MAP FROM WEBMAP
     *
     * @private
     */
    _createWebMap: function () {
      // CREATE MAP FROM WEBMAP //
      arcgisUtils.createMap(this.config.webmap, "mapPane", {
        mapOptions: {
          wrapAround180: true
        },
        ignorePopups: false,
        bingMapsKey: this.config.bingmapskey
      }).then(lang.hitch(this, function (response) {

            // TITLE //
            dom.byId('titleNode').innerHTML = response.itemInfo.item.title || "";
            dom.byId('snippetNode').innerHTML = response.itemInfo.item.snippet || "";
            // DESCRIPTION //
            dom.byId('descriptionNode').innerHTML = response.itemInfo.item.description || "";
            registry.byId('infoContainer').layout();

            // MAP //
            this.map = response.map;
            this.clickEventHandle = response.clickEventHandle;
            this.clickEventListener = response.clickEventListener;

            // MAP CURSOR //
            this.map.on('update-start', lang.hitch(this.map, this.map.setMapCursor, 'wait'));
            this.map.on('update-end', lang.hitch(this.map, this.map.setMapCursor, 'default'));

            // SCALEBAR //
            var scalebar = new Scalebar({
              map: this.map,
              scalebarUnit: this.config.scalebarUnits || 'dual'
            });

            // LEGEND //
            var legendDijit = new Legend({
              map: this.map,
              layerInfos: arcgisUtils.getLegendLayers(response)
            }, "legendNode");
            legendDijit.startup();

            // ===========================================================================================//
            // ELEVATIONS PROFILE PARAMETERS //
            var profileParams = {
              map: this.map,
              profileTaskUrl: this.config.helperServices.elevationSync.url,
              scalebarUnits: this.config.scalebarUnits
            };

            // ELEVATIONS PROFILE //
            var elevationsProfile = new ElevationsProfile(profileParams, dom.byId('profileChartNode'));
            // SEND ERRORS TO THE CONSOLE //
            elevationsProfile.on("error", console.warn);
            // ENABLE/DISABLE MAP EVENTS WHEN USER IS DRAWING WITH MEASUREMENT DISTANCE TOOL //
            elevationsProfile.on("measure-distance-checked", lang.hitch(this, function (evt) {
              if (evt.checked) {
                connect.disconnect(this.clickEventHandle);
                this.clickEventHandle = null;
              } else {
                this.clickEventHandle = connect.connect(this.map, "onClick", this.clickEventListener);
              }
            }));
            // STARTUP THE DIJIT //
            elevationsProfile.startup();
            // ===========================================================================================//

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
