const E_JSON = d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json");
const M_JSON = d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json");

Promise.all([M_JSON, E_JSON]).then(values => {
    // EDUCATION Global Variables
    const FIPS = "fips";
    const STATE = "state";
    const AREA_NAME = "area_name";
    const BACHELOR_OR_HIGHER = "bachelorsOrHigher";

    // Assisn Map Dataset and Educational Dataset
    M_DATASET = values[0];
    E_DATASET = values[1];

    // Configure Default Width, Height, and Padding
    const WIDTH = 880;
    const HEIGHT = 520;
    const PADDING = 40;

    // Create Tooltip
    const tooltip = d3.select('#chart')
                      .append('div')
                      .attr('id', 'tooltip')
                      .style('opacity', 0)            

    // Create SVG Container
    const svg = d3.select("#chart")
                  .append("svg")
                  .attr("width", WIDTH + (PADDING * 2))
                  .attr("height", HEIGHT + (PADDING * 2));

    // Get Sorted Education Data based on County                  
    let minEdu = getLowestNumber(E_DATASET);
    let maxEdu = getHighestNumber(E_DATASET);
    let numTicks = 8;

    // Create x-scale map and fill with data
    let xScale = d3.scaleLinear()
                   .domain([minEdu, maxEdu])
                   .range([(PADDING * 8), WIDTH - (PADDING * numTicks)]);
            
    var color = d3.scaleThreshold()
                  .domain(d3.range(minEdu, maxEdu, (maxEdu - minEdu) / numTicks))
                  .range(d3.schemeBlues[8]);

    let xAxis = d3.axisBottom()
                  .scale(xScale)
                  .tickSize(13)
                  .tickFormat(x => Math.round(x) + '%')
                  .tickValues(color.domain());
                                    
    // Create Legend
    let barWidth = 30;
    let barHeight = 12;
    let legend = d3.select('svg')
                    .append('g')
                    .attr('id', 'legend')
                    .attr('transform', `translate(${PADDING * 14}, ${PADDING / 2})`);

    legend.append('g')
        .selectAll('rect')
        .data(color.range())
        .enter()
        .append('rect')
        .attr('height', barHeight)
        .attr('width', barWidth)
        .attr('fill', d => d)
        .attr('x', (d, i) => i * barWidth);
    
    legend.append('g')
        .call(xAxis)
        .attr('transform', `translate(-${PADDING * 8}, ${PADDING * 0})`);

    // Remove unneeded line
    d3.select('.domain')
      .remove();
    
    // Create Projection (This maps the round map onto a flat surface) - geoAlbers is common for USA
    const projection = d3.geoMercator(d3.geoAlbers);

    // Create a path generator
    var path = d3.geoPath();

    // Render the counties
    let counties_geojson = topojson.feature(M_DATASET, M_DATASET.objects.counties).features;    // Convert TopoJSON to GeoJson which D3 can render 
    let counties = svg.append('g')
                       .attr('class', 'counties');

    counties.selectAll("path")
            .data(counties_geojson)
            .enter()
            .append("path")
            .attr("class", "county")
            .attr('d', path)
            .attr('data-fips', (d, i) => d.id)
            .attr('data-education', (d, i) => {
                let eData = E_DATASET.filter(eData => eData.fips === d.id)[0];
                return eData.bachelorsOrHigher
            })
            .attr('fill', (d, i) => {
                let eData = E_DATASET.filter(eData => eData.fips === d.id)[0];
                return getFill(eData.bachelorsOrHigher, color);
            })
            .on('mouseover', function (event, d) {
                let eData = E_DATASET.filter(eData => eData.fips === d.id)[0];
                let county = eData[AREA_NAME];
                let state = eData[STATE];
                let bachelorOrHigher = eData[BACHELOR_OR_HIGHER];

                tooltip.transition()
                       .duration(100)
                       .style('opacity', 0.8);
                
                tooltip.attr('data-education', eData.bachelorsOrHigher)
                       .style('left', (event.pageX - WIDTH) + (PADDING * 6) + 'px')                                              
                       .style('top', event.pageY - (PADDING * 4) + 'px')
                       .style('color', "black")
                       
                       .html(
                          `<div>
                             <span id="county">${county}, </span>
                             <span id="state">${state}: </span>
                             <span id="degree">${bachelorOrHigher}%</span>
                           </div>
                          ` 
                        );
            })              
            .on('mouseout', function (event, d) {
                tooltip.transition()
                .duration(100)
                .style('opacity', 0);
            });

    // Render States
    let states_geojson = topojson.feature(M_DATASET, M_DATASET.objects.states).features;    // Convert TopoJSON to GeoJson which D3 can render 
    let states = svg.append('g')
                    .attr('class', 'states');            

    states.selectAll("path")
            .data(states_geojson)
            .enter()
            .append("path")
            .attr("class", "state")
            .attr('d', path)
            .attr('fill', 'none')
            .attr('stroke', 'white');

}).catch(e => console.log(e));

function getLowestNumber(E_DATASET) {
    let lowestNum = undefined;
    
    for (let i = 0; i < E_DATASET.length; i++) {
        if (lowestNum === undefined) { 
            lowestNum = E_DATASET[i].bachelorsOrHigher; 
        }

        if (E_DATASET[i].bachelorsOrHigher < lowestNum) {
            lowestNum = E_DATASET[i].bachelorsOrHigher;
        }
    }

    return lowestNum;
}

function getHighestNumber(E_DATASET) {
    let highestNum = undefined;
    
    for (let i = 0; i < E_DATASET.length; i++) {
        if (highestNum === undefined) { 
            highestNum = E_DATASET[i].bachelorsOrHigher; 
        }

        if (E_DATASET[i].bachelorsOrHigher > highestNum) {
            highestNum = E_DATASET[i].bachelorsOrHigher;
        }
    }

    return highestNum;
}

function getFill(bachelorsOrHigher, color) {
    let domain = color.domain();
    let colors = color.range();
    
    for (let i = 0; i < domain.length; i++) {
        if (bachelorsOrHigher >= domain[i] && bachelorsOrHigher < domain[i+1]) {
            return colors[i];
        }
    };
}