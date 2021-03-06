$(document).ready(function () {
  var mymap = L.map("map", { zoomControl: false }).setView([51.505, -0.09], 3);
  L.control
    .zoom({
      position: "bottomright",
    })
    .addTo(mymap);
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
  getEqs("all", "month", mymap, markers);
});

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
