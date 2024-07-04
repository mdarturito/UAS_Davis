function renderPieChart(selector, data, title) {
    const pieWidth = 400;
    const pieHeight = 400;
    const pieRadius = Math.min(pieWidth, pieHeight) / 2;

    const pieColor = d3.scaleOrdinal()
        .domain(data.map(d => d.label))
        .range(["#1f77b4", "#d62728"]);

    const pieArc = d3.arc()
        .outerRadius(pieRadius - 10)
        .innerRadius(0);

    const pieLabelArc = d3.arc()
        .outerRadius(pieRadius - 40)
        .innerRadius(pieRadius - 40);

    const pie = d3.pie()
        .sort(null)
        .value(d => d.count);

    const pieSvg = d3.select(selector)
        .append("svg")
        .attr("width", pieWidth)
        .attr("height", pieHeight)
        .append("g")
        .attr("transform", "translate(" + pieWidth / 2 + "," + pieHeight / 2 + ")");

    const pieG = pieSvg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

    pieG.append("path")
        .attr("d", pieArc)
        .style("fill", d => pieColor(d.data.label))
        .transition()
        .ease(d3.easeBounce)
        .duration(1000)
        .attrTween("d", function(d) {
            const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
            return function(t) {
                return pieArc(interpolate(t));
            };
        });

    pieG.append("text")
        .attr("class", "pie-label")
        .attr("transform", d => "translate(" + pieLabelArc.centroid(d) + ")")
        .attr("dy", ".35em")
        .text(d => `${d.data.label}: ${(d.data.count / d3.sum(data, d => d.count) * 100).toFixed(2)}%`)
        .style("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-size", "12px");

    const pieLegend = pieSvg.selectAll(".legend")
        .data(data)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(" + (pieWidth / 2 + 20) + "," + (i * 30 - pieHeight / 2) + ")");

    pieLegend.append("rect")
        .attr("x", 0)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => pieColor(d.label));

    pieLegend.append("text")
        .attr("x", 25)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => d.label);
}
