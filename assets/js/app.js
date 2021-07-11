// Initial Params
var chosenXAxis = "poverty"
var chosenYAxis = "healthcare"

var csvData = 'assets/data/data.csv';

var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 120,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Function used for updating x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(stateData, d => d[chosenXAxis]) - (d3.min(stateData, d => d[chosenXAxis]) * 0.05),
        d3.max(stateData, d => d[chosenXAxis] * 1.02)
        ])
        .range([0, width]);

    return xLinearScale;

}

// Function used for updating y-scale var upon click on axis label
function yScale(stateData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(stateData, d => d[chosenYAxis]) - (d3.min(stateData, d => d[chosenYAxis]) * 0.2)
            , d3.max(stateData, d => d[chosenYAxis])])
        .range([height, 0]);

    return yLinearScale;

}

// Function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// Function used for updating xAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// Function used for updating circles group with a transition to
// new circles
function renderCircles(group, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    group.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]))

    return group;
}
// new text
function renderText(group, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    group.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]) + 5)

    return group;
}

// Function used for updating circles group with new tooltip
function updateToolTip(group, circle, text, chosenXAxis, chosenYAxis) {
    var xLabel;
    var yLabel;

    if (chosenXAxis === "poverty") {
        xLabel = "Poverty (%)";
    }
    else if (chosenXAxis === "age") {
        xLabel = "Age (Median)";
    }
    else {
        xLabel = "Income (Median)";
    }

    if (chosenYAxis === "healthcare") {
        yLabel = "Healthcare (%)";
    }
    else if (chosenYAxis === "smokes") {
        yLabel = "Smokes (%)";
    }
    else {
        yLabel = "Obesity (%)";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function (d) {
            return (`State: ${d.state}<br>${xLabel}: ${d[chosenXAxis]}<br>${yLabel}: ${d[chosenYAxis]}`)
        });

        circle.call(toolTip);

    circle.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    text.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circle;
}

// Import Data
d3.csv(csvData).then(function (stateData, err) {
    if (err) throw err;
    // Step 1: Parse Data/Cast as numbers
    // ==============================
    stateData.forEach(function (data) {
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
    });

    // // SANITY CHECKS
    // console.log(d3.max(stateData, d => d.poverty));
    // console.log(chosenXAxis)
    // console.log(chosenYAxis)

    // Step 2: Create Scale Functions
    // ==============================
    var xLinearScale = xScale(stateData, chosenXAxis);
    var yLinearScale = yScale(stateData, chosenYAxis);

    // // SANITY CHECKS
    // console.log(xLinearScale)
    // console.log(yLinearScale)

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append axes to the chart
    // ==============================
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // Step 5: Create circles and text
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", "14")
        .attr("class", "stateCircle")
        .attr("opacity", ".8");

    // Create circle label 
    var circlesText = chartGroup.selectAll(null)
        .data(stateData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]) + 5)
        .attr("class", "stateText")
        .text(function (d) { return d.abbr; });

    // Step 6: Create axes labels
    // ==============================
    // Y labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")

    var healthCareLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "yAxisText")
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "yAxisText")
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");

    var obeseLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "yAxisText")
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obese (%)");

    // X labels
    var xLabelsGroup = chartGroup.append("g")

    var povertyLabel = xLabelsGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
        .attr("class", "xAxisText")
        .attr("value", "poverty")
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 40})`)
        .attr("class", "xAxisText")
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 60})`)
        .attr("class", "xAxisText")
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household Income (Median)");

    // Step 7: Initialize tool tip
    // ==============================
    var circlesGroup = updateToolTip(chartGroup, circlesGroup, circlesText, chosenXAxis, chosenYAxis);

    // // SANITY CHECK
    // console.log(chosenYAxis);
    // console.log(chosenXAxis);

    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    // Y axis listener
    yLabelsGroup.selectAll(".yAxisText")
        .on("click", function () {
            // // SANITY CHECK
            // console.log(chosenYAxis);
            // console.log(chosenXAxis);

            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenXAxis with value
                chosenYAxis = value;

                // // SANITY CHECK               
                // console.log(chosenYAxis);
                // console.log(chosenXAxis);

                // functions here found above csv import
                // updates x scale for new data
                yLinearScale = yScale(stateData, chosenYAxis);

                // updates x axis with transition
                yAxis = renderYAxis(yLinearScale, yAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                circlesText = renderText(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chartGroup, circlesGroup, circlesText, chosenXAxis, chosenYAxis);

                // changes classes to change bold text
                if (chosenYAxis === "healthcare") {
                    healthCareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes") {
                    healthCareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    healthCareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
    // X axis listener
    xLabelsGroup.selectAll(".xAxisText")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // // SANITY CHECK               
                // console.log(chosenYAxis);
                // console.log(chosenXAxis);

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(stateData, chosenXAxis);

                // updates x axis with transition 
                xAxis = renderXAxis(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                circlesText = renderText(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chartGroup, circlesGroup, circlesText, chosenXAxis, chosenYAxis);

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
}).catch(function (error) {
    console.log(error);
});
