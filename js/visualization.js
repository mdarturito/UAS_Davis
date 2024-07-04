// Parse the query parameter to get the CSV file name
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const csvFileName = urlParams.get('csv');

// Function to load CSV data and create visualizations
function loadAndCreateVisualization(csvFileName) {
    d3.csv("datasets/" + csvFileName).then(function(data) {
        data.forEach(d => {
            d.DateTime = new Date(d.DateTime);
            d["Positive reviews"] = +d["Positive reviews"];
            d["Negative reviews"] = -Math.abs(+d["Negative reviews"]); // Ensure negative reviews are negative
        });

        createLineChart(data); // Call your existing function to create line chart
    }).catch(function(error) {
        console.error("Error loading CSV file:", error);
    });
}

// Check if csvFileName is not null or undefined, then load and create visualization
if (csvFileName) {
    loadAndCreateVisualization(csvFileName);
}

function createLineChart(data) {
    const margin = { top: 20, right: 30, bottom: 30, left: 40 },
        width = 1200 - margin.left - margin.right, // Adjust width as needed
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

// Function to load ARIMA or SARIMA CSV data and create visualizations
function loadAndCreateArimaSarimaCharts(csvFileName) {
    if (!csvFileName) return;

    const arimaFileName = csvFileName.replace("_all.csv", "_arima.csv");
    const sarimaFileName = csvFileName.replace("_all.csv", "_sarima.csv");

    Promise.all([
        d3.csv("datasets/" + arimaFileName),
        d3.csv("datasets/" + sarimaFileName)
    ]).then(function(data) {
        const arimaData = data[0];
        const sarimaData = data[1];

        arimaData.forEach(d => {
            d.Date = new Date(d.Date);
            d.Predicted_Positive = +d.Predicted_Positive;
            d.Predicted_Negative = +d.Predicted_Negative;
        });

        sarimaData.forEach(d => {
            d.Date = new Date(d.Date);
            d.Predicted_Positive = +d.Predicted_Positive;
            d.Predicted_Negative = +d.Predicted_Negative;
        });

        createArimaChart(arimaData); // Call function to create ARIMA chart
        createSarimaChart(sarimaData); // Call function to create SARIMA chart
    }).catch(function(error) {
        console.error("Error loading ARIMA or SARIMA CSV file:", error);
    });
}

// Check if csvFileName is not null or undefined, then load and create ARIMA and SARIMA visualizations
if (csvFileName) {
    loadAndCreateArimaSarimaCharts(csvFileName);
}

function createArimaChart(data) {
    const margin = { top: 20, right: 30, bottom: 30, left: 40 },
        width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    const svg = d3.select(".arima-chart-container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.Date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.Predicted_Positive, d.Predicted_Negative))])
        .nice()
        .range([height, 0]);

    const linePositive = d3.line()
        .x(d => x(d.Date))
        .y(d => y(d.Predicted_Positive));

    const lineNegative = d3.line()
        .x(d => x(d.Date))
        .y(d => y(d.Predicted_Negative));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", linePositive);

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("d", lineNegative);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));
}

function createSarimaChart(data) {
    const margin = { top: 20, right: 30, bottom: 30, left: 40 },
        width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    const svg = d3.select(".sarima-chart-container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.Date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.Predicted_Positive, d.Predicted_Negative))])
        .nice()
        .range([height, 0]);

    const linePositive = d3.line()
        .x(d => x(d.Date))
        .y(d => y(d.Predicted_Positive));

    const lineNegative = d3.line()
        .x(d => x(d.Date))
        .y(d => y(d.Predicted_Negative));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "darkorange")
        .attr("stroke-width", 2)
        .attr("d", linePositive);

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 2)
        .attr("d", lineNegative);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));
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

// Adding gradient for a better look
const defs = pieSvg.append("defs");

const gradient = defs.append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%");

gradient.append("stop")
    .attr("offset", "0%")
    .attr("style", "stop-color:#1f77b4;stop-opacity:1");

gradient.append("stop")
    .attr("offset", "100%")
    .attr("style", "stop-color:#d62728;stop-opacity:1");

pieG.append("path")
    .attr("d", pieArc)
    .style("fill", (d, i) => pieColor(d.data.label))
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
    .attr("class", "pie-label") // Added class for styling
    .attr("transform", d => "translate(" + pieLabelArc.centroid(d) + ")")
    .attr("dy", ".35em")
    .text(d => `${d.data.label}: ${(d.data.count / 8158827 * 100).toFixed(2)}%`) // Display percentage
    .style("text-anchor", "middle")
    .style("fill", "#fff")
    .style("font-size", "12px");

const pieLegend = pieSvg.selectAll(".legend")
    .data(pieData)
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

