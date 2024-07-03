d3.csv("datasets/cs_all.csv").then(function(data) {
    data.forEach(d => {
        d.DateTime = new Date(d.DateTime);
        d["Positive reviews"] = +d["Positive reviews"];
        d["Negative reviews"] = -Math.abs(+d["Negative reviews"]); // Ensure negative reviews are negative
    });

    createPlot(data);
});

function createPlot(data) {
    const margin = { top: 20, right: 30, bottom: 30, left: 40 },
          width = 1600 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    const svg = d3.select(".chart-container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.DateTime))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([-5000, 5000]) // Set the Y-axis domain to include -5000 to 5000
        .range([height, 0]);

    // Move the x-axis to the middle of the chart
    svg.append("g")
        .attr("transform", "translate(0," + y(0) + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));

    svg.append("g")
        .call(d3.axisLeft(y));

    const linePositive = d3.line()
        .defined(d => !isNaN(d["Positive reviews"])) // Filter out missing values
        .x(d => x(d.DateTime))
        .y(d => y(d["Positive reviews"]));

    const lineNegative = d3.line()
        .defined(d => !isNaN(d["Negative reviews"])) // Filter out missing values
        .x(d => x(d.DateTime))
        .y(d => y(d["Negative reviews"]));

    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", linePositive)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 2);

    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", lineNegative)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2);

    // Adding a zero line for clarity
    svg.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(0))
        .attr("y2", y(0))
        .attr("stroke", "black")
        .attr("stroke-width", 1);
}
