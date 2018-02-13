var chart4margin = {top: 30, right: 20, bottom: 90, left: 50},
    chart4width = 600 - chart4margin.left - chart4margin.right,
    chart4height = 270 - chart4margin.top - chart4margin.bottom;

var chart4 = d3.select("#chartFour")
    .append("svg")
    .attr("width", chart4width + chart4margin.left + chart4margin.right)
    .attr("height", chart4height + chart4margin.top + chart4margin.bottom)
    .append("g")
    .attr("transform", "translate(" + chart4margin.left + "," + chart4margin.top + ")");


var chart4x = d3.scaleBand().rangeRound([0, chart4width]).padding(0.1),
    chart4y = d3.scaleLinear().rangeRound([chart4height, 0]);


d3.json("accidents.geojson", function(error, accidents) {
    if (error) throw error;

    var accidentsByRoadGeometry = d3.nest()
        .key(function (d, i) {
            return d.properties.ROAD_GEOMETRY_DESC;
        })
        .rollup(function (v) {
            return v.length;
        })
        .entries(accidents.features);

    chart4x.domain(accidentsByRoadGeometry.map(function(d) { return d.key; }));
    chart4y.domain([0, d3.max(accidentsByRoadGeometry, function(d) { return +d.value; })]);





    //console.log(JSON.stringify(accidentsByRoadGeometry));
    //console.log((accidentsByRoadGeometry[0].value));
    //console.log((accidentsByRoadGeometry[0].value.count));
    //console.log((accidentsByRoadGeometry[0].value.cyclists));




    // Scale the range of the data
    //x.domain(d3.extent(accidentsByMonth, function(d) { return parseTime(d.key); }));
    //y.domain(d3.extent(accidentsByMonth, function(d) { return d.value; }));


    chart4.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + chart4height + ")")
        .call(d3.axisBottom(chart4x))
        .selectAll(".tick text")
        .call(wrap, chart4x.bandwidth() + 5);

    chart4.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(chart4y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Accidents");

    chart4.selectAll(".bar")
        .data(accidentsByRoadGeometry)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return chart4x(d.key); })
        .attr("y", function(d) { return chart4y(d.value); })
        .attr("width", chart4x.bandwidth())
        .attr("height", function(d) { return chart4height - chart4y(d.value); });
});

// wrap function from https://bl.ocks.org/mbostock/7555321
function wrap(text, width) {
    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}





