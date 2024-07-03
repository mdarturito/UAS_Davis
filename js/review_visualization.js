// Load CSV file
d3.csv("datasets/csvfile.csv", d => ({
    date: new Date(d.DateTime),
    positive: +d["Positive reviews"],
    negative: +d["Negative reviews"]
})).then(data => {
    // Create the plot
    const plot = Plot.plot({
        width: 1200,
        height: 600,
        x: {
            label: "Date",
            type: "time",
            domain: d3.extent(data, d => d.date),
            tickFormat: d3.timeFormat("%Y-%m")
        },
        y: {
            label: "Reviews",
            domain: [-5000, 5000]
        },
        marks: [
            Plot.ruleY([0]),
            Plot.line(data, {
                x: "date",
                y: "positive",
                stroke: "green",
                curve: "step"
            }),
            Plot.line(data, {
                x: "date",
                y: d => -d.negative,
                stroke: "red",
                curve: "step"
            })
        ]
    });

    // Append the plot to the chart container
    document.querySelector('.chart-container').appendChild(plot);
});
