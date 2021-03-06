$(document).ready(function () {
  var loading = $("#loading");
  $(document).ajaxStart(function () {
    loading.show();
  });

  $(document).ajaxStop(function () {
    loading.hide();
  });
  var mymap = L.map("map", { zoomControl: false }).setView([51.505, -0.09], 3);
  var zoomControl = L.control.zoom({
    position: "bottomright",
  });
  updateContainer(zoomControl, mymap);
  $(window).resize(function () {
    updateContainer(zoomControl, mymap);
  });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '<a href="https://www.itu.edu.tr/">ITU</a> | <a href="https://earthquake.usgs.gov/">USGS</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(mymap);
  var markers = L.markerClusterGroup({
    showCoverageOnHover: false,
    iconCreateFunction: function (cluster) {
      return L.divIcon({
        html: cluster.getChildCount(),
        className: "mycluster",
        iconSize: L.point(50, 50),
      });
    },
  });
    // var geojson = new L.GeoJSON.AJAX("./assets/active_faults.geojson");
    // geojson.on("data:loaded", function () {
    //   geojson.addTo(mymap);
    // });
    $.ajax({
      url: `./assets/active_faults.geojson`,
      success: function (data) {
        var vectorGrid = L.vectorGrid.slicer( data, {
          rendererFactory: L.svg.tile,
          // vectorTileLayerStyles: {
          //   sliced: function(properties, zoom) {
          //     var p = properties.mapcolor7 % 5;
          //     return {
          //       fillColor: p === 0 ? '#800026' :
          //           p === 1 ? '#E31A1C' :
          //           p === 2 ? '#FEB24C' :
          //           p === 3 ? '#B2FE4C' : '#FFEDA0',
          //       fillOpacity: 0.5,
          //        //fillOpacity: 1,
          //       stroke: true,
          //       fill: true,
          //       color: 'black',
          //          //opacity: 0.2,
          //       weight: 0,
          //     }
          //   }
          // },
          interactive: true,
          getFeatureId: function(f) {
            return f.properties.catalog_id;
          }
        })
        .addTo(mymap);
        // var tileOptions = {
        //   maxZoom: 20, // max zoom to preserve detail on
        //   tolerance: 5, // simplification tolerance (higher means simpler)
        //   extent: 4096, // tile extent (both width and height)
        //   buffer: 64, // tile buffer on each side
        //   debug: 0, // logging level (0 to disable, 1 or 2)
        //   indexMaxZoom: 0, // max zoom in the initial tile index
        //   indexMaxPoints: 100000, // max number of points per tile in the index
        // };
        // var tileIndex = geojsonvt(data, tileOptions);
        // var tile = tileIndex.getTile(z, x, y);
        // var features = tile.features;
        // console.log(features)
      }})
  getEqs("all", "month", mymap, markers);
});

function updateContainer(control, map) {
  var $containerHeight = $(window).width();
  if ($containerHeight <= 375) {
    map.removeControl(control);
  } else {
    map.addControl(control);
  }
}

function getEqs(mag, time, map, markers) {
  $.ajax({
    url: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${mag}_${time}.geojson`,
    success: function (data) {
      markers.clearLayers();
      if (data && data.features.length > 0) {
        var geojsonLayer = L.geoJSON(data, {
          pointToLayer: function (feature, latlng) {
            var color =
              feature.properties.mag < 1
                ? "#78c4d4"
                : feature.properties.mag < 2
                ? "#61b15a"
                : feature.properties.mag < 3
                ? "#f88f01"
                : feature.properties.mag < 4
                ? "#fa1e0e"
                : "#8c0000";
            return L.circleMarker(latlng, {
              radius: 12,
              fillColor: color,
              color: color,
              weight: feature.properties.mag * 5,
              opacity: 0.6,
              fillOpacity: 1,
            });
          },
        }).bindPopup(function (layer) {
          return layer.feature.properties.mag.toString();
        });
        markers.addLayer(geojsonLayer);
        map.addLayer(markers);
      }
    },
  });
}
