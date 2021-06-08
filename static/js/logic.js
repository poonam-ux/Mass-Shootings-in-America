console.log("working")

// Initialize & Create Two Separate LayerGroups: incidentDetails & shooterDetails
var incidentDetails = new L.LayerGroup();
var shooterDetails = new L.LayerGroup();

// Define Variables for Tile Layers
let satelliteStreets = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map Data",
    maxZoom: 18,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
    })

// Create the second outdoor tile layer that will be the background of our map
let outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map Data",
      maxZoom: 18,
      id: "mapbox/streets-v11",
      accessToken: API_KEY
    })

// We create third gray tile that will be the background of our map
let light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map Data",
    maxZoom: 18,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
    })

// Define baseMaps Object to Hold Base Layers
var baseMaps = {
    "Satellite": satelliteStreets,
    "Grayscale": light,
    "Outdoors": outdoors
};

// Create Overlay Object to Hold Overlay Layers
var overlayMaps = {
    "Incidents": incidentDetails,
    "Shooter Details": shooterDetails,
};

// Create Map, Passing In satelliteMap & earthquakes as Default Layers to Display on Load
var myMap = L.map("mapid", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [outdoors, incidentDetails]
});

// Create a Layer Control + Pass in baseMaps and overlayMaps + Add the Layer Control to the Map
L.control.layers(baseMaps, overlayMaps).addTo(myMap);

// *** Part 1 - Plot total victims in each incident ***
d3.json("data/data.json").then(function(data) {
    // Function to Determine Size of Marker Based on the 'Total Victims'
    function markerSize(vic) {
        if (vic === 0) {
          return 1;
        }
        return vic * 0.3;
    }

    // Function to Determine Style of Marker Based on the 'Total Victims'
    function styleInfo(feature) {
        return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: chooseColor(feature.properties.Total_Victims),
          color: "#000000",
          radius: markerSize(feature.properties.Total_Victims),
          stroke: true,
          weight: 0.5
        };
    }

    // Function to Determine Color of Marker Based on the 'Total Victims'
    function chooseColor(vic) {
        if(vic >54) {
            return "#ffffff";
        }
		if(vic >45) {
            return "#0080ff";
        }
        if(vic >36) {
            return "#00ffff";
        }
        if(vic >27) {
            return "#40ff00";
        }
        if(vic >18) {
            return "#bfff00";
        }
        if(vic >9) {
            return "#ff8000";
        }
        return "#ff0000";
    }

    // Create a GeoJSON Layer Containing the Features Array on the incident data Object
    L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        // Function to Run Once For Each feature in the features Array
        // Give Each feature a Popup describing the incident
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h5>Number of Victims: " + feature.properties.Total_Victims + 
            "<h5>Location Type: " + feature.properties.Location_Type + 
            "<h5>Weapon Type: " + feature.properties.Weapon_Type + 
            "</p><hr><p>Incident Name: " + feature.properties.Name_of_Incident + "</p>" +
            "</p><hr><p>City: " + feature.properties.Location_City + "</p>" +
            "</p><hr><p>Date: " + feature.properties.Date + "</p>" );
        }
    // Add incident data to incidentDetails LayerGroups 
    }).addTo(incidentDetails);
    // Add incidentDetails Layer to the Map
    incidentDetails.addTo(myMap);

     // Set Up Legend
     var legend = L.control({ position: "bottomright" });
     legend.onAdd = function() {
         var div = L.DomUtil.create("div", "info legend"),
         magnitudeLevels = [1, 9, 18, 27, 36, 45, 54];
         div.innerHTML += "<h5>Total Victims</h5>"
 
         for (var i = 0; i < magnitudeLevels.length; i++) {
             div.innerHTML +=
             '<i style="background: ' + chooseColor(magnitudeLevels[i] + 1) + '"></i> ' +
             magnitudeLevels[i] + (magnitudeLevels[i + 1] ? '&ndash;' + magnitudeLevels[i + 1] + '<br>' : '+');
         }
         return div;
     };
     // Add Legend to the Map
     legend.addTo(myMap);
})
    // Part 2 - Plot Shooter details for each incident 
    d3.json("data/data.json").then(function(data) {
        // Function to Determine Style of Marker Based on the 'Total Victims'
        function styleInfo2(feature) {
            return {
              opacity: 1,
              fillOpacity: 1,
              fillColor: chooseColor2(feature.properties.Age_Group),
              color: "#000000",
              stroke: true,
              weight: 0.5
            };
        }
        // Function to Determine Color of Marker Based on the 'Location Type'
        function chooseColor2(age) {
            if(age == "0-12") {
                return "#ffffff";
            }
            if(age == "Teens") {
                return "#0080ff";
            }
            if(age == "20s") {
                return "#00ffff";
            }
            if(age == "30s") {
                return "#40ff00";
            }
            if(age == "40s") {
                return "#bfff00";
            }
            if(loc == "50s") {
                return "#ff8000";
            }
            return "ff0000"
        }
    
        // Create a GeoJSON Layer Containing the Features Array on the incident data Object
        L.geoJSON(data, {
            pointToLayer: function(feature, latlng) {
                return L.marker(latlng);
            },
            style: styleInfo2,
            // Function to Run Once For Each feature in the features Array
            // Give Each feature a Popup Describing the 'Number of Victims'
            onEachFeature: function(feature, layer) {
                layer.bindPopup("<h5>Shooter Age: " + feature.properties.Age_of_Shooter +
                "<h5>Race: " + feature.properties.Race +
                "<h5>Gender: " + feature.properties.Gender +
                "<h5>Prior signs of mental health issues: " + feature.properties.Prior_signs_Mental_Health_Issues +
                "<h5>Number of Victims: " + feature.properties.Total_Victims +
                "</p><hr><p>Incident Name: " + feature.properties.Name_of_Incident + "</p>" +
                "</p><hr><p>City: " + feature.properties.Location_City + "</p>" +
                "</p><hr><p>Date: " + feature.properties.Date + "</p>" );
            }
        // Add incident data to locationType LayerGroups 
        }).addTo(shooterDetails);
        // Add locationType Layer to the Map
        shooterDetails.addTo(myMap);
})
