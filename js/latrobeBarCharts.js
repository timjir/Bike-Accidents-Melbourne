var parseTimeDayMonthYear = d3.timeParse("%-d/%m/%Y");
var latrobeDate = new Date("July 01, 2013 00:00:00");

var latrobeBarChartmargin = {top: 30, right: 20, bottom: 90, left: 50},
    latrobeBarChartwidth = 750 - latrobeBarChartmargin.left - latrobeBarChartmargin.right,
    latrobeBarChartheight = 400 - latrobeBarChartmargin.top - latrobeBarChartmargin.bottom;

var latrobeBarChart = d3.select("#latrobeBarChart")
    .append("svg")
    .attr("width", latrobeBarChartwidth + latrobeBarChartmargin.left + latrobeBarChartmargin.right)
    .attr("height", latrobeBarChartheight + latrobeBarChartmargin.top + latrobeBarChartmargin.bottom)
    .append("g")
    .attr("transform", "translate(" + latrobeBarChartmargin.left + "," + latrobeBarChartmargin.top + ")");



var latrobeBarChartx0 = d3.scaleBand().rangeRound([0, latrobeBarChartwidth]).padding(0.1),
    latrobeBarChartx1 = d3.scaleBand().padding(0.05),
    latrobeBarCharty = d3.scaleLinear().rangeRound([latrobeBarChartheight, 0]);

d3.json("./data/accidents.geojson", function(error, accidents) {
    if (error) throw error;

    var accidentsLatrobe =  filterJSON(accidents, "ROAD_NAME", "LA TROBE");
    var filterAttribute = "ACCIDENT_TYPE_DESC";

    var beforeCount = 0;
    var afterCount = 0;

    var latrobeBarChartDataCounts = d3.nest()
        .key(function (d) {
            return d.properties[filterAttribute];
        })
        .key(function (d) {
            var timing;
            if (parseTimeDayMonthYear(d.properties['ACCIDENTDATE']).getTime() < latrobeDate.getTime()) {
                timing = 'Before';
                beforeCount = beforeCount + 1;
            }
            else {
                timing = 'After';
                afterCount = afterCount + 1;
            }
            return timing;
        })
        .entries(accidentsLatrobe.features);

    console.log('after count is ' + afterCount);


    var latrobeBarChartData = d3.nest()
        .key(function (d) {
            return d.properties[filterAttribute];
        })
        .key(function (d) {
            var timing;
            if (parseTimeDayMonthYear(d.properties['ACCIDENTDATE']).getTime() < latrobeDate.getTime()) {
                timing = 'Before';
            }
            else {
                timing = 'After';
            }
            return timing;
        })
        .rollup(function (v) {
            if (parseTimeDayMonthYear(v[0].properties['ACCIDENTDATE']).getTime() < latrobeDate.getTime()){
                return v.length / beforeCount * 100
            }
            else {
                return v.length / afterCount * 100
            }
        })
        .entries(accidentsLatrobe.features);

    console.log(latrobeBarChartData);

    var keys = ['Before', 'After'];


    var maxY = d3.max(d3.entries(latrobeBarChartData), function(d) {
        return d3.max(d3.entries(d.value), function(e) {
            return d3.max(e.value, function(f) { return f.value; });
        });
    });

    console.log('max y is ' +maxY);
    latrobeBarChartx0.domain(latrobeBarChartData.map(function(d) { console.log('d.key ' + d.key); return d.key; }));
    latrobeBarChartx1.domain(keys).rangeRound([0, latrobeBarChartx0.bandwidth()]);
    latrobeBarCharty.domain([0, 100]);


    latrobeBarChart.append("g")
        .selectAll("g")
        .data(latrobeBarChartData)
        .enter().append("g")
        .attr("transform", function(d) { return "translate(" + latrobeBarChartx0(d.key) + ",0)"; })
        .selectAll("rect")
        .data(function(d) { console.log(d.values); return d.values })
        .enter().append("rect")
        .attr("x", function(d) { return latrobeBarChartx1(d.key); })
        .attr("y", function(d) { return latrobeBarCharty(d.value); })
        .attr("width", latrobeBarChartx1.bandwidth())
        .attr("height", function(d) { return latrobeBarChartheight - latrobeBarCharty(d.value); })
        .attr("class", function(d) { return d.key; })

    latrobeBarChart.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + latrobeBarChartheight + ")")
        .call(d3.axisBottom(latrobeBarChartx0))
        .selectAll(".tick text")
        .call(wrap, latrobeBarChartx0.bandwidth() + 5);;

    latrobeBarChart.append("g")
        .call(d3.axisLeft(latrobeBarCharty))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "-3.5em")
        .attr("text-anchor", "end")
        .text("Percent of Accidents");

    var legend = latrobeBarChart.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys)
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", latrobeBarChartwidth - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("class", function(d) { return d; });

    legend.append("text")
        .attr("x", latrobeBarChartwidth - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) { return d; });
});



function updateChart(filterAttribute) {
    d3.json("./data/accidents.geojson", function(error, accidents) {
        if (error) throw error;

        var accidentsLatrobe =  filterJSON(accidents, "ROAD_NAME", "LA TROBE");

        var beforeCount = 0;
        var afterCount = 0;

        var latrobeBarChartDataCounts = d3.nest()
            .key(function (d) {
                return d.properties[filterAttribute];
            })
            .key(function (d) {
                var timing;
                if (parseTimeDayMonthYear(d.properties['ACCIDENTDATE']).getTime() < latrobeDate.getTime()) {
                    timing = 'Before';
                    beforeCount = beforeCount + 1;
                }
                else {
                    timing = 'After';
                    afterCount = afterCount + 1;
                }
                return timing;
            })
            .entries(accidentsLatrobe.features);

        console.log('after count is ' + afterCount);


        var latrobeBarChartData = d3.nest()
            .key(function (d) {
                return d.properties[filterAttribute];
            })
            .key(function (d) {
                var timing;
                if (parseTimeDayMonthYear(d.properties['ACCIDENTDATE']).getTime() < latrobeDate.getTime()) {
                    timing = 'Before';
                }
                else {
                    timing = 'After';
                }
                return timing;
            })
            .rollup(function (v) {
                if (parseTimeDayMonthYear(v[0].properties['ACCIDENTDATE']).getTime() < latrobeDate.getTime()){
                    return v.length / beforeCount * 100
                }
                else {
                    return v.length / afterCount * 100
                }
            })
            .entries(accidentsLatrobe.features);



        var keys = ['Before', 'After'];


        var maxY = d3.max(d3.entries(latrobeBarChartData), function(d) {
            return d3.max(d3.entries(d.value), function(e) {
                return d3.max(e.value, function(f) { return f.value; });
            });
        });

        console.log('max y is ' +maxY);
        latrobeBarChartx0.domain(latrobeBarChartData.map(function(d) { console.log('d.key ' + d.key); return d.key; }));
        latrobeBarChartx1.domain(keys).rangeRound([0, latrobeBarChartx0.bandwidth()]);
        latrobeBarCharty.domain([0, 100]);

        latrobeBarChart.selectAll("g")
            .remove();

        latrobeBarChart.append("g")
            .selectAll("g")
            .data(latrobeBarChartData)
            .enter().append("g")
            .attr("transform", function(d) { return "translate(" + latrobeBarChartx0(d.key) + ",0)"; })
            .selectAll("rect")
            .data(function(d) { console.log(d.values); return d.values })
            .enter().append("rect")
            .attr("x", function(d) { return latrobeBarChartx1(d.key); })
            .attr("y", function(d) { return latrobeBarCharty(d.value); })
            .attr("width", latrobeBarChartx1.bandwidth())
            .attr("height", function(d) { return latrobeBarChartheight - latrobeBarCharty(d.value); })
            .attr("class", function(d) { return d.key; });

        latrobeBarChart.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + latrobeBarChartheight + ")")
            .call(d3.axisBottom(latrobeBarChartx0))
            .selectAll(".tick text")
            .call(wrap, latrobeBarChartx0.bandwidth() + 5);

        latrobeBarChart.append("g")
            .call(d3.axisLeft(latrobeBarCharty))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "-3.5em")
            .attr("text-anchor", "end")
            .text("Percent of Accidents");

        var legend = latrobeBarChart.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys)
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", latrobeBarChartwidth - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("class", function(d) { return d; });

        legend.append("text")
            .attr("x", latrobeBarChartwidth - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function(d) { return d; });
    });


}







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



function filterJSON(json, key, value) {
    var result = {"type":"FeatureCollection","features":[]};
    for (var accident in json.features) {
        if (json.features[accident].properties[key] === value) {
            result.features.push(json.features[accident]);
        }
    }
    return result;
}

function filterJSONBeforeDate(json, date) {
    var result = {"type":"FeatureCollection","features":[]};
    for (var accident in json.features) {
        if (parseTimeDayMonthYear(json.features[accident].properties['ACCIDENTDATE']).getTime() < date.getTime()) {
            result.features.push(json.features[accident]);
        }
    }
    return result;
}

function filterJSONAfterDate(json, date) {
    var result = {"type":"FeatureCollection","features":[]};
    for (var accident in json.features) {
        if (parseTimeDayMonthYear(json.features[accident].properties['ACCIDENTDATE']).getTime() >= date.getTime()) {
            result.features.push(json.features[accident]);
        }
    }
    return result;
}






/**
 * Created by tric0003 on 21/05/2017.
 */
