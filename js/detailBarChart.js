var detailBarChartmargin = {top: 30, right: 20, bottom: 90, left: 50},
    detailBarChartwidth = 700 - detailBarChartmargin.left - detailBarChartmargin.right,
    detailBarChartheight = 500 - detailBarChartmargin.top - detailBarChartmargin.bottom;

var detailBarChart = d3.select("#detailBarChart")
    .append("svg")
    .attr("width", detailBarChartwidth + detailBarChartmargin.left + detailBarChartmargin.right)
    .attr("height", detailBarChartheight + detailBarChartmargin.top + detailBarChartmargin.bottom)
    .attr("padding-bottom", "300px")
    .append("g")
    .attr("transform", "translate(" + detailBarChartmargin.left + "," + detailBarChartmargin.top + ")");




var detailBarChartx = d3.scaleBand().rangeRound([0, detailBarChartwidth]).padding(0.1),
    detailBarCharty = d3.scaleLinear().rangeRound([detailBarChartheight, 0]);

var color  = d3.scaleOrdinal(['#1b9e77','#d95f02','#7570b3','#e7298a','#66a61e','#e6ab02']);


d3.json("./data/accidents.geojson", function(error, accidents) {
    if (error) throw error;

    var filterAttribute = "ACCIDENT_TYPE_DESC";

     var detailBarChartDataCounts = d3.nest()
        .key(function (d) {
            return d.properties[filterAttribute];
        })

        .rollup(function (v) {
            return v.length;
        })
        .entries(accidents.features);

    detailBarChartx.domain(detailBarChartDataCounts.map(function(d) { return d.key; }));
    detailBarCharty.domain([0, d3.max(detailBarChartDataCounts, function(d) { return +d.value; })]);


    var keys = []
    for (entry in detailBarChartDataCounts) {
        keys.push(detailBarChartDataCounts[entry].key);
    }


    detailBarChart.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + detailBarChartheight + ")")
        .call(d3.axisBottom(detailBarChartx))
        .selectAll(".tick text")
        .call(wrap, detailBarChartx.bandwidth() + 5);

    detailBarChart.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(detailBarCharty))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Accidents");

    detailBarChart.selectAll(".bar")
        .data(detailBarChartDataCounts)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return detailBarChartx(d.key); })
        .attr("y", function(d) { return detailBarCharty(d.value); })
        .attr("width", detailBarChartx.bandwidth())
        .attr("height", function(d) { return detailBarChartheight - detailBarCharty(d.value); })
        .attr("fill", function(d) { return color(d.key) });

    var detailbarChartLegend = detailBarChart.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys)
        .enter().append("g")
        .attr("transform", function(d, i) { console.log('got here'); return "translate(0," + i * 20 + ")"; });

    detailbarChartLegend.append("rect")
        .attr("x", detailBarChartwidth - 19)
        .attr("width", 19)
        .attr("height", 10)
        .attr("fill", color)
        .style("opacity", "0.6");

    detailbarChartLegend.append("text")
        .attr("x", detailBarChartwidth - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) { return d; });
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

function updateDetailBarChart(detailBarChartUpdateAttribute) {
    d3.json("./data/accidents.geojson", function(error, accidents) {
        if (error) throw error;

        detailBarCharty = d3.scaleLinear().rangeRound([detailBarChartheight, 0]);
        var filterAttribute = "ACCIDENT_TYPE_DESC";

        var detailBarChartDataCounts = d3.nest()
            .key(function (d) {
                return d.properties[detailBarChartUpdateAttribute];
            })

            .rollup(function (v) {
                return v.length;
            })
            .entries(accidents.features);

        if (detailBarChartUpdateAttribute == "DCA_DESC") {
            for (entry in detailBarChartDataCounts) {
                if (detailBarChartDataCounts[entry].value <= 5) {
                    detailBarChartDataCounts[entry].key = "Other";
                }
            }
        }

        detailBarChartx.domain(detailBarChartDataCounts.map(function(d) { return d.key; }));
        detailBarCharty.domain([0, d3.max(detailBarChartDataCounts, function(d) { return +d.value; })]);

        var keys = []
        for (entry in detailBarChartDataCounts) {
            keys.push(detailBarChartDataCounts[entry].key);
        }

        detailBarChart.selectAll("g")
            .remove();
        detailBarChart.selectAll(".bar")
            .remove();

        if (detailBarChartUpdateAttribute != "DCA_DESC") {
        detailBarChart.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + detailBarChartheight + ")")
            .call(d3.axisBottom(detailBarChartx))
            .selectAll(".tick text")
            .call(wrap, detailBarChartx.bandwidth() + 5);
        }

        if (detailBarChartUpdateAttribute == "DCA_DESC") {


            detailBarCharty = d3.scaleLinear().rangeRound([200, 0]);

            detailBarCharty.domain([0, d3.max(detailBarChartDataCounts, function(d) { return +d.value; })]);

            detailBarChart.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0, 200)")
                .call(d3.axisBottom(detailBarChartx))
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", "-.75em")
                .attr("transform", "rotate(-90)");

            detailBarChart.selectAll(".bar")
                .data(detailBarChartDataCounts)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return detailBarChartx(d.key); })
                .attr("y", function(d) { return detailBarCharty(d.value); })
                .attr("width", detailBarChartx.bandwidth())
                .attr("height", function(d) { return 200 - detailBarCharty(d.value); })
                .attr("fill", function(d) { return color(d.key) })
                .style("opacity", "0.6");

        }



        detailBarChart.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(detailBarCharty))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Accidents");



        if (detailBarChartUpdateAttribute != "DCA_DESC") {

            detailBarChart.selectAll(".bar")
                .data(detailBarChartDataCounts)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return detailBarChartx(d.key); })
                .attr("y", function(d) { return detailBarCharty(d.value); })
                .attr("width", detailBarChartx.bandwidth())
                .attr("height", function(d) { return detailBarChartheight - detailBarCharty(d.value); })
                .attr("fill", function(d) { return color(d.key) })
                .style("opacity", "0.6");

            var detailbarChartLegend = detailBarChart.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
                .attr("text-anchor", "end")
                .selectAll("g")
                .data(keys)
                .enter().append("g")
                .attr("transform", function (d, i) {
                    return "translate(0," + i * 20 + ")";
                });

            detailbarChartLegend.append("rect")
                .attr("x", detailBarChartwidth - 19)
                .attr("width", 19)
                .attr("height", 19)
                .attr("fill", color)
                .style("opacity", "0.6");


            detailbarChartLegend.append("text")
                .attr("x", detailBarChartwidth - 24)
                .attr("y", 9.5)
                .attr("dy", "0.32em")
                .text(function (d) {
                    return d;
                });
        }
    });


}



