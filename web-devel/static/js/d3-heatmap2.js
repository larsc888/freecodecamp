const DATA_URL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

d3.json(DATA_URL).then(json => {
    // Global VARIABLES
    const YEAR = "year";
    const MONTH = "month";
    const VARIANCE = "variance";
    const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const MONTH_MAP = {
        1: "January", 
        2: "February", 
        3: "March",
        4: "April",
        5: "May",
        6: "June",
        7: "July",
        8: "August",
        9: "September",
        10: "October",
        11: "November",
        12: "December"
    };
    
    const TEMPERATURE = [2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8];
    const COLOR = {
        2.8 : "rgb(69, 117, 180)",
        3.9 : "rgb(116, 173, 209)",
        5.0 : "rgb(171, 217, 233)",
        6.1 : "rgb(224, 243, 248)",
        7.2 : "rgb(255, 255, 191)",
        8.3 : "rgb(254, 224, 144)",
        9.5 : "rgb(253, 174, 97)",
        10.6 : "rgb(244, 109, 67)",
        11.7 : "rgb(215, 48, 39)",
        12.8 : null
    }
    
    // DATASET
    const BASE_TEMPERATURE = json["baseTemperature"];
    const DATASET = json["monthlyVariance"];

    // SVG Config
    const WIDTH  = 1200;
    const HEIGHT = 420;
    const PADDING = 75;
    const SMALLPAD = 30;

    // Create Tooltip
    let tooltip = d3.select('#chart')
                    .append('div')
                    .attr('id', 'tooltip')
                    .style('opacity', 0)    

    // Create SVG Container
    const svg = d3.select("#chart")
                  .append("svg")
                  .attr("width", WIDTH + (PADDING * 4))
                  .attr("height", HEIGHT + (PADDING * 2));

    // Create xScale and xAxis
    let xScale = d3.scaleBand()
                   .domain(DATASET.map(data => data[YEAR]))
                   .range([0, WIDTH])
                   .padding(0);

    let xAxis = d3.axisBottom()
                  .scale(xScale)
                  .tickValues(xScale.domain().filter((year) => year % 10 === 0))                  
                  .tickSize(10, 1);
                  
    svg.append('g')
       .call(xAxis)
       .attr('id', 'x-axis')
       .attr('transform', `translate(${PADDING * 2}, ${HEIGHT + SMALLPAD})`);


   // Create y-Scale and y-Axis
    let yScale = d3.scaleOrdinal()
                   .domain(MONTHS)
                   .range(MONTHS.map((_, i) => (HEIGHT / 12) * i));

    let yAxis = d3.axisLeft()
                  .scale(yScale)
                  .tickFormat((_, i) => MONTHS[i]);

    svg.append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', `translate(${PADDING * 2}, ${SMALLPAD})`);
        
        
    // Create Temperature Axis
    let tTickWidth = (WIDTH - (PADDING * 12)) / TEMPERATURE.length;
    let tRange = TEMPERATURE.map((_, idx) => (tTickWidth * idx));
    // tRange.push(tTickWidth * 3);

    let tScale = d3.scaleOrdinal()
                   .domain(TEMPERATURE)
                   .range(tRange);

    let tAxis = d3.axisBottom()
                  .scale(tScale);                         
             
    let tAxisGroup = d3.select('svg')
                       .append('g')
                       .attr('id', 'legend')
                       .attr('class', 'legend')
                       .attr('transform', `translate(${PADDING * 2}, ${HEIGHT + 120})`);

    let tScaleGroup = tAxisGroup.append("g")
                                .call(tAxis)                   
                                .attr('id', 'temperature-scale');

    let tColorGroup = tAxisGroup.append("g")
                                .attr('id', 'temperature-colors')
                                .attr('transform', `translate(0, -${SMALLPAD})`);
                             
    tColorGroup.selectAll("rect")
               .data(TEMPERATURE)
               .enter()
               .append("rect")
               .attr("id", (d, i) => `color-${i}`)
               .attr("width", tTickWidth)
               .attr("height", 30)
               .attr("x", (d, i) => tTickWidth * i)
               .attr("y", 0)
               .attr("fill", (d, i) => COLOR[d])
               .style("stroke", "black")
               .style("stroke-width", 1)

    // Remove Unwanted Rect  
    d3.select("#color-9")
      .attr("width", 0)
      .attr("height", 0);                             

    // Create Temperature Rect
    let newYearList = xScale.domain();
    let barWidth = WIDTH / newYearList.length;  
    let barHeight = (HEIGHT / 12);  
    let dataMatrix = svg.append("g")
                        .attr("id", "data-matrix")
                        .attr("transform", `translate(${PADDING * 2}, -6)`);

    dataMatrix.selectAll('rect')
              .data(DATASET)
              .enter()
              .append('rect')
              .attr('class', 'cell')
              .attr('data-month', (d, i) => d[MONTH] - 1)
              .attr('data-year', (d, i) => d[YEAR])
              .attr('data-temp', (d, i) => BASE_TEMPERATURE + d[VARIANCE])
              .attr("width", barWidth)
              .attr("height", barHeight)
              .attr("x", (d, i) => {
                  let idx = newYearList.findIndex(year => year === d[YEAR]);
                  return barWidth * idx;
              })
              .attr("y", (d, i) => {
                  let idx = d[MONTH];
                  return barHeight * idx;
              })
              .attr("fill", (d, i) => {
                  return determineColor(d);
              })
              // Tooltip Mouseover
              .on('mouseover', function (event, d) {
                  let x = Number(d3.select(this).attr("x"));
                  let y = Number(d3.select(this).attr("y"));
                  let month = MONTH_MAP[d[MONTH]];
                  let currentTemp = (BASE_TEMPERATURE + d[VARIANCE]).toFixed(2);
                  let variance = d[VARIANCE].toFixed(2)
                  
                  tooltip.transition()
                         .duration(100)
                         .style('opacity', 0.8);
                  
                  tooltip.attr("data-year", d[YEAR])
                         .style('left', x + PADDING + 'px')
                         .style('top', y - (PADDING + SMALLPAD) + 'px')
                         .html(
                            `<div>
                               <span id="year">${d[YEAR]} - </span>
                               <span id="month">${month}</span>
                             </div>
                             <div>
                               <span id="temperature">${currentTemp} °C</span>
                             </div>
                             <div id="variance">${d[VARIANCE]} °C</div>
                            ` 
                          );
              })
              // Tooltip Mouseout
              .on('mouseout', function (event, d) {
                  tooltip.transition()
                  .duration(100)
                  .style('opacity', 0);
              });      

    function determineColor(data) {
        let currentTemp = BASE_TEMPERATURE + data[VARIANCE];
        if (currentTemp < 3.9) return COLOR[2.8];
        if (currentTemp >= 3.9 && currentTemp < 5.0) return COLOR[3.9];
        if (currentTemp >= 5.0 && currentTemp < 6.1) return COLOR[5.0];
        if (currentTemp >= 6.1 && currentTemp < 7.2) return COLOR[6.1];
        if (currentTemp >= 7.2 && currentTemp < 8.3) return COLOR[7.2];
        if (currentTemp >= 8.3 && currentTemp < 9.5) return COLOR[8.3];
        if (currentTemp >= 9.5 && currentTemp < 10.6) return COLOR[9.5];
        if (currentTemp >= 10.6 && currentTemp < 11.7) return COLOR[10.6];
        if (currentTemp >= 11.7) return COLOR[11.7];
    }


}).catch(e => console.log(e));