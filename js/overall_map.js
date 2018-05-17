/**
 * Created by Tim on 21/04/2017.
 */
var LatrobeDate = new Date("July 01, 2013 00:00:00");

// set the map centre and zoom level to show melbourne cbd
var map = L.map('map').setView([-37.8145,144.9625], 15);

L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");


var parseTimeDayMonthYear = d3.timeParse("%-d/%m/%Y");

// Define the div for the tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

d3.json("./data/accidents.geojson", function(error, accidents) {
    if (error) throw error;


    var transform = d3.geoTransform({point: projectPoint}),
        path = d3.geoPath().projection(transform).pointRadius(8);

    var feature = g.selectAll("path")
        .data(accidents.features)
        .enter().append("path");

    // whenever the map is views moved (reset) call the mapDraw function
    map.on("moveend", mapDraw);
    mapDraw();

    // Reposition the SVG to cover the features.
    function mapDraw() {
        var bounds = path.bounds(accidents),
            topLeft = bounds[0],
            bottomRight = bounds[1];

        console.log(bounds);
        console.log('bottom right ' + bottomRight);
        console.log('top let' + topLeft);

        svg.attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", topLeft[1] + "px");

        g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
        console.log("here");
        feature.attr("d", path);
        feature.attr("pointer-events", "visible");
        feature.attr("date", function (d) {
            return parseTimeDayMonthYear(d.properties.ACCIDENTDATE)
        });

        feature.on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div	.html('Date: ' + d.properties.ACCIDENTDATE + '<br>Street: ' + d.properties.ROAD_NAME + ' ' + d.properties.ROAD_TYPE)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
    }

    // Use Leaflet to implement a D3 geometric transformation.
    function projectPoint(x, y) {
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));

        this.stream.point(point.x, point.y);
    }



});

