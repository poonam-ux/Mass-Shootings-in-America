$(document).ready(function () {
    $(".map-select #ageSelect, .map-select #raceSelect").on("change", function () {
        querySelectedMap($(this).attr("id"), $(this).val());
    });
    $(".radio-btns input").change(function () {
        updatePieChart($('input[name="inlineRadioOptions"]:checked').val());
    });
    $(".table-select #ageSelect, .table-select #raceSelect").on("change", function () {
        $('#table-view').DataTable().destroy();

        querySelectedTable($(this).attr("id"), $(this).val());
    });
});
var allRows = [];



/**** Table View ****/
function querySelectedTable(filter, value) {
    $.ajax({
        url: "/query?requestType=" + filter + "&requestValue=" + value,
        type: "POST"

    }).done(function (response) {
        console.log(response);
        allRows = response["result"];
        updateTable();
    });
};

function updateTable() {
    var dataSet = []; // DataTable requires Array of arrays dataset.
    var valNumMapping = { "name": 0, "place": 1, "age": 11, "race": 18, "Year": 26, "Gender": 19 };
    console.log(allRows);
    for (var key in allRows) {
        var thisRow = allRows[key];
        var rowArray = [];
        for (var titleName in valNumMapping) {
            var arrKey = thisRow[valNumMapping[titleName]];
            rowArray.push(arrKey);
        }
        dataSet.push(rowArray);
    }
    console.log(dataSet);

    $('#table-view').DataTable({
        data: dataSet,
        columns: [
            { title: "Name of Incident" },
            { title: "Location" },
            { title: "Age" },
            { title: "Race" },
            { title: "Year" },
            { title: "Gender" }
        ]
    });
}

/**** Chart View ****/
function queryAll() {
    $.ajax({
        url: "/queryall",
        type: "POST"

    }).done(function (response) {
        console.log(response);
        allRows = response["result"];
        updatePieChart('age');
    });
}

function updatePieChart(value) {
    var labelCountMap = new Map();
    var valNumMapping = { "race": 18, "age": 11, "locationType": 9 };
    for (var key in allRows) {
        var thisRow = allRows[key];
        var arrKey = thisRow[valNumMapping[value]];
        console.log(arrKey);
        if (labelCountMap.has(arrKey)) {
            var ct = labelCountMap.get(arrKey);
            labelCountMap.set(arrKey, ct + 1);
        } else {
            labelCountMap.set(arrKey, 1);
        }
    }
    console.log(Array.from(labelCountMap.keys()));
    console.log(Array.from(labelCountMap.values()));
    plotPieChart(labelCountMap);

}

function plotPieChart(dataMap) {
    var data = [{
        values: Array.from(dataMap.values()),
        labels: Array.from(dataMap.keys()),
        type: 'pie',
        hole: .4
    }];

    var layout = {
        height: 600,
        width: 700
    };

    Plotly.newPlot('result-div', data, layout);
}

/****  Map View ****/
function querySelectedMap(filter, value) {
    $.ajax({
        url: "/query?requestType=" + filter + "&requestValue=" + value,
        type: "POST"

    }).done(function (response) {
        console.log(response);
        allRows = response["result"];
        processResponse();
    });
};

function processResponse(){
    var stateCountMap = new Map(); //{"california": 21, "new york": 10}
    for (var key in allRows) {
        var arrKey = allRows[key][1];
        arrKey = arrKey.split(", ")[1]; // Get only State value 
        if (stateCountMap.has(arrKey)) {
            var ct = stateCountMap.get(arrKey);
            stateCountMap.set(arrKey, ct + 1);
        } else {
            stateCountMap.set(arrKey, 1);
        }
    }
    plotMap(stateCountMap);
}

function unpack(rows, key) {
    return rows.map(function (row) { return row[key]; });
}

function plotMap(stateCountMap) {
    plotlyMap(stateCountMap)
}
const plotlyMap = (stateCountMap) =>{
    d3.csv('/data/states_lat_long.csv', function (err, rows) {
        console.log(unpack(rows, 'name'));
        var stateName = unpack(rows, 'name'),
            stateLat = unpack(rows, 'lat'),
            stateLon = unpack(rows, 'lon'),
            color = [, "rgb(255,65,54)", "rgb(133,20,75)", "rgb(255,133,27)", "lightgrey"],
            stateSize = [],
            hoverText = [];
        
        for (var i = 0; i < stateName.length; i++) {
            var currentText = stateName[i];
            stateSize.push((stateCountMap.get(stateName[i]))*6);
            hoverText.push(currentText + ' : ' + stateCountMap.get(stateName[i]));
        }
      
        // stateSize = [21, 10, 3, 4]
        // hoverText = ["california: 21", "new york": 2]
        var data = [{
            type: 'scattergeo',
            locationmode: 'USA-states',
            lat: stateLat,
            lon: stateLon,
            hoverinfo: 'text',
            text: hoverText,
            marker: {
                size: stateSize,
                line: {
                    color: 'black',
                    width: 2
                },
            }
        }];

        var layout = {
            title: '',
            showlegend: true,
            geo: {
                scope: 'usa',
                projection: {
                    type: 'albers usa'
                },
                showland: true,
                landcolor: 'rgb(217, 217, 217)',
                subunitwidth: 1,
                countrywidth: 1,
                subunitcolor: 'rgb(255,255,255)',
                countrycolor: 'rgb(255,255,255)'
            },
            height: 600,
            width: 1000
        };

        Plotly.newPlot("result-div", data, layout, { showLink: false });
    
    });

}

const leafletMap = ()=> {// Leaflet map
// Initialize & Create Separate LayerGroups: earthquakes & tectonicPlates
var other = new L.LayerGroup();
var workplace = new L.LayerGroup();
var school = new L.LayerGroup();
var military = new L.LayerGroup();
var religious = new L.LayerGroup();
var airport = new L.LayerGroup();

// // Earthquakes & Tectonic Plates GeoJSON URL Variables
var earthquakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
console.log(earthquakesURL)
// Define Variables for Tile Layers
// var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
//     attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
//     maxZoom: 18,
//     id: "mapbox.satellite",
//     accessToken: API_KEY
// });

var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
	attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
	maxZoom: 18,
	id: "mapbox.streets",
	accessToken: API_KEY
});

// var grayscaleMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
//     attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
//     maxZoom: 18,
//     id: "mapbox.light",
//     accessToken: API_KEY
// });

// var outdoorsMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
//     attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
//     maxZoom: 18,
//     id: "mapbox.outdoors",
//     accessToken: API_KEY
// });

// Define baseMaps Object to Hold Base Layers
var baseMaps = {
    "Light": lightmap,
    // "Grayscale": grayscaleMap,
    // "Outdoors": outdoorsMap
};

// Create Overlay Object to Hold Overlay Layers
var overlayMaps = {
    "Other": other,
    "Workplace": workplace,
    "School": school,
    "Military": military,
    "Religious": religious,
    "Airport": airport
};

// Create Map, Passing In satelliteMap & earthquakes as Default Layers to Display on Load
var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 2,
    layers: [lightmap, other, workplace, school, military, religious, airport]
});

// Create a Layer Control + Pass in baseMaps and overlayMaps + Add the Layer Control to the Map
L.control.layers(baseMaps, overlayMaps).addTo(myMap);

// Retrieve earthquakesURL (USGS Earthquakes GeoJSON Data) with D3
d3.json(("us_shootings.json").then(function(incidentData) {
    // Function to Determine Size of Marker Based on the Magnitude of the Earthquake
    function markerSize() {
        if (incident === 0) {
          return 1;
        }
        return incident * 3;
    }

    // Function to Determine Style of Marker Based on the Magnitude of the Earthquake
    function styleInfo(incident) {
        return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: chooseColor(Total_Victims),
          color: "#000000",
          radius: markerSize(Total_Victims),
          stroke: true,
          weight: 0.5
        };
    }

    // Function to Determine Color of Marker Based on the Magnitude of the Earthquake
    function chooseColor(fatalities) {
		if (fatalities > 150) {
			return "#ea2c2c";
		}
		if (fatalities > 100) {
			return "#ea822c";
		}
		if (fatalities > 70) {
			return "#ee9c00";
		}
		if (fatalities > 40) {
			return "#eecc00";
		}
		if (fatalities > 20) {
			return "#d4ee00";
		}
		return "#daf7a6";
    }

    // Create a GeoJSON Layer Containing the Features Array on the earthquakeData Object
    L.geoJSON(incidentData, {
        pointToLayer: function(incident, Latitude, Longitude) {
            return L.circleMarker(Latitude, Longitude);
        },
        style: styleInfo,
        // Function to Run Once For Each feature in the features Array
        // Give Each feature a Popup Describing the Place & Time of the Earthquake
        onEachFeature: function(incident, layer) {
            layer.bindPopup("<h4>Incident: " + incident.Name_of_Incident);
            // "</h4><hr><p>Date & Time: " + new Date(feature.properties.time) + 
            // "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        }
    // Add earthquakeData to earthquakes LayerGroups 
    }).addTo(other);
    // Add earthquakes Layer to the Map
    other.addTo(myMap);

    // Retrieve platesURL (Tectonic Plates GeoJSON Data) with D3
    // d3.json(platesURL, function(plateData) {
    //     // Create a GeoJSON Layer the plateData
    //     L.geoJson(plateData, {
    //         color: "#DC143C",
    //         weight: 2
    //         // Add plateData to tectonicPlates LayerGroups
    //         }).addTo(tectonicPlates);
    //         // Add tectonicPlates Layer to the Map
    //         tectonicPlates.addTo(myMap);
    //         });

    // Set Up Legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend"),
        levels = [0, 1, 2, 3, 4, 5];
        div.innerHTML += "<h3>US Shootings</h3>"

        for (var i = 0; i < magnitudeLevels.length; i++) {
            div.innerHTML +=
            '<i style="background: ' + chooseColor(levels[i] + 1) + '"></i> ' +
            levels[i] + (levels[i + 1] ? '&ndash;' + levels[i + 1] + '<br>' : '+');
        }
        return div;
    };
    // Add Legend to the Map
    legend.addTo(myMap);}))}