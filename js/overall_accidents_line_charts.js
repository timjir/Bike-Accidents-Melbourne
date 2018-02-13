var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 500 - margin.left - margin.right,
    height = 270 - margin.top - margin.bottom;


var chart1 = d3.select("#chartOne")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var chart2 = d3.select("#chartTwo")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%m/%Y");

var x = d3.scaleTime()
    .rangeRound([0, width]);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);



var lineAccidentsByMonth = d3.line()
    .x(function(d) { return x(parseTime(d.key)); })
    .y(function(d) { return y(d.value); });

var lineAccidentsByMonthPerCyclist = d3.line()
    .x(function(d) { return x(parseTime(d.key)); })
    .y(function(d) { return y((d.value.count * 12 / d.value.cyclists)); });


// Get the data

d3.json("./data/accidents.geojson", function(error, accidents) {
    if (error) throw error;

    var accidentsByMonth = d3.nest()
        .key(function (d, i) {
            return d.properties.ACCIDENTDATE.split("/")[1] + '/' + d.properties.ACCIDENTDATE.split("/")[2];
        })
        .rollup(function (v) {
            return v.length;
        })
        .entries(accidents.features);

    var accidentsByMonthPerCyclist = d3.nest()
        .key(function (d) {
            return d.properties.ACCIDENTDATE.split("/")[1] + '/' + d.properties.ACCIDENTDATE.split("/")[2];
        })
        .rollup(function (v) {
            return {
                count:v.length,
                cyclists:d3.mean(v, function(d) { return d.properties.CYCLISTS; })
            };
        })
        .entries(accidents.features);





    // Scale the range of the data
    x.domain(d3.extent(accidentsByMonth, function(d) { return parseTime(d.key); }));
    y.domain(d3.extent(accidentsByMonth, function(d) { return d.value; }));


    chart1.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .select(".domain")
        .remove();

    chart1.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Accidents (Monthly)");

    chart1.append("path")
        .datum(accidentsByMonth)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", lineAccidentsByMonth);

    var accidentsByMonth = d3.nest()
        .key(function (d) {
            return d.properties.ACCIDENTDATE.split("/")[1] + '/' + d.properties.ACCIDENTDATE.split("/")[2];
        })
        .rollup(function (v) {
            return v.length;
        })
        .entries(accidents.features);



    // Scale the range of the data
    x.domain(d3.extent(accidentsByMonthPerCyclist, function(d) { return parseTime(d.key); }));
    y.domain(d3.extent(accidentsByMonthPerCyclist, function(d) { return (d.value.count * 12 / d.value.cyclists); }));



    chart2.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .select(".domain")
        .remove();

    chart2.append("g")
        .attr("transform", "translate( " + width + ", 0 )")
        .call(d3.axisRight(y))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "-1.4em")
        .attr("text-anchor", "end")
        .text("Accidents per Cyclist (Monthly)");

    chart2.append("path")
        .datum(accidentsByMonthPerCyclist)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", lineAccidentsByMonthPerCyclist);

});


