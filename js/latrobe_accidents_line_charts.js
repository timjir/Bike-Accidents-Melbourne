var chart7margin = {top: 30, right: 20, bottom: 90, left: 50},
    chart7width = 550 - chart7margin.left - chart7margin.right,
    chart7height = 270 - chart7margin.top - chart7margin.bottom;

var chart7 = d3.select("#chartSeven")
    .append("svg")
    .attr("width", chart7width + chart7margin.left + chart7margin.right)
    .attr("height", chart7height + chart7margin.top + chart7margin.bottom)
    .append("g")
    .attr("transform", "translate(" + chart7margin.left + "," + chart7margin.top + ")");

var chart8 = d3.select("#chartEight")
    .append("svg")
    .attr("width", chart7width + chart7margin.left + chart7margin.right)
    .attr("height", chart7height + chart7margin.top + chart7margin.bottom)
    .append("g")
    .attr("transform", "translate(" + chart7margin.left + "," + chart7margin.top + ")");

var yearparseTime = d3.timeParse("%Y");

var x = d3.scaleTime()
    .rangeRound([0, chart7width]);

var y = d3.scaleLinear()
    .rangeRound([chart7height, 0]);



var lineAccidentsByYear = d3.line()
    .x(function(d) { return x(yearparseTime(d.key)); })
    .y(function(d) { return y(d.value); });

var lineAccidentsByYearPerCyclist = d3.line()
    .x(function(d) { return x(yearparseTime(d.key)); })
    .y(function(d) { return y((d.value.count * 12 / d.value.cyclists)); });


// Get the data

d3.json("./data/accidents.geojson", function(error, accidents) {
    if (error) throw error;

    var accidentsLatrobe =  filterJSON(accidents, "ROAD_NAME", "LA TROBE");
    //console.log(JSON.stringify(accidentsLatrobe));

    var accidentsLatrobeByYear = d3.nest()
        .key(function (d, i) {
            return d.properties.ACCIDENTDATE.split("/")[2];
        })
        .rollup(function (v) {
            return v.length;
        })
        .entries(accidentsLatrobe.features);

    var accidentsLatrobeByYearPerCyclist = d3.nest()
        .key(function (d) {
            return d.properties.ACCIDENTDATE.split("/")[2];
        })
        .rollup(function (v) {
            return {
                count:v.length,
                cyclists:d3.mean(v, function(d) { return d.properties.CYCLISTS_COUNT_LS; })
            };
        })
        .entries(accidentsLatrobe.features);

    console.log(accidentsLatrobeByYearPerCyclist);





    // Scale the range of the data
    x.domain(d3.extent(accidentsLatrobeByYear, function(d) { return yearparseTime(d.key); }));
    y.domain(d3.extent(accidentsLatrobeByYear, function(d) { return d.value; }));


    chart7.append("g")
        .attr("transform", "translate(0," + chart7height + ")")
        .call(d3.axisBottom(x))
        .select(".domain")
        .remove();

    chart7.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.7em")
        .attr("text-anchor", "end")
        .text("Accidents (Yearly)");

    chart7.append("path")
        .datum(accidentsLatrobeByYear)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", lineAccidentsByYear);

    var accidentsLatrobeByYear = d3.nest()
        .key(function (d) {
            return d.properties.ACCIDENTDATE.split("/")[1] + '/' + d.properties.ACCIDENTDATE.split("/")[2];
        })
        .rollup(function (v) {
            return v.length;
        })
        .entries(accidents.features);



    // Scale the range of the data
    x.domain(d3.extent(accidentsLatrobeByYearPerCyclist, function(d) { return yearparseTime(d.key); }));
    y.domain(d3.extent(accidentsLatrobeByYearPerCyclist, function(d) { return (d.value.count * 12 / d.value.cyclists); }));



    chart8.append("g")
        .attr("transform", "translate(0," + chart7height + ")")
        .call(d3.axisBottom(x))
        .select(".domain")
        .remove();

    chart8.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.7em")
        .attr("text-anchor", "end")
        .text("Accidents per Cyclist (Yearly)");

    chart8.append("path")
        .datum(accidentsLatrobeByYearPerCyclist)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", lineAccidentsByYearPerCyclist);

});


function filterJSON(json, key, value) {
    var result = {"type":"FeatureCollection","features":[]};
    for (var accident in json.features) {
        if (json.features[accident].properties[key] === value) {
            result.features.push(json.features[accident]);
        }
    }
    return result;
}

