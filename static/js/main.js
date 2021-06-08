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
    choroplethMap();
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
    var valNumMapping = { "name": 0, "place": 1, "age": 11, "Gender": 19, "race": 18, "Year": 26};
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
            { title: "Shooter's Age" },
            { title: "Shooter's Gender" },
            { title: "Shooter's Race" },
            { title: "Year" }
        ]
    });
}

/**** Chart View ****/
// *** Pie Chart ***
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
    updateBarChart('age');
    plotBarChart(labelCountMap)

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

// *** Bar Chart ***
function updateBarChart(value) {
    var labelCountMap2 = new Map();
    var valNumMapping2 = { "race": 18, "age": 11, "locationType": 9 };
    for (var key in allRows) {
        var thisRow2 = allRows[key];
        var arrKey2 = thisRow2[valNumMapping2[value]];
        console.log(arrKey2);
        if (labelCountMap2.has(arrKey2)) {
            var ct2 = labelCountMap2.get(arrKey2);
            labelCountMap2.set(arrKey2, ct2 + 1);
        } else {
            labelCountMap2.set(arrKey2, 1);
        }
    }
    console.log(Array.from(labelCountMap2.keys()));
    console.log(Array.from(labelCountMap2.values()));
    plotBarChart(labelCountMap2);
}

function plotBarChart(dataMap2) {
    var data2 = [{
        y : Array.from(dataMap2.values()),
        x : Array.from(dataMap2.keys()),
        type: 'bar'
    }];

    var layout2 = {
        title : "Number of Incidents in each category",
        height: 600,
        width: 700
    };

    Plotly.newPlot('result-div-bar', data2, layout2);
}

/****  Landing Page Maps ****/
// *** Choropleth Map Animation ***
function choroplethMap() {
    d3.csv("data/mass_shootings2.csv", function(err, rows){

    function filter_and_unpack(rows, key, year) {
    return rows.filter(row => row['Year'] == year).map(row => row[key])
    }

    var frames = []
    var slider_steps = []

    var n = 39;
    var num = 1982;
    for (var i = 0; i <= n; i++) {
        var z = filter_and_unpack(rows, 'Total_Victims', num)
        var locations = filter_and_unpack(rows, 'State', num)
        var incName = filter_and_unpack(rows, 'Name_of_Incident', num)
        frames[i] = {data: [{z: z, locations: locations, text: incName}], name: num}
        slider_steps.push ({
            label: num.toString(),
            method: "animate",
            args: [[num], {
                mode: "immediate",
                transition: {duration: 300},
                frame: {duration: 300}
            }
            ]
        })
        num = num + 1
    }

    var data = [{
        type: 'choropleth',
        locationmode: 'USA-states',
        locations: frames[0].data[0].locations,
        z: frames[0].data[0].z,
        text: frames[0].data[0].locations,
        zauto: false,
        zmin: 0,
        zmax: 604

    }];
    var layout = {
        title: 'Mass Shootings in America<br>1982 - 2021',
        geo:{
        scope: 'usa',
        color_continuous_scale : "Inferno",
        reversescale : true,
        showland: true,
        landcolor: 'rgb(217, 217, 217)',
        showlakes: true,
        lakecolor: 'rgb(255, 255, 255)',
        subunitcolor: 'rgb(255, 255, 255)',
        lonaxis: {},
        lataxis: {}
        },
        updatemenus: [{
        x: 0.1,
        y: 0,
        yanchor: "top",
        xanchor: "right",
        showactive: false,
        direction: "left",
        type: "buttons",
        pad: {"t": 87, "r": 10},
        buttons: [{
            method: "animate",
            args: [null, {
            fromcurrent: true,
            transition: {
                duration: 200,
            },
            frame: {
                duration: 500
            }
            }],
            label: "Play"
        }, {
            method: "animate",
            args: [
            [null],
            {
                mode: "immediate",
                transition: {
                duration: 0
                },
                frame: {
                duration: 0
                }
            }
            ],
            label: "Pause"
        }]
        }],
        sliders: [{
        active: 0,
        steps: slider_steps,
        x: 0.1,
        len: 0.9,
        xanchor: "left",
        y: 0,
        yanchor: "top",
        pad: {t: 50, b: 10},
        currentvalue: {
            visible: true,
            prefix: "Year:",
            xanchor: "right",
            font: {
            size: 20,
            color: "#666"
            }
        },
        transition: {
            duration: 300,
            easing: "cubic-in-out"
        }
        }]
    };
    // console.log(frames)
    Plotly.newPlot('myDiv2', data, layout).then(function() {
        Plotly.addFrames('myDiv2', frames);
    });
    })
}

// *** Bubble Map ***
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
    var stateCountMap = new Map(); //{"California": 21, "New York": 10, ...}
    for (var key in allRows) {
        var arrKey = allRows[key][1];
        arrKey = arrKey.split(", ")[1]; // Get only 'State' value 
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
    console.log(stateCountMap);
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
        // hoverText = ["California: 21", "New York": 2]
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
            showlegend: false,
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
            height: 700,
            width: 1000
        };

        Plotly.newPlot("result-div", data, layout, { showLink: false });
    
    });
}