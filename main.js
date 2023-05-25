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
    //console.log(jsondata, latlng);

    let current =  jsondata.properties.timeseries[0].data.instant.details;
   // console.log(current);

    let timestamp =new Date(jsondata.properties.meta.updated_at).toLocaleString();
   
    let timeseries = jsondata.properties.timeseries;

    let markup = `
        <h4>Aktuelles Wetter für ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)} (${timestamp} </h4>
        <table>
            <tr><td>Air pressure at sea leven (hPa)</td><td>${current.air_pressure_at_sea_level}</td></tr>
            <tr><td>Air temperature (Celsius)</td><td>${current.air_temperature}</td></tr>
            <tr><td>Cloud area fraction (%)</td><td>${current.cloud_area_fraction}</td></tr>
            <tr><td>Relative humidity</td><td>${current.relative_humidity}</td></tr>
            <tr><td>Wind from direction (°C)</td><td>${current.wind_from_direction}</td></tr>
            <tr><td>Wind speed</td><td>${current.wind_speed}</td></tr>
        </table>
    `;


    // Wettersymbole hinzufügen
    for (let i=0; i<=24; i+=3) {
        console.log(timeseries[i]);
        let icon = timeseries [i].data.next_1_hours.summary.symbol_code;
        let image = `icons/${icon}.svg`
        markup += `<img src="${image}" style="width: 32px;" title="${timeseries[i].time.toLocaleString()}">`
        //console.log(icon, image);
    }
    L.popup().setLatLng(latlng).setContent(markup).openOn(map);
}

//auf Kartenklick reagieren
map.on("click", function(evt){
    //console.log(evt.latlng.lat);
    let url = (`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${evt.latlng.lat}&lon=${evt.latlng.lat}`);
    showForecast(url, evt.latlng);
});


//Klick auf Innsbruck simulieren
map.fireEvent("click",{
    latlng: L.latLng(ibk.lat, ibk.lng)
})

// Winddaten laden
async function loadWind(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    //console.log(jsondata);

    L.velocityLayer({
    displayValues: true,
    lineWidth: 2,
    displayOptions: {
      velocityType: "",
      position: "bottomright",
      emptyString: "keine Daten vorhanden",
      speedUnit: "k/h",
      directionString: "Windrichtung",
      speedString: "Windgeschwindigkeit",
    },
    data: jsondata, 
  }).addTo(map);
}
  loadWind("https://geographie.uibk.ac.at/data/ecmwf/data/wind-10u-10v-europe.json");