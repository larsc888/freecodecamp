const DATA_URL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

d3.json(DATA_URL).then(json => {
  // SPECIFIERS
  const YEAR_SPECIFIER = "%Y";
  const TIME_SPECIFIER = "%M:%S";
  
  // COLORS
  const ORANGE = "rgb(255, 127, 14)";
  const BLUE = "rgb(0, 0, 200)";
  
  // Object Names
  const TIME = "Time";
  const PLACE = "Place";
  const SECONDS = "Secods";
  const NAME = "Name";
  const YEAR = "Year";
  const NATIONALITY = "Nationality";
  const DOPING = "Doping";
  const URL = "URL";
    
  // Global Config Names
  const DATASET = json;
  const WIDTH  = 800;
  const HEIGHT = 570;
  const PADDING = 60;
  
  // Create Tooltip
  let tooltip = d3.select('#chart')
                  .append('div')
                  .attr('id', 'tooltip')
                  .style('opacity', 0)
  
  // Create SVG Container
  const svg = d3.select("#chart")
                .append("svg")
                .attr("width", WIDTH + (PADDING * 2))
                .attr("height", HEIGHT + PADDING);
  
  
  // Get Unique Years to create xScale 
  let yearList = [];
  DATASET.forEach((data, idx) => { if (!yearList.includes(data[YEAR])) yearList.push(data[YEAR]) });
  yearList = yearList.sort((a, b) => a < b ? -1 : 1).map(year => new Date(year, 0));

  // Set range that is slightly bigger than data
  let xMin = new Date(d3.min(yearList).getFullYear() - 2, 0)
  let xMax = new Date(d3.max(yearList).getFullYear() + 1, 0);

  let xScale = d3.scaleTime()
                 .domain([d3.min(yearList), d3.max(yearList)])
                 .range([0, WIDTH]);
  
  // Get TimeList to create Y-Scale
  let timeList = DATASET.map(d => d3.timeParse(TIME_SPECIFIER)(d[TIME]));
  
  // Set range that is slightly larger than data
  let yMin = new Date(d3.min(timeList).getTime() - (7000));
  let yMax = new Date(d3.max(timeList).getTime() + (3000));
    
  let yScale = d3.scaleTime()
                 .domain([yMin, yMax])
                 .range([0, HEIGHT]);

  
  // Create Bottom Axis
  let xAxis = d3.axisBottom().scale(xScale);
  svg.append('g')
    .call(xAxis)
    .attr('id', 'x-axis')
    .attr('transform', `translate(${PADDING}, ${HEIGHT})`)
  
  // Create Left Axis
  let yAxis = d3.axisLeft().scale(yScale)
                .tickFormat(d => d3.timeFormat(TIME_SPECIFIER)(d));  

  svg.append('g')
    .call(yAxis)
    .attr('id', 'y-axis')
    .attr('transform', `translate(${PADDING}, 0)`);
  
  // Create Legend
  let RectSize = 12;
  let legend = d3.select("svg")
                 .append('g') 
                 .attr("id", "legend")
                 .attr('transform', "translate(875, 350)");
  
  let legendLabel1 = legend.append('g')
                           .attr("class", "legend label");
  
  legendLabel1.append("text")
              .style("font-size", "0.8rem")
              .text("No doping allegations")
              .attr("text-anchor", "end");
  
  legendLabel1.append("rect")
              .attr("width", RectSize)
              .attr("height", RectSize)
              .attr("x", 0)
              .attr("y", 0)
              .attr('fill', ORANGE)
              .attr('transform', 'translate(6, -10)');
  
  let legendLabel2 = legend.append('g')
                           .attr("class", "legend label")
                           .attr('transform', "translate(0, 25)");
  
  legendLabel2.append("text")
              .attr("text-anchor", "end")
              .style("font-size", "0.8rem")
              .text("Rider with doping allegations");
  
  legendLabel2.append("rect")
              .attr("width", RectSize)
              .attr("height", RectSize)
              .attr("x", 0)
              .attr("y", 0)  
              .attr('fill', BLUE)
              .attr('transform', 'translate(6, -10)');
    
  // Create Scattermap Axis
  let scaledTimeList = timeList.map(data => yScale(data));  
  svg.selectAll('circle')     
     .data(DATASET)
     .enter()
     .append('circle')
     .attr('class', 'dot')
     .attr('cx', d => xScale(d3.timeParse(YEAR_SPECIFIER)(d[YEAR])))
     .attr('cy', d => yScale(d3.timeParse(TIME_SPECIFIER)(d[TIME])))
     .attr('r', 5)
     .attr('transform', `translate(${PADDING}, 0)`)
     .attr('fill', d => (d[DOPING] === "") ? ORANGE : BLUE)
     .attr('index', (d, i) => i)
     .attr('data-xvalue', (d, i) => d[YEAR])
     .attr('data-yvalue', (d, i) => timeList[i])
     .on('mouseover', function (event, d) {
       let i = d3.select(this).attr("index");
       let cx = Number(d3.select(this).attr("cx"));
       let cy = Number(d3.select(this).attr("cy"));
    
       tooltip.transition()
          .duration(200)
          .style('opacity', 0.9)
    
       tooltip.attr("data-year", d[YEAR])
              .style('left', cx + 100 + 'px')
              .style('top', cy - 75 + 'px') 
       .html(
         `<div>
            <span id="name">${d[NAME]}: </span>
            <span id="nationality">${d[NATIONALITY]}</span>
          </div>
          <div>
            <span id="year">Year: ${d[YEAR]}</span>
            <span id="time">Time: ${d[TIME]}</span>
          </div>
          <div id="doping">${d[DOPING]}</div>
         ` 
       );
    })
    .on("mouseout", function() {
      tooltip.transition()
             .duration(200)
             .style('opacity', 0);      
  });
}).catch(e => console.log(e));