var svgWidth = 960;
var svgHeight = 550;

var margin = {
  top: 40,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(csvData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(csvData, d => d[chosenXAxis]) * 0.8,
      d3.max(csvData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(csvData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(csvData, d => d[chosenYAxis]) * 0.8,
      d3.max(csvData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);
  //  console.log(yLinearScale);
  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating YAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}


// function used for updating circles group with a transition to

function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));

  return textGroup;
}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var labelX = "In Poverty (%):";
  }
  else if (chosenXAxis === "age") {
    var labelX = "Age (Median):";
  }
  else  {
    var labelX = "Household (Income):";
  }

  if (chosenYAxis === "obesity") {
    var labelY = "Obese (%):";
  }
  else if (chosenYAxis === "smokes") {
    var labelY = "Smokes (%):";
  }
  else  {
    var labelY = "Lacks Healthcare (%):";
  }


  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([100, -70])
    .html(function(d) {
      return (`${d.state}<br>${labelX} ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
  })
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// read the data
d3.csv("./assets/data/data.csv").then(function(csvData, err){
  if (err) 
    throw err;
  else {
    CreateChart (csvData);
    console.log(csvData);
  }
});

// create chart
function CreateChart (csvData) {

  // parse data

  csvData.forEach(function(data) {
      data.poverty  = +data.poverty;
      data.age      = +data.age;
      data.income   = +data.income;
      data.obesity  = +data.obesity;
      data.healthcare = +data.healthcare;
      data.smokes   = +data.smokes;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(csvData, chosenXAxis);

    // Create function y scale
    // var yLinearScale = d3.scaleLinear()
    //   .domain([0, d3.max(csvData, d => d.obesity)])
    //   .range([height, 0]);

    var yLinearScale  = yScale(csvData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(csvData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 10)
      .attr("fill", "red")
      .attr("opacity", ".5");

    // circle text
    var textGroup = chartGroup.selectAll(".stateText")
      .data(csvData)
      .enter()
      .append("text")
      .text(function (d) {
          return d.abbr;
      })
      .attr("x", function (d) {
          return xLinearScale(d[chosenXAxis]);
      })
      .attr("y", function (d) {
          return yLinearScale(d[chosenYAxis]);
      })
      .attr("font-size", "9px")
      .attr("text-anchor", "middle")
      .attr("class",".stateText");

    // Create group for  3 x- axis labels
    var labelsGroupX = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroupX.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty %");

    var ageLabel = labelsGroupX.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age Median");

    var incomeLabel = labelsGroupX.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Income Median");

    var labelsGroupY = chartGroup.append("g");

    // append y axis
    var obeseLabel = labelsGroupY.append("text")
    // .attr("transform", "rotate(-90)")
    .attr("transform", `translate(-80,${height / 2})rotate(270)`)
    .attr("value", "obesity")
    .classed("active", true)
    .text("Obese (%)")

  var smokeLabel = labelsGroupY.append("text")
    // .attr("transform", "rotate(-90)")
    .attr("transform", `translate(-60,${height / 2})rotate(270)`)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smoke (%)");

  var healthcareLabel = labelsGroupY.append("text")
    .attr("transform", `translate(-40,${height / 2})rotate(270)`)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks  Healthcare (%)");

    // chartGroup.append("text")
    //   .attr("transform", "rotate(-90)")
    //   .attr("y", 0 - margin.left)
    //   .attr("x", 0 - (height / 2))
    //   .attr("dy", "1em")
    //   .classed("axis-text", true)
    //   .text("Obeese %");

    // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
  labelsGroupX.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(csvData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

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
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }        
        else {
          incomeLabel
          .classed("active", true)
          .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
  });

  labelsGroupY.selectAll("text")
  .on("click", function() {

    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenYAxis with value
      chosenYAxis = value;

      // functions here found above csv import
      // updates y scale for new data
      yLinearScale = yScale(csvData, chosenYAxis);

      // updates y axis with transition
      yAxis = renderYAxes(yLinearScale, yAxis);

      // updates circles with new y values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
      
      //update text with new y values
      textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
      
      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenYAxis === "obesity") {
        obeseLabel
          .classed("active", true)
          .classed("inactive", false);
        smokeLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "smokes") {
        smokeLabel
          .classed("active", true)
          .classed("inactive", false);
        obeseLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);  
      }
      else {
        healthcareLabel
        .classed("active", true)
        .classed("inactive", false);  
        obeseLabel
          .classed("active", false)
          .classed("inactive", true);
        smokeLabel
          .classed("active", false)
          .classed("inactive", true);
      }
    }
  });
    
  // })
  // .catch(function(error) {
  //   console.log(error);
  // });
}

// });