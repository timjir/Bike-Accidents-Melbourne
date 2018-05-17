/**
 * Created by Tim on 21/04/2017.
 */
var LatrobeDate = new Date("July 01, 2013 00:00:00");

// set the map centre and zoom level to show melbourne cbd
var latrobeMap = L.map('latrobeMap').setView([-37.810,144.9625], 15);

L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(latrobeMap);

var latrobeSvg = d3.select(latrobeMap.getPanes().overlayPane).append("svg"),
    latrobeG = latrobeSvg.append("g").attr("class", "leaflet-zoom-hide");


var parseTimeDayMonthYear = d3.timeParse("%-d/%m/%Y");

d3.json("./data/accidents.geojson", function(error, accidents) {
    if (error) throw error;


    var latrobeTransform = d3.geoTransform({point: projectPoint}),
        latrobePath = d3.geoPath().projection(latrobeTransform).pointRadius(8);

    var latrobeFeature = latrobeG.selectAll("path")
        .data(accidents.features)
        .enter().append("path");

    // whenever the map is views moved (reset) call the mapDraw function
    latrobeMap.on("moveend", latrobeMapDraw);
    latrobeMapDraw();

    // Reposition the SVG to cover the features.
    function latrobeMapDraw() {
        var latrobeBounds = latrobePath.bounds(accidents),
            latrobeTopLeft = latrobeBounds[0],
            latrobeBottomRight = latrobeBounds[1];

        latrobeSvg .attr("width", latrobeBottomRight[0] - latrobeTopLeft[0])
            .attr("height", latrobeBottomRight[1] - latrobeTopLeft[1])
            .style("left", latrobeTopLeft[0] + "px")
            .style("top", latrobeTopLeft[1] + "px");

        latrobeG   .attr("transform", "translate(" + -latrobeTopLeft[0] + "," + -latrobeTopLeft[1] + ")");

        latrobeFeature.attr("d", latrobePath);
        latrobeFeature.attr("date", function (d) { return parseTimeDayMonthYear(d.properties.ACCIDENTDATE) });
        latrobeFeature.attr("time", function (d) { return d.properties.ACCIDENTTIME });
        latrobeFeature.attr("street", function (d) { return d.properties.ROAD_NAME });
        latrobeFeature.attr("type_desc", function (d) { return d.properties.ACCIDENT_TYPE_DESC });
        latrobeFeature.attr("day_of_week", function (d) { return d.properties.DAY_WEEK_DESC });
        latrobeFeature.attr("no_of_vehicles", function (d) { return d.properties.NO_OF_VEHICLES });
        latrobeFeature.attr("severity", function (d) { return d.properties.SEVERITY });
        latrobeFeature.attr("road_geometry", function (d) { return d.properties.ROAD_GEOMETRY_DESC });
        latrobeFeature.attr("road_geometry", function (d) { return d.properties.ROAD_GEOMETRY_DESC });
        latrobeFeature.attr("traffic_control", function (d) { return d.properties.TRAFFIC_CONTROL_DESC });
        
    }

    // Use Leaflet to implement a D3 geometric transformation.
    function projectPoint(x, y) {
        var point = latrobeMap.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
    }


    displayOff();
    colorLATROBE();
    dateLATROBE();

});

function displayOff() {
    latrobeG.selectAll('path')
        .style("display","none");
}


function colorLATROBE() {
    latrobeG.selectAll('path')
        .filter(function(d) {return d.properties.ROAD_NAME == "LA TROBE" })
        .style("fill", "#1b9e77")
        .style("display","inline")
        .style("opacity", "0.4");
};

function dateLATROBE() {
    latrobeG.selectAll('path')
        .filter(function(d) {
            return parseTimeDayMonthYear(d.properties.ACCIDENTDATE).getTime() < LatrobeDate.getTime() })
        .style('fill', '#d95f02')
        .style("opacity", "0.4");
};
