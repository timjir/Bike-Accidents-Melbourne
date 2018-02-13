/**
 * Created by Tim on 21/04/2017.
 */
var detailDate = new Date("July 01, 2013 00:00:00");

// set the map centre and zoom level to show melbourne cbd
var detailMap = L.map('detailMap').setView([-37.8150,144.9625], 15);

L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(detailMap);

var detailSvg = d3.select(detailMap.getPanes().overlayPane).append("svg"),
    detailG = detailSvg.append("g").attr("class", "leaflet-zoom-hide");

// Define the div for the tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var parseTimeDayMonthYear = d3.timeParse("%-d/%m/%Y");

var color  = d3.scaleOrdinal(['#1b9e77','#d95f02','#7570b3','#e7298a','#66a61e','#e6ab02']);

d3.json("./data/accidents.geojson", function(error, accidents) {
    if (error) throw error;


    var detailTransform = d3.geoTransform({point: projectPoint}),
        detailPath = d3.geoPath().projection(detailTransform).pointRadius(8);

    var detailFeature = detailG.selectAll("path")
        .data(accidents.features)
        .enter().append("path");

    // whenever the map is views moved (reset) call the mapDraw function
    detailMap.on("viewreset", detailMapDraw);
    detailMapDraw();

    // Reposition the SVG to cover the features.
    function detailMapDraw() {
        var detailBounds = detailPath.bounds(accidents),
            detailTopLeft = detailBounds[0],
            detailBottomRight = detailBounds[1];

        detailSvg .attr("width", detailBottomRight[0] - detailTopLeft[0])
            .attr("height", detailBottomRight[1] - detailTopLeft[1])
            .style("left", detailTopLeft[0] + "px")
            .style("top", detailTopLeft[1] + "px");

        detailG   .attr("transform", "translate(" + -detailTopLeft[0] + "," + -detailTopLeft[1] + ")");

        detailFeature.attr("d", detailPath);
        detailFeature.attr("date", function (d) { return parseTimeDayMonthYear(d.properties.ACCIDENTDATE) });
        detailFeature.attr("time", function (d) { return d.properties.ACCIDENTTIME });
        detailFeature.attr("street", function (d) { return d.properties.ROAD_NAME });
        detailFeature.attr("type_desc", function (d) { return d.properties.ACCIDENT_TYPE_DESC });
        detailFeature.attr("day_of_week", function (d) { return d.properties.DAY_WEEK_DESC });
        detailFeature.attr("no_of_vehicles", function (d) { return d.properties.NO_OF_VEHICLES });
        detailFeature.attr("severity", function (d) { return d.properties.SEVERITY });
        detailFeature.attr("road_geometry", function (d) { return d.properties.ROAD_GEOMETRY_DESC });
        detailFeature.attr("road_geometry", function (d) { return d.properties.ROAD_GEOMETRY_DESC });
        detailFeature.attr("traffic_control", function (d) { return d.properties.TRAFFIC_CONTROL_DESC });
        detailFeature.attr("pointer-events", "visible");
        detailFeature.on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div	.html('Date: ' + d.properties.ACCIDENTDATE + '<br>' + d.properties.ACCIDENT_TYPE_DESC )
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        });
    }

    // Use Leaflet to implement a D3 geometric transformation.
    function projectPoint(x, y) {
        var point = detailMap.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
    }


    displayOff();
    colorPoints("ACCIDENT_TYPE_DESC");

});

function displayOff() {
    detailG.selectAll('path')
        .style("display","none");
}





function colorPoints(filterAttribute) {
    detailG.selectAll("path")
        .style("display","inline")
        .style("fill-opacity", ".4")
        .attr("fill", function(d) { return color(d.properties[filterAttribute]) })
        .on("mouseover", function(d) {
        div.transition()
            .duration(200)
            .style("opacity", .9);
        div	.html('Date: ' + d.properties.ACCIDENTDATE + '<br>' + d.properties[filterAttribute] )
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    });
    updateDetailBarChart(filterAttribute);
}
