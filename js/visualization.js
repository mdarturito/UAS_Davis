// Your existing code for line chart
d3.csv("datasets/cs_all.csv").then(function(data) {
    data.forEach(d => {
        d.DateTime = new Date(d.DateTime);
        d["Positive reviews"] = +d["Positive reviews"];
        d["Negative reviews"] = -Math.abs(+d["Negative reviews"]); // Ensure negative reviews are negative
    });

    createLineChart(data);
});

function createLineChart(data) {
    const margin = { top: 20, right: 30, bottom: 30, left: 40 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

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
        .attr("class", "line positive-line") // Add a class for positive reviews
        .attr("d", linePositive)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 2);

    svg.append("path")
        .data([data])
        .attr("class", "line negative-line") // Add a class for negative reviews
        .attr("d", lineNegative)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2);

    svg.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(0))
        .attr("y2", y(0))
        .attr("stroke", "black")
        .attr("stroke-width", 1);
}

// Your existing code for pie chart
const pieData = [
    { label: "Positive Reviews", count: 7083073 },
    { label: "Negative Reviews", count: 1045754 }
];

const pieWidth = 400;
const pieHeight = 400;
const pieRadius = Math.min(pieWidth, pieHeight) / 2;

const pieColor = d3.scaleOrdinal()
    .domain(pieData.map(d => d.label))
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

const pieSvg = d3.select(".pie-chart")
    .append("svg")
    .attr("width", pieWidth)
    .attr("height", pieHeight)
    .append("g")
    .attr("transform", "translate(" + pieWidth / 2 + "," + pieHeight / 2 + ")");

const pieG = pieSvg.selectAll(".arc")
    .data(pie(pieData))
    .enter().append("g")
    .attr("class", "arc");

pieG.append("path")
    .attr("d", pieArc)
    .style("fill", d => pieColor(d.data.label))
    .transition()
    .ease(d3.easeLinear)
    .duration(1000)
    .attrTween("d", function(d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function(t) {
            return pieArc(interpolate(t));
        };
    });

pieG.append("text")
    .attr("class", "pie-label") // Added class for styling
    .attr("transform", d => "translate(" + pieLabelArc.centroid(d) + ")")
    .attr("dy", ".35em")
    .text(d => `${d.data.label}: ${(d.data.count / 8158827 * 100).toFixed(2)}%`) // Display percentage
    .style("text-anchor", "middle");

const pieLegend = pieSvg.selectAll(".legend")
    .data(pieData)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => "translate(" + (pieWidth / 2 + 50) + "," + (i * 30 - pieHeight / 2) + ")");

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
