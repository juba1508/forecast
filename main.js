/* Wetterstationen Euregio Beispiel */

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte initialisieren
let map = L.map("map", {
    fullscreenControl: true
}).setView([ibk.lat, ibk.lng], 5);

// thematische Layer
let themaLayer = {
    forecast: L.featureGroup()
}

// Hintergrundlayer
let layerControl = L.control.layers({
    "Openstreetmap": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "Esri WorldTopoMap": L.tileLayer.provider("Esri.WorldTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery").addTo(map)
}, {
    "Wettervorhersage MET Norway": themaLayer.forecast.addTo(map)
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

// Wettervorhersage MET Norway
async function showForecast(url, latlng) {
    let response = await fetch(url);
    let jsondata = await response.json();
    console.log(jsondata, latlng);

    let current =  jsondata.properties.timeseries[0].data.instant.details;
    console.log(current);

    let markup = `
        <h4>Aktuelles Wetter für ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}</h4>
    `;

    L.popup().setLatLng(latlng).setContent(markup).openOn(map);
}

//auf Kartenklick reagieren
map.on("click", function(evt){
    console.log(evt.latlng.lat);
    let url = (`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${evt.latlng.lat}&lon=${evt.latlng.lat}`);
    showForecast(url, evt.latlng);
})

