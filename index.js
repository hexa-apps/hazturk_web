$(document).ready(function () {
  var loading = $("#loading");
  $(document).ajaxStart(function () {
    loading.show();
  });
  $(document).ajaxStop(function () {
    loading.hide();
  });

  $("#map").css({ height: `calc(100% - ${$("#main-nav").css("height")})` });

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
  markers.on('clustermouseover', function(c) {
    var popup = L.popup()
        .setLatLng(c.layer.getLatLng())
        .setContent(c.layer._childCount +' Locations(click to Zoom)')
        .openOn(mymap);
    }).on('clustermouseout',function(c){
      mymap.closePopup();
    }).on('clusterclick',function(c){
      mymap.closePopup();
    });
  // $.ajax({
  //   url: `./assets/active_faults.geojson`,
  //   success: function (data) {
  //     var vectorGrid = L.vectorGrid
  //       .slicer(data, {
  //         rendererFactory: L.svg.tile,
  //         vectorTileLayerStyles: {
  //           sliced: function(properties, zoom) {
  //             // var p = properties.mapcolor7 % 5;
  //             return {
  //               // fillColor: p === 0 ? '#800026' :
  //               //     p === 1 ? '#E31A1C' :
  //               //     p === 2 ? '#FEB24C' :
  //               //     p === 3 ? '#B2FE4C' : '#FFEDA0',
  //               //  fillOpacity: 1,
  //               stroke: true,
  //               // fill: true,
  //               color: 'red',
  //               //  opacity: 0.2,
  //               weight: 1,
  //             }
  //           }
  //         },
  //         interactive: true,
  //         getFeatureId: function (f) {
  //           return f.properties.catalog_id;
  //         },
  //       })
  //       .addTo(mymap);
  //   },
  // });
  getEqs(
    $("#source-dropdown").data("hazturk"),
    $("#magnitude-dropdown").data("hazturk"),
    $("#time-dropdown").data("hazturk"),
    mymap,
    markers
  );
  $("#magnitude-dropdown")
    .find("li a")
    .click(function () {
      $("#mag-a").html(
        $("#mag-a")
          .html()
          .replace(
            magnitudeDisplayNames[$("#magnitude-dropdown").data("hazturk")],
            magnitudeDisplayNames[this.dataset.hazturk]
          )
      );
      $("#magnitude-dropdown").data("hazturk", this.dataset.hazturk);
      getEqs(
        $("#source-dropdown").data("hazturk"),
        this.dataset.hazturk,
        $("#time-dropdown").data("hazturk"),
        mymap,
        markers
      );
    });
  $("#time-dropdown")
    .find("li a")
    .click(function () {
      $("#time-a").html(
        $("#time-a")
          .html()
          .replace(
            timeDisplayNames[$("#time-dropdown").data("hazturk")],
            timeDisplayNames[this.dataset.hazturk]
          )
      );
      $("#time-dropdown").data("hazturk", this.dataset.hazturk);
      getEqs(
        $("#source-dropdown").data("hazturk"),
        $("#magnitude-dropdown").data("hazturk"),
        this.dataset.hazturk,
        mymap,
        markers
      );
    });
  $("#source-dropdown")
    .find("li a")
    .click(function () {
      $("#source-a").html(
        $("#source-a")
          .html()
          .replace(
            sourceDisplayNames[$("#source-dropdown").data("hazturk")],
            sourceDisplayNames[this.dataset.hazturk]
          )
      );
      $("#source-dropdown").data("hazturk", this.dataset.hazturk);
      getEqs(
        this.dataset.hazturk,
        $("#magnitude-dropdown").data("hazturk"),
        $("#time-dropdown").data("hazturk"),
        mymap,
        markers
      );
    });
});

function updateContainer(control, map) {
  var $containerHeight = $(window).width();
  if ($containerHeight <= 375) {
    map.removeControl(control);
  } else {
    map.addControl(control);
  }
}

function getEqs(source, mag, time, map, markers) {
  $.ajax({
    url: `${urls[source]}${mag}_${time}.geojson`,
    success: function (data) {
      markers.clearLayers();
      if (data && data.features.length > 0) {
        var geojsonLayer = L.geoJSON(data, {
          onEachFeature: onEachFeature,
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
        })
        markers.addLayer(geojsonLayer);
        map.addLayer(markers);
      }
    },
  });
}

function onEachFeature(feature, layer) {
  // does this feature have a property named popupContent?
  if (feature.properties && feature.properties.mag) {
      layer.bindPopup(feature.properties.mag.toString());
  }
}
