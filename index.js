var geojsonMarkerOptions = {
  radius: 8,
  fillColor: "#ff7800",
  color: "#000",
  weight: 1,
  opacity: 1,
  fillOpacity: 0.8,
};

$(document).ready(function () {
  var mymap = L.map("map").setView([51.505, -0.09], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(mymap);
  getEqs("all", "day", mymap);
});

function getEqs(mag, time, map) {
  $.ajax({
    url: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${mag}_${time}.geojson`,
    success: function (data) {
      if (data && data.features.length > 0) {
        L.geoJSON(data, {
          pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
          },
        })
          .bindPopup(function (layer) {
            return layer.feature.properties.mag.toString();
          })
          .addTo(map);
      }
    },
  });
}
