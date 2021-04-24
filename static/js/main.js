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